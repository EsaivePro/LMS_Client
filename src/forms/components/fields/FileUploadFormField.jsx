import React, { useRef, useState } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, TextField } from "@mui/material";
import UploadFileOutlinedIcon from "@mui/icons-material/UploadFileOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

export default function FileUploadFormField({ field, value, formValues, onChange, editing, invalidFields, setInvalidFields }) {
    const inputRef = useRef(null);
    const [previewOpen, setPreviewOpen] = useState(false);
    // Tracks display info for the most recently uploaded file in this session
    const [uploadedFile, setUploadedFile] = useState(null); // { name, path }

    const existingImageName = formValues?.["imageurl"];
    const displayName = uploadedFile?.name ?? (existingImageName ? existingImageName : value ? `File #${value}` : "");
    const previewUrl = uploadedFile?.path ?? null;
    const showImagePreview = typeof field.accept === "string" && field.accept.includes("image/");

    const handleFileChange = (event) => {
        const file = event.target.files?.[0];
        event.target.value = "";
        if (!file) return;

        // Capture the current saved id (null for new records) before overwriting
        const existingId = value && typeof value !== "object" ? value : null;

        // Store file locally for display — actual upload happens on submit
        setUploadedFile({ name: file.name, path: null });

        // Signal a pending upload to the form; handleSubmit will process it
        onChange(field.name, { __pendingFile: file, existingId, fieldConfig: field });
        onChange("imageurl", file.name);

        // Extract video duration if the file is a video
        if (file.type.startsWith("video/")) {
            const url = URL.createObjectURL(file);
            const video = document.createElement("video");
            video.preload = "metadata";
            video.onloadedmetadata = () => {
                URL.revokeObjectURL(url);
                const totalSeconds = Math.floor(video.duration);
                const h = Math.floor(totalSeconds / 3600);
                const m = Math.floor((totalSeconds % 3600) / 60);
                const s = totalSeconds % 60;
                const formatted = h > 0
                    ? `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
                    : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
                onChange("duration_formate", formatted);
                onChange("duration", totalSeconds);
            };
            video.src = url;
        }

        clearInvalid(field.name, setInvalidFields);
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
                    endAdornment: buildErrorAdornment(!!invalidFields[field.name]),
                }}
            />

            <Stack direction="row" alignItems="center" flexWrap="wrap">
                <input
                    ref={inputRef}
                    hidden
                    type="file"
                    accept={field.accept || "*"}
                    onChange={handleFileChange}
                    disabled={!editing || !!field.readOnly}
                />

                <Button
                    variant="outlined"
                    startIcon={<UploadFileOutlinedIcon />}
                    onClick={() => inputRef.current?.click()}
                    disabled={!editing || !!field.readOnly}
                >
                    {field.buttonLabel || "Upload File"}
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