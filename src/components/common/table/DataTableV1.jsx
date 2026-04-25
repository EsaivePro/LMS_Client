import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Checkbox,
    Box,
    IconButton,
    Tooltip,
    Menu,
    MenuItem,
    Switch,
    Typography,
    Divider,
    TextField,
    Select,
    Button,
    Chip,
    Popover,
    Stack,
    Badge,
    LinearProgress,
} from "@mui/material";

import TuneIcon from "@mui/icons-material/Tune";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import FilterAltOffIcon from "@mui/icons-material/FilterAltOff";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NoRowsOverlay from "./NoRowsOverlay";

const STORAGE_KEY = "datatable_filters_v9";

function defaultSelectData(data) {
    const rows = data?.data ?? (Array.isArray(data) ? data : []);
    const totalCount =
        data?.pagination?.total ??
        data?.pagination?.totalCount ??
        rows.length;
    return { rows, totalCount };
}

/* ========================================================= */

export default function DataTable({
    rows: rowsProp = [],
    totalCount: totalCountProp = 0,
    loading: loadingProp = false,

    columns = [],
    pageSizeOptions = [10, 20, 50],
    defaultPageSize = 10,
    maxHeight = 520,
    minHeight = 390,

    checkboxSelection = false,
    onSelectionChange,
    onRowDoubleClick,

    /* -------- REACT-QUERY (preferred) -------- */
    queryKey = null,
    queryFn = null,
    queryEnabled = true,
    staleTime = 30_000,
    gcTime = 300_000,
    selectData = null,

    /* -------- LEGACY SERVER SIDE -------- */
    serverSide = true,
    onFetchData,
    searchOnButton = false,
    externalSearch: externalSearchProp = "",
    onExternalSearchChange,
    searchPlaceholder = "Search",
    searchMinLength = 3,
    emptySubtitle = "No records found. Add new data to get started.",
    pickerSelected = false,
    hidePagination = false,
    infiniteScroll = false,
    infiniteScrollHasMore,
    endOfResultsMessage = "No more data",
    tableName,
    tableKey = "default",
}) {
    const storageKey = `${STORAGE_KEY}_${tableKey}`;

    /* ── STATE ── */
    const [page, setPage] = React.useState(0);
    const [rowsPerPage, setRowsPerPage] = React.useState(defaultPageSize);
    const [sortModel, setSortModel] = React.useState({ field: null, direction: null });
    const [selectedIds, setSelectedIds] = React.useState([]);
    const [hiddenCols, setHiddenCols] = React.useState({});
    const [pinnedLeft, setPinnedLeft] = React.useState(
        () => columns.filter((c) => c.pinned === "left").map((c) => c.field)
    );
    const [pinnedRight, setPinnedRight] = React.useState(
        () => columns.filter((c) => c.pinned === "right").map((c) => c.field)
    );
    const [filters, setFilters] = React.useState({});
    const [operators, setOperators] = React.useState({});
    const [colMenuAnchor, setColMenuAnchor] = React.useState(null);
    const [localExternalSearch, setLocalExternalSearch] = React.useState(externalSearchProp);

    /* ── COLUMN FILTER POPOVER STATE ── */
    const [filterPopover, setFilterPopover] = React.useState(null); // { el, col }
    const [draftValue, setDraftValue] = React.useState("");
    const [draftOperator, setDraftOperator] = React.useState("contains");

    const searchDebounceRef = React.useRef(null);
    const skipNextFetchRef = React.useRef(false);
    const loadMoreLockRef = React.useRef(null);
    const prevLoadingRef = React.useRef(false);
    const searchResetInitializedRef = React.useRef(false);

    React.useEffect(() => { setLocalExternalSearch(externalSearchProp); }, [externalSearchProp]);

    const normalizedExternalSearch = (localExternalSearch || "").trim();
    const searchActive = normalizedExternalSearch.length >= searchMinLength;

    React.useEffect(() => {
        if (!serverSide) return;
        if (!searchResetInitializedRef.current) { searchResetInitializedRef.current = true; return; }
        skipNextFetchRef.current = true;
        lastQueryRef.current = null;
        setPage(0);
    }, [externalSearchProp, serverSide, infiniteScroll]);

    /* ── PERSIST FILTERS ── */
    // React.useEffect(() => {
    //     const saved = localStorage.getItem(storageKey);
    //     if (saved) {
    //         const parsed = JSON.parse(saved);
    //         setFilters(parsed.filters || {});
    //         setOperators(parsed.operators || {});
    //     }
    // }, [storageKey]);

    // React.useEffect(() => {
    //     if (Object.keys(filters).length === 0 && Object.keys(operators).length === 0) return;
    //     localStorage.setItem(storageKey, JSON.stringify({ filters, operators }));
    // }, [filters, operators, storageKey]);

    /* ── QUERY STRING ── */
    const queryString = React.useMemo(() => {
        const params = new URLSearchParams();
        if (tableName) params.set("table", tableName);
        params.set("page", page + 1);
        params.set("limit", rowsPerPage);

        if (sortModel.field) {
            params.set("sort_by", sortModel.field);
            params.set("sort_order", sortModel.direction);
        }

        columns.forEach((col) => {
            if (!col.filterable) return;
            const value = filters[col.field];
            if (value == null || value.length === 0) return;
            const operator =
                operators[col.field] ||
                col.defaultOperator ||
                (col.type === "select" ? "in" : col.type === "number" ? "=" : "contains");
            params.append(`filters[${col.field}]`, Array.isArray(value) ? value.join(",") : value);
            params.append(`operators[${col.field}]`, operator);
        });

        const rawSearch = (externalSearchProp || localExternalSearch || "").trim();
        if (rawSearch.length >= searchMinLength) params.set("q", rawSearch);

        return params.toString();
    }, [page, rowsPerPage, sortModel, filters, operators, columns, externalSearchProp, localExternalSearch, searchMinLength, tableName]);

    /* ── REACT-QUERY ── */
    const internalQuery = useQuery({
        queryKey: queryKey ? [...queryKey, queryString] : ["__datatable_disabled__"],
        queryFn: () => queryFn(queryString),
        enabled: !!queryKey && !!queryFn && queryEnabled,
        staleTime,
        gcTime,
    });

    /* ── LEGACY onFetchData ── */
    const initialLoadRef = React.useRef(false);
    const [searchCounter, setSearchCounter] = React.useState(0);
    const lastQueryRef = React.useRef(null);

    React.useEffect(() => {
        if (queryKey) return;
        if (!serverSide || !onFetchData) return;
        if (skipNextFetchRef.current) { skipNextFetchRef.current = false; return; }
        if (lastQueryRef.current === queryString) return;

        if (searchOnButton) {
            if (!initialLoadRef.current) {
                initialLoadRef.current = true;
                lastQueryRef.current = queryString;
                onFetchData(queryString);
                return;
            }
            if (searchCounter > 0) {
                lastQueryRef.current = queryString;
                onFetchData(queryString);
                setSearchCounter(0);
            }
        } else {
            lastQueryRef.current = queryString;
            onFetchData(queryString);
        }
    }, [queryString, queryKey, serverSide, onFetchData, searchOnButton, searchCounter]);

    /* ── RESOLVE DATA ── */
    const resolvedRows = React.useMemo(() => {
        if (queryKey) return (selectData ?? defaultSelectData)(internalQuery.data).rows;
        return rowsProp;
    }, [queryKey, internalQuery.data, selectData, rowsProp]);

    const resolvedTotalCount = React.useMemo(() => {
        if (queryKey) return (selectData ?? defaultSelectData)(internalQuery.data).totalCount;
        return totalCountProp;
    }, [queryKey, internalQuery.data, selectData, totalCountProp]);

    const resolvedLoading = queryKey
        ? (internalQuery.isLoading || internalQuery.isFetching)
        : loadingProp;

    /* ── COLUMN HELPERS ── */
    const isPinnedLeft = (field) => pinnedLeft.includes(field);
    const isPinnedRight = (field) => pinnedRight.includes(field);

    const visibleColumns = React.useMemo(
        () => columns.filter((c) => !hiddenCols[c.field]),
        [columns, hiddenCols]
    );

    const orderedColumns = React.useMemo(
        () => [
            ...visibleColumns.filter((c) => isPinnedLeft(c.field)),
            ...visibleColumns.filter((c) => !isPinnedLeft(c.field) && !isPinnedRight(c.field)),
            ...visibleColumns.filter((c) => isPinnedRight(c.field)),
        ],
        [visibleColumns, pinnedLeft, pinnedRight]
    );

    /* ── LOCAL PROCESSING ── */
    const processedRows = React.useMemo(() => {
        if (serverSide) return resolvedRows || [];
        let out = Array.isArray(resolvedRows) ? [...resolvedRows] : [];

        if (searchActive) {
            const term = normalizedExternalSearch.toLowerCase();
            out = out.filter((row) =>
                columns.some((col) => {
                    const v = row?.[col.field];
                    if (v == null) return false;
                    if (Array.isArray(v)) return v.some((i) => String(i?.label ?? i?.value ?? i ?? "").toLowerCase().includes(term));
                    return String(v?.label ?? v?.value ?? v ?? "").toLowerCase().includes(term);
                })
            );
        }

        out = out.filter((r) => {
            for (const col of columns) {
                if (!col.filterable) continue;
                const raw = filters[col.field];
                if (raw == null || (typeof raw === "string" && raw === "")) continue;
                const operator = operators[col.field] || col.defaultOperator ||
                    (col.type === "select" ? "in" : col.type === "number" ? "=" : "contains");
                const cell = r[col.field];
                const filterVals = Array.isArray(raw) ? raw : [raw];

                if (operator === "in") {
                    if (Array.isArray(cell)) {
                        const ids = cell.map((c) => (c?.id != null ? c.id : c));
                        if (!filterVals.some((v) => ids.includes(v))) return false;
                    } else if (!filterVals.includes(cell)) return false;
                } else if (operator === "=") {
                    if (String(cell) !== String(filterVals[0])) return false;
                } else if (["<", ">", "<=", ">="].includes(operator)) {
                    const num = Number(cell), val = Number(filterVals[0]);
                    if (Number.isNaN(num) || Number.isNaN(val)) return false;
                    if (operator === ">" && !(num > val)) return false;
                    if (operator === "<" && !(num < val)) return false;
                    if (operator === ">=" && !(num >= val)) return false;
                    if (operator === "<=" && !(num <= val)) return false;
                } else {
                    if (!(cell ?? "").toString().toLowerCase().includes(filterVals[0].toString().toLowerCase())) return false;
                }
            }
            return true;
        });

        if (sortModel.field) {
            const f = sortModel.field, dir = sortModel.direction === "asc" ? 1 : -1;
            out.sort((a, b) => {
                const va = a?.[f], vb = b?.[f];
                if (va == null && vb == null) return 0;
                if (va == null) return -1 * dir;
                if (vb == null) return 1 * dir;
                if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
                return String(va).localeCompare(String(vb)) * dir;
            });
        }
        return out;
    }, [serverSide, resolvedRows, columns, filters, operators, sortModel, searchActive, normalizedExternalSearch]);

    const displayRows = React.useMemo(() => {
        if (serverSide) return resolvedRows || [];
        return processedRows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    }, [serverSide, resolvedRows, processedRows, page, rowsPerPage]);

    /* ── SORT ── */
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

    /* ── SELECTION ── */
    const toggleRow = (id) => {
        setSelectedIds((prev) => {
            const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
            onSelectionChange?.(updated);
            return updated;
        });
    };

    /* ── FILTER POPOVER HANDLERS ── */
    const openFilterPopover = (e, col) => {
        e.stopPropagation();
        const isSelect = col.type === "select";
        const currentVal = filters[col.field];
        const initValue = currentVal ?? (isSelect ? [] : "");
        const initOp = operators[col.field] || col.defaultOperator ||
            (isSelect ? "in" : col.type === "number" ? "=" : "contains");
        setDraftValue(initValue);
        setDraftOperator(initOp);
        setFilterPopover({ el: e.currentTarget, col });
    };

    const closeFilterPopover = () => setFilterPopover(null);

    const applyColumnFilter = () => {
        const { col } = filterPopover;
        const isEmpty = Array.isArray(draftValue) ? draftValue.length === 0 : draftValue === "";
        setFilters((p) => {
            const next = { ...p };
            if (isEmpty) delete next[col.field];
            else next[col.field] = draftValue;
            return next;
        });
        setOperators((p) => ({ ...p, [col.field]: draftOperator }));
        setPage(0);
        setSearchCounter((c) => c + 1);
        closeFilterPopover();
    };

    const clearColumnFilter = (field, e) => {
        e?.stopPropagation();
        setFilters((p) => { const n = { ...p }; delete n[field]; return n; });
        setOperators((p) => { const n = { ...p }; delete n[field]; return n; });
        setPage(0);
        setSearchCounter((c) => c + 1);
    };

    const clearAllFilters = () => {
        setFilters({});
        setOperators({});
        setPage(0);
        setSearchCounter((c) => c + 1);
    };

    React.useEffect(() => {
        return () => { if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current); };
    }, []);

    React.useEffect(() => {
        if (prevLoadingRef.current && !resolvedLoading) loadMoreLockRef.current = null;
        prevLoadingRef.current = resolvedLoading;
    }, [resolvedLoading]);

    const activeFilterCount = React.useMemo(
        () => Object.values(filters).filter((v) => v != null && v !== "" && (Array.isArray(v) ? v.length > 0 : true)).length,
        [filters]
    );

    const canLoadMore = React.useMemo(() => {
        if (!infiniteScroll || resolvedLoading) return false;
        if (typeof infiniteScrollHasMore === "boolean") return infiniteScrollHasMore;
        if (serverSide) return (resolvedRows?.length || 0) < resolvedTotalCount;
        return displayRows.length < processedRows.length;
    }, [displayRows.length, infiniteScroll, infiniteScrollHasMore, resolvedLoading, processedRows.length, resolvedRows?.length, serverSide, resolvedTotalCount]);

    const handleInfiniteScroll = React.useCallback((e) => {
        if (!infiniteScroll || !canLoadMore || resolvedLoading) return;
        const t = e.currentTarget;
        const pct = ((t.scrollTop + t.clientHeight) / t.scrollHeight) * 100;
        const nextPage = page + 1;
        if (pct >= 98 && loadMoreLockRef.current !== nextPage) {
            loadMoreLockRef.current = nextPage;
            setPage(nextPage);
        }
    }, [canLoadMore, infiniteScroll, resolvedLoading, page]);

    const scaleColumnWidth = React.useCallback(
        (w, min = 56) => {
            if (typeof w !== "number") return w;
            return pickerSelected ? Math.max(min, Math.round(w * 0.78)) : w;
        },
        [pickerSelected]
    );

    /* ── active col for popover ── */
    const activeCol = filterPopover?.col ?? null;
    const isSelectFilter = activeCol?.type === "select";

    /* ========================================================= */
    return (
        <Paper sx={{ width: "100%", maxWidth: "100%" }}>

            {/* ── TOOLBAR ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 1.5,
                    // px: pickerSelected ? 1 : 2,
                    py: 1.2,
                    // borderBottom: "1px solid",
                    // borderColor: "divider",
                }}
            >
                {/* LEFT — Search bar */}
                <TextField
                    size="small"
                    placeholder={searchPlaceholder}
                    value={localExternalSearch}
                    onChange={(e) => {
                        const v = e.target.value;
                        setLocalExternalSearch(v);
                        if (typeof onExternalSearchChange === "function") {
                            onExternalSearchChange(v);
                        } else {
                            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                            searchDebounceRef.current = setTimeout(() => {
                                setPage(0);
                                setSearchCounter((c) => c + 1);
                            }, 500);
                        }
                    }}
                    InputProps={{
                        startAdornment: <SearchIcon sx={{ mr: 0.8, fontSize: 20, color: searchActive ? "primary.main" : "text.disabled" }} />,
                        endAdornment: localExternalSearch && (
                            <IconButton size="small" sx={{ p: 0.3 }}
                                onClick={() => { setLocalExternalSearch(""); setPage(0); setSearchCounter((c) => c + 1); }}>
                                <ClearIcon sx={{ fontSize: 16, color: "text.disabled" }} />
                            </IconButton>
                        ),
                    }}
                    sx={{
                        width: pickerSelected ? 260 : 380,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: 1.5,
                            fontSize: 15,
                            transition: "box-shadow 0.2s",
                            "&.Mui-focused": {
                                boxShadow: "0 0 0 3px rgba(25,118,210,0.12)",
                            },
                        },
                    }}
                />

                {/* MIDDLE — Active filter chips */}
                {activeFilterCount > 0 && (
                    <Stack direction="row" spacing={0.8} flexWrap="wrap" alignItems="center" sx={{ flex: 1 }}>
                        {columns
                            .filter((c) => c.filterable &&
                                filters[c.field] != null && filters[c.field] !== "" &&
                                !(Array.isArray(filters[c.field]) && filters[c.field].length === 0))
                            .map((col) => {
                                const val = filters[col.field];
                                const label = Array.isArray(val) ? val.join(", ") : val;
                                return (
                                    <Chip
                                        key={col.field}
                                        size="small"
                                        icon={<FilterAltIcon sx={{ fontSize: "15px !important" }} />}
                                        label={
                                            <Typography component="span" sx={{ fontSize: 15 }}>
                                                <strong>{col.headerName}:</strong>&nbsp;{label}
                                            </Typography>
                                        }
                                        onDelete={(e) => clearColumnFilter(col.field, e)}
                                        sx={{
                                            height: 28,
                                            borderRadius: 1,
                                            bgcolor: "primary.50",
                                            border: "1px solid",
                                            borderColor: "primary.200",
                                            "& .MuiChip-deleteIcon": { fontSize: 16 },
                                        }}
                                    />
                                );
                            })}
                    </Stack>
                )}

                <Box sx={{ flex: activeFilterCount > 0 ? 0 : 1 }} />

                {/* RIGHT — Clear filters (new style) */}
                {activeFilterCount > 0 && (
                    <Box
                        onClick={clearAllFilters}
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.6,
                            px: 1.4,
                            py: 0.55,
                            borderRadius: 5,
                            border: "1.5px solid",
                            borderColor: "error.main",
                            color: "error.main",
                            bgcolor: "#fff5f5",
                            cursor: "pointer",
                            fontWeight: 600,
                            fontSize: 15,
                            userSelect: "none",
                            transition: "background 0.18s, border-color 0.18s",
                            "&:hover": { bgcolor: "error.50", borderColor: "error.dark" },
                        }}
                    >
                        <FilterAltOffIcon sx={{ fontSize: 17 }} />
                        <Typography sx={{ fontSize: 15, fontWeight: 600, color: "inherit", lineHeight: 1 }}>
                            Clear&nbsp;{activeFilterCount}
                        </Typography>
                    </Box>
                )}

                {/* RIGHT — Compact pagination */}
                {!hidePagination && !infiniteScroll && (() => {
                    const totalCount = serverSide ? resolvedTotalCount : processedRows.length;
                    const from = totalCount === 0 ? 0 : page * rowsPerPage + 1;
                    const to = Math.min((page + 1) * rowsPerPage, totalCount);
                    const isFirst = page === 0;
                    const isLast = to >= totalCount;
                    return (
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            {/* Rows per page */}
                            <Select
                                size="small"
                                value={rowsPerPage}
                                onChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                                sx={{
                                    fontSize: 15,
                                    height: 34,
                                    "& .MuiSelect-select": { py: 0.6, pr: "28px !important" },
                                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "divider" },
                                }}
                            >
                                {pageSizeOptions.map((opt) => (
                                    <MenuItem key={opt} value={opt} sx={{ fontSize: 15 }}>
                                        {opt} / page
                                    </MenuItem>
                                ))}
                            </Select>

                            {/* Count label */}
                            <Typography
                                sx={{
                                    fontSize: 15,
                                    color: "text.secondary",
                                    whiteSpace: "nowrap",
                                    px: 0.5,
                                    minWidth: 110,
                                    textAlign: "center",
                                }}
                            >
                                {from}–{to} of {totalCount}
                            </Typography>

                            {/* Prev / Next */}
                            <IconButton
                                size="small"
                                disabled={isFirst}
                                onClick={() => setPage((p) => p - 1)}
                                sx={{
                                    border: "1px solid",
                                    borderColor: isFirst ? "divider" : "primary.main",
                                    borderRadius: 1,
                                    p: 0.3,
                                    color: isFirst ? "text.disabled" : "primary.main",
                                }}
                            >
                                <NavigateBeforeIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                                size="small"
                                disabled={isLast}
                                onClick={() => setPage((p) => p + 1)}
                                sx={{
                                    border: "1px solid",
                                    borderColor: isLast ? "divider" : "primary.main",
                                    borderRadius: 1,
                                    p: 0.3,
                                    color: isLast ? "text.disabled" : "primary.main",
                                }}
                            >
                                <NavigateNextIcon fontSize="small" />
                            </IconButton>
                        </Box>
                    );
                })()}

                {/* RIGHT — Column settings */}
                {!pickerSelected && (
                    <Tooltip title="Column settings">
                        <IconButton
                            size="small"
                            onClick={(e) => setColMenuAnchor(e.currentTarget)}
                            sx={{
                                border: "1px solid",
                                borderColor: "divider",
                                borderRadius: 1,
                                p: 0.5,
                                color: "text.secondary",
                                "&:hover": { borderColor: "primary.main", color: "primary.main" },
                            }}
                        >
                            <TuneIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                )}
            </Box>

            {/* ── COLUMN VISIBILITY MENU ── */}
            <Menu anchorEl={colMenuAnchor} open={!!colMenuAnchor} onClose={() => setColMenuAnchor(null)}>
                <Typography sx={{ px: 1.5, py: 0.5, fontWeight: 600, fontSize: 15 }}>Columns</Typography>
                <Divider />
                {columns.map((col) => (
                    <MenuItem key={col.field} dense>
                        <Switch size="small" checked={!hiddenCols[col.field]}
                            onChange={() => setHiddenCols((p) => ({ ...p, [col.field]: !p[col.field] }))} />
                        <Typography sx={{ flex: 1, fontSize: 15 }}>{col.headerName}</Typography>
                        <IconButton size="small"
                            onClick={() =>
                                setPinnedLeft((p) =>
                                    p.includes(col.field) ? p.filter((f) => f !== col.field) : [...p, col.field]
                                )
                            }
                        >
                            {isPinnedLeft(col.field) ? <PushPinIcon fontSize="small" /> : <PushPinOutlinedIcon fontSize="small" />}
                        </IconButton>
                    </MenuItem>
                ))}
            </Menu>

            {/* ── TABLE ── */}
            <Box sx={{ minHeight, display: "flex", flexDirection: "column", overflow: "hidden", mt: 2, border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <TableContainer sx={{ flex: 1, maxHeight, overflow: "auto" }} onScroll={handleInfiniteScroll} variant="outlined">
                    <Table stickyHeader size="small">

                        {/* HEAD */}
                        <TableHead>
                            <TableRow sx={{ bgcolor: "var(--lightgrey, #f5f5f5)" }}>
                                {checkboxSelection && (
                                    <TableCell padding="checkbox" sx={{ bgcolor: "var(--lightgrey, #f5f5f5)" }} />
                                )}
                                {orderedColumns.map((col) => {
                                    const hasFilter =
                                        filters[col.field] != null &&
                                        filters[col.field] !== "" &&
                                        !(Array.isArray(filters[col.field]) && filters[col.field].length === 0);

                                    const sx = {
                                        fontWeight: 600,
                                        fontSize: 15,
                                        bgcolor: "var(--lightgrey, #f5f5f5)",
                                        color: "text.primary",
                                        whiteSpace: "nowrap",
                                        userSelect: "none",
                                        py: 0.8,
                                    };

                                    if (col.minWidth) sx.minWidth = scaleColumnWidth(col.minWidth);
                                    if (col.maxWidth) sx.maxWidth = scaleColumnWidth(col.maxWidth);

                                    if (isPinnedRight(col.field)) {
                                        sx.position = "sticky";
                                        sx.right = 0;
                                        sx.zIndex = 3;
                                        sx.borderLeft = "1px solid var(--lightgrey)";
                                    }

                                    return (
                                        <TableCell key={col.field} sx={sx}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.3 }}>
                                                {/* Sort area */}
                                                <Box
                                                    onClick={() => handleSort(col)}
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.4,
                                                        cursor: col.sortable === false ? "default" : "pointer",
                                                        flex: 1,
                                                    }}
                                                >
                                                    {col.headerName}
                                                    {col.sortable !== false && (
                                                        <Box component="span"
                                                            sx={{ fontSize: 12, color: sortModel.field === col.field ? "text.primary" : "#bbb" }}>
                                                            {sortModel.field === col.field
                                                                ? (sortModel.direction === "asc" ? "▲" : "▼")
                                                                : "↕"}
                                                        </Box>
                                                    )}
                                                </Box>

                                                {/* Filter icon — only for filterable columns */}
                                                {col.filterable && (
                                                    <Tooltip title={hasFilter ? "Filter active — click to edit" : "Filter"}>
                                                        <IconButton
                                                            size="small"
                                                            onClick={(e) => openFilterPopover(e, col)}
                                                            sx={{
                                                                p: 0.3,
                                                                color: hasFilter ? "primary.main" : "text.disabled",
                                                                "&:hover": { color: "primary.main", bgcolor: "primary.50" },
                                                                borderRadius: 0.8,
                                                            }}
                                                        >
                                                            <Badge
                                                                variant="dot"
                                                                color="primary"
                                                                invisible={!hasFilter}
                                                                sx={{ "& .MuiBadge-dot": { width: 5, height: 5, minWidth: 5 } }}
                                                            >
                                                                <FilterAltIcon sx={{ fontSize: 15 }} />
                                                            </Badge>
                                                        </IconButton>
                                                    </Tooltip>
                                                )}
                                            </Box>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        {/* BODY */}
                        <TableBody>
                            {displayRows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={orderedColumns.length + 1} sx={{ height: 260 }}>
                                        <NoRowsOverlay subtitle={emptySubtitle} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayRows.map((row) => (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        onDoubleClick={() => onRowDoubleClick?.(row)}
                                        sx={{ "&:hover": { bgcolor: "#f0f4ff" } }}
                                    >
                                        {checkboxSelection && (
                                            <TableCell padding="checkbox">
                                                <Checkbox checked={selectedIds.includes(row.id)} onChange={() => toggleRow(row.id)} />
                                            </TableCell>
                                        )}
                                        {orderedColumns.map((col) => {
                                            const cellSx = { fontSize: 15, py: 0.8 };
                                            if (col.minWidth) cellSx.minWidth = scaleColumnWidth(col.minWidth);
                                            if (col.maxWidth) cellSx.maxWidth = scaleColumnWidth(col.maxWidth);
                                            if (isPinnedRight(col.field)) {
                                                cellSx.position = "sticky";
                                                cellSx.right = 0;
                                                cellSx.background = "#fff";
                                                cellSx.zIndex = 2;
                                                cellSx.borderLeft = "1px solid var(--lightgrey)";
                                            }
                                            const rawValue = row[col.field] ?? "—";
                                            const cellContent = col.renderCell
                                                ? col.renderCell({ value: row[col.field], row })
                                                : (
                                                    <Tooltip title={String(rawValue)} placement="top-start" disableInteractive enterDelay={300}>
                                                        <Box
                                                            style={{
                                                                display: "-webkit-box",
                                                                WebkitLineClamp: 1,
                                                                WebkitBoxOrient: "vertical",
                                                                overflow: "hidden",
                                                                wordBreak: "break-word",
                                                            }}
                                                        >
                                                            {rawValue}
                                                        </Box>
                                                    </Tooltip>
                                                );
                                            return (
                                                <TableCell key={col.field} sx={cellSx}>
                                                    {cellContent}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                {infiniteScroll && resolvedLoading && (
                    <Box sx={{ px: 2, pb: 1 }}>
                        <LinearProgress sx={{ height: 3, borderRadius: 2 }} />
                    </Box>
                )}

                {infiniteScroll && !resolvedLoading && !canLoadMore && (resolvedRows?.length || 0) > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 2, py: 1 }}>
                        <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                        <Typography variant="caption" sx={{ color: "text.disabled", fontWeight: 500, whiteSpace: "nowrap" }}>
                            {endOfResultsMessage}
                        </Typography>
                        <Box sx={{ flex: 1, height: "1px", bgcolor: "divider" }} />
                    </Box>
                )}
            </Box>


            {/* ── COLUMN FILTER POPOVER ── */}
            <Popover
                open={!!filterPopover}
                anchorEl={filterPopover?.el}
                onClose={closeFilterPopover}
                anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
                transformOrigin={{ vertical: "top", horizontal: "left" }}
                PaperProps={{
                    elevation: 4,
                    sx: { borderRadius: 1.5, minWidth: 240, mt: 0.5 },
                }}
            >
                {activeCol && (
                    <Box>
                        {/* Popover header */}
                        <Box sx={{
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            px: 2, py: 1.2, borderBottom: "1px solid", borderColor: "divider",
                            bgcolor: "var(--lightgrey, #f5f5f5)",
                        }}>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                                <FilterAltIcon sx={{ fontSize: 16, color: "primary.main" }} />
                                <Typography sx={{ fontWeight: 600, fontSize: 15 }}>
                                    {activeCol.headerName}
                                </Typography>
                            </Box>
                            {filters[activeCol.field] != null &&
                                filters[activeCol.field] !== "" &&
                                !(Array.isArray(filters[activeCol.field]) && filters[activeCol.field].length === 0) && (
                                    <Tooltip title="Clear this filter">
                                        <IconButton size="small"
                                            onClick={(e) => { clearColumnFilter(activeCol.field, e); closeFilterPopover(); }}
                                            sx={{ color: "error.main", p: 0.4 }}>
                                            <FilterAltOffIcon sx={{ fontSize: 15 }} />
                                        </IconButton>
                                    </Tooltip>
                                )}
                        </Box>

                        {/* Popover body */}
                        <Box sx={{ px: 2, py: 1.8, display: "flex", flexDirection: "column", gap: 1.5 }}>

                            {isSelectFilter ? (
                                /* ---- SELECT OPTIONS ---- */
                                <Box sx={{ maxHeight: 220, overflowY: "auto" }}>
                                    {activeCol.valueOptions?.map((opt) => {
                                        const val = typeof opt === "object" ? opt.value : opt;
                                        const label = typeof opt === "object" ? opt.label : opt;
                                        const checked = Array.isArray(draftValue)
                                            ? draftValue.includes(val)
                                            : draftValue === val;
                                        return (
                                            <Box
                                                key={val}
                                                onClick={() => {
                                                    setDraftValue((prev) => {
                                                        const arr = Array.isArray(prev) ? prev : [];
                                                        return arr.includes(val)
                                                            ? arr.filter((v) => v !== val)
                                                            : [...arr, val];
                                                    });
                                                }}
                                                sx={{
                                                    display: "flex", alignItems: "center", gap: 1,
                                                    px: 1, py: 0.6, borderRadius: 1, cursor: "pointer",
                                                    "&:hover": { bgcolor: "action.hover" },
                                                    bgcolor: checked ? "primary.50" : "transparent",
                                                }}
                                            >
                                                <Box sx={{
                                                    width: 16, height: 16, borderRadius: 0.5, border: "2px solid",
                                                    borderColor: checked ? "primary.main" : "divider",
                                                    bgcolor: checked ? "primary.main" : "transparent",
                                                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                                                }}>
                                                    {checked && (
                                                        <Box component="span" sx={{ color: "#fff", fontSize: 10, lineHeight: 1, fontWeight: 700 }}>✓</Box>
                                                    )}
                                                </Box>
                                                <Typography sx={{ fontSize: 15 }}>{label}</Typography>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                /* ---- TEXT / NUMBER ---- */
                                <>
                                    <Select
                                        size="small"
                                        fullWidth
                                        value={draftOperator}
                                        onChange={(e) => setDraftOperator(e.target.value)}
                                        sx={{ fontSize: 15 }}
                                    >
                                        <MenuItem value="contains" sx={{ fontSize: 15 }}>contains</MenuItem>
                                        <MenuItem value="=" sx={{ fontSize: 15 }}>equals</MenuItem>
                                        {activeCol.type === "number" && [
                                            <MenuItem key=">" value=">" sx={{ fontSize: 15 }}>greater than (&gt;)</MenuItem>,
                                            <MenuItem key="<" value="<" sx={{ fontSize: 15 }}>less than (&lt;)</MenuItem>,
                                            <MenuItem key=">=" value=">=" sx={{ fontSize: 15 }}>greater or equal (&gt;=)</MenuItem>,
                                            <MenuItem key="<=" value="<=" sx={{ fontSize: 15 }}>less or equal (&lt;=)</MenuItem>,
                                        ]}
                                    </Select>

                                    <TextField
                                        size="small"
                                        fullWidth
                                        autoFocus
                                        placeholder={`Enter ${activeCol.headerName.toLowerCase()}…`}
                                        value={draftValue}
                                        onChange={(e) => setDraftValue(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === "Enter") applyColumnFilter(); }}
                                        sx={{ "& .MuiOutlinedInput-root": { fontSize: 15, borderRadius: 1 } }}
                                    />
                                </>
                            )}
                        </Box>

                        {/* Popover footer — Apply */}
                        <Box sx={{
                            display: "flex", justifyContent: "flex-end", gap: 1,
                            px: 2, py: 1.2, borderTop: "1px solid", borderColor: "divider",
                        }}>
                            <Button size="small" variant="outlined" onClick={closeFilterPopover} sx={{ fontSize: 15 }}>
                                Cancel
                            </Button>
                            <Button
                                size="small"
                                variant="contained"
                                onClick={applyColumnFilter}
                                startIcon={<FilterAltIcon sx={{ fontSize: 16 }} />}
                                sx={{ fontSize: 15, borderRadius: 1 }}
                            >
                                Apply
                            </Button>
                        </Box>
                    </Box>
                )}
            </Popover>
        </Paper>
    );
}
