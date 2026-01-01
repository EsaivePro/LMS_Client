import { Backdrop, CircularProgress, Typography, Stack } from "@mui/material";
import { useEffect, useState } from "react";
import useCommon from "../../../hooks/useCommon";

export default function LoadingScreen() {
    const { loadingOverlay, loadingMessage } = useCommon();
    const [dots, setDots] = useState("");

    // Animate dots
    useEffect(() => {
        if (!loadingOverlay) return;

        const interval = setInterval(() => {
            setDots((prev) => (prev.length === 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, [loadingOverlay]);

    return (
        <Backdrop
            sx={{
                color: "var(--onPrimary)",
                zIndex: (theme) => theme.zIndex.drawer + 1000,
            }}
            open={loadingOverlay}
        >
            <Stack alignItems="center" spacing={2}>
                <CircularProgress size={60} color="inherit" />

                <Typography variant="body1" sx={{ letterSpacing: 0.5 }}>
                    {loadingMessage || "Please wait"}
                    {dots}
                </Typography>
            </Stack>
        </Backdrop>
    );
}
