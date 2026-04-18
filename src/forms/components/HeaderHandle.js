import { httpClient } from "../../apiClient/httpClient";
import { uploadFile } from "../../services/StorageProvider";
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
    valuesRef,
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

        // Always read the latest values via ref to avoid stale closure issues
        let currentValues = valuesRef?.current ?? values;

        // Validate first — before showLoader so React batching doesn't collapse loader
        const { valid, invalidFields } = validateFormValues(definition, currentValues);
        if (!valid) {
            setInvalidFields(invalidFields);
            const section = findFirstInvalidSection(definition, currentValues);
            if (section) handleScrollTo(section);
            showError("Please fill required fields");
            return;
        }
        setInvalidFields({});

        showLoader();
        try {
            // Process any pending file uploads before building the payload
            const pendingFileKeys = Object.keys(currentValues).filter(
                (k) => currentValues[k]?.__pendingFile
            );
            if (pendingFileKeys.length > 0) {
                const totalPendingFiles = pendingFileKeys.length;
                const updateUploadProgress = (fileIndex, filePercent = 0) => {
                    const safePercent = Number.isFinite(Number(filePercent))
                        ? Math.max(0, Math.min(100, Math.round(Number(filePercent))))
                        : 0;
                    const overallProgress = Math.round(
                        ((fileIndex * 100) + safePercent) / totalPendingFiles
                    );

                    showLoader({
                        message: `Uploading file ${fileIndex + 1} of ${totalPendingFiles}`,
                        progress: overallProgress,
                        showProgress: true,
                    });
                };

                let resolvedValues = { ...currentValues };
                for (const [fileIndex, fieldName] of pendingFileKeys.entries()) {
                    const { __pendingFile: file, existingId, fieldConfig } = currentValues[fieldName];
                    const uploadPath = fieldConfig?.uploadPath || "uploads/forms";
                    const safeFileName = `${Date.now()}-${file.name}`;
                    const fileType = file.type ? file.type.split("/")[0] : null;
                    updateUploadProgress(fileIndex, 0);
                    const storageResponse = await uploadFile({
                        file,
                        key: `${uploadPath}/${safeFileName}`,
                        onProgress: (filePercent) => updateUploadProgress(fileIndex, filePercent),
                        fileType,
                    });
                    if (!storageResponse?.path) throw new Error("No file path returned from upload");

                    const extension = file.name.includes(".") ? file.name.split(".").pop() : null;
                    const fileRecord = {
                        file_name: safeFileName,
                        location: storageResponse.path,
                        mime_type: file.type || null,
                        file_type: fileType,
                        extension: extension,
                        file_size: file.size || null,
                        file_path: storageResponse.path,
                        file_module: uploadPath,
                        is_public: true,
                        status: "active",
                    };

                    let fileId = null;
                    if (existingId) {
                        await httpClient.updateForm({ table: "upload_files", id: existingId, data: fileRecord });
                        fileId = existingId;
                    } else {
                        const res = await httpClient.insertForm({ table: "upload_files", data: fileRecord });
                        fileId =
                            res.data?.data?.id ??
                            res.data?.response?.id ??
                            res.data?.data?.insertId ??
                            res.data?.insertId ??
                            null;
                        if (!fileId) throw new Error("No file ID returned after insert");
                    }

                    resolvedValues[fieldName] = fileId;
                }

                showLoader("Saving form...");
                setValues(resolvedValues);
                currentValues = resolvedValues;
            }

            if (onSubmit) {
                await onSubmit(currentValues);
                return;
            }

            const payload = buildFormPayload(definition, currentValues);
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
