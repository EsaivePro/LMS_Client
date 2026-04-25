import React, { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Box, Typography, LinearProgress, Checkbox, IconButton, Tooltip,
  Menu, MenuItem, Pagination, Select, FormControl, InputLabel, Stack,
  Skeleton, Chip,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import dayjs from "dayjs";
import StatusChip from "./StatusChip";

function SortIcon({ column }) {
  if (!column.getCanSort()) return null;
  const dir = column.getIsSorted();
  if (dir === "asc")  return <ArrowUpwardIcon   sx={{ fontSize: 13, ml: 0.3 }} />;
  if (dir === "desc") return <ArrowDownwardIcon sx={{ fontSize: 13, ml: 0.3 }} />;
  return <UnfoldMoreIcon sx={{ fontSize: 13, ml: 0.3, opacity: 0.35 }} />;
}

function RowActionMenu({ row, onAction }) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);
  return (
    <>
      <IconButton size="small" onClick={(e) => { e.stopPropagation(); setAnchor(e.currentTarget); }}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)} onClick={() => setAnchor(null)}>
        <MenuItem dense onClick={() => onAction?.("view_details", row.original)}>View Details</MenuItem>
        <MenuItem dense onClick={() => onAction?.("continue",     row.original)}>Continue Learning</MenuItem>
        <MenuItem dense onClick={() => onAction?.("start_exam",   row.original)}>Start Exam</MenuItem>
        <MenuItem dense onClick={() => onAction?.("resume",       row.original)}>Resume</MenuItem>
      </Menu>
    </>
  );
}

function buildColumns(onAction) {
  return [
    {
      id:     "select",
      header: ({ table }) => (
        <Checkbox
          size="small"
          indeterminate={table.getIsSomePageRowsSelected()}
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
        />
      ),
      cell: ({ row }) => (
        <Checkbox size="small" checked={row.getIsSelected()} onChange={row.getToggleSelectedHandler()} />
      ),
      size:         44,
      enableSorting: false,
    },
    {
      accessorKey: "module_title",
      header:      "Title",
      cell:        ({ getValue }) => (
        <Tooltip title={getValue() ?? ""} placement="top">
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8rem" }}
          >
            {getValue() ?? "—"}
          </Typography>
        </Tooltip>
      ),
    },
    {
      accessorKey: "module_type",
      header:      "Type",
      size:        80,
      cell:        ({ getValue }) => {
        const t = getValue();
        return (
          <Chip
            label={t === "course" ? "Course" : "Exam"}
            size="small"
            sx={{
              bgcolor:    t === "course" ? "#f3e5f5" : "#e3f2fd",
              color:      t === "course" ? "#7b1fa2" : "#1565c0",
              fontWeight: 700,
              fontSize:   "0.68rem",
              height:     20,
            }}
          />
        );
      },
    },
    {
      accessorKey: "status",
      header:      "Status",
      size:        110,
      cell:        ({ getValue }) => <StatusChip status={getValue()} />,
    },
    {
      accessorKey: "progress_percent",
      header:      "Progress",
      size:        110,
      cell:        ({ getValue }) => {
        const v = Math.min(100, Math.round(getValue() ?? 0));
        return (
          <Box sx={{ minWidth: 90 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.25 }}>
              <Typography variant="caption" sx={{ fontSize: "0.68rem" }}>{v}%</Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={v}
              sx={{
                height:      5,
                borderRadius: 4,
                bgcolor:     "action.hover",
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, var(--primary,#8F00FF), #f093fb)",
                },
              }}
            />
          </Box>
        );
      },
    },
    {
      accessorKey: "marks",
      header:      "Marks",
      size:        70,
      cell:        ({ getValue }) => (
        <Typography variant="body2" sx={{ fontSize: "0.8rem" }}>
          {getValue() != null ? `${getValue()}%` : "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "enrolled_at",
      header:      "Enrolled",
      size:        110,
      cell:        ({ getValue }) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
          {getValue() ? dayjs(getValue()).format("MMM D, YYYY") : "—"}
        </Typography>
      ),
    },
    {
      accessorKey: "scheduled_end_at",
      header:      "Expiry",
      size:        110,
      cell:        ({ getValue }) => (
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.78rem" }}>
          {getValue() ? dayjs(getValue()).format("MMM D, YYYY") : "—"}
        </Typography>
      ),
    },
    {
      id:            "actions",
      header:        "Actions",
      size:          64,
      enableSorting: false,
      cell:          ({ row }) => <RowActionMenu row={row} onAction={onAction} />,
    },
  ];
}

function TableSkeleton({ cols }) {
  return (
    <Box>
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={44} sx={{ mb: 0.5, borderRadius: 1 }} />
      ))}
    </Box>
  );
}

export default function EnrollmentTable({
  enrollments   = [],
  pagination    = { total: 0, page: 1, limit: 10 },
  loading       = false,
  onPageChange,
  onLimitChange,
  onAction,
}) {
  const [rowSelection, setRowSelection] = useState({});
  const [sorting,      setSorting]      = useState([]);

  const columns = useMemo(() => buildColumns(onAction), [onAction]);
  const data    = useMemo(() => enrollments, [enrollments]);

  const table = useReactTable({
    data,
    columns,
    state:                  { rowSelection, sorting },
    onRowSelectionChange:   setRowSelection,
    onSortingChange:        setSorting,
    getCoreRowModel:        getCoreRowModel(),
    getSortedRowModel:      getSortedRowModel(),
    manualPagination:       true,
    manualSorting:          true,
    rowCount:               pagination.total,
    enableRowSelection:     true,
  });

  const totalPages = Math.ceil(pagination.total / pagination.limit) || 1;

  if (loading) return <TableSkeleton cols={columns.length} />;

  return (
    <Box>
      <Paper variant="outlined" sx={{ borderRadius: 2, overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 460 }}>
          <Table stickyHeader size="small">
            <TableHead>
              {table.getHeaderGroups().map((hg) => (
                <TableRow key={hg.id}>
                  {hg.headers.map((header) => (
                    <TableCell
                      key={header.id}
                      sx={{
                        bgcolor:       "var(--lightgrey,#f5f5f5)",
                        fontWeight:    700,
                        fontSize:      "0.74rem",
                        cursor:        header.column.getCanSort() ? "pointer" : "default",
                        userSelect:    "none",
                        whiteSpace:    "nowrap",
                        width:         header.column.columnDef.size,
                        py:            1,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        <SortIcon column={header.column} />
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableHead>

            <TableBody>
              {table.getRowModel().rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length} align="center" sx={{ py: 7, color: "text.secondary", fontSize: "0.85rem" }}>
                    No enrollments found
                  </TableCell>
                </TableRow>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    hover
                    selected={row.getIsSelected()}
                    sx={{
                      cursor: "pointer",
                      "&.Mui-selected": { bgcolor: "var(--primaryLight,#fbf5ff)" },
                    }}
                    onDoubleClick={() => onAction?.("view_details", row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} sx={{ py: 1.1 }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* Pagination footer */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 2, px: 0.5 }}>
        <Typography variant="caption" color="text.secondary">
          {pagination.total > 0
            ? `Showing ${(pagination.page - 1) * pagination.limit + 1}–${Math.min(pagination.page * pagination.limit, pagination.total)} of ${pagination.total}`
            : "0 results"}
        </Typography>

        <Stack direction="row" spacing={2} alignItems="center">
          <FormControl size="small" variant="outlined" sx={{ minWidth: 76 }}>
            <InputLabel>Rows</InputLabel>
            <Select
              label="Rows"
              value={pagination.limit}
              onChange={(e) => onLimitChange?.(Number(e.target.value))}
            >
              {[10, 20, 50].map((n) => (
                <MenuItem key={n} value={n}>{n}</MenuItem>
              ))}
            </Select>
          </FormControl>

          <Pagination
            count={totalPages}
            page={pagination.page}
            onChange={(_, p) => onPageChange?.(p)}
            color="primary"
            size="small"
            shape="rounded"
          />
        </Stack>
      </Stack>
    </Box>
  );
}
