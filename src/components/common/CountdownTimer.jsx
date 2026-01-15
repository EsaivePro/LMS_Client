import React, { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";

function pad(n, len = 2) {
    return String(n).padStart(len, "0");
}

function getTimeParts(ms) {
    if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    let s = Math.floor(ms / 1000);
    const days = Math.floor(s / 86400);
    s -= days * 86400;
    const hours = Math.floor(s / 3600);
    s -= hours * 3600;
    const minutes = Math.floor(s / 60);
    const seconds = s - minutes * 60;
    return { days, hours, minutes, seconds };
}

export default function CountdownTimer({ targetDate, onComplete, variant = 'medium' }) {
    const [remaining, setRemaining] = useState(() => {
        const t = targetDate ? new Date(targetDate).getTime() : 0;
        return Math.max(0, t - Date.now());
    });

    useEffect(() => {
        if (!targetDate) return undefined;
        const target = new Date(targetDate).getTime();
        function tick() {
            const rem = Math.max(0, target - Date.now());
            setRemaining(rem);
            if (rem === 0 && typeof onComplete === "function") onComplete();
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [targetDate, onComplete]);

    const parts = getTimeParts(remaining);

    // size variants
    const sizes = {
        small: { minWidth: 40, pad: '6px 6px', fontSize: 'h6', labelSize: 10, gap: 0.5 },
        medium: { minWidth: 50, pad: '8px 8px', fontSize: 'h5', labelSize: 12, gap: 1 },
        large: { minWidth: 64, pad: '12px 12px', fontSize: 'h4', labelSize: 13, gap: 1.25 },
    };

    const s = sizes[variant] || sizes.medium;

    const boxStyle = {
        display: 'flex',
        gap: s.gap,
        alignItems: 'center',
        justifyContent: 'center',
    };

    const digitStyle = {
        minWidth: s.minWidth,
        padding: s.pad,
        background: 'var(--surface)',
        borderRadius: 2,
        color: 'var(--dark)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
    };

    const labelStyle = { fontSize: s.labelSize, color: 'var(--dark)', marginTop: 0 };

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <Box sx={boxStyle}>
                <Box sx={digitStyle}>
                    <Typography variant={s.fontSize} sx={{ fontWeight: 700 }}>{pad(parts.days, 2)}</Typography>
                    <Typography sx={labelStyle}>DAYS</Typography>
                </Box>
                <Box sx={digitStyle}>
                    <Typography variant={s.fontSize} sx={{ fontWeight: 700 }}>{pad(parts.hours)}</Typography>
                    <Typography sx={labelStyle}>HRS</Typography>
                </Box>
                <Box sx={digitStyle}>
                    <Typography variant={s.fontSize} sx={{ fontWeight: 700 }}>{pad(parts.minutes)}</Typography>
                    <Typography sx={labelStyle}>MIN</Typography>
                </Box>
                <Box sx={digitStyle}>
                    <Typography variant={s.fontSize} sx={{ fontWeight: 700 }}>{pad(parts.seconds)}</Typography>
                    <Typography sx={labelStyle}>SEC</Typography>
                </Box>
            </Box>
        </Box>
    );
}
