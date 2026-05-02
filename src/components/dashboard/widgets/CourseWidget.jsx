import React, { useRef, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Chip,
    LinearProgress,
    Pagination,
    IconButton,
    CircularProgress,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import { keyframes } from "@mui/system";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import { useNavigate } from "react-router-dom";
import useDashboard from "../../../hooks/useDashboard";
import { formatDateTimeWithSeconds } from "../../../utils/resolver.utils";
import THEME from "../../../constants/theme";

const { colors, shadows, radius } = THEME;

/* ─── animations ─────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── status helper ───────────────────────────────────────────────────────── */
function getCourseStatus(progress) {
    if (progress >= 100)
        return { label: "Completed", color: colors.accent, bg: colors.accentLight };
    if (progress > 0)
        return { label: "In Progress", color: colors.primary, bg: colors.primaryLight };
    return { label: "Not Started", color: colors.textMuted, bg: colors.surface2 };
}

/* ─── duration formatter ──────────────────────────────────────────────────── */
function formatDuration(val) {
    if (!val) return null;
    const parts = String(val).split(":").map(Number);
    let secs =
        parts.length === 3
            ? parts[0] * 3600 + parts[1] * 60 + parts[2]
            : parts.length === 2
                ? parts[0] * 60 + parts[1]
                : Number(val) || 0;
    if (!secs) return null;
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/* ═══════════════════════════════════════════════════════════════════════════
   COURSE CARD
═══════════════════════════════════════════════════════════════════════════ */
function CourseCard({ course, index }) {
    const navigate = useNavigate();
    const progress = course.progress ?? 0;
    const status = getCourseStatus(progress);
    const image = course.imageurl || "/course/default-course-card.png";
    const duration = formatDuration(course.duration ?? course.minutes);
    const expiryDisplay = formatDateTimeWithSeconds(course.expiry);

    return (
        <Box
            onClick={() => navigate(`/course/view/${course.id}`)}
            sx={{
                width: 265,
                flexShrink: 0,
                borderRadius: radius.md,
                overflow: "hidden",
                backgroundColor: colors.surface,
                boxShadow: shadows.sm,
                cursor: "pointer",
                animation: `${fadeUp} 420ms ease both`,
                animationDelay: `${index * 60}ms`,
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
                "&:hover": {
                    transform: "translateY(-5px)",
                    boxShadow: shadows.md,
                },
            }}
        >
            {/* ── Image ── */}
            <Box sx={{ position: "relative", height: 145, overflow: "hidden" }}>
                <Box
                    sx={{
                        width: "100%",
                        height: "100%",
                        backgroundImage: `url(${image})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        transition: "transform 0.4s ease",
                        ".MuiBox-root:hover &": { transform: "scale(1.06)" },
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.55) 100%)",
                    }}
                />

                {/* Status chip */}
                <Chip
                    label={status.label}
                    size="small"
                    sx={{
                        position: "absolute",
                        top: 10,
                        right: 10,
                        bgcolor: status.color,
                        color: "#fff",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        height: 22,
                        borderRadius: "6px",
                    }}
                />

                {/* Duration badge */}
                {duration && (
                    <Box
                        sx={{
                            position: "absolute",
                            bottom: 8,
                            left: 10,
                            display: "flex",
                            alignItems: "center",
                            gap: 0.4,
                            px: 0.9,
                            py: 0.2,
                            bgcolor: "rgba(0,0,0,0.6)",
                            borderRadius: "6px",
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 11, color: "#fff" }} />
                        <Typography sx={{ fontSize: "0.7rem", color: "#fff", fontWeight: 600 }}>
                            {duration}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Body ── */}
            <Box sx={{ p: 2, pb: 1.5 }}>
                <Typography
                    fontWeight={700}
                    fontSize={14}
                    color={colors.textPrimary}
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                        mb: 0.75,
                        minHeight: 40,
                    }}
                >
                    {course.title || "Untitled Course"}
                </Typography>

                {/* Instructor row */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 1.5,
                    }}
                >
                    <PersonOutlineIcon sx={{ fontSize: 13, color: colors.textMuted }} />
                    <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary, fontSize: "0.73rem" }}
                    >
                        {course.instructor || "Instructor"}
                    </Typography>

                    {course.lessons > 0 && (
                        <>
                            <Box
                                sx={{
                                    width: 3,
                                    height: 3,
                                    borderRadius: "50%",
                                    bgcolor: colors.surface4,
                                    mx: 0.5,
                                }}
                            />
                            <MenuBookIcon sx={{ fontSize: 13, color: colors.textMuted }} />
                            <Typography
                                variant="caption"
                                sx={{ color: colors.textSecondary, fontSize: "0.73rem" }}
                            >
                                {course.lessons} lessons
                            </Typography>
                        </>
                    )}
                </Box>

                {/* Progress */}
                <Box>
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 0.6,
                        }}
                    >
                        <Typography
                            variant="caption"
                            sx={{ color: colors.textSecondary, fontSize: "0.72rem" }}
                        >
                            Progress
                        </Typography>
                        <Typography
                            variant="caption"
                            fontWeight={700}
                            sx={{ color: status.color, fontSize: "0.72rem" }}
                        >
                            {progress}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={Math.max(progress, 2)}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            bgcolor: colors.surface3,
                            "& .MuiLinearProgress-bar": {
                                bgcolor: status.color,
                                borderRadius: 3,
                            },
                        }}
                    />
                </Box>

                {/* Expiry */}
                {expiryDisplay && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                            mt: 1,
                        }}
                    >
                        <AccessTimeIcon sx={{ fontSize: 12, color: colors.textMuted }} />
                        <Typography
                            variant="caption"
                            sx={{ color: colors.textMuted, fontSize: "0.7rem" }}
                        >
                            Expires: {expiryDisplay}
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Footer ── */}
            <Box
                sx={{
                    px: 2,
                    pb: 1.75,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        px: 1.5,
                        py: 0.6,
                        borderRadius: "8px",
                        bgcolor: colors.primaryLight,
                        color: colors.primary,
                        fontSize: "0.78rem",
                        fontWeight: 700,
                        transition: "background 0.2s",
                        "&:hover": { bgcolor: colors.primary, color: "#fff" },
                    }}
                >
                    <PlayArrowIcon sx={{ fontSize: 15 }} />
                    {progress > 0 && progress < 100 ? "Resume" : progress >= 100 ? "Review" : "Start"}
                </Box>
            </Box>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COURSE PROGRESS CARD
═══════════════════════════════════════════════════════════════════════════ */
function CourseProgressCard({ courses }) {
    const completed = courses.filter((c) => (c.progress ?? 0) >= 100).length;
    const inProgress = courses.filter(
        (c) => (c.progress ?? 0) > 0 && (c.progress ?? 0) < 100
    ).length;
    const notStarted = courses.filter((c) => (c.progress ?? 0) === 0).length;
    const total = courses.length;
    const overallProgress =
        total > 0
            ? Math.round(
                courses.reduce((sum, c) => sum + (c.progress ?? 0), 0) / total
            )
            : 0;

    const legend = [
        { label: "Completed", count: completed, color: colors.accent },
        { label: "In Progress", count: inProgress, color: colors.primary },
        { label: "Not Started", count: notStarted, color: colors.textMuted },
    ];

    return (
        <Box
            sx={{
                p: 2.5,
                boxShadow: shadows.sm,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 2,
                minWidth: 220,
                width: 300,
                flexShrink: 0,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)"
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    width: "100%",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography
                    color={colors.textPrimary}
                    sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        // letterSpacing: "0.01em",
                    }}
                >
                    Course Progress
                </Typography>
            </Box>
            <Box sx={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
                justifyContent: "center",
                alignItems: "center",
                height: "100%"
            }}>

                {/* Circular progress */}
                <Box
                    sx={{
                        position: "relative",
                        display: "inline-flex",
                        width: 150,
                        height: 150,
                        my: 0.5,
                    }}
                >
                    {/* Track */}
                    <CircularProgress
                        variant="determinate"
                        value={100}
                        size={150}
                        thickness={5}
                        sx={{ color: colors.surface3, position: "absolute", top: 0, left: 0 }}
                    />
                    {/* Value */}
                    <CircularProgress
                        variant="determinate"
                        value={overallProgress}
                        size={150}
                        thickness={5}
                        sx={{ color: colors.primary }}
                    />
                    {/* Center label */}
                    <Box
                        sx={{
                            position: "absolute",
                            inset: 0,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 0.3,
                        }}
                    >
                        <Typography
                            fontWeight={800}
                            fontSize={28}
                            lineHeight={1}
                            color={colors.textPrimary}
                        >
                            {overallProgress}%
                        </Typography>
                        <Typography
                            variant="caption"
                            textAlign="center"
                            sx={{
                                color: colors.textSecondary,
                                fontSize: "0.68rem",
                                lineHeight: 1.3,
                                maxWidth: 80,
                            }}
                        >
                            Overall Progress
                        </Typography>
                    </Box>
                </Box>

                {/* Legend */}
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        gap: 1.25,
                    }}
                >
                    {legend.map(({ label, count, color }) => (
                        <Box
                            key={label}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <Box
                                    sx={{
                                        width: 10,
                                        height: 10,
                                        borderRadius: "50%",
                                        bgcolor: color,
                                        flexShrink: 0,
                                    }}
                                />
                                <Typography
                                    variant="body2"
                                    sx={{ color: colors.textSecondary, fontSize: "0.8rem" }}
                                >
                                    {label}
                                </Typography>
                            </Box>
                            <Typography
                                variant="body2"
                                fontWeight={700}
                                sx={{ color: colors.textPrimary, fontSize: "0.82rem" }}
                            >
                                {count}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COURSE CAROUSEL  (My Courses section + Course Progress side-by-side)
═══════════════════════════════════════════════════════════════════════════ */
function CourseCarousel({ courses }) {
    const scrollRef = useRef();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

    const scroll = (dir) => {
        scrollRef.current?.scrollBy({
            left: dir === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    return (
        <Box
            sx={{
                display: "flex",
                gap: 2.5,
                alignItems: "stretch",
                flexDirection: isMobile ? "column" : "row",
            }}
        >
            {/* ── Left: carousel section ── */}
            <Box sx={{
                flex: 1, minWidth: 0,
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
            }}>
                {/* Section header */}
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 2,
                    }}
                >
                    {/* <Typography
                        fontWeight={700}
                        fontSize={16}
                        color={colors.textPrimary}
                    >
                        My Courses
                    </Typography> */}

                    <Typography
                        color={colors.textPrimary}
                        sx={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            lineHeight: 1.2,
                            // letterSpacing: "0.01em",
                        }}
                    >
                        My Courses
                    </Typography>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <IconButton
                            size="small"
                            onClick={() => scroll("left")}
                            sx={{
                                bgcolor: colors.surface2,
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: colors.surface3 },
                            }}
                        >
                            <ArrowBackIosNewIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                        <IconButton
                            size="small"
                            onClick={() => scroll("right")}
                            sx={{
                                bgcolor: colors.surface2,
                                width: 28,
                                height: 28,
                                "&:hover": { bgcolor: colors.surface3 },
                            }}
                        >
                            <ArrowForwardIosIcon sx={{ fontSize: 12 }} />
                        </IconButton>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.3,
                                ml: 0.5,
                                color: colors.primary,
                                cursor: "pointer",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            <Typography
                                variant="caption"
                                fontWeight={600}
                                sx={{ color: colors.primary, fontSize: "0.8rem" }}
                            >
                                View all
                            </Typography>
                            <ChevronRightIcon sx={{ fontSize: 16, color: colors.primary }} />
                        </Box>
                    </Box>
                </Box>

                {/* Scrollable cards */}
                {courses.length > 0 ? (
                    <Box
                        ref={scrollRef}
                        sx={{
                            display: "flex",
                            gap: 2,
                            overflowX: "auto",
                            pb: 1.5,
                            scrollBehavior: "smooth",
                            "&::-webkit-scrollbar": { height: 4 },
                            "&::-webkit-scrollbar-thumb": {
                                bgcolor: colors.surface3,
                                borderRadius: 2,
                            },
                            "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
                        }}
                    >
                        {courses.map((course, idx) => (
                            <CourseCard key={course.id || idx} course={course} index={idx} />
                        ))}
                    </Box>
                ) : (
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            minHeight: 180,
                            bgcolor: colors.surface2,
                            borderRadius: radius.md,
                            gap: 1,
                            p: 3,
                        }}
                    >
                        <CollectionsBookmarkIcon
                            sx={{ fontSize: 36, color: colors.textMuted }}
                        />
                        <Typography
                            variant="body2"
                            sx={{ color: colors.textSecondary, textAlign: "center" }}
                        >
                            No courses have been assigned yet.
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* ── Right: Course Progress card ── */}
            {!isMobile && <CourseProgressCard courses={courses} />}

            {/* Mobile: progress card below */}
            {isMobile && (
                <Box sx={{ width: "100%" }}>
                    <CourseProgressCard courses={courses} />
                </Box>
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   COURSE GRID  (Available Courses)
═══════════════════════════════════════════════════════════════════════════ */
function CourseGrid({ title, courses }) {
    const ITEMS_PER_PAGE = 8;
    const [page, setPage] = useState(1);

    const paginated = courses.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    return (
        <Box sx={{ width: "100%" }}>
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.5,
                }}
            >
                <Typography fontWeight={700} fontSize={16} color={colors.textPrimary}>
                    {title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary }}
                >
                    {courses.length} course{courses.length !== 1 ? "s" : ""}
                </Typography>
            </Box>

            {courses.length > 0 ? (
                <>
                    <Box
                        sx={{
                            display: "grid",
                            gridTemplateColumns: "repeat(auto-fill, minmax(255px, 1fr))",
                            gap: 2.5,
                        }}
                    >
                        {paginated.map((course, idx) => (
                            <CourseCard
                                key={course.id || idx}
                                course={course}
                                index={idx}
                            />
                        ))}
                    </Box>

                    {courses.length > ITEMS_PER_PAGE && (
                        <Box
                            sx={{ mt: 3, display: "flex", justifyContent: "center" }}
                        >
                            <Pagination
                                count={Math.ceil(courses.length / ITEMS_PER_PAGE)}
                                page={page}
                                onChange={(_, v) => setPage(v)}
                                color="primary"
                                size="small"
                            />
                        </Box>
                    )}
                </>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 200,
                        bgcolor: colors.surface2,
                        borderRadius: radius.md,
                        gap: 1.5,
                        p: 4,
                    }}
                >
                    <CollectionsBookmarkIcon
                        sx={{ fontSize: 40, color: colors.textMuted }}
                    />
                    <Typography
                        variant="body2"
                        sx={{ color: colors.textSecondary, textAlign: "center" }}
                    >
                        No courses available right now.
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function CourseWidget({ title }) {
    const { enrolledCourses } = useDashboard();

    const courses = useMemo(() => {
        const rows = (enrolledCourses || []).filter((e) => {
            const s = e?.status ? String(e.status).toLowerCase() : "";
            return s === "active" || s === "inprogress" || s === "completed";
        });

        return rows.map((e) => ({
            id: e.module_id,
            title: e.module_title || "Untitled Course",
            description: e.module_description || "",
            minutes: e.duration || 0,
            lessons: e.total_lessons || 0,
            topics: e.total_topics || [],
            progress: e.progress_percent || 0,
            imageurl: e.thumbnail_url || null,
            instructor: e.instructor_name || e.instructor || null,
            expiry: e.expires_at || null,
        }));
    }, [enrolledCourses]);

    return (
        <Box sx={{ width: "100%" }}>
            {title === "My Courses" && (
                <CourseCarousel courses={courses} />
            )}
            {title === "Available Courses" && (
                <CourseGrid title={title} courses={courses} />
            )}
        </Box>
    );
}
