import React from "react";
import {
  Box, TextField, InputAdornment, Chip, Stack,
  MenuItem, Select, FormControl, InputLabel, Button, Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const QUICK_CHIPS = [
  { key: "due_soon",  label: "Due Soon" },
  { key: "expired",   label: "Expired"  },
  { key: "assigned",  label: "Assigned" },
  { key: "completed", label: "Completed"},
];

const STATUS_OPTS = [
  { value: "",           label: "All Statuses" },
  { value: "active",     label: "Active"       },
  { value: "inprogress", label: "In Progress"  },
  { value: "completed",  label: "Completed"    },
  { value: "expired",    label: "Expired"      },
  { value: "scheduled",  label: "Scheduled"    },
  { value: "pending",    label: "Pending"      },
];

export default function EnrollmentFilters({ filters = {}, onFilterChange, onClear }) {
  const { search = "", status = "", quick = "" } = filters;
  const isDirty = search || status || quick;

  return (
    <Box sx={{ mb: 2.5 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ sm: "center" }}
        sx={{ mb: 1.5 }}
      >
        <TextField
          size="small"
          placeholder="Search courses, exams…"
          value={search}
          onChange={(e) => onFilterChange?.("search", e.target.value)}
          sx={{ flexGrow: 1, minWidth: 200 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" color="action" />
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 148 }}>
          <InputLabel>Status</InputLabel>
          <Select
            label="Status"
            value={status}
            onChange={(e) => onFilterChange?.("status", e.target.value)}
          >
            {STATUS_OPTS.map((o) => (
              <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
            ))}
          </Select>
        </FormControl>

        {isDirty && (
          <Tooltip title="Clear all filters">
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={onClear}
              variant="outlined"
              color="inherit"
              sx={{ whiteSpace: "nowrap" }}
            >
              Clear
            </Button>
          </Tooltip>
        )}
      </Stack>

      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {QUICK_CHIPS.map((chip) => (
          <Chip
            key={chip.key}
            label={chip.label}
            size="small"
            clickable
            onClick={() => onFilterChange?.("quick", quick === chip.key ? "" : chip.key)}
            variant={quick === chip.key ? "filled" : "outlined"}
            color={quick === chip.key ? "primary" : "default"}
            sx={{ fontWeight: 600, fontSize: "0.72rem" }}
          />
        ))}
      </Stack>
    </Box>
  );
}
