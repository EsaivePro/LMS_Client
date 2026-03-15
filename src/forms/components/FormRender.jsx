import React, { useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Autocomplete,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    DialogContentText,
    InputAdornment,
    Tooltip,
    IconButton,
} from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CustomDateTimePicker from "../../components/common/datepicker/CustomDateTimePicker";
import DataTableV1 from "../../components/common/table/DataTableV1";

export default function FormRender({
    field,
    value,
    onChange,
    editing,
    invalidFields,
    setInvalidFields,
    optionsCache,
    optionsLoading,
    handleSearchInput,
    fetchOptionsForSource,
    resolveOptionLabel,
    showError,
}) {
    const [tableState, setTableState] = useState({});

    const setStateFor = (fieldName, partial) => setTableState((s) => {
        const cur = s[fieldName] || { openAdd: false, newRow: {}, editIdx: null, search: '', invalid: {} };
        return { ...s, [fieldName]: { ...cur, ...partial } };
    });

    const normalizeValue = (col, val) => {
        if (!col) return val;
        if (col.type === 'number') {
            const n = Number(val);
            return Number.isNaN(n) ? 0 : n;
        }
        if (col.type === 'checkbox') return !!val;
        if (col.type === 'datetime') {
            if (typeof val === 'string' && val.endsWith('Z')) return val.replace(/Z$/, '+00:00');
            return val || '';
        }
        return val ?? null;
    };

    const renderTableField = (field, value = [], onFieldChange) => {
        const cols = field.table?.columns || [];
        const options = field.options || [];

        const makeDefaultRow = (idx) => {
            const row = {};
            for (const c of cols) {
                if (c.type === 'number') row[c.name] = 0;
                else if (c.type === 'checkbox') row[c.name] = false;
                else row[c.name] = null;
            }
            if (row.hasOwnProperty('order_no')) row.order_no = (idx ?? (value?.length || 0)) + 1;
            return row;
        };

        const state = tableState[field.name] || { openAdd: false, newRow: makeDefaultRow(value.length), editIdx: null, search: '', invalid: {} };

        const addRow = () => {
            const currentState = tableState[field.name] || state;
            const nextRowRaw = { ...(currentState.newRow || makeDefaultRow(value.length)) };
            const nextRow = (() => {
                const out = { ...(nextRowRaw || {}) };
                for (const c of cols) out[c.name] = normalizeValue(c, out[c.name]);
                return out;
            })();

            const invalidMap = {};
            for (const c of cols) {
                if (c.required) {
                    const v = nextRow[c.name];
                    const empty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
                    if (empty) invalidMap[c.name] = true;
                }
            }
            if (Object.keys(invalidMap).length) {
                setStateFor(field.name, { invalid: { ...(currentState.invalid || {}), ...invalidMap } });
                const first = cols.find((c) => invalidMap[c.name]);
                showError(`${first?.label || first?.name || 'Field'} is required`);
                return;
            }

            for (const c of cols) {
                if (c.type === 'select' && c.optionsSource && c.name && c.name.endsWith('_id')) {
                    const base = c.name.replace(/_id$/, '');
                    const val = nextRow[c.name];
                    const label = resolveOptionLabel(c.optionsSource, val);
                    if (label) nextRow[base] = { question_text: label };
                }
            }

            const next = [...(value || []), nextRow];
            onFieldChange(next);

            for (const c of cols) {
                if (c.type === 'select' && c.optionsSource && c.name && c.name.endsWith('_id')) {
                    const base = c.name.replace(/_id$/, '');
                    const val = nextRow[c.name];
                    const label = resolveOptionLabel(c.optionsSource, val);
                    if (!label) {
                        (async () => {
                            const mapped = await fetchOptionsForSource(c.optionsSource);
                            const found = mapped.find((o) => o.value === val);
                            if (found) {
                                const patched = [...(value || []), { ...nextRow, [base]: { question_text: found.label } }];
                                onFieldChange(patched);
                            }
                        })();
                    }
                }
            }

            setStateFor(field.name, { newRow: makeDefaultRow(next.length), openAdd: false });
        };

        const updateCell = (idx, key, val) => {
            const col = cols.find((cc) => cc.name === key) || {};
            const newVal = normalizeValue(col, val);
            const next = (value || []).map((r, i) => {
                if (i !== idx) return r;
                const updated = { ...r, [key]: newVal };
                if (col.type === 'select' && col.optionsSource && key && key.endsWith('_id')) {
                    const base = key.replace(/_id$/, '');
                    const label = resolveOptionLabel(col.optionsSource, newVal);
                    if (label) updated[base] = { question_text: label };
                }
                return updated;
            });
            onFieldChange(next);

            if (col.type === 'select' && col.optionsSource && key && key.endsWith('_id')) {
                const label = resolveOptionLabel(col.optionsSource, newVal);
                if (!label) {
                    (async () => {
                        const mapped = await fetchOptionsForSource(col.optionsSource);
                        const found = mapped.find((o) => o.value === newVal);
                        if (found) {
                            const patched = (next || []).map((r, i) => (i === idx ? { ...r, [key]: newVal, [key.replace(/_id$/, '')]: { question_text: found.label } } : r));
                            onFieldChange(patched);
                        }
                    })();
                }
            }
        };

        const removeRow = (idx) => {
            const next = (value || []).filter((_, i) => i !== idx).map((r, i) => ({ ...r, ...(r.order_no !== undefined ? { order_no: i + 1 } : {}) }));
            onFieldChange(next);
        };

        const layout = field.table?.layout || 'table';

        if (layout === 'cards') {
            const prepared = (value || []).map((r, i) => ({ ...r, __idx: i }));
            return (
                <Box sx={{ width: '100%' }}>
                    <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography>{field.label}</Typography>
                        <Box>
                            <IconButton size="small" color="primary" onClick={addRow} disabled={!editing}><AddIcon /></IconButton>
                        </Box>
                    </Box>

                    <Stack spacing={1}>
                        {prepared.length === 0 && <Typography variant="body2">No entries</Typography>}

                        {prepared.map((r, idx) => (
                            <Paper key={idx} sx={{ p: 2, width: '100%' }}>
                                <Box sx={{ display: 'grid', gap: 2, alignItems: 'center', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' } }}>
                                    {cols.filter(c => c.type !== 'actions').map((c) => {
                                        if (c.type === 'select') {
                                            const opts = (c.optionsSource ? (optionsCache[c.optionsSource] || []) : (c.options || field.options || []));
                                            return (
                                                <Autocomplete
                                                    key={c.name}
                                                    options={opts}
                                                    getOptionLabel={(o) => o.label || o.value}
                                                    value={opts.find(o => o.value === (r[c.name] ?? null)) || null}
                                                    onChange={(_, v) => { updateCell(idx, c.name, v ? v.value : null); setStateFor(field.name, { invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                                    onInputChange={(_, input) => { if (editing && c.optionsSource) handleSearchInput(c.optionsSource, input); }}
                                                    onOpen={() => { if (!editing) return; if (c.optionsSource) { /* clear & fetch */ } }}
                                                    filterOptions={(opts) => opts}
                                                    isOptionEqualToValue={(option, val) => option.value === (val && (val.value ?? val))}
                                                    loading={!!optionsLoading[c.optionsSource]}
                                                    disabled={!editing || !!c.readOnly}
                                                    renderInput={(params) => {
                                                        const isErr = !!(state.invalid && state.invalid[c.name]);
                                                        return (
                                                            <TextField
                                                                {...params}
                                                                label={`${c.label}${c.required ? ' *' : ''}`}
                                                                size="small"
                                                                disabled={!editing || !!c.readOnly}
                                                                error={isErr}
                                                                InputProps={{
                                                                    ...params.InputProps,
                                                                    endAdornment: (
                                                                        <InputAdornment position="end">
                                                                            {isErr && <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip>}
                                                                            {params.InputProps.endAdornment}
                                                                        </InputAdornment>
                                                                    ),
                                                                }}
                                                            />
                                                        );
                                                    }}
                                                    sx={{ minWidth: c.minWidth || 120 }}
                                                />
                                            );
                                        }

                                        if (c.type === 'number') {
                                            return (
                                                <TextField
                                                    key={c.name}
                                                    size="small"
                                                    label={`${c.label}${c.required ? ' *' : ''}`}
                                                    type="number"
                                                    value={r[c.name] ?? 0}
                                                    onChange={(e) => { updateCell(idx, c.name, e.target.value); setStateFor(field.name, { invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                                    sx={{ minWidth: c.minWidth || 100 }}
                                                    disabled={!editing || !!c.readOnly}
                                                    error={!!(state.invalid && state.invalid[c.name])}
                                                    InputProps={{ endAdornment: (state.invalid && state.invalid[c.name]) ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip></InputAdornment> : null }}
                                                />
                                            );
                                        }

                                        if (c.type === 'checkbox') {
                                            return (
                                                <FormControlLabel
                                                    key={c.name}
                                                    control={<Checkbox checked={!!r[c.name]} onChange={(e) => { updateCell(idx, c.name, e.target.checked); setStateFor(field.name, { invalid: { ...(state.invalid || {}), [c.name]: false } }); }} disabled={!editing || !!c.readOnly} />}
                                                    label={<span>{`${c.label}${c.required ? ' *' : ''}`} {state.invalid && state.invalid[c.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} /></Tooltip> : null}</span>}
                                                    sx={{ display: 'block' }}
                                                />
                                            );
                                        }

                                        if (c.type === 'datetime') {
                                            return (
                                                <Box key={c.name}>
                                                    <CustomDateTimePicker label={`${c.label}${c.required ? ' *' : ''}`} value={r[c.name] || ''} onChange={(val) => { updateCell(idx, c.name, val); setStateFor(field.name, { invalid: { ...(state.invalid || {}), [c.name]: false } }); }} size="small" fullWidth={true} disabled={!editing || !!c.readOnly} />
                                                    {state.invalid && state.invalid[c.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mt: 0.5 }} /></Tooltip> : null}
                                                </Box>
                                            );
                                        }

                                        return (
                                            <TextField
                                                key={c.name}
                                                size="small"
                                                label={`${c.label}${c.required ? ' *' : ''}`}
                                                value={r[c.name] ?? ''}
                                                onChange={(e) => { updateCell(idx, c.name, e.target.value); setStateFor(field.name, { invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                                sx={{ minWidth: c.minWidth || 140 }}
                                                error={!!(state.invalid && state.invalid[c.name])}
                                                InputProps={{ endAdornment: (state.invalid && state.invalid[c.name]) ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip></InputAdornment> : null }}
                                            />
                                        );
                                    })}

                                    <Box>
                                        <IconButton size="small" onClick={() => removeRow(idx)} disabled={!editing}><DeleteIcon fontSize="small" /></IconButton>
                                    </Box>
                                </Box>
                            </Paper>
                        ))}
                    </Stack>
                </Box>
            );
        }

        const dtCols = cols.map((c) => {
            if (c.type === 'actions') {
                return {
                    field: c.name,
                    headerName: c.label,
                    minWidth: c.minWidth,
                    sortable: false,
                    filterable: false,
                    renderCell: ({ row }) => (
                        <IconButton size="small" onClick={() => removeRow(row.__idx)} disabled={!editing}><DeleteIcon fontSize="small" /></IconButton>
                    ),
                };
            }

            if (c.type === 'select') {
                return {
                    field: c.name,
                    headerName: c.label,
                    minWidth: c.minWidth,
                    sortable: false,
                    filterable: false,
                    renderCell: ({ value, row }) => {
                        let nestedLabel = null;
                        try {
                            const base = c.name && c.name.endsWith('_id') ? c.name.replace(/_id$/, '') : null;
                            const nested = base ? row[base] : null;
                            if (nested && typeof nested === 'object') {
                                nestedLabel = nested.question_text || nested.question_description || nested.title || nested.name || null;
                            }
                            if (!nestedLabel && row[c.name] && typeof row[c.name] === 'object') {
                                const obj = row[c.name];
                                nestedLabel = obj.question_text || obj.title || obj.name || null;
                            }
                        } catch (e) {
                            nestedLabel = null;
                        }

                        if (nestedLabel) return nestedLabel;

                        const opt = (c.options || field.options || optionsCache[c.optionsSource] || options).find((o) => o.value === value);
                        return opt ? opt.label : (value ?? '-');
                    },
                };
            }

            if (c.type === 'checkbox') {
                return {
                    field: c.name,
                    headerName: c.label,
                    minWidth: c.minWidth,
                    sortable: false,
                    filterable: false,
                    renderCell: ({ value }) => (value ? 'Yes' : 'No'),
                };
            }

            return {
                field: c.name,
                headerName: c.label,
                minWidth: c.minWidth,
                sortable: false,
                filterable: false,
            };
        });

        const prepared = (value || []).map((r, i) => ({ ...r, __idx: i, id: i }));

        return (
            <Box sx={{ width: '100%' }}>
                <Box sx={{ mb: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography>{field.label}</Typography>
                    <Button size="small" variant="outlined" onClick={() => setStateFor(field.name, { openAdd: true })} disabled={!editing}>{field.table?.addButton?.label || 'Add'}</Button>
                </Box>

                <Box sx={{ width: '100%' }}>
                    <DataTableV1
                        rows={prepared}
                        columns={dtCols}
                        serverSide={false}
                        checkboxSelection={false}
                        defaultPageSize={5}
                        pageSizeOptions={[5, 10, 20]}
                    />
                </Box>

                <Dialog open={!!state.openAdd} onClose={() => setStateFor(field.name, { openAdd: false })}>
                    <DialogTitle>{field.table?.addButton?.label || 'Add'}</DialogTitle>
                    <DialogContent sx={{ width: 600 }}>
                        <DialogContentText sx={{ mb: 1 }}>Enter values for the new row.</DialogContentText>
                        <Stack spacing={2} sx={{ pt: 1 }}>
                            {cols.filter(c => c.type !== 'actions').map((c) => {
                                const curVal = (state.newRow && state.newRow[c.name]) ?? '';
                                if (c.type === 'select') {
                                    const opts = (c.optionsSource ? (optionsCache[c.optionsSource] || []) : (c.options || field.options || []));
                                    return (
                                        <Autocomplete
                                            key={c.name}
                                            fullWidth
                                            options={opts}
                                            getOptionLabel={(o) => o.label || o.value}
                                            value={opts.find(o => o.value === curVal) || null}
                                            onChange={(_, v) => { if (!editing) return; setStateFor(field.name, { newRow: { ...(state.newRow || {}), [c.name]: v ? v.value : null }, invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                            onInputChange={(_, input) => { if (!editing) return; if (c.optionsSource) handleSearchInput(c.optionsSource, input); }}
                                            onOpen={() => { if (!editing) return; if (c.optionsSource) { /* fetch on open if needed */ } }}
                                            filterOptions={(opts) => opts}
                                            isOptionEqualToValue={(option, val) => option.value === (val && (val.value ?? val))}
                                            loading={!!optionsLoading[c.optionsSource]}
                                            disabled={!editing || !!c.readOnly}
                                            renderInput={(params) => {
                                                const isErr = !!(state.invalid && state.invalid[c.name]);
                                                return (
                                                    <TextField
                                                        {...params}
                                                        fullWidth
                                                        label={`${c.label}${c.required ? ' *' : ''}`}
                                                        size="small"
                                                        disabled={!editing || !!c.readOnly}
                                                        error={isErr}
                                                        InputProps={{
                                                            ...params.InputProps,
                                                            endAdornment: (
                                                                <>
                                                                    {isErr && <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip>}
                                                                    {params.InputProps.endAdornment}
                                                                </>
                                                            ),
                                                        }}
                                                    />
                                                );
                                            }}

                                        />
                                    );
                                }

                                if (c.type === 'number') {
                                    return (
                                        <TextField
                                            key={c.name}
                                            fullWidth
                                            size="small"
                                            label={`${c.label}${c.required ? ' *' : ''}`}
                                            type="number"
                                            value={curVal ?? 0}
                                            onChange={(e) => { setStateFor(field.name, { newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, e.target.value) }, invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                            disabled={!editing || !!c.readOnly}
                                            error={!!(state.invalid && state.invalid[c.name])}
                                            InputProps={{ endAdornment: (state.invalid && state.invalid[c.name]) ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip></InputAdornment> : null }}
                                        />
                                    );
                                }

                                if (c.type === 'checkbox') {
                                    return (
                                        <FormControlLabel
                                            key={c.name}
                                            control={<Checkbox checked={!!curVal} onChange={(e) => setStateFor(field.name, { newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, e.target.checked) }, invalid: { ...(state.invalid || {}), [c.name]: false } })} disabled={!editing || !!c.readOnly} />}
                                            label={<span>{`${c.label}${c.required ? ' *' : ''}`} {state.invalid && state.invalid[c.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} /></Tooltip> : null}</span>}
                                            sx={{ display: 'block' }}
                                        />
                                    );
                                }

                                if (c.type === 'datetime') {
                                    return (
                                        <Box key={c.name}>
                                            <CustomDateTimePicker label={`${c.label}${c.required ? ' *' : ''}`} value={state.newRow && state.newRow[c.name] ? state.newRow[c.name] : ''} onChange={(val) => setStateFor(field.name, { newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, val) }, invalid: { ...(state.invalid || {}), [c.name]: false } })} size="small" fullWidth={true} disabled={!editing || !!c.readOnly} />
                                            {state.invalid && state.invalid[c.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mt: 0.5 }} /></Tooltip> : null}
                                        </Box>
                                    );
                                }

                                return (
                                    <TextField
                                        key={c.name}
                                        fullWidth
                                        size="small"
                                        label={`${c.label}${c.required ? ' *' : ''}`}
                                        value={curVal ?? ''}
                                        onChange={(e) => setStateFor(field.name, { newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, e.target.value) }, invalid: { ...(state.invalid || {}), [c.name]: false } })}
                                        disabled={!editing || !!c.readOnly}
                                        error={!!(state.invalid && state.invalid[c.name])}
                                        InputProps={{ endAdornment: (state.invalid && state.invalid[c.name]) ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip></InputAdornment> : null }}
                                    />
                                );
                            })}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setStateFor(field.name, { openAdd: false })}>Cancel</Button>
                        <Button onClick={addRow} variant="contained" disabled={!editing}>Add</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    };

    const common = { fullWidth: true, size: "small" };
    switch (field.type) {
        case "text":
            return (
                <TextField
                    {...common}
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    value={value ?? ""}
                    onChange={(e) => { onChange(field.name, e.target.value); setInvalidFields((p) => ({ ...(p || {}), [field.name]: false })); }}
                    disabled={!editing || field.readOnly}
                    error={!!invalidFields[field.name]}
                    InputProps={{ endAdornment: invalidFields[field.name] ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" /></Tooltip></InputAdornment> : null }}
                />
            );
        case "number":
            return (
                <TextField
                    {...common}
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    type="number"
                    value={value ?? ""}
                    onChange={(e) => {
                        const raw = e.target.value;
                        const n = raw === '' ? null : Number(raw);
                        onChange(field.name, Number.isNaN(n) ? 0 : n);
                        setInvalidFields((p) => ({ ...(p || {}), [field.name]: false }));
                    }}
                    disabled={!editing || field.readOnly}
                    error={!!invalidFields[field.name]}
                    InputProps={{ endAdornment: invalidFields[field.name] ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" /></Tooltip></InputAdornment> : null }}
                />
            );
        case "textarea":
            return (
                <TextField
                    {...common}
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    multiline rows={4}
                    value={value ?? ""}
                    onChange={(e) => { onChange(field.name, e.target.value); setInvalidFields((p) => ({ ...(p || {}), [field.name]: false })); }}
                    disabled={!editing || field.readOnly}
                    error={!!invalidFields[field.name]}
                    InputProps={{ endAdornment: invalidFields[field.name] ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" /></Tooltip></InputAdornment> : null }}
                />
            );
        case "checkbox":
            return <FormControlLabel control={<Checkbox checked={!!value} onChange={(e) => { onChange(field.name, e.target.checked); setInvalidFields((p) => ({ ...(p || {}), [field.name]: false })); }} disabled={!editing || field.readOnly} />} label={<span>{field.label}{invalidFields[field.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} /></Tooltip> : null}</span>} />;
        case "array":
            return (
                <TextField
                    {...common}
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    value={JSON.stringify(value || [])}
                    onChange={(e) => { onChange(field.name, JSON.parse(e.target.value || '[]')); setInvalidFields((p) => ({ ...(p || {}), [field.name]: false })); }}
                    helperText="JSON array editor"
                    disabled={!editing || field.readOnly}
                    error={!!invalidFields[field.name]}
                    InputProps={{ endAdornment: invalidFields[field.name] ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" /></Tooltip></InputAdornment> : null }}
                />
            );
        case "table":
            return renderTableField(field, value || [], (next) => onChange(field.name, next));
        default:
            return (
                <TextField
                    {...common}
                    label={`${field.label}${field.required ? ' *' : ''}`}
                    value={value ?? ""}
                    onChange={(e) => { onChange(field.name, e.target.value); setInvalidFields((p) => ({ ...(p || {}), [field.name]: false })); }}
                    disabled={!editing || field.readOnly}
                    error={!!invalidFields[field.name]}
                    InputProps={{ endAdornment: invalidFields[field.name] ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" /></Tooltip></InputAdornment> : null }}
                />
            );
    }
}
