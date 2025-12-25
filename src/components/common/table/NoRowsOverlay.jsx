import React from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import InboxIcon from "@mui/icons-material/Inbox";

export default function NoRowsOverlay({
    title,
    subtitle,
}) {
    return (
        <Box
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                opacity: 0.7,
                textAlign: "center",
                px: 2,
            }}
        >
            <InboxIcon sx={{ fontSize: 60, color: "grey.500" }} />
            <Typography variant="h6" mt={1} color="text.secondary">
                {title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {subtitle}
            </Typography>
        </Box>
    );
}
