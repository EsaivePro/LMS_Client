import React, { useRef, useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { uploadFile } from "../../../services/StorageProvider";
import { httpClient } from "../../../apiClient/httpClient";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

export default function FileUploadFormField({ field, value, formValues, onChange, editing, invalidFields, setInvalidFields, showError }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    // Tracks display info for the most recently uploaded file in this session
    const [uploadedFile, setUploadedFile] = useState(null); // { name, path }

    const existingImageName = formValues?.["imageurl"];
    const displayName = uploadedFile?.name ?? (existingImageName ? existingImageName : value ? `File #${value}` : "");
    const previewUrl = uploadedFile?.path ?? null;
    const showImagePreview = typeof field.accept === "string" && field.accept.includes("image/");

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setUploading(true);
        try {
            const uploadPath = field.uploadPath || "uploads/forms";
            const safeFileName = `${Date.now()}-${file.name}`;
            const storageResponse = await uploadFile({
                file,
                key: `${uploadPath}/${safeFileName}`
            });

            if (!storageResponse?.path) throw new Error("No file path returned from upload");

            const extension = file.name.includes(".") ? file.name.split(".").pop() : null;
            const fileType = file.type ? file.type.split("/")[0] : null;

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

            if (value) {
                // Update existing upload_files record
                await httpClient.updateForm({
                    table: "upload_files",
                    id: value,
                    data: fileRecord,
                });
                fileId = value;
            } else {
                // Insert new upload_files record
                const res = await httpClient.insertForm({
                    table: "upload_files",
                    data: fileRecord,
                });
                fileId =
                    res.data?.data?.id ??
                    res.data?.response?.id ??
                    res.data?.data?.insertId ??
                    res.data?.insertId ??
                    null;
                if (!fileId) throw new Error("No file ID returned after insert");
            }

            setUploadedFile({ name: file.name, path: storageResponse.path });
            onChange(field.name, fileId);
            onChange("imageurl", file.name);
            clearInvalid(field.name, setInvalidFields);
        } catch (error) {
            showError?.(field.uploadErrorMessage || "File upload failed");
            console.error("File upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <Stack spacing={1.25} sx={{ width: "100%" }}>
            <TextField
                {...commonProps}
                label={buildLabel(field)}
                value={displayName}
                placeholder={field.placeholder || "Choose a file to upload"}
                disabled
                error={!!invalidFields[field.name]}
                InputProps={{
                    endAdornment: buildErrorAdornment(
                        !!invalidFields[field.name],
                        uploading ? <CircularProgress size={16} sx={{ color: "var(--primary)" }} /> : null
                    ),
                }}
            />

            <Stack direction="row" alignItems="center" flexWrap="wrap">
                <input
                    ref={inputRef}
                    hidden
                    type="file"
                    accept={field.accept || "*"}
                    onChange={handleFileChange}
                    disabled={!editing || !!field.readOnly || uploading}
                />

                <Button
                    variant="outlined"
                    startIcon={uploading ? <CircularProgress size={16} sx={{ color: "var(--primary)" }} /> : <UploadFileOutlinedIcon />}
                    onClick={() => inputRef.current?.click()}
                    disabled={!editing || !!field.readOnly || uploading}
                >
                    {uploading ? "Uploading..." : (field.buttonLabel || "Upload File")}
                </Button>

                {previewUrl ? (
                    <Button
                        variant="text"
                        color="inherit"
                        endIcon={<OpenInNewIcon fontSize="small" />}
                        onClick={() => setPreviewOpen(true)}
                    >
                        View File
                    </Button>
                ) : null}
            </Stack>

            <Dialog
                open={previewOpen}
                onClose={() => setPreviewOpen(false)}
                fullWidth
                maxWidth="md"
                sx={{
                    zIndex: 2600,
                    "& .MuiBackdrop-root": {
                        zIndex: -1,
                    },
                }}
                PaperProps={{
                    sx: {
                        width: "100%",
                        borderRadius: 2,
                    },
                }}
            >
                <DialogTitle sx={{ borderBottom: "1px solid", borderColor: "divider" }}>
                    {field.label || "File Preview"}
                </DialogTitle>
                <DialogContent sx={{ p: 0, backgroundColor: "#0f172a" }}>
                    {showImagePreview ? (
                        <Box
                            component="img"
                            src={previewUrl}
                            alt={displayName || field.label || "Preview"}
                            sx={{
                                width: "100%",
                                height: "70vh",
                                objectFit: "contain",
                                display: "block",
                                backgroundColor: "#0f172a",
                            }}
                        />
                    ) : (
                        <Box
                            component="iframe"
                            src={previewUrl}
                            title={displayName || field.label || "File Preview"}
                            sx={{
                                width: "100%",
                                height: "70vh",
                                border: 0,
                                backgroundColor: "#ffffff",
                            }}
                        />
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 2, py: 1.5, borderTop: "1px solid", borderColor: "divider" }}>
                    <Button onClick={() => setPreviewOpen(false)} variant="outlined">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </Stack>
    );
}