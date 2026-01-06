import React, { useRef, useState } from "react";

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
    Divider
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
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import CollectionsBookmarkIcon from '@mui/icons-material/CollectionsBookmark';
// import PlayArrowIcon from "@mui/icons-material/PlayArrow";
// import MenuBookIcon from "@mui/icons-material/MenuBook";
// import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
// import AccessTimeIcon from "@mui/icons-material/AccessTime";

import THEME from "../../../constants/theme";

// Build ACCENTS from theme.card1..card20 with a safe fallback list
const FALLBACK_ACCENTS = [
    "#83acffff", "#fe808dff", "#a27affff", "#face75ff", "#7dffc5ff",
    "#cfe9ffff", "#ffd6e6ff", "#f7d8baff", "#e6d7ffff", "#fff3b0ff",
    "#d6f5e0ff", "#e9e0ffff", "#ffdfd0ff", "#d0f0ffff", "#f0e6ffff",
    "#ffe8ccff", "#e0fff4ff", "#fbe7ffff", "#e8f6ffff", "#f6fff0ff",
];

const ACCENTS = Array.from({ length: 20 }, (_, i) => THEME?.colors?.[`card${i + 1}`] || FALLBACK_ACCENTS[i]);

// Return a stable pseudo-random accent for a given key (course id/title)
function getAccentForKey(key) {
    const s = String(key ?? "");
    let hash = 0;
    for (let i = 0; i < s.length; i++) {
        hash = ((hash << 5) - hash) + s.charCodeAt(i);
        hash |= 0; // force 32-bit int
    }
    const idx = Math.abs(hash) % ACCENTS.length;
    return ACCENTS[idx];
}

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

function CourseCard({ course, index, width = 300 }) {
    const accent = getAccentForKey(course.id ?? course.title ?? index);
    const navigate = useNavigate();

    const progress = course.progress ?? 0;

    function formatDurationToHHMMSS(val) {
        if (!val) return "00:00:00";
        const parts = String(val).split(":").map(Number);
        let seconds =
            parts.length === 3
                ? parts[0] * 3600 + parts[1] * 60 + parts[2]
                : parts.length === 2
                    ? parts[0] * 60 + parts[1]
                    : Number(val) || 0;

        const pad = (n) => String(n).padStart(2, "0");
        return `${pad(Math.floor(seconds / 3600))}:${pad(
            Math.floor((seconds % 3600) / 60)
        )}:${pad(seconds % 60)}`;
    }

    const displayDuration = formatDurationToHHMMSS(course.duration ?? course.minutes);
    const image = course.image || "/course/default-course-card.png";

    return (
        <Box
            sx={{
                minWidth: width,
                maxWidth: width,
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "var(--surface)",
                boxShadow: 1,
                transition: "transform .3s ease, box-shadow .3s ease",
                animation: `${fadeUp} 420ms ease both`,
                animationDelay: `${index * 60}ms`,
                willChange: "transform, opacity",
                "&:hover": { transform: "scale(1.02)", boxShadow: 2 },
                "&:hover .course-image": { transform: "scale(1.04)" },
            }}
        >
            {/* ================= IMAGE HEADER ================= */}
            <Box
                className="course-image"
                sx={{
                    height: 140,
                    backgroundImage: `url(${image})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    transition: "transform .35s ease",
                    transformOrigin: "center center",
                }}
            >
                {/* Gradient overlay */}
                <Box
                    sx={{
                        position: "absolute",
                        inset: 0,
                        background:
                            "linear-gradient(to bottom, rgba(0,0,0,0.25), rgba(0,0,0,0.7))",
                    }}
                />

                {/* Duration badge */}
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        px: 1,
                        py: 0.3,
                        fontSize: 12,
                        borderRadius: 1,
                        backgroundColor: "rgba(0,0,0,0.65)",
                        color: "#fff",
                        fontWeight: 600,
                    }}
                >
                    {displayDuration}
                </Box>
            </Box>

            {/* ================= CONTENT ================= */}
            <Box sx={{ p: 2 }}>
                <Typography
                    fontWeight={700}
                    fontSize={16}
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.title || "Untitled Course"}
                </Typography>

                {/* <Divider
                    sx={{
                        backgroundColor: accent,
                        height: 4,
                        my: 1,
                        borderRadius: 1,
                    }}
                /> */}

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.description ||
                        "Learn and master this course with guided lessons."}
                </Typography>
            </Box>

            {/* ================= PROGRESS ================= */}
            {progress !== null && (
                <Box sx={{ px: 2 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress || 2}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "var(--darkLight)",
                            "& .MuiLinearProgress-bar": {
                                backgroundColor: "var(--primaryMedium)",
                            },
                        }}
                    />
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 0.5, display: "block" }}
                    >
                        {progress}% completed
                    </Typography>
                </Box>
            )}

            {/* ================= FOOTER ================= */}
            <Box
                sx={{
                    px: 2,
                    py: 1.5,
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    variant="contained"
                    endIcon={<PlayArrowIcon />}
                    sx={{
                        backgroundColor: "var(--darkMedium)",
                        borderRadius: 1,
                        textTransform: "none",
                        px: 3,
                        "&:hover": { backgroundColor: "var(--primaryMedium)" },
                    }}
                    onClick={() => navigate(`/course/view/${course.id}`)}
                >
                    {progress ? "Continue" : "Start"}
                </Button>
            </Box>
        </Box>
    );
}



/* ================== COURSE GRID ================== */

function CourseGrid({ title, courses }) {
    const ITEMS_PER_PAGE = 4;
    const [page, setPage] = useState(1);

    const paginated = courses.slice(
        (page - 1) * ITEMS_PER_PAGE,
        page * ITEMS_PER_PAGE
    );

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" fontWeight={500} sx={{ mb: 3 }} >
                {title}
            </Typography>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns:
                        "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: 3,
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
                <Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}>
                    <Pagination
                        count={Math.ceil(courses.length / ITEMS_PER_PAGE)}
                        page={page}
                        onChange={(_, v) => setPage(v)}
                        color="primary"
                    />
                </Box>
            )}
        </Box>
    );
}

/* ================== COURSE CAROUSEL ================== */

function CourseCarousel({ title, courses }) {
    const ref = useRef();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const scroll = (dir) => {
        ref.current.scrollBy({
            left: dir === "left" ? -300 : 300,
            behavior: "smooth",
        });
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box
                sx={{
                    mb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant={isMobile ? "h6" : "h5"} fontWeight={500}>
                    {title}
                </Typography>

                <Box>
                    <IconButton onClick={() => scroll("left")}>
                        <ArrowBackIosNewIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => scroll("right")}>
                        <ArrowForwardIosIcon fontSize="small" />
                    </IconButton>
                </Box>
            </Box>

            <Box
                ref={ref}
                sx={{
                    display: "flex",
                    gap: 6,
                    p: 0,
                    pt: 2,
                    pb: 2,
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "var(--lightgrey)",
                        borderRadius: 4,
                    },
                    backgroundColor: "transparent",
                }}
            >
                {courses.length > 0 ? courses.map((course, idx) => (
                    <CourseCard
                        key={course.id || idx}
                        course={course}
                        index={idx}
                        width={320}
                    />
                )) : <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", minHeight: 150, backgroundColor: "var(--surface)", borderRadius: 1, boxShadow: 1, p: 3 }}>

                    <Typography variant="h6" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CollectionsBookmarkIcon color="text.secondary" fontSize={isMobile ? "medium" : "medium"} />
                    </Typography>
                    <Typography variant={isMobile ? "h7" : "h7"} color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 1 }}>
                        No courses have been assigned yet.
                    </Typography>
                </Box>}
            </Box>
        </Box>
    );
}

/* ================== MAIN EXPORT ================== */

export default function CourseWidget({ title }) {
    // use enrollment data for current user instead of global course lists
    const { enrollmentCoursesByUser, loading: enrollmentLoading } = useEnrollment();
    const { user } = useAuth();

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

    // if (enrollmentLoading) {
    //     return (
    //         <Box
    //             sx={{
    //                 minHeight: 200,
    //                 display: "flex",
    //                 justifyContent: "center",
    //                 alignItems: "center",
    //             }}
    //         >
    //             <CircularProgress />
    //         </Box>
    //     );
    // }

    return (
        <Box sx={{ width: "100%" }}>

            {title == "Your Learning" && <Box sx={{ mt: 1 }}><CourseCarousel title="Your Learning" courses={courses || []} /></Box>}
            {title == "Available Courses" && <Box sx={{ mt: 1 }}>
                <CourseGrid title={title} courses={courses || []} />
            </Box>}

        </Box>
    );
}
