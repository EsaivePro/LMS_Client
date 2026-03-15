import React, { useEffect, useMemo, useState } from 'react';
import { Box, Container, CssBaseline, createTheme, ThemeProvider, Button, Typography, Avatar, Drawer, useMediaQuery, IconButton, Divider, Card } from '@mui/material';
import { useAuth } from '../../../hooks/useAuth';
import ExamHeader from '../../../components/exam/ExamHeader';
import QuestionCard from '../../../components/exam/QuestionCard';
import ActionBar from '../../../components/exam/ActionBar';
import SidebarPanel from '../../../components/exam/SidebarPanel';
import { getExamQuestions, getUserExamDetails } from '../../../components/exam/handlers/Handler';
import CloseIcon from '@mui/icons-material/Close';

export default function ExamPage() {
    const [current, setCurrent] = useState(0);
    // persist answers/marks per-section: { [sectionId]: { [questionIndex]: answer } }
    const [selectedAnswers, setSelectedAnswers] = useState({});
    // marked is an object mapping sectionId -> Set(of question numbers)
    const [marked, setMarked] = useState({});
    const [dark, setDark] = useState(false);
    const [language, setLanguage] = useState('en');
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default
    const [sectionIndex, setSectionIndex] = useState(0);

    const [exam, setExam] = useState(null);
    const [sections, setSections] = useState([]);
    const [questions, setQuestions] = useState([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const theme = useMemo(() => createTheme({ palette: { mode: dark ? 'dark' : 'light' } }), [dark]);
    const isLarge = useMediaQuery(theme.breakpoints.up('md'));
    const [drawerOpen, setDrawerOpen] = useState(false);
    const drawerWidth = 360;

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
            };
        } catch (e) {
            return { examId: null, userId: null, sectionId: null };
        }
    }, []);

    // auth user for displaying in sub-header
    const { user, isAuthenticated } = useAuth();
    const displayName = user?.fullName || user?.name || user?.username || user?.email || 'User';
    const userInitial = String(displayName).charAt(0).toUpperCase();
    const roleName = user?.role || user?.roleName || user?.roles?.[0]?.name || '';

    useEffect(() => {
        const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    // load exam details and sections on mount; questions are loaded when sectionIndex changes
    useEffect(() => {
        let mounted = true;
        async function load() {
            setLoading(true);
            try {
                const userId = urlParams.userId || 1;
                const examId = urlParams.examId || 1;

                const examResp = await getUserExamDetails({ exam_id: examId, user_id: userId });
                if (!mounted) return;
                if (examResp?.error === false) {
                    setExam(examResp.response.exam || null);
                    if (Array.isArray(examResp.response.sections) && examResp.response.sections.length) {
                        setSections(examResp.response.sections || []);
                        const firstSectionId = examResp.response.sections[0].section_id;
                        // if sectionId present in URL use it (if it exists in sections), otherwise default to first
                        const urlSection = urlParams.sectionId;
                        const hasUrlSection = urlSection != null && examResp.response.sections.some((s) => s.section_id === urlSection);
                        setSectionIndex(hasUrlSection ? urlSection : firstSectionId);
                    }
                }
            } catch (err) {
                console.error(err);
                setError(err?.message || String(err));
            } finally {
                setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, []);

    // fetch questions whenever sectionIndex changes and update URL param
    useEffect(() => {
        if (!sectionIndex) return;
        let mounted = true;
        async function loadSectionQuestions() {
            setLoading(true);
            try {
                const userId = 1;
                const examId = 1;
                const attemptId = 1;

                const questionResp = await getExamQuestions({ exam_id: examId, user_id: userId, attempt_id: attemptId, section_id: sectionIndex });
                if (!mounted) return;
                if (questionResp?.error === false) {
                    const sectionQuestions = Array.isArray(questionResp?.response[0]?.questions) ? questionResp?.response[0]?.questions : [];
                    const flat = [];
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
                    });
                    setQuestions(flat || []);
                    // set current to the first question's id so questions[current] resolves
                    const firstQuestionId = sectionQuestions?.[0]?.question_id ?? 0;
                    setCurrent(firstQuestionId);
                    // ensure we have storage for this section (do not clear existing data)
                    setSelectedAnswers((prev) => ({ ...(prev || {}), [sectionIndex]: prev?.[sectionIndex] || {} }));
                    setMarked((prev) => ({ ...(prev || {}), [sectionIndex]: prev?.[sectionIndex] || new Set() }));
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

        loadSectionQuestions();
        return () => { mounted = false; };
    }, [sectionIndex]);

    const answeredSet = useMemo(() => new Set(Object.keys(selectedAnswers[sectionIndex] || {}).map((k) => Number(k) + 1)), [selectedAnswers, sectionIndex]);

    // Log answered set whenever it or the section changes
    useEffect(() => {
        try {
            console.log(`answeredSet (section ${sectionIndex}):`, Array.from(answeredSet));
        } catch (e) {
            console.log('answeredSet log error', e);
        }
    }, [answeredSet, sectionIndex]);

    // Log marked set whenever marked state or section changes
    useEffect(() => {
        try {
            const curMarked = getSetFrom(marked[sectionIndex]);
            console.log(`markedSet (section ${sectionIndex}):`, Array.from(curMarked));
        } catch (e) {
            console.log('markedSet log error', e);
        }
    }, [marked, sectionIndex]);
    function handleSelect(value) {
        setSelectedAnswers((prev) => {
            const bySection = { ...(prev || {}) };
            const sectionAnswers = { ...(bySection[sectionIndex] || {}) };
            sectionAnswers[current] = value;
            bySection[sectionIndex] = sectionAnswers;
            return bySection;
        });
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
        setMarked((prev) => {
            const bySection = { ...(prev || {}) };
            const curSet = getSetFrom(bySection[sectionIndex]);
            if (curSet.has(current + 1)) curSet.delete(current + 1);
            else curSet.add(current + 1);
            bySection[sectionIndex] = curSet;
            return bySection;
        });
    }

    function handleJump(index) {
        setCurrent(index);
    }

    function toggleFullscreen() {
        const el = document.documentElement;
        if (!document.fullscreenElement) el.requestFullscreen?.();
        else document.exitFullscreen?.();
    }

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
            <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
                {/* HEADER */}
                <ExamHeader
                    title=""
                    timeLeft={timeLeft}
                    language={language}
                    onLanguageChange={setLanguage}
                />

                {/* BODY */}
                <Box sx={{ flex: 1, display: "flex", overflow: "hidden" }}>
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
                            <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                                {sections.map((s) => {
                                    const active = s.section_id === sectionIndex;

                                    return (
                                        <Box
                                            key={s.section_id}
                                            onClick={() => setSectionIndex(s.section_id)}
                                            sx={{
                                                px: 2.5,
                                                py: 0.6,
                                                borderRadius: 5,
                                                cursor: "pointer",
                                                bgcolor: active ? "primary.main" : "#eef2f7",
                                                color: active ? "#fff" : "#333"
                                            }}
                                        >
                                            {s.display_name}
                                        </Box>
                                    );
                                })}
                            </Box>
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
                </Box>

                {/* FOOTER */}
                <Box
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
                    />
                </Box>
            </Box>
        </ThemeProvider>
    );
}
