import React from "react";
import { Avatar, IconButton, Stack } from "@mui/material";
import PhotoCameraIcon from "@mui/icons-material/PhotoCamera";

export default function ProfileAvatar({ value, onChange }) {
    const handleUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const preview = URL.createObjectURL(file);
        onChange({ file, preview });
    };

    return (
        <Stack alignItems="center" spacing={1}>
            <Avatar
                src={value?.preview}
                sx={{ width: 84, height: 84 }}
            />
            <IconButton component="label" size="small">
                <PhotoCameraIcon fontSize="small" />
                <input hidden type="file" accept="image/*" onChange={handleUpload} />
            </IconButton>
        </Stack>
    );
}
