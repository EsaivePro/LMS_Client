import { useEffect, useImperativeHandle, useRef, forwardRef } from "react";

// Singleton promise — loads the Vimeo Player SDK from CDN exactly once
let vimeoSDKPromise = null;
const loadVimeoSDK = () => {
    if (vimeoSDKPromise) return vimeoSDKPromise;
    vimeoSDKPromise = new Promise((resolve) => {
        if (window.Vimeo) { resolve(window.Vimeo); return; }
        const script = document.createElement("script");
        script.src = "https://player.vimeo.com/api/player.js";
        script.onload = () => resolve(window.Vimeo);
        script.onerror = () => { vimeoSDKPromise = null; resolve(null); };
        document.head.appendChild(script);
    });
    return vimeoSDKPromise;
};

/**
 * VimeoPlayer renders a Vimeo embed iframe.
 * Exposes seekTo(seconds) via ref (use React.forwardRef / useRef on parent).
 *
 * Props:
 *   videoId        {string}   Vimeo video ID, e.g. "1184502679"
 *   title          {string}   Accessible iframe title
 *   className      {string}   CSS class on wrapper div
 *   style          {object}   Extra styles on wrapper div
 *   fill           {boolean}  true → fills parent container; false (default) → 16:9 ratio
 *   onTimeUpdate   {function} (currentSec, durationSec) — fired on Vimeo timeupdate
 *   onEnded        {function} (currentSec, durationSec) — fired when video ends
 *
 * Ref methods (via useImperativeHandle):
 *   seekTo(seconds)  — seek the Vimeo player to the given position
 *   play()           — start playback
 *   pause()          — pause playback
 */
const VimeoPlayer = forwardRef(function VimeoPlayer(
    {
        videoId,
        title = "Vimeo Video",
        className = "",
        style = {},
        fill = false,
        onTimeUpdate,
        onEnded,
    },
    ref
) {
    const iframeRef = useRef(null);
    const playerRef = useRef(null);
    const pendingSeekRef = useRef(null); // seek queued before player is ready

    // ── Expose imperative handle ───────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
        seekTo: (seconds) => {
            if (playerRef.current) {
                playerRef.current.setCurrentTime(seconds).catch(() => {});
            } else {
                pendingSeekRef.current = seconds; // apply once player initialises
            }
        },
        play: () => playerRef.current?.play().catch(() => {}),
        pause: () => playerRef.current?.pause().catch(() => {}),
    }), []);

    // ── SDK initialisation & event binding ────────────────────────────────────
    useEffect(() => {
        if (!videoId || !iframeRef.current) return;
        let destroyed = false;

        loadVimeoSDK().then((Vimeo) => {
            if (!Vimeo || destroyed || !iframeRef.current) return;

            const player = new Vimeo.Player(iframeRef.current);
            playerRef.current = player;

            // Apply any seek that arrived before the player was ready
            if (pendingSeekRef.current !== null) {
                const t = pendingSeekRef.current;
                pendingSeekRef.current = null;
                player.ready().then(() => player.setCurrentTime(t).catch(() => {})).catch(() => {});
            }

            if (onTimeUpdate) {
                player.on("timeupdate", (data) => {
                    if (!destroyed) onTimeUpdate(Math.floor(data.seconds), Math.floor(data.duration));
                });
            }
            if (onEnded) {
                player.on("ended", (data) => {
                    if (!destroyed) onEnded(Math.floor(data.seconds), Math.floor(data.duration));
                });
            }
        });

        return () => {
            destroyed = true;
            if (playerRef.current) {
                try {
                    playerRef.current.off("timeupdate");
                    playerRef.current.off("ended");
                } catch (_) { /* ignore */ }
                playerRef.current = null;
            }
        };
    }, [videoId]); // re-initialise only when the video ID changes

    if (!videoId) return null;

    const src = `https://player.vimeo.com/video/${videoId}?h=0&title=0&byline=0&portrait=0`;

    if (fill) {
        return (
            <div
                className={className}
                style={{ width: "100%", height: "100%", position: "relative", ...style }}
            >
                <iframe
                    ref={iframeRef}
                    src={src}
                    title={title}
                    allow="autoplay; fullscreen; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                />
            </div>
        );
    }

    // Default — responsive 16:9 aspect ratio
    return (
        <div
            className={className}
            style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", ...style }}
        >
            <iframe
                ref={iframeRef}
                src={src}
                title={title}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
            />
        </div>
    );
});

export default VimeoPlayer;
