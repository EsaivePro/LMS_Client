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
    Divider,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Slide,
    IconButton,
    InputAdornment
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useAuth } from "../../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { httpClient } from "../../../apiClient/httpClient";
import { tokenStorage } from "../../../utils/tokenStorage.utils";
import { useAdmin } from "../../../hooks/useAdmin";
import useCommon from "../../../hooks/useCommon";
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

    const validate = () => {
        const newErrors = {};
        if (!loginData.user) newErrors.user = "Required";
        if (!loginData.password) newErrors.password = "Required";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
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

    const Transition = React.forwardRef(function Transition(props, ref) {
        return <Slide direction="up" ref={ref} {...props} />;
    });

    return (
        <Box sx={{ display: "flex", minHeight: "100vh", width: "100%", overflow: "hidden" }}>
            {/* LEFT – LOGIN FORM */}
            <Box
                sx={{
                    width: { xs: "100%", md: "50%" },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: THEME.colors.background,
                    overflowY: "auto"
                }}
            >
                <Paper elevation={0} sx={{ width: "100%", maxWidth: { xs: 420, md: 500 }, p: 4 }}>
                    {/* Logo */}
                    <Box sx={{ mb: 3 }}>
                        <img
                            src={
                                THEME?.manifest?.icons?.[0]?.src
                                    ? `/${THEME.manifest.icons[0].src}`
                                    : "/logo/EsaiLogo.png"
                            }
                            alt="logo"
                            width={170}
                        />
                    </Box>

                    <Typography
                        variant="h4"
                        fontWeight={800}
                        sx={{ color: THEME.colors.dark, mb: 1 }}
                    >
                        Welcome back to {THEME.manifest?.name || 'the LMS'}
                    </Typography>

                    <Typography
                        variant="body1"
                        sx={{ color: THEME.colors.textSecondary, mb: 1.5 }}
                    >
                        Sign in to continue to your dashboard.
                    </Typography>

                    <TextField
                        label="Username"
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={loginData.user}
                        onChange={(e) => setLoginData({ ...loginData, user: e.target.value })}
                        error={!!errors.user}
                        helperText={errors.user}
                        sx={{
                            borderRadius: 1,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: THEME.colors.darkLight },
                                '&:hover fieldset': { borderColor: THEME.colors.darkMedium },
                                '&.Mui-focused fieldset': { borderColor: THEME.colors.dark }
                            }
                        }}
                    />

                    <TextField
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        fullWidth
                        margin="normal"
                        variant="outlined"
                        value={loginData.password}
                        onChange={(e) =>
                            setLoginData({ ...loginData, password: e.target.value })
                        }
                        error={!!errors.password}
                        helperText={errors.password}
                        sx={{
                            borderRadius: 1,
                            '& .MuiOutlinedInput-root': {
                                '& fieldset': { borderColor: THEME.colors.darkLight },
                                '&:hover fieldset': { borderColor: THEME.colors.darkMedium },
                                '&.Mui-focused fieldset': { borderColor: THEME.colors.dark }
                            }
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                                        onClick={() => setShowPassword((s) => !s)}
                                        onMouseDown={(e) => e.preventDefault()}
                                        edge="end"
                                    >
                                        {showPassword ? <Visibility /> : <VisibilityOff />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mt: 1
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
                                />
                            }
                            label="Remember me"
                        />
                        <Link component="button" sx={{ color: THEME.colors.primary }} onClick={() => setOpenForgot(true)} underline="hover">
                            Forgot password ?
                        </Link>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        sx={{
                            mt: 3,
                            py: 1.3,
                            fontWeight: 700,
                            backgroundColor: THEME.colors.dark,
                            "&:hover": { backgroundColor: THEME.colors.darkMedium }
                        }}
                        onClick={handleSubmit}
                    >
                        Sign in
                    </Button>

                    <Typography variant="body2" align="center" sx={{ mt: 3 }}>
                        By signing in you agree to our{' '}
                        <Link component="button" sx={{ color: THEME.colors.primary }} onClick={() => setOpenTerms(true)}>
                            Terms and Conditions
                        </Link>
                        .
                    </Typography>
                </Paper>
            </Box>

            {/* RIGHT – IMAGE */}
            <Box
                sx={{
                    width: "50%",
                    display: { xs: "none", md: "block" },
                    backgroundImage: `url(/login/l1.png)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    position: "relative",
                    minHeight: "100vh",
                    overflow: "hidden"
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        color: "#fff",
                        m: 4,
                        backgroundColor: "rgba(0, 0, 0, 0.63)",
                        p: 2,
                        borderRadius: 2
                    }}
                >
                    {/* <Typography variant="body1" fontWeight={500}>
                        {THEME.manifest?.description
                            ? `"${THEME.manifest.description}"`
                            : "Bring your ideas to life."}
                    </Typography> */}
                    {/* <Typography variant="body1" sx={{ mt: 1 }}>
                        Sign up for free and enjoy access to all features for 30 days.
                        No credit card required.
                    </Typography> */}
                </Box>
            </Box>

            <GlobalAlert alert={alert} setAlert={setAlert} />

            {/* Forgot password Slide Dialog */}
            <Dialog
                open={openForgot}
                onClose={() => setOpenForgot(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>
                    Forget Password
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenForgot(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="body1" gutterBottom>
                        For forget passowrd, please contact your system administrator or IT support team. They can
                        verify your account and securely reset your password for you.
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        If you do not know who your administrator is, please reach out to your organization's
                        helpdesk or the person who provided access to this LMS platform.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenForgot(false)}>Close</Button>
                </DialogActions>
            </Dialog>

            {/* Terms and Conditions Dialog */}
            <Dialog
                open={openTerms}
                onClose={() => setOpenTerms(false)}
                fullWidth
                maxWidth="md"
            >
                <DialogTitle>
                    Terms and Conditions
                    <IconButton
                        aria-label="close"
                        onClick={() => setOpenTerms(false)}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Typography paragraph>
                        Welcome to the LMS platform. These Terms and Conditions govern your access to and use of the
                        learning management system provided by your organization. The platform is intended to deliver
                        course content, assessments, learning analytics, and collaboration tools to authorized users.
                        Access is restricted to individuals granted accounts by an administrator. Users must keep their
                        credentials secure and must not share access with others. The use of the platform must comply
                        with your organization's acceptable use policies and any specific course or program rules.
                    </Typography>
                    <Typography paragraph>
                        The platform may collect usage data and course progress for administrative and educational
                        purposes. Such data is processed in accordance with applicable privacy laws and your
                        organization's privacy policy. Personal data will be used to provide functionality such as
                        grading, certification tracking, and personalized learning recommendations. By using the
                        platform you consent to this processing as permitted by your organization.
                    </Typography>
                    <Typography paragraph>
                        Intellectual property rights in course materials are owned by the respective content
                        providers or your organization. You may access and use materials for learning purposes only;
                        reproduction, distribution, or commercial use without permission is prohibited. You agree not
                        to attempt unauthorized access to restricted areas of the platform or to interfere with the
                        normal operation of the service.
                    </Typography>
                    <Typography paragraph>
                        The platform is provided on an "as is" basis. Your organization may restrict or remove access
                        for violations of these Terms or other policies. Liability for direct or indirect damages
                        arising from platform use is limited to the extent permitted by law. If you have questions or
                        require special accommodations, contact your administrator or helpdesk for assistance.
                    </Typography>
                    <Typography paragraph>
                        By continuing to sign in and use this platform you acknowledge that you have read and agree
                        to abide by these Terms and any additional policies your organization has published. These
                        Terms may be updated from time to time; continued use following changes constitutes
                        acceptance of the revised terms.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenTerms(false)}>Close</Button>
                </DialogActions>
            </Dialog>
        </Box >
    );
}
