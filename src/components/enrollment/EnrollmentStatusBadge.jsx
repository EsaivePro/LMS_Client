import React from "react";
import { Chip } from "@mui/material";

const STATUS_MAP = {
    active:     { label: "Active",      bg: "#4caf50" },
    inprogress: { label: "In Progress", bg: "#2196f3" },
    completed:  { label: "Completed",   bg: "#009688" },
    revoked:    { label: "Revoked",     bg: "#f44336" },
    expired:    { label: "Expired",     bg: "#ff9800" },
    pending:    { label: "Pending",     bg: "#9e9e9e" },
    scheduled:  { label: "Scheduled",  bg: "#9c27b0" },
    deleted:    { label: "Deleted",     bg: "#424242" },
};

export default function EnrollmentStatusBadge({ status }) {
    const cfg = STATUS_MAP[status?.toLowerCase()] ?? { label: status ?? "Unknown", bg: "#9e9e9e" };
    return (
        <Chip
            label={cfg.label}
            size="small"
            sx={{ bgcolor: cfg.bg, color: "white", fontWeight: 600, fontSize: 11 }}
        />
    );
}
