import React, { useState, useRef } from "react";
import { Box, Typography, TextField, IconButton, InputAdornment, Paper, Chip } from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";

/**
 * Selected-items table for record-picker fields.
 * Supports optional drag-to-reorder controlled by the `draggable` prop
 * (sourced from `table.draggable` in the JSON config).
 *
 * Props:
 *   columns   — { name, label, minWidth?, type? }[]  (actions type excluded by FormRender)
 *   rows      — row objects with __idx (original index) and __rowKey (React key)
 *   onReorder — (newRows) => void
 *   onRemove  — (originalIdx) => void
 *   editing   — bool
 *   draggable — bool (default true) — enables drag handles and order chip; when false
 *               all data columns render as plain columns (incl. order_no)
 */
export default function PickerSelectedTable({ columns = [], rows = [], onReorder, onRemove, editing, draggable = true }) {
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
    const canDrag = draggable && !isSearching;

    const filteredRows = isSearching
        ? rows.filter((r) =>
            columns.some((c) =>
                String(r[c.name] ?? "").toLowerCase().includes(search.toLowerCase())
            )
        )
        : rows;

    /* ── Native DnD handlers ── */
    const onDragStart = (idx) => { dragSrcIdx.current = idx; };
    const onDragOver = (e, idx) => { e.preventDefault(); setDragOverIdx(idx); };
    const onDrop = (e, dropIdx) => {
        e.preventDefault();
        const src = dragSrcIdx.current;
        if (src === null || src === dropIdx) { setDragOverIdx(null); return; }
        const next = Array.from(rows);
        const [moved] = next.splice(src, 1);
        next.splice(dropIdx, 0, moved);
        onReorder(
            next.map((r, i) => ({ ...r, ...(r.order_no !== undefined ? { order_no: i + 1 } : {}) }))
        );
        dragSrcIdx.current = null;
        setDragOverIdx(null);
    };
    const onDragEnd = () => { dragSrcIdx.current = null; setDragOverIdx(null); };

    /* ── Column flex helper ── */
    const colSx = (c) => ({
        flex: c.name === "title" || c.name === "question_master_title" ? "1 1 0" : `0 0 ${c.minWidth || 100}px`,
        minWidth: 0,
        pr: 1,
        overflow: "hidden",
    });

    const renderCellValue = (c, row) => {
        const val = row[c.name] ?? "—";
        if (c.name === "question_id" || c.name === "id") {
            return (
                <Typography variant="body2" color="text.secondary" noWrap>
                    #{val}
                </Typography>
            );
        }
        return (
            <Typography
                variant="body2"
                fontWeight={c.name === "title" || c.name === "question_master_title" ? 500 : 400}
                color={c.name === "title" || c.name === "question_master_title" ? "text.primary" : "text.secondary"}
                noWrap
                title={String(val)}
            >
                {val}
            </Typography>
        );
    };

    const renderRow = (row, idx, isDraggable) => (
        <Box
            key={row.__rowKey ?? row.id}
            draggable={isDraggable && editing}
            onDragStart={isDraggable ? () => onDragStart(idx) : undefined}
            onDragOver={isDraggable ? (e) => onDragOver(e, idx) : undefined}
            onDrop={isDraggable ? (e) => onDrop(e, idx) : undefined}
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
            {/* drag handle — only rendered when draggable mode is on */}
            {draggable && (
                <Box sx={{ width: 28, flexShrink: 0, display: "flex", alignItems: "center", color: editing && canDrag ? "text.disabled" : "transparent" }}>
                    <DragIndicatorIcon fontSize="small" />
                </Box>
            )}

            {/* order badge — only when draggable and rows have order_no */}
            {hasOrder && (
                <Box sx={{ width: 34, flexShrink: 0, display: "flex", alignItems: "center", pr: 0.5 }}>
                    <Chip label={row.order_no ?? "—"} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, minWidth: 26 }} />
                </Box>
            )}

            {/* data columns */}
            {dataCols.map((c) => (
                <Box key={c.name} sx={colSx(c)}>
                    {renderCellValue(c, row)}
                </Box>
            ))}

            {/* delete */}
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

    return (
        <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
            {/* Search */}
            <TextField
                fullWidth
                size="small"
                placeholder="Search in added questions…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
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
                {/* Header */}
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
                    {/* drag handle spacer */}
                    {draggable && <Box sx={{ width: 28, flexShrink: 0 }} />}
                    {/* order badge spacer */}
                    {hasOrder && (
                        <Box sx={{ width: 34, flexShrink: 0, pr: 0.5 }}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>#</Typography>
                        </Box>
                    )}
                    {dataCols.map((c) => (
                        <Box key={c.name} sx={colSx(c)}>
                            <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: 0.5 }} noWrap>
                                {c.label}
                            </Typography>
                        </Box>
                    ))}
                    <Box sx={{ width: 36, flexShrink: 0 }} />
                </Box>

                {/* Empty state */}
                {filteredRows.length === 0 && (
                    <Box sx={{ py: 4, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            {isSearching ? "No results match your search." : "No questions added yet."}
                        </Typography>
                    </Box>
                )}

                {/* Rows */}
                {filteredRows.length > 0 && (
                    isSearching
                        ? filteredRows.map((row) => renderRow(row, null, false))
                        : rows.map((row, idx) => renderRow(row, idx, canDrag))
                )}
            </Paper>

            {/* Footer hint */}
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
