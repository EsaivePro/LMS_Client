import React, { useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    IconButton,
    InputAdornment,
    Paper,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import CustomDateTimePicker from "../../../components/common/datepicker/CustomDateTimePicker";
import DataTableV1 from "../../../components/common/table/DataTableV1";

const normalizeValue = (column, value) => {
    if (!column) return value;
    if (column.type === "number") {
        const nextNumber = Number(value);
        return Number.isNaN(nextNumber) ? 0 : nextNumber;
    }
    if (column.type === "checkbox") return !!value;
    if (column.type === "datetime") {
        if (typeof value === "string" && value.endsWith("Z")) {
            return value.replace(/Z$/, "+00:00");
        }
        return value || "";
    }
    return value ?? null;
};

export default function TableField({
    field,
    value = [],
    onChange,
    editing,
    optionsCache,
    optionsLoading,
    handleSearchInput,
    fetchOptionsForSource,
    resolveOptionLabel,
    showError,
}) {
    const [tableState, setTableState] = useState({});
    const columns = field.table?.columns || [];
    const fallbackOptions = field.options || [];

    const makeDefaultRow = (rowIndex) => {
        const row = {};
        for (const column of columns) {
            if (column.type === "number") row[column.name] = 0;
            else if (column.type === "checkbox") row[column.name] = false;
            else row[column.name] = null;
        }
        if (row.hasOwnProperty("order_no")) row.order_no = ((rowIndex ?? value.length) || 0) + 1;
        return row;
    };

    const state = tableState[field.name] || {
        openAdd: false,
        newRow: makeDefaultRow(value.length),
        editIdx: null,
        search: "",
        invalid: {},
    };

    const setState = (partial) => {
        setTableState((prev) => {
            const current = prev[field.name] || state;
            return { ...prev, [field.name]: { ...current, ...partial } };
        });
    };

    const addRow = () => {
        const currentState = tableState[field.name] || state;
        const nextRowRaw = { ...(currentState.newRow || makeDefaultRow(value.length)) };
        const nextRow = { ...(nextRowRaw || {}) };

        for (const column of columns) {
            nextRow[column.name] = normalizeValue(column, nextRow[column.name]);
        }

        const invalidMap = {};
        for (const column of columns) {
            if (!column.required) continue;
            const currentValue = nextRow[column.name];
            const isEmpty = currentValue === undefined || currentValue === null || (typeof currentValue === "string" && currentValue.trim() === "");
            if (isEmpty) invalidMap[column.name] = true;
        }

        if (Object.keys(invalidMap).length) {
            setState({ invalid: { ...(currentState.invalid || {}), ...invalidMap } });
            const firstInvalid = columns.find((column) => invalidMap[column.name]);
            showError(`${firstInvalid?.label || firstInvalid?.name || "Field"} is required`);
            return;
        }

        for (const column of columns) {
            if (column.type === "select" && column.optionsSource && column.name?.endsWith("_id")) {
                const base = column.name.replace(/_id$/, "");
                const currentValue = nextRow[column.name];
                const label = resolveOptionLabel(column.optionsSource, currentValue);
                if (label) nextRow[base] = { question_text: label };
            }
        }

        const nextRows = [...(value || []), nextRow];
        onChange(field.name, nextRows);

        for (const column of columns) {
            if (column.type === "select" && column.optionsSource && column.name?.endsWith("_id")) {
                const base = column.name.replace(/_id$/, "");
                const currentValue = nextRow[column.name];
                const label = resolveOptionLabel(column.optionsSource, currentValue);
                if (!label) {
                    (async () => {
                        const mapped = await fetchOptionsForSource(column.optionsSource);
                        const found = mapped.find((option) => option.value === currentValue);
                        if (found) {
                            const patchedRows = [...(value || []), { ...nextRow, [base]: { question_text: found.label } }];
                            onChange(field.name, patchedRows);
                        }
                    })();
                }
            }
        }

        setState({ newRow: makeDefaultRow(nextRows.length), openAdd: false, invalid: {} });
    };

    const updateCell = (rowIndex, key, nextValue) => {
        const column = columns.find((item) => item.name === key) || {};
        const normalized = normalizeValue(column, nextValue);
        const nextRows = (value || []).map((row, index) => {
            if (index !== rowIndex) return row;
            const updated = { ...row, [key]: normalized };
            if (column.type === "select" && column.optionsSource && key.endsWith("_id")) {
                const base = key.replace(/_id$/, "");
                const label = resolveOptionLabel(column.optionsSource, normalized);
                if (label) updated[base] = { question_text: label };
            }
            return updated;
        });
        onChange(field.name, nextRows);

        if (column.type === "select" && column.optionsSource && key.endsWith("_id")) {
            const label = resolveOptionLabel(column.optionsSource, normalized);
            if (!label) {
                (async () => {
                    const mapped = await fetchOptionsForSource(column.optionsSource);
                    const found = mapped.find((option) => option.value === normalized);
                    if (found) {
                        const patchedRows = nextRows.map((row, index) => (
                            index === rowIndex
                                ? { ...row, [key]: normalized, [key.replace(/_id$/, "")]: { question_text: found.label } }
                                : row
                        ));
                        onChange(field.name, patchedRows);
                    }
                })();
            }
        }
    };

    const removeRow = (rowIndex) => {
        const nextRows = (value || [])
            .filter((_, index) => index !== rowIndex)
            .map((row, index) => ({ ...row, ...(row.order_no !== undefined ? { order_no: index + 1 } : {}) }));
        onChange(field.name, nextRows);
    };

    const clearInvalid = (columnName) => {
        setState({ invalid: { ...(state.invalid || {}), [columnName]: false } });
    };

    const renderDialogField = (column) => {
        const currentValue = (state.newRow && state.newRow[column.name]) ?? "";

        if (column.type === "select") {
            const options = column.optionsSource ? optionsCache[column.optionsSource] || [] : column.options || field.options || [];
            const hasError = !!(state.invalid && state.invalid[column.name]);

            return (
                <Autocomplete
                    key={column.name}
                    fullWidth
                    options={options}
                    getOptionLabel={(option) => option.label || option.value}
                    value={options.find((option) => option.value === currentValue) || null}
                    onChange={(_, selected) => {
                        if (!editing) return;
                        setState({
                            newRow: { ...(state.newRow || {}), [column.name]: selected ? selected.value : null },
                            invalid: { ...(state.invalid || {}), [column.name]: false },
                        });
                    }}
                    onInputChange={(_, input) => {
                        if (!editing || !column.optionsSource) return;
                        handleSearchInput(column.optionsSource, input);
                    }}
                    filterOptions={(items) => items}
                    isOptionEqualToValue={(option, current) => option.value === (current && (current.value ?? current))}
                    loading={!!optionsLoading[column.optionsSource]}
                    disabled={!editing || !!column.readOnly}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            fullWidth
                            label={`${column.label}${column.required ? " *" : ""}`}
                            size="small"
                            disabled={!editing || !!column.readOnly}
                            error={hasError}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <>
                                        {hasError ? (
                                            <Tooltip title="Required">
                                                <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                            </Tooltip>
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </>
                                ),
                            }}
                        />
                    )}
                />
            );
        }

        if (column.type === "number") {
            return (
                <TextField
                    key={column.name}
                    fullWidth
                    size="small"
                    label={`${column.label}${column.required ? " *" : ""}`}
                    type="number"
                    value={currentValue ?? 0}
                    onChange={(event) => {
                        setState({
                            newRow: { ...(state.newRow || {}), [column.name]: normalizeValue(column, event.target.value) },
                            invalid: { ...(state.invalid || {}), [column.name]: false },
                        });
                    }}
                    disabled={!editing || !!column.readOnly}
                    error={!!(state.invalid && state.invalid[column.name])}
                    InputProps={{
                        endAdornment: state.invalid && state.invalid[column.name]
                            ? (
                                <InputAdornment position="end">
                                    <Tooltip title="Required">
                                        <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                    </Tooltip>
                                </InputAdornment>
                            )
                            : null,
                    }}
                />
            );
        }

        if (column.type === "checkbox") {
            return (
                <FormControlLabel
                    key={column.name}
                    control={
                        <Checkbox
                            checked={!!currentValue}
                            onChange={(event) => {
                                setState({
                                    newRow: { ...(state.newRow || {}), [column.name]: normalizeValue(column, event.target.checked) },
                                    invalid: { ...(state.invalid || {}), [column.name]: false },
                                });
                            }}
                            disabled={!editing || !!column.readOnly}
                        />
                    }
                    label={
                        <span>
                            {`${column.label}${column.required ? " *" : ""}`}
                            {state.invalid && state.invalid[column.name] ? (
                                <Tooltip title="Required">
                                    <InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                                </Tooltip>
                            ) : null}
                        </span>
                    }
                    sx={{ display: "block" }}
                />
            );
        }

        if (column.type === "datetime") {
            return (
                <Box key={column.name}>
                    <CustomDateTimePicker
                        label={`${column.label}${column.required ? " *" : ""}`}
                        value={state.newRow && state.newRow[column.name] ? state.newRow[column.name] : ""}
                        onChange={(nextValue) => {
                            setState({
                                newRow: { ...(state.newRow || {}), [column.name]: normalizeValue(column, nextValue) },
                                invalid: { ...(state.invalid || {}), [column.name]: false },
                            });
                        }}
                        size="small"
                        fullWidth
                        disabled={!editing || !!column.readOnly}
                    />
                    {state.invalid && state.invalid[column.name] ? (
                        <Tooltip title="Required">
                            <InfoOutlinedIcon color="error" fontSize="small" sx={{ mt: 0.5 }} />
                        </Tooltip>
                    ) : null}
                </Box>
            );
        }

        return (
            <TextField
                key={column.name}
                fullWidth
                size="small"
                label={`${column.label}${column.required ? " *" : ""}`}
                value={currentValue ?? ""}
                onChange={(event) => {
                    setState({
                        newRow: { ...(state.newRow || {}), [column.name]: normalizeValue(column, event.target.value) },
                        invalid: { ...(state.invalid || {}), [column.name]: false },
                    });
                }}
                disabled={!editing || !!column.readOnly}
                error={!!(state.invalid && state.invalid[column.name])}
                InputProps={{
                    endAdornment: state.invalid && state.invalid[column.name]
                        ? (
                            <InputAdornment position="end">
                                <Tooltip title="Required">
                                    <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                </Tooltip>
                            </InputAdornment>
                        )
                        : null,
                }}
            />
        );
    };

    const renderCardField = (row, rowIndex, column) => {
        if (column.type === "select") {
            const options = column.optionsSource ? optionsCache[column.optionsSource] || [] : column.options || field.options || fallbackOptions;
            const hasError = !!(state.invalid && state.invalid[column.name]);

            return (
                <Autocomplete
                    key={column.name}
                    options={options}
                    getOptionLabel={(option) => option.label || option.value}
                    value={options.find((option) => option.value === (row[column.name] ?? null)) || null}
                    onChange={(_, selected) => {
                        updateCell(rowIndex, column.name, selected ? selected.value : null);
                        clearInvalid(column.name);
                    }}
                    onInputChange={(_, input) => {
                        if (editing && column.optionsSource) handleSearchInput(column.optionsSource, input);
                    }}
                    filterOptions={(items) => items}
                    isOptionEqualToValue={(option, current) => option.value === (current && (current.value ?? current))}
                    loading={!!optionsLoading[column.optionsSource]}
                    disabled={!editing || !!column.readOnly}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            label={`${column.label}${column.required ? " *" : ""}`}
                            size="small"
                            disabled={!editing || !!column.readOnly}
                            error={hasError}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <InputAdornment position="end">
                                        {hasError ? (
                                            <Tooltip title="Required">
                                                <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                            </Tooltip>
                                        ) : null}
                                        {params.InputProps.endAdornment}
                                    </InputAdornment>
                                ),
                            }}
                        />
                    )}
                    sx={{ minWidth: column.minWidth || 120 }}
                />
            );
        }

        if (column.type === "number") {
            return (
                <TextField
                    key={column.name}
                    size="small"
                    label={`${column.label}${column.required ? " *" : ""}`}
                    type="number"
                    value={row[column.name] ?? 0}
                    onChange={(event) => {
                        updateCell(rowIndex, column.name, event.target.value);
                        clearInvalid(column.name);
                    }}
                    sx={{ minWidth: column.minWidth || 100 }}
                    disabled={!editing || !!column.readOnly}
                    error={!!(state.invalid && state.invalid[column.name])}
                    InputProps={{
                        endAdornment: state.invalid && state.invalid[column.name]
                            ? (
                                <InputAdornment position="end">
                                    <Tooltip title="Required">
                                        <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                    </Tooltip>
                                </InputAdornment>
                            )
                            : null,
                    }}
                />
            );
        }

        if (column.type === "checkbox") {
            return (
                <FormControlLabel
                    key={column.name}
                    control={
                        <Checkbox
                            checked={!!row[column.name]}
                            onChange={(event) => {
                                updateCell(rowIndex, column.name, event.target.checked);
                                clearInvalid(column.name);
                            }}
                            disabled={!editing || !!column.readOnly}
                        />
                    }
                    label={
                        <span>
                            {`${column.label}${column.required ? " *" : ""}`}
                            {state.invalid && state.invalid[column.name] ? (
                                <Tooltip title="Required">
                                    <InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                                </Tooltip>
                            ) : null}
                        </span>
                    }
                    sx={{ display: "block" }}
                />
            );
        }

        if (column.type === "datetime") {
            return (
                <Box key={column.name}>
                    <CustomDateTimePicker
                        label={`${column.label}${column.required ? " *" : ""}`}
                        value={row[column.name] || ""}
                        onChange={(nextValue) => {
                            updateCell(rowIndex, column.name, nextValue);
                            clearInvalid(column.name);
                        }}
                        size="small"
                        fullWidth
                        disabled={!editing || !!column.readOnly}
                    />
                    {state.invalid && state.invalid[column.name] ? (
                        <Tooltip title="Required">
                            <InfoOutlinedIcon color="error" fontSize="small" sx={{ mt: 0.5 }} />
                        </Tooltip>
                    ) : null}
                </Box>
            );
        }

        return (
            <TextField
                key={column.name}
                size="small"
                label={`${column.label}${column.required ? " *" : ""}`}
                value={row[column.name] ?? ""}
                onChange={(event) => {
                    updateCell(rowIndex, column.name, event.target.value);
                    clearInvalid(column.name);
                }}
                sx={{ minWidth: column.minWidth || 140 }}
                error={!!(state.invalid && state.invalid[column.name])}
                InputProps={{
                    endAdornment: state.invalid && state.invalid[column.name]
                        ? (
                            <InputAdornment position="end">
                                <Tooltip title="Required">
                                    <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} />
                                </Tooltip>
                            </InputAdornment>
                        )
                        : null,
                }}
            />
        );
    };

    if (field.table?.layout === "cards") {
        const preparedRows = (value || []).map((row, index) => ({ ...row, __idx: index }));

        return (
            <Box sx={{ width: "100%" }}>
                <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Typography>{field.label}</Typography>
                    <Box>
                        <IconButton size="small" color="primary" onClick={addRow} disabled={!editing}>
                            <AddIcon />
                        </IconButton>
                    </Box>
                </Box>

                <Stack spacing={1}>
                    {preparedRows.length === 0 ? <Typography variant="body2">No entries</Typography> : null}

                    {preparedRows.map((row, rowIndex) => (
                        <Paper key={rowIndex} sx={{ p: 2, width: "100%" }}>
                            <Box sx={{ display: "grid", gap: 2, alignItems: "center", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)", lg: "repeat(4, 1fr)" } }}>
                                {columns.filter((column) => column.type !== "actions").map((column) => renderCardField(row, rowIndex, column))}
                                <Box>
                                    <IconButton size="small" onClick={() => removeRow(rowIndex)} disabled={!editing}>
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Paper>
                    ))}
                </Stack>
            </Box>
        );
    }

    const dataTableColumns = columns.map((column) => {
        if (column.type === "actions") {
            return {
                field: column.name,
                headerName: column.label,
                minWidth: column.minWidth,
                sortable: false,
                filterable: false,
                renderCell: ({ row }) => (
                    <IconButton size="small" onClick={() => removeRow(row.__idx)} disabled={!editing}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                ),
            };
        }

        if (column.type === "select") {
            return {
                field: column.name,
                headerName: column.label,
                minWidth: column.minWidth,
                sortable: false,
                filterable: false,
                renderCell: ({ value: cellValue, row }) => {
                    let nestedLabel = null;
                    try {
                        const base = column.name?.endsWith("_id") ? column.name.replace(/_id$/, "") : null;
                        const nested = base ? row[base] : null;
                        if (nested && typeof nested === "object") {
                            nestedLabel = nested.question_text || nested.question_description || nested.title || nested.name || null;
                        }
                        if (!nestedLabel && row[column.name] && typeof row[column.name] === "object") {
                            const nestedObject = row[column.name];
                            nestedLabel = nestedObject.question_text || nestedObject.title || nestedObject.name || null;
                        }
                    } catch (error) {
                        nestedLabel = null;
                    }

                    if (nestedLabel) return nestedLabel;
                    const option = (column.options || field.options || optionsCache[column.optionsSource] || fallbackOptions).find((item) => item.value === cellValue);
                    return option ? option.label : (cellValue ?? "-");
                },
            };
        }

        if (column.type === "checkbox") {
            return {
                field: column.name,
                headerName: column.label,
                minWidth: column.minWidth,
                sortable: false,
                filterable: false,
                renderCell: ({ value: cellValue }) => (cellValue ? "Yes" : "No"),
            };
        }

        return {
            field: column.name,
            headerName: column.label,
            minWidth: column.minWidth,
            sortable: false,
            filterable: false,
        };
    });

    const preparedRows = (value || []).map((row, index) => ({ ...row, __idx: index, id: index }));

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 1, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>{field.label}</Typography>
                <Button size="small" variant="outlined" onClick={() => setState({ openAdd: true })} disabled={!editing}>
                    {field.table?.addButton?.label || "Add"}
                </Button>
            </Box>

            <Box sx={{ width: "100%" }}>
                <DataTableV1
                    rows={preparedRows}
                    columns={dataTableColumns}
                    serverSide={false}
                    checkboxSelection={false}
                    defaultPageSize={5}
                    pageSizeOptions={[5, 10, 20]}
                />
            </Box>

            <Dialog open={!!state.openAdd} onClose={() => setState({ openAdd: false })}>
                <DialogTitle>{field.table?.addButton?.label || "Add"}</DialogTitle>
                <DialogContent sx={{ width: 600 }}>
                    <DialogContentText sx={{ mb: 1 }}>Enter values for the new row.</DialogContentText>
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        {columns.filter((column) => column.type !== "actions").map((column) => renderDialogField(column))}
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setState({ openAdd: false })}>Cancel</Button>
                    <Button onClick={addRow} variant="contained" disabled={!editing}>Add</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}