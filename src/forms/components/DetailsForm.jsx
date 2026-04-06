import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    Box,
    Paper,
    List,
    ListItemButton,
    ListItemText,
    Typography
} from "@mui/material";
import useCommon from "../../hooks/useCommon";
import { httpClient } from "../../apiClient/httpClient";
import axiosInstance from "../../apiClient/axiosInstance";
import FormHeader from "./FormHeader";
import createHeaderHandlers from "./HeaderHandle";
import FormSection from "./FormSection";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

export default function DetailsForm({ definition = {}, initialValues = {}, id, onSubmit, submitLabel = "Save", initialEditing = false, onFieldChange, onLoad }) {
    const { setTitleContainer, showSuccess, showError, showLoader, hideLoader } = useCommon();
    const [values, setValues] = useState(initialValues || {});
    const [resolvedInitialValues, setResolvedInitialValues] = useState(initialValues || {});
    const [invalidFields, setInvalidFields] = useState({});
    const [tableState, setTableState] = useState({});
    const [optionsCache, setOptionsCache] = useState({});
    const [optionsLoading, setOptionsLoading] = useState({});
    const searchTimers = useRef({});
    const [currentSubmitLabel, setSubmitLabel] = useState(submitLabel);
    const [editing, setEditing] = useState(submitLabel === "Create" || !!initialEditing);
    const [saveKey, setSaveKey] = useState(0);
    const [activeSection, setActiveSection] = useState(definition.sections?.[0]?.key);
    const refs = useRef({});
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        setTitleContainer(definition.title || "Details");
        if (currentSubmitLabel === "Create") setEditing(true);
    }, [definition.title, setTitleContainer, currentSubmitLabel]);

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
            // showLoader();
            // prefer navigation state prefill or sessionStorage if present (create from copy)
            const navPrefill = (location && location.state && location.state.prefill) ? location.state.prefill : null;
            let stored = null;
            try { stored = sessionStorage.getItem('detailsFormPrefill'); stored = stored ? JSON.parse(stored) : null; } catch (e) { stored = null; }

            const sourceData = navPrefill || stored || initialValues || {};
            // setValues(buildInitialValues(definition, sourceData || {}));
            // if we used sessionStorage prefill, clear it so it does not persist
            if (stored) { try { sessionStorage.removeItem('detailsFormPrefill'); } catch (e) { } }
        } finally {
            // hideLoader();
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
        setValues((v) => ({ ...v, [name]: value }));
        onFieldChange?.(name, value);
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
                case 'qb_topics':
                    res = await httpClient.fetchQbTopics();
                    break;
                case 'qb_sections':
                    res = await httpClient.fetchQbSections();
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

    const handleScrollTo = (key) => {
        const el = refs.current[key];
        if (el) {
            const header = document.querySelector('header, .app-header, .MuiAppBar-root');
            const headerHeight = 175; //header ? header.getBoundingClientRect().height : 96;
            const rectTop = el.getBoundingClientRect().top + window.pageYOffset;
            const target = Math.max(0, rectTop - headerHeight - 8);
            window.scrollTo({ top: target, behavior: 'smooth' });
        }
        setActiveSection(key);
    };

    // active section is driven by each FormSection via intersection observer

    const scrollToSection = (key) => {
        const el = refs.current[key];
        if (el && typeof el.scrollTo === 'function') {
            el.scrollTo();
        } else {
            const dom = el;
            if (dom) {
                const header = document.querySelector('header, .app-header, .MuiAppBar-root');
                const headerHeight = 117;
                const rectTop = dom.getBoundingClientRect().top + window.pageYOffset;
                const target = Math.max(0, rectTop - headerHeight - 8);
                window.scrollTo({ top: target, behavior: 'smooth' });
            }
        }
        setActiveSection(key);
    };

    /* ===== GENERIC FETCH via fetchConfig ===== */
    useEffect(() => {
        const fetchConfig = definition.fetchConfig;
        if (!fetchConfig || !id || id === "create") return;

        const load = async () => {
            showLoader();
            try {
                const res = await axiosInstance.post(fetchConfig.endpoint, {
                    table: fetchConfig.table,
                    joins: fetchConfig.joins ?? [],
                    subJoins: fetchConfig.subJoins ?? {},
                    where: { id: Number(id) },
                });
                const data =
                    res?.data?.data ||
                    res?.data?.response?.data?.[0] ||
                    res?.data?.response?.data ||
                    res?.data?.response ||
                    {};
                const record = Array.isArray(data) ? data[0] ?? {} : data;
                setResolvedInitialValues(record);
                const built = buildInitialValues(definition, record);
                setValues(built);
                onLoad?.(built);
            } catch (err) {
                showError(err?.message || "Failed to load data");
            } finally {
                hideLoader();
            }
        };

        load();
    }, [id, definition.fetchConfig]);

    const { handleCancel, handleCopy, handleToggleEdit, handleSubmit } = createHeaderHandlers({
        navigate,
        location,
        values,
        setValues,
        setEditing,
        setTitleContainer,
        showLoader,
        hideLoader,
        showError,
        showSuccess,
        definition,
        initialValues: resolvedInitialValues,
        setInvalidFields,
        handleScrollTo: scrollToSection,
        onSubmit,
        setSubmitLabel,
        onAfterSave: () => setSaveKey((k) => k + 1),
    });

    return (
        <Box sx={{ mt: 0 }}>
            <Box sx={{ position: "sticky", top: 110, zIndex: 100, boxShadow: '0 2px 0px rgba(0,0,0,0.15)' }}>
                <FormHeader
                    definition={definition}
                    submitLabel={currentSubmitLabel}
                    editing={editing}
                    onToggleEdit={handleToggleEdit}
                    onCancel={handleCancel}
                    onCopy={handleCopy}
                    onSubmit={handleSubmit}
                />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: { xs: 1, sm: 2 }, mt: { xs: 0.25, sm: 1.25 }, width: '100%', minWidth: 0 }}>
                <Box sx={{ flex: 1, minWidth: 0, width: '100%' }} component="form" onSubmit={handleSubmit}>
                    {(definition.sections || []).map((sec) => (
                        <FormSection
                            key={sec.key}
                            ref={(el) => (refs.current[sec.key] = el)}
                            section={sec}
                            values={values}
                            recordId={id}
                            handleChange={handleChange}
                            editing={editing}
                            invalidFields={invalidFields}
                            setInvalidFields={setInvalidFields}
                            optionsCache={optionsCache}
                            optionsLoading={optionsLoading}
                            handleSearchInput={handleSearchInput}
                            fetchOptionsForSource={fetchOptionsForSource}
                            resolveOptionLabel={resolveOptionLabel}
                            showError={showError}
                            saveKey={saveKey}
                        />
                    ))}
                </Box>

                <Box
                    sx={{
                        width: { xs: '100%', lg: 240 },
                        minWidth: 0,
                        position: { xs: 'static', lg: 'sticky' },
                        top: { lg: 185 },
                        alignSelf: "flex-start",
                        order: { xs: -1, lg: 0 },
                    }}
                >
                    <Box sx={{ display: { xs: 'none', lg: 'flex' }, flexDirection: { xs: 'row', lg: 'column' }, gap: 1, overflowX: { xs: 'auto', lg: 'visible' }, pb: { xs: 0.5, lg: 0 } }}>
                        {(definition.sections || []).map((sec) => {
                            const isActive = activeSection === sec.key;

                            return (
                                <Paper
                                    key={sec.key}
                                    onClick={() => handleScrollTo(sec.key)}
                                    elevation={isActive ? 3 : 0}
                                    sx={{
                                        flex: { xs: '0 0 auto', lg: 'initial' },
                                        minWidth: { xs: 160, lg: 'auto' },
                                        p: 1.2,
                                        borderRadius: 2.5,
                                        cursor: "pointer",
                                        border: isActive
                                            ? "1px solid var(--primary)"
                                            : "1px solid #eee",
                                        background: isActive ? "var(--primaryLight)" : "#fff",

                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "space-between",
                                        gap: 1,

                                        // ✨ Hover
                                        "&:hover": {
                                            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                                            transform: "translateY(-2px)",
                                        },

                                        transition: "all 0.25s ease",
                                    }}
                                >
                                    {/* Title */}
                                    <Box>
                                        <Typography
                                            sx={{
                                                fontSize: 13.5,
                                                fontWeight: isActive ? 600 : 500,
                                                color: isActive
                                                    ? "var(--primary)"
                                                    : "text.primary",
                                            }}
                                        >
                                            {sec.title}
                                        </Typography>
                                    </Box>

                                    {/* Arrow */}
                                    <Box
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            color: isActive
                                                ? "var(--primary)"
                                                : "text.secondary",
                                            transition: "all 0.2s ease",
                                        }}
                                    >
                                        {isActive ? (
                                            <ExpandLessIcon fontSize="small" />
                                        ) : (
                                            <ExpandMoreIcon fontSize="small" />
                                        )}
                                    </Box>
                                </Paper>
                            );
                        })}
                    </Box>
                </Box>
            </Box>
        </Box >
    );
}
