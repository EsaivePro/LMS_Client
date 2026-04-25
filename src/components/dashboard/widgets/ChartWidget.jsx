import React from "react";
import { Box, Typography } from "@mui/material";

export default function ChartWidget({ title }) {
    return (
        <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">{title || "Chart"}</Typography>
        </Box>
    );
}
