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
    ListItemText,
    CircularProgress,
    Collapse,
    Badge,
    LinearProgress,
} from "@mui/material";

import TuneIcon from "@mui/icons-material/Tune";
import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import FilterListIcon from "@mui/icons-material/FilterList";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
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
    searchOnButton = false,
    externalSearch: externalSearchProp = "",
    onExternalSearchChange,
    searchPlaceholder = "Search",
    searchMinLength = 3,
    emptySubtitle = "No records found. Add new data to get started.",
    minHeight = 390,
    pickerSelected = false,
    hidePagination = false,
    infiniteScroll = false,
    infiniteScrollHasMore,
    endOfResultsMessage = "No more data",
    checkboxDisabled = false,
    hideColumnSettings = false,
    hideSearch = false,
    preselectedIds = [],
    tableName,
    tableKey = "default",
    rowDraggable = false,
    onRowReorder,
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
    const [pinnedRight, setPinnedRight] = React.useState(
        () => columns.filter((c) => c.pinned === "right").map((c) => c.field)
    );

    const [filters, setFilters] = React.useState({});
    const [operators, setOperators] = React.useState({});
    const [anchorEl, setAnchorEl] = React.useState(null);
    const [dragSrcIdx, setDragSrcIdx] = React.useState(null);
    const [dragOverIdx, setDragOverIdx] = React.useState(null);
    const [filterPanelOpen, setFilterPanelOpen] = React.useState(false);
    const [localExternalSearch, setLocalExternalSearch] = React.useState(externalSearchProp);
    const searchDebounceRef = React.useRef(null);
    const skipNextFetchRef = React.useRef(false);
    const loadMoreLockRef = React.useRef(null);
    const prevLoadingRef = React.useRef(false);
    const searchResetInitializedRef = React.useRef(false);

    React.useEffect(() => {
        setLocalExternalSearch(externalSearchProp);
    }, [externalSearchProp]);
    const normalizedExternalSearch = (localExternalSearch || "").trim();
    const searchActive = normalizedExternalSearch.length >= searchMinLength;

    React.useEffect(() => {
        if (!serverSide) return;

        if (!searchResetInitializedRef.current) {
            searchResetInitializedRef.current = true;
            return;
        }

        skipNextFetchRef.current = true;
        lastQueryRef.current = null;
        setPage(0);
    }, [externalSearchProp, serverSide, infiniteScroll]);

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
        params.set("table", tableName);
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
        });

        // include global search if provided (use prop if provided, otherwise local)
        const rawSearch = (externalSearchProp || localExternalSearch || "").trim();
        const effectiveExternalSearch = rawSearch.length >= searchMinLength ? rawSearch : "";
        if (effectiveExternalSearch) params.set("q", effectiveExternalSearch);

        return params.toString();
    }, [page, rowsPerPage, sortModel, filters, operators, columns, externalSearchProp, localExternalSearch, searchMinLength]);


    /* ================= FETCH DATA ================= */
    const initialLoadRef = React.useRef(false);
    const [searchCounter, setSearchCounter] = React.useState(0);
    const lastQueryRef = React.useRef(null);

    React.useEffect(() => {
        if (!serverSide || !onFetchData) return;

        if (skipNextFetchRef.current) {
            skipNextFetchRef.current = false;
            return;
        }

        const query = buildQueryString();

        // prevent duplicate identical requests
        if (lastQueryRef.current === query) return;

        if (searchOnButton) {
            // always perform an initial load once
            if (!initialLoadRef.current) {
                initialLoadRef.current = true;
                lastQueryRef.current = query;
                onFetchData(query);
                return;
            }

            // subsequent loads only when user clicks Search
            if (searchCounter > 0) {
                lastQueryRef.current = query;
                onFetchData(query);
                setSearchCounter(0);
            }
        } else {
            lastQueryRef.current = query;
            onFetchData(query);
        }
    }, [buildQueryString, onFetchData, searchOnButton, searchCounter, externalSearchProp, localExternalSearch]);

    /* ================= HELPERS ================= */
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

    // Pixel minWidth for the table — allows horizontal scroll when columns exceed the container.
    // Using a pixel value (not "100%") avoids the CSS trap where minWidth: 100% inside
    // an overflow:auto container resolves to the container's clientWidth, preventing scroll.
    const totalMinWidth = React.useMemo(() => {
        const colsTotal = orderedColumns.reduce((sum, col) => sum + (col.minWidth || 120), 0);
        return colsTotal + (checkboxSelection ? 48 : 0) + (rowDraggable ? 40 : 0);
    }, [orderedColumns, checkboxSelection, rowDraggable]);

    /* ================= LOCAL PROCESSING (filters / sort / paginate) ================= */
    const processedRows = React.useMemo(() => {
        if (serverSide) return rows || [];

        let out = Array.isArray(rows) ? [...rows] : [];

        if (searchActive) {
            const searchTerm = normalizedExternalSearch.toLowerCase();
            out = out.filter((row) =>
                columns.some((col) => {
                    const rawValue = row?.[col.field];

                    if (rawValue == null) return false;

                    if (Array.isArray(rawValue)) {
                        return rawValue.some((item) => {
                            const normalizedItem = item && typeof item === "object"
                                ? item.label ?? item.value ?? item.id ?? ""
                                : item;
                            return String(normalizedItem).toLowerCase().includes(searchTerm);
                        });
                    }

                    const normalizedValue = rawValue && typeof rawValue === "object"
                        ? rawValue.label ?? rawValue.value ?? rawValue.id ?? ""
                        : rawValue;

                    return String(normalizedValue).toLowerCase().includes(searchTerm);
                })
            );
        }

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
    }, [serverSide, rows, columns, filters, operators, sortModel, searchActive, normalizedExternalSearch]);

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

    const toggleAllRows = () => {
        const pageIds = displayRows.map((r) => r.id);
        const allChecked = pageIds.every((id) => selectedIds.includes(id));
        setSelectedIds((prev) => {
            const updated = allChecked
                ? prev.filter((id) => !pageIds.includes(id))
                : Array.from(new Set([...prev, ...pageIds]));
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

    React.useEffect(() => {
        return () => {
            if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
        };
    }, []);

    React.useEffect(() => {
        if (prevLoadingRef.current && !loading) {
            loadMoreLockRef.current = null;
        }
        prevLoadingRef.current = loading;
    }, [loading]);

    // Merge externally provided pre-selected IDs into internal checkbox state.
    // Tracked by ref so user deselections are not overridden on subsequent fetches.
    const preselectedAppliedRef = React.useRef(new Set());
    React.useEffect(() => {
        if (!preselectedIds || preselectedIds.length === 0) return;
        const newIds = preselectedIds.filter((id) => !preselectedAppliedRef.current.has(id));
        if (newIds.length === 0) return;
        newIds.forEach((id) => preselectedAppliedRef.current.add(id));
        setSelectedIds((prev) => {
            const merged = Array.from(new Set([...prev, ...newIds]));
            onSelectionChange?.(merged);
            return merged;
        });
    }, [preselectedIds]); // eslint-disable-line

    /* ========================================================= */

    /* ================= ACTIVE FILTER COUNT ================= */
    const activeFilterCount = React.useMemo(
        () =>
            Object.values(filters).filter(
                (v) => v != null && v !== "" && (Array.isArray(v) ? v.length > 0 : true)
            ).length,
        [filters]
    );

    const hasFilterableColumns = columns.some((c) => c.filterable);
    const canLoadMore = React.useMemo(() => {
        if (!infiniteScroll) return false;
        if (loading) return false;
        if (typeof infiniteScrollHasMore === "boolean") return infiniteScrollHasMore;
        if (serverSide) return (rows?.length || 0) < totalCount;
        return displayRows.length < processedRows.length;
    }, [displayRows.length, infiniteScroll, infiniteScrollHasMore, loading, processedRows.length, rows?.length, serverSide, totalCount]);

    const handleInfiniteScroll = React.useCallback((event) => {
        if (!infiniteScroll || !canLoadMore || loading) return;

        const target = event.currentTarget;
        const threshold = 98;
        const scrollPercentage = ((target.scrollTop + target.clientHeight) / target.scrollHeight) * 100;
        const nextPage = page + 1;

        if (scrollPercentage >= threshold && loadMoreLockRef.current !== nextPage) {
            loadMoreLockRef.current = nextPage;
            setPage(nextPage);
        }
    }, [canLoadMore, infiniteScroll, loading, page]);

    const scaleColumnWidth = React.useCallback(
        (width, min = 56) => {
            if (typeof width !== "number") return width;
            if (!pickerSelected) return width;
            return Math.max(min, Math.round(width * 0.78));
        },
        [pickerSelected]
    );

    return (
        <Paper sx={{ width: "100%", maxWidth: "100%" }}>
            {/* ================= TOOLBAR ================= */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    // px: pickerSelected ? 0 : 3,
                    py: pickerSelected ? 1.5 : 2.5,
                    pt: 0,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                    // minHeight: 52,
                }}
            >
                {/* Filter toggle button — Azure DevOps style */}
                {hasFilterableColumns && (
                    <Badge
                        badgeContent={activeFilterCount}
                        color="primary"
                        sx={{
                            "& .MuiBadge-badge": {
                                fontSize: 10,
                                height: 16,
                                minWidth: 16,
                                top: 4,
                                right: 4,
                            },
                        }}
                    >
                        <Button
                            size="small"
                            variant={filterPanelOpen ? "contained" : "outlined"}
                            startIcon={<FilterListIcon fontSize="medium" />}
                            onClick={() => setFilterPanelOpen((p) => !p)}
                        >
                            Filter
                        </Button>
                    </Badge>
                )}

                {/* Clear all — enabled only when filters are active */}
                {hasFilterableColumns && (
                    <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ClearIcon fontSize="medium" />}
                        disabled={activeFilterCount === 0}
                        onClick={() => {
                            clearFilters();
                            setSearchCounter((c) => c + 1);
                        }}
                        sx={{
                            display: activeFilterCount > 0 ? "flex" : "none",
                        }}
                    >
                        Clear all
                    </Button>
                )}

                {/* Active filter chips — visible when panel is closed */}
                {!filterPanelOpen &&
                    columns
                        .filter((c) => c.filterable && filters[c.field] != null && filters[c.field] !== "" && !(Array.isArray(filters[c.field]) && filters[c.field].length === 0))
                        .map((col) => {
                            const val = filters[col.field];
                            const label = Array.isArray(val) ? val.join(", ") : val;
                            return (
                                <Chip
                                    key={col.field}
                                    size="medium"
                                    label={
                                        <Typography component="span" sx={{ fontSize: 15 }}>
                                            <strong>{col.headerName}:</strong> {label}
                                        </Typography>
                                    }
                                    onDelete={() =>
                                        setFilters((p) => {
                                            const next = { ...p };
                                            delete next[col.field];
                                            return next;
                                        })
                                    }
                                    sx={{
                                        height: 31,
                                        borderRadius: 1,
                                        p: 1,
                                        backgroundColor: "var(--surface2)",
                                        border: "1px solid",
                                        borderColor: "primary.200",
                                        "& .MuiChip-deleteIcon": { fontSize: 19 },
                                    }}
                                />
                            );
                        })}

                {/* Spacer */}
                <Box sx={{ flex: 1 }} />

                {/* Column visibility */}
                {!pickerSelected && !hideColumnSettings && <Tooltip title="Column settings">
                    <IconButton
                        size="small"
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 1,
                            p: 0.6,
                            color: "text.secondary",
                            "&:hover": { borderColor: "var(--primary)", color: "var(--primary)" },
                        }}
                    >
                        <TuneIcon fontSize="small" />
                    </IconButton>
                </Tooltip>}

                {/* Global search */}
                {!hideSearch && (
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
                            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: "text.disabled" }} />,
                            endAdornment: (
                                <Tooltip title={searchActive ? "Search active" : `Search activates when ${searchMinLength}+ characters are entered`}>
                                    <IconButton size="small" sx={{ p: 0.5 }} disableRipple>
                                        <InfoOutlinedIcon
                                            sx={{ color: searchActive ? "var(--primary)" : "text.disabled" }}
                                            fontSize="small"
                                        />
                                    </IconButton>
                                </Tooltip>
                            ),
                        }}
                        sx={{
                            width: pickerSelected ? 220 : 240,
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 1,
                                fontSize: 16,
                            },
                        }}
                    />
                )}
            </Box>

            {/* ================= COLLAPSIBLE FILTER PANEL ================= */}
            <Collapse in={filterPanelOpen} timeout={260}>
                <Box
                    sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 2,
                        alignItems: "flex-end",
                        px: 2,
                        py: 2,
                        // background: "linear-gradient(135deg, #f5f7ff 0%, #eef1f8 100%)",
                        borderBottom: "1px solid",
                        borderColor: "divider",
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

                            const isActive = Array.isArray(raw)
                                ? raw.length > 0
                                : raw != null && raw !== "";

                            /* shared card wrapper */
                            const cardSx = {
                                display: "flex",
                                flexDirection: "column",
                                gap: 0.6,
                                minWidth: 220,
                                backgroundColor: "#fff",
                                border: "1.5px solid",
                                borderColor: isActive ? "var(--primary)" : "#dde1ea",
                                borderRadius: 0.5,
                                px: 1.5,
                                py: 1.2,
                                boxShadow: isActive
                                    ? "0 0 0 3px rgba(25,118,210,0.08)"
                                    : "0 1px 4px rgba(0,0,0,0.06)",
                                transition: "border-color 0.2s, box-shadow 0.2s",
                                "&:hover": {
                                    boxShadow: 2,
                                },
                            };

                            /* ---- SELECT FILTER ---- */
                            if (col.type === "select") {
                                return (
                                    <Box key={col.field} sx={cardSx}>
                                        <Typography
                                            sx={{
                                                fontSize: 16,
                                                fontWeight: 700,
                                                color: isActive ? "var(--primary)" : "text.disabled",
                                                textTransform: "uppercase",
                                                letterSpacing: 0.6,
                                                transition: "color 0.2s",
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
                                                    <Typography sx={{ fontSize: 16, color: "text.disabled" }}>All</Typography>
                                                ) : (
                                                    <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                                        {selected.map((v) => (
                                                            <Chip key={v} size="small" label={v} color="primary" variant="outlined" sx={{ height: 22, fontSize: 13 }} />
                                                        ))}
                                                    </Box>
                                                )
                                            }
                                            sx={{
                                                fontSize: 16,
                                                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                                "& .MuiSelect-select": { px: 0, py: 0.3 },
                                                backgroundColor: "transparent",
                                            }}
                                        >
                                            {col.valueOptions?.map((opt) => {
                                                const val = typeof opt === "object" ? opt.value : opt;
                                                const label = typeof opt === "object" ? opt.label : opt;
                                                return (
                                                    <MenuItem key={val} value={val} sx={{ p: 0.3 }}>
                                                        <Checkbox size="small" checked={value.includes(val)} />
                                                        <ListItemText primary={label} primaryTypographyProps={{ fontSize: 16 }} />
                                                    </MenuItem>
                                                );
                                            })}
                                        </Select>
                                    </Box>
                                );
                            }

                            /* ---- TEXT / NUMBER FILTER ---- */
                            return (
                                <Box key={col.field} sx={cardSx}>
                                    <Typography
                                        sx={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: isActive ? "var(--primary)" : "text.disabled",
                                            textTransform: "uppercase",
                                            letterSpacing: 0.6,
                                            transition: "color 0.2s",
                                        }}
                                    >
                                        {col.headerName}
                                    </Typography>
                                    <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                                        <Select
                                            size="small"
                                            value={operators[col.field] || "contains"}
                                            onChange={(e) =>
                                                setOperators((p) => ({
                                                    ...p,
                                                    [col.field]: e.target.value,
                                                }))
                                            }
                                            sx={{
                                                fontSize: 14,
                                                minWidth: 108,
                                                color: "text.secondary",
                                                "& .MuiOutlinedInput-notchedOutline": {
                                                    borderColor: "#e0e3eb",
                                                },
                                                borderRadius: 1.5,
                                                backgroundColor: "#f5f6fa",
                                            }}
                                        >
                                            <MenuItem value="contains" sx={{ fontSize: 16 }}>contains</MenuItem>
                                            <MenuItem value="=" sx={{ fontSize: 16 }}>equals</MenuItem>
                                            {col.type === "number" && (
                                                <>
                                                    <MenuItem value=">" sx={{ fontSize: 16 }}>&gt;</MenuItem>
                                                    <MenuItem value="<" sx={{ fontSize: 16 }}>&lt;</MenuItem>
                                                    <MenuItem value=">=" sx={{ fontSize: 16 }}>&gt;=</MenuItem>
                                                    <MenuItem value="<=" sx={{ fontSize: 16 }}>&lt;=</MenuItem>
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
                                            sx={{
                                                flex: 1,
                                                "& .MuiOutlinedInput-root": {
                                                    fontSize: 16,
                                                    borderRadius: 1.5,
                                                    "& fieldset": { borderColor: "#e0e3eb" },
                                                    "&:hover fieldset": { borderColor: "var(--primary)" },
                                                },
                                            }}
                                        />
                                    </Box>
                                </Box>
                            );
                        })}

                </Box>
            </Collapse>

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
            <Box
                sx={{
                    height: "100%",
                    minHeight,
                    display: "flex",
                    flexDirection: "column",
                    // px: pickerSelected ? 0 : 3,
                    py: pickerSelected ? 1.5 : 2.5,
                    // borderRadius: 1,
                    // boxShadow: 2,
                    overflow: "hidden",
                    // background: "background.paper",
                }}
            >
                <TableContainer
                    sx={{
                        flex: 1,
                        width: "100%",
                        maxHeight,
                        overflow: "auto",
                    }}
                    onScroll={handleInfiniteScroll}
                >
                    <Table
                        stickyHeader
                        sx={{ minWidth: totalMinWidth }}
                    >
                        {/* HEADER */}
                        <TableHead>
                            <TableRow >
                                {rowDraggable && (
                                    <TableCell sx={{ width: 40, background: "var(--primaryLight)", p: 0 }} />
                                )}
                                {checkboxSelection && (
                                    <TableCell padding="checkbox" sx={{ background: "var(--primaryLight)" }}>
                                        <Checkbox
                                            checked={displayRows.length > 0 && displayRows.every((r) => selectedIds.includes(r.id))}
                                            indeterminate={
                                                displayRows.some((r) => selectedIds.includes(r.id)) &&
                                                !displayRows.every((r) => selectedIds.includes(r.id))
                                            }
                                            onChange={toggleAllRows}
                                            disabled={checkboxDisabled}
                                        />
                                    </TableCell>
                                )}
                                {orderedColumns.map((col) => {
                                    const sx = {
                                        fontWeight: 600,
                                        fontSize: "16px",
                                        background: "var(--primaryLight)",
                                        color: "#333333",
                                        cursor: col.sortable === false ? "default" : "pointer",
                                        whiteSpace: "nowrap",
                                        py: 1,
                                        userSelect: "none",
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
                                        <TableCell
                                            key={col.field}
                                            onClick={() => handleSort(col)}
                                            sx={sx}
                                        >
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                                {col.headerName}
                                                {col.sortable !== false && (
                                                    <Box component="span" sx={{ fontSize: "11px", lineHeight: 1, color: sortModel.field === col.field ? "#333" : "#bbb" }}>
                                                        {sortModel.field === col.field
                                                            ? (sortModel.direction === "asc" ? "▲" : "▼")
                                                            : "↕"}
                                                    </Box>
                                                )}
                                            </Box>
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        </TableHead>

                        {/* BODY */}
                        <TableBody>
                            {false ? (
                                <TableRow>
                                    {/* <TableCell
                                        colSpan={orderedColumns.length + 1}
                                        align="center"
                                        sx={{ height: 300 }} // 🔥 center loader
                                    >
                                        <Box display="flex" justifyContent="center" alignItems="center">
                                            <CircularProgress size={28} />
                                        </Box>
                                    </TableCell> */}
                                </TableRow>
                            ) : displayRows.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={orderedColumns.length + 1}
                                        sx={{ height: 300 }} // 🔥 center empty state
                                    >
                                        <NoRowsOverlay subtitle={emptySubtitle} />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                displayRows.map((row, index) => (
                                    <TableRow
                                        key={row.id}
                                        hover
                                        draggable={rowDraggable}
                                        onDragStart={rowDraggable ? () => setDragSrcIdx(index) : undefined}
                                        onDragOver={rowDraggable ? (e) => { e.preventDefault(); setDragOverIdx(index); } : undefined}
                                        onDragEnd={rowDraggable ? () => { setDragSrcIdx(null); setDragOverIdx(null); } : undefined}
                                        onDrop={rowDraggable ? (e) => {
                                            e.preventDefault();
                                            if (dragSrcIdx === null || dragSrcIdx === index) {
                                                setDragSrcIdx(null);
                                                setDragOverIdx(null);
                                                return;
                                            }
                                            const newRows = [...displayRows];
                                            const [moved] = newRows.splice(dragSrcIdx, 1);
                                            newRows.splice(index, 0, moved);
                                            onRowReorder?.(newRows);
                                            setDragSrcIdx(null);
                                            setDragOverIdx(null);
                                        } : undefined}
                                        onDoubleClick={() => onRowDoubleClick?.(row)}
                                        sx={{
                                            transition: "0.2s",
                                            opacity: dragSrcIdx === index ? 0.4 : 1,
                                            borderTop: dragOverIdx === index && dragSrcIdx !== index
                                                ? "2px solid var(--primary)"
                                                : undefined,
                                            cursor: rowDraggable ? (dragSrcIdx === index ? "grabbing" : "grab") : "default",
                                            "&:nth-of-type(even)": {
                                                backgroundColor: "#fafafa",
                                            },
                                            "&:hover": {
                                                backgroundColor: "#dbeafe",
                                            },
                                        }}
                                    >
                                        {rowDraggable && (
                                            <TableCell sx={{ width: 40, p: 0, pl: 0.5, color: "text.disabled" }}>
                                                <DragIndicatorIcon fontSize="small" />
                                            </TableCell>
                                        )}
                                        {checkboxSelection && (
                                            <TableCell padding="checkbox">
                                                <Checkbox
                                                    checked={selectedIds.includes(row.id)}
                                                    onChange={() => !checkboxDisabled && toggleRow(row.id)}
                                                    disabled={checkboxDisabled}
                                                />
                                            </TableCell>
                                        )}

                                        {orderedColumns.map((col) => {
                                            const cellSx = {
                                                fontSize: "14px",
                                                py: 0.6,
                                            };

                                            if (col.minWidth) cellSx.minWidth = scaleColumnWidth(col.minWidth);
                                            if (col.maxWidth) cellSx.maxWidth = scaleColumnWidth(col.maxWidth);

                                            if (isPinnedRight(col.field)) {
                                                cellSx.position = "sticky";
                                                cellSx.right = 0;
                                                cellSx.background = "#fff";
                                                cellSx.zIndex = 2;
                                                cellSx.borderLeft = "1px solid var(--lightgrey)";
                                            }

                                            const rawValue = row[col.field] ?? "-";
                                            const cellContent = col.renderCell
                                                ? col.renderCell({ value: row[col.field], row })
                                                : (
                                                    <Tooltip
                                                        title={String(rawValue)}
                                                        placement="top-start"
                                                        disableInteractive
                                                        enterDelay={300}
                                                    >
                                                        {/* style (not sx) is required — Emotion strips WebkitBoxOrient */}
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

                {infiniteScroll && loading && (
                    <Box sx={{ px: 2, pb: 1 }}>
                        <LinearProgress
                            sx={{
                                height: 3,
                                borderRadius: 2,
                                backgroundColor: "color-mix(in srgb, var(--primary) 20%, transparent)",
                                "& .MuiLinearProgress-bar": {
                                    backgroundColor: "var(--primary)",
                                    borderRadius: 2,
                                },
                            }}
                        />
                    </Box>
                )}

                {infiniteScroll && !loading && !canLoadMore && (rows?.length || 0) > 0 && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, px: 3, py: 1.2 }}>
                        <Box sx={{ flex: 1, height: "1px", backgroundColor: "color-mix(in srgb, var(--primary) 25%, transparent)", borderRadius: 1 }} />
                        <Typography
                            variant="caption"
                            sx={{
                                color: "color-mix(in srgb, var(--primary) 70%, transparent)",
                                fontWeight: 500,
                                letterSpacing: "0.05em",
                                whiteSpace: "nowrap",
                                fontSize: "0.7rem",
                            }}
                        >
                            {endOfResultsMessage}
                        </Typography>
                        <Box sx={{ flex: 1, height: "1px", backgroundColor: "color-mix(in srgb, var(--primary) 25%, transparent)", borderRadius: 1 }} />
                    </Box>
                )}
            </Box>

            {/* ================= PAGINATION ================= */}
            {!hidePagination && !infiniteScroll && (
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
                    labelRowsPerPage="Records to Show"
                    labelDisplayedRows={({ from, to, count }) => `Showing ${from} - ${to} of ${count}`}
                    sx={{ px: 2 }}
                />
            )}
        </Paper>
    );
}
