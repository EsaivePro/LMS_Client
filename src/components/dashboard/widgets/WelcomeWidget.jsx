import React, { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "../../../hooks/useAuth";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import LightModeIcon from "@mui/icons-material/LightMode";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import NightlightRoundIcon from "@mui/icons-material/NightlightRound";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";
import THEME from "../../../constants/theme";
import { useSelector } from "react-redux";
import LoginIcon from "@mui/icons-material/Login";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

const { colors } = THEME;

/* ─── quotes ──────────────────────────────────────────────────────────── */
const QUOTES = [
    "Don't watch the clock; do what it does. Keep going.",
    "Start where you are. Use what you have. Do what you can.",
    "Success usually comes to those who are too busy to be looking for it.",
    "The way to get started is to quit talking and begin doing.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It's not whether you get knocked down, it's whether you get up.",
    "The secret of getting ahead is getting started.",
    "Learning is not attained by chance. It must be sought with ardor.",
];

/* ─── time of day ─────────────────────────────────────────────────────── */
function getTimeOfDay(date = new Date()) {
    const h = date.getHours();
    if (h < 12) return { greeting: "Good morning", Icon: LightModeIcon, iconColor: colors.warning };
    if (h < 17) return { greeting: "Good afternoon", Icon: WbSunnyIcon, iconColor: colors.secondary };
    return { greeting: "Good evening", Icon: NightlightRoundIcon, iconColor: colors.primaryMedium };
}

/* ─── keyframes ───────────────────────────────────────────────────────── */
const wave = keyframes`
  0%   { transform: rotate(0deg); }
  15%  { transform: rotate(14deg); }
  30%  { transform: rotate(-8deg); }
  45%  { transform: rotate(12deg); }
  60%  { transform: rotate(-4deg); }
  75%  { transform: rotate(8deg); }
  100% { transform: rotate(0deg); }
`;
const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;
const float1 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(12px, -16px) scale(1.06); }
`;
const float2 = keyframes`
  0%, 100% { transform: translate(0, 0) scale(1); }
  50%       { transform: translate(-10px, 14px) scale(0.94); }
`;
const shimmer = keyframes`
  0%   { background-position: -200% center; }
  100% { background-position:  200% center; }
`;

export default function WelcomeWidget() {
    const { user, isAuthenticated } = useAuth();
    const reduxLastLogin = useSelector((s) => s.auth?.user?.lastLogin || s.user?.lastLogin || null);
    const lastLoginRaw = reduxLastLogin || localStorage.getItem("lastLogin") || user?.lastLogin || user?.last_login_at || null;

    const [name, setName] = useState("");
    const [tod, setTod] = useState(getTimeOfDay());
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
    const [dateStr, setDateStr] = useState(dayjs().format("dddd, MMMM D"));

    /* name */
    useEffect(() => {
        const raw = user?.fullname || user?.username || user?.email || "Learner";
        setName(raw.charAt(0).toUpperCase() + raw.slice(1));
    }, [user, isAuthenticated]);

    /* quote rotation */
    useEffect(() => {
        const t = setInterval(() => setQuoteIndex((i) => (i + 1) % QUOTES.length), 6000);
        return () => clearInterval(t);
    }, []);

    /* time-of-day + date refresh */
    useEffect(() => {
        const t = setInterval(() => {
            setTod(getTimeOfDay());
            setDateStr(dayjs().format("dddd, MMMM D"));
        }, 60000);
        return () => clearInterval(t);
    }, []);

    const { greeting, Icon: TodIcon, iconColor } = tod;

    return (
        <Box
            sx={{
                position: "relative",
                overflow: "hidden",
                borderRadius: 4,
                // p: { xs: 3, sm: 4 },
                minHeight: 140,
                display: "flex",
                alignItems: "center",
                transition: "box-shadow 0.25s ease"
            }}
        >
            {/* ── Background orbs ── */}
            {/* <Box sx={{
                position: "absolute", top: -60, right: -60,
                width: 220, height: 220,
                borderRadius: "50%",
                background: `${colors.primary}0F`,
                animation: `${float1} 8s ease-in-out infinite`,
                pointerEvents: "none",
            }} />
            <Box sx={{
                position: "absolute", bottom: -80, right: 120,
                width: 180, height: 180,
                borderRadius: "50%",
                background: `${colors.primaryMedium}2E`,
                animation: `${float2} 10s ease-in-out infinite`,
                pointerEvents: "none",
            }} />
            <Box sx={{
                position: "absolute", top: 20, right: "28%",
                width: 90, height: 90,
                borderRadius: "50%",
                background: `${colors.secondary}1F`,
                animation: `${float1} 12s ease-in-out infinite 2s`,
                pointerEvents: "none",
            }} /> */}

            {/* ── Dot-grid overlay ── */}
            <Box sx={{
                position: "absolute",
                inset: 0,
                backgroundImage: `radial-gradient(circle, ${colors.primary}12 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
                pointerEvents: "none",
            }} />

            {/* ── Content ── */}
            <Box sx={{ position: "relative", zIndex: 1, flex: 1, display: "flex", alignItems: "center", gap: 3 }}>

                {/* ── Left: greeting + quote ── */}
                <Box sx={{ flex: 1, minWidth: 0 }}>

                    {/* Date chip */}
                    <Chip
                        icon={<CalendarTodayIcon sx={{ fontSize: "13px !important", color: `${colors.textSecondary} !important` }} />}
                        label={dateStr}
                        size="small"
                        sx={{
                            mb: 1.5,
                            bgcolor: colors.surface2,
                            backdropFilter: "blur(6px)",
                            color: colors.textSecondary,
                            fontWeight: 600,
                            fontSize: "0.72rem",
                            border: `1px solid ${colors.border}`,
                            height: 24,
                            animation: `${fadeUp} 0.5s ease both`,
                        }}
                    />

                    {/* Greeting row */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                        <TodIcon sx={{ fontSize: 22, color: iconColor, filter: `drop-shadow(0 0 6px ${iconColor})`, animation: `${fadeUp} 0.45s ease both` }} />

                        <Typography
                            sx={{
                                color: colors.textPrimary,
                                fontSize: { xs: "1.1rem", sm: "1.3rem" },
                                fontWeight: 500,
                                animation: `${fadeUp} 0.5s ease both`,
                            }}
                        >
                            {greeting},
                        </Typography>

                        <Typography
                            sx={{
                                fontSize: { xs: "1.2rem", sm: "1.5rem" },
                                fontWeight: 800,
                                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.primaryMedium} 50%, ${colors.secondary} 100%)`,
                                backgroundSize: "200% auto",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                animation: `${shimmer} 4s linear infinite, ${fadeUp} 0.55s ease both`,
                            }}
                        >
                            {name}!
                        </Typography>

                        <WavingHandIcon sx={{
                            fontSize: 24,
                            color: colors.warning,
                            animation: `${wave} 2.2s ease-in-out infinite`,
                            transformOrigin: "70% 70%",
                        }} />
                    </Box>

                    {/* Quote */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            gap: 0.5,
                            mt: 1.25,
                            maxWidth: 680,
                        }}
                    >
                        <FormatQuoteIcon
                            sx={{
                                fontSize: 22,
                                color: `${colors.primaryMedium}B3`,
                                mt: 0.2,
                                flexShrink: 0,
                                transform: "scaleX(-1)",
                            }}
                        />
                        <Typography
                            key={quoteIndex}
                            sx={{
                                color: colors.textSecondary,
                                fontSize: { xs: "0.88rem", sm: "0.95rem" },
                                fontStyle: "italic",
                                lineHeight: 1.55,
                                animation: `${fadeUp} 0.55s ease both`,
                            }}
                        >
                            {QUOTES[quoteIndex]}
                        </Typography>
                    </Box>

                </Box>

                {/* ── Right: last login ── */}
                {lastLoginRaw && (
                    <Box
                        sx={{
                            display: { xs: "none", sm: "flex" },
                            flexDirection: "column",
                            alignItems: "flex-end",
                            gap: 0.6,
                            flexShrink: 0,
                            pl: 3,
                            borderLeft: `1px solid ${colors.border}`,
                            animation: `${fadeUp} 0.6s ease both`,
                        }}
                    >
                        {/* Label */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                            <LoginIcon sx={{ fontSize: 13, color: colors.textMuted }} />
                            <Typography
                                sx={{
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    color: colors.textMuted,
                                    textTransform: "uppercase",
                                    letterSpacing: "0.06em",
                                }}
                            >
                                Last Login
                            </Typography>
                        </Box>

                        {/* Date */}
                        <Typography
                            sx={{
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: colors.textPrimary,
                                lineHeight: 1.2,
                            }}
                        >
                            {dayjs(lastLoginRaw).format("ddd, MMM D, YYYY")}
                        </Typography>

                        {/* Time */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <AccessTimeIcon sx={{ fontSize: 13, color: colors.primary }} />
                            <Typography
                                sx={{
                                    fontSize: "0.82rem",
                                    fontWeight: 600,
                                    color: colors.primary,
                                    lineHeight: 1,
                                }}
                            >
                                {dayjs(lastLoginRaw).format("hh:mm:ss A")}
                            </Typography>
                        </Box>
                    </Box>
                )}

            </Box>
        </Box>
    );
}
