import React, { useState } from "react";
import {
    Box, Tab, Tabs, Typography, TextField, Button,
    CircularProgress, Alert, Chip, Stack, Divider, Card, IconButton,
    InputAdornment,
} from "@mui/material";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentIcon from "@mui/icons-material/Assignment";
import SearchIcon from "@mui/icons-material/Search";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import BadgeIcon from "@mui/icons-material/Badge";
import SchoolIcon from "@mui/icons-material/School";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import THEME from "../../../constants/theme";
import EnrollUserPage from "./EnrollUserPage";
import GroupEnrollmentPage from "./GroupEnrollmentPage";
import { enrollmentApi } from "../../../services/enrollmentApi";
import dayjs from "dayjs";

/* ── Tab panel wrapper ───────────────────────────────────────────────────── */
function TabPanel({ children, value, index }) {
    return (
        <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
            {value === index && children}
        </Box>
    );
}

/* ── Enrollment detail info row ──────────────────────────────────────────── */
function DetailRow({ label, value }) {
    if (!value && value !== 0) return null;
    return (
        <Box sx={{ display: "flex", gap: 1.5, py: 1, borderBottom: "1px solid", borderColor: "divider", alignItems: "flex-start" }}>
            <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: "text.secondary", minWidth: 160 }}>
                {label}
            </Typography>
            <Typography sx={{ fontSize: "0.88rem", color: "text.primary", fontWeight: 500 }}>
                {value}
            </Typography>
        </Box>
    );
}

/* ── Enrollment detail preview (Tab 3) ───────────────────────────────────── */
function EnrollmentDetailsTab() {
    const navigate = useNavigate();
    const [inputId, setInputId] = useState("");
    const [searchId, setSearchId] = useState("");

    const { data: enrollment, isLoading, isError, error } = useQuery({
        queryKey: ["enrollment-lookup", searchId],
        queryFn: () => enrollmentApi.getEnrollmentById(searchId),
        enabled: !!searchId,
        retry: false,
        refetchOnWindowFocus: false,
    });

    const handleSearch = (e) => {
        e?.preventDefault();
        const trimmed = inputId.trim();
        if (trimmed) setSearchId(trimmed);
    };

    const statusColor = (s) => {
        const map = { active: "success", inprogress: "primary", completed: "success", revoked: "error", scheduled: "warning", expired: "default" };
        return map[s?.toLowerCase()] ?? "default";
    };

    return (
        <Box sx={{ maxWidth: 700 }}>
            {/* Search bar */}
            <Box
                component="form"
                onSubmit={handleSearch}
                sx={{ display: "flex", gap: 1.5, mb: 3 }}
            >
                <TextField
                    placeholder="Enter Enrollment ID…"
                    size="small"
                    value={inputId}
                    onChange={(e) => setInputId(e.target.value)}
                    sx={{
                        flex: 1,
                        "& .MuiOutlinedInput-root": {
                            borderRadius: "10px",
                            "& fieldset": { borderColor: "#e2e8f0" },
                            "&:hover fieldset": { borderColor: "#94a3b8" },
                            "&.Mui-focused fieldset": { borderColor: THEME.colors.primary },
                        },
                    }}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                            </InputAdornment>
                        ),
                    }}
                />
                <Button
                    type="submit"
                    variant="contained"
                    disabled={!inputId.trim() || isLoading}
                    sx={{
                        px: 3, borderRadius: "10px", textTransform: "none", fontWeight: 700,
                        bgcolor: THEME.colors.dark,
                        "&:hover": { bgcolor: THEME.colors.darkMedium },
                    }}
                >
                    {isLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Search"}
                </Button>
            </Box>

            {/* Empty state */}
            {!searchId && (
                <Box sx={{ textAlign: "center", py: 8, color: "text.disabled" }}>
                    <AssignmentIcon sx={{ fontSize: 48, mb: 1.5, opacity: 0.3 }} />
                    <Typography sx={{ fontSize: "0.9rem" }}>Enter an enrollment ID above to view its details.</Typography>
                </Box>
            )}

            {/* Error state */}
            {isError && searchId && (
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {error?.message || "Enrollment not found. Please check the ID and try again."}
                </Alert>
            )}

            {/* Result card */}
            {enrollment && !isError && (
                <Card
                    variant="outlined"
                    sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: "hidden" }}
                >
                    {/* Card header */}
                    <Box
                        sx={{
                            px: 3, py: 2,
                            display: "flex", alignItems: "center", justifyContent: "space-between",
                            bgcolor: "#f8fafc", borderBottom: "1px solid", borderColor: "divider",
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <AssignmentIcon sx={{ fontSize: 20, color: THEME.colors.primary }} />
                            </Box>
                            <Box>
                                <Typography fontWeight={700} fontSize={15} color="text.primary">
                                    Enrollment #{enrollment?.id ?? searchId}
                                </Typography>
                                {enrollment?.enrollment_status && (
                                    <Chip
                                        label={enrollment.enrollment_status}
                                        size="small"
                                        color={statusColor(enrollment.enrollment_status)}
                                        sx={{ height: 18, fontSize: "0.68rem", fontWeight: 700, mt: 0.3 }}
                                    />
                                )}
                            </Box>
                        </Box>

                        <Button
                            size="small"
                            variant="outlined"
                            endIcon={<OpenInNewIcon sx={{ fontSize: 15 }} />}
                            onClick={() => navigate(`/enrollment/${searchId}`)}
                            sx={{
                                textTransform: "none", fontWeight: 600, borderRadius: "8px",
                                borderColor: THEME.colors.primary, color: THEME.colors.primary,
                                "&:hover": { bgcolor: `${THEME.colors.primary}10` },
                            }}
                        >
                            Full Details
                        </Button>
                    </Box>

                    {/* Card body */}
                    <Box sx={{ px: 3, py: 2 }}>
                        <Stack spacing={0}>
                            <DetailRow label="User" value={enrollment?.user_name ?? enrollment?.user?.name ?? enrollment?.user_id} />
                            <DetailRow label="Email" value={enrollment?.user_email ?? enrollment?.user?.email} />
                            <DetailRow label="Module" value={enrollment?.module_title ?? enrollment?.module?.title} />
                            <DetailRow label="Module Type" value={enrollment?.module_type} />
                            <DetailRow label="Enrollment Type" value={enrollment?.enrollment_type} />
                            <DetailRow label="Progress" value={enrollment?.progress_percent != null ? `${enrollment.progress_percent}%` : undefined} />
                            <DetailRow label="Enrolled At" value={enrollment?.enrolled_at ? dayjs(enrollment.enrolled_at).format("MMM D, YYYY h:mm A") : undefined} />
                            <DetailRow label="Started At" value={enrollment?.started_at ? dayjs(enrollment.started_at).format("MMM D, YYYY h:mm A") : undefined} />
                            <DetailRow label="Completed At" value={enrollment?.completed_at ? dayjs(enrollment.completed_at).format("MMM D, YYYY h:mm A") : undefined} />
                            <DetailRow label="Expires At" value={enrollment?.expires_at ? dayjs(enrollment.expires_at).format("MMM D, YYYY") : undefined} />
                            <DetailRow label="Scheduled Start" value={enrollment?.scheduled_start_at ? dayjs(enrollment.scheduled_start_at).format("MMM D, YYYY h:mm A") : undefined} />
                            <DetailRow label="Scheduled End" value={enrollment?.scheduled_end_at ? dayjs(enrollment.scheduled_end_at).format("MMM D, YYYY h:mm A") : undefined} />
                        </Stack>
                    </Box>
                </Card>
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
const TABS = [
    { label: "Group Enrollment", Icon: GroupsIcon, description: "Bulk enroll multiple users within a group." },
    { label: "Enroll User", Icon: PersonAddAlt1Icon, description: "Manually enroll a single user into a course or exam." },
    // { label: "Enrollment Details", Icon: AssignmentIcon, description: "Look up and review details for a specific enrollment." },
];

export default function EnrollmentManagePage() {
    const [tab, setTab] = useState(0);

    return (
        <Box sx={{ width: "100%" }}>
            {/* ── Tab bar ── */}
            <Box
                sx={{
                    borderBottom: "2px solid",
                    borderColor: "divider",
                    mb: 0,
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 48,
                        "& .MuiTabs-indicator": {
                            height: 3,
                            borderRadius: "3px 3px 0 0",
                            bgcolor: THEME.colors.dark,
                        },
                        "& .MuiTab-root": {
                            minHeight: 48,
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.88rem",
                            color: "text.secondary",
                            gap: 0.75,
                            px: 2.5,
                            transition: "color 0.2s",
                        },
                        "& .Mui-selected": {
                            color: `${THEME.colors.dark} !important`,
                            fontWeight: 700,
                        },
                    }}
                >
                    {TABS.map(({ label, Icon }, i) => (
                        <Tab
                            key={label}
                            label={label}
                            icon={<Icon sx={{ fontSize: 18 }} />}
                            iconPosition="start"
                            disableRipple={false}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* ── Tab content ── */}
            <Box
                sx={{
                    mt: 0,
                    p: { xs: 2, sm: 3 },
                    minHeight: 400,
                }}
            >
                <TabPanel value={tab} index={0}>
                    <GroupEnrollmentPage />
                </TabPanel>

                <TabPanel value={tab} index={1}>
                    <EnrollUserPage />
                </TabPanel>

                {/* <TabPanel value={tab} index={2}>
                    <EnrollmentDetailsTab />
                </TabPanel> */}
            </Box>
        </Box>
    );
}
