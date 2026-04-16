import { Backdrop, CircularProgress, LinearProgress, Stack, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import useCommon from "../../../hooks/useCommon";

export default function LoadingScreen() {
    const { loadingOverlay, loadingMessage, loadingProgress, loadingShowProgress } = useCommon();
    const [dots, setDots] = useState("");

    useEffect(() => {
        if (!loadingOverlay || loadingShowProgress) {
            setDots("");
            return;
        }

        const interval = setInterval(() => {
            setDots((prev) => (prev.length === 3 ? "" : prev + "."));
        }, 500);

        return () => clearInterval(interval);
    }, [loadingOverlay, loadingShowProgress]);

    return (
        <Backdrop
            open={loadingOverlay}
            sx={{
                inset: 0,
                zIndex: (theme) => theme.zIndex.modal + 100,
                color: "#fff",
            }}
        >
            <Stack alignItems="center" spacing={2} sx={{ width: "min(360px, calc(100vw - 32px))" }}>
                {loadingShowProgress ? (
                    <>
                        <Typography variant="body1" textAlign="center">
                            {loadingMessage || "Uploading files"}
                        </Typography>
                        <LinearProgress
                            variant="determinate"
                            value={loadingProgress ?? 0}
                            sx={{
                                width: "100%",
                                height: 10,
                                borderRadius: 999,
                                backgroundColor: "rgba(255, 255, 255, 0.18)",
                                "& .MuiLinearProgress-bar": {
                                    borderRadius: 999,
                                    backgroundColor: "#fff",
                                },
                            }}
                        />
                        <Typography variant="body2" textAlign="center">
                            {Math.round(loadingProgress ?? 0)}%
                        </Typography>
                    </>
                ) : (
                    <>
                        <CircularProgress size={60} color="inherit" />
                        <Typography variant="body1">
                            {loadingMessage || "Please wait"}
                            {dots}
                        </Typography>
                    </>
                )}
            </Stack>
        </Backdrop>
    );
}
