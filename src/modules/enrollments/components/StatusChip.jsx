import React from "react";
import { Chip } from "@mui/material";

const STATUS_CONFIG = {
  active:     { label: "Active",      color: "#2e7d32", bg: "#e8f5e9" },
  inprogress: { label: "In Progress", color: "#1565c0", bg: "#e3f2fd" },
  completed:  { label: "Completed",   color: "#6a1b9a", bg: "#f3e5f5" },
  expired:    { label: "Expired",     color: "#c62828", bg: "#ffebee" },
  scheduled:  { label: "Scheduled",   color: "#e65100", bg: "#fff3e0" },
  pending:    { label: "Pending",     color: "#827717", bg: "#f9fbe7" },
  revoked:    { label: "Revoked",     color: "#424242", bg: "#f5f5f5" },
};

export default function StatusChip({ status, size = "small" }) {
  const key = status?.toLowerCase();
  const cfg = STATUS_CONFIG[key] ?? { label: status ?? "Unknown", color: "#616161", bg: "#f5f5f5" };
  return (
    <Chip
      label={cfg.label}
      size={size}
      sx={{
        bgcolor: cfg.bg,
        color: cfg.color,
        fontWeight: 600,
        fontSize: size === "small" ? "0.68rem" : "0.78rem",
        border: `1px solid ${cfg.color}33`,
        height: size === "small" ? 22 : 28,
      }}
    />
  );
}
