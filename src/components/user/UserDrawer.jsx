import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import UserForm from "./UserForm";

export default function UserDrawer({ mode, user, onClose }) {
    return (
        <Box height="100%" display="flex" flexDirection="column">
            {/* Header */}
            <Box
                sx={{
                    px: 3,
                    py: 2,
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                }}
            >
                <Typography fontWeight={700}>
                    {mode === "create" ? "Create User" : "Edit User"}
                </Typography>
                <IconButton>
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <Box flex={1} overflow="auto">
                <UserForm mode={mode} user={user} onCancel={onClose} onSuccess={onClose} />
            </Box>
        </Box>
    );
}
