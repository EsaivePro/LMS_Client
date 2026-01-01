import React from "react";
import { Drawer, Box, Typography, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import RoleForm from "./RoleForm";

export default function RoleDrawer({ open, mode, roleData, onClose, onSave, existingPermissions }) {
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={onClose}
            disableEscapeKeyDown
            PaperProps={{ sx: { width: { xs: "100%", md: "40%" } } }}
            ModalProps={{ BackdropProps: { onClick: (e) => e.stopPropagation() } }}
        >
            <Box height="100%" display="flex" flexDirection="column">
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid var(--lightgrey)",
                        display: "flex",
                        justifyContent: "space-between",
                    }}
                >
                    <Typography fontWeight={700}>
                        {mode === "create" ? "Create Role" : mode === "copy" ? "Copy Role" : "Edit Role"}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box flex={1} overflow="auto">
                    <RoleForm
                        mode={mode}
                        role={roleData}
                        existingPermissions={existingPermissions}
                        onCancel={onClose}
                        onSave={onSave}
                    />
                </Box>
            </Box>
        </Drawer>
    );
}
