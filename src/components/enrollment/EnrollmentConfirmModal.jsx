import React from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography,
} from "@mui/material";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

export default function EnrollmentConfirmModal({
    open,
    title,
    description,
    onConfirm,
    onCancel,
    confirmText = "Confirm",
    confirmDanger = false,
    loading = false,
}) {
    return (
        <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                {confirmDanger && <WarningAmberIcon color="error" />}
                {title}
            </DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary">
                    {description}
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button variant="outlined" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color={confirmDanger ? "error" : "primary"}
                    onClick={onConfirm}
                    disabled={loading}
                >
                    {loading ? "Processing…" : confirmText}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
