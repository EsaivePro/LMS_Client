import React from "react";
import {
    Box,
    Typography,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Stack,
    TextField,
    InputAdornment,
    Divider,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchIcon from "@mui/icons-material/Search";
import PlayCircleIcon from "@mui/icons-material/PlayCircleFilled";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { secondsToTime } from "../../../utils/resolver.utils";

const CurriculumView = ({
    filteredCurriculum,
    expandedPanels,
    setExpandedPanels,
    selectedLesson,
    openLesson,
    localProgress,
    parseDurationToSeconds,
    searchQuery,
    setSearchQuery,
}) => {

    const selectedLessonRef = React.useRef(null);

    // -----------------------------------------------------------
    // AUTO-SCROLL INSIDE THE RIGHT MUI DRAWER (NOT the Box!)
    // -----------------------------------------------------------
    React.useEffect(() => {
        if (selectedLessonRef.current) {
            // Select ONLY the RIGHT drawer panel
            const drawerPaper = document.querySelector(
                '.MuiDrawer-paper[anchor="right"]'
            );

            if (!drawerPaper) return;

            const drawerTop = drawerPaper.getBoundingClientRect().top;
            const lessonTop = selectedLessonRef.current.getBoundingClientRect().top;

            const offsetInsideDrawer = lessonTop - drawerTop;

            const navOffset = 110; // adjust to match your CourseHeader height

            drawerPaper.scrollTo({
                top: drawerPaper.scrollTop + offsetInsideDrawer - navOffset,
                behavior: "smooth",
            });
        }
    }, [selectedLesson]);

    return (
        <Box
            sx={{
                height: "100%",
                bgcolor: "#fff",
                p: 1,
            }}
        >
            {/* SEARCH BAR */}
            <Box sx={{ mb: 1.5 }}>
                <TextField
                    size="small"
                    fullWidth
                    placeholder="Search lectures"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon fontSize="small" />
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>

            {/* ===========================================
                CURRICULUM SECTIONS
            ============================================ */}
            {filteredCurriculum.map((topic, index) => {
                const isOpen = expandedPanels.has(topic.id);

                return (
                    <Accordion
                        key={topic.id}
                        expanded={isOpen}
                        onChange={() =>
                            setExpandedPanels((prev) => {
                                const next = new Set(prev);
                                next.has(topic.id) ? next.delete(topic.id) : next.add(topic.id);
                                return next;
                            })
                        }
                        elevation={0}
                        sx={{
                            bgcolor: "transparent",
                            mb: 1,
                        }}
                    >
                        {/* ---------- SECTION HEADER ---------- */}
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ backgroundColor: "#fbfbfb" }}
                        >
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    fontSize: "16px",
                                    color: "#333",
                                }}
                            >
                                Section {index + 1}: {topic.title}
                            </Typography>
                        </AccordionSummary>

                        {/* ---------- LESSON LIST ---------- */}
                        <AccordionDetails sx={{ p: 0 }}>
                            {topic.lessons.map((lesson, i) => {
                                const isSelected = selectedLesson?.id === lesson.id;
                                const duration = secondsToTime(lesson.duration || 0);
                                const percent = lesson.progress_percent ?? lesson.progressPercent ?? 0;
                                const isCompleted = lesson.is_completed ?? lesson.isCompleted ?? false;

                                return (
                                    <React.Fragment key={lesson.id}>
                                        <Box
                                            ref={isSelected ? selectedLessonRef : null}
                                            onClick={() =>
                                                openLesson(lesson, topic.id, topic.title)
                                            }
                                            sx={{
                                                py: 1.3,
                                                px: 1,
                                                cursor: "pointer",
                                                borderRadius: 1,
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                transition: "0.2s",
                                                bgcolor: isSelected
                                                    ? "rgba(0,0,0,0.04)"
                                                    : "transparent",
                                                border: isSelected
                                                    ? "1px solid var(--primaryColor)"
                                                    : "1px solid transparent",
                                                "&:hover": {
                                                    bgcolor: "#f5f5f5",
                                                },
                                            }}
                                        >
                                            {/* LEFT: ICON + TITLE + DURATION */}
                                            <Stack direction="row" spacing={1.4} alignItems="center">
                                                {lesson.type === "Video" ? (
                                                    <PlayCircleIcon
                                                        sx={{
                                                            fontSize: 22,
                                                            color: "var(--primaryColor)",
                                                        }}
                                                    />
                                                ) : (
                                                    <PictureAsPdfIcon
                                                        sx={{
                                                            fontSize: 22,
                                                            color: "#d32f2f",
                                                        }}
                                                    />
                                                )}

                                                <Box>
                                                    <Typography
                                                        sx={{
                                                            fontSize: "15px",
                                                            fontWeight: isSelected ? 700 : 500,
                                                            color: "#222",
                                                        }}
                                                    >
                                                        {lesson.title}
                                                    </Typography>

                                                    <Stack direction="row" spacing={0.7} alignItems="center">
                                                        <AccessTimeIcon
                                                            sx={{
                                                                fontSize: 14,
                                                                color: "#666",
                                                            }}
                                                        />
                                                        <Typography
                                                            sx={{
                                                                fontSize: "12.5px",
                                                                color: "#666",
                                                            }}
                                                        >
                                                            {duration}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>

                                            {/* RIGHT: COMPLETION / PERCENT */}
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography sx={{ fontSize: 13, color: '#666' }}>{percent}%</Typography>
                                                {isCompleted && (
                                                    <CheckCircleIcon
                                                        sx={{
                                                            fontSize: 22,
                                                            color: "var(--primaryColor)",
                                                        }}
                                                    />
                                                )}
                                            </Box>
                                        </Box>

                                        {/* Divider Between Lessons */}
                                        {i < topic.lessons.length - 1 && (
                                            <Divider sx={{ my: 0.7 }} />
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </AccordionDetails>
                    </Accordion>
                );
            })}
        </Box>
    );
};

export default CurriculumView;