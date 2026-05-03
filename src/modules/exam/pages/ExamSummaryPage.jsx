import React, { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import {
    Box, Typography, Card, CardContent, Chip, Divider, Button, Tooltip,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    Grid, LinearProgress, Backdrop, CircularProgress,
    Dialog, DialogTitle, DialogContent, DialogActions, IconButton
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GppGoodOutlinedIcon from '@mui/icons-material/GppGoodOutlined';
import ListAltOutlinedIcon from '@mui/icons-material/ListAltOutlined';
import CloseIcon from '@mui/icons-material/Close';
import RemoveRedEyeOutlinedIcon from '@mui/icons-material/RemoveRedEyeOutlined';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import RepeatIcon from '@mui/icons-material/Repeat';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsOutlinedIcon from '@mui/icons-material/EmojiEventsOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { getUserExamDetails } from '../../../components/exam/handlers/Handler';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import useCommon from '../../../hooks/useCommon';
import { useAuth } from '../../../hooks/useAuth';

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtDate(iso) {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtDateTime(iso) {
    if (!iso) return '—';
    const d = new Date(iso);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
        + '  ' + d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function fmtHHMMSS(minutes) {
    if (!minutes && minutes !== 0) return '—';
    const total = minutes * 60;
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

function fmtDuration(seconds) {
    if (!seconds) return '—';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m} min`;
    return `${s}s`;
}

const STATUS_META = {
    not_started: { label: 'Not Started', bg: '#f3f4f6', color: '#6b7280', tooltip: 'You have not started this attempt yet.' },
    inprogress: { label: 'In Progress', bg: '#fff8e1', color: '#b45309', tooltip: 'This attempt is currently ongoing.' },
    submitted: { label: 'Submitted', bg: '#e0f2fe', color: '#0369a1', tooltip: 'Answers submitted, awaiting evaluation.' },
    completed: { label: 'Completed', bg: '#dcfce7', color: '#166534', tooltip: 'Attempt fully completed and evaluated.' },
    expired: { label: 'Expired', bg: '#fee2e2', color: '#b91c1c', tooltip: 'This attempt expired before submission.' },
};

// ── Stat Box (top exam card) ──────────────────────────────────────────────────

function StatBox({ icon, label, sub, tooltip }) {
    return (
        <Tooltip title={tooltip || ''} arrow placement="top">
            <Box sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                border: '1px solid #e8ecf0', borderRadius: 2,
                px: 2, py: 1.2, bgcolor: '#fff', cursor: 'default', width: '100%',
                '&:hover': { borderColor: '#c7d2fe', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
                transition: 'border-color 0.15s, box-shadow 0.15s',
            }}>
                <Box sx={{ color: '#6b7280', flexShrink: 0 }}>{icon}</Box>
                <Box>
                    <Typography fontWeight={700} fontSize="1.125rem" lineHeight={1.3}>{label}</Typography>
                    <Typography fontSize="0.95rem" color="text.secondary">{sub}</Typography>
                </Box>
            </Box>
        </Tooltip>
    );
}

// ── Attempt dots ──────────────────────────────────────────────────────────────

function AttemptDots({ total, used }) {
    if (!total || total > 20) return null;
    return (
        <Box sx={{ display: 'flex', gap: 0.5, flexShrink: 0 }}>
            {Array.from({ length: total }).map((_, i) => (
                <Tooltip key={i} title={i < used ? `Attempt ${i + 1}: Used` : `Attempt ${i + 1}: Available`} arrow>
                    <Box sx={{
                        width: 14, height: 14, borderRadius: '50%',
                        bgcolor: i < used ? '#43a047' : '#e0e0e0',
                        border: i < used ? 'none' : '2px solid #bdbdbd',
                        cursor: 'default',
                    }} />
                </Tooltip>
            ))}
        </Box>
    );
}

// ── Schedule Info Item ─────────────────────────────────────────────────────────

function ScheduleItem({ icon, label, value, tooltip }) {
    return (
        <Grid item xs={6} sm={3}>
            <Tooltip title={tooltip || ''} arrow placement="top">
                <Box sx={{ cursor: 'default' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.6, mb: 0.3 }}>
                        <Box sx={{ color: '#9ca3af', display: 'flex', alignItems: 'center' }}>{icon}</Box>
                        <Typography fontSize="0.95rem" color="text.secondary">{label}</Typography>
                    </Box>
                    <Typography fontWeight={600} fontSize="1.125rem">{value}</Typography>
                </Box>
            </Tooltip>
        </Grid>
    );
}

// ── Timeline Dialog ───────────────────────────────────────────────────────────

function TimelineEvent({ icon, iconBg, title, subtitle, isLast }) {
    return (
        <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Box sx={{
                    width: 34, height: 34, borderRadius: '50%',
                    bgcolor: iconBg, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', flexShrink: 0, zIndex: 1
                }}>
                    {icon}
                </Box>
                {!isLast && (
                    <Box sx={{ width: 2, flex: 1, bgcolor: '#e5e7eb', minHeight: 28, my: 0.4 }} />
                )}
            </Box>
            <Box sx={{ pb: isLast ? 0 : 2.5, pt: 0.4 }}>
                <Typography fontWeight={700} fontSize="1.125rem">{title}</Typography>
                {subtitle && (
                    <Typography fontSize="0.95rem" color="text.secondary">{subtitle}</Typography>
                )}
            </Box>
        </Box>
    );
}

function AttemptTimelineDialog({ open, onClose, attempt, totalMarks }) {
    if (!attempt) return null;

    const isDone = ['completed', 'submitted'].includes(attempt.status);
    const passed = attempt.is_passed;

    const events = [
        {
            iconBg: '#eff6ff',
            icon: <FiberManualRecordIcon sx={{ fontSize: 12, color: '#3b82f6' }} />,
            title: `Attempt #${attempt.attempt_no} Created`,
            subtitle: attempt.started_at ? fmtDateTime(attempt.started_at) : 'Not yet started',
        },
        attempt.started_at && {
            iconBg: '#fff8e1',
            icon: <AccessTimeIcon sx={{ fontSize: 17, color: '#f59e0b' }} />,
            title: 'Exam Started',
            subtitle: fmtDateTime(attempt.started_at),
        },
        isDone && {
            iconBg: passed ? '#dcfce7' : '#fee2e2',
            icon: passed
                ? <CheckCircleIcon sx={{ fontSize: 17, color: '#16a34a' }} />
                : <CancelIcon sx={{ fontSize: 17, color: '#dc2626' }} />,
            title: passed ? 'Completed — Passed' : 'Submitted — Failed',
            subtitle: attempt.submitted_at ? fmtDateTime(attempt.submitted_at) : '—',
        },
        isDone && attempt.marks_obtained != null && {
            iconBg: '#f5f3ff',
            icon: <EmojiEventsOutlinedIcon sx={{ fontSize: 17, color: '#7c3aed' }} />,
            title: `Score: ${attempt.marks_obtained} / ${totalMarks}`,
            subtitle: `Time spent: ${fmtDuration(attempt.time_spent_seconds)}`,
        },
    ].filter(Boolean);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                <Box>
                    <Typography fontWeight={700} fontSize="1.25rem">Attempt #{attempt.attempt_no} — Timeline</Typography>
                    <Typography fontSize="0.95rem" color="text.secondary">
                        {fmtDate(attempt.started_at || attempt.submitted_at)}
                    </Typography>
                </Box>
                <Tooltip title="Close" arrow>
                    <IconButton size="small" onClick={onClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </DialogTitle>
            <Divider />
            <DialogContent sx={{ pt: 2.5 }}>
                {events.map((ev, idx) => (
                    <TimelineEvent
                        key={idx}
                        icon={ev.icon}
                        iconBg={ev.iconBg}
                        title={ev.title}
                        subtitle={ev.subtitle}
                        isLast={idx === events.length - 1}
                    />
                ))}
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" size="small" sx={{ borderRadius: 2, fontSize: '1rem' }}>
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function ExamSummaryPage() {
    const { examid } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();

    const { user } = useAuth();
    const userId = user?.id ?? user?.user_id ?? user?.userId;
    const attemptId = searchParams.get('attemptid');

    const { showLoader, hideLoader, showError } = useCommon();

    const [examData, setExamData] = useState(null);
    const [viewAttempt, setViewAttempt] = useState(null);
    const [startConfirmOpen, setStartConfirmOpen] = useState(false);
    const [examApi, setExamApi] = useState(false);
    const [examLive, setExamLive] = useState(false);
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const childWindowRef = useRef(null);
    const pollRef = useRef(null);
    const onUnloadRef = useRef(null);

    function closeChildIfOpen() {
        if (childWindowRef.current && !childWindowRef.current.closed) {
            childWindowRef.current.close();
        }
    }

    function reloadExamData() {
        if (pollRef.current) {
            clearInterval(pollRef.current);
            pollRef.current = null;
        }
        if (onUnloadRef.current) {
            window.removeEventListener('beforeunload', onUnloadRef.current);
            onUnloadRef.current = null;
        }
        setExamApi(false);
        setExamLive(false);
        setReloadTrigger(t => t + 1);
    }

    useEffect(() => {
        function handleMessage(event) {
            if (event.origin !== window.location.origin) return;
            if (event.data?.type === 'EXAM_COMPLETED') {
                reloadExamData();
            }
        }
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // Close child window when navigating away from this page (SPA route change)
    useEffect(() => {
        return () => {
            closeChildIfOpen();
            if (pollRef.current) clearInterval(pollRef.current);
            if (onUnloadRef.current) window.removeEventListener('beforeunload', onUnloadRef.current);
        };
    }, []);

    useEffect(() => {
        async function load() {
            setExamApi(true);
            if (!examid || !userId) {
                showError('Missing exam or user information.');
                return;
            }
            try {
                showLoader('Loading exam summary…');
                const resp = await getUserExamDetails({ exam_id: Number(examid), user_id: Number(userId) });
                if (resp?.error === false) {
                    setExamData(resp.response);
                } else {
                    showError('Failed to load exam details.');
                }
            } catch {
                // error already dispatched by Handler
            } finally {
                hideLoader();
            }
        }
        if (examApi === false) {
            load();
        }
    }, [examid, userId, reloadTrigger]);

    if (!examData) return null;

    const { exam, sections, schedules, user_attempts } = examData;
    const schedule = schedules?.[0];
    const maxAttempts = schedule?.max_attempts ?? null;

    const completedAttempts = user_attempts?.filter(a =>
        ['submitted', 'completed'].includes(a.status)
    ).length ?? 0;

    const remainingAttempts = typeof maxAttempts === 'number'
        ? Math.max(0, maxAttempts - completedAttempts)
        : null;

    const attemptsBarPct = maxAttempts
        ? Math.min(100, (completedAttempts / maxAttempts) * 100)
        : 0;

    const inProgressAttempt = user_attempts?.find(a => a.status === 'inprogress' || a.status === 'in_progress');
    const notStartedAttempt = user_attempts?.find(a => a.status === 'not_started');
    const activeAttempt = inProgressAttempt || notStartedAttempt;
    const canStart = !!activeAttempt;
    const isResume = !!inProgressAttempt;
    const isNextAttempt = !inProgressAttempt && !!notStartedAttempt && completedAttempts > 0;

    function openExamWindow(attemptId) {
        const url = `${window.location.origin}/exam/${examid}/user/${userId}?attemptid=${attemptId}`;
        const w = screen.availWidth;
        const h = screen.availHeight;
        const features = `width=${w},height=${h},left=0,top=0,resizable=yes,scrollbars=yes,toolbar=no,menubar=no,location=no,status=no`;
        const child = window.open(url, `exam_${examid}_${attemptId}`, features);
        if (child) {
            child.moveTo(0, 0);
            child.resizeTo(w, h);
        }
        if (!child) {
            // Popup was blocked — fall back to same-tab navigation
            navigate(`/exam/${examid}/user/${userId}?attemptid=${attemptId}`);
            return;
        }
        childWindowRef.current = child;
        setExamLive(true);

        // Close child when parent browser tab/window is closed
        const onUnload = () => closeChildIfOpen();
        onUnloadRef.current = onUnload;
        window.addEventListener('beforeunload', onUnload);

        // Poll until child is closed, then reload exam data
        pollRef.current = setInterval(() => {
            if (child.closed) {
                reloadExamData();
            }
        }, 500);
    }

    function handleStartExam() {
        if (!activeAttempt) return;
        if (isResume) {
            openExamWindow(activeAttempt.attempt_id);
        } else {
            setStartConfirmOpen(true);
        }
    }

    function handleConfirmStart() {
        setStartConfirmOpen(false);
        openExamWindow(activeAttempt.attempt_id);
    }

    const totalQuestions = sections?.reduce((s, x) => s + (x.question_count || 0), 0) ?? 0;

    return (
        <Box sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 2, sm: 3, md: 4 } }}>

            {/* ── Exam-live backdrop ── */}
            <Backdrop
                open={examLive}
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 100, flexDirection: 'column', gap: 3, bgcolor: 'rgba(15,23,42,0.82)' }}
            >
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2.5 }}>
                    {/* Pulsing live ring */}
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                        <CircularProgress size={80} thickness={2} sx={{ color: '#4F46E5', opacity: 0.25, position: 'absolute', top: 0, left: 0 }} variant="determinate" value={100} />
                        <CircularProgress size={80} thickness={2.5} sx={{ color: '#4F46E5', animationDuration: '1.8s' }} />
                        <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <SecurityIcon sx={{ fontSize: 32, color: '#fff' }} />
                        </Box>
                    </Box>

                    <Box sx={{ textAlign: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 0.75 }}>
                            <FiberManualRecordIcon sx={{ fontSize: 10, color: '#ef4444', animation: 'pulse 1.2s ease-in-out infinite', '@keyframes pulse': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.3 } } }} />
                            <Typography fontWeight={700} fontSize="0.78rem" letterSpacing="0.12em" sx={{ color: '#ef4444', textTransform: 'uppercase' }}>
                                Live
                            </Typography>
                        </Box>
                        <Typography fontWeight={800} fontSize="1.5rem" sx={{ color: '#fff', lineHeight: 1.2 }}>
                            Exam in Progress
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#94a3b8', mt: 0.75 }}>
                            {exam?.display_name || exam?.title}
                        </Typography>
                    </Box>

                    <Button
                        variant="outlined"
                        onClick={() => {
                            if (childWindowRef.current && !childWindowRef.current.closed) {
                                childWindowRef.current.focus();
                            }
                        }}
                        sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', textTransform: 'none', fontWeight: 600, '&:hover': { borderColor: '#fff', bgcolor: 'rgba(255,255,255,0.08)' } }}
                    >
                        Return to exam window
                    </Button>
                </Box>
            </Backdrop>

            {/* ── 1. Exam Info Card ─────────────────────────────────────── */}
            <Card sx={{ mb: 2.5, borderRadius: 2.5, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box sx={{
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        alignItems: { xs: 'stretch', md: 'flex-start' },
                        gap: { xs: 2.5, md: 3 },
                    }}>

                        {/* ── Left: exam info ── */}
                        <Box sx={{ flex: 1, minWidth: 0 }}>

                            {/* Title row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.75, flexWrap: 'wrap' }}>
                                <Typography fontWeight={800} fontSize={{ xs: '1.4rem', sm: '1.75rem' }} lineHeight={1.2}>
                                    {exam?.display_name || exam?.title}
                                </Typography>
                                {exam?.is_active && (
                                    <Tooltip title="This exam is currently active and accepting submissions" arrow>
                                        <Chip label="Available" size="small"
                                            sx={{ bgcolor: '#dcfce7', color: '#166534', fontWeight: 700, fontSize: '0.8rem', cursor: 'default' }} />
                                    </Tooltip>
                                )}
                            </Box>

                            {/* Subtitle row */}
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5, flexWrap: 'wrap' }}>
                                <Tooltip title="Exam title" arrow>
                                    <CheckCircleIcon sx={{ fontSize: 17, color: '#43a047', cursor: 'default', flexShrink: 0 }} />
                                </Tooltip>
                                <Typography fontSize="1rem" fontWeight={600}>{exam?.title}</Typography>
                                {maxAttempts && (
                                    <>
                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#d1d5db', flexShrink: 0 }} />
                                        <Tooltip title="Total attempts allowed for this exam" arrow>
                                            <Typography fontSize="1rem" color="text.secondary" sx={{ cursor: 'default' }}>
                                                {maxAttempts} Attempts
                                            </Typography>
                                        </Tooltip>
                                    </>
                                )}
                                {exam?.duration && (
                                    <>
                                        <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: '#d1d5db', flexShrink: 0 }} />
                                        <Tooltip title="Total allowed duration per attempt" arrow>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.4, cursor: 'default' }}>
                                                <AccessTimeIcon sx={{ fontSize: 15, color: '#6b7280' }} />
                                                <Typography fontSize="1rem" color="text.secondary">{exam.duration} min</Typography>
                                            </Box>
                                        </Tooltip>
                                    </>
                                )}
                            </Box>

                            {/* Stat boxes — 3 equal columns, wrap on small screens */}
                            <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
                                {[
                                    {
                                        icon: <ListAltOutlinedIcon fontSize="small" />,
                                        label: `${sections?.length ?? 0} Sections`,
                                        sub: `${totalQuestions} total questions`,
                                        tooltip: `${sections?.length ?? 0} section(s) with ${totalQuestions} question(s)`,
                                    },
                                    {
                                        icon: <GppGoodOutlinedIcon fontSize="small" />,
                                        label: `${exam?.total_marks ?? '—'} Marks`,
                                        sub: 'Total marks',
                                        tooltip: 'Maximum marks achievable in this exam',
                                    },
                                    {
                                        icon: <TimelapseIcon fontSize="small" />,
                                        label: fmtHHMMSS(exam?.duration),
                                        sub: 'Total Duration',
                                        tooltip: `Duration: ${fmtHHMMSS(exam?.duration)} (HH:MM:SS)`,
                                    },
                                ].map((s, i) => (
                                    <Box key={i} sx={{ flex: '1 1 140px' }}>
                                        <StatBox icon={s.icon} label={s.label} sub={s.sub} tooltip={s.tooltip} />
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* ── Right: start button + status card ── */}
                        {(() => {
                            let bg, border, icon, textColor, msg;
                            if (isResume) {
                                bg = '#fff8e1'; border = '#fcd34d';
                                icon = <AccessTimeIcon sx={{ fontSize: 14, color: '#b45309' }} />;
                                textColor = '#92400e';
                                msg = `Attempt #${inProgressAttempt?.attempt_no} is in progress — resume where you left off`;
                            } else if (isNextAttempt) {
                                bg = '#eff6ff'; border = '#93c5fd';
                                icon = <PlayArrowIcon sx={{ fontSize: 14, color: '#1d4ed8' }} />;
                                textColor = '#1e40af';
                                msg = `Attempt #${notStartedAttempt?.attempt_no} is ready — start your next attempt`;
                            } else if (canStart) {
                                bg = '#fffbeb'; border = '#fcd34d';
                                icon = <CheckCircleIcon sx={{ fontSize: 14, color: '#d97706' }} />;
                                textColor = '#92400e';
                                msg = `Attempt #${notStartedAttempt?.attempt_no} is ready to start`;
                            } else if (remainingAttempts === 0) {
                                bg = '#fee2e2'; border = '#fca5a5';
                                icon = <CancelIcon sx={{ fontSize: 14, color: '#dc2626' }} />;
                                textColor = '#b91c1c';
                                msg = 'All attempts have been used';
                            } else {
                                bg = '#f3f4f6'; border = '#e5e7eb';
                                icon = <HourglassEmptyIcon sx={{ fontSize: 14, color: '#9ca3af' }} />;
                                textColor = '#6b7280';
                                msg = 'No attempts available';
                            }
                            return (
                                <Box sx={{
                                    display: 'flex', flexDirection: 'column', gap: 1,
                                    flexShrink: 0,
                                    width: { xs: '100%', md: '230px' },
                                    alignItems: 'stretch',
                                }}>
                                    <Button
                                        startIcon={<PlayArrowIcon />}
                                        onClick={handleStartExam}
                                        disabled={!canStart}
                                        fullWidth
                                        sx={{
                                            bgcolor: 'var(--darkMedium)', color: '#fff', fontWeight: 800,
                                            fontSize: '1rem', px: 2, py: 1.4, borderRadius: 2,
                                            boxShadow: 'none',
                                            '&:hover': { bgcolor: 'var(--primary)', boxShadow: 'none' },
                                            '&.Mui-disabled': { bgcolor: '#e5e7eb', color: '#9ca3af' }
                                        }}
                                    >
                                        {isResume
                                            ? `Resume Attempt #${inProgressAttempt?.attempt_no}`
                                            : isNextAttempt
                                                ? `Start Attempt #${notStartedAttempt?.attempt_no}`
                                                : canStart ? 'Start Exam' : 'No Attempts'}
                                    </Button>

                                    {/* Tooltip-style status card with upward arrow */}
                                    <Box sx={{ position: 'relative', mt: 0.5 }}>
                                        <Box sx={{
                                            position: 'absolute', top: -8, left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 0, height: 0,
                                            borderLeft: '8px solid transparent',
                                            borderRight: '8px solid transparent',
                                            borderBottom: `8px solid ${border}`,
                                        }} />
                                        <Box sx={{
                                            position: 'absolute', top: -6, left: '50%',
                                            transform: 'translateX(-50%)',
                                            width: 0, height: 0,
                                            borderLeft: '7px solid transparent',
                                            borderRight: '7px solid transparent',
                                            borderBottom: `7px solid ${bg}`,
                                        }} />
                                        <Box sx={{
                                            display: 'flex', alignItems: 'flex-start', gap: 0.8,
                                            px: 1.5, py: 1, borderRadius: 2,
                                            bgcolor: bg, border: `1px solid ${border}`,
                                            boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                                        }}>
                                            <Box sx={{ mt: '1px', flexShrink: 0 }}>{icon}</Box>
                                            <Typography fontSize="0.8rem" fontWeight={600} color={textColor} lineHeight={1.4}>
                                                {msg}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            );
                        })()}
                    </Box>
                </CardContent>
            </Card>

            {/* ── 2. Attempt Summary Card ───────────────────────────────── */}
            <Card sx={{ borderRadius: 2.5, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 } }}>

                    {/* Header row */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography fontWeight={700} fontSize="1.35rem">Attempt Summary</Typography>
                            <Tooltip title="Overview of your attempts and remaining chances for this exam" arrow>
                                <InfoOutlinedIcon sx={{ fontSize: 18, color: '#9ca3af', cursor: 'default' }} />
                            </Tooltip>
                        </Box>

                        {/* Big counter */}
                        <Tooltip title={`${completedAttempts} attempt(s) used out of ${maxAttempts ?? '—'} allowed`} arrow>
                            <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, cursor: 'default' }}>
                                <Typography fontSize="2rem" fontWeight={800} lineHeight={1}>
                                    {completedAttempts}
                                </Typography>
                                <Typography fontSize="1.125rem" color="text.secondary">/ {maxAttempts ?? '—'}</Typography>
                                {remainingAttempts !== null && (
                                    <Typography fontSize="1.125rem" fontWeight={700}
                                        color={remainingAttempts === 0 ? '#dc2626' : '#16a34a'} ml={0.5}>
                                        · {remainingAttempts} Left
                                    </Typography>
                                )}
                            </Box>
                        </Tooltip>
                    </Box>

                    {/* Progress bar + dots */}
                    <Tooltip
                        title={maxAttempts
                            ? `${completedAttempts} of ${maxAttempts} attempts used (${Math.round(attemptsBarPct)}%)`
                            : 'Attempt usage progress'}
                        arrow placement="top"
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5, cursor: 'default' }}>
                            <Box sx={{ flex: 1 }}>
                                <LinearProgress
                                    variant="determinate"
                                    value={attemptsBarPct}
                                    sx={{
                                        height: 10, borderRadius: 5, bgcolor: '#e5e7eb',
                                        '& .MuiLinearProgress-bar': {
                                            bgcolor: attemptsBarPct >= 100 ? '#dc2626' : '#43a047',
                                            borderRadius: 5
                                        }
                                    }}
                                />
                            </Box>
                            <AttemptDots total={maxAttempts} used={completedAttempts} />
                        </Box>
                    </Tooltip>

                    {/* Schedule info row */}
                    {schedule && (
                        <Grid container spacing={2} mb={2.5}>
                            <ScheduleItem
                                icon={<CalendarTodayIcon sx={{ fontSize: 14 }} />}
                                label="Schedule Start"
                                value={fmtDate(schedule.start_time)}
                                tooltip={`Exam window opens: ${fmtDateTime(schedule.start_time)}`}
                            />
                            <ScheduleItem
                                icon={<EventBusyIcon sx={{ fontSize: 14 }} />}
                                label="Schedule End"
                                value={fmtDate(schedule.end_time)}
                                tooltip={`Exam window closes: ${fmtDateTime(schedule.end_time)}`}
                            />
                            <ScheduleItem
                                icon={<RepeatIcon sx={{ fontSize: 14 }} />}
                                label="Max Attempts"
                                value={maxAttempts ?? '—'}
                                tooltip="Maximum number of attempts allowed per user"
                            />
                            <ScheduleItem
                                icon={<SecurityIcon sx={{ fontSize: 14 }} />}
                                label="Proctored"
                                value={schedule.is_proctored ? 'Yes' : 'No'}
                                tooltip={schedule.is_proctored
                                    ? 'This exam is proctored — your session may be monitored'
                                    : 'This exam is not proctored'}
                            />
                        </Grid>
                    )}

                    <Divider sx={{ mb: 2 }} />
                    <Typography fontWeight={700} fontSize="1.2rem" mb={1.5}>Attempt History</Typography>

                    {/* Enhanced Table */}
                    {user_attempts?.length > 0 ? (
                        <TableContainer sx={{
                            borderRadius: 2, border: '1px solid #e5e7eb',
                            '& .MuiTableCell-root': { borderColor: '#f0f0f0' }
                        }}>
                            <Table size="small">
                                <TableHead>
                                    <TableRow sx={{ bgcolor: '#f8fafc' }}>
                                        {[
                                            { label: 'Attempt', tip: 'Attempt number' },
                                            { label: 'Status', tip: 'Current status of the attempt' },
                                            { label: 'Started At', tip: 'Date and time the attempt was started' },
                                            { label: 'Submitted At', tip: 'Date and time the attempt was submitted' },
                                            { label: 'Marks', tip: 'Marks obtained out of total marks' },
                                            { label: 'Time Spent', tip: 'Total time spent on this attempt' },
                                            { label: 'Result', tip: 'Pass or fail result for this attempt' },
                                            { label: '', tip: '' },
                                        ].map(({ label, tip }) => (
                                            <TableCell key={label}
                                                sx={{ fontWeight: 700, fontSize: '1rem', color: '#374151', whiteSpace: 'nowrap', py: 1.4 }}>
                                                {tip ? (
                                                    <Tooltip title={tip} arrow>
                                                        <span style={{ cursor: 'default' }}>{label}</span>
                                                    </Tooltip>
                                                ) : label}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {user_attempts.map((attempt) => {
                                        const meta = STATUS_META[attempt.status] || { label: attempt.status, bg: '#f3f4f6', color: '#6b7280', tooltip: '' };
                                        const isCurrentRow = String(attempt.attempt_id) === String(attemptId);
                                        const passed = attempt.is_passed;

                                        return (
                                            <TableRow key={attempt.attempt_id}
                                                sx={{
                                                    bgcolor: isCurrentRow ? '#fffbeb' : 'inherit',
                                                    borderLeft: isCurrentRow ? '3px solid #f59e0b' : '3px solid transparent',
                                                    '&:hover': { bgcolor: isCurrentRow ? '#fef3c7' : '#f9fafb' },
                                                    transition: 'background 0.15s'
                                                }}>

                                                {/* Attempt # */}
                                                <TableCell sx={{ py: 1.5 }}>
                                                    <Typography fontWeight={700} fontSize="1.125rem">
                                                        #{attempt.attempt_no}
                                                    </Typography>
                                                    {isCurrentRow && (
                                                        <Tooltip title="This is the attempt you just completed or are viewing" arrow>
                                                            <Typography fontSize="0.9rem"
                                                                sx={{ color: '#d97706', fontWeight: 600, cursor: 'default' }}>
                                                                Current
                                                            </Typography>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>

                                                {/* Status */}
                                                <TableCell>
                                                    <Tooltip title={meta.tooltip || meta.label} arrow>
                                                        <Box sx={{
                                                            display: 'inline-flex', px: 1.2, py: 0.3,
                                                            borderRadius: 5, bgcolor: meta.bg, cursor: 'default',
                                                        }}>
                                                            <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: meta.color }}>
                                                                {meta.label}
                                                            </Typography>
                                                        </Box>
                                                    </Tooltip>
                                                </TableCell>

                                                {/* Started At */}
                                                <TableCell>
                                                    <Tooltip title={attempt.started_at ? `Started: ${fmtDateTime(attempt.started_at)}` : 'Not yet started'} arrow>
                                                        <Typography fontSize="1rem" sx={{ cursor: 'default' }}>
                                                            {fmtDateTime(attempt.started_at)}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>

                                                {/* Submitted At */}
                                                <TableCell>
                                                    <Tooltip title={attempt.submitted_at ? `Submitted: ${fmtDateTime(attempt.submitted_at)}` : 'Not yet submitted'} arrow>
                                                        <Typography fontSize="1rem" sx={{ cursor: 'default' }}>
                                                            {fmtDateTime(attempt.submitted_at)}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>

                                                {/* Marks */}
                                                <TableCell>
                                                    {attempt.marks_obtained != null ? (
                                                        <Tooltip title={`Scored ${attempt.marks_obtained} out of ${exam?.total_marks} total marks`} arrow>
                                                            <Typography fontSize="1.125rem" fontWeight={600} sx={{ cursor: 'default' }}>
                                                                {attempt.marks_obtained} / {exam?.total_marks}
                                                            </Typography>
                                                        </Tooltip>
                                                    ) : (
                                                        <Tooltip title="Marks not yet evaluated" arrow>
                                                            <Typography fontSize="1.125rem" color="text.disabled" sx={{ cursor: 'default' }}>—</Typography>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>

                                                {/* Time Spent */}
                                                <TableCell>
                                                    <Tooltip title={attempt.time_spent_seconds ? `Total time: ${fmtDuration(attempt.time_spent_seconds)}` : 'Duration not recorded'} arrow>
                                                        <Typography fontSize="1rem" sx={{ cursor: 'default' }}>
                                                            {fmtDuration(attempt.time_spent_seconds)}
                                                        </Typography>
                                                    </Tooltip>
                                                </TableCell>

                                                {/* Result */}
                                                <TableCell>
                                                    {passed === true && (
                                                        <Tooltip title={`Passed with ${attempt.marks_obtained} marks`} arrow>
                                                            <Box sx={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                                px: 1.2, py: 0.3, borderRadius: 5, bgcolor: '#dcfce7', cursor: 'default'
                                                            }}>
                                                                <CheckCircleIcon sx={{ fontSize: 14, color: '#16a34a' }} />
                                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#166534' }}>Passed</Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                    {passed === false && (
                                                        <Tooltip title={`Failed — scored ${attempt.marks_obtained ?? '—'}, required ${exam?.passing_marks ?? '—'}`} arrow>
                                                            <Box sx={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                                px: 1.2, py: 0.3, borderRadius: 5, bgcolor: '#fee2e2', cursor: 'default'
                                                            }}>
                                                                <CancelIcon sx={{ fontSize: 14, color: '#dc2626' }} />
                                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#b91c1c' }}>Failed</Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                    {passed === null && (
                                                        <Tooltip title="Result is pending evaluation" arrow>
                                                            <Box sx={{
                                                                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                                                                px: 1.2, py: 0.3, borderRadius: 5, bgcolor: '#f3f4f6', cursor: 'default'
                                                            }}>
                                                                <HourglassEmptyIcon sx={{ fontSize: 14, color: '#9ca3af' }} />
                                                                <Typography sx={{ fontSize: '0.9rem', fontWeight: 700, color: '#6b7280' }}>Pending</Typography>
                                                            </Box>
                                                        </Tooltip>
                                                    )}
                                                </TableCell>

                                                {/* View button */}
                                                <TableCell align="right" sx={{ pr: 1.5 }}>
                                                    <Tooltip title="View the timeline of this attempt" arrow>
                                                        <Button
                                                            size="small"
                                                            variant="outlined"
                                                            startIcon={<RemoveRedEyeOutlinedIcon sx={{ fontSize: '16px !important' }} />}
                                                            onClick={() => setViewAttempt(attempt)}
                                                            sx={{
                                                                borderRadius: 2, fontSize: '0.9rem',
                                                                py: 0.5, px: 1.4, whiteSpace: 'nowrap',
                                                                borderColor: '#d1d5db', color: '#374151',
                                                                '&:hover': { borderColor: '#1976d2', color: '#1976d2', bgcolor: '#eff6ff' }
                                                            }}
                                                        >
                                                            View
                                                        </Button>
                                                    </Tooltip>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    ) : (
                        <Box sx={{ py: 4, textAlign: 'center' }}>
                            <HourglassEmptyIcon sx={{ fontSize: 36, color: '#d1d5db', mb: 1 }} />
                            <Typography color="text.secondary" fontSize="1.125rem">No attempts yet.</Typography>
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* ── Timeline Dialog ───────────────────────────────────────── */}
            <AttemptTimelineDialog
                open={!!viewAttempt}
                onClose={() => setViewAttempt(null)}
                attempt={viewAttempt}
                totalMarks={exam?.total_marks}
            />

            {/* ── Start Exam Confirmation Dialog ────────────────────────── */}
            <Dialog
                open={startConfirmOpen}
                onClose={() => setStartConfirmOpen(false)}
                maxWidth="xs" fullWidth
                slotProps={{ paper: { sx: { borderRadius: 3 } } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pb: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <PlayArrowIcon sx={{ color: 'var(--darkMedium)', fontSize: 22 }} />
                        <Typography fontWeight={700} fontSize="1.15rem">
                            {isNextAttempt ? 'Start Next Attempt?' : 'Start Exam?'}
                        </Typography>
                    </Box>
                    <IconButton size="small" onClick={() => setStartConfirmOpen(false)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </DialogTitle>

                <Divider />

                <DialogContent sx={{ pt: 2 }}>
                    {/* Attempt details */}
                    <Box sx={{ bgcolor: '#f8fafc', borderRadius: 2, p: 2, mb: 2, border: '1px solid #e5e7eb' }}>
                        <Typography fontSize="0.78rem" color="text.secondary" fontWeight={600} mb={1} textTransform="uppercase" letterSpacing={0.5}>
                            Attempt Details
                        </Typography>
                        {[
                            { label: 'Attempt No.', value: `#${notStartedAttempt?.attempt_no}` },
                            { label: 'Total Marks', value: exam?.total_marks ?? '—' },
                            // { label: 'Passing Marks', value: exam?.passing_marks ?? '—' },
                            { label: 'Duration', value: fmtHHMMSS(exam?.duration) },
                            { label: 'Attempts Used', value: `${completedAttempts} of ${maxAttempts ?? '—'}` },
                            { label: 'Remaining', value: remainingAttempts !== null ? `${remainingAttempts} left` : '—' },
                        ].map(({ label, value }) => (
                            <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 0.5 }}>
                                <Typography fontSize="0.875rem" color="text.secondary">{label}</Typography>
                                <Typography fontSize="0.875rem" fontWeight={600}>{value}</Typography>
                            </Box>
                        ))}
                    </Box>

                    <Typography fontSize="0.875rem" color="text.secondary">
                        Once started, the timer will begin immediately. Make sure you are ready before proceeding.
                    </Typography>
                </DialogContent>

                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button
                        onClick={() => setStartConfirmOpen(false)}
                        variant="outlined"
                        sx={{ borderRadius: 2, flex: 1 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmStart}
                        variant="contained"
                        startIcon={<PlayArrowIcon />}
                        sx={{
                            borderRadius: 2, flex: 1,
                            bgcolor: 'var(--darkMedium)',
                            '&:hover': { bgcolor: 'var(--primary)' }
                        }}
                    >
                        Yes, Start
                    </Button>
                </DialogActions>
            </Dialog>

        </Box>
    );
}
