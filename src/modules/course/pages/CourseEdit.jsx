import React, { useState, useEffect, useRef, useCallback } from "react";
import {
    Box,
    Typography,
    Card,
    Stack,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    useMediaQuery,
    IconButton,
    Button,
    Chip,
    Tooltip,
    Dialog,
    DialogContent,
    Slider,
    Divider
} from "@mui/material";
import VisibilityIcon from '@mui/icons-material/Visibility';
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DescriptionIcon from "@mui/icons-material/Description";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import CloseIcon from "@mui/icons-material/Close";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import FileUploadOffIcon from '@mui/icons-material/FileUploadOff';
// Components
import TopicHandler from "../../../components/course/topic/TopicHandler";
import LessonHandler from "../../../components/course/lesson/LessonHandler";

// Backend
import { useNavigate, useParams } from "react-router-dom";
import useCourseCategory from "../../../hooks/useCourseCategory";
import { useDispatch } from "react-redux";
import { fetchCourseDeatils } from "../../../redux/slices/coursesSlice";
import { useAuth } from "../../../hooks/useAuth";
import { setContainerTitle } from "../../../redux/slices/uiSlice";
import { errorValidation } from "../../../utils/resolver.utils";
// CloudFront Base URL
const CLOUDFRONT = "https://d1fsxe4g48oy4v.cloudfront.net/";

// -------------------------------------------------------------------

const CourseEdit = () => {
    const isMobile = useMediaQuery("(max-width: 900px)");
    const dispatch = useDispatch();
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const { courseDetails, getCourseById, setEditingCourse } = useCourseCategory();
    const userid = user?.id;
    const hasFetched = useRef(false);

    // Topic dialog states
    const [topicAction, setTopicAction] = useState("");
    const [topicDialog, setTopicDialog] = useState(false);
    const [updateTopicId, setUpdateTopicId] = useState(null);

    // Lesson dialog states
    const [lessonDialog, setLessonDialog] = useState(false);
    const [lessonAction, setLessonAction] = useState("");
    const [selectedLessonId, setSelectedLessonId] = useState(null);
    const [selectedTopicIdForLesson, setSelectedTopicIdForLesson] = useState(null);

    // Curriculum state
    const [curriculum, setCurriculum] = useState([]);
    const [courseDetail, setCourseDetail] = useState({});

    // -----------------------------------------------------
    // ADVANCED PREVIEW UI STATES
    // -----------------------------------------------------

    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewLesson, setPreviewLesson] = useState(null);

    // PDF Controls
    const [pdfZoom, setPdfZoom] = useState(1.0);

    // Video Controls
    const [videoSpeed, setVideoSpeed] = useState(1.0);

    const videoRef = useRef(null);

    const handleSpeedChange = (speed) => {
        setVideoSpeed(speed);
        if (videoRef.current) videoRef.current.playbackRate = speed;
    };

    // -----------------------------------------------------
    // LOAD DATA
    // -----------------------------------------------------

    useEffect(() => {
        const courseId = parseInt(id);
        if (courseId) {
            setEditingCourse(courseId);
        }
    }, [id, setEditingCourse]);

    useEffect(() => {
        dispatch(setContainerTitle(courseDetail?.title || ""));
    }, [dispatch, courseDetail]);

    useEffect(() => {
        const courseId = parseInt(id);
        if (!courseId) return;
        const found = getCourseById(courseId);

        if (found) {
            setCourseDetail({
                title: found.courseTitle || found.title,
                description: found.courseDescription || found.description,
            });
            setCurriculum(found?.topics || []);
        } else if (!hasFetched.current) {
            hasFetched.current = true;
            (async () => {
                try {
                    await dispatch(
                        fetchCourseDeatils({ course_id: courseId, user_id: user ? user.id : null })
                    ).unwrap();
                } catch (e) {
                    // optional: handle error (silent for now)
                }
            })();
        }
    }, [id, courseDetails, getCourseById, dispatch]);

    // -----------------------------------------------------
    // TOPIC ACTION HANDLERS
    // -----------------------------------------------------

    const addTopic = () => {
        setTopicDialog(true);
        setTopicAction("Create");
    };
    const deleteTopic = (topicId) => {
        setUpdateTopicId(topicId);
        setTopicDialog(true);
        setTopicAction("Delete");
    };
    const updateTopic = (topicId) => {
        setUpdateTopicId(topicId);
        setTopicDialog(true);
        setTopicAction("Update");
    };

    // -----------------------------------------------------
    // LESSON ACTION HANDLERS
    // -----------------------------------------------------

    const handleAddLesson = (topicId) => {
        setSelectedTopicIdForLesson(topicId);
        setSelectedLessonId(null);
        setLessonAction("Create");
        setLessonDialog(true);
    };

    const handleUpdateLesson = (topicId, lessonId) => {
        setSelectedLessonId(lessonId);
        setSelectedTopicIdForLesson(topicId);
        setLessonAction("Update");
        setLessonDialog(true);
    };

    const handleDeleteLesson = (topicId, lessonId) => {
        setSelectedTopicIdForLesson(topicId);
        setSelectedLessonId(lessonId);
        setLessonAction("Delete");
        setLessonDialog(true);
    };

    // -----------------------------------------------------
    // PREVIEW HANDLER
    // -----------------------------------------------------

    const handlePreview = (lesson) => {
        setPreviewLesson(lesson);
        setPreviewOpen(true);
        setPdfZoom(1.0);
        setVideoSpeed(1.0);
    };

    // -----------------------------------------------------
    // PREVIEW NAVIGATION
    // -----------------------------------------------------

    const navigateLesson = (direction) => {
        if (!previewLesson) return;

        const topic = curriculum.find((t) =>
            t.lessons.some((l) => l.id === previewLesson.id)
        );

        if (!topic) return;

        const index = topic.lessons.findIndex((l) => l.id === previewLesson.id);

        let newIndex =
            direction === "next" ? index + 1 : index - 1;

        if (newIndex < 0 || newIndex >= topic.lessons.length) return;

        setPreviewLesson(topic.lessons[newIndex]);
        setPdfZoom(1.0);
        setVideoSpeed(1.0);
    };

    // Keyboard navigation
    const handleKeyNavigation = useCallback((e) => {
        if (!previewOpen) return;

        if (e.key === "Escape") setPreviewOpen(false);
        if (e.key === "ArrowRight") navigateLesson("next");
        if (e.key === "ArrowLeft") navigateLesson("prev");

    }, [previewOpen, previewLesson]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyNavigation);
        return () => window.removeEventListener("keydown", handleKeyNavigation);
    }, [handleKeyNavigation]);

    // -----------------------------------------------------
    // MAIN UI
    // -----------------------------------------------------

    return (
        <Box sx={{ p: isMobile ? 1.5 : 3 }}>

            <Box>
                {/* Topic Dialog */}
                <TopicHandler
                    action={topicAction}
                    openDialog={topicDialog}
                    setOpenDialog={setTopicDialog}
                    selectedTopicId={updateTopicId}
                    curriculum={curriculum}
                    setCurriculum={setCurriculum}
                />

                {/* Lesson Dialog */}
                <LessonHandler
                    action={lessonAction}
                    openDialog={lessonDialog}
                    setOpenDialog={setLessonDialog}
                    selectedTopicId={selectedTopicIdForLesson}
                    selectedLessonId={selectedLessonId}
                    curriculum={curriculum}
                    setCurriculum={setCurriculum}
                />

                {/* HEADER */}
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="h5" fontWeight={500} sx={{ mb: 2 }}>
                            {courseDetail?.title}
                        </Typography>
                    </Stack>

                    <Button variant="outlined" startIcon={<VisibilityIcon />} onClick={() => navigate(`/course/view/${id}`)}>
                        View Course
                    </Button>
                </Stack>
                <Divider sx={{ my: 2 }} />
                {/* ADD TOPIC BUTTON */}
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                        mb: 2,
                        borderRadius: 1,
                        background: "var(--primary)"
                    }}
                    onClick={addTopic}
                >
                    Add Topic
                </Button>

                <Box>
                    {/* TOPIC LIST */}
                    <Card sx={{ p: 2, borderRadius: 1, background: "white" }}>
                        {curriculum.length > 0 ? curriculum.map((topic) => (
                            <Accordion
                                key={topic.id}
                                disableGutters
                                sx={{
                                    mb: 1.5,
                                    borderRadius: 1,
                                    "&:before": { display: "none" },
                                    boxShadow: "0px 3px 12px rgba(0,0,0,0.08)",
                                }}
                            >
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Stack direction="column" width="100%">
                                        <Stack direction="row" justifyContent="space-between">
                                            <Typography variant="h6" fontWeight={500}>
                                                {topic.title}
                                            </Typography>

                                            <Stack direction="row" spacing={1}>
                                                <Tooltip title="Edit Topic">
                                                    <IconButton onClick={() => updateTopic(topic.id)}>
                                                        <EditIcon color="primary" />
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Topic">
                                                    <IconButton onClick={() => deleteTopic(topic.id)}>
                                                        <DeleteIcon color="error" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>

                                        {topic.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{ mt: 0.5 }}
                                            >
                                                {topic.description}
                                            </Typography>
                                        )}
                                    </Stack>
                                </AccordionSummary>

                                <AccordionDetails>

                                    {topic.lessons?.map((lesson) => (
                                        <Card
                                            key={lesson.id}
                                            sx={{
                                                p: 2,
                                                mb: 1.5,
                                                borderRadius: 1,
                                                bgcolor: "var(--lightgrey)",
                                                border: "1px solid var(--lightgrey)"
                                            }}
                                        >
                                            <Stack direction="row" spacing={2} alignItems="center">

                                                {lesson?.type === "Video"
                                                    ? <VideoLibraryIcon color="primary" />
                                                    : <DescriptionIcon color="error" />
                                                }

                                                <Box sx={{ flex: 1 }}>
                                                    {/* TITLE + DURATION (same line, dot separator) */}
                                                    <Typography
                                                        variant="subtitle1"
                                                        fontWeight={500}
                                                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                                    >
                                                        {lesson.title}

                                                        {lesson.duration && (
                                                            <Typography
                                                                component="span"
                                                                variant="body2"
                                                                color="text.secondary"
                                                                sx={{ fontWeight: 500 }}
                                                            >
                                                                • {lesson.duration}
                                                            </Typography>
                                                        )}
                                                    </Typography>

                                                    {/* DESCRIPTION */}
                                                    {lesson.description && (
                                                        <Typography
                                                            variant="body2"
                                                            color="text.secondary"
                                                            sx={{ mt: 0.3 }}
                                                        >
                                                            {lesson.description}
                                                        </Typography>
                                                    )}
                                                </Box>

                                                <Tooltip title="Preview">
                                                    <IconButton
                                                        onClick={() => handlePreview(lesson)}
                                                        sx={{
                                                            bgcolor: "var(--lightgrey)",
                                                            "&:hover": { bgcolor: "var(--lightgrey)" },
                                                            borderRadius: 2
                                                        }}
                                                    >
                                                        {lesson?.type === "Video"
                                                            ? <PlayCircleOutlineIcon sx={{ color: "var(--primary)" }} />
                                                            : <PictureAsPdfIcon sx={{ color: "var(--danger)" }} />
                                                        }
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title={(lesson?.video_url == "" || lesson?.video_url == null) ? "Upload Content" : "Edit Lesson"}>
                                                    <IconButton
                                                        onClick={() => handleUpdateLesson(topic.id, lesson.id)}
                                                    >
                                                        {(lesson?.video_url == "" || lesson?.video_url == null) ? <FileUploadOffIcon sx={{ color: "var(--textSecondary)" }} /> : <EditIcon color="primary" />}
                                                    </IconButton>
                                                </Tooltip>

                                                <Tooltip title="Delete Lesson">
                                                    <IconButton
                                                        onClick={() => handleDeleteLesson(topic.id, lesson.id)}
                                                    >
                                                        <DeleteIcon color="error" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Card>
                                    ))}

                                    <Button
                                        fullWidth
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddLesson(topic.id)}
                                        sx={{
                                            mt: 1,
                                            bgcolor: "var(--lightgrey)",
                                            borderRadius: 1,
                                            "&:hover": { bgcolor: "var(--lightgrey)" },
                                        }}
                                    >
                                        Add Lesson
                                    </Button>

                                </AccordionDetails>
                            </Accordion>
                        )) : <Box
                            sx={{
                                height: "30vh",
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                justifyContent: "center",
                                textAlign: "center",
                                color: "text.secondary",
                                gap: 1.5
                            }}
                        >
                            <Typography
                                variant="h6"
                                sx={{ fontWeight: 600 }}
                            >
                                This course is empty
                            </Typography>

                            <Typography variant="body2">
                                No topics or lessons have been added yet.
                            </Typography>

                            <Typography variant="body2" sx={{
                                background: "var(--lightgrey)",
                                p: 2.5,
                                borderRadius: 2
                            }}>
                                Click <strong>Add Topic</strong> to start building your course.
                            </Typography>
                        </Box>}
                    </Card>
                </Box>


                {/* ---------------------------------------------------------------- */}
                {/* ADVANCED PREVIEW POPUP */}
                {/* ---------------------------------------------------------------- */}

                <Dialog
                    open={previewOpen}
                    onClose={() => setPreviewOpen(false)}
                    fullWidth
                    maxWidth="lg"
                    PaperProps={{
                        sx: { borderRadius: 1, overflow: "hidden", p: 0 }
                    }}
                >
                    {/* Header */}
                    <Box sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 2,
                        py: 1,
                        bgcolor: "var(--lightgrey)"
                    }}>
                        <Typography fontWeight={500}>
                            {previewLesson?.title}
                        </Typography>

                        <Box>
                            <Tooltip title="Previous Lesson">
                                <IconButton onClick={() => navigateLesson("prev")}>
                                    <ArrowBackIosNewIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Next Lesson">
                                <IconButton onClick={() => navigateLesson("next")}>
                                    <ArrowForwardIosIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>

                            <Tooltip title="Close">
                                <IconButton onClick={() => setPreviewOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Tooltip>
                        </Box>
                    </Box>

                    <DialogContent sx={{ p: 0, bgcolor: "black" }}>

                        {/* -------------------- VIDEO PREVIEW -------------------- */}
                        {previewLesson?.type === "Video" && (
                            <Box sx={{ position: "relative", p: 0 }}>
                                <video
                                    ref={videoRef}
                                    src={previewLesson.video_url}
                                    controls
                                    autoPlay
                                    style={{
                                        width: "100%",
                                        height: "80vh",
                                        objectFit: "contain",
                                        background: "black"
                                    }}
                                />

                                {/* Playback Speed Controls */}
                                <Box sx={{
                                    position: "absolute",
                                    right: 10,
                                    bottom: 10,
                                    background: "rgba(0,0,0,0.5)",
                                    padding: "10px",
                                    borderRadius: "8px",
                                }}>
                                    {/* {[0.5, 1.0, 1.5, 2.0].map((speed) => (
                                    <Button
                                        key={speed}
                                        size="small"
                                        variant={videoSpeed === speed ? "contained" : "outlined"}
                                        sx={{ m: 0.5 }}
                                        onClick={() => handleSpeedChange(speed)}
                                    >
                                        {speed}x
                                    </Button>
                                ))} */}
                                </Box>
                            </Box>
                        )}

                        {/* -------------------- PDF PREVIEW -------------------- */}
                        {previewLesson?.type === "PDF" && (
                            <Box sx={{ position: "relative" }}>
                                <iframe
                                    src={previewLesson.video_url}
                                    style={{
                                        width: "100%",
                                        height: "80vh",
                                        border: "none",
                                        transform: `scale(${pdfZoom})`,
                                        transformOrigin: "top center",
                                        background: "white",
                                    }}
                                />
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>
            </Box>

        </Box>
    );
};

export default CourseEdit;
