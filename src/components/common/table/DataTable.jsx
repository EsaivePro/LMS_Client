import * as React from "react";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    Checkbox,
    Box,
    IconButton,
    Menu,
    MenuItem,
    Switch,
    Typography,
    Divider,
    TextField,
    Select,
    Button,
    Chip,
    ListItemText,
    CircularProgress,
} from "@mui/material";

import TuneIcon from "@mui/icons-material/Tune";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import NoRowsOverlay from "./NoRowsOverlay";

const STORAGE_KEY = "datatable_filters_v9";

/* ========================================================= */

export default function DataTable({
    rows = [],
    columns = [],
    totalCount = 0,
    loading = false,

    pageSizeOptions = [10, 20, 50],
    defaultPageSize = 10,
    maxHeight = 520,

    checkboxSelection = false,
    onSelectionChange,
    onRowDoubleClick,

    /* -------- SERVER SIDE -------- */
    serverSide = true,
    onFetchData,
    searchOnButton = true,

    tableKey = "default",
}) {
    const storageKey = `${STORAGE_KEY}_${tableKey}`;

    /* ================= STATE ================= */
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(defaultPageSize);
    const [sortModel, setSortModel] = React.useState({ field: null, direction: null });
    const [selectedIds, setSelectedIds] = React.useState([]);

    const [hiddenCols, setHiddenCols] = React.useState({});
    const [pinnedLeft, setPinnedLeft] = React.useState(
        () => columns.filter((c) => c.pinned === "left").map((c) => c.field)
    );

    const [filters, setFilters] = React.useState({});
    const [operators, setOperators] = React.useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);

    /* ================= RESTORE FILTERS ================= */
    React.useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            setFilters(parsed.filters || {});
            setOperators(parsed.operators || {});
        }
    }, [storageKey]);

    /* ================= SAVE FILTERS ================= */
    React.useEffect(() => {
        if (Object.keys(filters).length === 0 && Object.keys(operators).length === 0) return;
        localStorage.setItem(storageKey, JSON.stringify({ filters, operators }));
    }, [filters, operators, storageKey]);

    /* =========================================================
       BUILD QUERY STRING (COLUMN DRIVEN)
       ========================================================= */
    const buildQueryString = React.useCallback(() => {
        const params = new URLSearchParams();

        /* ---- pagination ---- */
        params.set("page", page + 1);
        params.set("limit", rowsPerPage);

        /* ---- sorting ---- */
        if (sortModel.field) {
            params.set("sort_by", sortModel.field);
            params.set("sort_order", sortModel.direction);
        }

        /* ---- filters ---- */
        columns.forEach((col) => {
            if (!col.filterable) return;

            const value = filters[col.field];
            if (value == null || value.length === 0) return;
            const operator =
                operators[col.field] ||
                col.defaultOperator ||
                (col.type === "select"
                    ? "in"
                    : col.type === "number"
                        ? "="
                        : "contains");

            params.append(
                `filters[${col.field}]`,
                Array.isArray(value) ? value.join(",") : value
            );
            params.append(`operators[${col.field}]`, operator);
            setPage(0);
        });

        return params.toString();
    }, [page, rowsPerPage, sortModel, filters, operators, columns]);

    /* ================= FETCH DATA ================= */
    const initialLoadRef = React.useRef(false);
    const [searchCounter, setSearchCounter] = React.useState(0);

    React.useEffect(() => {
        if (!serverSide || !onFetchData) return;

        const query = buildQueryString();

        if (searchOnButton) {
            // always perform an initial load once
            if (!initialLoadRef.current) {
                initialLoadRef.current = true;
                onFetchData(query);
                return;
            }

            // subsequent loads only when user clicks Search
            if (searchCounter > 0) {
                onFetchData(query);
                setSearchCounter(0);
            }
        } else {
            onFetchData(query);
        }
    }, [buildQueryString, onFetchData, searchOnButton, searchCounter]);

    /* ================= HELPERS ================= */
    const isPinnedLeft = (field) => pinnedLeft.includes(field);

    const visibleColumns = React.useMemo(
        () => columns.filter((c) => !hiddenCols[c.field]),
        [columns, hiddenCols]
    );

    const orderedColumns = React.useMemo(
        () => [
            ...visibleColumns.filter((c) => isPinnedLeft(c.field)),
            ...visibleColumns.filter((c) => !isPinnedLeft(c.field)),
        ],
        [visibleColumns, pinnedLeft]
    );

    /* ================= LOCAL PROCESSING (filters / sort / paginate) ================= */
    const processedRows = React.useMemo(() => {
        if (serverSide) return rows || [];

        let out = Array.isArray(rows) ? [...rows] : [];

        // Apply filters
        out = out.filter((r) => {
            for (const col of columns) {
                if (!col.filterable) continue;
                const raw = filters[col.field];
                if (raw == null || (typeof raw === "string" && raw === "")) continue;

                const operator =
                    operators[col.field] ||
                    col.defaultOperator ||
                    (col.type === "select"
                        ? "in"
                        : col.type === "number"
                            ? "="
                            : "contains");

                const cell = r[col.field];

                // normalize values
                const filterVals = Array.isArray(raw) ? raw : [raw];

                if (operator === "in") {
                    // if cell is array (e.g., permissions), check intersection
                    if (Array.isArray(cell)) {
                        const ids = cell.map((c) => (c && c.id != null ? c.id : c));
                        if (!filterVals.some((v) => ids.includes(v))) return false;
                    } else {
                        if (!filterVals.includes(cell)) return false;
                    }
                } else if (operator === "=") {
                    if (String(cell) !== String(filterVals[0])) return false;
                } else if (operator === ">" || operator === "<" || operator === ">=" || operator === "<=") {
                    const num = Number(cell);
                    const val = Number(filterVals[0]);
                    if (Number.isNaN(num) || Number.isNaN(val)) return false;
                    if (operator === ">" && !(num > val)) return false;
                    if (operator === "<" && !(num < val)) return false;
                    if (operator === ">=" && !(num >= val)) return false;
                    if (operator === "<=" && !(num <= val)) return false;
                } else {
                    // contains
                    const a = (cell ?? "").toString().toLowerCase();
                    const b = filterVals[0].toString().toLowerCase();
                    if (!a.includes(b)) return false;
                }
            }
            return true;
        });

        // Apply sort
        if (sortModel.field) {
            const f = sortModel.field;
            const dir = sortModel.direction === "asc" ? 1 : -1;
            out.sort((a, b) => {
                const va = a?.[f];
                const vb = b?.[f];
                if (va == null && vb == null) return 0;
                if (va == null) return -1 * dir;
                if (vb == null) return 1 * dir;
                if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
                return String(va).localeCompare(String(vb)) * dir;
            });
        }

        return out;
    }, [serverSide, rows, columns, filters, operators, sortModel]);

    const displayRows = React.useMemo(() => {
        if (serverSide) return rows || [];
        const start = page * rowsPerPage;
        return processedRows.slice(start, start + rowsPerPage);
    }, [serverSide, rows, processedRows, page, rowsPerPage]);

    /* ================= SORT ================= */
    const handleSort = (col) => {
        if (col.sortable === false) return;

        setSortModel((prev) =>
            prev.field !== col.field
                ? { field: col.field, direction: "asc" }
                : prev.direction === "asc"
                    ? { field: col.field, direction: "desc" }
                    : { field: null, direction: null }
        );
    };

    /* ================= SELECTION ================= */
    const toggleRow = (id) => {
        setSelectedIds((prev) => {
            const updated = prev.includes(id)
                ? prev.filter((x) => x !== id)
                : [...prev, id];
            onSelectionChange?.(updated);
            return updated;
        });
    };

    /* ================= CLEAR FILTERS ================= */
    const clearFilters = () => {
        setFilters({});
        setOperators({});
        setPage(0);
    };

    /* ========================================================= */

    return (
        <Paper sx={{ maxWidth: "100vw" }}>
            {/* ================= FILTER BAR ================= */}
            <Box
                sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                    p: 2,
                    borderBottom: "1px solid var(--lightgrey)",
                }}
            >
                {columns
                    .filter((c) => c.filterable && !hiddenCols[c.field])
                    .map((col) => {
                        const raw = filters[col.field];
                        const value = Array.isArray(raw)
                            ? raw
                            : raw != null && raw !== ""
                                ? [raw]
                                : [];

                        /* ---- SELECT FILTER ---- */
                        if (col.type === "select") {
                            return (
                                <Box
                                    key={col.field}
                                    sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 260 }}
                                >
                                    <Typography
                                        sx={{
                                            minWidth: 90,
                                            fontSize: 12,
                                            textAlign: "center",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            backgroundColor: "var(--lightgrey)",
                                            border: "1px solid var(--lightgrey)",
                                            borderRadius: 1,
                                            height: 40,
                                        }}
                                    >
                                        {col.headerName}
                                    </Typography>

                                    <Select
                                        size="small"
                                        multiple
                                        fullWidth
                                        value={value}
                                        onChange={(e) =>
                                            setFilters((p) => ({
                                                ...p,
                                                [col.field]: e.target.value,
                                            }))
                                        }
                                        renderValue={(selected) =>
                                            selected.length === 0 ? (
                                                <Typography sx={{ fontSize: 13 }}>All</Typography>
                                            ) : (
                                                <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                                    {selected.map((v) => (
                                                        <Chip key={v} size="small" label={v} />
                                                    ))}
                                                </Box>
                                            )
                                        }
                                    >
                                        {col.valueOptions?.map((opt) => {
                                            const val = typeof opt === "object" ? opt.value : opt;
                                            const label = typeof opt === "object" ? opt.label : opt;
                                            return (
                                                <MenuItem key={val} value={val} sx={{ p: 0.3 }}>
                                                    <Checkbox size="small" checked={value.includes(val)} />
                                                    <ListItemText primary={label} />
                                                </MenuItem>
                                            );
                                        })}
                                    </Select>
                                </Box>
                            );
                        }

                        /* ---- TEXT / NUMBER FILTER ---- */
                        return (
                            <Box key={col.field} sx={{ display: "flex", gap: 0.5, minWidth: 220 }}>
                                <Select
                                    size="small"
                                    value={operators[col.field] || "contains"}
                                    onChange={(e) =>
                                        setOperators((p) => ({
                                            ...p,
                                            [col.field]: e.target.value,
                                        }))
                                    }
                                >
                                    <MenuItem value="contains">contains</MenuItem>
                                    <MenuItem value="=">equals</MenuItem>
                                    {col.type === "number" && (
                                        <>
                                            <MenuItem value=">">&gt;</MenuItem>
                                            <MenuItem value="<">&lt;</MenuItem>
                                            <MenuItem value=">=">&gt;=</MenuItem>
                                            <MenuItem value="<=">&lt;=</MenuItem>
                                        </>
                                    )}
                                </Select>

                                <TextField
                                    size="small"
                                    placeholder={col.headerName.charAt(0).toUpperCase() + col.headerName.slice(1).toLowerCase()}
                                    value={filters[col.field] ?? ""}
                                    onChange={(e) =>
                                        setFilters((p) => ({
                                            ...p,
                                            [col.field]: e.target.value,
                                        }))
                                    }
                                />
                            </Box>
                        );
                    })}

                <Button
                    size="small"
                    variant="contained"
                    startIcon={<SearchIcon />}
                    onClick={() => {
                        setPage(0);
                        setSearchCounter((c) => c + 1);
                    }}
                >
                    Search
                </Button>

                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<ClearIcon />}
                    onClick={() => {
                        clearFilters();
                        setSearchCounter((c) => c + 1);
                    }}
                >
                    Clear
                </Button>

                <IconButton size="small" onClick={(e) => setAnchorEl(e.currentTarget)}>
                    <TuneIcon fontSize="small" />
                </IconButton>
            </Box>

            {/* ================= COLUMN VISIBILITY ================= */}
            <Menu anchorEl={anchorEl} open={!!anchorEl} onClose={() => setAnchorEl(null)}>
                <Typography sx={{ px: 1.5, py: 0.5 }}>Columns</Typography>
                <Divider />
                {columns.map((col) => (
                    <MenuItem key={col.field}>
                        <Switch
                            size="small"
                            checked={!hiddenCols[col.field]}
                            onChange={() =>
                                setHiddenCols((p) => ({
                                    ...p,
                                    [col.field]: !p[col.field],
                                }))
                            }
                        />
                        <Typography sx={{ flex: 1, fontSize: "13px" }}>{col.headerName}</Typography>
                        <IconButton
                            size="small"
                            onClick={() =>
                                setPinnedLeft((p) =>
                                    p.includes(col.field)
                                        ? p.filter((f) => f !== col.field)
                                        : [...p, col.field]
                                )
                            }
                        >
                            {isPinnedLeft(col.field) ? (
                                <PushPinIcon fontSize="small" />
                            ) : (
                                <PushPinOutlinedIcon fontSize="small" />
                            )}
                        </IconButton>
                    </MenuItem>
                ))}
            </Menu>

            {/* ================= TABLE ================= */}
            <TableContainer>
                <Table stickyHeader >
                    <TableHead>
                        <TableRow>
                            {checkboxSelection && <TableCell padding="checkbox" />}
                            {orderedColumns.map((col) => (
                                <TableCell
                                    key={col.field}
                                    onClick={() => handleSort(col)}
                                    sx={{
                                        fontWeight: 600,
                                        background: "var(--lightgrey)",
                                        cursor: col.sortable === false ? "default" : "pointer",
                                    }}
                                >
                                    {col.headerName}
                                    {sortModel.field === col.field &&
                                        (sortModel.direction === "asc" ? " ▲" : " ▼")}
                                </TableCell>
                            ))}
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={orderedColumns.length + 1} align="center">
                                    <CircularProgress size={28} />
                                </TableCell>
                            </TableRow>
                        ) : displayRows.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={orderedColumns.length + 1}>
                                    <NoRowsOverlay />
                                </TableCell>
                            </TableRow>
                        ) : (
                            displayRows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    hover
                                    onDoubleClick={() => onRowDoubleClick?.(row)}
                                >
                                    {checkboxSelection && (
                                        <TableCell padding="checkbox">
                                            <Checkbox
                                                checked={selectedIds.includes(row.id)}
                                                onChange={() => toggleRow(row.id)}
                                            />
                                        </TableCell>
                                    )}
                                    {orderedColumns.map((col) => (
                                        <TableCell key={col.field}>
                                            {col.renderCell
                                                ? col.renderCell({ value: row[col.field], row })
                                                : row[col.field] ?? "-"}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* ================= PAGINATION ================= */}
            <TablePagination
                component="div"
                count={serverSide ? totalCount : processedRows.length}
                page={page}
                onPageChange={(_, p) => setPage(p)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(0);
                }}
                rowsPerPageOptions={pageSizeOptions}
            />
        </Paper>
    );
}
