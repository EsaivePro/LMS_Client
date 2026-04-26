import React, { useRef, useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    Chip,
    Stack,
    LinearProgress,
    IconButton,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    Alert,
    AlertTitle,
    Skeleton,
} from "@mui/material";
import HourglassFullIcon from "@mui/icons-material/HourglassFull";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import CloseIcon from "@mui/icons-material/Close";
import SchoolOutlinedIcon from "@mui/icons-material/SchoolOutlined";

import useCourseCategory from "../../../hooks/useCourseCategory";
import { httpClient } from "../../../apiClient/httpClient";
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { secondsToTime, formatDateTimeWithSeconds } from "../../../utils/resolver.utils";
import { getSignedUrl } from "../../../services/StorageProvider";
import THEME from "../../../constants/theme";
import CountdownTimer from "../../common/CountdownTimer";

/* ─── shared arrow button style ──────────────────────────────────────────── */
const arrowSx = {
    color: "#fff",
    bgcolor: "rgba(0,0,0,0.35)",
    backdropFilter: "blur(8px)",
    border: "1px solid rgba(255,255,255,0.18)",
    transition: "background-color 0.18s ease, transform 0.18s ease",
    "&:hover": { bgcolor: "rgba(0,0,0,0.62)", transform: "scale(1.08)" },
};

/* ================== HERO CAROUSEL ======================================= */
function HeroCarousel({ categories = [] }) {
    const [index, setIndex] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();
    const { user } = useAuth();
    const { enrollToCategory, fetchEnrollCoursesByUser, fetchCategoryAssignmentsForUser } = useEnrollment();

    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollResult, setEnrollResult] = useState(null);
    const [enrollError, setEnrollError] = useState(null);
    const [enrollProgress, setEnrollProgress] = useState(0);
    const [enrollCompleted, setEnrollCompleted] = useState(false);
    const [overallCourseProgress, setOverallCourseProgress] = useState(null);
    const [isUserEnrolled, setIsUserEnrolled] = useState(false);
    const enrollProgressRef = useRef(null);

    const cats = Array.isArray(categories) ? categories : [];
    const active = cats[index] || {};

    const go = (i) => {
        const len = cats.length || 1;
        setIndex(((i % len) + len) % len);
    };

    useEffect(() => {
        setIsUserEnrolled(!!(active?.raw?.user_enroll_status));
    }, [active]);

    /* auto-enroll */
    useEffect(() => {
        let mounted = true;
        async function autoEnroll() {
            if (!user?.id || !active?.id || isUserEnrolled) return;
            if (active?.raw?.user_enroll_status) return;
            try {
                await enrollToCategory(user.id, active.id);
                if (mounted && typeof fetchEnrollCoursesByUser === "function") {
                    try { await fetchEnrollCoursesByUser(user.id); } catch (_) { }
                }
            } catch (_) { }
        }
        autoEnroll();
        return () => { mounted = false; };
    }, [index, user, active, isUserEnrolled, enrollToCategory, fetchEnrollCoursesByUser]);

    /* cleanup interval on unmount */
    useEffect(() => () => {
        if (enrollProgressRef.current) clearInterval(enrollProgressRef.current);
    }, []);

    async function startEnroll() {
        if (!user?.id) { setEnrollError("User not authenticated"); return; }
        setEnrollLoading(true);
        setEnrollError(null);
        setEnrollResult(null);
        setEnrollCompleted(false);
        setEnrollProgress(0);
        if (enrollProgressRef.current) clearInterval(enrollProgressRef.current);
        enrollProgressRef.current = setInterval(() => {
            setEnrollProgress((p) => Math.round(Math.min(95, p + Math.random() * 6 + 1)));
        }, 300);
        try {
            const fn = isUserEnrolled ? fetchCategoryAssignmentsForUser : enrollToCategory;
            const arg = isUserEnrolled
                ? { userId: user.id, categoryId: active.id }
                : [user.id, active.id];
            const action = isUserEnrolled ? await fn(arg) : await fn(...arg);
            const payload = action?.payload || action;
            setEnrollResult(payload);
            const rows = payload?.res?.data?.response || payload?.res?.data || [];
            if (Array.isArray(rows) && rows.length > 0) {
                const avg = rows.reduce((s, r) => s + (Number(r.progress_percent) || 0), 0) / rows.length;
                setOverallCourseProgress(Math.round(avg));
            } else {
                setOverallCourseProgress(0);
            }
            clearInterval(enrollProgressRef.current);
            enrollProgressRef.current = null;
            setEnrollProgress(100);
            setEnrollCompleted(true);
            if (!isUserEnrolled) {
                try { await fetchEnrollCoursesByUser(user.id); } catch (_) { }
                setIsUserEnrolled(true);
            }
        } catch (err) {
            setEnrollError(err?.message || String(err));
        } finally {
            setEnrollLoading(false);
        }
    }

    if (!cats.length) return null;

    const image = active.image || active.banner || "/course/default-course-card.png";
    const total = cats.length;

    /* timer helpers */
    const start = active?.raw?.scheduled_start_at ? new Date(active.raw.scheduled_start_at) : null;
    const end = active?.raw?.scheduled_end_at ? new Date(active.raw.scheduled_end_at) : null;
    const now = new Date();

    return (
        <Box sx={{ width: "100%" }}>
            {/* ── Main card ── */}
            <Box
                sx={{
                    position: "relative",
                    borderRadius: 3,
                    overflow: "hidden",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
                    userSelect: "none",
                }}
            >
                {/* Background image */}
                <Box
                    sx={{
                        height: isMobile ? 240 : 320,
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transition: "background-image 0.35s ease",
                    }}
                />

                {/* Cinematic gradient overlays */}
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.28) 55%, rgba(0,0,0,0.10) 100%)", zIndex: 1 }} />
                <Box sx={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 55%)", zIndex: 1 }} />

                {/* ── Top-left: counter badge ── */}
                <Box sx={{ position: "absolute", top: 14, left: 14, zIndex: 3 }}>
                    <Chip
                        icon={<CollectionsBookmarkIcon sx={{ fontSize: "14px !important", color: "#fff !important" }} />}
                        label={`${index + 1} / ${total}`}
                        size="small"
                        sx={{
                            bgcolor: "rgba(0,0,0,0.40)",
                            backdropFilter: "blur(8px)",
                            color: "#fff",
                            fontWeight: 700,
                            fontSize: "0.72rem",
                            border: "1px solid rgba(255,255,255,0.22)",
                            height: 24,
                        }}
                    />
                </Box>

                {/* ── Top-right: countdown timer ── */}
                {start && now < start && (
                    <Box sx={{ position: "absolute", top: 14, right: 14, zIndex: 3, textAlign: "right" }}>
                        <CountdownTimer targetDate={start} variant="small" />
                        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)", mt: 0.25 }}>Starts in</Typography>
                    </Box>
                )}
                {(!start || now >= start) && end && now <= end && (
                    <Box sx={{ position: "absolute", top: 14, right: 14, zIndex: 3, textAlign: "right" }}>
                        <CountdownTimer targetDate={end} variant="small" />
                        <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.75)", mt: 0.25 }}>Expires in</Typography>
                    </Box>
                )}

                {/* ── Bottom content: title + description ── */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        px: { xs: 2.5, md: 3 },
                        pb: { xs: 2.5, md: 3 },
                        pt: 5,
                        zIndex: 2,
                    }}
                >
                    <Typography
                        sx={{
                            color: "#fff",
                            fontSize: { xs: 20, md: 26 },
                            fontWeight: 800,
                            lineHeight: 1.25,
                            textShadow: "0 2px 8px rgba(0,0,0,0.55)",
                            mb: 0.75,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {active.name || active.title || active.categoryName || "Category"}
                    </Typography>

                    <Typography
                        sx={{
                            color: "rgba(255,255,255,0.82)",
                            fontSize: { xs: 13, md: 14 },
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                        }}
                    >
                        {active.description || active.summary || "Explore courses in this category."}
                    </Typography>

                    {/* Course count chip if available */}
                    {active?.raw?.total_courses > 0 && (
                        <Chip
                            icon={<SchoolOutlinedIcon sx={{ fontSize: "13px !important", color: "rgba(255,255,255,0.9) !important" }} />}
                            label={`${active.raw.total_courses} Courses`}
                            size="small"
                            sx={{
                                mt: 1.25,
                                bgcolor: "rgba(255,255,255,0.15)",
                                backdropFilter: "blur(6px)",
                                color: "#fff",
                                fontSize: "0.72rem",
                                fontWeight: 600,
                                border: "1px solid rgba(255,255,255,0.2)",
                                height: 22,
                            }}
                        />
                    )}
                </Box>

                {/* ── Enroll dialog (hidden trigger, dialog kept) ── */}
                <Dialog
                    open={enrollDialogOpen}
                    onClose={(_, reason) => {
                        if (reason === "backdropClick" || reason === "escapeKeyDown") return;
                        setEnrollDialogOpen(false);
                    }}
                    fullScreen={isMobile}
                    fullWidth
                    maxWidth="lg"
                    PaperProps={{ sx: { minHeight: isMobile ? "100vh" : 420, borderRadius: isMobile ? 0 : 3 } }}
                >
                    <DialogTitle>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {active?.name || active?.title || "Category"}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    {isUserEnrolled ? "Course Progress" : "Enrollment Progress"}
                                </Typography>
                            </Box>
                            <IconButton onClick={() => setEnrollDialogOpen(false)}>
                                <CloseIcon />
                            </IconButton>
                        </Box>
                    </DialogTitle>
                    <DialogContent dividers sx={{ maxHeight: isMobile ? "calc(100vh - 112px)" : "60vh", overflowY: "auto" }}>
                        <Box sx={{ width: "100%", mt: 1 }}>
                            <Typography sx={{ mb: 1 }}>
                                {enrollLoading && !enrollCompleted && "Enrollment in progress…"}
                                {enrollCompleted && (isUserEnrolled ? "Course progress details" : "Enrollment completed")}
                            </Typography>
                            <Box sx={{ mb: 1 }}>
                                {!enrollCompleted ? (
                                    <LinearProgress
                                        variant="determinate"
                                        value={enrollProgress}
                                        sx={{ height: 10, borderRadius: 6, "& .MuiLinearProgress-bar": { bgcolor: "var(--primary)" } }}
                                    />
                                ) : (
                                    <Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={overallCourseProgress ?? 0}
                                            sx={{ height: 10, borderRadius: 6, bgcolor: "var(--darkLight)", "& .MuiLinearProgress-bar": { bgcolor: "var(--primary)" } }}
                                        />
                                        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                                            Overall progress: {overallCourseProgress ?? 0}%
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                            {enrollError && <Typography color="error">{enrollError}</Typography>}
                            {enrollResult && (
                                <List>
                                    {(enrollResult?.res?.data?.response || enrollResult?.res?.data || []).map((row, i) => {
                                        const status = (row.status || "").toLowerCase();
                                        const canView = ["active", "in_progress", "inprogress", "completed", "complete"].includes(status);
                                        const scheduled = (row.enrollment_type || "").toLowerCase() === "scheduled" && row.scheduled_start_at;
                                        return (
                                            <ListItem key={i} divider sx={{ alignItems: "center" }}>
                                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                                                    <Box sx={{ position: "relative", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                                                        <CircularProgress variant="determinate" value={Math.min(100, Math.max(0, row.progress_percent || 1))} size={56} sx={{ color: "var(--primary)" }} />
                                                        <Box sx={{ position: "absolute", fontSize: 11, fontWeight: 700 }}>{Math.round(row.progress_percent || 0)}%</Box>
                                                    </Box>
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                                                            <Typography sx={{ fontWeight: 700 }}>{row.title || `Course ${row.course_id}`}</Typography>
                                                            {!isUserEnrolled && row.enrollment_result && (
                                                                <Chip label={row.enrollment_result} size="small" variant="outlined" />
                                                            )}
                                                            {canView && row.status && <Chip label={row.status} size="small" color="success" />}
                                                        </Box>
                                                        {!canView && scheduled && (
                                                            <Typography variant="body2" color="text.secondary">
                                                                Scheduled: {formatDateTimeWithSeconds(row.scheduled_start_at)}
                                                            </Typography>
                                                        )}
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                            Duration: {secondsToTime(row.duration)} · Lessons: {row.total_lessons || 0}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                                                            Expires: {formatDateTimeWithSeconds(row.expires_at)}
                                                        </Typography>
                                                    </Box>
                                                    <Box>
                                                        {canView ? (
                                                            <Button variant="contained" size="small" onClick={() => navigate(`/course/view/${row.course_id}`)}>View</Button>
                                                        ) : (
                                                            <Button variant="outlined" size="small" disabled>
                                                                {row.enrollment_result === "NOT_ENROLLED" ? "Not Enrolled" : "Pending"}
                                                            </Button>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </ListItem>
                                        );
                                    })}
                                </List>
                            )}
                            {!enrollResult && !enrollError && !enrollLoading && (
                                <Typography color="text.secondary">No result yet.</Typography>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions sx={{ px: 3, py: 1.5 }}>
                        <Button variant="outlined" onClick={() => setEnrollDialogOpen(false)}>Close</Button>
                    </DialogActions>
                </Dialog>

                {/* ── Navigation arrows ── */}
                {total > 1 && (
                    <>
                        <IconButton onClick={() => go(index - 1)} size="small" sx={{ ...arrowSx, position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4 }}>
                            <ArrowBackIosNewIcon fontSize="small" />
                        </IconButton>
                        <IconButton onClick={() => go(index + 1)} size="small" sx={{ ...arrowSx, position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", zIndex: 4 }}>
                            <ArrowForwardIosIcon fontSize="small" />
                        </IconButton>
                    </>
                )}
            </Box>

            {/* ── Animated pill dots ── */}
            {total > 1 && (
                <Box sx={{ mt: 1.5, display: "flex", justifyContent: "center", alignItems: "center", gap: 0.75 }}>
                    {cats.map((_, i) => (
                        <Box
                            key={i}
                            onClick={() => go(i)}
                            sx={{
                                width: i === index ? 28 : 8,
                                height: 8,
                                borderRadius: 4,
                                bgcolor: i === index ? "primary.main" : "action.disabled",
                                cursor: "pointer",
                                transition: "width 0.28s cubic-bezier(.4,0,.2,1), background-color 0.28s ease",
                                flexShrink: 0,
                            }}
                        />
                    ))}
                </Box>
            )}
        </Box>
    );
}

/* ================== MAIN EXPORT ======================================== */
export default function CourseCategoryWidget({ title }) {
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoriesError, setCategoriesError] = useState(null);

    useEffect(() => {
        let mounted = true;

        function normalizeArray(payload) {
            if (!payload) return [];
            if (Array.isArray(payload)) return payload;
            if (Array.isArray(payload.response)) return payload.response;
            if (Array.isArray(payload.data)) return payload.data;
            if (Array.isArray(payload.items)) return payload.items;
            if (Array.isArray(payload.results)) return payload.results;
            if (Array.isArray(payload.rows)) return payload.rows;
            if (Array.isArray(payload.categories)) return payload.categories;
            const vals = Object.values(payload);
            if (vals.every((v) => typeof v === "object")) return vals;
            return [];
        }

        async function load() {
            if (!user?.id) { if (mounted) setCategories([]); return; }
            if (mounted) setLoadingCategories(true);
            try {
                const resp = await httpClient.getUserEnrolledCourseCategory(user.id);
                const arr = normalizeArray(resp?.data ?? resp ?? {});
                const mapped = await Promise.all(
                    arr.map(async (it) => ({
                        id: it.id,
                        title: it.title || it.name || it.categoryName || `Category ${it.id}`,
                        description: it.description || it.summary || "",
                        image: it.file_path
                            ? await getSignedUrl({ key: it.file_path })
                            : "/course/default-course-card.png",
                        raw: it,
                    }))
                );
                if (mounted) setCategories(mapped);
            } catch (err) {
                if (mounted) setCategoriesError(err?.message || String(err));
            } finally {
                if (mounted) setLoadingCategories(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, [user]);

    if (title !== "Course Categories") return null;

    return (
        <Box sx={{ width: "100%" }}>
            {loadingCategories ? (
                /* ── Loading skeleton ── */
                <Box>
                    <LinearProgress
                        sx={{
                            mb: 1.5,
                            height: 3,
                            borderRadius: 4,
                            bgcolor: "action.hover",
                            "& .MuiLinearProgress-bar": { borderRadius: 4 },
                        }}
                    />
                    <Skeleton
                        variant="rectangular"
                        height={320}
                        animation="wave"
                        sx={{ borderRadius: 3 }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 1.5 }}>
                        {[0, 1, 2].map((i) => (
                            <Skeleton key={i} variant="rounded" width={i === 0 ? 28 : 8} height={8} sx={{ borderRadius: 4 }} />
                        ))}
                    </Box>
                </Box>
            ) : categoriesError ? (
                /* ── Error state ── */
                <Alert severity="error" sx={{ borderRadius: 3 }}>
                    <AlertTitle sx={{ fontWeight: 700 }}>Failed to load categories</AlertTitle>
                    {categoriesError}
                </Alert>
            ) : categories.length === 0 ? (
                /* ── Empty state ── */
                <Alert
                    severity="info"
                    icon={<CollectionsBookmarkIcon sx={{ fontSize: 28, mt: 0.25 }} />}
                    sx={{
                        borderRadius: 3,
                        py: 2.5,
                        px: 3,
                        alignItems: "flex-start",
                        bgcolor: "#e3f2fd",
                        border: "1px solid #bbdefb",
                        "& .MuiAlert-icon": { color: "#1565c0" },
                    }}
                >
                    <AlertTitle sx={{ fontWeight: 700, fontSize: "1rem", color: "#0d47a1", mb: 0.5 }}>
                        No Categories Enrolled
                    </AlertTitle>
                    <Typography sx={{ fontSize: 14, color: "#1565c0" }}>
                        You haven&apos;t been enrolled in any course categories yet.
                        Please contact your administrator to get started.
                    </Typography>
                </Alert>
            ) : (
                /* ── Carousel ── */
                <HeroCarousel categories={categories} />
            )}
        </Box>
    );
}
