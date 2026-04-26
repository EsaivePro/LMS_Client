import React, { useEffect, useState } from "react";
import { Paper, Box, Typography, useTheme } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "../../../hooks/useAuth";
import WavingHandIcon from "@mui/icons-material/WavingHand";

/* ---------- Quotes ---------- */
const QUOTES = [
    "Don't watch the clock; do what it does. Keep going.",
    "Start where you are. Use what you have. Do what you can.",
    "Success usually comes to those who are too busy to be looking for it.",
    "The way to get started is to quit talking and begin doing.",
    "The future belongs to those who believe in the beauty of their dreams.",
    "It's not whether you get knocked down, it's whether you get up.",
];

/* ---------- Greeting ---------- */
function getGreeting(date = new Date()) {
    const hour = date.getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
}

/* ---------- Animations ---------- */
const wave = keyframes`
  0% { transform: rotate(0deg); }
  15% { transform: rotate(14deg); }
  30% { transform: rotate(-8deg); }
  45% { transform: rotate(12deg); }
  60% { transform: rotate(-4deg); }
  75% { transform: rotate(8deg); }
  100% { transform: rotate(0deg); }
`;

const fadeSlide = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const quoteTransition = keyframes`
  0% { opacity: 0; transform: translateY(8px); }
  100% { opacity: 1; transform: translateY(0); }
`;

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
  100% { transform: translateY(0px); }
`;

export default function WelcomeWidget() {
    const { user, isAuthenticated } = useAuth();
    const theme = useTheme();

    const [name, setName] = useState("");
    const [quoteIndex, setQuoteIndex] = useState(
        () => Math.floor(Math.random() * QUOTES.length)
    );
    const [greeting, setGreeting] = useState(getGreeting());

    /* ---------- Name ---------- */
    useEffect(() => {
        let userName =
            user?.fullname || user?.username || user?.email || "User";
        userName =
            userName.charAt(0).toUpperCase() + userName.slice(1);
        setName(userName);
    }, [user, isAuthenticated]);

    /* ---------- Quote rotation ---------- */
    useEffect(() => {
        const t = setInterval(
            () => setQuoteIndex((i) => (i + 1) % QUOTES.length),
            6000
        );
        return () => clearInterval(t);
    }, []);

    /* ---------- Greeting update ---------- */
    useEffect(() => {
        const timer = setInterval(() => setGreeting(getGreeting()), 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Paper
            elevation={3}
            sx={{
                borderRadius: 3,
                p: { xs: 2.5, sm: 3.5 },
                pt: 0,
                minHeight: 120,
                display: "flex",
                alignItems: "center",
                position: "relative",
                overflow: "hidden",

                /* ✅ KEEP YOUR ORIGINAL COLORS */
                // background: `linear-gradient(90deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
                // color: theme.palette.getContrastText(theme.palette.primary.main),
                border: `1.5px solid ${theme.palette.primary[100] || "#e3f2fd"}`,

                /* ✨ Smooth interaction */
                transition: "all 0.25s ease",

                "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: "0 8px 28px rgba(0,0,0,0.12)",
                },
            }}
        >
            {/* 🎯 Soft floating shape (same color, just opacity) */}
            <Box
                sx={{
                    position: "absolute",
                    right: -60,
                    top: -40,
                    width: 160,
                    height: 160,
                    borderRadius: "50%",
                    background: "rgba(255,255,255,0.08)",
                    animation: `${float} 6s ease-in-out infinite`,
                }}
            />

            <Box sx={{ flex: 1, zIndex: 1 }}>
                {/* 👋 Greeting */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.2,
                        mb: 0.5,
                    }}
                >
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            animation: `${fadeSlide} 0.5s ease`,
                        }}
                    >
                        {greeting},
                    </Typography>

                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            animation: `${fadeSlide} 0.6s ease`,
                        }}
                    >
                        {name}!
                    </Typography>

                    <WavingHandIcon
                        sx={{
                            fontSize: 26,
                            color: theme.palette.warning.main,
                            animation: `${wave} 2s infinite`,
                            transformOrigin: "70% 70%",
                        }}
                    />
                </Box>

                {/* 💬 Quote */}
                <Typography
                    key={quoteIndex}
                    variant="body1"
                    sx={{
                        mt: 0.5,
                        fontSize: { xs: "1.02rem", sm: "1.08rem" },
                        opacity: 0.92,
                        lineHeight: 1.5,
                        animation: `${quoteTransition} 0.5s ease`,
                    }}
                >
                    {QUOTES[quoteIndex]}
                </Typography>
            </Box>
        </Paper>
    );
}