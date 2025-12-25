import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
export default function ShowPopup({
    open,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = "Save",
    cancelLabel = "Cancel",
}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Dialog
            fullScreen={fullScreen}
            open={open}
            onClose={onClose}
            aria-labelledby="alert-dialog-slide-description"
            fullWidth
            maxWidth="md"
            sx={{
                "& .MuiDialog-paper": {
                    width: "650px",   // You can increase this
                    maxWidth: "95%",  // Prevent overflow
                },
            }}
        >
            <DialogTitle id="alert-dialog-slide-description">{title}</DialogTitle>

            <DialogContent>
                {children}
            </DialogContent>

            <DialogActions>
                <Button onClick={onClose}>{cancelLabel}</Button>
                <Button variant="contained" onClick={onSubmit}>
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}