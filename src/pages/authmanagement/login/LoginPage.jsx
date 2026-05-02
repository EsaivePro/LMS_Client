import React, { useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import {
    Box,
    TextField,
    Button,
    Typography,
    FormControlLabel,
    Checkbox,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import useCommon from "../../../hooks/useCommon";
import { httpClient } from "../../../apiClient/httpClient";
import { tokenStorage } from "../../../utils/tokenStorage.utils";
import GlobalAlert from "../../../components/common/alert/GlobalAlert.jsx";
import THEME from "../../../constants/theme";
import deviceUtils from "../../../utils/device.utils";

const BRAND_GRADIENT = `linear-gradient(145deg, #0d0760 0%, ${THEME.colors.primary} 50%, #4158e0 100%)`;

/* ── Shared input field style ─────────────────────────────────────────────── */
function inputSx(primary) {
    return {
        "& .MuiOutlinedInput-root": {
            borderRadius: "12px",
            fontSize: "0.92rem",
            bgcolor: "#fff",
            "& fieldset": { borderColor: "#e2e8f0" },
            "&:hover fieldset": { borderColor: "#94a3b8" },
            "&.Mui-focused fieldset": { borderColor: primary, borderWidth: 2 },
        },
        "& input[type=password]::-ms-reveal": { display: "none" },
        "& input[type=password]::-ms-clear": { display: "none" },
    };
}

/* ── Login form (shared between mobile & desktop) ─────────────────────────── */
function LoginForm({ loginData, showPassword, formError, onUserChange, onPasswordChange,
    onTogglePassword, onSubmit, onForgotOpen, onTermsOpen, onRememberChange, navigate, isMobile }) {
    const primary = THEME.colors.primary;

    return (
        <form
            onSubmit={onSubmit}
            onKeyDown={(e) => {
                if (e.key === "Enter") {
                    const tag = e.target?.tagName?.toLowerCase();
                    if (tag === "input" || tag === "textarea") { e.preventDefault(); onSubmit(e); }
                }
            }}
            noValidate
        >
            {/* Heading */}
            <Typography sx={{ fontSize: isMobile ? "1.6rem" : "1.85rem", fontWeight: 800, color: "#0f172a", mb: 0.75, textAlign: "center", letterSpacing: "-0.01em" }}>
                Welcome back! 👋
            </Typography>
            <Typography sx={{ fontSize: "0.92rem", color: "#64748b", mb: isMobile ? 2.5 : 3.5, textAlign: "center" }}>
                Sign in to your account
            </Typography>

            {/* Error banner */}
            {formError && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2.5, px: 1.75, py: 1.1, bgcolor: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px" }}>
                    <Box sx={{ width: 7, height: 7, borderRadius: "50%", bgcolor: "#ef4444", flexShrink: 0 }} />
                    <Typography sx={{ fontSize: "0.83rem", color: "#dc2626" }}>{formError}</Typography>
                </Box>
            )}

            {/* Email */}
            <Typography sx={{ fontSize: "0.83rem", fontWeight: 700, color: "#1e293b", mb: 0.8 }}>
                Email address
            </Typography>
            <TextField
                placeholder="Enter your email"
                fullWidth
                value={loginData.user}
                onChange={onUserChange}
                error={!!formError && !loginData.user}
                sx={{ mb: 2, ...inputSx(primary) }}
                InputProps={{
                    sx: { py: 0.2 },
                    startAdornment: (
                        <InputAdornment position="start">
                            <EmailOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        </InputAdornment>
                    ),
                }}
            />

            {/* Password */}
            <Typography sx={{ fontSize: "0.83rem", fontWeight: 700, color: "#1e293b", mb: 0.8 }}>
                Password
            </Typography>
            <TextField
                placeholder="Enter your password"
                type={showPassword ? "text" : "password"}
                fullWidth
                value={loginData.password}
                onChange={onPasswordChange}
                error={!!formError && !loginData.password}
                sx={{ mb: isMobile ? 2.5 : 1.5, ...inputSx(primary) }}
                InputProps={{
                    sx: { py: 0.2 },
                    startAdornment: (
                        <InputAdornment position="start">
                            <LockOutlinedIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                        </InputAdornment>
                    ),
                    endAdornment: (
                        <InputAdornment position="end" sx={{ gap: 0.5 }}>
                            <Link
                                component="button"
                                type="button"
                                underline="none"
                                onClick={onForgotOpen}
                                sx={{ fontSize: "0.8rem", fontWeight: 600, color: primary, whiteSpace: "nowrap", mr: 0.5, "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}
                            >
                                Forgot password?
                            </Link>
                            <IconButton size="small" onClick={onTogglePassword} edge="end" sx={{ mr: -0.5 }}>
                                {showPassword
                                    ? <Visibility sx={{ fontSize: 18, color: "#94a3b8" }} />
                                    : <VisibilityOff sx={{ fontSize: 18, color: "#94a3b8" }} />}
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />

            {/* Remember me — desktop only */}
            {!isMobile && (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={loginData.remember}
                            onChange={onRememberChange}
                            size="small"
                            sx={{ color: "#cbd5e1", "&.Mui-checked": { color: primary } }}
                        />
                    }
                    label={<Typography sx={{ fontSize: "0.83rem", color: "#64748b" }}>Remember me</Typography>}
                    sx={{ mb: 2.5 }}
                />
            )}

            {/* Sign In */}
            <Button
                fullWidth
                variant="contained"
                type="submit"
                sx={{
                    py: 1.5, fontWeight: 700, fontSize: "1rem", textTransform: "none",
                    borderRadius: "12px", bgcolor: THEME.colors.dark, letterSpacing: "0.01em",
                    boxShadow: `0 6px 20px ${THEME.colors.dark}50`,
                    "&:hover": { bgcolor: THEME.colors.darkMedium, boxShadow: `0 8px 24px ${THEME.colors.dark}65` },
                }}
            >
                Sign In
            </Button>

            {/* Sign up */}
            <Typography sx={{ textAlign: "center", mt: 2.5, fontSize: "0.87rem", color: "#64748b" }}>
                Don't have an account?{" "}
                <Link
                    component="button" type="button" underline="none"
                    onClick={() => navigate("/user/register")}
                    sx={{ fontWeight: 700, color: THEME.colors.secondary || "#f59e0b", "&:hover": { textDecoration: "underline", bgcolor: "transparent" } }}
                >
                    Sign up
                </Link>
            </Typography>

            {/* Terms */}
            <Typography sx={{ textAlign: "center", mt: 1.5, fontSize: "0.75rem", color: "#94a3b8" }}>
                By signing in you agree to our{" "}
                <Link
                    component="button" type="button" underline="hover"
                    onClick={onTermsOpen}
                    sx={{ color: "#94a3b8", "&:hover": { bgcolor: "transparent" } }}
                >
                    Terms and Conditions
                </Link>
            </Typography>
        </form>
    );
}

/* ═══════════════════════════════════════════════════════════════════════════
   MAIN PAGE
═══════════════════════════════════════════════════════════════════════════ */
export default function LoginPage() {
    const navigate = useNavigate();
    const { login, user } = useAuth();
    const { setPermissionsAPI } = useAdmin();
    const { showLoader, hideLoader } = useCommon();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    const [alert, setAlert] = useState({ open: false, type: "", message: "" });
    const [loginData, setLoginData] = useState({ user: "", password: "", remember: false });
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");
    const [openForgot, setOpenForgot] = useState(false);
    const [openTerms, setOpenTerms] = useState(false);

    const validate = () => {
        if (!loginData.user || !loginData.password) {
            setFormError("Username and password are required.");
            return false;
        }
        setFormError("");
        return true;
    };

    const handleUserChange = (e) => {
        setLoginData((s) => ({ ...s, user: e.target.value }));
        if (formError) setFormError("");
    };

    const handlePasswordChange = (e) => {
        setLoginData((s) => ({ ...s, password: e.target.value }));
        if (formError) setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const device_id = deviceUtils.getDeviceId();
            const { device_type, device_info } = deviceUtils.getDeviceInfo();
            const ip_address = await deviceUtils.getPublicIp();
            const payload = { ...loginData, device_id, device_type, device_info, ip_address };

            const resultAction = await login(payload);
            if (!resultAction?.type?.endsWith("/fulfilled")) {
                setAlert({ open: true, type: "error", message: "Login failed" });
                return;
            }

            const userStr = tokenStorage.getUserToken();
            const userObj = userStr ? JSON.parse(userStr) : null;
            const userId = userObj?.id || userObj?.userId;

            showLoader("Fetching permissions...");
            const res = await httpClient.fetchPermissionByUserId(userId);

            if (res?.data?.response?.length) {
                setPermissionsAPI(res.data.response);
                navigate("/", { replace: true });
            } else {
                navigate("/unauthorized", { replace: true });
            }
        } catch {
            setAlert({ open: true, type: "error", message: "Login failed" });
            navigate("/unauthorized", { replace: true });
        } finally {
            hideLoader();
        }
    };

    useEffect(() => {
        if (user && (user.id || user.userId)) navigate("/", { replace: true });
    }, [user, navigate]);

    const logoSrc = THEME?.manifest?.icons?.[0]?.src
        ? `/${THEME.manifest.icons[0].src}`
        : "/logo/EsaiLogo.png";

    const formProps = {
        loginData, showPassword, formError,
        onUserChange: handleUserChange,
        onPasswordChange: handlePasswordChange,
        onTogglePassword: () => setShowPassword((s) => !s),
        onRememberChange: (e) => setLoginData((s) => ({ ...s, remember: e.target.checked })),
        onSubmit: handleSubmit,
        onForgotOpen: () => setOpenForgot(true),
        onTermsOpen: () => setOpenTerms(true),
        navigate,
    };

    /* ════════════════════════════════════════════════════════════════════════
       MOBILE LAYOUT  —  brand top + white bottom sheet
    ════════════════════════════════════════════════════════════════════════ */
    if (isMobile) {
        return (
            <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", width: "100%", bgcolor: "#0d0760" }}>

                {/* ── Top: brand section ── */}
                <Box
                    sx={{
                        background: BRAND_GRADIENT,
                        pt: "52px",
                        px: 3,
                        pb: 0,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "52vh",
                        position: "relative",
                        overflow: "hidden",
                    }}
                >
                    {/* Radial highlight */}
                    <Box sx={{
                        position: "absolute", top: -60, right: -60,
                        width: 300, height: 300, borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
                        pointerEvents: "none",
                    }} />

                    {/* Logo */}
                    <Box
                        component="img"
                        src={logoSrc}
                        alt="logo"
                        sx={{ width: 120, mb: 2.5, filter: "brightness(0) invert(1)", opacity: 0.95 }}
                    />

                    {/* Tagline */}
                    <Typography sx={{ fontSize: "2rem", fontWeight: 800, color: "#fff", lineHeight: 1.2, mb: 1.25, letterSpacing: "-0.02em" }}>
                        Learn. Grow.<br />Achieve.
                    </Typography>
                    <Typography sx={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.72)", lineHeight: 1.6, mb: 0 }}>
                        The all-in-one platform for<br />learning and growth.
                    </Typography>

                    {/* Illustration anchored to bottom of this section */}
                    <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", mt: 2 }}>
                        <Box
                            component="img"
                            src="/login/lms.png"
                            alt="LMS illustration"
                            sx={{
                                width: "92%",
                                maxWidth: 380,
                                display: "block",
                                mx: "auto",
                                filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.3))",
                                userSelect: "none",
                                pointerEvents: "none",
                            }}
                        />
                    </Box>
                </Box>

                {/* ── Bottom: white form sheet ── */}
                <Box
                    sx={{
                        bgcolor: "#fff",
                        borderRadius: "28px 28px 0 0",
                        mt: "-24px",
                        flex: 1,
                        px: 3,
                        pt: 2,
                        pb: 5,
                        overflowY: "auto",
                    }}
                >
                    {/* Drag handle */}
                    <Box sx={{ width: 40, height: 4, borderRadius: 2, bgcolor: "#e2e8f0", mx: "auto", mb: 2.5 }} />

                    <LoginForm {...formProps} isMobile={true} />
                </Box>

                <GlobalAlert alert={alert} setAlert={setAlert} />
                <ForgotDialog open={openForgot} onClose={() => setOpenForgot(false)} />
                <TermsDialog open={openTerms} onClose={() => setOpenTerms(false)} />
            </Box>
        );
    }

    /* ════════════════════════════════════════════════════════════════════════
       DESKTOP LAYOUT  —  left brand panel + right form panel
    ════════════════════════════════════════════════════════════════════════ */
    return (
        <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", bgcolor: "#f0f2ff" }}>

            {/* ── Left: brand panel ── */}
            <Box
                sx={{
                    width: "55%",
                    flexShrink: 0,
                    position: "relative",
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "0 40px 40px 0",
                    background: BRAND_GRADIENT,
                    p: { md: "40px 48px 0", lg: "48px 60px 0" },
                }}
            >
                <Box sx={{ position: "absolute", top: -80, right: -80, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

                <Box component="img" src={logoSrc} alt="logo"
                    sx={{ width: 140, mb: { md: 5, lg: 6 }, filter: "brightness(0) invert(1)", opacity: 0.95, display: "block" }}
                />

                <Typography sx={{ fontSize: { md: "2.4rem", lg: "3rem" }, fontWeight: 800, color: "#fff", lineHeight: 1.2, mb: 2, letterSpacing: "-0.02em" }}>
                    Learn. Grow.<br />Achieve.
                </Typography>

                <Typography sx={{ fontSize: { md: "1rem", lg: "1.1rem" }, color: "rgba(255,255,255,0.72)", lineHeight: 1.7, maxWidth: 380, mb: 4 }}>
                    The all-in-one platform for learning and growth.
                </Typography>

                <Box sx={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
                    <Box component="img" src="/login/lms.png" alt="LMS illustration"
                        sx={{ width: "100%", maxWidth: { md: 420, lg: 520 }, display: "block", mx: "auto", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))", userSelect: "none", pointerEvents: "none" }}
                    />
                </Box>
            </Box>

            {/* ── Right: form panel ── */}
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", bgcolor: "#fff", minHeight: "100vh", overflowY: "auto" }}>
                <Box sx={{ width: "100%", maxWidth: 420, px: { md: 5 }, py: { md: 0 } }}>
                    <LoginForm {...formProps} isMobile={false} />
                </Box>
            </Box>

            <GlobalAlert alert={alert} setAlert={setAlert} />
            <ForgotDialog open={openForgot} onClose={() => setOpenForgot(false)} />
            <TermsDialog open={openTerms} onClose={() => setOpenTerms(false)} />
        </Box>
    );
}

/* ── Dialog components ───────────────────────────────────────────────────── */
function ForgotDialog({ open, onClose }) {
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>
                Forgot Password
                <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Typography>Please contact your system administrator or IT support team to reset your password.</Typography>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}

function TermsDialog({ open, onClose }) {
    const terms = [
        "Authorized access only: this platform is for registered users with valid credentials.",
        "Account security: you are responsible for safeguarding your login and must not share credentials.",
        "Acceptable use: use the system only for legitimate learning and work-related activities.",
        "Prohibited behaviour: harassment, misuse, or disruption of services is forbidden.",
        "Intellectual property: course content is owned or licensed and must not be redistributed without permission.",
        "Privacy: personal data is processed according to your organization's privacy policy.",
        "Data retention: usage and progress data may be logged and retained for administrative purposes.",
        "Compliance: you must comply with applicable laws and organizational policies while using the LMS.",
        "Consequences: violations may result in access suspension, disciplinary action, or legal remedies.",
        "Support: contact your administrator or IT support for issues, access requests, or policy questions.",
    ];
    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>
                Terms and Conditions
                <IconButton onClick={onClose} sx={{ position: "absolute", right: 8, top: 8 }}><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                <Box component="ol" sx={{ pl: 3 }}>
                    {terms.map((text, i) => (
                        <Box component="li" key={i} sx={{ mb: 1 }}>
                            <Typography variant="body2">{text}</Typography>
                        </Box>
                    ))}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
