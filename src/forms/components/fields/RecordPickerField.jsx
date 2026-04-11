import React, { useState } from "react";
import { Box, Button, Drawer, IconButton, Typography } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import MasterForm from "../MasterForm";
import PickerMasterPage from "../PickerMasterPage";
import PickerSelectedTable from "../PickerSelectedTable";

const getRecordPickerIdentityKey = (field, tableColumns = []) => {
    return field.table?.identityKey || tableColumns[0]?.name || "id";
};

const mergeRecordPickerRows = (field, tableColumns = [], existingRows = [], incomingRows = []) => {
    const identityKey = getRecordPickerIdentityKey(field, tableColumns);
    const merged = [];
    const seen = new Set();

    [...(existingRows || []), ...(incomingRows || [])].forEach((row, index) => {
        const key = row?.[identityKey] ?? row?.id ?? index;
        if (seen.has(key)) return;
        seen.add(key);
        merged.push(row);
    });

    return merged.map((row, index) => ({
        ...row,
        ...(row?.order_no !== undefined ? { order_no: index + 1 } : {}),
    }));
};

const buildRecordPickerConfig = (field) => {
    const pickerConfig = field.pickerConfig || {};
    const pickerColumns = Array.isArray(pickerConfig.columns) ? pickerConfig.columns : null;
    const legacyTableColumns = (field.table?.columns || []).filter((column) => column.type !== "actions");

    if (!pickerColumns?.length) {
        return {
            pickerConfig,
            mapRow: pickerConfig.mapRow || {},
            displayColumns: pickerConfig.displayColumns || [],
            tableColumns: legacyTableColumns,
            normalizedColumns: [],
        };
    }

    const normalizedColumns = pickerColumns.map((column) => {
        const hasSource = Object.prototype.hasOwnProperty.call(column, "source");
        const source = hasSource ? column.source : column.name ?? null;
        const target = Object.prototype.hasOwnProperty.call(column, "target")
            ? column.target
            : column.selected === false
                ? null
                : source;

        return {
            ...column,
            source,
            target,
            includeInPicker: column.picker !== false && source !== null && source !== undefined,
            includeInSelected: column.selected !== false && target !== null && target !== undefined,
        };
    });

    const mapRow = normalizedColumns.reduce((accumulator, column) => {
        if (!column.includeInSelected || column.map === false) return accumulator;
        accumulator[column.target] = column.source ?? null;
        return accumulator;
    }, {});

    const displayColumns = normalizedColumns
        .filter((column) => column.includeInPicker)
        .map((column) => ({
            name: column.source,
            label: column.pickerLabel || column.label,
            minWidth: column.pickerMinWidth ?? column.displayMinWidth ?? column.minWidth,
            ...(column.filterable ? { filterable: true, filterOptions: column.filterOptions } : {}),
        }));

    const tableColumns = normalizedColumns
        .filter((column) => column.includeInSelected)
        .map((column) => ({
            name: column.target,
            label: column.tableLabel || column.label,
            type: column.type || "text",
            minWidth: column.tableMinWidth ?? column.selectedMinWidth ?? column.minWidth,
            ...(column.options ? { options: column.options } : {}),
        }));

    return {
        pickerConfig,
        mapRow,
        displayColumns,
        tableColumns,
        normalizedColumns,
    };
};

export default function RecordPickerField({ field, value = [], formValues, recordId, onChange, editing }) {
    const [pickerState, setPickerState] = useState({ pickerOpen: false, hydratedRows: value || [] });
    const { pickerConfig, mapRow, displayColumns, tableColumns, normalizedColumns } = buildRecordPickerConfig(field);
    const pickerOpen = !!pickerState.pickerOpen;
    const currentRows = pickerState.hydratedRows || value || [];
    const useMasterTable = field.table?.useMaster === true;

    const setState = (partial) => {
        setPickerState((prev) => ({ ...prev, ...partial }));
    };

    const syncRows = (nextRows) => {
        setState({ hydratedRows: nextRows });
        onChange(field.name, nextRows);
    };

    const handlePickerSelect = (selectedRows) => {
        const currentLength = currentRows.length || 0;
        const newRows = selectedRows.map((row, index) => {
            const mapped = {};
            for (const [targetKey, sourceKey] of Object.entries(mapRow)) {
                if (sourceKey === null) {
                    mapped[targetKey] = targetKey === "order_no" ? currentLength + index + 1 : null;
                } else {
                    mapped[targetKey] = row[sourceKey] ?? null;
                }
            }
            return mapped;
        });

        const mergedRows = mergeRecordPickerRows(field, tableColumns, currentRows, newRows);
        syncRows(mergedRows);
        setState({ pickerOpen: false, hydratedRows: mergedRows });
    };

    const removeRow = (index) => {
        const nextRows = currentRows
            .filter((_, rowIndex) => rowIndex !== index)
            .map((row, rowIndex) => ({ ...row, ...(row.order_no !== undefined ? { order_no: rowIndex + 1 } : {}) }));
        syncRows(nextRows);
    };

    const handleReorder = (newRows) => {
        syncRows(newRows.map(({ __idx, __rowKey, ...rest }) => rest));
    };

    const preparedRows = currentRows.map((row, index) => ({ ...row, __idx: index, __rowKey: index }));

    const masterConfig = {
        endpoint: pickerConfig.endpoint,
        tableName: pickerConfig.tableName,
        fields: displayColumns.map((column) => ({
            name: column.name,
            label: column.label,
            minWidth: column.minWidth,
            ...(column.filterable ? { filterable: true, valueOptions: column.filterOptions } : {}),
        })),
        header: { title: pickerConfig.title || "Browse & Select", buttons: [] },
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>{field.label}</Typography>
                <Button
                    size="small"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={() => setState({ pickerOpen: true })}
                    disabled={!editing}
                >
                    {pickerConfig.buttonLabel || "Browse & Add"}
                </Button>
            </Box>

            {useMasterTable ? (
                <PickerMasterPage
                    columns={tableColumns}
                    pickerColumns={normalizedColumns}
                    rows={preparedRows}
                    value={currentRows}
                    onSyncRows={syncRows}
                    onReorder={handleReorder}
                    onRemove={removeRow}
                    editing={editing}
                    draggable={field.table?.draggable !== false}
                    pickerLabel={field.label || field.name || "item"}
                    tableConfig={field.table || {}}
                    pickerCfg={pickerConfig}
                    formValues={formValues || {}}
                    recordId={recordId}
                />
            ) : (
                <PickerSelectedTable
                    columns={tableColumns}
                    rows={preparedRows}
                    onReorder={handleReorder}
                    onRemove={removeRow}
                    editing={editing}
                    draggable={field.table?.draggable !== false}
                />
            )}

            <Drawer
                anchor="right"
                open={pickerOpen}
                onClose={() => setState({ pickerOpen: false })}
                PaperProps={{ sx: { width: { xs: "100%", sm: 960 }, display: "flex", flexDirection: "column" } }}
            >
                <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid", borderColor: "divider", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
                    <Typography variant="h6">{pickerConfig.title || "Browse & Select"}</Typography>
                    <IconButton size="small" onClick={() => setState({ pickerOpen: false })}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box sx={{ flex: 1, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                    <MasterForm config={masterConfig} pickerMode onPickerSelect={handlePickerSelect} />
                </Box>
            </Drawer>
        </Box>
    );
}