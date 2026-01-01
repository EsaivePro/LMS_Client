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
    IconButton,
    Divider,
    Backdrop
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { httpClient } from "../../../apiClient/httpClient";
import { tokenStorage } from "../../../utils/tokenStorage.utils";
import { useAdmin } from "../../../hooks/useAdmin";
import useCommon from "../../../hooks/useCommon";
import GlobalAlert from "../../../components/common/alert/GlobalAlert.jsx";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { setPermissionsAPI } = useAdmin();
    const { showLoader, hideLoader } = useCommon();
    const [alert, setAlert] = useState({ open: false, type: "", message: "" });

    const [loginData, setLoginData] = useState({
        user: "",
        password: "",
        remember: false,
    });

    const [errors, setErrors] = useState({
        user: "",
        password: "",
    });

    const validate = () => {
        let newErrors = {};

        if (!loginData.user)
            newErrors.user = "Username / Email / Phone number is required";
        if (!loginData.password)
            newErrors.password = "Password is required";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = () => {
        if (!validate()) return;
        alert("Login Success!");
    };

    const handleChange = (e) => {
        setForm((prev) => ({
            ...prev,
            [e.target.name]: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        try {
            const resultAction = await login(loginData);
            const fulfilled = resultAction?.type && resultAction.type.endsWith('/fulfilled');
            if (!fulfilled) {
                setAlert({ open: true, type: "error", message: resultAction?.data?.message || "Login failed" });
                return;
            }

            // get user id from token storage (set by login thunk)
            const userStr = tokenStorage.getUserToken();
            const userObj = userStr ? JSON.parse(userStr) : null;
            const userId = userObj?.id || userObj?.userId || userObj?.user?.id;
            if (!userId) {
                setAlert({ open: true, type: "error", message: "Unable to determine user id after login." });
                navigate("/unauthorized", { replace: true });
                return;
            }

            showLoader("Fetching permissions...");
            const res = await httpClient.fetchPermissionByUserId(userId);
            const data = res?.data;
            if (data?.response?.length) {
                setPermissionsAPI(data.response);
                navigate("/", { replace: true });
            } else {
                navigate("/unauthorized", { replace: true });
            }
        } catch (err) {
            setAlert({ open: true, type: "error", message: err?.message || "Login failed" });
            navigate("/unauthorized", { replace: true });
        } finally {
            hideLoader();
        }
    };

    return (
        <Box
            sx={{
                width: "100vw",
                height: "100vh",
                backgroundImage: `url(/login/l1.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "right"
            }}
        >
            <Backdrop open={true} sx={{ zIndex: 1, backgroundColor: "rgba(0, 0, 0, 0.53)" }} />
            <Paper
                elevation={6}
                sx={{
                    position: "absolute", zIndex: 2,
                    width: { xs: "100%", sm: "420px", md: "480px" },
                    p: { xs: 3, sm: 4 },
                    textAlign: "center",
                    height: "100vh",
                    backdropFilter: "blur(15px)",
                    background: "rgba(255, 255, 255, 0.1)",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                {/* Top Section - Logo + Description */}
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        alignItems: "flex-end",   // Right align the logo and LMS
                        gap: 1,
                        mt: 2
                    }}
                >
                    {/* Logo + LMS (Right Aligned) */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-start",
                            width: "100%",
                            gap: 1
                        }}
                    >
                        <img src="/logo/EsaiLogo.png" alt="Logo" width="70" />

                        <Typography
                            variant="h4"
                            sx={{
                                color: "white",
                                fontWeight: 700,
                                letterSpacing: "2px"
                            }}
                        >
                            LMS
                        </Typography>
                    </Box>

                    {/* Description (Center Aligned) */}
                    <Box sx={{ width: "100%", display: "flex", justifyContent: "left", mt: 3 }}>
                        <Typography
                            variant="body2"
                            sx={{
                                textAlign: "center",
                                color: "#eee",
                                // fontSize: "13px",
                                // maxWidth: "90%",
                                lineHeight: 1.4
                            }}
                        >
                            Enhance your learning experience with powerful tools. Track your academic progress in one place. Continue growing your skills anytime, anywhere.
                        </Typography>
                    </Box>
                </Box>


                {/* Center Section - Login Form */}
                <Box
                    sx={{
                        width: "100%",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 2
                    }}
                >
                    <TextField
                        label="Email / Username / Phone number"
                        fullWidth
                        variant="filled"
                        value={loginData.user}
                        onChange={(e) =>
                            setLoginData({ ...loginData, user: e.target.value })
                        }
                        error={Boolean(errors.user)}
                        helperText={errors.user}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.9)",
                            borderRadius: "6px",
                        }}
                    />

                    <TextField
                        label="Password"
                        type="password"
                        fullWidth
                        variant="filled"
                        value={loginData.password}
                        onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                        }
                        error={Boolean(errors.password)}
                        helperText={errors.password}
                        sx={{
                            backgroundColor: "rgba(255,255,255,0.9)",
                            borderRadius: "6px",
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            alignItems: "center",
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    size="small"
                                    sx={{ color: "#fff" }}
                                    checked={loginData.remember}
                                    onChange={(e) =>
                                        setLoginData({ ...loginData, remember: e.target.checked })
                                    }
                                />
                            }
                            label={<Typography sx={{ color: "#fff", fontSize: 13 }}>Remember me</Typography>}
                        />

                        <Link href="#" sx={{ color: "#fff", fontSize: 13 }}>
                            Forgot password?
                        </Link>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{ backgroundColor: "#fff", color: "#333", fontWeight: 700 }}
                        onClick={handleSubmit}
                    >
                        LOGIN
                    </Button>

                    <Box sx={{ mt: 1 }}>
                        <IconButton sx={{ color: "#fff" }}>
                            <HelpOutlineIcon />
                        </IconButton>
                        <Typography variant="caption" sx={{ color: "#fff" }}>
                            Help & Support
                        </Typography>
                    </Box>
                </Box>

                {/* Bottom Section - Terms */}
                <Box sx={{ mb: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            color: "#ddd",
                            cursor: "pointer",
                            "&:hover": { textDecoration: "underline" }
                        }}
                    >
                        Terms & Conditions | Privacy Policy
                    </Typography>
                    <Divider sx={{ borderColor: "#ccc", mb: 1 }} />

                </Box>
            </Paper>
            <GlobalAlert alert={alert} setAlert={setAlert} />
        </Box>
    );
}
