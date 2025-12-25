import React from "react";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import useCommon from "../../../hooks/useCommon";

// Slide-up animation
function SlideUp(props) {
    return <Slide {...props} direction="up" />;
}

const Alert = React.forwardRef(function Alert(props, ref) {
    return (
        <MuiAlert
            ref={ref}
            elevation={6}
            variant="filled"
            {...props}
        />
    );
});

export default function GlobalAlert() {
    const { alert, clearAlerts } = useCommon();

    return (
        <Snackbar
            open={alert.open}
            autoHideDuration={5000}
            onClose={clearAlerts}
            TransitionComponent={SlideUp}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            sx={{ mb: 1 }}
        >
            <Alert
                severity={alert.type}
                sx={{
                    borderRadius: 1,
                    px: 3,
                    py: 1.2,
                    minWidth: 260,
                    textAlign: "center",
                    color: "#fff",
                    // Custom background colors
                    backgroundColor: "#2d2d2dff",
                    fontWeight: 500,
                    letterSpacing: 0.3,
                }}
            >
                {alert.message}
            </Alert>
        </Snackbar>
    );
}
