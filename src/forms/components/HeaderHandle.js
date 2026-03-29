import { httpClient } from "../../apiClient/httpClient";

export default function createHeaderHandlers({
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
    initialValues,
    setInvalidFields,
    handleScrollTo,
    onSubmit,
    setSubmitLabel,
}) {
    const handleCancel = () => {
        if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
            window.history.back();
            return;
        }
    };

    const handleCopy = async () => {
        try {
            const copied = JSON.parse(JSON.stringify(values || {}));
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

            if (titleFieldName) {
                copied[titleFieldName] = `${copied[titleFieldName] ?? ''} (copy)`;
            }

            try { setTitleContainer(`${definition.title || 'Details'} (copy)`); } catch (e) { }

            try {
                const current = (location && location.pathname) ? location.pathname.replace(/\/+$/, '') : window.location.pathname.replace(/\/+$/, '');
                const newPath = current.replace(/\/[^\/]*$/, '/create');
                navigate(newPath, { state: { prefill: copied } });
            } catch (e) {
                try { sessionStorage.setItem('detailsFormPrefill', JSON.stringify(copied)); } catch (err) { }
                navigate('create');
            }

            setValues(copied);
            setEditing(true);
        } catch (e) {
            try {
                await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
                alert('Form JSON copied to clipboard');
            } catch (err) {
                console.warn('copy failed', err);
            }
        }
    };

    const handleToggleEdit = () => setEditing((e) => !e);

    const clearEditmodeParam = () => {
        const params = new URLSearchParams(location?.search || '');
        if (params.has('editmode')) {
            params.delete('editmode');
            const search = params.toString();
            navigate(
                { pathname: location.pathname, search: search ? `?${search}` : '' },
                { replace: true }
            );
        }
    };

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
                setInvalidFields(topInvalid);
                const firstInvalidSection = (() => {
                    const secs = (definition.sections || []);
                    for (const sec of secs) {
                        const fields = sec.fields || [];
                        for (const f of fields) {
                            if (f.type !== 'table') {
                                const val = values[f.name];
                                if (f.required) {
                                    const empty = val === undefined || val === null || (typeof val === 'string' && val.trim() === '') || (Array.isArray(val) && val.length === 0);
                                    if (empty) return sec.key;
                                }
                            } else {
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
            setInvalidFields({});
            return true;
        };

        e?.preventDefault?.();

        // Validate before showLoader — if we called showLoader() here and validation
        // fails synchronously, hideLoader() would be dispatched in the same tick and
        // React 18 batching would collapse both → loader never appears.
        if (!validateForm()) return;

        showLoader();
        try {
            if (onSubmit) {
                await onSubmit(values);
                return;
            }

            const table = definition.fetchConfig?.table || definition.tablename;
            const payload = { table, data: values };
            if (payload.data == null) throw new Error('No form data');
            if (payload.data.id === undefined || payload.data.id === null || (payload.data.id === "" || payload.data.id == 0)) {
                delete payload.data.id;
                const res = await httpClient.insertForm(payload);
                if (res.data?.error === false && res.data?.statusCode === 200) {
                    showSuccess("Created successfully");
                    setEditing(false);
                    if (setSubmitLabel) setSubmitLabel("Update");
                    const newId = res.data?.data?.id ?? res.data?.response?.id ?? res.data?.data?.insertId ?? res.data?.insertId ?? null;
                    if (newId) {
                        const current = (location?.pathname || '').replace(/\/+$/, '');
                        const newPath = current.replace(/\/[^/]*$/, `/${newId}`);
                        navigate(newPath, { replace: true });
                    }
                } else showError(res.data?.message || "Failed to create");
            } else {
                payload.id = parseInt(payload.data.id, 10);
                const res = await httpClient.updateForm(payload);
                if (res.data?.error === false && res.data?.statusCode === 200) {
                    showSuccess("Updated successfully");
                    clearEditmodeParam();
                    setEditing(false);
                } else showError(res.data?.message || "Failed to update");
            }
        } catch (err) {
            showError(err?.response?.data?.message || err.message || "Failed to submit form");
        } finally {
            hideLoader();
        }
    };

    return { handleCancel, handleCopy, handleToggleEdit, handleSubmit };
}
