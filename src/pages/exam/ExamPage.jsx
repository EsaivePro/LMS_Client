import React, { useEffect, useMemo, useState } from 'react';
import { Box, Grid, Container, CssBaseline, useTheme, createTheme, ThemeProvider, Button } from '@mui/material';
import ExamHeader from '../../components/exam/ExamHeader';
import QuestionCard from '../../components/exam/QuestionCard';
import ActionBar from '../../components/exam/ActionBar';
import SidebarPanel from '../../components/exam/SidebarPanel';
import QUESTIONS from './mockData';

export default function ExamPage() {
    const [current, setCurrent] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [marked, setMarked] = useState(new Set());
    const [dark, setDark] = useState(false);
    const [language, setLanguage] = useState('en');
    const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes default

    const theme = useMemo(() => createTheme({ palette: { mode: dark ? 'dark' : 'light' } }), [dark]);

    useEffect(() => {
        const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
        return () => clearInterval(t);
    }, []);

    const answeredSet = useMemo(() => new Set(Object.keys(selectedAnswers).map((k) => Number(k) + 1)), [selectedAnswers]);

    function handleSelect(value) {
        setSelectedAnswers((prev) => ({ ...prev, [current]: value }));
    }

    function handleSaveNext() {
        setCurrent((c) => Math.min(QUESTIONS.length - 1, c + 1));
    }

    function handleClear() {
        setSelectedAnswers((prev) => {
            const copy = { ...prev };
            delete copy[current];
            return copy;
        });
    }

    function handleMark() {
        setMarked((prev) => {
            const np = new Set(prev);
            if (np.has(current + 1)) np.delete(current + 1);
            else np.add(current + 1);
            return np;
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

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Box sx={{ maxHeight: '80vh', bgcolor: 'background.default' }}>
                <ExamHeader
                    title="Demo Exam"
                    timeLeft={timeLeft}
                    onToggleFullscreen={toggleFullscreen}
                    language={language}
                    onLanguageChange={setLanguage}
                    onToggleDark={() => setDark((d) => !d)}
                />

                <Container maxWidth="xl" sx={{ py: 3 }}>
                    <Box sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '3fr 1fr' },
                        gap: 3,
                        alignItems: 'start'
                    }}>
                        <Box sx={{ gridColumn: '1' }}>
                            <Box sx={{ mb: 2 }}>
                                <QuestionCard
                                    question={QUESTIONS[current]}
                                    questionIndex={current}
                                    selected={selectedAnswers[current]}
                                    onSelect={handleSelect}
                                />

                                <ActionBar onMark={handleMark} onClear={handleClear} onSaveNext={handleSaveNext} isMarked={marked.has(current + 1)} />
                            </Box>
                        </Box>

                        <Box sx={{ gridColumn: { xs: '1', md: '2' }, position: { xs: 'static', md: 'sticky' }, top: { md: 90 } }}>
                            <SidebarPanel
                                questions={QUESTIONS}
                                current={current}
                                answeredSet={answeredSet}
                                markedSet={marked}
                                onJump={handleJump}
                            />
                        </Box>
                    </Box>
                    <Box sx={{ mt: 2 }}>
                        <Button variant="outlined" sx={{ mb: 1 }}>Question Paper</Button>
                        <Button variant="outlined" sx={{ mb: 1 }}>Instructions</Button>
                        <Button variant="contained" color="primary">Submit Test</Button>
                    </Box>
                </Container>
            </Box>
        </ThemeProvider>
    );
}
