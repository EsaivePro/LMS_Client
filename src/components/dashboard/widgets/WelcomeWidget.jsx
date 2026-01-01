import React, { useEffect, useState } from "react";
import { Paper, Box, Typography } from "@mui/material";
import { keyframes } from "@mui/system";
import { useAuth } from "../../../hooks/useAuth";
import WavingHandIcon from "@mui/icons-material/WavingHand";
import { red } from "@mui/material/colors";

/* ---------- Quotes ---------- */
const QUOTES = [
    "The secret of getting ahead is getting started.",
    "Don't watch the clock; do what it does. Keep going.",
    "Start where you are. Use what you have. Do what you can.",
    "Success usually comes to those who are too busy to be looking for it.",
    "The future depends on what you do today."
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
  10% { transform: rotate(14deg); }
  20% { transform: rotate(-8deg); }
  30% { transform: rotate(14deg); }
  40% { transform: rotate(-4deg); }
  50% { transform: rotate(10deg); }
  60% { transform: rotate(0deg); }
  100% { transform: rotate(0deg); }
`;

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(6px); }
  to { opacity: 1; transform: translateY(0); }
`;

export default function WelcomeWidget() {
    const { user, isAuthenticated } = useAuth();
    const [name, setName] = useState("");

    useEffect(() => {
        let userName = user?.fullname || user?.username || user?.email || "User";
        userName = userName.charAt(0).toUpperCase() + userName.slice(1);
        setName(userName);
    }, [user, isAuthenticated]);

    const [quoteIndex, setQuoteIndex] = useState(
        () => Math.floor(Math.random() * QUOTES.length)
    );
    const [greeting, setGreeting] = useState(getGreeting());

    useEffect(() => {
        const t = setInterval(
            () => setQuoteIndex((i) => (i + 1) % QUOTES.length),
            6000
        );
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const timer = setInterval(() => setGreeting(getGreeting()), 60_000);
        return () => clearInterval(timer);
    }, []);

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 2,
                boxShadow: 0,
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
            }}
        >
            <Box sx={{ flex: 1 }}>
                {/* Greeting */}
                <Typography
                    variant="h4"
                    fontWeight={600}
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1,
                        flexWrap: "wrap",                 // ✅ responsive wrap
                        fontSize: {
                            xs: "1.35rem",
                            sm: "1.75rem",
                            md: "2.125rem",
                        },
                    }}
                >
                    <Box component="span" sx={{ flexBasis: { xs: "100%", sm: "auto" }, display: { xs: "block", sm: "inline" }, color: "#000000ec", fontWeight: 500 }}>
                        {greeting},
                    </Box>
                    <Typography
                        variant="h5"
                        fontWeight={500}
                        sx={{
                            fontSize: {
                                xs: "1.1rem",
                                sm: "1.4rem",
                                md: "1.5rem",
                            },
                        }}
                    >
                        {name}
                    </Typography>

                    <Box
                        sx={{
                            display: "inline-flex",
                            transformOrigin: "70% 70%",
                            animation: `${wave} 2.5s infinite`,
                            fontSize: {
                                xs: 22,
                                sm: 26,
                                md: 28,
                            },
                        }}
                    >
                        <WavingHandIcon htmlColor="#434343ff" />
                    </Box>
                </Typography>

                {/* Quote */}
                <Typography
                    key={quoteIndex}
                    variant="body2"
                    color="text.secondary"
                    sx={{
                        mt: { xs: 0.5, sm: 0.75 },
                        fontSize: {
                            xs: "0.85rem",
                            sm: "0.875rem",
                        },
                        animation: `${fadeUp} 0.6s ease`,
                        maxWidth: 520,
                    }}
                >
                    {QUOTES[quoteIndex]}
                </Typography>
            </Box>
        </Paper>
    );
}
