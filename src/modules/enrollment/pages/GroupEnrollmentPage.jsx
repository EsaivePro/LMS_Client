import React, { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Box, Typography, FormControl, InputLabel, Select, MenuItem,
    Tabs, Tab, TextField, Button, Stack, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer, Paper, IconButton, Collapse,
    Pagination, CircularProgress, Alert, Chip, Checkbox, FormControlLabel,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { enrollmentApi } from "../../../services/enrollmentApi";
import useCommon from "../../../hooks/useCommon";
import { useAuth } from "../../../hooks/useAuth";
import EnrollmentStatusBadge from "../../../components/enrollment/EnrollmentStatusBadge";
import ModuleTypeBadge from "../../../components/enrollment/ModuleTypeBadge";
import ProgressCell from "../../../components/enrollment/ProgressCell";
import BulkEnrollModal from "../../../components/enrollment/BulkEnrollModal";
import EnrollmentConfirmModal from "../../../components/enrollment/EnrollmentConfirmModal";
import useEnrollmentActions from "../../../hooks/useEnrollmentActions";

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = useState(value);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

function TabPanel({ children, value, index }) {
    return (
        <div hidden={value !== index}>
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

// ── Tab 1: Unenrolled Users ──────────────────────────────────────
function UnenrolledUsersTab({ groupId, moduleCategoryId }) {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useCommon();
    const { user } = useAuth();
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [bulkOpen, setBulkOpen] = useState(false);
    const [selectedIds, setSelectedIds] = useState(new Set());
    const [selectAllUsers, setSelectAllUsers] = useState(false);
    const debouncedSearch = useDebounce(search);

    // Clear selection when filters or context change
    useEffect(() => {
        setSelectedIds(new Set());
        setSelectAllUsers(false);
    }, [debouncedSearch, groupId, moduleCategoryId]);

    const { data, isLoading, error } = useQuery({
        queryKey: ["enrollments", "unenrolled", { groupId, moduleCategoryId, search: debouncedSearch, page, limit }],
        queryFn: () =>
            enrollmentApi.getUnenrolledUsers({
                group_id: groupId,
                module_category_id: moduleCategoryId,
                search: debouncedSearch,
                page,
                limit,
            }),
        enabled: !!groupId && !!moduleCategoryId,
    });

    const rows = data?.data ?? (Array.isArray(data) ? data : []);
    const totalCount = data?.pagination?.total ?? data?.pagination?.totalCount ?? rows.length;
    const totalPages = data?.pagination?.totalPages ?? (Math.ceil(totalCount / limit) || 1);
    const from = rows.length > 0 ? (page - 1) * limit + 1 : 0;
    const to = Math.min(page * limit, totalCount);

    const somePageSelected = !selectAllUsers && rows.some((r) => selectedIds.has(String(r.user_id)));
    const anySelected = selectAllUsers || selectedIds.size > 0;
    const selectedCount = selectAllUsers ? totalCount : selectedIds.size;

    const handleSelectAllToggle = () => {
        if (selectAllUsers) {
            setSelectAllUsers(false);
            setSelectedIds(new Set());
        } else {
            setSelectAllUsers(true);
            setSelectedIds(new Set());
        }
    };

    const toggleRow = (userId) => {
        if (selectAllUsers) {
            // Exit "select all" mode; keep current page selected minus the clicked row
            setSelectAllUsers(false);
            const pageIds = new Set(rows.map((r) => String(r.user_id)));
            pageIds.delete(String(userId));
            setSelectedIds(pageIds);
            return;
        }
        const id = String(userId);
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const bulkMutation = useMutation({
        mutationFn: (opts) =>
            enrollmentApi.bulkEnroll({
                group_id: groupId,
                module_category_id: moduleCategoryId,
                enrolled_by: user?.id,
                ...opts,
            }),
        onSuccess: (res) => {
            showSuccess(`${res?.count ?? "Enrollment(s)"} created successfully`);
            setBulkOpen(false);
            setSelectedIds(new Set());
            setSelectAllUsers(false);
            queryClient.invalidateQueries({ queryKey: ["enrollments", "unenrolled"] });
            queryClient.invalidateQueries({ queryKey: ["enrollments", "group-status"] });
        },
        onError: (err) => showError(err?.message || "Bulk enroll failed"),
    });

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                <TextField
                    size="small"
                    placeholder="Search by name or email…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    sx={{ width: 300 }}
                />
                <Stack direction="row" spacing={1} alignItems="center">
                    <FormControlLabel
                        control={
                            <Checkbox
                                size="small"
                                checked={selectAllUsers}
                                indeterminate={somePageSelected}
                                onChange={handleSelectAllToggle}
                                disabled={rows.length === 0}
                            />
                        }
                        label={
                            <Typography variant="body2">
                                {anySelected ? `${selectedCount} selected` : "Select All"}
                            </Typography>
                        }
                        sx={{ mr: 0 }}
                    />
                    <Button
                        variant="contained"
                        disabled={!anySelected}
                        onClick={() => setBulkOpen(true)}
                    >
                        Bulk Enroll
                    </Button>
                </Stack>
            </Box>

            {isLoading && <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error?.message || "Failed to load users"}</Alert>}

            {!isLoading && !error && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "var(--lightgrey, #f5f5f5)" }}>
                                <TableCell padding="checkbox" />
                                {["Name", "Email", "Phone", "User Status", "Group Status"].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No unenrolled users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row, i) => {
                                    const rowId = String(row.user_id ?? i);
                                    const checked = selectAllUsers || selectedIds.has(rowId);
                                    return (
                                        <TableRow
                                            key={row.user_id ?? i}
                                            hover
                                            selected={checked}
                                            onClick={() => toggleRow(row.user_id ?? i)}
                                            sx={{ cursor: "pointer" }}
                                        >
                                            <TableCell padding="checkbox" onClick={(e) => e.stopPropagation()}>
                                                <Checkbox
                                                    size="small"
                                                    checked={checked}
                                                    onChange={() => toggleRow(row.user_id ?? i)}
                                                />
                                            </TableCell>
                                            <TableCell>{`${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "—"}</TableCell>
                                            <TableCell>{row.email ?? "—"}</TableCell>
                                            <TableCell>{row.phone ?? "—"}</TableCell>
                                            <TableCell>
                                                <Chip label={row.user_status ?? "—"} size="small" />
                                            </TableCell>
                                            <TableCell>
                                                <Chip label={row.group_status ?? "—"} size="small" />
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {rows.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Showing {from}–{to} of {totalCount} user{totalCount !== 1 ? "s" : ""}
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        size="small"
                    />
                </Box>
            )}

            <BulkEnrollModal
                open={bulkOpen}
                userCount={selectedCount}
                userIds={selectAllUsers ? "all" : [...selectedIds].join(",")}
                moduleCount={1}
                loading={bulkMutation.isPending}
                onConfirm={(opts) => bulkMutation.mutate(opts)}
                onCancel={() => setBulkOpen(false)}
            />
        </Box>
    );
}

// ── Module-level expand row ──────────────────────────────────────
function ModuleExpandRow({ modules, userId, enrollmentActions }) {
    const { revoke, reEnroll, updateSchedule, loading } = enrollmentActions;
    const [scheduleFor, setScheduleFor] = useState(null);
    const [schedForm, setSchedForm] = useState({ start: "", end: "", tz: "UTC" });
    const [confirmFor, setConfirmFor] = useState(null); // { id, action: 'revoke'|'reenroll' }

    const handleScheduleSave = async (enrollmentId) => {
        await updateSchedule(enrollmentId, {
            scheduled_start_at: schedForm.start || null,
            scheduled_end_at: schedForm.end || null,
            schedule_timezone: schedForm.tz,
        });
        setScheduleFor(null);
    };

    return (
        <Box sx={{ px: 4, py: 1 }}>
            <Table size="small">
                <TableHead>
                    <TableRow sx={{ bgcolor: "#fafafa" }}>
                        {["Type", "Module Title", "Status", "Progress", "Marks", "Enrolled At", "Completed At", "Actions"].map((h) => (
                            <TableCell key={h} sx={{ fontWeight: 600, fontSize: 12 }}>{h}</TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {(modules ?? []).map((mod, i) => (
                        <React.Fragment key={mod.enrollment_id ?? i}>
                            <TableRow hover>
                                <TableCell><ModuleTypeBadge type={mod.module_type} /></TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{mod.module_title ?? "—"}</TableCell>
                                <TableCell><EnrollmentStatusBadge status={mod.enrollment_status} /></TableCell>
                                <TableCell><ProgressCell percent={mod.progress_percent} /></TableCell>
                                <TableCell>{mod.marks ?? "—"}</TableCell>
                                <TableCell>{mod.enrolled_at ? new Date(mod.enrolled_at).toLocaleDateString() : "—"}</TableCell>
                                <TableCell>{mod.completed_at ? new Date(mod.completed_at).toLocaleDateString() : "—"}</TableCell>
                                <TableCell>
                                    {mod.enrollment_id && (
                                        <Stack direction="row" spacing={0.5}>
                                            <Button size="small" color="error" variant="outlined"
                                                disabled={loading[mod.enrollment_id]}
                                                onClick={() => setConfirmFor({ id: mod.enrollment_id, action: "revoke" })}>
                                                Revoke
                                            </Button>
                                            <Button size="small" color="warning" variant="outlined"
                                                disabled={loading[mod.enrollment_id]}
                                                onClick={() => setConfirmFor({ id: mod.enrollment_id, action: "reenroll" })}>
                                                Re-enroll
                                            </Button>
                                            <Button size="small" variant="outlined"
                                                onClick={() => {
                                                    setScheduleFor(scheduleFor === mod.enrollment_id ? null : mod.enrollment_id);
                                                    setSchedForm({ start: "", end: "", tz: "UTC" });
                                                }}>
                                                Schedule
                                            </Button>
                                        </Stack>
                                    )}
                                </TableCell>
                            </TableRow>

                            {scheduleFor === mod.enrollment_id && (
                                <TableRow>
                                    <TableCell colSpan={8} sx={{ bgcolor: "#f9fbe7" }}>
                                        <Stack direction="row" spacing={1.5} sx={{ py: 1, flexWrap: "wrap" }}>
                                            <TextField type="date" label="Start Date" size="small"
                                                InputLabelProps={{ shrink: true }} value={schedForm.start}
                                                onChange={(e) => setSchedForm((p) => ({ ...p, start: e.target.value }))} />
                                            <TextField type="date" label="End Date" size="small"
                                                InputLabelProps={{ shrink: true }} value={schedForm.end}
                                                inputProps={{ min: schedForm.start || undefined }}
                                                onChange={(e) => setSchedForm((p) => ({ ...p, end: e.target.value }))} />
                                            <TextField select label="Timezone" size="small" value={schedForm.tz}
                                                sx={{ minWidth: 150 }}
                                                onChange={(e) => setSchedForm((p) => ({ ...p, tz: e.target.value }))}>
                                                {["UTC", "Asia/Kolkata", "America/New_York", "Europe/London"].map((tz) => (
                                                    <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                                                ))}
                                            </TextField>
                                            <Button variant="contained" size="small"
                                                disabled={!schedForm.start || loading[mod.enrollment_id]}
                                                onClick={() => handleScheduleSave(mod.enrollment_id)}>
                                                Save
                                            </Button>
                                            <Button size="small" onClick={() => setScheduleFor(null)}>Cancel</Button>
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            )}
                        </React.Fragment>
                    ))}
                </TableBody>
            </Table>

            <EnrollmentConfirmModal
                open={!!confirmFor}
                title={confirmFor?.action === "revoke" ? "Revoke Enrollment" : "Re-enroll User"}
                description={
                    confirmFor?.action === "revoke"
                        ? "Are you sure you want to revoke this enrollment?"
                        : "This will reset all progress. Are you sure you want to re-enroll?"
                }
                confirmDanger={confirmFor?.action === "revoke"}
                confirmText={confirmFor?.action === "revoke" ? "Revoke" : "Re-enroll"}
                loading={loading[confirmFor?.id]}
                onCancel={() => setConfirmFor(null)}
                onConfirm={async () => {
                    if (confirmFor?.action === "revoke") await revoke(confirmFor.id);
                    else await reEnroll(confirmFor.id);
                    setConfirmFor(null);
                }}
            />
        </Box>
    );
}

// ── Tab 2: Enrollment Status ─────────────────────────────────────
function EnrollmentStatusTab({ groupId, moduleCategoryId }) {
    const [search, setSearch] = useState("");
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [expanded, setExpanded] = useState({});
    const debouncedSearch = useDebounce(search);
    const enrollmentActions = useEnrollmentActions();

    const { data, isLoading, error } = useQuery({
        queryKey: ["enrollments", "group-status", { groupId, moduleCategoryId, search: debouncedSearch, page, limit }],
        queryFn: () =>
            enrollmentApi.getGroupEnrollmentStatus({
                group_id: groupId,
                module_category_id: moduleCategoryId,
                search: debouncedSearch,
                page,
                limit,
            }),
        enabled: !!groupId && !!moduleCategoryId,
    });

    const rows = data?.data ?? (Array.isArray(data) ? data : []);
    const totalCount = data?.pagination?.total ?? data?.pagination?.totalCount ?? rows.length;
    const totalPages = data?.pagination?.totalPages ?? (Math.ceil(totalCount / limit) || 1);
    const from = rows.length > 0 ? (page - 1) * limit + 1 : 0;
    const to = Math.min(page * limit, totalCount);

    const toggleExpand = (id) =>
        setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));

    return (
        <Box>
            <TextField
                size="small"
                placeholder="Search by name or email…"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                sx={{ width: 300, mb: 2 }}
            />

            {isLoading && <Box sx={{ textAlign: "center", py: 4 }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error?.message || "Failed to load status"}</Alert>}

            {!isLoading && !error && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "var(--lightgrey, #f5f5f5)" }}>
                                <TableCell sx={{ width: 40 }} />
                                {["Name", "Email", "Enrolled", "Completed", "Avg Progress"].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 600 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                        No enrollment data found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                rows.map((row, i) => {
                                    const uid = row.user_id ?? i;
                                    const modules = row.modules ?? [];
                                    const enrolledCount = modules.filter((m) => m.enrollment_id).length;
                                    const completedCount = modules.filter((m) => m.enrollment_status === "completed").length;
                                    const avgProgress = enrolledCount > 0
                                        ? Math.round(modules.reduce((s, m) => s + (Number(m.progress_percent) || 0), 0) / enrolledCount)
                                        : 0;

                                    return (
                                        <React.Fragment key={uid}>
                                            <TableRow hover>
                                                <TableCell padding="checkbox">
                                                    <IconButton size="small" onClick={() => toggleExpand(uid)}>
                                                        {expanded[uid] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                                    </IconButton>
                                                </TableCell>
                                                <TableCell sx={{ fontWeight: 500 }}>
                                                    {`${row.first_name ?? ""} ${row.last_name ?? ""}`.trim() || "—"}
                                                </TableCell>
                                                <TableCell>{row.email ?? "—"}</TableCell>
                                                <TableCell>{enrolledCount}</TableCell>
                                                <TableCell>{completedCount}</TableCell>
                                                <TableCell><ProgressCell percent={avgProgress} /></TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell colSpan={6} sx={{ p: 0, border: 0 }}>
                                                    <Collapse in={expanded[uid]} unmountOnExit>
                                                        <ModuleExpandRow
                                                            modules={modules}
                                                            userId={uid}
                                                            enrollmentActions={enrollmentActions}
                                                        />
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {rows.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Showing {from}–{to} of {totalCount} user{totalCount !== 1 ? "s" : ""}
                    </Typography>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        size="small"
                    />
                </Box>
            )}
        </Box>
    );
}

// ── Main Page ────────────────────────────────────────────────────
export default function GroupEnrollmentPage() {
    const [groupId, setGroupId] = useState("");
    const [moduleCategoryId, setModuleCategoryId] = useState("");
    const [activeTab, setActiveTab] = useState(0);

    const { data: groups = [], isLoading: groupsLoading } = useQuery({
        queryKey: ["groups", "list"],
        queryFn: () => enrollmentApi.getGroupsList(),
    });

    const { data: groupModules = [], isLoading: groupModulesLoading } = useQuery({
        queryKey: ["group-modules", groupId],
        queryFn: () => enrollmentApi.getGroupModules(groupId),
        enabled: !!groupId,
    });

    const groupList = Array.isArray(groups) ? groups : [];
    const groupCategoryList = Array.isArray(groupModules) ? groupModules : (groupModules?.data ?? []);
    const ready = !!groupId && !!moduleCategoryId;

    return (
        <Box>
            {/* Shared controls */}
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Select Group</InputLabel>
                    <Select
                        value={groupId}
                        label="Select Group"
                        onChange={(e) => {
                            setGroupId(e.target.value);
                            setModuleCategoryId(""); // reset category when group changes
                        }}
                        disabled={groupsLoading}
                    >
                        {groupList.map((g) => (
                            <MenuItem key={g.id ?? g.group_id} value={g.id ?? g.group_id}>
                                {g.name ?? g.group_name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 240 }}>
                    <InputLabel>Select Module Category</InputLabel>
                    <Select
                        value={moduleCategoryId}
                        label="Select Module Category"
                        onChange={(e) => setModuleCategoryId(e.target.value)}
                        disabled={!groupId || groupModulesLoading}
                    >
                        {groupModulesLoading ? (
                            <MenuItem disabled>Loading…</MenuItem>
                        ) : groupCategoryList.length === 0 && groupId ? (
                            <MenuItem disabled>No categories linked to this group</MenuItem>
                        ) : (
                            groupCategoryList.map((c) => (
                                <MenuItem
                                    key={c.id ?? c.module_category_id}
                                    value={c.id ?? c.module_category_id}
                                >
                                    {c.name ?? c.category_name}
                                </MenuItem>
                            ))
                        )}
                    </Select>
                </FormControl>
            </Stack>

            {!ready ? (
                <Alert severity="info">Select a group and module category to continue.</Alert>
            ) : (
                <>
                    <Tabs
                        value={activeTab}
                        onChange={(_, v) => setActiveTab(v)}
                        sx={{ borderBottom: 1, borderColor: "divider", mb: 1 }}
                    >
                        <Tab label="Unenrolled Users" />
                        <Tab label="Enrollment Status" />
                    </Tabs>

                    <TabPanel value={activeTab} index={0}>
                        <UnenrolledUsersTab groupId={groupId} moduleCategoryId={moduleCategoryId} />
                    </TabPanel>
                    <TabPanel value={activeTab} index={1}>
                        <EnrollmentStatusTab groupId={groupId} moduleCategoryId={moduleCategoryId} />
                    </TabPanel>
                </>
            )}
        </Box>
    );
}
