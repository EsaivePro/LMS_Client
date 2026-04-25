import React from "react";
import { Box, LinearProgress, Typography } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

const barColor = (pct) => {
    if (pct >= 100) return "#4caf50";
    if (pct >= 71)  return "#2196f3";
    if (pct >= 31)  return "#ff9800";
    return "#f44336";
};

export default function ProgressCell({ percent = 0, showLabel = true }) {
    const pct = Math.min(100, Math.max(0, Number(percent) || 0));
    const color = barColor(pct);

    return (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 90 }}>
            <Box sx={{ flex: 1 }}>
                <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{
                        height: 6,
                        borderRadius: 3,
                        bgcolor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": { bgcolor: color, borderRadius: 3 },
                    }}
                />
            </Box>
            {showLabel && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.25, minWidth: 42 }}>
                    {pct === 100 && <CheckCircleOutlineIcon sx={{ fontSize: 13, color }} />}
                    <Typography variant="caption" sx={{ color, fontWeight: 600, lineHeight: 1 }}>
                        {pct}%
                    </Typography>
                </Box>
            )}
        </Box>
    );
}
