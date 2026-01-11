// ==============================
//  CourseView.jsx (Refactored)
// ==============================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState
} from "react";

import {
    Box,
    Stack,
    Paper,
    Button,
    Typography,
    useMediaQuery,
    Dialog,
    DialogContent,
    Alert,
} from "@mui/material";

import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchCourseDeatils } from "../../../redux/slices/coursesSlice";
import { useAuth } from "../../../hooks/useAuth";
import useCourseCategory from "../../../hooks/useCourseCategory";

// === IMPORT NEW COMPONENTS ===
import CourseLayoutDrawer from "../../../components/course/CourseLayoutDrawer";
import { errorValidation, hasPermission } from "../../../utils/resolver.utils";
import { useAdmin } from "../../../hooks/useAdmin";
import useEnrollment from "../../../hooks/useEnrollment";
import { set } from "react-hook-form";
import { httpClient } from "../../../apiClient/httpClient";

// constants
const LOCAL_PROGRESS_KEY = "lms_progress_v1";
const LOCAL_ANALYTICS_KEY = "lms_analytics_v1";
const LOCAL_UI_KEY = "lms_ui_v1";
const HEADER_HEIGHT = 185;

const percent = Math.round((400 / 99) * 100);

const CourseView = () => {
    const isMobile = useMediaQuery("(max-width:900px)");
    const isSmall = useMediaQuery("(max-width:600px)");
    const dispatch = useDispatch();
    const { id } = useParams();
    const { user } = useAuth();
    const { getCourseById, courseDetails, updateLessonProgress } = useCourseCategory();
    const { permissions } = useAdmin();

    // Refs
    const hasFetched = useRef(false);
    const lessonStartedRef = useRef(false);
    const playerCardRef = useRef(null);
    const curriculumRef = useRef(null);
    const miniPlayerTimerRef = useRef(null);
    const lastSaveRef = useRef(0);
    const lastAnalyticsRef = useRef(0);
    const userIdRef = useRef(null);
    const courseIdRef = useRef(null);
    const curriculumLenRef = useRef(0);
    const totalRef = useRef(0);
    const completedRef = useRef(0);

    // States
    const [curriculum, setCurriculum] = useState([]);
    const [courseProgress, setCourseProgress] = useState([]);
    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [selectedLesson, setSelectedLesson] = useState(null);
    const [selectedLessonProgress, setSelectedLessonProgress] = useState({ progress_percent: 0, is_completed: false });
    const [signedUrl, setSignedUrl] = useState(null);
    const [topicName, setTopicName] = useState("");

    const [expandedPanels, setExpandedPanels] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState("");

    const [value, setValue] = useState(0);
    const [darkMode, setDarkMode] = useState(false);
    const [enrolledCourse, setEnrolledCourse] = useState(false);
    const [courseDetail, setCourseDetail] = useState({});

    const [autoplayOverlay, setAutoplayOverlay] = useState({ show: false, seconds: 5 });
    const [autoplayCountdown, setAutoplayCountdown] = useState(5);

    const [isFav, setIsFav] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();
    const [urlLessonNotFound, setUrlLessonNotFound] = useState(false);

    const storageKey = `favorite_${courseDetail.id}`;
    // ================================================
    // Load Favorite
    // ================================================
    useEffect(() => {
        const saved = localStorage.getItem(storageKey);
        if (saved === "true") setIsFav(true);
    }, [storageKey]);

    const toggleFavorite = () => {
        const s = !isFav;
        setIsFav(s);
        (async () => {
            try {
                if (courseDetail && courseDetail.id) {
                    await httpClient.updateCourseFavourite({ user_id: user?.id, course_id: courseDetail.id, is_favorite: s });
                }
            } catch (e) {
                setIsFav(!s);
            }
        })();
    };

    // ================================================
    // Load Progress + Analytics from LocalStorage
    // ================================================
    const [localProgress, setLocalProgress] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY)) || {};
        } catch {
            return {};
        }
    });

    const [analytics, setAnalytics] = useState(() => {
        try {
            return (
                JSON.parse(localStorage.getItem(LOCAL_ANALYTICS_KEY)) || {
                    totalWatchSec: 0,
                    lessonsCompleted: 0,
                    lastWatchedLessonId: null,
                }
            );
        } catch {
            return {
                totalWatchSec: 0,
                lessonsCompleted: 0,
                lastWatchedLessonId: null,
            };
        }
    });

    const persistProgress = (fn) => {
        setLocalProgress((prev) => {
            const updated = fn(prev);
            localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const persistAnalytics = (fn) => {
        setAnalytics((prev) => {
            const updated = fn(prev);
            localStorage.setItem(LOCAL_ANALYTICS_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const persistUI = (obj) => {
        try {
            const prev = JSON.parse(localStorage.getItem(LOCAL_UI_KEY)) || {};
            localStorage.setItem(LOCAL_UI_KEY, JSON.stringify({ ...prev, ...obj }));
        } catch { }
    };

    // ================================================
    // Load Course
    // ================================================
    const { fetchEnrollCoursesByUser, enrollmentCoursesByUser } = useEnrollment();

    useEffect(() => {
        if (user && enrollmentCoursesByUser) {
            fetchEnrollCoursesByUser(user.id);
        }
    }, [user, fetchEnrollCoursesByUser]);

    useEffect(() => {
        const courseId = parseInt(id);
        if (!courseId) return;

        if (enrollmentCoursesByUser && enrollmentCoursesByUser[user.id]?.length > 0) {
            setEnrolledCourse(enrollmentCoursesByUser[user.id].find((c) => c.course_id === courseId));
        }
        if (hasPermission(permissions, "course.manage") || enrolledCourse) {
            setEnrolledCourse(true);
            // Use hook helper to get course
            const found = getCourseById(courseId);

            if (found) {
                setCourseDetail({
                    id: found.courseId || found.id,
                    title: found.courseTitle || found.title || "",
                    description: found.courseDescription || found.description || "",
                    image_url: found.courseImageUrl,
                    total_lessons: found.courseTotalLessons,
                    total_topics: found.courseTotalTopics
                });

                const topics = found.topics || [];
                setCourseProgress(found.courseProgress || {});
                setIsFav(found.courseProgress?.is_favorite || false);
                setCurriculum(topics);
                setCompleted((topics || []).reduce((acc, topic) => {
                    const lessons = topic?.lessons || [];
                    return acc + lessons.filter((l) => l.is_completed).length;
                }, 0));
                setTotal((topics || []).reduce((acc, topic) => {
                    const lessons = topic?.lessons || [];
                    return acc + lessons.length;
                }, 0));
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
        }
    }, [id, courseDetails, dispatch, getCourseById, enrollmentCoursesByUser]);

    // Sync `lid` query param -> selected lesson after curriculum is loaded
    useEffect(() => {
        if (!curriculum || curriculum.length === 0) return;

        const params = new URLSearchParams(location.search || "");
        const lidStr = params.get("lid");
        if (!lidStr) {
            setUrlLessonNotFound(false);
            if (!selectedLesson) {
                const firstTopic = curriculum[0];
                const firstLesson = firstTopic?.lessons?.[0] || null;
                if (firstLesson) {
                    openLesson(firstLesson, firstTopic.id, firstTopic.title);
                    // update URL to include default lid
                    const p = new URLSearchParams(location.search || "");
                    p.set("lid", String(firstLesson.id));
                    navigate(`${location.pathname}?${p.toString()}`, { replace: true });
                }
            }
            return;
        }

        const lid = Number(lidStr);
        if (!lid || Number.isNaN(lid)) {
            setUrlLessonNotFound(true);
            return;
        }

        const pos = locateLesson(lid);
        if (pos) {
            const lesson = lessonAt(pos.topicIndex, pos.lessonIndex);
            if (lesson) {
                openLesson(lesson, curriculum[pos.topicIndex].id, curriculum[pos.topicIndex].title);
                setUrlLessonNotFound(false);
            } else {
                setUrlLessonNotFound(true);
            }
        } else {
            setUrlLessonNotFound(true);
        }
    }, [location.search, curriculum]);

    // Update URL `lid` when selectedLesson changes
    useEffect(() => {
        if (!selectedLesson) return;

        const params = new URLSearchParams(location.search || "");
        const current = params.get("lid");
        if (String(current) !== String(selectedLesson.id)) {
            params.set("lid", String(selectedLesson.id));
            const search = params.toString();
            navigate(`${location.pathname}${search ? `?${search}` : ""}`, { replace: true });
        }
    }, [selectedLesson?.id, location.pathname, navigate]);

    // helper
    const parseDurationToSeconds = (str) => {
        if (!str) return 0;
        const p = str.split(":").map(Number);
        if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
        if (p.length === 2) return p[0] * 60 + p[1];
        return p[0];
    };

    const locateLesson = useCallback(
        (lessonId) => {
            if (!lessonId || !curriculum) return null;
            for (let t = 0; t < curriculum.length; t++) {
                const lessons = curriculum[t]?.lessons || [];
                for (let l = 0; l < lessons.length; l++) {
                    if (lessons[l]?.id === lessonId) {
                        return { topicIndex: t, lessonIndex: l };
                    }
                }
            }
            return null;
        },
        [curriculum]
    );

    const lessonAt = (topicIndex, lessonIndex) => {
        if (!curriculum || topicIndex < 0 || topicIndex >= curriculum.length) return null;
        return curriculum[topicIndex]?.lessons?.[lessonIndex] || null;
    };

    // ================================================
    // OPEN LESSON
    // ================================================
    const openLesson = (lesson, topicId, topicTitle) => {
        setSelectedLesson(lesson);
        setTopicName(topicTitle);
        setExpandedPanels((prev) => new Set(prev).add(topicId));
        setSignedUrl(lesson.type === "Video" ? lesson.video_url : null);

        persistAnalytics((a) => ({
            ...a,
            lastWatchedLessonId: lesson.id,
        }));

        setTimeout(() => {
            if (!playerCardRef.current) return;
            const rect = playerCardRef.current.getBoundingClientRect();
            const top = rect.top + window.scrollY - HEADER_HEIGHT - 12;
            window.scrollTo({ top, behavior: "smooth" });
        }, 150);
    };

    // ================================================
    // NEXT / PREVIOUS LOGIC
    // ================================================
    const goToNext = useCallback(() => {
        if (!selectedLesson || !curriculum || curriculum.length === 0) return;

        const pos = locateLesson(selectedLesson.id);
        if (!pos) return;

        const { topicIndex, lessonIndex } = pos;
        const currentTopic = curriculum[topicIndex];

        if (!currentTopic) return;

        const lessons = currentTopic.lessons || [];
        if (lessonIndex + 1 < lessons.length) {
            const nextLesson = lessonAt(topicIndex, lessonIndex + 1);
            if (nextLesson) {
                openLesson(nextLesson, currentTopic.id, currentTopic.title);
            }
            return;
        }

        if (topicIndex + 1 < curriculum.length) {
            const nextTopic = curriculum[topicIndex + 1];
            const nextLesson = nextTopic?.lessons?.[0];
            if (nextTopic && nextLesson) {
                openLesson(nextLesson, nextTopic.id, nextTopic.title);
            }
        }
    }, [curriculum, selectedLesson, locateLesson]);

    const goToPrev = useCallback(() => {
        if (!selectedLesson || !curriculum || curriculum.length === 0) return;

        const pos = locateLesson(selectedLesson.id);
        if (!pos) return;

        const { topicIndex, lessonIndex } = pos;
        const currentTopic = curriculum[topicIndex];

        if (!currentTopic) return;

        if (lessonIndex - 1 >= 0) {
            const prevLesson = lessonAt(topicIndex, lessonIndex - 1);
            if (prevLesson) {
                openLesson(prevLesson, currentTopic.id, currentTopic.title);
            }
            return;
        }

        if (topicIndex - 1 >= 0) {
            const prevTopic = curriculum[topicIndex - 1];
            const lessons = prevTopic?.lessons || [];
            const prevLesson = lessons[lessons.length - 1];
            if (prevTopic && prevLesson) {
                openLesson(prevLesson, prevTopic.id, prevTopic.title);
            }
        }
    }, [curriculum, selectedLesson, locateLesson]);

    const canGoNext = () => {
        if (!selectedLesson || !curriculum || curriculum.length === 0) return false;

        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return false;

        const { topicIndex, lessonIndex } = pos;
        const currentTopic = curriculum[topicIndex];

        if (!currentTopic) return false;

        const lessons = currentTopic.lessons || [];
        if (lessonIndex + 1 < lessons.length) return true;
        return topicIndex + 1 < curriculum.length;
    };

    const canGoPrev = () => {
        if (!selectedLesson || !curriculum || curriculum.length === 0) return false;

        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return false;

        const { topicIndex, lessonIndex } = pos;

        if (lessonIndex - 1 >= 0) return true;
        return topicIndex - 1 >= 0;
    };

    const getNextLessonTitle = () => {
        if (!selectedLesson || !curriculum || curriculum.length === 0) return "";

        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return "";

        const { topicIndex, lessonIndex } = pos;
        const currentTopic = curriculum[topicIndex];

        if (!currentTopic) return "";

        const lessons = currentTopic.lessons || [];
        if (lessonIndex + 1 < lessons.length)
            return lessons[lessonIndex + 1]?.title || "";

        if (topicIndex + 1 < curriculum.length) {
            const nextTopicLessons = curriculum[topicIndex + 1]?.lessons || [];
            return nextTopicLessons[0]?.title || "";
        }

        return "";
    };

    const getPrevLessonTitle = () => {
        if (!selectedLesson || !curriculum || curriculum.length === 0) return "";

        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return "";

        const { topicIndex, lessonIndex } = pos;
        const currentTopic = curriculum[topicIndex];

        if (!currentTopic) return "";

        const lessons = currentTopic.lessons || [];
        if (lessonIndex - 1 >= 0)
            return lessons[lessonIndex - 1]?.title || "";

        if (topicIndex - 1 >= 0) {
            const prevTopic = curriculum[topicIndex - 1];
            const prevTopicLessons = prevTopic?.lessons || [];
            return prevTopicLessons[prevTopicLessons.length - 1]?.title || "";
        }

        return "";
    };

    // ================================================
    // SAVE WATCH PROGRESS (improved onTime)
    // ================================================
    useEffect(() => {
        if (!playerCardRef.current) return;

        const video = playerCardRef.current.querySelector("video");
        if (!video) return;

        // reset tracking refs for this lesson
        lessonStartedRef.current = true;
        lastSaveRef.current = 0;
        lastAnalyticsRef.current = Math.floor(video.currentTime || 0);

        // keep stable refs updated for the effect to avoid re-subscribing
        userIdRef.current = user?.id || null;
        courseIdRef.current = courseDetail?.id || null;
        curriculumLenRef.current = curriculum.length || 0;
        totalRef.current = total || 0;
        completedRef.current = completed || 0;

        const pos = selectedLesson ? locateLesson(selectedLesson.id) : null;
        const topicId = pos ? (curriculum[pos.topicIndex]?.id || 0) : 0;

        const safeUpdateProgress = async (watched_seconds, total_seconds) => {
            try {
                const uid = userIdRef.current;
                const cid = courseIdRef.current;
                if (!uid || !cid) return;
                await updateLessonProgress({
                    user_id: uid,
                    course_id: cid,
                    topic_id: topicId,
                    lesson_id: selectedLesson.id,
                    watched_seconds,
                    total_seconds,
                    total_topics: curriculumLenRef.current,
                    total_lessons: totalRef.current,
                    completed_lessons: completedRef.current,
                });
            } catch (e) { /* ignore errors for now */ }
        };

        const onTime = () => {
            if (!selectedLesson) return;

            const current = Math.floor(video.currentTime || 0);
            const duration = Math.floor(video.duration || 0) || 0;

            const prevWatched = Number(selectedLesson?.watched_seconds || 0);

            // Send an immediate save once when playback moves beyond previously saved position
            if (lessonStartedRef.current && current > prevWatched && !selectedLesson?.is_completed) {
                lessonStartedRef.current = false;
                lastSaveRef.current = current;
                void safeUpdateProgress(current, duration);
            }

            // Periodic server save every 60s of progress (only when progress advanced)
            else if (current - lastSaveRef.current >= 60 && current > prevWatched && !selectedLesson?.is_completed) {
                lastSaveRef.current = current;
                void safeUpdateProgress(current, duration);
            }

            // Analytics: increment by delta since last analytics update (more accurate than constant +5)
            const delta = current - (lastAnalyticsRef.current || 0);
            if (delta > 0) {
                persistAnalytics((prev) => ({ ...prev, totalWatchSec: (prev.totalWatchSec || 0) + delta }));
                lastAnalyticsRef.current = current;
            }

            // Update local progress and mark completion when >=90%
            if (duration > 0 && current / duration >= 0.9) {
                persistProgress((prev) => {
                    const updated = { ...prev };
                    const p = updated[selectedLesson.id] || { watchedSeconds: 0, completed: false, lastPosition: 0 };
                    if (!p.completed) {
                        p.completed = true;
                        p.watchedSeconds = duration;
                        p.lastPosition = duration;
                        persistAnalytics((a) => ({ ...a, lessonsCompleted: (a.lessonsCompleted || 0) + 1 }));
                    }
                    updated[selectedLesson.id] = p;
                    return updated;
                });
            } else {
                persistProgress((prev) => {
                    const updated = { ...prev };
                    const p = updated[selectedLesson.id] || { watchedSeconds: 0, completed: false, lastPosition: 0 };
                    p.watchedSeconds = Math.max(p.watchedSeconds || 0, current);
                    p.lastPosition = current;
                    updated[selectedLesson.id] = p;
                    return updated;
                });
            }
        };

        const onEnded = () => {
            // setAutoplayOverlay({ show: true, seconds: 5 });
            setAutoplayCountdown(5);
            if (!selectedLesson) return;
            if (selectedLesson?.is_completed === false) {
                const current = Math.floor(video.currentTime || 0);
                const duration = Math.floor(video.duration || 0) || 0;
                void safeUpdateProgress(current, duration);
            }
        };

        video.addEventListener("timeupdate", onTime);
        video.addEventListener("ended", onEnded);

        return () => {
            video.removeEventListener("timeupdate", onTime);
            video.removeEventListener("ended", onEnded);
        };
        // depend only on lesson id and the updater to avoid frequent re-subscribes
    }, [selectedLesson?.id, updateLessonProgress]);

    // ================================================
    // AUTOPLAY Countdown
    // ================================================
    useEffect(() => {
        if (!autoplayOverlay.show) return;

        clearInterval(miniPlayerTimerRef.current);

        miniPlayerTimerRef.current = setInterval(() => {
            setAutoplayCountdown((s) => {
                if (s <= 1) {
                    clearInterval(miniPlayerTimerRef.current);
                    setAutoplayOverlay({ show: false, seconds: 0 });
                    // goToNext();
                    return 0;
                }
                return s - 1;
            });
        }, 1000);

        return () => clearInterval(miniPlayerTimerRef.current);
    }, [autoplayOverlay.show]);

    // ================================================
    // SEARCH FILTER
    // ================================================
    const filteredCurriculum = useMemo(() => {
        if (!searchQuery) return curriculum;

        const q = searchQuery.toLowerCase();

        return curriculum
            .map((topic) => {
                const matchedLessons = topic.lessons.filter(
                    (l) =>
                        l.title.toLowerCase().includes(q) ||
                        (l.description || "").toLowerCase().includes(q)
                );

                if (topic.title.toLowerCase().includes(q) || matchedLessons.length)
                    return { ...topic, lessons: matchedLessons };

                return null;
            })
            .filter(Boolean);
    }, [curriculum, searchQuery]);

    // ================================================
    // TAB HANDLER
    // ================================================
    const handleChange = (_, v) => setValue(v);

    // ================================================
    // MAIN RENDER
    // ================================================
    return (
        <Box sx={{
            background: darkMode ? "var(--textPrimary)" : "var(--bg)", width: "100%",
            maxWidth: "100%",
            minHeight: "100vh",
            p: 0,
            m: 0,
        }}>

            {enrolledCourse ? (
                <>
                    <CourseLayoutDrawer
                        selectedLesson={selectedLesson}
                        courseProgress={courseProgress}
                        signedUrl={signedUrl}
                        // loadingSignedUrl={loadingSignedUrl}
                        user={user}
                        urlLessonNotFound={urlLessonNotFound}
                        goToPrev={goToPrev}
                        goToNext={goToNext}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        getPrevLessonTitle={getPrevLessonTitle}
                        getNextLessonTitle={getNextLessonTitle}
                        playerCardRef={playerCardRef}
                        isSmall={isSmall}
                        darkMode={darkMode}
                        value={value}
                        handleChange={handleChange}
                        courseDetail={courseDetail}
                        percent={percent}
                        completed={completed}
                        total={total}
                        isFav={isFav}
                        toggleFavorite={toggleFavorite}
                        curriculumProps={{
                            filteredCurriculum,
                            expandedPanels,
                            setExpandedPanels,
                            selectedLesson,
                            selectedLessonProgress,
                            openLesson,
                            localProgress,
                            parseDurationToSeconds,
                            searchQuery,
                            setSearchQuery,
                            darkMode,
                            curriculumRef,
                            HEADER_HEIGHT,
                        }}
                    />
                </>
            ) :
                <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240, px: 2 }}>
                    <Alert severity="warning" variant="outlined" sx={{ width: "100%", maxWidth: 700, textAlign: "center" }}>
                        You are not enrolled in this course.
                    </Alert>
                </Box>}

            {/* AUTOPLAY OVERLAY */}
            {/* {autoplayOverlay.show && (
                <Dialog
                    open={autoplayOverlay.show}
                    onClose={() => {
                        setAutoplayOverlay({ show: false, seconds: 0 });
                        setAutoplayCountdown(0);
                    }}
                    maxWidth="xs"
                    fullWidth
                    BackdropProps={{
                        sx: {
                            backgroundColor: "rgba(0,0,0,0.6)", // dark backdrop
                        },
                    }}
                    PaperProps={{
                        sx: {
                            borderRadius: 3,
                            p: 2,
                        },
                    }}
                >
                    <DialogContent>
                        <Stack spacing={2}>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>
                                    Up Next
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Next lesson will start in {autoplayCountdown}s
                                </Typography>
                            </Box>

                            <Stack direction="row" spacing={1} justifyContent="flex-end">
                                <Button
                                    variant="outlined"
                                    onClick={() => {
                                        setAutoplayOverlay({ show: false, seconds: 0 });
                                        setAutoplayCountdown(0);
                                    }}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    variant="contained"
                                    onClick={() => {
                                        setAutoplayOverlay({ show: false, seconds: 0 });
                                        setAutoplayCountdown(0);
                                        goToNext();
                                    }}
                                >
                                    Skip Now
                                </Button>
                            </Stack>
                        </Stack>
                    </DialogContent>
                </Dialog>
            )} */}

        </Box>
    );
};

export default CourseView;
