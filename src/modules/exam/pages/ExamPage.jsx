import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, CssBaseline, createTheme, ThemeProvider, Button, Typography, Avatar, Drawer, useMediaQuery, IconButton, Divider, Card, Dialog, DialogTitle, DialogContent, DialogActions, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useAuth } from '../../../hooks/useAuth';
import ExamHeader from '../../../components/exam/ExamHeader';
import QuestionCard from '../../../components/exam/QuestionCard';
import ActionBar from '../../../components/exam/ActionBar';
import SidebarPanel from '../../../components/exam/SidebarPanel';
import { getExamQuestions, getUserExamDetails, upsertUserExamAnswer, startExamAttempt, submit_exam } from '../../../components/exam/handlers/Handler';
import { localNow } from '../../../utils/resolver.utils';

export default function ExamPage() {
    const [current, setCurrent] = useState(0);
    // persist answers/marks per-section: { [sectionId]: { [questionIndex]: answer } }
    const [selectedAnswers, setSelectedAnswers] = useState({});
    // marked is an object mapping sectionId -> Set(of question numbers)
    const [marked, setMarked] = useState({});
    const [dark, setDark] = useState(false);
    const [language, setLanguage] = useState('en');
    const [timeLeft, setTimeLeft] = useState(0); // 30 minutes default
    const [sectionIndex, setSectionIndex] = useState(0);

    const [exam, setExam] = useState(null);

    const [examDetails, setExamDetails] = useState(null);
    const [sections, setSections] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [userAttempts, setUserAttempts] = useState([]);
    const [currentAttempt, setCurrentAttempt] = useState(null);
    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const theme = useMemo(() => createTheme({ palette: { mode: dark ? 'dark' : 'light' } }), [dark]);
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerWidth = 360;
    const [answerQueue, setAnswerQueue] = useState([]);
    const [updateErrorCount, setUpdateErrorCount] = useState(0);

    // helper to ensure a value is a Set (supports Set, array, or object keyed by question)
    const getSetFrom = (v) => {
        if (!v) return new Set();
        if (v instanceof Set) return new Set(v);
        if (Array.isArray(v)) return new Set(v);
        if (typeof v === 'object') return new Set(Object.keys(v).map((k) => Number(k)));
        return new Set();
    };

    // parse examId, userId and optional sectionid from URL
    const urlParams = useMemo(() => {
        try {
            const u = new URL(window.location.href);
            const sectionParam = u.searchParams.get('sectionid');
            const attemptidParam = u.searchParams.get('attemptid');
            const parts = u.pathname.split('/').filter(Boolean);
            let examIdFromPath = null;
            let userIdFromPath = null;
            const examIdx = parts.indexOf('exam');
            if (examIdx >= 0 && parts.length > examIdx + 1) examIdFromPath = Number(parts[examIdx + 1]);
            const userIdx = parts.indexOf('user');
            if (userIdx >= 0 && parts.length > userIdx + 1) userIdFromPath = Number(parts[userIdx + 1]);
            return {
                examId: Number.isFinite(examIdFromPath) ? examIdFromPath : null,
                userId: Number.isFinite(userIdFromPath) ? userIdFromPath : null,
                sectionId: sectionParam != null ? Number(sectionParam) : null,
                attemptId: attemptidParam != null ? Number(attemptidParam) : null
            };
        } catch (e) {
            return { examId: null, userId: null, sectionId: null, attemptId: null };
        }
    }, []);

    // auth user for displaying in sub-header
    const { user, isAuthenticated } = useAuth();
    const displayName = user?.fullName || user?.name || user?.username || user?.email || 'User';
    const userInitial = String(displayName).charAt(0).toUpperCase();
    const roleName = user?.role || user?.roleName || user?.roles?.[0]?.name || '';
    const [allowAccess, setAllowAccess] = useState(false);
    const [startUpdated, setStartUpdated] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [successOpen, setSuccessOpen] = useState(false);
    const [getQuestions, setGetQuestions] = useState(false);
    const [countdown, setCountdown] = useState(5);
    const countdownRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated && urlParams.examId && urlParams.userId && urlParams.userId === user.id) {
            setAllowAccess(true);
        }
    }, []);

    // load exam details and sections on mount; questions are loaded when sectionIndex changes
    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const userId = urlParams.userId || 0;
                const examId = urlParams.examId || 0;
                const attemptId = urlParams.attemptId || 0;

                const examResp = await getUserExamDetails({ exam_id: examId, user_id: userId });

                if (!mounted) return;

                if (examResp?.error === false) {
                    const data = examResp.response;

                    // ✅ Separate states
                    setExamDetails(data.exam || null);
                    setSections(data.sections || []);
                    setSchedules(data.schedules || []);
                    setUserAttempts(data.user_attempts || []);

                    // ✅ Find attempt
                    const attempt = data.user_attempts?.find(a => a.attempt_id === attemptId);

                    if (!attempt || !["not_started", "in_progress"].includes(attempt.status)) {
                        navigate(`/exam-summary/${urlParams.examId}?userid=${urlParams.userId}`);
                        return;
                    } else {
                        setGetQuestions(true);
                    }

                    setCurrentAttempt(attempt);

                    // ✅ Section init
                    const firstSectionId = data.sections?.[0]?.section_id;
                    const urlSection = urlParams.sectionId;

                    const hasUrlSection = urlSection && data.sections.some(s => s.section_id === urlSection);
                    setSectionIndex(hasUrlSection ? urlSection : firstSectionId);
                }

            } catch (err) {
                console.error(err);
                setError(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        }
        if (allowAccess) {
            load();
        }
        return () => { mounted = false; };
    }, [allowAccess]);

    useEffect(() => {
        if (!allowAccess || !examDetails || !currentAttempt) return;

        const duration = examDetails.duration * 60;
        let interval;

        async function initTimer() {
            let startTime;

            if (currentAttempt.started_at) {
                startTime = new Date(currentAttempt.started_at).getTime();
                setStartUpdated(true);
            } else {
                // Not started yet — record start time and call API
                const { ms, iso: startedAt } = localNow();
                startTime = ms;
                try {
                    const startRes = await startExamAttempt({
                        attempt_id: urlParams.attemptId,
                        user_id: urlParams.userId,
                        exam_id: urlParams.examId,
                        started_at: startedAt,
                    });
                    if (startRes?.error === false) {
                        setStartUpdated(true);
                    }

                } catch (err) {
                    console.error('Failed to record exam start time', err);
                }
            }

            interval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const remaining = Math.max(0, duration - elapsed);
                setTimeLeft(remaining);

                if (remaining <= 0) {
                    clearInterval(interval);
                    handleAutoSubmit();
                }
            }, 1000);
        }

        initTimer();
        return () => clearInterval(interval);

    }, [allowAccess, startUpdated, examDetails, currentAttempt]);

    // fetch questions whenever sectionIndex changes and update URL param
    useEffect(() => {
        if (!sectionIndex) return;
        let mounted = true;
        async function loadSectionQuestions() {
            setLoading(true);
            try {
                const userId = urlParams.userId || 0;
                const examId = urlParams.examId || 0;
                const attemptId = urlParams.attemptId || 0;

                const questionResp = await getExamQuestions({ exam_id: examId, user_id: userId, attempt_id: attemptId, section_id: sectionIndex });
                if (!mounted) return;
                if (questionResp?.error === false) {
                    const sectionQuestions = Array.isArray(questionResp?.response[0]?.questions) ? questionResp?.response[0]?.questions : [];
                    const flat = [];
                    // ensure we have storage for this section (do not clear existing data)
                    setSelectedAnswers((prev) => ({ ...(prev || {}), [sectionIndex]: prev?.[sectionIndex] || {} }));
                    setMarked((prev) => ({ ...(prev || {}), [sectionIndex]: prev?.[sectionIndex] || new Set() }));

                    (sectionQuestions || []).forEach((q) => {
                        const obj = {
                            id: q.question_id,
                            text: q.title,
                            options: (q.options || []).map((o) => o.option_text),
                            rawOptions: q.options || [],
                            type: q.question_type,
                            marks: q.marks,
                            sectionIndex: q.question_id,
                            order_no: q.order_no,
                        };
                        flat[q.question_id] = obj;

                        if (q.user_answer && q.user_answer !== "" && q.user_answer !== 0 && q.user_answer !== null) {
                            setSelectedAnswers((prev) => {
                                const bySection = { ...(prev || {}) };
                                const sectionAnswers = { ...(bySection[sectionIndex] || {}) };
                                sectionAnswers[q.question_id] = q.user_answer;
                                bySection[sectionIndex] = sectionAnswers;
                                return bySection;
                            });
                        }

                        if (q.user_marked !== undefined && q.user_marked === true) {
                            setMarked((prev) => {
                                const bySection = { ...(prev || {}) };
                                const curSet = getSetFrom(bySection[sectionIndex]);
                                curSet.add(q.question_id);
                                bySection[sectionIndex] = curSet;
                                return bySection;
                            });
                        }
                    });
                    setQuestions(flat || []);
                    // set current to the first question's id so questions[current] resolves
                    const firstQuestionId = sectionQuestions?.[0]?.question_id ?? 0;
                    setCurrent(firstQuestionId);
                }

                // update the URL parameter
                try {
                    const url = new URL(window.location.href);
                    url.searchParams.set('sectionid', String(sectionIndex));
                    window.history.replaceState({}, '', url.toString());
                } catch (e) {
                    // ignore URL update errors
                }
            } catch (err) {
                console.error(err);
                setError(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        }
        if (allowAccess && startUpdated && getQuestions) {
            loadSectionQuestions();
        }
        return () => { mounted = false; };
    }, [allowAccess, startUpdated, sectionIndex, getQuestions]);


    useEffect(() => {
        if (allowAccess && startUpdated) {
            const interval = setInterval(async () => {

                if (answerQueue.length === 0) return;

                const queueCopy = [...answerQueue];
                setAnswerQueue([]);

                try {

                    const userId = urlParams.userId || 0;
                    const examId = urlParams.examId || 0;
                    const attemptId = urlParams.attemptId || 0;

                    for (const item of queueCopy) {

                        await upsertUserExamAnswer({
                            user_id: userId,
                            exam_id: examId,
                            attempt_id: attemptId,
                            question_id: item.question_id,
                            answer_id: item.answer_id,
                            marked: item.marked
                        });

                    }

                } catch (err) {

                    console.error("Answer sync failed, retrying...", err);
                    if (updateErrorCount < 2) {
                        setUpdateErrorCount((c) => c + 1);
                        setAnswerQueue((prev) => [...queueCopy, ...prev]);
                    }
                }

            }, 2000);

            return () => clearInterval(interval);
        }
    }, [allowAccess, startUpdated, answerQueue]);

    useEffect(() => {
        if (allowAccess && startUpdated) {
            const flushQueue = async () => {

                if (answerQueue.length === 0) return;

                try {

                    const userId = urlParams.userId || 0;
                    const examId = urlParams.examId || 0;
                    const attemptId = urlParams.attemptId || 0;

                    await Promise.all(
                        answerQueue.map((item) =>
                            upsertUserExamAnswer({
                                user_id: userId,
                                exam_id: examId,
                                attempt_id: attemptId,
                                question_id: item.question_id,
                                answer_id: item.answer_id,
                                marked: item.marked
                            })
                        )
                    );

                } catch (err) {
                    console.error("Final answer sync failed", err);
                }
            };

            window.addEventListener("beforeunload", flushQueue);

            return () => window.removeEventListener("beforeunload", flushQueue);
        }
    }, [allowAccess, startUpdated, answerQueue]);

    // const answeredSet = useMemo(() => new Set(Object.keys(selectedAnswers[sectionIndex] || {}).map((k) => Number(k) + 1)), [selectedAnswers, sectionIndex]);
    const answeredSet = useMemo(() =>
        new Set(Object.keys(selectedAnswers[sectionIndex] || {}).map(Number)),
        [selectedAnswers, sectionIndex]
    );

    function handleSelect(value) {
        const question = questions[current];

        // multiple_select passes an array; mcq/true_false passes a single number
        let normalized;
        if (Array.isArray(value)) {
            normalized = value; // already array of option IDs
        } else {
            normalized = typeof value === 'string' && !isNaN(value) ? Number(value) : value;
        }

        setSelectedAnswers((prev) => {
            const bySection = { ...(prev || {}) };
            const sectionAnswers = { ...(bySection[sectionIndex] || {}) };
            sectionAnswers[current] = normalized;
            bySection[sectionIndex] = sectionAnswers;
            return bySection;
        });

        const isMarked = getSetFrom(marked[sectionIndex]).has(current + 1);

        if (Array.isArray(normalized)) {
            // multiple_select: one queue entry per selected option (answer_id as int)
            setAnswerQueue((prev) => [
                ...prev,
                ...normalized.map(optId => ({
                    question_id: question?.id,
                    answer_id: optId,
                    marked: isMarked
                }))
            ]);
        } else {
            setAnswerQueue((prev) => [
                ...prev,
                {
                    question_id: question?.id,
                    answer_id: normalized ?? null,
                    marked: isMarked
                }
            ]);
        }
    }

    function handleSaveNext() {
        setCurrent((c) => Math.min(questions.length - 1, c + 1));
    }

    function handleClear() {
        setSelectedAnswers((prev) => {
            const bySection = { ...(prev || {}) };
            const sectionAnswers = { ...(bySection[sectionIndex] || {}) };
            delete sectionAnswers[current];
            bySection[sectionIndex] = sectionAnswers;
            return bySection;
        });
    }

    function handleMark() {

        const question = questions[current];
        let newMarked = false;

        setMarked((prev) => {
            const bySection = { ...(prev || {}) };
            const curSet = getSetFrom(bySection[sectionIndex]);

            if (curSet.has(current + 1)) {
                curSet.delete(current + 1);
                newMarked = false;
            } else {
                curSet.add(current + 1);
                newMarked = true;
            }

            bySection[sectionIndex] = curSet;
            return bySection;
        });

        const answer = selectedAnswers?.[sectionIndex]?.[current];

        if (Array.isArray(answer)) {
            // multiple_select: one queue entry per selected option (answer_id as int)
            setAnswerQueue((prev) => [
                ...prev,
                ...answer.map(optId => ({
                    question_id: question?.id,
                    answer_id: optId,
                    marked: newMarked
                }))
            ]);
        } else {
            const normalized = typeof answer === 'string' && !isNaN(answer) ? Number(answer) : answer;
            setAnswerQueue((prev) => [
                ...prev,
                {
                    question_id: question?.id,
                    answer_id: normalized ?? null,
                    marked: newMarked
                }
            ]);
        }
    }

    function handleJump(index) {
        setCurrent(index);
    }

    function toggleFullscreen() {
        const el = document.documentElement;
        if (!document.fullscreenElement) el.requestFullscreen?.();
        else document.exitFullscreen?.();
    }

    async function doSubmit() {
        const userId = urlParams.userId || 0;
        const examId = urlParams.examId || 0;
        const attemptId = urlParams.attemptId || 0;

        // flush pending answer queue first
        if (answerQueue.length > 0) {
            await Promise.all(
                answerQueue.map((item) =>
                    upsertUserExamAnswer({
                        user_id: userId,
                        exam_id: examId,
                        attempt_id: attemptId,
                        question_id: item.question_id,
                        answer_id: item.answer_id,
                        marked: item.marked
                    })
                )
            );
        }

        const { iso: submitted_at } = localNow();
        await submit_exam({ user_id: userId, exam_id: examId, attempt_id: attemptId, submitted_at });

        // show success dialog with countdown
        setCountdown(5);
        setSuccessOpen(true);
    }

    function handleManualSubmit() {
        setConfirmOpen(true);
    }

    async function handleAutoSubmit() {
        try {
            await doSubmit();
        } catch (err) {
            console.error('Auto submit failed', err);
        }
    }

    useEffect(() => {
        if (!successOpen) return;
        countdownRef.current = setInterval(() => {
            setCountdown((c) => {
                if (c <= 1) {
                    clearInterval(countdownRef.current);
                    navigate(`/exam-summary/${urlParams.examId}?userid=${urlParams.userId}`);
                    return 0;
                }
                return c - 1;
            });
        }, 1000);
        return () => clearInterval(countdownRef.current);
    }, [successOpen]);

    const formatTimeSimple = (s) => {
        if (s >= 3600) {
            const hh = String(Math.floor(s / 3600)).padStart(2, '0');
            const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
            const ss = String(s % 60).padStart(2, '0');
            return `${hh}:${mm}:${ss}`;
        }
        const mm = String(Math.floor(s / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${mm}:${ss}`;
    };

    return (
        <ThemeProvider theme={theme}>
            <Box sx={{ height: "100vh", display: "flex", flexDirection: "column", boxShadow: 8 }}>
                {/* HEADER */}
                <ExamHeader
                    title=""
                    timeLeft={timeLeft}
                    language={language}
                    onLanguageChange={setLanguage}
                />

                {/* BODY */}
                {allowAccess && startUpdated && getQuestions && <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
                    {/* LEFT PANEL */}
                    <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
                        {/* SECTION HEADER */}
                        <Box
                            sx={{
                                px: 3,
                                py: 2,
                                bgcolor: "#fff",
                                borderBottom: "1px solid #e5e7eb",
                                position: "sticky",
                                top: 0,
                                zIndex: 10
                            }}
                        >
                            <Box sx={{ display: "flex", alignItems: "center" }}>
                                <Typography variant="h6">SSC Mock Test</Typography>

                                <Box sx={{ flex: 1 }} />

                                <Box
                                    sx={{
                                        bgcolor: "#111827",
                                        color: "#fff",
                                        px: 2,
                                        py: 0.6,
                                        borderRadius: 2
                                    }}
                                >
                                    ⏱ {formatTimeSimple(timeLeft)}
                                </Box>
                            </Box>

                            {/* SECTION TABS */}
                            {/* Section Carousel */}
                            {(() => {
                                const activeIdx = sections.findIndex(s => s.section_id === sectionIndex);
                                const hasPrev = activeIdx > 0;
                                const hasNext = activeIdx < sections.length - 1;

                                return (
                                    <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        {/* Left Arrow */}
                                        <IconButton
                                            size="small"
                                            onClick={() => hasPrev && setSectionIndex(sections[activeIdx - 1].section_id)}
                                            disabled={!hasPrev}
                                            sx={{
                                                flexShrink: 0,
                                                bgcolor: hasPrev ? '#e8edf5' : 'transparent',
                                                '&:hover': { bgcolor: '#d0d8e8' },
                                                '&.Mui-disabled': { opacity: 0.3 }
                                            }}
                                        >
                                            <ChevronLeftIcon fontSize="small" />
                                        </IconButton>

                                        {/* Tabs row */}
                                        <Box sx={{ display: 'flex', gap: 1, flex: 1, overflow: 'hidden', flexWrap: 'nowrap' }}>
                                            {sections.map((s) => {
                                                const active = s.section_id === sectionIndex;
                                                return (
                                                    <Box
                                                        key={s.section_id}
                                                        onClick={() => setSectionIndex(s.section_id)}
                                                        sx={{
                                                            px: 2.5, py: 0.6,
                                                            borderRadius: 2,
                                                            cursor: 'pointer',
                                                            flexShrink: 0,
                                                            fontWeight: active ? 700 : 400,
                                                            fontSize: '0.875rem',
                                                            bgcolor: active ? 'var(--darkMedium)' : '#eef2f7',
                                                            color: active ? '#fff' : '#333',
                                                            border: active ? '2px solid transparent' : '2px solid #e0e0e0',
                                                            transition: 'all 0.18s',
                                                            '&:hover': {
                                                                bgcolor: active ? 'primary.dark' : '#dde4f0',
                                                            }
                                                        }}
                                                    >
                                                        {s.display_name}
                                                    </Box>
                                                );
                                            })}
                                        </Box>

                                        {/* Right Arrow */}
                                        <IconButton
                                            size="small"
                                            onClick={() => hasNext && setSectionIndex(sections[activeIdx + 1].section_id)}
                                            disabled={!hasNext}
                                            sx={{
                                                flexShrink: 0,
                                                bgcolor: hasNext ? '#e8edf5' : 'transparent',
                                                '&:hover': { bgcolor: '#d0d8e8' },
                                                '&.Mui-disabled': { opacity: 0.3 }
                                            }}
                                        >
                                            <ChevronRightIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                );
                            })()}
                        </Box>

                        {/* QUESTION SCROLL AREA */}
                        <Box
                            sx={{
                                flex: 1,
                                overflowY: "auto",
                                px: 3,
                                py: 3,
                                pb: "120px"
                            }}
                        >
                            <Box sx={{ maxWidth: 900, mx: "auto" }}>
                                <Card sx={{ p: 3, borderRadius: 3 }}>
                                    <QuestionCard
                                        question={questions[current]}
                                        questionIndex={current}
                                        selected={selectedAnswers[sectionIndex]?.[current]}
                                        onSelect={handleSelect}
                                    />
                                </Card>
                            </Box>
                        </Box>
                    </Box>

                    {/* SIDEBAR */}
                    {isLarge ? (
                        <Box
                            sx={{
                                width: drawerWidth,
                                borderLeft: "1px solid #e6e6e6",
                                position: "sticky",
                                top: 0,
                                height: "calc(100vh - 64px)",
                                display: "flex",
                                flexDirection: "column",
                                bgcolor: "#fff"
                            }}
                        >
                            <SidebarPanel
                                questions={questions}
                                current={current}
                                answeredSet={answeredSet}
                                markedSet={getSetFrom(marked[sectionIndex])}
                                onJump={handleJump}
                                displayName={displayName}
                                userInitial={userInitial}
                                roleName={roleName}
                                timeLeft={timeLeft}
                            />
                        </Box>
                    ) : (
                        <>
                            <Button
                                onClick={() => setDrawerOpen(true)}
                                variant="contained"
                                sx={{ position: "fixed", right: 20, bottom: 90 }}
                            >
                                Questions
                            </Button>

                            <Drawer
                                anchor="right"
                                open={drawerOpen}
                                onClose={() => setDrawerOpen(false)}
                            >
                                <Box sx={{ width: drawerWidth }}>
                                    <SidebarPanel
                                        questions={questions}
                                        current={current}
                                        answeredSet={answeredSet}
                                        markedSet={getSetFrom(marked[sectionIndex])}
                                        onJump={(i) => {
                                            setDrawerOpen(false);
                                            handleJump(i);
                                        }}
                                        displayName={displayName}
                                        userInitial={userInitial}
                                        roleName={roleName}
                                        timeLeft={timeLeft}
                                    />
                                </Box>
                            </Drawer>
                        </>
                    )}
                </Box>}

                {/* FOOTER */}
                {allowAccess && startUpdated && getQuestions && <Box
                    sx={{
                        position: "fixed",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: "#fff",
                        borderTop: "1px solid #e5e7eb",
                        py: 1
                    }}
                >
                    <ActionBar
                        onMark={handleMark}
                        onClear={handleClear}
                        onSaveNext={handleSaveNext}
                        isMarked={getSetFrom(marked[sectionIndex]).has(current + 1)}
                        onSubmit={handleManualSubmit}
                    />
                </Box>}
            </Box>
            {/* ── Confirm Submit Dialog ── */}
            <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogTitle sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Submit Exam?</DialogTitle>
                <DialogContent>
                    <Typography fontSize="1rem" color="text.secondary">
                        Are you sure you want to submit? You cannot change your answers after submission.
                    </Typography>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setConfirmOpen(false)} variant="outlined" sx={{ borderRadius: 2 }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        sx={{ borderRadius: 2 }}
                        onClick={async () => {
                            setConfirmOpen(false);
                            try { await doSubmit(); } catch (err) { console.error('Submit failed', err); }
                        }}
                    >
                        Yes, Submit
                    </Button>
                </DialogActions>
            </Dialog>

            {/* ── Success Dialog ── */}
            <Dialog open={successOpen} maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}>
                <DialogContent sx={{ textAlign: 'center', py: 5, px: 4 }}>
                    <CheckCircleIcon sx={{ fontSize: 72, color: '#16a34a', mb: 2 }} />
                    <Typography fontWeight={800} fontSize="1.4rem" mb={1}>
                        Exam Submitted Successfully!
                    </Typography>
                    <Typography color="text.secondary" fontSize="1rem" mb={3}>
                        Redirecting to summary in <strong>{countdown}</strong> second{countdown !== 1 ? 's' : ''}…
                    </Typography>
                    <LinearProgress
                        variant="determinate"
                        value={((5 - countdown) / 5) * 100}
                        sx={{ borderRadius: 5, height: 8, mb: 3, bgcolor: '#dcfce7', '& .MuiLinearProgress-bar': { bgcolor: '#16a34a' } }}
                    />
                    <Button
                        variant="contained"
                        sx={{ borderRadius: 2, bgcolor: '#16a34a', '&:hover': { bgcolor: '#15803d' } }}
                        onClick={() => {
                            clearInterval(countdownRef.current);
                            navigate(`/exam-summary/${urlParams.examId}?userid=${urlParams.userId}`);
                        }}
                    >
                        Go to Summary Now
                    </Button>
                </DialogContent>
            </Dialog>

        </ThemeProvider>
    );
}
