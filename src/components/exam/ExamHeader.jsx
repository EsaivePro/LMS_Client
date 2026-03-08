import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, MenuItem, Select, Stack } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';

export default function ExamHeader({ title, timeLeft, onToggleFullscreen, language, onLanguageChange, onToggleDark }) {
    const formatTime = (s) => {
        const hh = String(Math.floor(s / 3600)).padStart(2, '0');
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    };

    return (
        <AppBar position="static" color="inherit" elevation={1} sx={{ borderRadius: 1 }}>
            <Toolbar sx={{ px: { xs: 1, md: 3 }, gap: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>{title}</Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2" color="text.secondary">Time Left</Typography>
                    <Box sx={{ px: 1, py: 0.5, bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
                        <Typography variant="subtitle2" sx={{ fontFamily: 'monospace' }}>{formatTime(timeLeft)}</Typography>
                    </Box>

                    <IconButton onClick={onToggleFullscreen} aria-label="fullscreen" size="large">
                        <FullscreenIcon />
                    </IconButton>

                    <Select value={language} size="small" onChange={(e) => onLanguageChange(e.target.value)}>
                        <MenuItem value="en">English</MenuItem>
                        <MenuItem value="hi">हिंदी</MenuItem>
                    </Select>

                    <IconButton onClick={onToggleDark} size="large" aria-label="toggle theme">
                        <Brightness4Icon />
                    </IconButton>

                    <IconButton size="large" aria-label="report">
                        <ReportProblemOutlinedIcon />
                    </IconButton>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
