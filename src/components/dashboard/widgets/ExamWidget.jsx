import React, { useMemo, useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    Chip,
    LinearProgress,
    Tabs,
    Tab,
} from "@mui/material";
import { keyframes } from "@mui/system";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CodeIcon from "@mui/icons-material/Code";
import StorageIcon from "@mui/icons-material/Storage";
import BrushIcon from "@mui/icons-material/Brush";
import { useNavigate } from "react-router-dom";
import useDashboard from "../../../hooks/useDashboard";
import THEME from "../../../constants/theme";

const { colors, shadows, radius } = THEME;

/* ─── animations ─────────────────────────────────────────────────────────── */
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to   { opacity: 1; transform: translateY(0); }
`;

/* ─── exam status helper ──────────────────────────────────────────────────── */
function getExamStatus(raw) {
    const s = raw ? String(raw).toLowerCase() : "";
    if (s === "completed") return { label: "Completed", color: colors.accent, bg: colors.accentLight, tab: "completed" };
    if (s === "ongoing" || s === "inprogress" || s === "active") return { label: "Ongoing", color: colors.primary, bg: colors.primaryLight, tab: "ongoing" };
    return { label: "Upcoming", color: colors.warning, bg: "#FEF3C7", tab: "upcoming" };
}

/* ─── icon picker by index ────────────────────────────────────────────────── */
const EXAM_ICONS = [QuizIcon, CodeIcon, StorageIcon, BrushIcon, AssignmentIcon];
const ICON_BG = ["#EDE9FE", "#DBEAFE", "#DCFCE7", "#FCE7F3", "#FEF3C7"];
const ICON_COLOR = ["#7C3AED", "#2563EB", "#059669", "#DB2777", "#D97706"];

/* ─── countdown hook ──────────────────────────────────────────────────────── */
function useCountdown(initialSeconds) {
    const [secs, setSecs] = useState(initialSeconds ?? 0);
    const ref = useRef(null);

    useEffect(() => {
        if (!initialSeconds) return;
        setSecs(initialSeconds);
        ref.current = setInterval(() => {
            setSecs((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(ref.current);
    }, [initialSeconds]);

    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/* ─── date formatter ──────────────────────────────────────────────────────── */
function formatExamDate(val) {
    if (!val) return null;
    const d = new Date(val);
    if (isNaN(d)) return null;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) +
        " · " +
        d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ═══════════════════════════════════════════════════════════════════════════
   EXAM ROW  (used inside the tab list)
═══════════════════════════════════════════════════════════════════════════ */
function ExamRow({ exam, index }) {
    const navigate = useNavigate();
    const status = getExamStatus(exam.status);
    const Icon = EXAM_ICONS[index % EXAM_ICONS.length];
    const iconBg = ICON_BG[index % ICON_BG.length];
    const iconColor = ICON_COLOR[index % ICON_COLOR.length];
    const dateLabel = formatExamDate(exam.scheduled_start_at);

    return (
        <Box
            onClick={() => navigate(`/exam-summary/${exam.id}`)}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5,
                px: 1,
                borderRadius: radius.sm,
                cursor: "pointer",
                animation: `${fadeUp} 350ms ease both`,
                animationDelay: `${index * 50}ms`,
                transition: "background 0.18s",
                "&:hover": { bgcolor: colors.surface2 },
                "&:not(:last-child)": {
                    borderBottom: `1px solid ${colors.border}`,
                },
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: radius.sm,
                    bgcolor: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 20, color: iconColor }} />
            </Box>

            {/* Info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    fontWeight={600}
                    fontSize={13.5}
                    color={colors.textPrimary}
                    sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {exam.title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary, fontSize: "0.72rem" }}
                >
                    {exam.subject || exam.course_title || "General"}
                </Typography>
            </Box>

            {/* Date */}
            {dateLabel && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        flexShrink: 0,
                    }}
                >
                    <CalendarTodayIcon sx={{ fontSize: 11, color: colors.textMuted }} />
                    <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary, fontSize: "0.71rem" }}
                    >
                        {dateLabel}
                    </Typography>
                </Box>
            )}

            {/* Duration */}
            {exam.duration_minutes && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.4,
                        flexShrink: 0,
                    }}
                >
                    <AccessTimeIcon sx={{ fontSize: 11, color: colors.textMuted }} />
                    <Typography
                        variant="caption"
                        sx={{ color: colors.textSecondary, fontSize: "0.71rem" }}
                    >
                        {exam.duration_minutes} min
                    </Typography>
                </Box>
            )}

            {/* Marks badge */}
            {exam.total_marks && (
                <Chip
                    label={`${exam.obtained_marks != null && status.tab === "completed" ? `${exam.obtained_marks}/` : ""}${exam.total_marks} Marks`}
                    size="small"
                    sx={{
                        bgcolor: status.bg,
                        color: status.color,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        height: 22,
                        borderRadius: "6px",
                        flexShrink: 0,
                    }}
                />
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ONGOING EXAM CARD
═══════════════════════════════════════════════════════════════════════════ */
function OngoingExamCard({ exam, index }) {
    const navigate = useNavigate();
    const countdown = useCountdown(exam.time_remaining_seconds ?? null);
    const Icon = EXAM_ICONS[index % EXAM_ICONS.length];
    const iconBg = ICON_BG[index % ICON_BG.length];
    const iconColor = ICON_COLOR[index % ICON_COLOR.length];
    const progress = exam.progress ?? 0;

    return (
        <Box
            onClick={() => navigate(`/exam-summary/${exam.id}`)}
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 2,
                py: 1.5,
                px: 1,
                borderRadius: radius.sm,
                cursor: "pointer",
                animation: `${fadeUp} 350ms ease both`,
                animationDelay: `${index * 60}ms`,
                transition: "background 0.18s",
                "&:hover": { bgcolor: colors.surface2 },
                "&:not(:last-child)": {
                    borderBottom: `1px solid ${colors.border}`,
                },
            }}
        >
            {/* Icon */}
            <Box
                sx={{
                    width: 42,
                    height: 42,
                    borderRadius: radius.sm,
                    bgcolor: iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                }}
            >
                <Icon sx={{ fontSize: 22, color: iconColor }} />
            </Box>

            {/* Info + progress */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    fontWeight={600}
                    fontSize={13.5}
                    color={colors.textPrimary}
                    sx={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                    }}
                >
                    {exam.title}
                </Typography>
                <Typography
                    variant="caption"
                    sx={{ color: colors.textSecondary, fontSize: "0.72rem", display: "block", mb: 0.75 }}
                >
                    {exam.subject || exam.course_title || "General"}
                </Typography>
                <LinearProgress
                    variant="determinate"
                    value={Math.max(progress, 2)}
                    sx={{
                        height: 5,
                        borderRadius: 3,
                        bgcolor: colors.surface3,
                        "& .MuiLinearProgress-bar": {
                            bgcolor: colors.primary,
                            borderRadius: 3,
                        },
                    }}
                />
            </Box>

            {/* Time left */}
            <Box sx={{ flexShrink: 0, textAlign: "right" }}>
                <Typography
                    variant="caption"
                    sx={{ color: colors.textMuted, fontSize: "0.68rem", display: "block" }}
                >
                    Time Left
                </Typography>
                <Typography
                    fontWeight={700}
                    fontSize={14}
                    color={colors.textPrimary}
                    sx={{ fontVariantNumeric: "tabular-nums", letterSpacing: "0.04em" }}
                >
                    {exam.time_remaining_seconds != null ? countdown : "--:--:--"}
                </Typography>
            </Box>

            {/* Marks badge */}
            {exam.total_marks && (
                <Chip
                    label={`${exam.total_marks} Marks`}
                    size="small"
                    sx={{
                        bgcolor: colors.primaryLight,
                        color: colors.primary,
                        fontWeight: 700,
                        fontSize: "0.7rem",
                        height: 22,
                        borderRadius: "6px",
                        flexShrink: 0,
                    }}
                />
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ASSESSMENTS / EXAMS SECTION  (tabbed list)
═══════════════════════════════════════════════════════════════════════════ */
function AssessmentsSection({ exams }) {
    const [tab, setTab] = useState(0);
    const navigate = useNavigate();

    const upcoming = exams.filter((e) => getExamStatus(e.status).tab === "upcoming");
    const ongoing = exams.filter((e) => getExamStatus(e.status).tab === "ongoing");
    const completed = exams.filter((e) => getExamStatus(e.status).tab === "completed");

    const tabs = [
        { label: "Upcoming", count: upcoming.length, items: upcoming },
        { label: "Ongoing", count: ongoing.length, items: ongoing },
        { label: "Completed", count: completed.length, items: completed },
    ];

    const activeItems = tabs[tab].items;

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography
                    sx={{ fontSize: "1.5rem", fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}
                >
                    Assessments / Exams
                </Typography>
                {/* <Box
                    onClick={() => navigate("/exams")}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.2,
                        cursor: "pointer",
                        color: colors.primary,
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    <Typography variant="caption" fontWeight={600} sx={{ color: colors.primary, fontSize: "0.8rem" }}>
                        View all
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                </Box> */}
            </Box>

            {/* Tabs */}
            <Box sx={{ mb: 2 }}>
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    sx={{
                        minHeight: 36,
                        "& .MuiTabs-indicator": { display: "none" },
                        "& .MuiTabs-flexContainer": { gap: 1 },
                    }}
                >
                    {tabs.map(({ label, count }, i) => (
                        <Tab
                            key={label}
                            disableRipple
                            label={
                                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                                    <span>{label}</span>
                                    <Box
                                        sx={{
                                            minWidth: 20,
                                            height: 20,
                                            borderRadius: "10px",
                                            px: 0.75,
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            bgcolor: tab === i ? "#fff" : colors.surface3,
                                            color: tab === i ? colors.primary : colors.textSecondary,
                                            fontSize: "0.72rem",
                                            fontWeight: 700,
                                            lineHeight: 1,
                                        }}
                                    >
                                        {count}
                                    </Box>
                                </Box>
                            }
                            sx={{
                                minHeight: 36,
                                py: 0.5,
                                px: 1.75,
                                borderRadius: "8px",
                                fontSize: "0.82rem",
                                fontWeight: 600,
                                textTransform: "none",
                                color: colors.textSecondary,
                                bgcolor: "transparent",
                                transition: "background 0.18s, color 0.18s",
                                "&.Mui-selected": {
                                    color: "#fff",
                                    bgcolor: colors.primary,
                                },
                            }}
                        />
                    ))}
                </Tabs>
            </Box>

            {/* Exam rows */}
            {activeItems.length > 0 ? (
                <>
                    <Box>
                        {activeItems.slice(0, 5).map((exam, idx) => (
                            <ExamRow key={exam.id || idx} exam={exam} index={idx} />
                        ))}
                    </Box>
                    {/* {activeItems.length > 5 && (
                        <Box
                            onClick={() => navigate("/exams")}
                            sx={{
                                mt: 1.5,
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                gap: 0.5,
                                cursor: "pointer",
                                color: colors.primary,
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.8rem" }}>
                                View all {tabs[tab].label.toLowerCase()} exams
                            </Typography>
                            <ChevronRightIcon sx={{ fontSize: 14 }} />
                        </Box>
                    )} */}
                </>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: 140,
                        gap: 1,
                    }}
                >
                    <EmojiEventsIcon sx={{ fontSize: 34, color: colors.textMuted }} />
                    <Typography variant="body2" sx={{ color: colors.textSecondary }}>
                        No {tabs[tab].label.toLowerCase()} exams
                    </Typography>
                </Box>
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ONGOING EXAMS SECTION
═══════════════════════════════════════════════════════════════════════════ */
function OngoingExamsSection({ exams }) {
    const navigate = useNavigate();
    const ongoing = exams.filter((e) => getExamStatus(e.status).tab === "ongoing");

    if (ongoing.length === 0) return null;

    return (
        <Box
            sx={{
                p: 2.5,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                }}
            >
                <Typography
                    sx={{ fontSize: "1.5rem", fontWeight: 700, color: colors.textPrimary, lineHeight: 1.2 }}
                >
                    Ongoing Exams
                </Typography>
                {/* <Box
                    onClick={() => navigate("/exams")}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.2,
                        cursor: "pointer",
                        color: colors.primary,
                        "&:hover": { textDecoration: "underline" },
                    }}
                >
                    <Typography variant="caption" fontWeight={600} sx={{ color: colors.primary, fontSize: "0.8rem" }}>
                        View all
                    </Typography>
                    <ChevronRightIcon sx={{ fontSize: 16 }} />
                </Box> */}
            </Box>

            {/* Cards */}
            <Box>
                {ongoing.map((exam, idx) => (
                    <OngoingExamCard key={exam.id || idx} exam={exam} index={idx} />
                ))}
            </Box>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN EXPORT
═══════════════════════════════════════════════════════════════════════════ */
export default function ExamWidget() {
    const { enrolledExams } = useDashboard();

    const exams = useMemo(() => {
        return (enrolledExams || []).map((e) => ({
            id: e.module_id ?? e.exam_id ?? e.id,
            title: e.module_title ?? e.exam_title ?? "Untitled Exam",
            subject: e.course_title ?? e.subject ?? null,
            status: e.status ?? "upcoming",
            progress: e.progress_percent ?? 0,
            scheduled_start_at: e.scheduled_start_at ?? e.start_date ?? null,
            duration_minutes: e.duration_minutes ?? e.duration ?? null,
            total_marks: e.total_marks ?? e.marks ?? null,
            obtained_marks: e.obtained_marks ?? e.score ?? null,
            time_remaining_seconds: e.time_remaining_seconds ?? null,
            course_title: e.course_title ?? null,
        }));
    }, [enrolledExams]);

    return (
        <Box sx={{ width: "100%", display: "flex", flexDirection: "column", gap: 2.5 }}>
            <AssessmentsSection exams={exams} />
            <OngoingExamsSection exams={exams} />
        </Box>
    );
}
