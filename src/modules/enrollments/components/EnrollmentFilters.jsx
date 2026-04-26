import React, { useState } from "react";
import {
  Box, TextField, InputAdornment, Chip, Stack,
  MenuItem, Select, FormControl, InputLabel, Button,
  Tooltip, Collapse, IconButton, Typography,
} from "@mui/material";
import SearchIcon     from "@mui/icons-material/Search";
import ClearIcon      from "@mui/icons-material/Clear";
import TuneIcon       from "@mui/icons-material/Tune";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BlockIcon      from "@mui/icons-material/Block";
import AssignmentIcon from "@mui/icons-material/Assignment";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CloseIcon      from "@mui/icons-material/Close";

/* ─── status config ───────────────────────────────────────────────────── */
const STATUS_OPTS = [
  { value: "",           label: "All Statuses", color: "#9e9e9e" },
  { value: "active",     label: "Active",       color: "#10b981" },
  { value: "inprogress", label: "In Progress",  color: "#3b82f6" },
  { value: "completed",  label: "Completed",    color: "#8b5cf6" },
  { value: "expired",    label: "Expired",      color: "#ef4444" },
  { value: "scheduled",  label: "Scheduled",    color: "#f59e0b" },
  { value: "pending",    label: "Pending",      color: "#6b7280" },
];

/* ─── quick chips config ──────────────────────────────────────────────── */
const QUICK_CHIPS = [
  { key: "due_soon",  label: "Due Soon",  icon: AccessTimeIcon, color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  { key: "expired",   label: "Expired",   icon: BlockIcon,      color: "#ef4444", bg: "#fff1f2", border: "#fecaca" },
  { key: "assigned",  label: "Assigned",  icon: AssignmentIcon, color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  { key: "completed", label: "Completed", icon: CheckCircleIcon,color: "#10b981", bg: "#f0fdf4", border: "#a7f3d0" },
];

/* ─── colored status dot in dropdown ─────────────────────────────────── */
function StatusDot({ color }) {
  return (
    <Box
      component="span"
      sx={{
        display:      "inline-block",
        width:        8,
        height:       8,
        borderRadius: "50%",
        bgcolor:      color,
        mr:           1,
        flexShrink:   0,
        transition:   "transform 0.15s ease",
      }}
    />
  );
}

export default function EnrollmentFilters({ filters = {}, onFilterChange, onClear }) {
  const { search = "", status = "", quick = "" } = filters;
  const isDirty = !!(search || status || quick);
  const [searchFocused, setSearchFocused] = useState(false);

  const activeStatus = STATUS_OPTS.find((o) => o.value === status);

  return (
    <Box
      sx={{
        bgcolor:      "#fff",
        borderRadius: 3,
        border:       "1px solid",
        borderColor:  searchFocused ? "primary.light" : "divider",
        p:            1.75,
        boxShadow:    searchFocused
          ? "0 0 0 3px rgba(99,102,241,0.10), 0 2px 12px rgba(0,0,0,0.06)"
          : "0 1px 6px rgba(0,0,0,0.05)",
        transition:   "border-color 0.2s ease, box-shadow 0.2s ease",
      }}
    >
      {/* ── Row 1: search + status + clear ── */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.25}
        alignItems={{ sm: "center" }}
      >
        {/* Filter label */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "text.secondary", flexShrink: 0 }}>
          <TuneIcon sx={{ fontSize: 18 }} />
          <Typography sx={{ fontSize: 13, fontWeight: 600, display: { xs: "none", md: "block" } }}>
            Filters
          </Typography>
        </Box>

        {/* Search field */}
        <TextField
          size="small"
          placeholder="Search courses, exams…"
          value={search}
          onChange={(e) => onFilterChange?.("search", e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
          sx={{
            flexGrow:  1,
            minWidth:  180,
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              transition:   "box-shadow 0.2s ease",
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.main",
                borderWidth:  1,
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "primary.light",
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon
                  fontSize="small"
                  sx={{
                    color:      searchFocused ? "primary.main" : "action.active",
                    transition: "color 0.2s ease",
                  }}
                />
              </InputAdornment>
            ),
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => onFilterChange?.("search", "")}
                  sx={{
                    p:          0.3,
                    color:      "text.disabled",
                    transition: "color 0.15s ease, transform 0.15s ease",
                    "&:hover":  { color: "error.main", transform: "scale(1.15)" },
                  }}
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        {/* Status select */}
        <FormControl size="small" sx={{ minWidth: 152 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={(e) => onFilterChange?.("status", e.target.value)}
            sx={{
              borderRadius: 2,
              "& .MuiSelect-select": { display: "flex", alignItems: "center" },
            }}
            renderValue={(val) => {
              const opt = STATUS_OPTS.find((o) => o.value === val) || STATUS_OPTS[0];
              return (
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  <StatusDot color={opt.color} />
                  {opt.label}
                </Box>
              );
            }}
          >
            {STATUS_OPTS.map((o) => (
              <MenuItem key={o.value} value={o.value} sx={{ display: "flex", alignItems: "center" }}>
                <StatusDot color={o.color} />
                {o.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Clear button — animated slide-in */}
        <Collapse in={isDirty} orientation="horizontal" unmountOnExit>
          <Tooltip title="Clear all filters">
            <Button
              size="small"
              startIcon={<ClearIcon sx={{ fontSize: "15px !important" }} />}
              onClick={onClear}
              variant="outlined"
              color="error"
              sx={{
                whiteSpace:   "nowrap",
                borderRadius: 2,
                fontSize:     13,
                fontWeight:   600,
                px:           1.5,
                borderColor:  "#fca5a5",
                color:        "error.main",
                transition:   "background-color 0.18s ease, border-color 0.18s ease",
                "&:hover": {
                  bgcolor:     "#fff1f2",
                  borderColor: "error.main",
                },
              }}
            >
              Clear
            </Button>
          </Tooltip>
        </Collapse>
      </Stack>

      {/* ── Row 2: quick filter chips ── */}
      <Collapse in={true}>
        <Box sx={{ mt: 1.25, display: "flex", flexWrap: "wrap", gap: 0.75 }}>
          {QUICK_CHIPS.map(({ key, label, icon: Icon, color, bg, border }) => {
            const isActive = quick === key;
            return (
              <Chip
                key={key}
                icon={
                  <Icon
                    sx={{
                      fontSize:   "14px !important",
                      color:      `${isActive ? "#fff" : color} !important`,
                      transition: "color 0.18s ease",
                    }}
                  />
                }
                label={label}
                size="small"
                onClick={() => onFilterChange?.("quick", isActive ? "" : key)}
                sx={{
                  bgcolor:        isActive ? color : bg,
                  color:          isActive ? "#fff" : color,
                  border:         `1px solid ${isActive ? color : border}`,
                  fontWeight:     600,
                  fontSize:       "0.76rem",
                  height:         26,
                  cursor:         "pointer",
                  transform:      isActive ? "scale(1.05)" : "scale(1)",
                  boxShadow:      isActive ? `0 2px 8px ${color}44` : "none",
                  transition:     "all 0.2s cubic-bezier(.4,0,.2,1)",
                  "&:hover": {
                    bgcolor:  isActive ? color : border,
                    boxShadow: `0 2px 8px ${color}33`,
                    transform: "scale(1.05)",
                  },
                  "& .MuiChip-label": { px: 1 },
                }}
              />
            );
          })}

          {/* Active filter summary badge */}
          {isDirty && (
            <Chip
              label={[
                search && "Search",
                status && activeStatus?.label,
                quick && QUICK_CHIPS.find((c) => c.key === quick)?.label,
              ]
                .filter(Boolean)
                .join(" · ")}
              size="small"
              variant="outlined"
              sx={{
                fontSize:   "0.72rem",
                height:     26,
                color:      "text.secondary",
                borderColor: "divider",
                ml:         "auto",
                animation:  "fadeIn 0.25s ease",
                "@keyframes fadeIn": { from: { opacity: 0, transform: "translateY(-4px)" }, to: { opacity: 1, transform: "translateY(0)" } },
              }}
            />
          )}
        </Box>
      </Collapse>
    </Box>
  );
}
