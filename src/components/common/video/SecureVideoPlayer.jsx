import React, { useEffect, useRef, useState } from "react";
import {
    Box,
    Typography,
    IconButton,
    Snackbar,
    Fade,
    Slider,
    Tooltip
} from "@mui/material";

import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import PauseIcon from "@mui/icons-material/Pause";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import FullscreenExitIcon from "@mui/icons-material/FullscreenExit";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";

import "./secureVideo.css";

export default function SecureVideoPlayer({
    signedUrl,
    selectedLesson,
    user,
    onNext,
    onPrevious,
    previousDisabled,
    nextDisabled,
    nextTitle,
    prevTitle
}) {
    const videoRef = useRef(null);
    const containerRef = useRef(null);
    const overlayTimer = useRef(null);

    // MAIN STATES
    const [paused, setPaused] = useState(true);
    const [showOverlay, setShowOverlay] = useState(true);
    const [toastMessage, setToastMessage] = useState("");
    const [toastOpen, setToastOpen] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    // PLAYER STATES
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [speed, setSpeed] = useState(1);

    // SPEED OPTIONS
    const speeds = [1, 1.25, 1.5, 2];

    // FORMAT TIME
    const formatTime = (sec) => {
        if (!sec || isNaN(sec)) return "00:00";
        const h = Math.floor(sec / 3600);
        const m = Math.floor((sec % 3600) / 60);
        const s = Math.floor(sec % 60);
        if (h > 0)
            return `${h}:${m.toString().padStart(2, "0")}:${s
                .toString()
                .padStart(2, "0")}`;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    // FULLSCREEN HANDLER
    const toggleFullscreen = () => {
        const container = containerRef.current;
        if (!document.fullscreenElement) container.requestFullscreen?.();
        else document.exitFullscreen?.();
    };

    useEffect(() => {
        const handler = () =>
            setIsFullscreen(Boolean(document.fullscreenElement));
        document.addEventListener("fullscreenchange", handler);
        return () =>
            document.removeEventListener("fullscreenchange", handler);
    }, []);

    // Ref to indicate that a navigation action (next/previous) requested autoplay
    const playAfterNavigationRef = useRef(false);
    const initialPositionRef = useRef(true);

    // VIDEO INITIALIZATION
    useEffect(() => {
        const v = videoRef.current;
        if (!v) return;

        v.onloadedmetadata = () => {
            setDuration(v.duration);
            if (initialPositionRef.current) {
                initialPositionRef.current = false;
                // determine initial position from server-provided lesson data
                try {
                    const pos = Number(selectedLesson?.watched_seconds ?? selectedLesson?.watchedSeconds ?? 0) || 0;
                    if (pos > 0 && pos < v.duration) {
                        v.currentTime = Math.min(pos, v.duration - 0.1);
                        setProgress(v.currentTime);
                    }
                } catch (e) { }
            }

            if (playAfterNavigationRef.current) {
                v.play().then(() => setPaused(false)).catch(() => { /* autoplay blocked */ });
                playAfterNavigationRef.current = false;
            }
        };

        v.ontimeupdate = () => setProgress(v.currentTime);

        v.onpause = () => setPaused(true);
        v.onplay = () => setPaused(false);

        v.onended = () => {
            if (nextDisabled) onNext?.();
        };
    }, [onNext, nextDisabled, signedUrl, selectedLesson]);

    // RANDOM WATERMARK POSITION
    const [wmPos, setWmPos] = useState({ x: 50, y: 50 });

    useEffect(() => {
        const interval = setInterval(() => {
            setWmPos({
                x: Math.random() * 80,
                y: Math.random() * 80
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);
    // ============================
    // AUTO-HIDE OVERLAY (3 seconds)
    // ============================
    const startOverlayTimer = () => {
        clearTimeout(overlayTimer.current);

        // In PAUSE MODE → overlay stays hidden until mouse/keyboard moves
        // if (paused) return;

        overlayTimer.current = setTimeout(() => {
            setShowOverlay(false);
        }, 2000);
    };

    // SHOW OVERLAY ON MOUSE MOVE
    const handleMouseMove = () => {
        setShowOverlay(true);
        startOverlayTimer();
    };

    // SHOW OVERLAY ON TOUCH
    const handleTouchMove = () => {
        setShowOverlay(true);
        startOverlayTimer();
    };

    useEffect(() => {
        startOverlayTimer();
        return () => clearTimeout(overlayTimer.current);
    }, [paused]);


    // ============================
    // PLAY / PAUSE
    // ============================
    const togglePlay = () => {
        const v = videoRef.current;
        if (!v) return;

        if (paused) v.play();
        else v.pause();

        setShowOverlay(true); // show overlay on keyboard action
        startOverlayTimer();
    };


    // ============================
    // SEEK (PROGRESS BAR)
    // ============================
    const handleSeek = (_, value) => {
        const v = videoRef.current;
        v.currentTime = value;
        setProgress(value);
        setShowOverlay(true);
        startOverlayTimer();
    };


    // ============================
    // DOUBLE-TAP LEFT/RIGHT → SKIP ±10 SECONDS
    // ============================
    let lastTapTime = 0;

    const handleDoubleTap = (e) => {
        const currentTap = Date.now();
        const tapInterval = currentTap - lastTapTime;

        if (tapInterval < 250) {
            const touchX = e.changedTouches?.[0]?.clientX;
            const screenWidth = window.innerWidth;

            const v = videoRef.current;
            if (!v) return;

            if (touchX < screenWidth / 2) {
                // LEFT SIDE → REWIND 10 SEC
                v.currentTime = Math.max(0, v.currentTime - 10);
            } else {
                // RIGHT SIDE → FORWARD 10 SEC
                v.currentTime = Math.min(v.duration, v.currentTime + 10);
            }

            setShowOverlay(true);
            startOverlayTimer();
        }

        lastTapTime = currentTap;
    };


    // ============================
    // VOLUME
    // ============================
    const handleVolume = (_, value) => {
        const v = videoRef.current;
        v.volume = value;
        v.muted = value === 0;
        setVolume(value);
        setShowOverlay(true);
        startOverlayTimer();
    };

    const toggleMute = () => {
        const v = videoRef.current;
        v.muted = !v.muted;
        setVolume(v.muted ? 0 : v.volume);
        setShowOverlay(true);
        startOverlayTimer();
    };


    // ============================
    // SPEED INLINE BUTTONS
    // ============================
    const changeSpeed = (val) => {
        const v = videoRef.current;
        v.playbackRate = val;
        setSpeed(val);
        setToastMessage(`Speed: ${val}x`);
        setToastOpen(true);

        setShowOverlay(true);
        startOverlayTimer();
    };


    // ============================
    // KEYBOARD SHORTCUTS
    // ============================
    useEffect(() => {
        const handler = (e) => {
            const v = videoRef.current;
            if (!v) return;

            setShowOverlay(true);
            startOverlayTimer();

            switch (e.key.toLowerCase()) {
                case " ":
                case "k":
                    e.preventDefault();
                    togglePlay();
                    break;

                case "j":
                    v.currentTime = Math.max(0, v.currentTime - 10);
                    break;

                case "l":
                    v.currentTime = Math.min(v.duration, v.currentTime + 10);
                    break;

                case "arrowleft":
                    if (previousDisabled) {
                        playAfterNavigationRef.current = true;
                        onPrevious?.();
                    }
                    break;

                case "arrowright":
                    if (nextDisabled) {
                        playAfterNavigationRef.current = true;
                        onNext?.();
                    }
                    break;

                case "f":
                    toggleFullscreen();
                    break;

                default:
                    break;
            }
        };

        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, [
        paused,
        previousDisabled,
        nextDisabled,
        onPrevious,
        onNext
    ]);


    // ============================
    // DOUBLE-CLICK FULLSCREEN
    // ============================
    const handleDoubleClickFullscreen = () => {
        toggleFullscreen();
        setShowOverlay(true);
        startOverlayTimer();
    };
    // ============================
    // RENDER UI
    // ============================
    return (
        <Box
            ref={containerRef}
            sx={{
                position: "relative",
                width: "100%",
                height: "100%",
                background: "var(--textPrimary)",
                overflow: "hidden",
                userSelect: "none",
                cursor: showOverlay ? "default" : "none"
            }}
            onMouseMove={handleMouseMove}
            onTouchMove={handleTouchMove}
            onDoubleClick={handleDoubleClickFullscreen}
            onTouchEnd={handleDoubleTap}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* ============================
                VIDEO ELEMENT
            ============================= */}
            <video
                ref={videoRef}
                src={signedUrl}
                playsInline
                disablePictureInPicture
                controls={false}
                style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                }}
            />

            {/* ============================
                CENTER OVERLAY CONTROLS
            ============================= */}
            <Fade in={showOverlay} timeout={300}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "100%",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        px: 3,
                        pointerEvents: "none",
                    }}
                >
                    {/* PREVIOUS */}
                    <Tooltip title="Previous">
                        <IconButton
                            disabled={!previousDisabled}
                            onClick={() => {
                                playAfterNavigationRef.current = true;
                                onPrevious?.();
                            }}
                            sx={{
                                pointerEvents: "auto",
                                opacity: previousDisabled ? 1 : 0.3,
                            }}
                        >
                            <NavigateBeforeIcon sx={{ fontSize: 60, color: "white" }} />
                        </IconButton>
                    </Tooltip>

                    <IconButton
                        onClick={togglePlay}
                        sx={{
                            pointerEvents: "auto",
                            width: 95,
                            height: 95,
                        }}
                    >
                        {paused ? (
                            <PlayArrowIcon sx={{ fontSize: 85, color: "white" }} />
                        ) : (
                            <PauseIcon sx={{ fontSize: 85, color: "white" }} />
                        )}
                    </IconButton>

                    {/* NEXT */}
                    <Tooltip title="Next">
                        <IconButton
                            disabled={!nextDisabled}
                            onClick={() => {
                                playAfterNavigationRef.current = true;
                                onNext?.();
                            }}
                            sx={{
                                pointerEvents: "auto",
                                opacity: nextDisabled ? 1 : 0.3,
                            }}
                        >
                            <NavigateNextIcon sx={{ fontSize: 60, color: "white" }} />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Fade>

            {/* ============================
                FOOTER BAR (YouTube style)
            ============================= */}
            <Fade in={showOverlay} timeout={300}>
                <Box
                    sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        p: 2,
                        background:
                            "linear-gradient(to top, rgba(0,0,0,0.65), rgba(0,0,0,0))",
                        backdropFilter: "blur(2px)",
                    }}
                >
                    {/* PROGRESS BAR */}
                    <Slider
                        value={progress}
                        min={0}
                        max={duration || 0}
                        onChange={handleSeek}
                        sx={{
                            color: "var(--primary)",
                            height: 4,
                            "& .MuiSlider-thumb": {
                                width: 12,
                                height: 12,
                                backgroundColor: "var(--surface)",
                                border: "2px solid var(--primary)",
                            },
                            "& .MuiSlider-rail": {
                                opacity: 0.3,
                                backgroundColor: "white",
                            },
                        }}
                    />

                    {/* CONTROL ROW */}
                    <Box
                        sx={{
                            mt: 1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        {/* LEFT SIDE BUTTONS */}
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            {/* PLAY/PAUSE FOOTER */}
                            <Tooltip title={paused ? "Play" : "Pause"}>
                                <IconButton
                                    onClick={togglePlay}
                                    sx={{ color: "white", p: 0.3 }}
                                >
                                    {paused ? (
                                        <PlayArrowIcon sx={{ fontSize: 32 }} />
                                    ) : (
                                        <PauseIcon sx={{ fontSize: 32 }} />
                                    )}
                                </IconButton>
                            </Tooltip>

                            {/* TIME */}
                            <Typography sx={{ color: "white", fontSize: 14 }}>
                                {formatTime(progress)} / {formatTime(duration)}
                            </Typography>

                            {/* VOLUME */}
                            <Tooltip title="Volume">
                                <IconButton
                                    onClick={toggleMute}
                                    sx={{ color: "white", p: 0.5 }}
                                >
                                    {volume === 0 ? (
                                        <VolumeOffIcon />
                                    ) : (
                                        <VolumeUpIcon />
                                    )}
                                </IconButton>
                            </Tooltip>

                            <Slider
                                value={volume}
                                min={0}
                                max={1}
                                step={0.05}
                                onChange={handleVolume}
                                sx={{
                                    width: 90,
                                    color: "var(--primary)",
                                    "& .MuiSlider-thumb": {
                                        width: 10,
                                        height: 10,
                                    },
                                }}
                            />

                            {/* INLINE SPEED BUTTONS */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                }}
                            >
                                {speeds.map((s) => (
                                    <Tooltip key={s} title={`Speed: ${s}x`}>
                                        <Box
                                            onClick={() => changeSpeed(s)}
                                            sx={{
                                                px: 1.2,
                                                py: 0.4,
                                                borderRadius: "6px",
                                                fontSize: "13px",
                                                color:
                                                    speed === s ? "var(--primary)" : "white",
                                                border:
                                                    speed === s
                                                        ? "1px solid var(--primary)"
                                                        : "1px solid rgba(255,255,255,0.4)",
                                                cursor: "pointer",
                                                transition: "0.25s",
                                                "&:hover": {
                                                    background:
                                                        "rgba(255,255,255,0.15)",
                                                },
                                            }}
                                        >
                                            {s}x
                                        </Box>
                                    </Tooltip>
                                ))}
                            </Box>
                        </Box>

                        {/* RIGHT SIDE */}
                        <Tooltip title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}>
                            <IconButton
                                onClick={toggleFullscreen}
                                sx={{ color: "white", p: 0.5 }}
                            >
                                {isFullscreen ? (
                                    <FullscreenExitIcon />
                                ) : (
                                    <FullscreenIcon />
                                )}
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>
            </Fade>
            {/* ============================
                MOVING WATERMARK
            ============================= */}
            <Typography
                className="sv-watermark sv-watermark-move"
                sx={{
                    position: "absolute",
                    top: `${wmPos.y}%`,
                    left: `${wmPos.x}%`,
                    color: "rgba(255,255,255,0.35)",
                    fontSize: 18,
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            >
                {user?.email || user?.username}
            </Typography>

            {/* ============================
                STATIC WATERMARK
            ============================= */}
            <Typography
                sx={{
                    position: "absolute",
                    bottom: 10,
                    right: 12,
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 13,
                    pointerEvents: "none",
                    userSelect: "none",
                }}
            >
                Protected Content
            </Typography>

            {/* ============================
                TOAST / SNACKBAR
            ============================= */}
            <Snackbar
                open={toastOpen}
                onClose={() => setToastOpen(false)}
                message={toastMessage}
                autoHideDuration={1500}
                anchorOrigin={{
                    vertical: "top",
                    horizontal: "center",
                }}
            />
        </Box>
    );
}
