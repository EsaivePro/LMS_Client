import React from 'react';
import { AppBar, Toolbar, Typography, Box, IconButton, MenuItem, Select, Stack, Link } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import THEME from '../../constants/theme';

export default function ExamHeader({ title, timeLeft, onToggleFullscreen, language, onLanguageChange, onToggleDark }) {
    const formatTime = (s) => {
        const hh = String(Math.floor(s / 3600)).padStart(2, '0');
        const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
        const ss = String(s % 60).padStart(2, '0');
        return `${hh}:${mm}:${ss}`;
    };

    return (
        <AppBar position="static" color="inherit" elevation={1} sx={{ borderRadius: 1, height: '62px' }}>
            <Toolbar sx={{ px: { xs: 1, md: 3 }, gap: 2 }}>
                <img src={THEME?.manifest?.icons?.[0]?.src ? `/${THEME.manifest.icons[0].src}` : '/logo/EsaiLogo.png'} alt={THEME?.manifest?.name || 'Esai'} width="150" />

                {/* <Box size="large" >
                    <ChevronRightIcon />
                </Box> */}

                <Typography variant="h6" sx={{ flex: 1, fontWeight: 600 }}>{title}</Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                    <Link component="button" underline="none" sx={{ fontSize: 14, color: 'var(--primary)' }}>Question Paper</Link>
                    <Link component="button" underline="none" sx={{ fontSize: 14, color: 'var(--primary)' }}>Instructions</Link>

                    <IconButton onClick={onToggleFullscreen} aria-label="fullscreen" size="large">
                        <FullscreenIcon />
                    </IconButton>

                    <Select value={language} size="small" onChange={(e) => onLanguageChange(e.target.value)}>
                        <MenuItem value="en">English</MenuItem>
                        {/* <MenuItem value="hi">हिंदी</MenuItem> */}
                    </Select>

                    {/* <IconButton onClick={onToggleDark} size="large" aria-label="toggle theme">
                        <Brightness4Icon />
                    </IconButton> */}

                    {/* <IconButton size="large" aria-label="report">
                        <ReportProblemOutlinedIcon />
                    </IconButton> */}
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
