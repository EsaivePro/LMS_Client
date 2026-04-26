import React, { useEffect, useState } from "react";
import { Box, Typography, Chip } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "../../../hooks/useAuth";
import WavingHandIcon        from "@mui/icons-material/WavingHand";
import LightModeIcon         from "@mui/icons-material/LightMode";
import WbSunnyIcon           from "@mui/icons-material/WbSunny";
import NightlightRoundIcon   from "@mui/icons-material/NightlightRound";
import FormatQuoteIcon       from "@mui/icons-material/FormatQuote";
import CalendarTodayIcon     from "@mui/icons-material/CalendarToday";
import dayjs from "dayjs";

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
    if (h < 12) return { greeting: "Good morning",   Icon: LightModeIcon,       iconColor: "#fbbf24" };
    if (h < 17) return { greeting: "Good afternoon", Icon: WbSunnyIcon,          iconColor: "#f97316" };
    return           { greeting: "Good evening",   Icon: NightlightRoundIcon,  iconColor: "#a78bfa" };
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

    const [name,       setName]       = useState("");
    const [tod,        setTod]        = useState(getTimeOfDay());
    const [quoteIndex, setQuoteIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
    const [dateStr,    setDateStr]    = useState(dayjs().format("dddd, MMMM D"));

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
                position:     "relative",
                overflow:     "hidden",
                borderRadius: 4,
                p:            { xs: 3, sm: 4 },
                minHeight:    140,
                background:   "linear-gradient(135deg, #1e1b4b 0%, #312e81 35%, #1d4ed8 75%, #0891b2 100%)",
                boxShadow:    "0 8px 40px rgba(30,27,75,0.35)",
                display:      "flex",
                alignItems:   "center",
                transition:   "box-shadow 0.25s ease",
                "&:hover":    { boxShadow: "0 14px 52px rgba(30,27,75,0.45)" },
            }}
        >
            {/* ── Background orbs ── */}
            <Box sx={{
                position:     "absolute", top: -60,   right: -60,
                width:        220,        height:     220,
                borderRadius: "50%",
                background:   "rgba(255,255,255,0.06)",
                animation:    `${float1} 8s ease-in-out infinite`,
                pointerEvents: "none",
            }} />
            <Box sx={{
                position:     "absolute", bottom: -80, right: 120,
                width:        180,        height:    180,
                borderRadius: "50%",
                background:   "rgba(139,92,246,0.18)",
                animation:    `${float2} 10s ease-in-out infinite`,
                pointerEvents: "none",
            }} />
            <Box sx={{
                position:     "absolute", top: 20,    right: "28%",
                width:        90,         height:     90,
                borderRadius: "50%",
                background:   "rgba(56,189,248,0.12)",
                animation:    `${float1} 12s ease-in-out infinite 2s`,
                pointerEvents: "none",
            }} />

            {/* ── Dot-grid overlay ── */}
            <Box sx={{
                position:       "absolute",
                inset:          0,
                backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize:  "24px 24px",
                pointerEvents:  "none",
            }} />

            {/* ── Content ── */}
            <Box sx={{ position: "relative", zIndex: 1, flex: 1 }}>

                {/* Date chip */}
                <Chip
                    icon={<CalendarTodayIcon sx={{ fontSize: "13px !important", color: "rgba(255,255,255,0.7) !important" }} />}
                    label={dateStr}
                    size="small"
                    sx={{
                        mb:             1.5,
                        bgcolor:        "rgba(255,255,255,0.12)",
                        backdropFilter: "blur(6px)",
                        color:          "rgba(255,255,255,0.85)",
                        fontWeight:     600,
                        fontSize:       "0.72rem",
                        border:         "1px solid rgba(255,255,255,0.18)",
                        height:         24,
                        animation:      `${fadeUp} 0.5s ease both`,
                    }}
                />

                {/* Greeting row */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap", mb: 0.5 }}>
                    <TodIcon sx={{ fontSize: 22, color: iconColor, filter: `drop-shadow(0 0 6px ${iconColor})`, animation: `${fadeUp} 0.45s ease both` }} />

                    <Typography
                        sx={{
                            color:      "rgba(255,255,255,0.82)",
                            fontSize:   { xs: "1.1rem", sm: "1.3rem" },
                            fontWeight: 500,
                            animation:  `${fadeUp} 0.5s ease both`,
                        }}
                    >
                        {greeting},
                    </Typography>

                    <Typography
                        sx={{
                            fontSize:   { xs: "1.2rem", sm: "1.5rem" },
                            fontWeight: 800,
                            background: "linear-gradient(90deg, #fff 0%, #c4b5fd 50%, #7dd3fc 100%)",
                            backgroundSize:  "200% auto",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            animation:  `${shimmer} 4s linear infinite, ${fadeUp} 0.55s ease both`,
                        }}
                    >
                        {name}!
                    </Typography>

                    <WavingHandIcon sx={{
                        fontSize:        24,
                        color:           "#fbbf24",
                        animation:       `${wave} 2.2s ease-in-out infinite`,
                        transformOrigin: "70% 70%",
                    }} />
                </Box>

                {/* Quote */}
                <Box
                    sx={{
                        display:    "flex",
                        alignItems: "flex-start",
                        gap:        0.5,
                        mt:         1.25,
                        maxWidth:   680,
                    }}
                >
                    <FormatQuoteIcon
                        sx={{
                            fontSize:  22,
                            color:     "rgba(196,181,253,0.7)",
                            mt:        0.2,
                            flexShrink: 0,
                            transform: "scaleX(-1)",
                        }}
                    />
                    <Typography
                        key={quoteIndex}
                        sx={{
                            color:     "rgba(255,255,255,0.72)",
                            fontSize:  { xs: "0.88rem", sm: "0.95rem" },
                            fontStyle: "italic",
                            lineHeight: 1.55,
                            animation: `${fadeUp} 0.55s ease both`,
                        }}
                    >
                        {QUOTES[quoteIndex]}
                    </Typography>
                </Box>

            </Box>
        </Box>
    );
}
