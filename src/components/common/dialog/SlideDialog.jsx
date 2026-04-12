import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Slide from '@mui/material/Slide';

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

export default function SlideDialog({
    open,
    onClose,
    title,
    children,
    onSubmit,
    submitLabel = "Save",
    cancelLabel = "Cancel",
}) {
    const theme = useTheme();
    // const fullScreen = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Dialog
            // fullScreen={fullScreen}
            open={open}
            slots={{
                transition: Transition,
            }}
            keepMounted
            onClose={onClose}
            aria-labelledby="alert-dialog-slide-description"
            fullWidth
            maxWidth="md"
            sx={{
                "& .MuiDialog-paper": {
                    width: "680px",
                    // maxWidth: "95%",
                    borderRadius: 2,
                    overflow: "hidden",
                    border: "1px solid rgba(148, 163, 184, 0.18)",
                    background: "linear-gradient(180deg, #ffffff 0%, var(--primaryLight) 100%)",
                    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.18)",
                },
            }}
        >
            <DialogTitle
                id="alert-dialog-slide-description"
                sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: 2.25,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    background: "linear-gradient(135deg, rgba(15,23,42,0.04) 0%, rgba(59,130,246,0.10) 100%)",
                }}
            >
                <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                    {title}
                </Typography>
            </DialogTitle>

            <DialogContent
                sx={{
                    px: { xs: 2.5, sm: 3 },
                    py: 3,
                    backgroundColor: "rgba(248, 250, 252, 0.52)",
                    minHeight: "100px",
                    width: "100%",
                    "& > *": {
                        width: "100%",
                    },
                }}
            >
                {children}
            </DialogContent>

            <DialogActions
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: 2,
                    borderTop: "1px solid",
                    borderColor: "divider",
                    backgroundColor: "rgba(255,255,255,0.92)",
                }}
            >
                <Button
                    variant="outlined"
                    onClick={onClose}
                >
                    {cancelLabel}
                </Button>
                <Button
                    variant="contained"
                    onClick={onSubmit}
                >
                    {submitLabel}
                </Button>
            </DialogActions>
        </Dialog>
    );
}