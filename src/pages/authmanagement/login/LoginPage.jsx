import React, { useState } from "react";
import {
    Box,
    TextField,
    Button,
    Typography,
    Paper,
    FormControlLabel,
    Checkbox,
    Link,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    InputAdornment
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ErrorOutline from '@mui/icons-material/ErrorOutline';

import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useAdmin } from "../../../hooks/useAdmin";
import useCommon from "../../../hooks/useCommon";
import { httpClient } from "../../../apiClient/httpClient";
import { tokenStorage } from "../../../utils/tokenStorage.utils";
import GlobalAlert from "../../../components/common/alert/GlobalAlert.jsx";
import THEME from "../../../constants/theme";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setPermissionsAPI } = useAdmin();
    const { showLoader, hideLoader } = useCommon();

    const [alert, setAlert] = useState({ open: false, type: "", message: "" });
    const [loginData, setLoginData] = useState({
        user: "",
        password: "",
        remember: false
    });
    const [errors, setErrors] = useState({});
    const [openForgot, setOpenForgot] = useState(false);
    const [openTerms, setOpenTerms] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formError, setFormError] = useState("");

    const validate = () => {
        // show single, form-level error when either field is missing
        if (!loginData.user || !loginData.password) {
            setFormError("Username and Password are required.");
            setErrors({});
            return false;
        }
        setFormError("");
        setErrors({});
        return true;
    };

    const handleUserChange = (e) => {
        const value = e.target.value;
        setLoginData((s) => ({ ...s, user: value }));
        if (formError) setFormError("");
    };

    const handlePasswordChange = (e) => {
        const value = e.target.value;
        setLoginData((s) => ({ ...s, password: value }));
        if (formError) setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        try {
            const resultAction = await login(loginData);
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
        } catch (err) {
            setAlert({ open: true, type: "error", message: "Login failed" });
            navigate("/unauthorized", { replace: true });
        } finally {
            hideLoader();
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                backgroundImage: "url(/login/l1.png)",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "center", md: "end" },
                position: "relative"
            }}
        >
            {/* THEME OVERLAY */}
            <Box
                sx={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(
                        180deg,
                        ${THEME.colors.dark}CC,
                        ${THEME.colors.darkMedium}AA
                    )`
                }}
            />

            {/* LOGIN CARD */}
            <Paper
                elevation={8}
                sx={{
                    position: "relative",
                    zIndex: 1,
                    width: "100%",
                    height: { xs: "auto", md: "100vh" },
                    maxWidth: { xs: 400, md: 500 },
                    mx: { xs: 2, md: 0 },
                    p: 4,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    borderRadius: 2,
                    backgroundColor: "#ffffffd7"
                }}
            >
                <form onSubmit={handleSubmit} noValidate>
                    {/* LOGO */}
                    <Box sx={{ mb: 3, textAlign: "center" }}>
                        <img
                            src={
                                THEME?.manifest?.icons?.[0]?.src
                                    ? `/${THEME.manifest.icons[0].src}`
                                    : "/logo/EsaiLogo.png"
                            }
                            alt="logo"
                            width={160}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{ color: THEME.colors.dark, mb: 1, textAlign: "center" }}
                    >
                        Welcome back to {THEME.manifest.name}!
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{
                            color: THEME.colors.textSecondary,
                            mb: 2,
                            textAlign: "center"
                        }}
                    >
                        Sign in to continue
                    </Typography>

                    {formError && (
                        <Typography variant="body2" color="error" sx={{ mb: 2, textAlign: 'center' }}>
                            {formError}
                        </Typography>
                    )}

                    {/* USERNAME */}
                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        value={loginData.user}
                        onChange={handleUserChange}
                        error={!!errors.user}
                        InputProps={{
                            startAdornment: (
                                formError ? (
                                    <InputAdornment position="start">
                                        <ErrorOutline sx={{ color: THEME.colors.danger }} />
                                    </InputAdornment>
                                ) : null
                            )
                        }}

                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: THEME.colors.darkLight
                                },
                                "&:hover fieldset": {
                                    borderColor: THEME.colors.darkMedium
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: THEME.colors.dark
                                }
                            }
                        }}
                    />

                    {/* PASSWORD */}
                    <TextField
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        fullWidth
                        margin="normal"
                        value={loginData.password}
                        onChange={handlePasswordChange}
                        error={!!errors.password}
                        sx={{
                            "& .MuiOutlinedInput-root": {
                                "& fieldset": {
                                    borderColor: THEME.colors.darkLight
                                },
                                "&:hover fieldset": {
                                    borderColor: THEME.colors.darkMedium
                                },
                                "&.Mui-focused fieldset": {
                                    borderColor: THEME.colors.dark
                                }
                            },
                            // Hide built-in browser password reveal/clear buttons
                            '& input[type=password]::-ms-reveal': { display: 'none' },
                            '& input[type=password]::-ms-clear': { display: 'none' },
                            '& input[type=password]::-webkit-textfield-decoration-container': { display: 'none' },
                            '& input::-webkit-credentials-auto-fill-button': { display: 'none' },
                            '& input::-webkit-autofill-button': { display: 'none' }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => setShowPassword((s) => !s)}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    {/* REMEMBER / FORGOT - single line */}
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1,
                            flexWrap: 'nowrap'
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={loginData.remember}
                                    onChange={(e) =>
                                        setLoginData({
                                            ...loginData,
                                            remember: e.target.checked
                                        })
                                    }
                                    size="small"
                                />
                            }
                            label="Remember me"
                            sx={{ whiteSpace: 'nowrap', mr: 2 }}
                        />

                        <Link
                            component="button"
                            underline="hover"
                            sx={{ color: THEME.colors.primary, whiteSpace: 'nowrap', ml: 'auto' }}
                            onClick={() => setOpenForgot(true)}
                        >
                            Forgot password?
                        </Link>
                    </Box>

                    {/* SIGN IN */}
                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            py: 1.3,
                            fontWeight: 700,
                            backgroundColor: THEME.colors.dark,
                            "&:hover": {
                                backgroundColor: THEME.colors.darkMedium
                            }
                        }}
                        type="submit"
                        onClick={handleSubmit}
                    >
                        Sign in
                    </Button>

                    <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                        By signing in you agree to our{" "}
                        <Link
                            component="button"
                            sx={{ color: THEME.colors.primary }}
                            onClick={() => setOpenTerms(true)}
                        >
                            Terms and Conditions
                        </Link>
                    </Typography>
                </form>
            </Paper>

            <GlobalAlert alert={alert} setAlert={setAlert} />

            {/* FORGOT PASSWORD */}
            <Dialog open={openForgot} onClose={() => setOpenForgot(false)} fullWidth maxWidth="sm">
                <DialogTitle>
                    Forgot Password
                    <IconButton
                        onClick={() => setOpenForgot(false)}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography>
                        Please contact your system administrator or IT support team to reset your password.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForgot(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* TERMS */}
            <Dialog open={openTerms} onClose={() => setOpenTerms(false)} fullWidth maxWidth="md">
                <DialogTitle>
                    Terms and Conditions
                    <IconButton
                        onClick={() => setOpenTerms(false)}
                        sx={{ position: "absolute", right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography paragraph>
                        This LMS platform is intended for authorized users only.
                        Usage is governed by your organization’s policies.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTerms(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
