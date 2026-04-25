import React from "react";
import { Box, Typography } from "@mui/material";

export default function StatWidget({ title }) {
    return (
        <Box sx={{ p: 2, textAlign: "center", color: "text.secondary" }}>
            <Typography variant="body2">{title || "Stat"}</Typography>
        </Box>
    );
}
