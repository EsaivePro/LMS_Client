import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Autocomplete,
    Box,
    Chip,
    MenuItem,
    Paper,
    Stack,
    TextField,
    Typography,
} from "@mui/material";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import HistoryIcon from "@mui/icons-material/History";
import HubOutlinedIcon from "@mui/icons-material/HubOutlined";
import DataTableV2 from "../../../components/common/table/DataTableV2";
import CustomDateTimePicker from "../../../components/common/datepicker/CustomDateTimePicker";
import { httpClient } from "../../../apiClient/httpClient";
import useCommon from "../../../hooks/useCommon";

const AUDIT_COLUMNS = [
    "id",
    "user_id",
    "action",
    "entity",
    "entity_id",
    "status",
    "source",
    "note",
    "changes",
    "metadata",
    "ip_address",
    "created_at",
];

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const toDateValue = (value) => {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
};

const parsePayload = (value) => {
    if (!value) return null;
    if (typeof value === "object") return value;
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
};

const buildStatusChipColor = (status) => {
    const normalized = String(status || "").toLowerCase();
    if (normalized === "success") return "success";
    if (normalized === "failure") return "error";
    if (normalized === "partial") return "warning";
    return "default";
};

const buildActionChipSx = (action) => {
    const normalized = String(action || "").toLowerCase();

    if (["create", "insert", "assign", "upload", "login"].includes(normalized)) {
        return { color: "success.main", backgroundColor: "rgba(34,197,94,0.12)" };
    }

    if (["update", "edit"].includes(normalized)) {
        return { color: "warning.main", backgroundColor: "rgba(245,158,11,0.14)" };
    }

    if (["delete", "remove"].includes(normalized)) {
        return { color: "error.main", backgroundColor: "rgba(239,68,68,0.12)" };
    }

    return { color: "info.main", backgroundColor: "rgba(59,130,246,0.12)" };
};

const getDefaultDateRange = () => {
    const now = new Date();

    const from = new Date(now);
    from.setHours(0, 0, 0, 0);

    const to = new Date(now);
    to.setHours(23, 59, 59, 999);

    return {
        from: from.toISOString(),
        to: to.toISOString(),
    };
};

export default function AuditLogPage() {
    const { setTitleContainer, setContainerDescription, showError, showLoader, hideLoader } = useCommon();
    const showErrorRef = useRef(showError);
    const showLoaderRef = useRef(showLoader);
    const hideLoaderRef = useRef(hideLoader);
    const setTitleContainerRef = useRef(setTitleContainer);
    const setContainerDescriptionRef = useRef(setContainerDescription);
    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [filters, setFilters] = useState(() => {
        const defaultRange = getDefaultDateRange();
        return {
            user: null,
            action: "",
            status: "",
            entity: "",
            search: "",
            from: defaultRange.from,
            to: defaultRange.to,
        };
    });

    useEffect(() => {
        showErrorRef.current = showError;
        showLoaderRef.current = showLoader;
        hideLoaderRef.current = hideLoader;
        setTitleContainerRef.current = setTitleContainer;
        setContainerDescriptionRef.current = setContainerDescription;
    });

    useEffect(() => {
        setTitleContainerRef.current?.("Audit Logs");
        setContainerDescriptionRef.current?.("Review system activity, status, and actor-level changes.");
    }, []);

    const loadUsers = useCallback(async (searchText = "") => {
        try {
            const response = await httpClient.formSearch({
                table: "users",
                columns: ["id", "username", "email"],
                where: {},
                globalSearch: searchText,
                limit: 10,
            });

            const list = response?.data?.response?.data || response?.data?.response || response?.data || [];
            setUserOptions(
                list.map((item) => ({
                    id: item.id,
                    label: item.username || item.email || `User ${item.id}`,
                    email: item.email || "",
                }))
            );
        } catch (error) {
            console.error("Failed to load users", error);
        }
    }, []);

    const loadAuditLogs = useCallback(async () => {
        setLoading(true);
        showLoaderRef.current?.("Loading audit logs...");
        try {
            const where = {
                ...(filters.user?.id ? { user_id: filters.user.id } : {}),
                ...(filters.action ? { action: filters.action } : {}),
                ...(filters.status ? { status: filters.status } : {}),
                ...(filters.entity ? { entity: filters.entity } : {}),
            };

            const response = await httpClient.formSearch({
                table: "audit_logs",
                columns: AUDIT_COLUMNS,
                where,
                globalSearch: filters.search,
                limit: 50,
            });

            const list = response?.data?.response?.data || response?.data?.response || response?.data || [];
            const userIds = [...new Set(list.map((item) => item.user_id).filter(Boolean))];

            let userMap = new Map();
            if (userIds.length) {
                const usersResponse = await httpClient.formSearch({
                    table: "users",
                    columns: ["id", "username", "email"],
                    where: { id: userIds },
                    globalSearch: "",
                    limit: userIds.length,
                });

                const users = usersResponse?.data?.response?.data || usersResponse?.data?.response || usersResponse?.data || [];
                userMap = new Map(
                    users.map((user) => [String(user.id), user.username || user.email || `User ${user.id}`])
                );
            }

            setRows(
                list.map((item) => ({
                    ...item,
                    id: item.id,
                    user_label: item.user_id ? userMap.get(String(item.user_id)) || `User ${item.user_id}` : "System",
                    changes_parsed: parsePayload(item.changes),
                    metadata_parsed: parsePayload(item.metadata),
                }))
            );
        } catch (error) {
            console.error("Failed to load audit logs", error);
            showErrorRef.current?.("Failed to load audit logs");
        } finally {
            setLoading(false);
            hideLoaderRef.current?.();
        }
    }, [filters]);

    useEffect(() => {
        loadUsers();
    }, [loadUsers]);

    useEffect(() => {
        loadAuditLogs();
    }, [loadAuditLogs]);

    const filterOptions = useMemo(() => {
        const actions = new Set();
        const statuses = new Set();
        const entities = new Set();

        rows.forEach((row) => {
            if (row.action) actions.add(row.action);
            if (row.status) statuses.add(row.status);
            if (row.entity) entities.add(row.entity);
        });

        return {
            actions: [...actions],
            statuses: [...statuses],
            entities: [...entities],
        };
    }, [rows]);

    const filteredRows = useMemo(() => {
        const fromDate = toDateValue(filters.from);
        const toDate = toDateValue(filters.to);

        return rows.filter((row) => {
            if (!fromDate && !toDate) return true;

            const createdAt = toDateValue(row.created_at);
            if (!createdAt) return false;
            if (fromDate && createdAt < fromDate) return false;
            if (toDate && createdAt > toDate) return false;
            return true;
        });
    }, [rows, filters.from, filters.to]);

    const columns = useMemo(() => ([
        {
            field: "user_label",
            headerName: "User",
            minWidth: 220,
            renderCell: ({ row }) => (
                <Box>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{row.user_label || "System"}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{row.ip_address || "-"}</Typography>
                </Box>
            ),
        },
        {
            field: "entity",
            headerName: "Entity",
            minWidth: 170,
            renderCell: ({ row }) => (
                <Stack spacing={0.25}>
                    <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{row.entity || "-"}</Typography>
                    <Typography sx={{ color: "text.secondary", fontSize: 12 }}>{row.entity_id || "-"}</Typography>
                </Stack>
            ),
        },
        {
            field: "action",
            headerName: "Action",
            minWidth: 140,
            renderCell: ({ value }) => (
                <Chip
                    size="small"
                    label={value || "-"}
                    sx={{
                        textTransform: "capitalize",
                        fontWeight: 600,
                        borderRadius: 1.5,
                        ...buildActionChipSx(value),
                    }}
                />
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 130,
            renderCell: ({ value }) => (
                <Chip size="small" label={value || "unknown"} color={buildStatusChipColor(value)} sx={{ textTransform: "capitalize", fontWeight: 600 }} />
            ),
        },
        {
            field: "note",
            headerName: "Details",
            minWidth: 300,
            renderCell: ({ row }) => {
                const fallbackText = row.changes_parsed ? JSON.stringify(row.changes_parsed) : "-";
                const content = row.note || fallbackText;
                return (
                    <Typography sx={{ fontSize: 13, color: "text.secondary", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 280 }}>
                        {content}
                    </Typography>
                );
            },
        },
        {
            field: "source",
            headerName: "Source",
            minWidth: 150,
            renderCell: ({ value }) => value || "-",
        },
        {
            field: "created_at",
            headerName: "Date & Time",
            minWidth: 170,
            pinned: "right",
            renderCell: ({ value }) => formatDateTime(value),
        },
    ]), []);

    return (
        <Box p={1} mt={1.5}>
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                }}
            >
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" spacing={2} mb={2.5}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                            <HistoryIcon sx={{ color: "var(--primary)" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                Audit logs
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: "text.secondary" }}>
                            Track actions across users, modules, and request sources.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            icon={<DescriptionOutlinedChipIcon />}
                            label={`${filteredRows.length} ${filteredRows.length === 1 ? "log" : "logs"}`}
                            sx={{ borderRadius: 2, px: 1, fontWeight: 600 }}
                        />
                    </Stack>
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={1.5} flexWrap="wrap">
                    <Autocomplete
                        sx={{ minWidth: 240 }}
                        options={userOptions}
                        value={filters.user}
                        onChange={(_, nextValue) => setFilters((prev) => ({ ...prev, user: nextValue }))}
                        onInputChange={(_, input, reason) => {
                            if (reason === "input") loadUsers(input);
                        }}
                        getOptionLabel={(option) => option?.label || ""}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="User"
                                size="small"
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: <PersonOutlineIcon sx={{ color: "text.secondary", mr: 1 }} />,
                                }}
                            />
                        )}
                    />

                    <TextField
                        select
                        size="small"
                        label="Action"
                        value={filters.action}
                        onChange={(event) => setFilters((prev) => ({ ...prev, action: event.target.value }))}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        {filterOptions.actions.map((action) => (
                            <MenuItem key={action} value={action}>{action}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={filters.status}
                        onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        {filterOptions.statuses.map((status) => (
                            <MenuItem key={status} value={status}>{status}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Entity"
                        value={filters.entity}
                        onChange={(event) => setFilters((prev) => ({ ...prev, entity: event.target.value }))}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All</MenuItem>
                        {filterOptions.entities.map((entity) => (
                            <MenuItem key={entity} value={entity}>{entity}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        size="small"
                        label="Search logs"
                        placeholder="Search note, action, entity..."
                        value={filters.search}
                        onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                        sx={{ minWidth: 240, flex: 1 }}
                        InputProps={{
                            startAdornment: <HubOutlinedIcon sx={{ color: "text.secondary", mr: 1 }} />,
                        }}
                    />
                </Stack>

                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2.5} flexWrap="wrap">
                    <CustomDateTimePicker
                        label="From date & time"
                        value={filters.from}
                        onChange={(nextValue) => setFilters((prev) => ({ ...prev, from: nextValue }))}
                        fullWidth={false}
                        slotProps={{
                            textField: {
                                sx: {
                                    width: { xs: "100%", sm: 260, md: 240 },
                                    minWidth: { xs: "100%", sm: 260, md: 240 },
                                },
                            },
                        }}
                    />

                    <CustomDateTimePicker
                        label="To date & time"
                        value={filters.to}
                        onChange={(nextValue) => setFilters((prev) => ({ ...prev, to: nextValue }))}
                        fullWidth={false}
                        slotProps={{
                            textField: {
                                sx: {
                                    width: { xs: "100%", sm: 260, md: 240 },
                                    minWidth: { xs: "100%", sm: 260, md: 240 },
                                },
                            },
                        }}
                    />
                </Stack>

                <DataTableV2
                    rows={filteredRows}
                    columns={columns}
                    serverSide={false}
                    loading={loading}
                    hideColumnSettings
                    hideSearch
                    checkboxSelection={false}
                    defaultPageSize={10}
                    pageSizeOptions={[10, 20, 50]}
                    tableKey="audit-logs-table"
                    emptySubtitle="No audit logs found for the current filters."
                />
            </Paper>
        </Box>
    );
}

function DescriptionOutlinedChipIcon() {
    return <DescriptionOutlinedIconSmall />;
}

function DescriptionOutlinedIconSmall() {
    return <HistoryIcon sx={{ fontSize: 18 }} />;
}