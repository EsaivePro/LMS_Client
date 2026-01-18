import React, { useRef, useState, useEffect } from "react";

import {
    Box,
    Typography,
    Button,
    Chip,
    Stack,
    LinearProgress,
    Pagination,
    IconButton,
    CircularProgress,
    useMediaQuery,
    useTheme,
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText
} from "@mui/material";
import { keyframes } from "@mui/system";
import HourglassFullIcon from '@mui/icons-material/HourglassFull';
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import StyleIcon from '@mui/icons-material/Style';
import useCourseCategory from "../../../hooks/useCourseCategory";
import { httpClient } from "../../../apiClient/httpClient";
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { secondsToTime, formatDateTimeWithSeconds } from "../../../utils/resolver.utils";
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
import CloseIcon from '@mui/icons-material/Close';
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";

import THEME from "../../../constants/theme";
import CountdownTimer from "../../common/CountdownTimer";


/* ================== HERO CAROUSEL (Full image) ================== */
function HeroCarousel({ title, categories = [] }) {
    const [index, setIndex] = useState(0);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();
    const ref = useRef();
    const { user } = useAuth();
    const { enrollToCategory, fetchEnrollCoursesByUser, enrollmentCoursesByUser, fetchCategoryAssignmentsForUser } = useEnrollment();

    const [enrollDialogOpen, setEnrollDialogOpen] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [enrollResult, setEnrollResult] = useState(null);
    const [enrollError, setEnrollError] = useState(null);
    const [enrollProgress, setEnrollProgress] = useState(0);
    const [enrollCompleted, setEnrollCompleted] = useState(false);
    const [overallCourseProgress, setOverallCourseProgress] = useState(null);
    const enrollProgressRef = React.useRef(null);
    const [isUserEnrolled, setIsUserEnrolled] = useState(false);

    const cats = Array.isArray(categories) ? categories : (categories && typeof categories === 'object' ? Object.values(categories) : []);

    const go = (i) => {
        const len = categories.length || 1;
        setIndex(((i % len) + len) % len);
    };

    async function startEnroll() {
        if (!user || !user.id) {
            setEnrollError("User not authenticated");
            return;
        }
        setEnrollLoading(true);
        setEnrollError(null);
        setEnrollResult(null);
        setEnrollCompleted(false);
        setEnrollProgress(0);
        // start fake progress until backend finishes
        if (enrollProgressRef.current) clearInterval(enrollProgressRef.current);
        enrollProgressRef.current = setInterval(() => {
            setEnrollProgress((p) => {
                // increase slowly up to 90-95 while waiting
                const next = Math.min(95, p + Math.random() * 6 + 1);
                return Math.round(next);
            });
        }, 300);
        try {
            if (isUserEnrolled) {
                // fetch assignments for user in this category
                const action = await fetchCategoryAssignmentsForUser({ userId: user.id, categoryId: active.id });
                const payload = action?.payload || action;
                setEnrollResult(payload);
                // compute overall course progress (average)
                try {
                    const rows = (payload?.res?.data?.response || payload?.res?.data || []) || [];
                    if (Array.isArray(rows) && rows.length > 0) {
                        const sum = rows.reduce((s, r) => s + (Number(r.progress_percent) || 0), 0);
                        setOverallCourseProgress(Math.round(sum / rows.length));
                    } else {
                        setOverallCourseProgress(0);
                    }
                } catch (e) {
                    setOverallCourseProgress(0);
                }
                // complete progress
                if (enrollProgressRef.current) {
                    clearInterval(enrollProgressRef.current);
                    enrollProgressRef.current = null;
                }
                setEnrollProgress(100);
                setEnrollCompleted(true);
            } else {
                const action = await enrollToCategory(user.id, active.id);
                // action may be the fulfilled action; extract payload
                const payload = action?.payload || action;
                setEnrollResult(payload);
                // compute overall course progress (average)
                try {
                    const rows = (payload?.res?.data?.response || payload?.res?.data || []) || [];
                    if (Array.isArray(rows) && rows.length > 0) {
                        const sum = rows.reduce((s, r) => s + (Number(r.progress_percent) || 0), 0);
                        setOverallCourseProgress(Math.round(sum / rows.length));
                    } else {
                        setOverallCourseProgress(0);
                    }
                } catch (e) {
                    setOverallCourseProgress(0);
                }
                // complete progress
                if (enrollProgressRef.current) {
                    clearInterval(enrollProgressRef.current);
                    enrollProgressRef.current = null;
                }
                setEnrollProgress(100);
                setEnrollCompleted(true);
                // refresh enrollments for the user and mark enrolled
                if (typeof fetchEnrollCoursesByUser === 'function' && user && user.id) {
                    try {
                        await fetchEnrollCoursesByUser(user.id);
                    } catch (e) {
                        // ignore refresh errors
                    }
                }
                setIsUserEnrolled(true);
            }

        } catch (err) {
            setEnrollError(err?.message || String(err));
        } finally {
            setEnrollLoading(false);
        }
    }

    // use shared secondsToTime and formatDateTimeWithSeconds helpers

    useEffect(() => {
        // keep scroll in sync if using ref for any purpose later
        if (!ref.current) return;
    }, [index]);

    // cleanup progress interval when unmounting or when dialog closes
    useEffect(() => {
        return () => {
            if (enrollProgressRef.current) {
                clearInterval(enrollProgressRef.current);
                enrollProgressRef.current = null;
            }
        };
    }, []);

    const active = cats[index] || {};

    useEffect(() => {
        setIsUserEnrolled(!!(active && active.raw && active.raw.user_enroll_status));
    }, [active]);

    // ensure hooks above always run; return early if no categories to render
    if (!cats || cats.length <= 0) {
        return null;
    }

    // Refresh enrolled courses when user changes (or after enrollment)
    // useEffect(() => {
    //     if (user && user?.id && typeof fetchEnrollCoursesByUser === 'function') {
    //         (async () => {
    //             try {
    //                 await fetchEnrollCoursesByUser(user.id);
    //             } catch (e) {
    //                 // ignore
    //             }
    //         })();
    //     }
    // }, [user, fetchEnrollCoursesByUser]);
    const image = active.image || active.banner || "/course/default-course-card.png";

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ position: 'relative', borderRadius: 1, overflow: 'hidden', boxShadow: 3 }}>
                <Box sx={{ height: isMobile ? 220 : 300, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />

                {/* Overlay content - title/desc left; timer top-right; enroll button bottom-right in full-width bar */}
                <Box sx={{ position: 'absolute', backgroundColor: "#00000029", inset: 0, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'stretch', px: { xs: 2, md: 8 }, py: { xs: 2, md: 2 }, zIndex: 3 }}>
                    {/* Left: title + description */}
                    <Box sx={{ width: { xs: '100%', md: '55%' }, color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', pr: { md: 3 } }}>
                        <Typography variant={isMobile ? 'h5' : 'h3'} fontWeight={700} sx={{ mb: 1 }}>
                            {active.name || active.title || active.categoryName || 'Category'}
                        </Typography>
                        <Typography variant="body1" sx={{ color: 'rgba(255,255,255,0.9)' }}>
                            {active.description || active.summary || 'Explore courses in this category.'}
                        </Typography>
                    </Box>

                    {/* Right: timer at top-right and bottom bar with enroll aligned right */}
                    <Box sx={{ width: { xs: '100%', md: '45%' }, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch', py: { xs: 2, md: 0 } }}>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                            {(() => {
                                const start = active.raw && active.raw.scheduled_start_at ? new Date(active.raw.scheduled_start_at) : null;
                                const end = active.raw && active.raw.scheduled_end_at ? new Date(active.raw.scheduled_end_at) : null;
                                const now = new Date();

                                if (start && now < start) {
                                    return (
                                        <Box sx={{ textAlign: 'right', mt: 2 }}>
                                            <CountdownTimer targetDate={start} variant="small" />
                                            <Typography variant="body1" sx={{ mb: 1, width: "100%", borderRadius: 1, color: "#ffffff", py: 1 }} >Starts At</Typography>
                                        </Box>
                                    );
                                }

                                if (!start || now >= start) {
                                    if (end && now <= end) {
                                        return (
                                            <Box sx={{ textAlign: 'right', mt: 2 }}>
                                                <CountdownTimer targetDate={end} variant="small" />
                                                <Typography variant="body1" sx={{ mb: 1, width: "100%", borderRadius: 1, color: "#ffffff", py: 1 }} >Expried On</Typography>
                                            </Box>
                                        );
                                    }
                                }

                                return null;
                            })()}
                        </Box>

                        {/* Bottom bar that spans right column width; button aligned to right */}
                        <Box sx={{ mt: { xs: 2, md: 0 } }}>
                            <Box sx={{ width: '100%', py: 1.5, px: 2, borderRadius: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {(() => {
                                    const start = active.raw && active.raw.scheduled_start_at ? new Date(active.raw.scheduled_start_at) : null;
                                    const now = new Date();
                                    if (!start || now >= start) {
                                        // If user is already enrolled show "View Courses", otherwise show "Enroll Now"
                                        return (
                                            <>
                                                <Button
                                                    variant="contained"
                                                    startIcon={isUserEnrolled ? <CollectionsBookmarkIcon sx={{ color: '#000' }} /> : <PlayArrowIcon sx={{ color: '#000' }} />}
                                                    onClick={() => { setEnrollDialogOpen(true); startEnroll(); }}
                                                    sx={{
                                                        backgroundColor: 'rgba(255,255,255,0.95)',
                                                        color: '#000',
                                                        textTransform: 'none',
                                                        fontWeight: 700,
                                                        borderRadius: 1,
                                                        fontSize: 16,
                                                        px: 3,
                                                        py: 1,
                                                        boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
                                                        '&:hover': { boxShadow: '0 8px 22px rgba(0,0,0,0.16)', transform: 'scale(1.05)' },
                                                    }}
                                                >
                                                    {isUserEnrolled ? "Category Progress" : "Enroll Now"}
                                                </Button>

                                                <Dialog
                                                    open={enrollDialogOpen}
                                                    onClose={(e, reason) => {
                                                        // prevent closing on backdrop click or escape
                                                        if (reason === 'backdropClick' || reason === 'escapeKeyDown') return;
                                                        setEnrollDialogOpen(false);
                                                    }}
                                                    fullWidth
                                                    maxWidth="lg"
                                                    PaperProps={{ sx: { minHeight: 420 } }}
                                                >
                                                    <DialogTitle>
                                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                                                                <Typography variant="h6">
                                                                    {active?.name || active?.title || active?.categoryName || 'Category'}
                                                                </Typography>
                                                                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                                    {isUserEnrolled ? "Course Progress" : "Enrollment Progress"}
                                                                </Typography>
                                                            </Box>
                                                            <IconButton aria-label="close" onClick={() => setEnrollDialogOpen(false)} sx={{ color: 'inherit' }}>
                                                                <CloseIcon />
                                                            </IconButton>
                                                        </Box>
                                                    </DialogTitle>
                                                    <DialogContent dividers sx={{ maxHeight: '60vh', overflowY: 'auto', minHeight: 300 }}>
                                                        {/* show linear progress with message */}
                                                        <Box sx={{ width: '100%', mt: 1 }}>
                                                            {!isUserEnrolled && <Typography sx={{ mb: 1 }}>
                                                                {enrollLoading && !enrollCompleted && 'Enrollment in progress...'}
                                                                {enrollCompleted && 'Enrollment completed'}
                                                            </Typography>}
                                                            {isUserEnrolled && <Typography sx={{ mb: 1 }}>
                                                                {enrollCompleted && 'Course progress details'}
                                                            </Typography>}
                                                            <Box sx={{ width: '100%', mb: 1 }}>
                                                                {!enrollCompleted ? (
                                                                    <LinearProgress variant="determinate" value={enrollProgress} sx={{ height: 10, borderRadius: 6, transition: 'all 400ms linear' }} />
                                                                ) : (
                                                                    <Box>
                                                                        <LinearProgress variant="determinate" value={overallCourseProgress ?? 0} sx={{ height: 10, borderRadius: 6, transition: 'all 400ms linear' }} />
                                                                        <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>{`Overall course progress: ${overallCourseProgress ?? 0}%`}</Typography>
                                                                    </Box>
                                                                )}
                                                            </Box>

                                                            {enrollError && <Typography color="error">{enrollError}</Typography>}

                                                            {enrollResult && (
                                                                <Box sx={{ mt: 1 }}>
                                                                    {!isUserEnrolled && <Typography sx={{ mb: 1 }}>{enrollResult?.res?.data?.message || 'Result'}</Typography>}
                                                                    <List>
                                                                        {(enrollResult?.res?.data?.response || enrollResult?.res?.data || []).map((row, i) => {
                                                                            const status = (row.status || '').toLowerCase();
                                                                            const canView = ['active', 'in_progress', 'inprogress', 'completed', 'complete'].includes(status);
                                                                            const isScheduled = (row.enrollment_type || '').toLowerCase() === 'scheduled' && row.scheduled_start_at;
                                                                            return (
                                                                                <ListItem key={i} divider sx={{ alignItems: 'center' }}>
                                                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                                                                                        <Box sx={{ position: 'relative', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                                                            <CircularProgress variant="determinate" value={Math.min(100, Math.max(0, row.progress_percent || 1))} size={56} />
                                                                                            <Box sx={{ position: 'absolute', fontSize: 12 }}>{`${Math.round(row.progress_percent || 0)}%`}</Box>
                                                                                        </Box>

                                                                                        <Box sx={{ flex: 1 }}>
                                                                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                                                                                                <Typography sx={{ fontWeight: 700 }}>{row.title || `Course ${row.course_id}`}</Typography>
                                                                                                {row.enrollment_result && !isUserEnrolled && (
                                                                                                    <Chip label={row.enrollment_result} size="small" variant="outlined" sx={{ ml: 1 }} />
                                                                                                )}
                                                                                                {canView && row.status && (
                                                                                                    <Chip label={row.status} size="small" color="success" sx={{ ml: 1 }} />
                                                                                                )}
                                                                                            </Box>

                                                                                            {!canView && isScheduled && (
                                                                                                <Box sx={{ mt: 0.5 }}>
                                                                                                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>{`Scheduled Start: ${formatDateTimeWithSeconds(row.scheduled_start_at)}`}</Typography>
                                                                                                </Box>
                                                                                            )}

                                                                                            <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{row.description}</Typography>
                                                                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>{`Duration: ${secondsToTime(row.duration)} • Lessons: ${row.total_lessons || 0}`}</Typography>

                                                                                            <Typography variant="caption" sx={{ display: 'block', color: 'text.secondary', mt: 0.5 }}>{`Expires: ${formatDateTimeWithSeconds(row.expires_at)}`}</Typography>
                                                                                        </Box>

                                                                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                                                            {canView ? (
                                                                                                <Button variant="outlined" onClick={() => navigate(`/course/view/${row.course_id}`)}>View</Button>
                                                                                            ) : (
                                                                                                // show placeholder for non-viewable items
                                                                                                <Button variant="outlined" disabled>{row.enrollment_result === "NOT_ENROLLED" ? "Not Enrolled" : "Pending"}</Button>
                                                                                            )}
                                                                                        </Box>
                                                                                    </Box>
                                                                                </ListItem>
                                                                            );
                                                                        })}
                                                                    </List>
                                                                </Box>
                                                            )}
                                                            {!enrollResult && !enrollError && !enrollLoading && <Typography>No result yet.</Typography>}
                                                        </Box>
                                                    </DialogContent>
                                                    <DialogActions>
                                                        <Button onClick={() => setEnrollDialogOpen(false)}>Close</Button>
                                                    </DialogActions>
                                                </Dialog>
                                            </>
                                        );
                                    }

                                    return null;
                                })()}
                            </Box>
                        </Box>
                    </Box>
                </Box>

                {/* Gradient (visual only - behind overlay) */}
                <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.18) 40%, rgba(0,0,0,0.02) 100%)', pointerEvents: 'none', zIndex: 2 }} />

                {/* Arrows */}
                <IconButton onClick={() => go(index - 1)} sx={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 4 }}>
                    <ArrowBackIosNewIcon />
                </IconButton>
                <IconButton onClick={() => go(index + 1)} sx={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#fff', bgcolor: 'rgba(0,0,0,0.3)', zIndex: 4 }}>
                    <ArrowForwardIosIcon />
                </IconButton>
            </Box>

            {/* Dots */}
            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'center', gap: 1, zIndex: 5 }}>
                {cats.map((c, i) => (
                    <Box
                        key={i}
                        onClick={() => go(i)}
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: i === index ? 'var(--primaryMedium)' : 'rgba(0,0,0,0.65)',
                            cursor: 'pointer',
                            border: i === index ? '2px solid rgba(255,255,255,0.15)' : 'none',
                            transition: 'transform .12s ease',
                            transform: i === index ? 'scale(1.15)' : 'scale(1)'
                        }}
                    />
                ))}
            </Box>
        </Box>
    );
}

/* ================== MAIN EXPORT ================== */

export default function CourseCategoryWidget({ title }) {
    // use enrollment data for current user instead of global course lists
    const { enrollmentCoursesByUser, loading: enrollmentLoading } = useEnrollment();
    const { user } = useAuth();
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [categoriesError, setCategoriesError] = useState(null);

    // Map enrollment records to simplified course-like objects for display
    const courses = useMemo(() => {
        const rows = (user && enrollmentCoursesByUser && enrollmentCoursesByUser[user.id]) || [];
        return rows.map((e) => ({
            id: e.course_id,
            title: e.title || "Untitled Course",
            description: e.description || "Untitled description",
            minutes: e.duration || 0,
            lessons: e.total_lessons || 0,
            topics: e.total_topics || [],
            progress: e.progress_percent || 0,
        }));
    }, [enrollmentCoursesByUser, user]);

    // Fetch enrolled categories for current user only
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
            if (vals.every(v => typeof v === 'object')) return vals;
            return [];
        }

        async function load() {
            try {
                // setLoadingCategories(true);
                if (!user || !user.id) {
                    if (mounted) setCategories([]);
                    return;
                }

                const resp = await httpClient.getUserEnrolledCourseCategory(user.id);
                const arr = normalizeArray(resp?.data ?? resp ?? {});
                const mapped = arr.map((it) => ({
                    id: it.id,
                    title: it.title || it.name || it.categoryName || `Category ${it.id}`,
                    description: it.description || it.summary || "",
                    image: it.imageurl || "/course/default-course-card.png",
                    raw: it,
                }));

                if (mounted) setCategories(mapped);
            } catch (err) {
                if (mounted) setCategoriesError(err?.message || err);
            } finally {
                // if (mounted) setLoadingCategories(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, [user]);

    return (
        <Box sx={{ width: "100%" }}>

            {title == "Course Categories" && (
                <Box sx={{ mt: 1 }}>
                    {loadingCategories ? (
                        <Box sx={{ minHeight: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <HeroCarousel title="Course Categories" categories={categories || []} />
                    )}
                </Box>
            )}

        </Box>
    );
}
