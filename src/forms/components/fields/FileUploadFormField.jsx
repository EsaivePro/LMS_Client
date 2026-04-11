import React, { useMemo, useRef, useState } from "react";
import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { presignAndUploadFile } from "../../../services/awscloud/S3Services";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

const getDisplayName = (value) => {
    if (!value) return "";

    try {
        const url = new URL(value);
        const pathname = url.pathname || "";
        return decodeURIComponent(pathname.split("/").pop() || value);
    } catch {
        return String(value).split("/").pop() || String(value);
    }
};

const isImageFile = (value, accept) => {
    if (!value) return false;
    if (typeof accept === "string" && accept.includes("image/")) return true;
    return /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(value);
};

export default function FileUploadFormField({ field, value, onChange, editing, invalidFields, setInvalidFields, showError }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);

    const displayName = useMemo(() => getDisplayName(value), [value]);
    const showImagePreview = useMemo(() => isImageFile(value, field.accept), [value, field.accept]);

    const handleFileChange = async (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        setUploading(true);
        try {
            const uploadPath = field.uploadPath || "uploads/forms";
            const safeFileName = `${Date.now()}-${file.name}`;
            const { cdnUrl } = await presignAndUploadFile({
                file,
                key: `${uploadPath}/${safeFileName}`,
            });

            onChange(field.name, cdnUrl);
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

                {value ? (
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
                            src={value}
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
                            src={value}
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