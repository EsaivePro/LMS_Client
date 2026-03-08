import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Paper,
    Stack,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    List,
    ListItemButton,
    ListItemText,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Autocomplete,
    DialogContentText,
    InputAdornment,
    Tooltip,
} from "@mui/material";
import CustomDateTimePicker from "../../components/common/datepicker/CustomDateTimePicker";
import useCommon from "../../hooks/useCommon";
import { httpClient } from "../../apiClient/httpClient";
import axiosInstance from "../../apiClient/axiosInstance";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import AddIcon from '@mui/icons-material/Add';
import DataTableV1 from "../../components/common/table/DataTableV1";
import CancelIcon from '@mui/icons-material/Cancel';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

export default function DetailsForm({ definition = {}, initialValues = {}, onSubmit, submitLabel = "Save", initialEditing = false }) {
    const { setTitleContainer, showSuccess, showError, showLoader, hideLoader } = useCommon();
    const [values, setValues] = useState(initialValues || {});
    const [invalidFields, setInvalidFields] = useState({});
    const [tableState, setTableState] = useState({});
    const [optionsCache, setOptionsCache] = useState({});
    const [optionsLoading, setOptionsLoading] = useState({});
    const searchTimers = useRef({});
    const [editing, setEditing] = useState(submitLabel === "Create" || !!initialEditing);
    const [activeSection, setActiveSection] = useState(definition.sections?.[0]?.key);
    const refs = useRef({});
    const navigate = useNavigate();
    const location = useLocation();

    const copyModeHandledRef = useRef(false);

    useEffect(() => {
        setTitleContainer(definition.title || "Details");
        if (submitLabel === "Create") setEditing(true);
    }, [definition.title, setTitleContainer, submitLabel]);

    const buildInitialValues = (definition, data = {}) => {
        const defaults = {};
        const overrideNumberDefaults = { duration_minutes: 30 };
        (definition.sections || []).forEach((section) => {
            (section.fields || []).forEach((field) => {
                const name = field.name;
                if (!name) return;
                const valueFromData = data[name];
                if (field.type === "table") {
                    defaults[name] = Array.isArray(valueFromData) ? valueFromData : [];
                } else if (field.type === "checkbox") {
                    defaults[name] = (valueFromData !== undefined && valueFromData !== null) ? valueFromData : (field.default !== undefined ? field.default : false);
                } else if (field.type === "number") {
                    if (valueFromData !== undefined && valueFromData !== null) defaults[name] = valueFromData;
                    else if (field.default !== undefined) defaults[name] = field.default;
                    else if (overrideNumberDefaults[name] !== undefined) defaults[name] = overrideNumberDefaults[name];
                    else defaults[name] = 0;
                } else {
                    defaults[name] = (valueFromData !== undefined && valueFromData !== null) ? valueFromData : (field.default !== undefined ? field.default : "");
                }
            });
        });
        return defaults;
    };

    useEffect(() => {
        try {
            showLoader();
            // prefer navigation state prefill or sessionStorage if present (create from copy)
            const navPrefill = (location && location.state && location.state.prefill) ? location.state.prefill : null;
            let stored = null;
            try { stored = sessionStorage.getItem('detailsFormPrefill'); stored = stored ? JSON.parse(stored) : null; } catch (e) { stored = null; }

            const sourceData = navPrefill || stored || initialValues || {};
            setValues(buildInitialValues(definition, sourceData || {}));
            // if we used sessionStorage prefill, clear it so it does not persist
            if (stored) { try { sessionStorage.removeItem('detailsFormPrefill'); } catch (e) { } }
        } finally {
            hideLoader();
        }
    }, [initialValues, definition]);

    // Handle query params: editmode and copymode
    useEffect(() => {
        try {
            const params = new URLSearchParams(location?.search || '');
            if (params.get('editmode') === 'true') {
                setEditing(true);
            }

            if (params.get('copymode') === 'true' && initialValues !== null) {
                // prepare copied payload using current values (or initialValues if not available)
                const source = (initialValues && Object.keys(initialValues).length) ? initialValues : (initialValues || {});
                const copied = JSON.parse(JSON.stringify(source || {}));
                if (copied.hasOwnProperty('id')) delete copied.id;
                if (copied.hasOwnProperty('_id')) delete copied._id;
                if (copied.hasOwnProperty('uuid')) delete copied.uuid;
                Object.keys(copied).forEach((k) => {
                    if (Array.isArray(copied[k])) {
                        copied[k] = copied[k].map((row) => {
                            if (row && typeof row === 'object') {
                                const nr = { ...row };
                                if (nr.hasOwnProperty('id')) delete nr.id;
                                if (nr.hasOwnProperty('_id')) delete nr._id;
                                return nr;
                            }
                            return row;
                        });
                    }
                });

                let titleFieldName = null;
                (definition.sections || []).some((sec) => {
                    return (sec.fields || []).some((f) => {
                        if (f.name === 'title' || f.name === 'name' || f.name === 'label') {
                            titleFieldName = f.name;
                            return true;
                        }
                        return false;
                    });
                });
                if (titleFieldName) copied[titleFieldName] = `${copied[titleFieldName] ?? ''} (copy)`;

                // navigate to create route with state prefill; fallback to sessionStorage
                try {
                    const current = (location && location.pathname) ? location.pathname.replace(/\/+$/, '') : window.location.pathname.replace(/\/+$/, '');
                    const newPath = current.replace(/\/[^\/]*$/, '/create');
                    try { sessionStorage.setItem('detailsFormPrefill', JSON.stringify(copied)); } catch (e) { }
                    navigate(newPath, { state: { prefill: copied } });
                } catch (e) {
                    try { sessionStorage.setItem('detailsFormPrefill', JSON.stringify(copied)); } catch (err) { }
                    navigate('create');
                }
            }
        } catch (e) {
            // ignore
        }
    }, [initialValues, definition, location?.search]);

    const handleChange = (name, value) => {
        setValues((v) => ({ ...v, [name]: value }))
    };

    // Generic options loader: fetch options for named sources and cache them
    const fetchOptionsForSource = async (source) => {
        if (!source) return [];
        try {
            let res;
            switch (source) {
                case 'questions':
                    res = await httpClient.fetchQuestions();
                    break;
                case 'courses':
                    res = await httpClient.fetchAllCourses();
                    break;
                case 'users':
                    res = await httpClient.fetchAllUsers();
                    break;
                case 'categories':
                case 'category':
                    res = await httpClient.getAllCategories();
                    break;
                case 'groups':
                    res = await httpClient.getAllGroups();
                    break;
                case 'exams':
                    res = await httpClient.fetchExams();
                    break;
                default:
                    try {
                        const fn = httpClient[`fetch${source.charAt(0).toUpperCase() + source.slice(1)}`];
                        if (typeof fn === 'function') res = await fn();
                    } catch (e) {
                        res = null;
                    }
            }

            // handle paginated shape: response.data or response (array)
            let list = [];
            if (res?.data?.response?.data) list = res.data.response.data;
            else if (Array.isArray(res?.data?.response)) list = res.data.response;
            else if (Array.isArray(res?.data)) list = res.data;
            const mapped = (Array.isArray(list) ? list : []).map((it) => {
                const valueKey = it.id ?? it.value ?? it._id ?? it.key ?? it.code ?? null;
                const label = it.label || it.name || it.title || it.question_text || it.question.question_text || it.text || (typeof it === 'string' ? it : '');
                return { value: valueKey ?? label, label };
            });
            setOptionsCache((p) => ({ ...p, [source]: mapped }));
            return mapped;
        } catch (err) {
            setOptionsCache((p) => ({ ...p, [source]: [] }));
            return [];
        }
    };

    const resolveOptionLabel = (source, val) => {
        if (!source || val === undefined || val === null) return null;
        const list = optionsCache[source] || [];
        const found = list.find((o) => o.value === val);
        return found ? found.label : null;
    };

    const searchOptions = async (source, q = '', page = 1, limit = 10) => {
        if (!source) return [];
        setOptionsLoading((p) => ({ ...p, [source]: true }));
        try {
            const url = `/common-service/search?q=${encodeURIComponent(q || '')}&page=${page}&limit=${limit}&table=${encodeURIComponent(source)}`;
            const res = await axiosInstance.get(url);
            // handle paginated shape: response.data or response (array)
            let list = [];
            if (res?.data?.response?.data) list = res.data.response.data;
            else if (Array.isArray(res?.data?.response)) list = res.data.response;
            else if (Array.isArray(res?.data)) list = res.data;
            const mapped = (Array.isArray(list) ? list : []).map((it) => {
                const valueKey = it.id ?? it.value ?? it._id ?? it.key ?? it.code ?? null;
                const label = it.label || it.name || it.title || it.question_text || it.text || (typeof it === 'string' ? it : '');
                return { value: valueKey ?? label, label };
            });
            setOptionsCache((p) => ({ ...p, [source]: mapped }));
            return mapped;
        } catch (e) {
            setOptionsCache((p) => ({ ...p, [source]: [] }));
            return [];
        } finally {
            setOptionsLoading((p) => ({ ...p, [source]: false }));
        }
    };

    const handleSearchInput = (source, input) => {
        if (!source) return;
        // debounce per-source
        // clear previous options immediately so dropdown shows only latest results
        setOptionsCache((p) => ({ ...p, [source]: [] }));
        if (searchTimers.current[source]) clearTimeout(searchTimers.current[source]);
        searchTimers.current[source] = setTimeout(() => {
            searchOptions(source, input || '');
        }, 300);
    };

    // scan definition and prefetch all referenced optionsSource values
    useEffect(() => {
        const sources = new Set();
        (definition.sections || []).forEach((sec) => {
            (sec.fields || []).forEach((f) => {
                if (f.optionsSource) sources.add(f.optionsSource);
                if (f.type === 'table') {
                    (f.table?.columns || []).forEach((c) => { if (c.optionsSource) sources.add(c.optionsSource); });
                }
            });
        });
        for (const s of sources) {
            if (optionsCache[s] === undefined) fetchOptionsForSource(s);
        }
    }, [JSON.stringify(definition)]);

    // Table-specific renderer helper (generic for arbitrary table column definitions)
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
        const setStateFor = (partial) => setTableState((s) => {
            const cur = s[field.name] || { openAdd: false, newRow: makeDefaultRow(value.length), editIdx: null, search: '', invalid: {} };
            return { ...s, [field.name]: { ...cur, ...partial } };
        });

        // normalize single value according to column type
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

        const normalizeRow = (row) => {
            const out = { ...(row || {}) };
            for (const c of cols) {
                out[c.name] = normalizeValue(c, out[c.name]);
            }
            return out;
        };

        const addRow = () => {
            const currentState = tableState[field.name] || state;
            const nextRowRaw = { ...(currentState.newRow || makeDefaultRow(value.length)) };
            const nextRow = normalizeRow(nextRowRaw);
            // validate required columns before adding; mark invalid fields
            const invalidMap = {};
            for (const c of cols) {
                if (c.required) {
                    const v = nextRow[c.name];
                    const empty = v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
                    if (empty) {
                        invalidMap[c.name] = true;
                    }
                }
            }
            if (Object.keys(invalidMap).length) {
                setStateFor({ invalid: { ...(currentState.invalid || {}), ...invalidMap } });
                const first = cols.find((c) => invalidMap[c.name]);
                showError(`${first?.label || first?.name || 'Field'} is required`);
                return;
            }
            // attach nested objects for select _id columns when we have labels in cache
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
            // if labels were not available at add time, try fetching them and patch the newly added row
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
            setStateFor({ newRow: makeDefaultRow(next.length), openAdd: false });
        };

        const updateCell = (idx, key, val) => {
            const col = cols.find((cc) => cc.name === key) || {};
            const newVal = normalizeValue(col, val);
            const next = (value || []).map((r, i) => {
                if (i !== idx) return r;
                const updated = { ...r, [key]: newVal };
                // if this is a select referencing a source and column ends with _id, attach nested object
                if (col.type === 'select' && col.optionsSource && key && key.endsWith('_id')) {
                    const base = key.replace(/_id$/, '');
                    const label = resolveOptionLabel(col.optionsSource, newVal);
                    if (label) updated[base] = { question_text: label };
                }
                return updated;
            });
            onFieldChange(next);
            // if label wasn't available, fetch and patch this row
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

            // use ISO strings for datetime values; CustomDateTimePicker handles conversion

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
                                                    onChange={(_, v) => { updateCell(idx, c.name, v ? v.value : null); setStateFor({ invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                                    onInputChange={(_, input) => { if (editing && c.optionsSource) handleSearchInput(c.optionsSource, input); }}
                                                    onOpen={() => { if (!editing) return; if (c.optionsSource) { setOptionsCache((p) => ({ ...p, [c.optionsSource]: [] })); searchOptions(c.optionsSource, ''); } }}
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
                                                    onChange={(e) => { updateCell(idx, c.name, e.target.value); setStateFor({ invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
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
                                                    control={<Checkbox checked={!!r[c.name]} onChange={(e) => { updateCell(idx, c.name, e.target.checked); setStateFor({ invalid: { ...(state.invalid || {}), [c.name]: false } }); }} disabled={!editing || !!c.readOnly} />}
                                                    label={<span>{`${c.label}${c.required ? ' *' : ''}`} {state.invalid && state.invalid[c.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} /></Tooltip> : null}</span>}
                                                    sx={{ display: 'block' }}
                                                />
                                            );
                                        }

                                        if (c.type === 'datetime') {
                                            return (
                                                <Box key={c.name}>
                                                    <CustomDateTimePicker label={`${c.label}${c.required ? ' *' : ''}`} value={r[c.name] || ''} onChange={(val) => { updateCell(idx, c.name, val); setStateFor({ invalid: { ...(state.invalid || {}), [c.name]: false } }); }} size="small" fullWidth={true} disabled={!editing || !!c.readOnly} />
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
                                                onChange={(e) => { updateCell(idx, c.name, e.target.value); setStateFor({ invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
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

        // fallback: table/grid (existing DataTable)
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
                        // If the row contains a nested object for this relation (e.g., question for question_id), prefer its display text
                        let nestedLabel = null;
                        try {
                            const base = c.name && c.name.endsWith('_id') ? c.name.replace(/_id$/, '') : null;
                            const nested = base ? row[base] : null;
                            if (nested && typeof nested === 'object') {
                                nestedLabel = nested.question_text || nested.question_description || nested.title || nested.name || null;
                            }
                            // also handle shape where API embeds as `question` or similar keys
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
                    <Button size="small" variant="outlined" onClick={() => setStateFor({ openAdd: true })} disabled={!editing}>{field.table?.addButton?.label || 'Add'}</Button>
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

                <Dialog open={!!state.openAdd} onClose={() => setStateFor({ openAdd: false })}>
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
                                            onChange={(_, v) => { if (!editing) return; setStateFor({ newRow: { ...(state.newRow || {}), [c.name]: v ? v.value : null }, invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
                                            onInputChange={(_, input) => { if (!editing) return; if (c.optionsSource) handleSearchInput(c.optionsSource, input); }}
                                            onOpen={() => { if (!editing) return; if (c.optionsSource) { setOptionsCache((p) => ({ ...p, [c.optionsSource]: [] })); searchOptions(c.optionsSource, ''); } }}
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
                                            onChange={(e) => { setStateFor({ newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, e.target.value) }, invalid: { ...(state.invalid || {}), [c.name]: false } }); }}
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
                                            control={<Checkbox checked={!!curVal} onChange={(e) => setStateFor({ newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, e.target.checked) }, invalid: { ...(state.invalid || {}), [c.name]: false } })} disabled={!editing || !!c.readOnly} />}
                                            label={<span>{`${c.label}${c.required ? ' *' : ''}`} {state.invalid && state.invalid[c.name] ? <Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} /></Tooltip> : null}</span>}
                                            sx={{ display: 'block' }}
                                        />
                                    );
                                }

                                if (c.type === 'datetime') {
                                    return (
                                        <Box key={c.name}>
                                            <CustomDateTimePicker label={`${c.label}${c.required ? ' *' : ''}`} value={state.newRow && state.newRow[c.name] ? state.newRow[c.name] : ''} onChange={(val) => setStateFor({ newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, val) }, invalid: { ...(state.invalid || {}), [c.name]: false } })} size="small" fullWidth={true} disabled={!editing || !!c.readOnly} />
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
                                        onChange={(e) => setStateFor({ newRow: { ...(state.newRow || {}), [c.name]: normalizeValue(c, e.target.value) }, invalid: { ...(state.invalid || {}), [c.name]: false } })}
                                        disabled={!editing || !!c.readOnly}
                                        error={!!(state.invalid && state.invalid[c.name])}
                                        InputProps={{ endAdornment: (state.invalid && state.invalid[c.name]) ? <InputAdornment position="end"><Tooltip title="Required"><InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: 1 }} /></Tooltip></InputAdornment> : null }}
                                    />
                                );
                            })}
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setStateFor({ openAdd: false })}>Cancel</Button>
                        <Button onClick={addRow} variant="contained" disabled={!editing}>Add</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    };

    const renderField = (field, value, onChange) => {
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
    };

    const handleScrollTo = (key) => {
        const el = refs.current[key];
        if (el) {
            const header = document.querySelector('header, .app-header, .MuiAppBar-root');
            const headerHeight = 117; //header ? header.getBoundingClientRect().height : 96;
            const rectTop = el.getBoundingClientRect().top + window.pageYOffset;
            const target = Math.max(0, rectTop - headerHeight - 8);
            window.scrollTo({ top: target, behavior: 'smooth' });
        }
        setActiveSection(key);
    };

    // update active section while scrolling
    useEffect(() => {
        const sectionKeys = (definition.sections || []).map(s => s.key).filter(Boolean);
        if (!sectionKeys.length) return;
        const headerHeight = 118; // same offset used elsewhere
        let raf = null;

        const onScroll = () => {
            if (raf) return;
            raf = window.requestAnimationFrame(() => {
                raf = null;
                try {
                    let lastKey = sectionKeys[0];
                    for (const key of sectionKeys) {
                        const el = refs.current[key];
                        if (!el) continue;
                        const rect = el.getBoundingClientRect();
                        const top = rect.top;
                        // when top is above or near the header, consider it active
                        if (top - headerHeight - 8 <= 0) {
                            lastKey = key;
                        } else {
                            // the first section below header stops the loop
                            break;
                        }
                    }
                    setActiveSection((prev) => (prev === lastKey ? prev : lastKey));
                } catch (e) {
                    // ignore
                }
            });
        };

        // observe initial position
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll);
        return () => {
            window.removeEventListener('scroll', onScroll);
            window.removeEventListener('resize', onScroll);
            if (raf) window.cancelAnimationFrame(raf);
        };
    }, [JSON.stringify(definition), refs.current]);

    const handleCancel = () => {
        if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
            window.history.back();
            return;
        }
    };



    const handleCopy = async () => {
        try {
            // deep clone current values
            const copied = JSON.parse(JSON.stringify(values || {}));

            // clear top-level ids so new entity will be created
            if (copied.hasOwnProperty('id')) delete copied.id;
            if (copied.hasOwnProperty('_id')) delete copied._id;
            if (copied.hasOwnProperty('uuid')) delete copied.uuid;

            // remove common id fields on immediate table rows (safe-to-remove UI ids)
            Object.keys(copied).forEach((k) => {
                if (Array.isArray(copied[k])) {
                    copied[k] = copied[k].map((row) => {
                        if (row && typeof row === 'object') {
                            const nr = { ...row };
                            if (nr.hasOwnProperty('id')) delete nr.id;
                            if (nr.hasOwnProperty('_id')) delete nr._id;
                            return nr;
                        }
                        return row;
                    });
                }
            });

            // find likely title field in definition and append (copy)
            let titleFieldName = null;
            (definition.sections || []).some((sec) => {
                return (sec.fields || []).some((f) => {
                    if (f.name === 'title' || f.name === 'name' || f.name === 'label') {
                        titleFieldName = f.name;
                        return true;
                    }
                    return false;
                });
            });

            if (titleFieldName) {
                copied[titleFieldName] = `${copied[titleFieldName] ?? ''} (copy)`;
            }

            // update header title briefly
            try { setTitleContainer(`${definition.title || 'Details'} (copy)`); } catch (e) { }

            // compute create path by replacing last path segment with 'create'
            try {
                const current = (location && location.pathname) ? location.pathname.replace(/\/+$/, '') : window.location.pathname.replace(/\/+$/, '');
                const newPath = current.replace(/\/[^\/]*$/, '/create');
                // navigate to create route and pass prefill in state
                navigate(newPath, { state: { prefill: copied } });
            } catch (e) {
                // fallback: write to sessionStorage and navigate to 'create'
                try { sessionStorage.setItem('detailsFormPrefill', JSON.stringify(copied)); } catch (err) { }
                navigate('create');
            }

            // set local values and enable editing so user sees the copied values immediately
            setValues(copied);
            setEditing(true);
        } catch (e) {
            // fallback: copy JSON to clipboard for manual paste
            try {
                await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
                alert('Form JSON copied to clipboard');
            } catch (err) {
                console.warn('copy failed', err);
            }
        }
    };

    const handleToggleEdit = () => setEditing((e) => !e);



    const handleSubmit = async (e) => {
        const validateForm = () => {
            const missing = [];
            const topInvalid = {};
            (definition.sections || []).forEach((sec) => {
                (sec.fields || []).forEach((f) => {
                    const val = values[f.name];
                    if (f.required && f.type !== 'table') {
                        const empty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0);
                        if (empty) {
                            missing.push(f.label || f.name);
                            topInvalid[f.name] = true;
                        }
                    }
                    if (f.type === 'table') {
                        const cols = f.table?.columns || [];
                        const rows = values[f.name] || [];
                        cols.forEach((col) => {
                            if (col.required) {
                                rows.forEach((row, idx) => {
                                    const cell = row[col.name];
                                    const emptyCell = cell === undefined || cell === null || (typeof cell === 'string' && cell.trim() === '');
                                    if (emptyCell) missing.push(`${col.label || col.name} (row ${idx + 1})`);
                                });
                            }
                        });
                    }
                });
            });
            if (missing.length) {
                // mark top-level invalid fields so UI shows errors
                setInvalidFields(topInvalid);
                // scroll to first section that contains a required error
                const firstInvalidSection = (() => {
                    const secs = (definition.sections || []);
                    for (const sec of secs) {
                        const fields = sec.fields || [];
                        // check non-table fields
                        for (const f of fields) {
                            if (f.type !== 'table') {
                                const val = values[f.name];
                                if (f.required) {
                                    const empty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0);
                                    if (empty) return sec.key;
                                }
                            } else {
                                // table: check required columns
                                const cols = f.table?.columns || [];
                                const rows = values[f.name] || [];
                                for (const col of cols) {
                                    if (!col.required) continue;
                                    for (const row of rows) {
                                        const cell = row[col.name];
                                        const emptyCell = cell === undefined || cell === null || (typeof cell === 'string' && cell.trim() === '');
                                        if (emptyCell) return sec.key;
                                    }
                                }
                            }
                        }
                    }
                    return null;
                })();

                if (firstInvalidSection) handleScrollTo(firstInvalidSection);
                showError(`Please fill required fields`);
                return false;
            }
            // clear previous top-level invalid markers
            setInvalidFields({});
            return true;
        };

        e?.preventDefault?.();
        showLoader();
        try {
            if (!validateForm()) {
                hideLoader();
                return;
            }

            if (onSubmit) return await onSubmit(values);

            const payload = { table: definition.tablename, data: values };
            if (payload.data == null) throw new Error('No form data');
            if (payload.data.id === undefined || payload.data.id === null || (payload.data.id === "" || payload.data.id == 0)) {
                delete payload.data.id;
                const res = await httpClient.insertForm(payload);
                if (res.data?.error === false && res.data?.statusCode === 200) showSuccess("Created successfully");
                else showError(res.data?.message || "Failed to create");
            } else {
                payload.id = parseInt(payload.data.id, 10);
                const res = await httpClient.updateForm(payload);
                if (res.data?.error === false && res.data?.statusCode === 200) showSuccess("Updated successfully");
                else showError(res.data?.message || "Failed to update");
            }
        } catch (err) {
            showError(err?.response?.data?.message || err.message || "Failed to submit form");
            throw err;
        } finally {
            hideLoader();
        }
    };

    return (
        <Box>
            <Paper elevation={0} sx={(theme) => ({ mb: 2, p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--darkMedium)', color: theme.palette.primary.contrastText })}>
                <Typography variant="h6" sx={{ color: 'inherit' }}>{definition.title || 'Details'}</Typography>
                <Box>
                    <Button variant="text" onClick={handleCancel} startIcon={<ArrowBackIcon />} sx={{ mr: 1, color: 'inherit' }}>Back</Button>
                    {submitLabel !== "Create" && (
                        <Button variant="text" onClick={handleCopy} startIcon={<ContentCopyIcon />} sx={{ mr: 1, color: 'var(--onPrimary)', borderColor: 'var(--onPrimary)' }}>Copy</Button>
                    )}

                    {submitLabel !== "Create" && (
                        <Button
                            variant={editing ? "text" : "contained"}
                            onClick={handleToggleEdit}
                            startIcon={editing ? <CancelIcon /> : <EditIcon />}
                            sx={{ mr: 1, color: 'var(--onPrimary)', borderColor: 'var(--onPrimary)', ...(editing ? {} : { border: '1px solid var(--onPrimary)' }) }}
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                    )}

                    {(editing || submitLabel === "Create") && (
                        <Button variant="contained" onClick={handleSubmit} startIcon={<SaveIcon />} sx={{ color: 'var(--onPrimary)', borderColor: 'var(--onPrimary)', border: '1px solid var(--onPrimary)' }}>{submitLabel}</Button>
                    )}
                </Box>
            </Paper>

            <Box sx={{ display: 'flex', gap: 2 }}>
                <Box sx={{ flex: 1 }} component="form" onSubmit={handleSubmit}>
                    {(definition.sections || []).map((sec) => (
                        <Paper key={sec.key} sx={{ p: 3, mb: 2 }} ref={(el) => (refs.current[sec.key] = el)}>
                            <Typography variant="h6" sx={{ mb: 2 }}>{sec.title}</Typography>
                            {(() => {
                                const rows = [];
                                let current = [];
                                let currentSum = 0;
                                const fields = sec.fields || [];
                                for (const f of fields) {
                                    const isFull = f.fullWidth || f.type === 'textarea' || f.type === 'table';
                                    const mdUnits = isFull ? 12 : (f.col || 4);
                                    if (isFull) {
                                        if (current.length) {
                                            rows.push(current);
                                            current = [];
                                            currentSum = 0;
                                        }
                                        rows.push([{ field: f, mdUnits, isFull }]);
                                    } else {
                                        if (currentSum + mdUnits > 12) {
                                            rows.push(current);
                                            current = [];
                                            currentSum = 0;
                                        }
                                        current.push({ field: f, mdUnits, isFull });
                                        currentSum += mdUnits;
                                    }
                                }
                                if (current.length) rows.push(current);

                                return rows.map((row, rIdx) => (
                                    <Box key={rIdx} sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                                        {row.map((cell) => (
                                            <Box
                                                key={cell.field.name}
                                                sx={(theme) => ({
                                                    boxSizing: 'border-box',
                                                    p: 0,
                                                    pr: 1,
                                                    flex: '0 0 100%',
                                                    [theme.breakpoints.up('sm')]: {
                                                        flex: `0 0 ${cell.isFull ? '100%' : '50%'}`,
                                                    },
                                                    [theme.breakpoints.up('md')]: {
                                                        flex: `0 0 ${cell.isFull ? '100%' : '33.3333%'}`,
                                                    },
                                                    [theme.breakpoints.up('lg')]: {
                                                        flex: `0 0 ${cell.isFull ? '100%' : '25%'}`,
                                                    },
                                                })}
                                            >
                                                {renderField(cell.field, values[cell.field.name], handleChange)}
                                            </Box>
                                        ))}
                                    </Box>
                                ));
                            })()}
                        </Paper>
                    ))}
                </Box>

                <Box sx={{ width: 220 }}>
                    <Paper sx={{ position: "sticky", top: 125, p: 1 }}>
                        <List>
                            {(definition.sections || []).map((sec) => (
                                <ListItemButton key={sec.key} selected={activeSection === sec.key} sx={{ p: 1 }} onClick={() => handleScrollTo(sec.key)}>
                                    <ListItemText primary={sec.title} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
}
