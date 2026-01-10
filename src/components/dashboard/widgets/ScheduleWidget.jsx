import React, { useRef, useState, useMemo } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    LinearProgress,
    Pagination,
    IconButton,
    CircularProgress,
    Paper,
} from "@mui/material";
import { keyframes } from "@mui/system";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import StyleIcon from '@mui/icons-material/Style';
import MenuBookIcon from "@mui/icons-material/MenuBook";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import EventNoteIcon from '@mui/icons-material/EventNote';
const ACCENTS = ["#83acffff", "#fe808dff", "#a27affff", "#face75ff", "#7dffc5ff"];

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
`;

function CourseCard({ course, index, width = 300 }) {
    const accent = ACCENTS[index % ACCENTS.length];
    const navigate = useNavigate();

    const lessons = course.lessons || 0;
    const minutes = course.minutes || "";
    const progress = course.progress ?? 0;

    return (
        <Box sx={{ minWidth: width, maxWidth: width, height: 230, borderRadius: 1, overflow: "hidden", backgroundColor: "var(--surface)", boxShadow: 1, transition: "transform .35s ease, box-shadow .35s ease", "&:hover": { transform: "scale(1.02)", boxShadow: 2 } }}>
            <Box sx={{ p: 2.5, position: "relative" }}>
                <Box sx={{ position: "absolute", top: 16, right: 16, width: 42, height: 42, borderRadius: "50%", backgroundColor: accent, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--onPrimary)", fontWeight: 700 }}>
                    <StyleIcon />
                </Box>

                <Typography fontWeight={700} fontSize={16} mb={1} sx={{ display: "-webkit-box", WebkitLineClamp: 1, paddingRight: 5, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.title || `Course ${course.id}`}</Typography>
                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5, paddingRight: 3, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{course.description || ""}</Typography>
            </Box>

            <Box sx={{ px: 2.5, mb: 1, display: "flex", gap: 2, color: "text.secondary", fontSize: 13 }}>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}><MenuBookIcon fontSize="small" /> {lessons}</Box>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}><AccessTimeIcon fontSize="small" /> {minutes} min</Box>
            </Box>

            {progress !== null && (
                <Box sx={{ px: 2.5 }}>
                    <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3, backgroundColor: "var(--lightgrey)", "& .MuiLinearProgress-bar": { backgroundColor: accent } }} />
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>{progress}% completed</Typography>
                </Box>
            )}

            <Box sx={{ px: 2.5, py: 1, display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" endIcon={<PlayArrowIcon />} sx={{ backgroundColor: accent, borderRadius: 1, textTransform: "none", px: 3, "&:hover": { backgroundColor: accent } }} onClick={() => navigate(`/course/view/${course.id}`)}>{progress ? "Resume" : "Start"}</Button>
            </Box>
        </Box>
    );
}

function CourseGrid({ title, courses }) {
    const ITEMS_PER_PAGE = 4;
    const [page, setPage] = useState(1);
    const paginated = courses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    return (
        <Box sx={{ width: "100%" }}>
            <Typography variant="h5" fontWeight={500} sx={{ mb: 3 }}>{title}</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 3 }}>{paginated.map((course, idx) => (<CourseCard key={course.id || idx} course={course} index={idx} />))}</Box>
            {courses.length > ITEMS_PER_PAGE && (<Box sx={{ mt: 3, display: "flex", justifyContent: "center" }}><Pagination count={Math.ceil(courses.length / ITEMS_PER_PAGE)} page={page} onChange={(_, v) => setPage(v)} color="primary" /></Box>)}
        </Box>
    );
}

function CourseCarousel({ title, courses }) {
    const ref = useRef();
    const scroll = (dir) => ref.current?.scrollBy({ left: dir === "left" ? -300 : 300, behavior: "smooth" });
    return (
        <Box sx={{ width: "90vw" }}>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="h5" fontWeight={500}>
                    {title}
                </Typography>
                <Box><IconButton onClick={() => scroll("left")}><ArrowBackIosNewIcon fontSize="small" /></IconButton><IconButton onClick={() => scroll("right")}><ArrowForwardIosIcon fontSize="small" /></IconButton></Box>
            </Box>
            {(!courses || courses.length === 0) ? (
                <Box sx={{ width: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", minHeight: 150 }}>

                    <Typography variant="h6" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <EventNoteIcon color="text.secondary" fontSize="large" />
                    </Typography>
                    <Typography variant="h6" color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                        No courses have been assigned yet.
                    </Typography>
                </Box>
            ) : (
                <Box ref={ref} sx={{ display: "flex", gap: 3, p: 3, pt: 2, overflowX: "auto", scrollBehavior: "smooth", "&::-webkit-scrollbar": { height: 6 }, "&::-webkit-scrollbar-thumb": { backgroundColor: "var(--lightgrey)", borderRadius: 4 }, backgroundColor: "transparent" }}>
                    {courses.map((course, idx) => (<CourseCard key={course.id || idx} course={course} index={idx} width={320} />))}
                </Box>)}
        </Box>
    );
}

export default function ScheduleWidget({ title }) {
    const { enrollmentCoursesByUser, loading } = useEnrollment();
    const { user } = useAuth();

    const scheduled = useMemo(() => {
        const rows = (user && enrollmentCoursesByUser && enrollmentCoursesByUser[user.id]) || [];
        // scheduled if enrollment_type === 'scheduled' or scheduled_start_at present
        return rows.filter((r) => r.enrollment_type === "scheduled" || r.scheduled_start_at);
    }, [enrollmentCoursesByUser, user]);

    if (loading) return (<Box sx={{ minHeight: 200, display: "flex", justifyContent: "center", alignItems: "center" }}><CircularProgress /></Box>);

    return (
        <Box>
            <Box sx={{ mt: 1 }}><CourseCarousel title="Upcomming Courses" courses={scheduled.map(s => ({ id: s.course_id, title: `Course ${s.course_id}`, description: '', lessons: s.total_lessons, minutes: '', progress: s.progress_percent }))} /></Box>

        </Box>
    );
}
