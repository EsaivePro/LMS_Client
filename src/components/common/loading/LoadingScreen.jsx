import { Backdrop, CircularProgress, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import useCommon from "../../../hooks/useCommon";

export default function LoadingScreen() {
    const { loadingOverlay, loadingMessage } = useCommon();
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (!loadingOverlay) return;

        const interval = setInterval(() => {
            setDots((prev) => (prev.length === 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, [loadingOverlay]);

    return (
        <Backdrop
            open={loadingOverlay}
            disablePortal
            sx={{
                position: "fixed",   // ⬅️ important
                inset: 0,
                zIndex: (theme) => theme.zIndex.modal + 100, // ⬅️ ABOVE dialog
                color: "#fff",
            }}
        >
            <Stack alignItems="center" spacing={2}>
                <CircularProgress size={60} color="inherit" />
                <Typography variant="body1">
                    {loadingMessage || "Please wait"}
                    {dots}
                </Typography>
            </Stack>
        </Backdrop>
    );
}
