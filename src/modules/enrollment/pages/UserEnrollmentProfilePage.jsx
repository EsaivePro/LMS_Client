import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Box, Typography, Stack, TextField, MenuItem, Button, Alert,
    CircularProgress, Avatar, Chip, Pagination, Breadcrumbs, Link,
    Card, CardContent, CardActions, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer, Paper, ToggleButton,
    ToggleButtonGroup, Divider, Select, FormControl, InputLabel,
    InputAdornment, useMediaQuery, useTheme,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SchoolIcon from "@mui/icons-material/School";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import { enrollmentApi } from "../../../services/enrollmentApi";
import useCommon from "../../../hooks/useCommon";
import { useAuth } from "../../../hooks/useAuth";
import EnrollmentStatusBadge from "../../../components/enrollment/EnrollmentStatusBadge";
import ModuleTypeBadge from "../../../components/enrollment/ModuleTypeBadge";
import ProgressCell from "../../../components/enrollment/ProgressCell";
import EnrollmentConfirmModal from "../../../components/enrollment/EnrollmentConfirmModal";
import useEnrollmentActions from "../../../hooks/useEnrollmentActions";

const STATUSES = ["all", "active", "inprogress", "completed", "expired", "revoked", "pending", "scheduled"];
const PAGE_SIZES = [10, 25, 50];

function useDebounce(value, delay = 400) {
    const [debounced, setDebounced] = React.useState(value);
    React.useEffect(() => {
        const t = setTimeout(() => setDebounced(value), delay);
        return () => clearTimeout(t);
    }, [value, delay]);
    return debounced;
}

/* ── User Header ─────────────────────────────────────────────────────────── */
function UserHeader({ user, onEnroll, userId }) {
    if (!user) return null;
    const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "U";
    const fullName = `${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—";
    const isActive = (user.status ?? user.user_status ?? "active").toLowerCase() === "active";

    return (
        <Box
            sx={{
                width: "100%",
                mb: 3,
                borderRadius: 3,
                overflow: "hidden",
                boxShadow: "0 2px 12px rgba(15,23,42,0.07)",
                border: "1px solid",
                borderColor: "divider",
                background: "#fff",
            }}
        >
            {/* Accent top bar */}
            <Box sx={{ height: 6, background: "linear-gradient(90deg, #4F46E5 0%, #38BDF8 100%)" }} />

            <Box
                sx={{
                    px: { xs: 2, sm: 3 },
                    py: { xs: 2, sm: 2.5 },
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    alignItems: { xs: "flex-start", sm: "center" },
                    gap: { xs: 2, sm: 3 },
                }}
            >
                {/* Avatar */}
                <Avatar
                    sx={{
                        width: { xs: 52, sm: 64 },
                        height: { xs: 52, sm: 64 },
                        bgcolor: "#4F46E5",
                        fontSize: { xs: 20, sm: 24 },
                        fontWeight: 700,
                        flexShrink: 0,
                        boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
                    }}
                >
                    {initials}
                </Avatar>

                {/* Info */}
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={{ xs: "1.1rem", sm: "1.25rem" }} color="#0F172A" noWrap>
                        {fullName}
                    </Typography>
                    <Stack direction="row" spacing={2} flexWrap="wrap" sx={{ mt: 0.5, gap: 1 }}>
                        {user.email && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <EmailOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                                <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                            </Box>
                        )}
                        {user.phone && (
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <PhoneOutlinedIcon sx={{ fontSize: 14, color: "#94A3B8" }} />
                                <Typography variant="caption" color="text.secondary">{user.phone}</Typography>
                            </Box>
                        )}
                    </Stack>
                </Box>

                {/* Right: status + enroll */}
                <Stack direction={{ xs: "row", sm: "column" }} spacing={1} alignItems={{ xs: "center", sm: "flex-end" }} sx={{ flexShrink: 0 }}>
                    <Chip
                        label={user.status ?? user.user_status ?? "active"}
                        size="small"
                        sx={{
                            bgcolor: isActive ? "#DCFCE7" : "#FEE2E2",
                            color: isActive ? "#166534" : "#991B1B",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            textTransform: "capitalize",
                        }}
                    />
                    <Button
                        size="small"
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon sx={{ fontSize: 16 }} />}
                        onClick={onEnroll}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.78rem",
                            borderRadius: "8px",
                            bgcolor: "#4F46E5",
                            "&:hover": { bgcolor: "#4338CA" },
                            whiteSpace: "nowrap",
                        }}
                    >
                        Enroll Now
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}

/* ── Enrollment Card ─────────────────────────────────────────────────────── */
function EnrollmentCard({ enrollment, onRevoke, onReEnroll, revokeLoading, reEnrollLoading }) {
    const navigate = useNavigate();
    const [confirm, setConfirm] = useState(null);

    return (
        <Card
            variant="outlined"
            sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2.5,
                border: "1px solid",
                borderColor: "divider",
                transition: "box-shadow 0.2s, transform 0.2s",
                "&:hover": {
                    boxShadow: "0 6px 20px rgba(15,23,42,0.08)",
                    transform: "translateY(-2px)",
                },
            }}
        >
            <CardContent sx={{ pb: 1, flex: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1.5 }} flexWrap="wrap">
                    <ModuleTypeBadge type={enrollment.module_type} />
                    <EnrollmentStatusBadge status={enrollment.enrollment_status} />
                </Stack>
                <Typography fontWeight={700} fontSize="0.9rem" color="#0F172A" sx={{ mb: 1, lineHeight: 1.4 }}>
                    {enrollment.module_title ?? "—"}
                </Typography>
                {enrollment.module_type === "course" && (
                    <Box sx={{ mb: 1.25 }}>
                        <ProgressCell percent={enrollment.progress_percent} />
                    </Box>
                )}
                <Stack spacing={0.4}>
                    <Typography variant="caption" color="text.secondary">
                        Enrolled: {enrollment.enrolled_at ? new Date(enrollment.enrolled_at).toLocaleDateString() : "—"}
                    </Typography>
                    {enrollment.started_at && (
                        <Typography variant="caption" color="text.secondary">
                            Started: {new Date(enrollment.started_at).toLocaleDateString()}
                        </Typography>
                    )}
                    {enrollment.completed_at && (
                        <Typography variant="caption" color="text.secondary">
                            Completed: {new Date(enrollment.completed_at).toLocaleDateString()}
                        </Typography>
                    )}
                </Stack>
            </CardContent>
            <Divider />
            <CardActions sx={{ gap: 0.5, flexWrap: "wrap", px: 1.5, py: 1 }}>
                <Button
                    size="small"
                    variant="outlined"
                    sx={{ textTransform: "none", borderRadius: "6px", fontSize: "0.75rem" }}
                    onClick={() => navigate(`/enrollment/${enrollment.enrollment_id}`)}
                >
                    View
                </Button>
                <Button
                    size="small"
                    color="warning"
                    variant="outlined"
                    disabled={reEnrollLoading}
                    sx={{ textTransform: "none", borderRadius: "6px", fontSize: "0.75rem" }}
                    onClick={() => setConfirm("reenroll")}
                >
                    Re-enroll
                </Button>
                {enrollment.enrollment_status !== "revoked" && (
                    <Button
                        size="small"
                        color="error"
                        variant="outlined"
                        disabled={revokeLoading}
                        sx={{ textTransform: "none", borderRadius: "6px", fontSize: "0.75rem" }}
                        onClick={() => setConfirm("revoke")}
                    >
                        Revoke
                    </Button>
                )}
            </CardActions>
            <EnrollmentConfirmModal
                open={!!confirm}
                title={confirm === "revoke" ? "Revoke Enrollment" : "Re-enroll"}
                description={confirm === "revoke" ? "Revoke this enrollment?" : "Re-enroll? All progress will be lost."}
                confirmDanger={confirm === "revoke"}
                confirmText={confirm === "revoke" ? "Revoke" : "Re-enroll"}
                loading={confirm === "revoke" ? revokeLoading : reEnrollLoading}
                onCancel={() => setConfirm(null)}
                onConfirm={async () => {
                    if (confirm === "revoke") await onRevoke(enrollment.id);
                    else await onReEnroll(enrollment.id);
                    setConfirm(null);
                }}
            />
        </Card>
    );
}

/* ── Main Page ───────────────────────────────────────────────────────────── */
export default function UserEnrollmentProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: admin } = useAuth();
    const { revoke, reEnroll, loading: actLoading } = useEnrollmentActions();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.down("md"));

    const [view, setView] = useState("card");
    const [search, setSearch] = useState("");
    const [moduleType, setModuleType] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const debouncedSearch = useDebounce(search);

    const { data: user } = useQuery({
        queryKey: ["user", userId],
        queryFn: () => enrollmentApi.getUserById(userId),
        enabled: !!userId,
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ["enrollments", "user", userId, { search: debouncedSearch, moduleType, status, page, limit }],
        queryFn: () =>
            enrollmentApi.getUserEnrollments(userId, {
                search: debouncedSearch,
                module_type: moduleType === "all" ? undefined : moduleType,
                status: status === "all" ? undefined : status,
                page,
                limit,
            }),
        enabled: !!userId,
    });

    const enrollments = data?.data ?? (Array.isArray(data) ? data : []);
    const pagination = data?.pagination ?? {};
    const totalPages = pagination.totalPages ?? Math.ceil((pagination.total ?? enrollments.length) / limit);
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, pagination.total ?? enrollments.length);
    const total = pagination.total ?? enrollments.length;

    return (
        <Box sx={{ p: { xs: 2, sm: 3 }, bgcolor: "#F8FAFC", minHeight: "100vh" }}>

            {/* User Header */}
            <UserHeader
                user={user}
                userId={userId}
                onEnroll={() => navigate(`/enrollment/enroll?user_id=${userId}`)}
            />

            {/* ── Filter bar ─────────────────────────────────────────────── */}
            <Box
                sx={{
                    width: "100%",
                    bgcolor: "#fff",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 3,
                    p: { xs: 2, sm: 2.5 },
                    mb: 3,
                    boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                }}
            >
                {/* Header row */}
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FilterListIcon sx={{ fontSize: 18, color: "#64748B" }} />
                        <Typography fontWeight={600} fontSize="0.9rem" color="#0F172A">
                            Filters
                        </Typography>
                        {(search || moduleType !== "all" || status !== "all") && (
                            <Chip
                                label="Clear"
                                size="small"
                                onClick={() => { setSearch(""); setModuleType("all"); setStatus("all"); setPage(1); }}
                                sx={{ height: 20, fontSize: "0.7rem", cursor: "pointer" }}
                            />
                        )}
                    </Box>
                    <ToggleButtonGroup
                        size="small"
                        value={view}
                        exclusive
                        onChange={(_, v) => v && setView(v)}
                        sx={{ "& .MuiToggleButton-root": { border: "1px solid #E2E8F0", borderRadius: "8px !important", px: 1.25 } }}
                    >
                        <ToggleButton value="card"><GridViewIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Filter controls — full width responsive grid */}
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr",
                            md: "1fr auto auto auto",
                        },
                        gap: 1.5,
                        alignItems: "center",
                    }}
                >
                    {/* Search — takes remaining space on md+ */}
                    <TextField
                        size="small"
                        placeholder="Search module title…"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ fontSize: 17, color: "#94A3B8" }} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            "& .MuiOutlinedInput-root": { borderRadius: "10px" },
                        }}
                    />

                    {/* Module Type */}
                    <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 140 } }}>
                        <InputLabel>Module Type</InputLabel>
                        <Select
                            value={moduleType}
                            label="Module Type"
                            onChange={(e) => { setModuleType(e.target.value); setPage(1); }}
                            sx={{ borderRadius: "10px" }}
                        >
                            <MenuItem value="all">All Types</MenuItem>
                            <MenuItem value="course">Course</MenuItem>
                            <MenuItem value="exam">Exam</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Status */}
                    <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 150 } }}>
                        <InputLabel>Status</InputLabel>
                        <Select
                            value={status}
                            label="Status"
                            onChange={(e) => { setStatus(e.target.value); setPage(1); }}
                            sx={{ borderRadius: "10px" }}
                        >
                            {STATUSES.map((s) => (
                                <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    {/* Per page */}
                    <FormControl size="small" sx={{ minWidth: { xs: "100%", sm: 110 } }}>
                        <InputLabel>Per page</InputLabel>
                        <Select
                            value={limit}
                            label="Per page"
                            onChange={(e) => { setLimit(e.target.value); setPage(1); }}
                            sx={{ borderRadius: "10px" }}
                        >
                            {PAGE_SIZES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                        </Select>
                    </FormControl>
                </Box>

                {/* Result count summary */}
                {!isLoading && !error && enrollments.length > 0 && (
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, display: "block" }}>
                        Showing {from}–{to} of {total} enrollment{total !== 1 ? "s" : ""}
                    </Typography>
                )}
            </Box>

            {/* Loading */}
            {isLoading && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <CircularProgress sx={{ color: "#4F46E5" }} />
                </Box>
            )}

            {/* Error */}
            {error && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error?.message || "Failed to load enrollments"}
                </Alert>
            )}

            {/* Empty state */}
            {!isLoading && !error && enrollments.length === 0 && (
                <Box
                    sx={{
                        textAlign: "center",
                        py: 10,
                        bgcolor: "#fff",
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                    }}
                >
                    <SchoolIcon sx={{ fontSize: 64, color: "#CBD5E1", mb: 2 }} />
                    <Typography variant="h6" fontWeight={700} color="#0F172A" mb={0.5}>
                        No enrollments found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        This user has no enrollments matching the current filters.
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddCircleOutlineIcon />}
                        onClick={() => navigate(`/enrollment/enroll?user_id=${userId}`)}
                        sx={{ textTransform: "none", borderRadius: "10px", bgcolor: "#4F46E5", "&:hover": { bgcolor: "#4338CA" } }}
                    >
                        Enroll Now
                    </Button>
                </Box>
            )}

            {/* Card view */}
            {!isLoading && !error && enrollments.length > 0 && view === "card" && (
                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "repeat(2, 1fr)",
                            md: "repeat(3, 1fr)",
                            lg: "repeat(4, 1fr)",
                        },
                        gap: 2,
                    }}
                >
                    {enrollments.map((e, i) => (
                        <EnrollmentCard
                            key={e.id ?? i}
                            enrollment={e}
                            revokeLoading={!!actLoading[e.id]}
                            reEnrollLoading={!!actLoading[e.id]}
                            onRevoke={(id) => revoke(id, admin?.id)}
                            onReEnroll={(id) => reEnroll(id, admin?.id)}
                        />
                    ))}
                </Box>
            )}

            {/* Table view */}
            {!isLoading && !error && enrollments.length > 0 && view === "table" && (
                <TableContainer
                    component={Paper}
                    variant="outlined"
                    sx={{ borderRadius: 2.5, border: "1px solid", borderColor: "divider", boxShadow: "0 2px 8px rgba(15,23,42,0.04)" }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                                {["Type", "Module Title", "Status", "Progress", "Marks", "Enrolled At", "Completed At", "Actions"].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 700, fontSize: "0.78rem", color: "#64748B", py: 1.5 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {enrollments.map((e, i) => (
                                <TableRow
                                    key={e.enrollment_id ?? i}
                                    hover
                                    sx={{ "&:hover": { bgcolor: "#F8FAFC" }, "&:last-child td": { border: 0 } }}
                                >
                                    <TableCell><ModuleTypeBadge type={e.module_type} /></TableCell>
                                    <TableCell sx={{ fontWeight: 600, fontSize: "0.83rem", color: "#0F172A" }}>{e.module_title ?? "—"}</TableCell>
                                    <TableCell><EnrollmentStatusBadge status={e.enrollment_status} /></TableCell>
                                    <TableCell sx={{ minWidth: 120 }}><ProgressCell percent={e.progress_percent} /></TableCell>
                                    <TableCell sx={{ fontSize: "0.82rem" }}>{e.marks ?? "—"}</TableCell>
                                    <TableCell sx={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                                        {e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: "0.82rem", whiteSpace: "nowrap" }}>
                                        {e.completed_at ? new Date(e.completed_at).toLocaleDateString() : "—"}
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5}>
                                            <Button
                                                size="small"
                                                variant="outlined"
                                                sx={{ textTransform: "none", borderRadius: "6px", fontSize: "0.72rem", py: 0.3 }}
                                                onClick={() => navigate(`/enrollment/${e.enrollment_id}`)}
                                            >
                                                View
                                            </Button>
                                            <Button
                                                size="small"
                                                color="warning"
                                                variant="outlined"
                                                disabled={!!actLoading[e.enrollment_id]}
                                                sx={{ textTransform: "none", borderRadius: "6px", fontSize: "0.72rem", py: 0.3 }}
                                                onClick={() => reEnroll(e.enrollment_id, admin?.id)}
                                            >
                                                Re-enroll
                                            </Button>
                                            {e.enrollment_status !== "revoked" && (
                                                <Button
                                                    size="small"
                                                    color="error"
                                                    variant="outlined"
                                                    disabled={!!actLoading[e.enrollment_id]}
                                                    sx={{ textTransform: "none", borderRadius: "6px", fontSize: "0.72rem", py: 0.3 }}
                                                    onClick={() => revoke(e.enrollment_id, admin?.id)}
                                                >
                                                    Revoke
                                                </Button>
                                            )}
                                        </Stack>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            {/* Pagination */}
            {!isLoading && !error && enrollments.length > 0 && totalPages > 1 && (
                <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                    <Pagination
                        count={totalPages}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        shape="rounded"
                        sx={{
                            "& .MuiPaginationItem-root": { borderRadius: "8px" },
                            "& .Mui-selected": { bgcolor: "#4F46E5 !important", color: "#fff" },
                        }}
                    />
                </Box>
            )}
        </Box>
    );
}
