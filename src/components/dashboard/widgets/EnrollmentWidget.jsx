import React, { useMemo } from "react";
import {
    Box, Typography, Paper, Skeleton, Button,
    LinearProgress, Zoom, Fade, Divider, Chip,
    useTheme, useMediaQuery,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useEnrollments } from "../../../modules/enrollments/hooks/useEnrollments";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

// ── Stat card config ────────────────────────────────────────────────────────
const STAT_CARDS = [
    {
        key: "active",
        label: "Active",
        icon: SchoolIcon,
        gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        glow: "rgba(102,126,234,0.22)",
    },
    {
        key: "inprogress",
        label: "In Progress",
        icon: PlayCircleOutlineIcon,
        gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        glow: "rgba(245,87,108,0.22)",
    },
    {
        key: "completed",
        label: "Completed",
        icon: CheckCircleOutlineIcon,
        gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        glow: "rgba(0,242,254,0.22)",
    },
    {
        key: "scheduled",
        label: "Exams Due",
        icon: QuizIcon,
        gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        glow: "rgba(67,233,123,0.22)",
    },
    {
        key: "certificates",
        label: "Certificates",
        icon: WorkspacePremiumIcon,
        gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
        glow: "rgba(161,140,209,0.22)",
    },
    {
        key: "avgMarks",
        label: "Avg Marks",
        icon: TrendingUpIcon,
        gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        glow: "rgba(250,112,154,0.22)",
        format: (v) => (v ? `${Math.round(v)}%` : "—"),
    },
];

// ── Compact gradient stat card (mirrors StudentCountWidget style but gradient) ─
function StatCard({ config, value, loading, index, isMobile }) {
    const Icon = config.icon;
    const display = config.format ? config.format(value) : (value ?? 0);

    return (
        <Zoom in style={{ transitionDelay: `${index * 80}ms` }}>
            <Paper
                elevation={0}
                sx={{
                    p: isMobile ? 1.5 : 2,
                    borderRadius: 2.5,
                    background: config.gradient,
                    boxShadow: `0 6px 20px ${config.glow}`,
                    color: "#fff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.28s cubic-bezier(.4,2,.6,1), box-shadow 0.28s",
                    "&:hover": {
                        transform: "translateY(-5px) scale(1.025)",
                        boxShadow: `0 12px 28px ${config.glow.replace("0.22", "0.38")}`,
                    },
                }}
            >
                {/* Decorative circle */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -20,
                        right: -20,
                        width: 64,
                        height: 64,
                        borderRadius: "50%",
                        bgcolor: "rgba(255,255,255,0.12)",
                        pointerEvents: "none",
                    }}
                />

                <Fade in timeout={600 + index * 80}>
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{ opacity: 0.88, fontWeight: 600, fontSize: "0.63rem", textTransform: "uppercase", letterSpacing: 0.5 }}
                        >
                            {config.label}
                        </Typography>
                        {loading ? (
                            <Skeleton
                                variant="text"
                                width={38}
                                height={32}
                                sx={{ bgcolor: "rgba(255,255,255,0.28)" }}
                            />
                        ) : (
                            <Typography variant={isMobile ? "h6" : "h5"} fontWeight={800} lineHeight={1.1} sx={{ mt: 0.25 }}>
                                {display}
                            </Typography>
                        )}
                    </Box>
                </Fade>

                <Fade in timeout={800 + index * 80}>
                    <Box
                        sx={{
                            bgcolor: "rgba(255,255,255,0.22)",
                            borderRadius: 1.5,
                            p: 0.75,
                            display: "flex",
                            flexShrink: 0,
                        }}
                    >
                        <Icon sx={{ fontSize: isMobile ? 20 : 24 }} />
                    </Box>
                </Fade>
            </Paper>
        </Zoom>
    );
}

// ── Overall progress bar ────────────────────────────────────────────────────
function OverallProgress({ stats, loading }) {
    const total = (stats?.active ?? 0) + (stats?.inprogress ?? 0) + (stats?.completed ?? 0);
    const completed = stats?.completed ?? 0;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

    if (loading) return <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 2, mt: 2 }} />;
    if (total === 0) return null;

    return (
        <Box
            sx={{
                mt: 2,
                p: 1.75,
                borderRadius: 2.5,
                border: "1.5px solid",
                borderColor: "divider",
                bgcolor: "var(--surface2,#f9f9f9)",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                    Overall Completion
                </Typography>
                <Chip
                    label={`${pct}%`}
                    size="small"
                    sx={{
                        bgcolor: pct >= 80 ? "#e8f5e9" : pct >= 40 ? "#e3f2fd" : "#fff3e0",
                        color: pct >= 80 ? "#2e7d32" : pct >= 40 ? "#1565c0" : "#e65100",
                        fontWeight: 700,
                        fontSize: "0.68rem",
                        height: 20,
                    }}
                />
            </Box>
            <LinearProgress
                variant="determinate"
                value={pct}
                sx={{
                    height: 8,
                    borderRadius: 4,
                    bgcolor: "action.hover",
                    "& .MuiLinearProgress-bar": {
                        borderRadius: 4,
                        background: "linear-gradient(90deg, var(--primary,#8F00FF) 0%, #f093fb 100%)",
                    },
                }}
            />
            <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
                <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.65rem" }}>
                    {completed} of {total} modules completed
                </Typography>
            </Box>
        </Box>
    );
}

// ── Expiring-soon alert row ─────────────────────────────────────────────────
function ExpiryAlert({ expiringCourses }) {
    if (!expiringCourses?.length) return null;
    const next = expiringCourses[0];
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mt: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 2,
                bgcolor: "#fff3e0",
                border: "1px solid #ffe0b2",
            }}
        >
            <WarningAmberIcon sx={{ fontSize: 15, color: "#e65100", flexShrink: 0 }} />
            <Typography variant="caption" sx={{ fontSize: "0.7rem", color: "#bf360c", flexGrow: 1 }}>
                <b>{next.module_title ?? "A course"}</b> expires {dayjs(next.scheduled_end_at).fromNow()}
            </Typography>
        </Box>
    );
}

// ── Main widget ─────────────────────────────────────────────────────────────
export default function EnrollmentWidget({ title }) {
    const navigate = useNavigate();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { stats, expiringCourses, isLoading, statsLoading } = useEnrollments(user?.id);

    return (
        <Box>
            {/* ── Header ── */}
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1rem" }}>
                    {title}
                </Typography>
                <Button
                    size="small"
                    endIcon={<ArrowForwardIcon sx={{ fontSize: 14 }} />}
                    onClick={() => navigate("/my-learning/dashboard")}
                    sx={{
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "var(--primary,#8F00FF)",
                        textTransform: "none",
                        "&:hover": { bgcolor: "var(--primaryLight,#fbf5ff)" },
                    }}
                >
                    View All
                </Button>
            </Box>

            {/* ── Stat cards grid ── */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
                    gap: isMobile ? 1.25 : 1.75,
                }}
            >
                {STAT_CARDS.map((card, i) => (
                    <StatCard
                        key={card.key}
                        config={card}
                        value={stats?.[card.key]}
                        loading={statsLoading}
                        index={i}
                        isMobile={isMobile}
                    />
                ))}
            </Box>

            {/* ── Overall progress bar ── */}
            <OverallProgress stats={stats} loading={statsLoading} />

            {/* ── Expiry alert ── */}
            <ExpiryAlert expiringCourses={expiringCourses} />

            {/* ── Quick-action links ── */}
            <Divider sx={{ mt: 2, mb: 1.5 }} />
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<SchoolIcon sx={{ fontSize: 14 }} />}
                    onClick={() => navigate("/my-learning/courses")}
                    sx={{ fontSize: "0.72rem", fontWeight: 600, borderRadius: 2, textTransform: "none" }}
                >
                    My Courses
                </Button>
                <Button
                    size="small"
                    variant="outlined"
                    startIcon={<QuizIcon sx={{ fontSize: 14 }} />}
                    onClick={() => navigate("/my-learning/exams")}
                    sx={{ fontSize: "0.72rem", fontWeight: 600, borderRadius: 2, textTransform: "none" }}
                >
                    My Exams
                </Button>
            </Box>
        </Box>
    );
}
