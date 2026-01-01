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
    useTheme
} from "@mui/material";
import { keyframes } from "@mui/system";

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

const ACCENTS = [
    "#83acffff", // blue
    "#fe808dff", // rose
    "#a27affff", // violet
    "#face75ff", // amber
    "#7dffc5ff", // green
];

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

function CourseCard({ course, index, width = 300 }) {
    const accent = ACCENTS[index % ACCENTS.length];
    const navigate = useNavigate();

    const lessons = course.lessons || 0;

    const minutes = course.duration || "00:00:00";
    const progress = course.progress ?? 0;

    return (
        <Box
            sx={{
                minWidth: width,
                maxWidth: width,
                height: 230,
                borderRadius: 1,
                overflow: "hidden",
                backgroundColor: "#fff",
                boxShadow: 1,
                // boxShadow: "0 10px 20px rgba(0, 0, 0, 0.12)",
                transition: "transform .35s ease, box-shadow .35s ease",
                "&:hover": {
                    transform: "scale(1.02)",
                    boxShadow: 2
                }
            }}
        >
            {/* HEADER */}
            <Box sx={{ p: 2.5, position: "relative" }}>
                {/* ICON BADGE */}
                <Box
                    sx={{
                        position: "absolute",
                        top: 16,
                        right: 16,
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        backgroundColor: accent,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        fontWeight: 700,
                    }}
                >
                    <StyleIcon />
                </Box>

                <Typography
                    fontWeight={700}
                    fontSize={16}
                    mb={1}
                    sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 1,
                        paddingRight: 5,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.title || "Untitled Course"}
                </Typography>

                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        lineHeight: 1.5,
                        paddingRight: 3,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                    }}
                >
                    {course.description || "Learn and master this course with guided lessons and hands-on examples."}
                </Typography>
            </Box>

            {/* META */}
            <Box
                sx={{
                    px: 2.5,
                    mb: 1,
                    display: "flex",
                    gap: 2,
                    color: "text.secondary",
                    fontSize: 13,
                }}
            >
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <MenuBookIcon fontSize="small" /> {lessons}
                </Box>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <AccessTimeIcon fontSize="small" /> {minutes} min
                </Box>
            </Box>

            {/* PROGRESS (OPTIONAL) */}
            {progress !== null && (
                <Box sx={{ px: 2.5 }}>
                    <LinearProgress
                        variant="determinate"
                        value={progress}
                        sx={{
                            height: 6,
                            borderRadius: 3,
                            backgroundColor: "#eee",
                            "& .MuiLinearProgress-bar": {
                                backgroundColor: accent,
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

            {/* FOOTER */}
            <Box
                sx={{
                    px: 2.5,
                    py: 1,
                    display: "flex",
                    justifyContent: "flex-end",
                }}
            >
                <Button
                    variant="contained"
                    endIcon={<PlayArrowIcon />}
                    sx={{
                        backgroundColor: accent,
                        borderRadius: 1,
                        textTransform: "none",
                        px: 3,
                        "&:hover": {
                            backgroundColor: accent,
                        },
                    }}
                    onClick={() => navigate("/course/view/" + course.id)}
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
                <Typography variant={isMobile ? "h5" : "h5"} fontWeight={500}>
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
                    gap: 3,
                    p: 3,
                    pt: 2,
                    pb: 2,
                    overflowX: "auto",
                    scrollBehavior: "smooth",
                    "&::-webkit-scrollbar": { height: 6 },
                    "&::-webkit-scrollbar-thumb": {
                        backgroundColor: "#ccc",
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
                )) : <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", minHeight: 150 }}>

                    <Typography variant="h6" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <CollectionsBookmarkIcon color="text.secondary" fontSize={isMobile ? "medium" : "large"} />
                    </Typography>
                    <Typography variant={isMobile ? "h7" : "h6"} color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mt: 1 }}>
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

            {title == "My Courses" && <Box sx={{ mt: 1 }}><CourseCarousel title="My Courses" courses={courses || []} /></Box>}
            {title == "Available Courses" && <Box sx={{ mt: 1 }}>
                <CourseGrid title={title} courses={courses || []} />
            </Box>}

        </Box>
    );
}
