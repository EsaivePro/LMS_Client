import React, { useEffect, useRef, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Box, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PropTypes from 'prop-types';

/**
 * IdleLogout
 * Props:
 * - timeoutSeconds: seconds of inactivity before showing the warning dialog (env: REACT_APP_IDLE_TIMEOUT_SECONDS)
 * - warningSeconds: seconds the dialog stays before auto-logout (env: REACT_APP_IDLE_WARNING_SECONDS)
 * - showCountdown: boolean to show countdown component
 * - onLogout: callback when logout occurs
 * - onStay: callback when user chooses to stay
 */
export default function IdleLogout({ timeoutSeconds, warningSeconds, showCountdown = true, onLogout, onStay }) {
    const envTimeout = 300; //parseInt(process.env.REACT_APP_IDLE_TIMEOUT_SECONDS, 10);
    const envWarning = 600; //parseInt(process.env.REACT_APP_IDLE_WARNING_SECONDS, 10);
    const idleMs = (Number.isFinite(envTimeout) && envTimeout > 0 ? envTimeout : timeoutSeconds) * 1000;
    const warnMs = (Number.isFinite(envWarning) && envWarning > 0 ? envWarning : warningSeconds) * 1000;

    const timerRef = useRef(null);
    const warnTimerRef = useRef(null);
    const [open, setOpen] = useState(false);
    const [warnTarget, setWarnTarget] = useState(null);
    const [remainingMs, setRemainingMs] = useState(0);

    useEffect(() => {
        const resetIdle = () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            timerRef.current = setTimeout(() => {
                setOpen(true);
                const target = Date.now() + warnMs;
                setWarnTarget(new Date(target));
                // schedule auto-logout in warnMs
                if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
                warnTimerRef.current = setTimeout(() => {
                    handleLogout();
                }, warnMs);
            }, idleMs);
        };

        const events = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
        events.forEach((ev) => window.addEventListener(ev, resetIdle, { passive: true }));
        resetIdle();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
            events.forEach((ev) => window.removeEventListener(ev, resetIdle));
        };
    }, [idleMs, warnMs]);

    // countdown tick for MM:SS display
    useEffect(() => {
        if (!open || !warnTarget) {
            setRemainingMs(0);
            return;
        }
        const update = () => {
            const rem = Math.max(0, new Date(warnTarget).getTime() - Date.now());
            setRemainingMs(rem);
            if (rem === 0) {
                // ensure logout fires
                handleLogout();
            }
        };
        update();
        const id = setInterval(update, 500);
        return () => clearInterval(id);
    }, [open, warnTarget]);

    const handleStay = () => {
        setOpen(false);
        if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
        // restart idle timer
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setOpen(true), idleMs);
        if (typeof onStay === 'function') onStay();
    };

    const handleLogout = async () => {
        setOpen(false);
        if (timerRef.current) clearTimeout(timerRef.current);
        if (warnTimerRef.current) clearTimeout(warnTimerRef.current);
        if (typeof onLogout === 'function') await onLogout();
    };

    return (
        <Dialog open={open} onClose={handleStay}>
            <DialogTitle sx={{ pr: 4 }}>
                Are you still there?
                <IconButton
                    aria-label="close"
                    onClick={handleStay}
                    sx={{ position: 'absolute', right: 8, top: 8 }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, minWidth: 240 }}>
                    <Typography sx={{ textAlign: 'center' }}>We noticed no activity — to protect your account you'll be automatically logged out.</Typography>
                    {showCountdown && warnTarget && (
                        <Box sx={{ mt: 1, fontFamily: 'monospace', fontSize: 24 }}>
                            {formatMsToMMSS(remainingMs)}
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={handleStay}
                    variant="contained"
                    sx={{
                        backgroundColor: 'var(--dark)',
                        color: '#fff',
                        '&:hover': { backgroundColor: 'var(--darkMedium)' },
                    }}
                >
                    Stay Logged In
                </Button>
                <Button
                    onClick={handleLogout}
                    variant="contained"
                    sx={{
                        backgroundColor: 'var(--darkMedium)',
                        color: '#fff',
                        '&:hover': { backgroundColor: 'var(--dark)' },
                    }}
                >
                    Logout
                </Button>
            </DialogActions>
        </Dialog>
    );
}

function formatMsToMMSS(ms) {
    const totalSec = Math.ceil(ms / 1000);
    const minutes = Math.floor(totalSec / 60);
    const seconds = totalSec % 60;
    const mm = String(minutes).padStart(2, '0');
    const ss = String(seconds).padStart(2, '0');
    return `${mm}:${ss}`;
}

IdleLogout.propTypes = {
    timeoutSeconds: PropTypes.number,
    warningSeconds: PropTypes.number,
    showCountdown: PropTypes.bool,
    onLogout: PropTypes.func,
    onStay: PropTypes.func,
};

IdleLogout.defaultProps = {
    timeoutSeconds: 180, // 3 minutes
    warningSeconds: 30,
    showCountdown: true,
};
