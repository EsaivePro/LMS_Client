import React, { useMemo, useRef, useState } from "react";
import { Box, Typography, TextField, IconButton, InputAdornment, Paper, Chip, Tooltip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import DataTableV1 from "../../components/common/table/DataTableV1";

/**
 * Selected-items table for record-picker fields.
 * Supports optional row reordering controlled by the `draggable` prop
 * (sourced from `table.draggable` in the JSON config).
 *
 * Props:
 *   columns   — { name, label, minWidth?, type? }[]  (actions type excluded by FormRender)
 *   rows      — row objects with __idx (original index) and __rowKey (React key)
 *   onReorder — (newRows) => void
 *   onRemove  — (originalIdx) => void
 *   editing   — bool
 *   draggable — bool (default true) — enables order chip and move actions; when false
 *               all data columns render as plain columns (incl. order_no)
 *   useMaster — bool — when true, render selected rows with DataTableV1
 */
export default function PickerSelectedTable({ columns = [], rows = [], onReorder, onRemove, editing, draggable = true, useMaster = false }) {
    const [search, setSearch] = useState("");
    const [dragOverIdx, setDragOverIdx] = useState(null);
    const dragSrcIdx = useRef(null);

    const isSearching = search.trim() !== "";

    // When draggable: order_no is shown as a chip badge — exclude it from data columns.
    // When not draggable: show every column as-is.
    const dataCols = draggable
        ? columns.filter((c) => c.name !== "order_no")
        : columns;

    const hasOrder = draggable && rows.some((r) => r.order_no !== undefined);
    const canReorder = draggable && !isSearching;

    const getRowIdentity = (row, fallbackIdx) => row.__rowKey ?? row.id ?? row.__idx ?? fallbackIdx;
    const getRowIndex = (targetRow) => rows.findIndex((item, idx) => getRowIdentity(item, idx) === getRowIdentity(targetRow, idx));

    const commitReorder = (nextRows) => {
        const next = Array.from(rows);
        onReorder(
            (nextRows || next).map((r, i) => ({ ...r, ...(r.order_no !== undefined ? { order_no: i + 1 } : {}) }))
        );
    };

    const moveRow = (row, direction) => {
        const fromIndex = getRowIndex(row);
        const toIndex = fromIndex + direction;

        if (fromIndex < 0 || toIndex < 0 || toIndex >= rows.length) return;

        const next = Array.from(rows);
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        commitReorder(next);
    };

    const onDragStart = (idx) => { dragSrcIdx.current = idx; };
    const onDragOver = (event, idx) => { event.preventDefault(); setDragOverIdx(idx); };
    const onDrop = (event, dropIdx) => {
        event.preventDefault();
        const src = dragSrcIdx.current;
        if (src === null || src === dropIdx) {
            setDragOverIdx(null);
            return;
        }

        const next = Array.from(rows);
        const [moved] = next.splice(src, 1);
        next.splice(dropIdx, 0, moved);
        commitReorder(next);
        dragSrcIdx.current = null;
        setDragOverIdx(null);
    };
    const onDragEnd = () => {
        dragSrcIdx.current = null;
        setDragOverIdx(null);
    };

    const colSx = (column) => ({
        flex: column.name === "title" || column.name === "question_master_title" ? "1 1 0" : `0 0 ${column.minWidth || 100}px`,
        minWidth: 0,
        pr: 1,
        overflow: "hidden",
    });

    const renderCellValue = (column, row) => {
        const value = row[column.name] ?? "—";
        if (column.name === "question_id" || column.name === "id") {
            return (
                <Typography variant="body2" color="text.secondary" noWrap>
                    #{value}
                </Typography>
            );
        }

        return (
            <Typography
                variant="body2"
                fontWeight={column.name === "title" || column.name === "question_master_title" ? 500 : 400}
                color={column.name === "title" || column.name === "question_master_title" ? "text.primary" : "text.secondary"}
                noWrap
                title={String(value)}
            >
                {value}
            </Typography>
        );
    };

    const renderLegacyRow = (row, idx, isDraggable) => (
        <Box
            key={row.__rowKey ?? row.id}
            draggable={isDraggable && editing}
            onDragStart={isDraggable ? () => onDragStart(idx) : undefined}
            onDragOver={isDraggable ? (event) => onDragOver(event, idx) : undefined}
            onDrop={isDraggable ? (event) => onDrop(event, idx) : undefined}
            onDragEnd={isDraggable ? onDragEnd : undefined}
            sx={{
                display: "flex",
                alignItems: "center",
                minWidth: 0,
                px: 1,
                py: 0.75,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { borderBottom: "none" },
                bgcolor: dragOverIdx === idx && isDraggable ? "action.hover" : "background.paper",
                transition: "background-color 0.15s",
                cursor: isDraggable && editing ? "grab" : "default",
                "&:active": isDraggable && editing ? { cursor: "grabbing" } : {},
            }}
        >
            {draggable && (
                <Box sx={{ width: 28, flexShrink: 0, display: "flex", alignItems: "center", color: editing && canReorder ? "text.disabled" : "transparent" }}>
                    <DragIndicatorIcon fontSize="small" />
                </Box>
            )}

            {hasOrder && (
                <Box sx={{ width: 34, flexShrink: 0, display: "flex", alignItems: "center", pr: 0.5 }}>
                    <Chip label={row.order_no ?? "—"} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, minWidth: 26 }} />
                </Box>
            )}

            {dataCols.map((column) => (
                <Box key={column.name} sx={colSx(column)}>
                    {renderCellValue(column, row)}
                </Box>
            ))}

            <Box sx={{ width: 36, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <IconButton
                    size="small"
                    onClick={() => onRemove(row.__idx)}
                    disabled={!editing}
                    sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                >
                    <DeleteOutlineIcon fontSize="small" />
                </IconButton>
            </Box>
        </Box>
    );

    const tableRows = useMemo(
        () => rows.map((row, idx) => (row.id == null ? { ...row, id: getRowIdentity(row, idx) } : row)),
        [rows]
    );

    const tableColumns = useMemo(() => {
        const mappedColumns = [];

        if (hasOrder) {
            mappedColumns.push({
                field: "order_no",
                headerName: "#",
                minWidth: 72,
                sortable: false,
                filterable: false,
                renderCell: ({ value }) => (
                    <Chip label={value ?? "—"} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, minWidth: 26 }} />
                ),
            });
        }

        dataCols.forEach((column) => {
            mappedColumns.push({
                field: column.name,
                headerName: column.label,
                minWidth: column.minWidth || (column.name === "title" || column.name === "question_master_title" ? 220 : 100),
                sortable: false,
                filterable: false,
                renderCell: ({ value }) => {
                    const displayValue = value ?? "—";
                    if (column.name === "question_id" || column.name === "id") {
                        return (
                            <Typography variant="body2" color="text.secondary" noWrap>
                                #{displayValue}
                            </Typography>
                        );
                    }

                    return (
                        <Typography
                            variant="body2"
                            fontWeight={column.name === "title" || column.name === "question_master_title" ? 500 : 400}
                            color={column.name === "title" || column.name === "question_master_title" ? "text.primary" : "text.secondary"}
                            noWrap
                            title={String(displayValue)}
                        >
                            {displayValue}
                        </Typography>
                    );
                },
            });
        });

        mappedColumns.push({
            field: "__actions",
            headerName: "Actions",
            minWidth: draggable ? 132 : 72,
            maxWidth: draggable ? 132 : 72,
            sortable: false,
            filterable: false,
            pinned: "right",
            renderCell: ({ row }) => {
                const currentIndex = getRowIndex(row);
                const disableMoveUp = !editing || !canReorder || currentIndex <= 0;
                const disableMoveDown = !editing || !canReorder || currentIndex === -1 || currentIndex >= rows.length - 1;

                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                        {draggable && (
                            <>
                                <Tooltip title={canReorder ? "Move up" : "Clear search to reorder"}>
                                    <span>
                                        <IconButton size="small" onClick={() => moveRow(row, -1)} disabled={disableMoveUp}>
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={canReorder ? "Move down" : "Clear search to reorder"}>
                                    <span>
                                        <IconButton size="small" onClick={() => moveRow(row, 1)} disabled={disableMoveDown}>
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title="Remove">
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => onRemove(row.__idx)}
                                    disabled={!editing}
                                    sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                );
            },
        });

        return mappedColumns;
    }, [canReorder, dataCols, draggable, editing, hasOrder, onRemove, rows]);

    if (useMaster) {
        return (
            <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
                <DataTableV1
                    rows={tableRows}
                    columns={tableColumns}
                    serverSide={false}
                    checkboxSelection={false}
                    defaultPageSize={5}
                    pageSizeOptions={[5, 10, 20]}
                    externalSearch={search}
                    onExternalSearchChange={setSearch}
                    searchPlaceholder="Search in added questions..."
                    searchMinLength={1}
                    emptySubtitle={isSearching ? "No results match your search." : "No questions added yet."}
                    tableKey={`picker-selected-${dataCols.map((column) => column.name).join("-") || "default"}`}
                    maxHeight={320}
                    minHeight={220}
                    pickerSelected
                />

                {rows.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        {rows.length} question{rows.length !== 1 ? "s" : ""}
                        {isSearching
                            ? " · Clear search to reorder"
                            : draggable
                                ? " · Use the arrow actions to reorder"
                                : ""}
                    </Typography>
                )}
            </Box>
        );
    }

    const filteredRows = isSearching
        ? rows.filter((row) =>
            columns.some((column) =>
                String(row[column.name] ?? "").toLowerCase().includes(search.toLowerCase())
            )
        )
        : rows;

    return (
        <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
            <TextField
                fullWidth
                size="small"
                placeholder="Search in added questions..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon fontSize="small" />
                        </InputAdornment>
                    ),
                }}
                sx={{ mb: 1 }}
            />

            <Paper variant="outlined" sx={{ width: "100%", overflow: "hidden", borderRadius: 1 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        minWidth: 0,
                        bgcolor: "grey.50",
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        px: 1,
                        py: 0.75,
                    }}
                >
                    {draggable && <Box sx={{ width: 28, flexShrink: 0 }} />}
                    {hasOrder && (
                        <Box sx={{ width: 34, flexShrink: 0, pr: 0.5 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>#</Typography>
                        </Box>
                    )}
                    {dataCols.map((column) => (
                        <Box key={column.name} sx={colSx(column)}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }} noWrap>
                                {column.label}
                            </Typography>
                        </Box>
                    ))}
                    <Box sx={{ width: 36, flexShrink: 0 }} />
                </Box>

                {filteredRows.length === 0 && (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            {isSearching ? "No results match your search." : "No questions added yet."}
                        </Typography>
                    </Box>
                )}

                {filteredRows.length > 0 && (
                    isSearching
                        ? filteredRows.map((row) => renderLegacyRow(row, null, false))
                        : rows.map((row, idx) => renderLegacyRow(row, idx, canReorder))
                )}
            </Paper>

            {rows.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    {rows.length} question{rows.length !== 1 ? "s" : ""}
                    {isSearching
                        ? ` · ${filteredRows.length} shown · Clear search to reorder`
                        : draggable
                            ? " · Drag rows to reorder"
                            : ""}
                </Typography>
            )}
        </Box>
    );
}
