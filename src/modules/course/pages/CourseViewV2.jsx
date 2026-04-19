// ==============================
//  CourseViewV2.jsx
//  API: POST /enrollment-service/course/:id/details
//       PATCH /enrollment-service/content/progress
//       PATCH /enrollment-service/course/progress
//  Video: Vimeo — filePath = Vimeo video ID
// ==============================

import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";

import {
    Alert,
    Box,
    Button,
    Card,
    CircularProgress,
    CssBaseline,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Drawer,
    Typography,
    useMediaQuery,
} from "@mui/material";

import PlayCircleOutlinedIcon from "@mui/icons-material/PlayCircleOutlined";
import ReplayIcon from "@mui/icons-material/Replay";

import { useParams, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import { httpClient } from "../../../apiClient/httpClient";

import VimeoPlayer from "../../../components/common/video/VimeoPlayer";
import CourseHeader from "../../../components/course/view/CourseHeader";
import CourseTabView from "../../../components/course/view/CourseTabView";
import CurriculumView from "../../../components/course/view/CurriculumView";
import Footer from "../../../components/layout/Footer";

// ─── Constants ───────────────────────────────────────────────────────────────
const LOCAL_PROGRESS_KEY = "lms_progress_v2";
const LOCAL_ANALYTICS_KEY = "lms_analytics_v2";
const HEADER_HEIGHT = 185;
const DRAWER_WIDTH = 360;

// ─── Utility ─────────────────────────────────────────────────────────────────
const fmtSeconds = (s) => {
    if (!s || s <= 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = String(Math.floor(s % 60)).padStart(2, "0");
    return `${m}:${sec}`;
};

// ─── Data Normalization ───────────────────────────────────────────────────────
const normalizeContent = (content, sectionId) => ({
    id: content.contentId,
    contentId: content.contentId,
    sectionId,
    title: content.title,
    description: content.description,
    // CurriculumView expects "Video" (capital V) for the play icon
    type: content.contentType === "video" ? "Video" : "PDF",
    contentType: content.contentType,
    fileType: content.fileType,
    filePath: content.filePath,       // Vimeo video ID
    video_url: content.filePath,
    videoProvider: "vimeo",
    duration: content.duration || 0,
    // Progress from API
    progress_percent: content.progress?.progress_percent ?? 0,
    is_completed: content.progress?.is_completed ?? false,
    watched_seconds: content.progress?.watched_seconds ?? 0,
    total_seconds: content.progress?.total_seconds ?? 0,
});

const normalizeSection = (section) => ({
    id: section.sectionId,
    sectionId: section.sectionId,
    title: section.title,
    displayName: section.displayName,
    description: section.description,
    lessons: (section.contents || []).map((c) => normalizeContent(c, section.sectionId)),
});

// ─────────────────────────────────────────────────────────────────────────────

const CourseViewV2 = () => {
    const isMobile = useMediaQuery("(max-width:900px)");
    const isSmall = useMediaQuery("(max-width:600px)");
    const { id } = useParams();
    const { user } = useAuth();
    useAdmin(); // keeps admin context active
    const location = useLocation();
    const navigate = useNavigate();

    // ── Refs ──────────────────────────────────────────────────────────────────
    const hasFetched = useRef(false);
    const lessonStartedRef = useRef(false);   // true until first "past barrier" timeupdate
    const playerCardRef = useRef(null);
    const curriculumRef = useRef(null);
    const vimeoPlayerRef = useRef(null);       // exposes seekTo / play / pause
    const lastSaveRef = useRef(0);             // currentSec at last API save
    const lastAnalyticsRef = useRef(null);     // null = baseline not yet set for this lesson
    const progressBarrierRef = useRef(0);      // "start-over" threshold: don't save until past this
    const selectedLessonIdRef = useRef(null);     // latest selected lesson id (always fresh)
    const lastCurriculumUpdateSecRef = useRef(-1); // throttle: last second we patched curriculum
    const userIdRef = useRef(null);
    const courseIdRef = useRef(null);
    const sectionIdRef = useRef(0);
    const contentIdRef = useRef(0);
    const totalRef = useRef(0);
    const completedRef = useRef(0);

    // ── State ─────────────────────────────────────────────────────────────────
    const [loading, setLoading] = useState(false);
    const [fetchError, setFetchError] = useState(null);

    const [curriculum, setCurriculum] = useState([]);
    const [courseDetail, setCourseDetail] = useState({});
    const [courseProgress, setCourseProgress] = useState({});

    const [completed, setCompleted] = useState(0);
    const [total, setTotal] = useState(0);
    const [liveCoursePercent, setLiveCoursePercent] = useState(0);

    const [selectedLesson, setSelectedLesson] = useState(null);
    const [topicName, setTopicName] = useState("");

    const [expandedPanels, setExpandedPanels] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState("");
    const [value, setValue] = useState(0);
    const [darkMode] = useState(false);
    const [isFav, setIsFav] = useState(false);
    const [urlLessonNotFound, setUrlLessonNotFound] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Resume-or-start-over dialog
    const [resumeDialog, setResumeDialog] = useState({
        open: false,
        watchedSeconds: 0,
    });

    // ── LocalStorage ──────────────────────────────────────────────────────────
    const [localProgress, setLocalProgress] = useState(() => {
        try { return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY)) || {}; }
        catch { return {}; }
    });

    const [analytics, setAnalytics] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_ANALYTICS_KEY)) || {
                totalWatchSec: 0,
                lessonsCompleted: 0,
                lastWatchedContentId: null,
            };
        } catch {
            return { totalWatchSec: 0, lessonsCompleted: 0, lastWatchedContentId: null };
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

    // ── Fetch course details ──────────────────────────────────────────────────
    useEffect(() => {
        const courseId = parseInt(id);
        if (!courseId || !user?.id || hasFetched.current) return;
        hasFetched.current = true;

        setLoading(true);
        (async () => {
            try {
                const res = await httpClient.getCourseDetailsV2(courseId, { user_id: user.id });
                const data = res?.data?.response;
                if (!data) throw new Error("Invalid response");

                setCourseDetail({
                    id: data.courseId,
                    title: data.title,
                    description: data.description,
                    image_url: data.imageurl,
                    duration: data.duration,
                    isPublished: data.isPublished,
                });

                const sections = (data.sections || []).map(normalizeSection);
                setCurriculum(sections);
            } catch (_) {
                setFetchError("Failed to load course details. Please try again.");
            } finally {
                setLoading(false);
            }
        })();
    }, [id, user?.id]);

    // ── Recalculate progress stats ────────────────────────────────────────────
    useEffect(() => {
        if (!curriculum || curriculum.length === 0) {
            setCompleted(0); setTotal(0); setLiveCoursePercent(0); return;
        }
        let completedCount = 0, totalCount = 0, percentSum = 0;
        for (const topic of curriculum) {
            const lessons = topic?.lessons || [];
            totalCount += lessons.length;
            for (const lesson of lessons) {
                const lp = localProgress?.[lesson.id];
                const apiPercent = lesson.progress_percent || 0;
                let livePercent = 0;
                if (lesson.duration > 0) {
                    const watched = lp?.lastPosition ?? lp?.watchedSeconds ?? lesson.watched_seconds ?? 0;
                    livePercent = Math.min(100, Math.round((watched / lesson.duration) * 100));
                }
                const isCompleted = lp?.completed ?? lesson.is_completed ?? false;
                let percent = apiPercent;
                if (isCompleted) { percent = 100; completedCount++; }
                else if (livePercent > apiPercent) { percent = livePercent; }
                percentSum += percent;
            }
        }
        setCompleted(completedCount);
        setTotal(totalCount);
        setLiveCoursePercent(totalCount > 0 ? Math.round(percentSum / totalCount) : 0);
    }, [curriculum, localProgress]);

    // ── URL ?lid= → selected lesson ──────────────────────────────────────────
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
                    const p = new URLSearchParams(location.search || "");
                    p.set("lid", String(firstLesson.id));
                    navigate(`${location.pathname}?${p.toString()}`, { replace: true });
                }
            }
            return;
        }

        const lid = Number(lidStr);
        if (!lid || Number.isNaN(lid)) { setUrlLessonNotFound(true); return; }

        const pos = locateLesson(lid);
        if (pos) {
            const lesson = lessonAt(pos.topicIndex, pos.lessonIndex);
            if (lesson) {
                // Only call openLesson when the lesson actually changes,
                // preventing the URL sync navigate from re-triggering the resume dialog.
                if (lesson.id !== selectedLessonIdRef.current) {
                    openLesson(lesson, curriculum[pos.topicIndex].id, curriculum[pos.topicIndex].title);
                }
                setUrlLessonNotFound(false);
            } else {
                setUrlLessonNotFound(true);
            }
        } else {
            setUrlLessonNotFound(true);
        }
    }, [location.search, curriculum]);

    // ── Sync URL when lesson changes ─────────────────────────────────────────
    useEffect(() => {
        if (!selectedLesson) return;
        const params = new URLSearchParams(location.search || "");
        const current = params.get("lid");
        if (String(current) !== String(selectedLesson.id)) {
            params.set("lid", String(selectedLesson.id));
            navigate(`${location.pathname}?${params.toString()}`, { replace: true });
        }
    }, [selectedLesson?.id, location.pathname, navigate]);

    // ── Keep hot refs in sync ─────────────────────────────────────────────────
    useEffect(() => {
        userIdRef.current = user?.id || null;
        courseIdRef.current = courseDetail?.id || null;
        totalRef.current = total || 0;
        completedRef.current = completed || 0;
        sectionIdRef.current = selectedLesson?.sectionId || 0;
        contentIdRef.current = selectedLesson?.contentId || 0;
    }, [user?.id, courseDetail?.id, total, completed, selectedLesson?.id]);

    // ── Helpers ───────────────────────────────────────────────────────────────
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
                    if (lessons[l]?.id === lessonId) return { topicIndex: t, lessonIndex: l };
                }
            }
            return null;
        },
        [curriculum]
    );

    const lessonAt = (ti, li) => curriculum[ti]?.lessons?.[li] || null;

    // ── Open Lesson ───────────────────────────────────────────────────────────
    const openLesson = (lesson, topicId, topicTitle) => {
        const isNewLesson = selectedLessonIdRef.current !== lesson.id;

        // Always update the tracking ref so future calls know the current id
        selectedLessonIdRef.current = lesson.id;

        lessonStartedRef.current = true;
        lastSaveRef.current = lesson.watched_seconds || 0;
        lastAnalyticsRef.current = null;
        progressBarrierRef.current = 0;
        lastCurriculumUpdateSecRef.current = -1; // reset so first timeupdate patches curriculum

        setSelectedLesson(lesson);
        setTopicName(topicTitle);
        setExpandedPanels((prev) => new Set(prev).add(topicId));
        persistAnalytics((a) => ({ ...a, lastWatchedContentId: lesson.id }));

        // Show resume dialog ONLY on the first open of a new lesson that has saved progress
        if (isNewLesson) {
            const hasProgress = (lesson.watched_seconds || 0) > 0;
            const isComplete = lesson.is_completed || lesson.progress_percent >= 100;
            if (hasProgress && !isComplete) {
                setResumeDialog({ open: true, watchedSeconds: lesson.watched_seconds });
            } else {
                setResumeDialog({ open: false, watchedSeconds: 0 });
            }
        }

        setTimeout(() => {
            if (!playerCardRef.current) return;
            const rect = playerCardRef.current.getBoundingClientRect();
            const top = rect.top + window.scrollY - HEADER_HEIGHT - 12;
            window.scrollTo({ top, behavior: "smooth" });
        }, 150);
    };

    // ── Resume / Start-over handlers ─────────────────────────────────────────

    // Resume: seek Vimeo to saved position, progress barrier stays 0
    const handleResume = () => {
        const { watchedSeconds } = resumeDialog;
        setResumeDialog({ open: false, watchedSeconds: 0 });
        progressBarrierRef.current = 0;
        lastSaveRef.current = watchedSeconds;
        if (watchedSeconds > 0) {
            // Small delay to ensure VimeoPlayer SDK has initialised
            setTimeout(() => {
                vimeoPlayerRef.current?.seekTo(watchedSeconds);
            }, 600);
        }
    };

    // Start Over: play from 0, but only save progress once the player
    // passes the previously saved watched_seconds (so we don't re-save old data).
    const handleStartOver = () => {
        const { watchedSeconds } = resumeDialog;
        setResumeDialog({ open: false, watchedSeconds: 0 });
        progressBarrierRef.current = watchedSeconds; // barrier = previously saved position
        lastSaveRef.current = watchedSeconds;         // periodic saves count from here
        lessonStartedRef.current = true;              // arm first-save trigger
        // No seek needed — iframe starts at 0 by default
    };

    // ── Progress API call ─────────────────────────────────────────────────────
    const safeUpdateContentProgress = useCallback(async (watched_seconds, total_seconds) => {
        try {
            const uid = userIdRef.current;
            const cid = courseIdRef.current;
            const sid = sectionIdRef.current;
            const lid = contentIdRef.current;
            if (!uid || !cid || !sid || !lid) return;
            await httpClient.updateContentProgress({
                user_id: uid,
                content_id: lid,
                section_id: sid,
                course_id: cid,
                watched_seconds,
                total_seconds,
            });
        } catch (_) { /* silent */ }
    }, []);

    // ── Vimeo timeupdate callback ─────────────────────────────────────────────
    const handleVimeoTimeUpdate = useCallback(
        (currentSec, totalSec) => {
            if (!selectedLesson) return;

            // ── 1. Analytics baseline: set on very first event for this lesson ──
            if (lastAnalyticsRef.current === null) {
                lastAnalyticsRef.current = currentSec;
                return;
            }

            // ── 2. Always update local progress (UI stays responsive) ────────
            if (totalSec > 0 && currentSec / totalSec >= 0.98) {
                persistProgress((prev) => {
                    const updated = { ...prev };
                    const p = updated[selectedLesson.id] || { watchedSeconds: 0, completed: false, lastPosition: 0 };
                    if (!p.completed) {
                        p.completed = true;
                        p.watchedSeconds = totalSec;
                        p.lastPosition = totalSec;
                        persistAnalytics((a) => ({ ...a, lessonsCompleted: (a.lessonsCompleted || 0) + 1 }));
                    }
                    updated[selectedLesson.id] = p;
                    return updated;
                });
            } else {
                persistProgress((prev) => {
                    const updated = { ...prev };
                    const p = updated[selectedLesson.id] || { watchedSeconds: 0, completed: false, lastPosition: 0 };
                    p.watchedSeconds = Math.max(p.watchedSeconds || 0, currentSec);
                    p.lastPosition = currentSec;
                    updated[selectedLesson.id] = p;
                    return updated;
                });
            }

            // ── 3. Analytics accumulation ─────────────────────────────────────
            const delta = currentSec - lastAnalyticsRef.current;
            if (delta > 0 && delta <= 2) {
                persistAnalytics((prev) => ({
                    ...prev,
                    totalWatchSec: (prev.totalWatchSec || 0) + delta,
                }));
            }
            lastAnalyticsRef.current = currentSec;

            // ── 4. Live curriculum patch (every 3 s or on completion) ─────────
            // Keeps watched_seconds, progress_percent, is_completed fresh in
            // the curriculum state so openLesson always reads up-to-date data
            // for the resume / start-over dialog.
            // Handles both "start over" and "resume" scenarios.
            const isNowComplete = totalSec > 0 && currentSec / totalSec >= 0.98;
            const secsSinceCurriculumUpdate = currentSec - lastCurriculumUpdateSecRef.current;
            if (secsSinceCurriculumUpdate >= 3 || isNowComplete) {
                lastCurriculumUpdateSecRef.current = currentSec;
                const liveWatched = isNowComplete ? (totalSec || currentSec) : currentSec;
                updateCurriculumWatched(selectedLesson.id, liveWatched, isNowComplete, totalSec);
            }

            // --- Helper: update curriculum watched_seconds in real time ---
            function updateCurriculumWatched(lessonId, watchedSeconds, isCompleted, totalSec) {
                setCurriculum((prev) =>
                    prev.map((section) => ({
                        ...section,
                        lessons: section.lessons.map((l) =>
                            l.id === lessonId
                                ? {
                                    ...l,
                                    watched_seconds: Math.max(l.watched_seconds || 0, watchedSeconds),
                                    is_completed: isCompleted || l.is_completed,
                                    progress_percent: totalSec > 0
                                        ? Math.min(100, Math.round((watchedSeconds / totalSec) * 100))
                                        : l.progress_percent,
                                }
                                : l
                        ),
                    }))
                );
            }

            // ── 5. API progress save rules ────────────────────────────────────
            // Rule A: lesson already fully complete from server → no more API calls
            const serverComplete = selectedLesson?.is_completed || selectedLesson?.progress_percent >= 100;
            if (serverComplete) return;

            // Rule B: must have passed both the start-over barrier AND the previously
            //         saved watched_seconds before we record any new progress.
            const barrier = Math.max(progressBarrierRef.current, selectedLesson?.watched_seconds || 0);
            if (currentSec <= barrier) return;

            // Rule C: first save immediately after crossing the barrier
            if (lessonStartedRef.current) {
                lessonStartedRef.current = false;
                lastSaveRef.current = currentSec;
                void safeUpdateContentProgress(currentSec, totalSec);
                return;
            }

            // Rule D: subsequent periodic saves every 60 seconds of new progress
            if (currentSec - lastSaveRef.current >= 60) {
                lastSaveRef.current = currentSec;
                void safeUpdateContentProgress(currentSec, totalSec);
            }
        },
        [
            selectedLesson?.id,
            selectedLesson?.watched_seconds,
            selectedLesson?.is_completed,
            selectedLesson?.progress_percent,
            safeUpdateContentProgress,
        ]
    );

    // ── Vimeo ended callback ──────────────────────────────────────────────────
    const handleVimeoEnded = useCallback(
        (currentSec, totalSec) => {
            if (!selectedLesson) return;
            // Always save on video end regardless of barrier —
            // finishing the video is always new progress.
            const serverComplete = selectedLesson?.is_completed || selectedLesson?.progress_percent >= 100;
            if (!serverComplete) {
                void safeUpdateContentProgress(totalSec || currentSec, totalSec);
            }
        },
        [selectedLesson?.id, selectedLesson?.is_completed, selectedLesson?.progress_percent, safeUpdateContentProgress]
    );

    // ── Navigation ────────────────────────────────────────────────────────────
    const goToNext = useCallback(() => {
        if (!selectedLesson || !curriculum.length) return;
        const pos = locateLesson(selectedLesson.id);
        if (!pos) return;
        const { topicIndex, lessonIndex } = pos;
        const lessons = curriculum[topicIndex]?.lessons || [];
        if (lessonIndex + 1 < lessons.length) {
            const next = lessonAt(topicIndex, lessonIndex + 1);
            if (next) openLesson(next, curriculum[topicIndex].id, curriculum[topicIndex].title);
            return;
        }
        if (topicIndex + 1 < curriculum.length) {
            const nt = curriculum[topicIndex + 1];
            if (nt?.lessons?.[0]) openLesson(nt.lessons[0], nt.id, nt.title);
        }
    }, [curriculum, selectedLesson, locateLesson]);

    const goToPrev = useCallback(() => {
        if (!selectedLesson || !curriculum.length) return;
        const pos = locateLesson(selectedLesson.id);
        if (!pos) return;
        const { topicIndex, lessonIndex } = pos;
        if (lessonIndex - 1 >= 0) {
            const prev = lessonAt(topicIndex, lessonIndex - 1);
            if (prev) openLesson(prev, curriculum[topicIndex].id, curriculum[topicIndex].title);
            return;
        }
        if (topicIndex - 1 >= 0) {
            const pt = curriculum[topicIndex - 1];
            const lessons = pt?.lessons || [];
            const prev = lessons[lessons.length - 1];
            if (prev) openLesson(prev, pt.id, pt.title);
        }
    }, [curriculum, selectedLesson, locateLesson]);

    const canGoNext = () => {
        if (!selectedLesson || !curriculum.length) return false;
        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return false;
        const { topicIndex, lessonIndex } = pos;
        if (lessonIndex + 1 < (curriculum[topicIndex]?.lessons?.length || 0)) return true;
        return topicIndex + 1 < curriculum.length;
    };

    const canGoPrev = () => {
        if (!selectedLesson || !curriculum.length) return false;
        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return false;
        const { topicIndex, lessonIndex } = pos;
        if (lessonIndex - 1 >= 0) return true;
        return topicIndex - 1 >= 0;
    };

    const getNextLessonTitle = () => {
        if (!selectedLesson || !curriculum.length) return "";
        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return "";
        const { topicIndex, lessonIndex } = pos;
        const lessons = curriculum[topicIndex]?.lessons || [];
        if (lessonIndex + 1 < lessons.length) return lessons[lessonIndex + 1]?.title || "";
        return curriculum[topicIndex + 1]?.lessons?.[0]?.title || "";
    };

    const getPrevLessonTitle = () => {
        if (!selectedLesson || !curriculum.length) return "";
        const pos = locateLesson(selectedLesson?.id);
        if (!pos) return "";
        const { topicIndex, lessonIndex } = pos;
        const lessons = curriculum[topicIndex]?.lessons || [];
        if (lessonIndex - 1 >= 0) return lessons[lessonIndex - 1]?.title || "";
        if (topicIndex - 1 >= 0) {
            const pl = curriculum[topicIndex - 1]?.lessons || [];
            return pl[pl.length - 1]?.title || "";
        }
        return "";
    };

    // ── Search filter ─────────────────────────────────────────────────────────
    const filteredCurriculum = useMemo(() => {
        if (!searchQuery) return curriculum;
        const q = searchQuery.toLowerCase();
        return curriculum
            .map((topic) => {
                const ml = topic.lessons.filter(
                    (l) =>
                        l.title.toLowerCase().includes(q) ||
                        (l.description || "").toLowerCase().includes(q)
                );
                if (topic.title.toLowerCase().includes(q) || ml.length)
                    return { ...topic, lessons: ml };
                return null;
            })
            .filter(Boolean);
    }, [curriculum, searchQuery]);

    const handleChange = (_, v) => setValue(v);

    const curriculumProps = {
        filteredCurriculum,
        expandedPanels,
        setExpandedPanels,
        selectedLesson,
        openLesson,
        localProgress,
        parseDurationToSeconds,
        searchQuery,
        setSearchQuery,
        darkMode,
        curriculumRef,
        HEADER_HEIGHT,
        courseProgress,
    };

    const drawerContent = (
        <Box sx={{ height: "100%", overflowY: "auto", mt: isMobile ? 0 : 8 }}>
            <CurriculumView {...curriculumProps} />
        </Box>
    );

    // ── Loading / error ───────────────────────────────────────────────────────
    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh" }}>
                <CircularProgress />
            </Box>
        );
    }

    if (fetchError) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: 240, px: 2 }}>
                <Alert severity="error" variant="outlined" sx={{ width: "100%", maxWidth: 700 }}>
                    {fetchError}
                </Alert>
            </Box>
        );
    }

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <Box
            sx={{
                background: darkMode ? "var(--textPrimary)" : "var(--bg)",
                width: "100%",
                maxWidth: "100%",
                minHeight: "100vh",
                p: 0,
                m: 0,
            }}
        >
            <CssBaseline />

            {/* ── Course Header ─────────────────────────────────────────── */}
            <CourseHeader
                courseDetail={courseDetail}
                isFav={isFav}
                toggleFavorite={() => setIsFav((f) => !f)}
                completed={completed}
                total={total}
                percent={liveCoursePercent}
                showMenuButton={isMobile}
                onMenuClick={() => setMobileOpen((o) => !o)}
                drawerWidth={DRAWER_WIDTH}
                courseProgress={courseProgress}
                liveCoursePercent={liveCoursePercent}
            />

            <Box sx={{ display: "flex", width: "100%" }}>

                {/* ── Main content ─────────────────────────────────────── */}
                <Box component="main" sx={{ flexGrow: 1, width: "100%", p: 0 }}>

                    {urlLessonNotFound && (
                        <Box sx={{ p: 2 }}>
                            <Alert severity="warning" variant="outlined">
                                No lesson found in this course.
                            </Alert>
                        </Box>
                    )}

                    {/* ── Video player card ──────────────────────────────── */}
                    <Card
                        ref={playerCardRef}
                        sx={{
                            borderRadius: 0,
                            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                            width: "100%",
                            overflow: "hidden",
                            background: "var(--surface)",
                        }}
                    >
                        <Box
                            sx={{
                                width: "100%",
                                height: isSmall ? "240px" : "69vh",
                                background: "var(--textPrimary)",
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                position: "relative",
                            }}
                        >
                            {selectedLesson?.type === "Video" && selectedLesson?.filePath ? (
                                <VimeoPlayer
                                    key={selectedLesson.id}
                                    ref={vimeoPlayerRef}
                                    videoId={selectedLesson.filePath}
                                    title={selectedLesson.title}
                                    fill
                                    onTimeUpdate={handleVimeoTimeUpdate}
                                    onEnded={handleVimeoEnded}
                                />
                            ) : (
                                !loading && (
                                    <Typography sx={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
                                        {curriculum.length === 0
                                            ? "No content available for this course."
                                            : "Select a lesson to start watching."}
                                    </Typography>
                                )
                            )}
                        </Box>

                        {/* Lesson navigation bar */}
                        {selectedLesson && (
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    px: { xs: 1.5, sm: 2.5 },
                                    py: 1,
                                    background: "var(--surface)",
                                    borderTop: "1px solid var(--darkMedium)",
                                    gap: 1,
                                }}
                            >
                                <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={!canGoPrev()}
                                    onClick={goToPrev}
                                    sx={{ whiteSpace: "nowrap", minWidth: 90, flexShrink: 0 }}
                                >
                                    {`← ${!isSmall && getPrevLessonTitle()
                                        ? getPrevLessonTitle().length > 20
                                            ? getPrevLessonTitle().slice(0, 20) + "…"
                                            : getPrevLessonTitle()
                                        : "Prev"}`}
                                </Button>

                                <Typography
                                    sx={{
                                        fontSize: { xs: 13, sm: 15 },
                                        fontWeight: 600,
                                        flex: 1,
                                        textAlign: "center",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",
                                        whiteSpace: "nowrap",
                                        color: "var(--textPrimary)",
                                    }}
                                >
                                    {selectedLesson.title}
                                </Typography>

                                <Button
                                    size="small"
                                    variant="outlined"
                                    disabled={!canGoNext()}
                                    onClick={goToNext}
                                    sx={{ whiteSpace: "nowrap", minWidth: 90, flexShrink: 0 }}
                                >
                                    {`${!isSmall && getNextLessonTitle()
                                        ? getNextLessonTitle().length > 20
                                            ? getNextLessonTitle().slice(0, 20) + "…"
                                            : getNextLessonTitle()
                                        : "Next"} →`}
                                </Button>
                            </Box>
                        )}
                    </Card>

                    {/* ── Tabs ──────────────────────────────────────────── */}
                    <CourseTabView
                        value={value}
                        handleChange={handleChange}
                        selectedLesson={selectedLesson}
                        darkMode={darkMode}
                        courseDetail={courseDetail}
                        curriculumProps={curriculumProps}
                        courseProgress={courseProgress}
                    />

                    {!isMobile && (
                        <Box sx={{ pt: 4 }}>
                            <Footer compView={true} />
                        </Box>
                    )}
                </Box>

                {/* ── Right drawer – desktop curriculum ────────────────── */}
                {!isMobile && (
                    <Drawer
                        variant="permanent"
                        anchor="right"
                        sx={{
                            width: DRAWER_WIDTH,
                            flexShrink: 0,
                            "& .MuiDrawer-paper": {
                                width: DRAWER_WIDTH,
                                boxSizing: "border-box",
                            },
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                )}
            </Box>

            {isMobile && (
                <Box sx={{ mt: 1 }}>
                    <Footer compView={true} />
                </Box>
            )}

            {/* ── Resume / Start-over dialog ───────────────────────────── */}
            <Dialog
                open={resumeDialog.open}
                onClose={handleStartOver}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
            >
                <DialogTitle sx={{ fontWeight: 700, pb: 0.5 }}>
                    Continue watching?
                </DialogTitle>

                <DialogContent>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        You left off at{" "}
                        <Box component="span" sx={{ fontWeight: 700, color: "var(--primaryColor)" }}>
                            {fmtSeconds(resumeDialog.watchedSeconds)}
                        </Box>{" "}
                        in this lesson. Would you like to resume or start over?
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button
                        variant="outlined"
                        startIcon={<ReplayIcon />}
                        onClick={handleStartOver}
                        sx={{ flex: 1, borderRadius: 2 }}
                    >
                        Start Over
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<PlayCircleOutlinedIcon />}
                        onClick={handleResume}
                        sx={{ flex: 1, borderRadius: 2 }}
                        autoFocus
                    >
                        Resume ({fmtSeconds(resumeDialog.watchedSeconds)})
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default CourseViewV2;
