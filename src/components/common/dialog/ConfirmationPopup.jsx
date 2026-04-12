import * as React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";

export default function ConfirmationPopup({
    open,
    onClose,
    onConfirm,
    title = "Confirmation",
    message = "Are you sure you want to continue?",
    confirmLabel = "Confirm",
    cancelLabel = "Cancel",
    confirmColor = "error",
}) {
    return (
        <Dialog
            open={open}
            onClose={onClose}
            keepMounted
            TransitionComponent={Fade}
            transitionDuration={{ enter: 180, exit: 120 }}
            aria-labelledby="confirmation-popup-title"
            aria-describedby="confirmation-popup-description"
            role="alertdialog"
            fullWidth
            maxWidth="md"
            sx={{
                "& .MuiDialog-paper": {
                    width: "650px",
                    maxWidth: "95%",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 20px 60px rgba(15, 23, 42, 0.35)",
                    border: "1px solid rgba(148, 163, 184, 0.25)",
                    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                    transition: "box-shadow 140ms ease-out",
                },
            }}
        >
            <DialogTitle
                id="confirmation-popup-title"
                sx={{
                    py: 2.2,
                    px: 3,
                    borderBottom: "1px solid rgba(148, 163, 184, 0.2)",
                    background: "linear-gradient(90deg, rgba(248,250,252,1) 0%, rgba(241,245,249,1) 100%)",
                }}
            >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 34,
                            height: 34,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: "50%",
                            background: "rgba(239, 68, 68, 0.12)",
                            color: "#dc2626",
                        }}
                    >
                        <WarningAmberRoundedIcon sx={{ fontSize: 20 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: 20, color: "#0f172a" }}>
                        {title}
                    </Typography>
                </Box>
            </DialogTitle>
            <DialogContent>
                <DialogContentText
                    id="confirmation-popup-description"
                    sx={{
                        mt: 1,
                        fontSize: 15.5,
                        lineHeight: 1.7,
                        color: "#334155",
                    }}
                >
                    {message}
                </DialogContentText>
            </DialogContent>
            <DialogActions
                sx={{
                    px: 3,
                    pb: 2.4,
                    pt: 1.2,
                    borderTop: "1px solid rgba(148, 163, 184, 0.16)",
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    sx={{
                        px: 2.2,
                        fontWeight: 600,
                        color: "#334155",
                        borderColor: "rgba(148, 163, 184, 0.4)",
                        "&:hover": {
                            background: "rgba(15, 23, 42, 0.04)",
                        },
                    }}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    color={confirmColor}
                    onClick={onConfirm}
                    autoFocus
                    sx={{
                        px: 2.4,
                        fontWeight: 700,
                        boxShadow: "0 8px 18px rgba(239, 68, 68, 0.3)",
                        transition: "transform 0.18s ease, box-shadow 0.18s ease",
                        "&:hover": {
                            transform: "translateY(-1px)",
                            boxShadow: "0 12px 22px rgba(239, 68, 68, 0.34)",
                        },
                    }}
                >
                    {confirmLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
