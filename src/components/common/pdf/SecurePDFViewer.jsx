// SecurePDFViewer.jsx
import React, { useEffect, useRef, useState } from "react";
import { Box, Button, IconButton, Typography, Slider } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import GetAppIcon from "@mui/icons-material/GetApp";
import axios from "axios";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";
import "./securePdf.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
    `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

export default function SecurePDFViewer({ keyPath, user = {}, pageToOpen = 1 }) {
    const [signedUrl, setSignedUrl] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [numPages, setNumPages] = useState(0);
    const [page, setPage] = useState(pageToOpen || 1);
    const [scale, setScale] = useState(1.0);
    const [fileSize, setFileSize] = useState(null);
    const [wmPos, setWmPos] = useState({ x: 10, y: 10 });

    const canvasRef = useRef(null);
    const pdfDocRef = useRef(null);

    // Fetch the signed URL
    useEffect(() => {
        if (!keyPath) {
            setError("Missing keyPath");
            setLoading(false);
            return;
        }

        let active = true;

        async function loadSignedURL() {
            try {
                setLoading(true);

                const res = await axios.post("/api/content/signed-url", { key: keyPath });

                if (!active) return;

                if (res.data?.signedUrl) {
                    setSignedUrl(res.data.signedUrl);

                    // HEAD request to get file size
                    try {
                        const head = await fetch(res.data.signedUrl, { method: "HEAD" });
                        const len = head.headers.get("content-length");
                        if (len) setFileSize(parseInt(len, 10));
                    } catch { }
                } else {
                    setError("Failed to get signed URL");
                }
            } catch (err) {
                if (!active) return;
                setError(err?.response?.data?.message || err.message);
            } finally {
                if (active) setLoading(false);
            }
        }

        loadSignedURL();
        return () => (active = false);
    }, [keyPath]);

    // Load the PDF when signedUrl changes
    useEffect(() => {
        if (!signedUrl) return;

        let cancelled = false;

        async function loadPDF() {
            try {
                setLoading(true);

                const res = await fetch(signedUrl);
                if (!res.ok) throw new Error("Failed to fetch PDF");

                const buffer = await res.arrayBuffer();
                const loadingTask = pdfjsLib.getDocument({ data: buffer });
                const pdf = await loadingTask.promise;

                if (cancelled) return;

                pdfDocRef.current = pdf;
                setNumPages(pdf.numPages);

                const initialPage = Math.min(pageToOpen, pdf.numPages);
                setPage(initialPage);
                renderPage(initialPage, pdf, scale);
            } catch (err) {
                if (!cancelled) setError(err.message);
            } finally {
                if (!cancelled) setLoading(false);
            }
        }

        loadPDF();
        return () => {
            cancelled = true;
            if (pdfDocRef.current) {
                pdfDocRef.current.cleanup();
                pdfDocRef.current = null;
            }
        };
    }, [signedUrl]);

    // Render page
    async function renderPage(pageNum, pdf = pdfDocRef.current, scaleVal = scale) {
        if (!pdf) return;

        const pageObj = await pdf.getPage(pageNum);
        const viewport = pageObj.getViewport({ scale: scaleVal });

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        await pageObj.render({ canvasContext: ctx, viewport }).promise;
    }

    // Page navigation
    const goToPage = async (p) => {
        if (!pdfDocRef.current) return;
        const next = Math.max(1, Math.min(pdfDocRef.current.numPages, p));
        setPage(next);
        await renderPage(next);
    };

    // Re-render when scale changes
    useEffect(() => {
        if (!pdfDocRef.current) return;
        renderPage(page, pdfDocRef.current, scale);
    }, [scale, page]);

    // Watermark movement
    useEffect(() => {
        const timer = setInterval(() => {
            setWmPos({
                x: Math.random() * 70 + 5,
                y: Math.random() * 70 + 5,
            });
        }, 3000);

        return () => clearInterval(timer);
    }, []);

    // Block save/print shortcuts
    useEffect(() => {
        const handler = (e) => {
            if (e.ctrlKey && ["s", "p", "u"].includes(e.key.toLowerCase())) {
                e.preventDefault();
            }
        };
        window.addEventListener("keydown", handler);
        return () => window.removeEventListener("keydown", handler);
    }, []);

    const handleDownloadAttempt = () => {
        alert("Download disabled for protected content.");
    };

    return (
        <Box sx={{ width: "100%", bgcolor: "var(--textPrimary)", p: 1, borderRadius: 2 }} onContextMenu={(e) => e.preventDefault()}>
            {/* Controls */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <IconButton size="small" onClick={() => goToPage(page - 1)} disabled={page <= 1}>
                    <ArrowBackIosNewIcon sx={{ color: "var(--onPrimary)" }} />
                </IconButton>

                <Typography sx={{ color: "var(--onPrimary)" }}>{page}/{numPages || "—"}</Typography>

                <IconButton size="small" onClick={() => goToPage(page + 1)} disabled={page >= numPages}>
                    <ArrowForwardIosIcon sx={{ color: "var(--onPrimary)" }} />
                </IconButton>

                <Typography sx={{ color: "var(--onPrimary)", ml: 1 }}>Zoom</Typography>

                <IconButton size="small" onClick={() => setScale((s) => Math.max(0.5, s - 0.25))}>
                    <ZoomOutIcon sx={{ color: "var(--onPrimary)" }} />
                </IconButton>

                <Slider
                    value={scale}
                    min={0.5}
                    max={2.5}
                    step={0.1}
                    onChange={(e, v) => setScale(v)}
                    sx={{ width: 120 }}
                />

                <IconButton size="small" onClick={() => setScale((s) => Math.min(2.5, s + 0.25))}>
                    <ZoomInIcon sx={{ color: "var(--onPrimary)" }} />
                </IconButton>

                <Button variant="outlined" size="small" startIcon={<GetAppIcon />} sx={{ color: "var(--onPrimary)" }}
                    onClick={handleDownloadAttempt}>
                    Download
                </Button>

                <Typography sx={{ color: "var(--textSecondary)", ml: 1 }}>
                    {fileSize ? `${(fileSize / (1024 * 1024)).toFixed(2)} MB` : ""}
                </Typography>
            </Box>

            {/* Canvas */}
            <Box sx={{ mt: 4, position: "relative" }}>
                <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 6 }} />

                <Typography
                    className="sv-watermark"
                    sx={{
                        position: "absolute",
                        color: "rgba(255,255,255,0.25)",
                        fontSize: 14,
                        pointerEvents: "none",
                        top: `${wmPos.y}%`,
                        left: `${wmPos.x}%`,
                        transform: "translate(-50%, -50%)"
                    }}
                >
                    {user?.email || user?.username || "User"} • {new Date().toLocaleString()}
                </Typography>
            </Box>

            {loading && <Typography sx={{ color: "var(--onPrimary)", mt: 2 }}>Loading…</Typography>}
            {error && <Typography sx={{ color: "red", mt: 2 }}>{error}</Typography>}
        </Box>
    );
}
