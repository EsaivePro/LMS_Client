import { httpClient } from "../../apiClient/httpClient";
import {
    validateFormValues,
    findFirstInvalidSection,
    buildFormPayload,
    buildCopyPayload,
} from "./formRequestBuilder";

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
    onAfterSave,
}) {
    const handleCancel = () => {
        if (typeof window !== "undefined" && window.history && window.history.length > 1) {
            window.history.back();
        }
    };

    const handleCopy = async () => {
        try {
            const copied = buildCopyPayload(definition, values);

            try { setTitleContainer(`${definition.title || "Details"} (copy)`); } catch (e) { }

            try {
                const current = (location?.pathname || "").replace(/\/+$/, "");
                const newPath = current.replace(/\/[^/]*$/, "/create");
                navigate(newPath, { state: { prefill: copied } });
            } catch (e) {
                try { sessionStorage.setItem("detailsFormPrefill", JSON.stringify(copied)); } catch (err) { }
                navigate("create");
            }

            setValues(copied);
            setEditing(true);
        } catch (e) {
            try {
                await navigator.clipboard.writeText(JSON.stringify(values, null, 2));
                alert("Form JSON copied to clipboard");
            } catch (err) {
                console.warn("copy failed", err);
            }
        }
    };

    const handleToggleEdit = () => setEditing((e) => !e);

    const clearEditmodeParam = () => {
        const params = new URLSearchParams(location?.search || "");
        if (params.has("editmode")) {
            params.delete("editmode");
            const search = params.toString();
            navigate(
                { pathname: location.pathname, search: search ? `?${search}` : "" },
                { replace: true }
            );
        }
    };

    const handleSubmit = async (e) => {
        e?.preventDefault?.();

        // Validate first — before showLoader so React batching doesn't collapse loader
        const { valid, invalidFields } = validateFormValues(definition, values);
        if (!valid) {
            setInvalidFields(invalidFields);
            const section = findFirstInvalidSection(definition, values);
            if (section) handleScrollTo(section);
            showError("Please fill required fields");
            return;
        }
        setInvalidFields({});

        showLoader();
        try {
            if (onSubmit) {
                await onSubmit(values);
                return;
            }

            const payload = buildFormPayload(definition, values);
            if (!payload.table) throw new Error("No table resolved from definition");

            if (payload.mode === "insert") {
                const res = await httpClient.insertForm({ table: payload.table, data: payload.data });
                if (res.data?.error === false && res.data?.statusCode === 200) {
                    showSuccess("Created successfully");
                    setEditing(false);
                    onAfterSave?.();
                    if (setSubmitLabel) setSubmitLabel("Update");
                    const newId =
                        res.data?.data?.id ??
                        res.data?.response?.id ??
                        res.data?.data?.insertId ??
                        res.data?.insertId ??
                        null;
                    if (newId) {
                        const current = (location?.pathname || "").replace(/\/+$/, "");
                        const newPath = current.replace(/\/[^/]*$/, `/${newId}`);
                        navigate(newPath, { replace: true });
                    }
                } else {
                    showError(res.data?.message || "Failed to create");
                }
            } else {
                const res = await httpClient.updateForm({
                    table: payload.table,
                    id: payload.id,
                    data: payload.data,
                });
                if (res.data?.error === false && res.data?.statusCode === 200) {
                    showSuccess("Updated successfully");
                    onAfterSave?.();
                    clearEditmodeParam();
                    setEditing(false);
                } else {
                    showError(res.data?.message || "Failed to update");
                }
            }
        } catch (err) {
            showError(err?.response?.data?.message || err.message || "Failed to submit form");
        } finally {
            hideLoader();
        }
    };

    return { handleCancel, handleCopy, handleToggleEdit, handleSubmit };
}
