import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
    Box, Typography, Stack, TextField, MenuItem, Button, Alert,
    CircularProgress, Avatar, Chip, Pagination, Breadcrumbs, Link,
    Card, CardContent, CardActions, Table, TableHead, TableBody,
    TableRow, TableCell, TableContainer, Paper, ToggleButton,
    ToggleButtonGroup, Divider, Select, FormControl, InputLabel,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SchoolIcon from "@mui/icons-material/School";
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

function UserHeader({ user }) {
    if (!user) return null;
    const initials = `${user.first_name?.[0] ?? ""}${user.last_name?.[0] ?? ""}`.toUpperCase() || "U";
    return (
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3, p: 2, bgcolor: "var(--lightgrey, #f5f5f5)", borderRadius: 2 }}>
            <Avatar sx={{ width: 56, height: 56, bgcolor: "primary.main", fontSize: 20 }}>{initials}</Avatar>
            <Box>
                <Typography variant="h6" fontWeight={700}>
                    {`${user.first_name ?? ""} ${user.last_name ?? ""}`.trim() || "—"}
                </Typography>
                <Typography variant="body2" color="text.secondary">{user.email ?? "—"}</Typography>
                {user.phone && <Typography variant="caption" color="text.secondary">{user.phone}</Typography>}
            </Box>
            <Box sx={{ ml: "auto" }}>
                <Chip label={user.status ?? user.user_status ?? "active"} size="small" sx={{ bgcolor: "#4caf50", color: "white" }} />
            </Box>
        </Stack>
    );
}

function EnrollmentCard({ enrollment, onRevoke, onReEnroll, revokeLoading, reEnrollLoading }) {
    const navigate = useNavigate();
    const [confirm, setConfirm] = useState(null);
    return (
        <Card variant="outlined" sx={{ height: "100%" }}>
            <CardContent sx={{ pb: 1 }}>
                <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                    <ModuleTypeBadge type={enrollment.module_type} />
                    <EnrollmentStatusBadge status={enrollment.enrollment_status} />
                </Stack>
                <Typography fontWeight={600} sx={{ mb: 1 }}>{enrollment.module_title ?? "—"}</Typography>
                {enrollment.module_type === "course" && (
                    <Box sx={{ mb: 1 }}>
                        <ProgressCell percent={enrollment.progress_percent} />
                    </Box>
                )}
                <Stack spacing={0.25}>
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
            <CardActions sx={{ gap: 0.5, flexWrap: "wrap" }}>
                <Button size="small" onClick={() => navigate(`/enrollment/${enrollment.enrollment_id}`)}>View</Button>
                <Button size="small" color="warning" disabled={reEnrollLoading} onClick={() => setConfirm("reenroll")}>Re-enroll</Button>
                {enrollment.enrollment_status !== "revoked" && (
                    <Button size="small" color="error" disabled={revokeLoading} onClick={() => setConfirm("revoke")}>Revoke</Button>
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
                    if (confirm === "revoke") await onRevoke(enrollment.enrollment_id);
                    else await onReEnroll(enrollment.enrollment_id);
                    setConfirm(null);
                }}
            />
        </Card>
    );
}

export default function UserEnrollmentProfilePage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const { user: admin } = useAuth();
    const { revoke, reEnroll, loading: actLoading } = useEnrollmentActions();

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
        <Box sx={{ p: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>Home</Link>
                <Link underline="hover" color="inherit" onClick={() => navigate("/users/list")} sx={{ cursor: "pointer" }}>Users</Link>
                <Typography color="text.secondary">{userId}</Typography>
                <Typography color="text.primary">Enrollments</Typography>
            </Breadcrumbs>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>User Enrollment Profile</Typography>

            <UserHeader user={user} />

            {/* Filter bar */}
            <Stack direction="row" spacing={2} sx={{ mb: 2, flexWrap: "wrap", gap: 1.5, alignItems: "center" }}>
                <TextField
                    size="small"
                    placeholder="Search module title…"
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    sx={{ width: 220 }}
                />
                <FormControl size="small" sx={{ minWidth: 130 }}>
                    <InputLabel>Module Type</InputLabel>
                    <Select value={moduleType} label="Module Type" onChange={(e) => { setModuleType(e.target.value); setPage(1); }}>
                        <MenuItem value="all">All</MenuItem>
                        <MenuItem value="course">Course</MenuItem>
                        <MenuItem value="exam">Exam</MenuItem>
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Status</InputLabel>
                    <Select value={status} label="Status" onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
                        {STATUSES.map((s) => (
                            <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 100 }}>
                    <InputLabel>Per page</InputLabel>
                    <Select value={limit} label="Per page" onChange={(e) => { setLimit(e.target.value); setPage(1); }}>
                        {PAGE_SIZES.map((n) => <MenuItem key={n} value={n}>{n}</MenuItem>)}
                    </Select>
                </FormControl>
                <Box sx={{ ml: "auto" }}>
                    <ToggleButtonGroup size="small" value={view} exclusive onChange={(_, v) => v && setView(v)}>
                        <ToggleButton value="card"><GridViewIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                </Box>
            </Stack>

            {isLoading && <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress /></Box>}
            {error && <Alert severity="error">{error?.message || "Failed to load enrollments"}</Alert>}

            {/* Empty state */}
            {!isLoading && !error && enrollments.length === 0 && (
                <Box sx={{ textAlign: "center", py: 8 }}>
                    <SchoolIcon sx={{ fontSize: 64, color: "text.disabled", mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">No enrollments found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        This user has no enrollments matching the current filters.
                    </Typography>
                    <Button variant="contained" onClick={() => navigate(`/enrollment/enroll?user_id=${userId}`)}>
                        Enroll Now
                    </Button>
                </Box>
            )}

            {/* Card view */}
            {!isLoading && !error && enrollments.length > 0 && view === "card" && (
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 2 }}>
                    {enrollments.map((e, i) => (
                        <EnrollmentCard
                            key={e.enrollment_id ?? i}
                            enrollment={e}
                            revokeLoading={!!actLoading[e.enrollment_id]}
                            reEnrollLoading={!!actLoading[e.enrollment_id]}
                            onRevoke={(id) => revoke(id, admin?.id)}
                            onReEnroll={(id) => reEnroll(id, admin?.id)}
                        />
                    ))}
                </Box>
            )}

            {/* Table view */}
            {!isLoading && !error && enrollments.length > 0 && view === "table" && (
                <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: "var(--lightgrey, #f5f5f5)" }}>
                                {["Type", "Module Title", "Status", "Progress", "Marks", "Enrolled At", "Completed At", "Actions"].map((h) => (
                                    <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {enrollments.map((e, i) => (
                                <TableRow key={e.enrollment_id ?? i} hover>
                                    <TableCell><ModuleTypeBadge type={e.module_type} /></TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{e.module_title ?? "—"}</TableCell>
                                    <TableCell><EnrollmentStatusBadge status={e.enrollment_status} /></TableCell>
                                    <TableCell><ProgressCell percent={e.progress_percent} /></TableCell>
                                    <TableCell>{e.marks ?? "—"}</TableCell>
                                    <TableCell>{e.enrolled_at ? new Date(e.enrolled_at).toLocaleDateString() : "—"}</TableCell>
                                    <TableCell>{e.completed_at ? new Date(e.completed_at).toLocaleDateString() : "—"}</TableCell>
                                    <TableCell>
                                        <Stack direction="row" spacing={0.5}>
                                            <Button size="small" onClick={() => navigate(`/enrollment/${e.enrollment_id}`)}>View</Button>
                                            <Button size="small" color="warning" disabled={!!actLoading[e.enrollment_id]}
                                                onClick={() => reEnroll(e.enrollment_id, admin?.id)}>
                                                Re-enroll
                                            </Button>
                                            {e.enrollment_status !== "revoked" && (
                                                <Button size="small" color="error" disabled={!!actLoading[e.enrollment_id]}
                                                    onClick={() => revoke(e.enrollment_id, admin?.id)}>
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
            {!isLoading && !error && enrollments.length > 0 && (
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2 }}>
                    <Typography variant="caption" color="text.secondary">
                        Showing {from}–{to} of {total} enrollments
                    </Typography>
                    {totalPages > 1 && (
                        <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} />
                    )}
                </Box>
            )}
        </Box>
    );
}
