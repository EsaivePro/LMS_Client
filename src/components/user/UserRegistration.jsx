import React, { useEffect, useState } from "react";
import {
    Box,
    TextField,
    Button,
    MenuItem,
    Typography,
    Switch,
    FormControlLabel,
    LinearProgress,
    Tooltip,
    IconButton,
    InputAdornment,
    Card,
    CardContent,
    Stack,
} from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LoginIcon from '@mui/icons-material/Login';
import { useNavigate } from "react-router-dom";
import { useForm, Controller, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import zxcvbn from "zxcvbn";
import AdditionalDetails from "./AdditionalDetails";
import ShowPopup from "../../components/common/dialog/ShowPopup";
import useUser from "../../hooks/useUser";
import useCommon from "../../hooks/useCommon";
import { errorValidation } from "../../utils/resolver.utils";
import useRole from "../../hooks/useRole";
import useGroup from "../../hooks/useGroup";

/* -------------------- Validation Schema -------------------- */
const schema = (mode, resetPassword) =>
    yup.object({
        username: yup.string().required("Username is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
        phonenumber: yup.string().required("Phone number is required"),

        password:
            mode === "create" || resetPassword
                ? yup.string().min(6, "Min 6 characters").required("Password required")
                : yup.string().notRequired(),

        confirmPassword:
            mode === "create" || resetPassword
                ? yup
                    .string()
                    .oneOf([yup.ref("password")], "Passwords do not match")
                    .required("Confirm password required")
                : yup.string().notRequired(),

        group_id: yup
            .number()
            .transform((value, originalValue) => (originalValue === "" || originalValue === null ? undefined : value))
            .typeError("Class Type is required")
            .required("Class Type is required")
            .moreThan(0, "Select a valid class type"),
        email_verified: yup.boolean(),
        // first_name: yup.string().required("First name required"),
        // last_name: yup.string().required("Last name required"),
        // location: yup.string().required("Location required"),
        // timezone: yup.string().required("Timezone required"),
        // language: yup.string().required("Language required"),
    });

/* -------------------- Section Card -------------------- */
const Section = ({ title, children }) => (
    <Card variant="outlined" sx={{ width: "100%" }}>
        <Box sx={{ px: 3, py: 1.5, background: "var(--surface)", borderBottom: "1px solid var(--lightgrey)" }}>
            <Typography fontWeight={600}>{title}</Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>{children}</Stack>
        </CardContent>
    </Card>
);

/* -------------------- Component -------------------- */
export default function UserRegistration({ mode = "create", user, onSuccess, onCancel, profileMode = false }) {
    const navigate = useNavigate();
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [details, setDetails] = useState(user?.details || "");
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);

    const { create, update } = useUser();
    const { roles, fetchAll: fetchAllRoles } = useRole();
    const { groups, loadGroups } = useGroup();
    const { showLoader, hideLoader, showSuccess, showError } = useCommon();

    const {
        control,
        handleSubmit,
        formState: { errors, isValid, isDirty },
    } = useForm({
        resolver: yupResolver(schema(mode, resetPassword)),
        mode: "onChange",
        defaultValues: {
            username: user?.username || "",
            email: user?.email || "",
            phonenumber: user?.phonenumber || "",
            role_id: 2,
            group_id: user?.group_id || "",
            status: "active",
            email_verified: user?.email_verified || false,

            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            location: user?.location || "",
            timezone: "",
            language: user?.language || "en",

            password: "",
            confirmPassword: ""
        },
    });

    /* ---------------- Watchers ---------------- */
    const password = useWatch({ control, name: "password" }) || "";
    const status = useWatch({ control, name: "status" });

    const strength = zxcvbn(password);
    const strengthPercent = (strength.score / 4) * 100;
    const strengthLabel = ["Very Weak", "Weak", "Fair", "Good", "Strong"][strength.score];

    /* ---------------- Scroll to first error ---------------- */
    useEffect(() => {
        const first = Object.keys(errors)[0];
        if (first) {
            const el = document.querySelector(`[name="${first}"]`);
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
            el?.focus();
        }
    }, [errors]);

    useEffect(() => {
        // if (!roles || !roles.length) fetchAllRoles();
        loadGroups();
    }, []);

    /* ---------------- Submit ---------------- */
    const onSubmit = async (data) => {
        setLoading(true);
        const selectedGroupId = data.group_id ?? user?.group_id ?? (groups?.[0]?.id ?? undefined);
        const payload = {
            ...data,
            role_id: Number(2), // Default to Student role
            status: "active",
            group_id: selectedGroupId ? Number(selectedGroupId) : undefined,
            details,
        };
        delete payload.confirmPassword;
        showLoader();
        try {
            if (mode === "create") {
                const res = await create(payload).unwrap();
                hideLoader();
                if (!errorValidation(res)) {
                    showSuccess("User created successfully");
                    onSuccess?.();
                    navigate('/login');
                } else {
                    // showError("Failed to create user");
                }
            }
        } catch (err) {
            hideLoader();
            showError(err?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    /* ---------------- Cancel ---------------- */
    const handleCancel = () => {

    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
            {!profileMode && <Typography variant="h6" fontWeight={500} my={3} sx={{ color: "var(--dark)" }} >
                {mode === "create" ? "Create Account" : "Edit User"}
            </Typography>}
            <Stack spacing={3}>
                {/* Account */}
                <Section title="Account Information">
                    <Controller name="username" control={control} render={({ field }) => (
                        <TextField {...field} label="Username *" disabled={profileMode} size="small" fullWidth error={!!errors.username} helperText={errors.username?.message} />
                    )} />
                    <Controller name="email" control={control} render={({ field }) => (
                        <TextField {...field} label="Email *" disabled={profileMode} size="small" fullWidth error={!!errors.email} helperText={errors.email?.message} />
                    )} />
                    <Controller name="phonenumber" control={control} render={({ field }) => (
                        <TextField {...field} label="Phone Number *" size="small" fullWidth error={!!errors.phonenumber} helperText={errors.phonenumber?.message} />
                    )} />
                </Section>

                {/* Profile */}
                <Section title="Profile">
                    <Controller name="first_name" control={control} render={({ field }) => (
                        <TextField {...field} label="First Name" size="small" fullWidth />
                    )} />
                    <Controller name="last_name" control={control} render={({ field }) => (
                        <TextField {...field} label="Last Name" size="small" fullWidth />
                    )} />
                    <Controller name="location" control={control} render={({ field }) => (
                        <TextField {...field} label="Location" size="small" fullWidth />
                    )} />
                    {/* <Controller name="timezone" control={control} render={({ field }) => (
                        <TextField {...field} label="Timezone" size="small" fullWidth />
                    )} />
                    <Controller name="language" control={control} render={({ field }) => (
                        <TextField {...field} label="Language" size="small" fullWidth />
                    )} /> */}
                </Section>

                {/* Group */}
                <Section title="Class Group">
                    <Controller name="group_id" control={control} render={({ field }) => (
                        <TextField
                            {...field}
                            label="Class Type *"
                            size="small"
                            select
                            fullWidth
                            error={!!errors.group_id}
                            helperText={errors.group_id?.message}
                        >
                            {groups?.map((g) => (
                                <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>
                            ))}
                        </TextField>
                    )} />
                </Section>

                {/* Security */}
                {(mode === "create" || resetPassword) && (
                    <Section title="Security">
                        <Controller name="password" control={control} render={({ field }) => (
                            <TextField {...field} label="Password *" size="small" type="password" fullWidth InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip
                                            title={
                                                <Box sx={{ maxWidth: 280 }}>
                                                    <Typography variant="subtitle2">Use a strong password</Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                        Example: <strong>ImpulseUser@123</strong>
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                                                        Tip: mix letters, numbers & symbols (min 8 chars).
                                                    </Typography>
                                                </Box>
                                            }
                                            arrow
                                        >
                                            <IconButton size="small" aria-label="password-hint">
                                                <InfoOutlinedIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </InputAdornment>
                                ),
                            }} />
                        )} />
                        {password && (
                            <Box>
                                <LinearProgress value={strengthPercent} variant="determinate" />
                                <Typography variant="caption">Strength: {strengthLabel}</Typography>
                            </Box>
                        )}
                        <Controller name="confirmPassword" control={control} render={({ field }) => (
                            <TextField
                                {...field}
                                label="Confirm Password *"
                                size="small"
                                type={showConfirmPassword ? 'text' : 'password'}
                                fullWidth
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                size="small"
                                                aria-label="toggle confirm password visibility"
                                                onClick={() => setShowConfirmPassword((s) => !s)}
                                                onMouseDown={(e) => e.preventDefault()}
                                            >
                                                {showConfirmPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        )} />
                    </Section>
                )}

                {mode === "edit" && (
                    <FormControlLabel
                        control={<Switch checked={resetPassword} onChange={(e) => setResetPassword(e.target.checked)} />}
                        label="Reset Password"
                    />
                )}

                {/* {!profileMode && <Section title="Additional Details">
                    <AdditionalDetails onChange={setDetails} />
                </Section>} */}
            </Stack>

            {/* Sticky Footer */}
            <Box sx={{ position: "sticky", bottom: 0, mt: 4, background: "var(--surface)", borderTop: "1px solid var(--lightgrey)", boxShadow: "0 -4px 12px rgba(0,0,0,0.06)", zIndex: 10 }}>
                {Object.keys(errors).length > 0 && (
                    <Typography variant="caption" color="error" sx={{ px: 2 }}>
                        {Object.keys(errors).length} required field(s) missing
                    </Typography>
                )}
                <Box sx={{ p: 1, display: "flex", justifyContent: "end", gap: 2 }}>
                    <Button
                        variant="contained"
                        type="submit"
                        startIcon={<PersonAddIcon />}
                        sx={{
                            backgroundColor: "var(--primary)",
                            color: "#fff",
                            '&:hover': { backgroundColor: 'var(--primary)' },
                        }}
                    >
                        Register
                    </Button>
                    <Button
                        variant="outlined"
                        type="button"
                        startIcon={<LoginIcon />}
                        onClick={() => navigate('/login')}
                        sx={{
                            borderColor: "var(--primary)",
                            color: "var(--primary)",
                        }}
                    >
                        Back to Sign In
                    </Button>
                </Box>
            </Box>

            {/* Unsaved changes dialog */}
            <ShowPopup
                open={confirmCancel}
                onClose={() => setConfirmCancel(false)}
                title="Discard changes?"
                onSubmit={onCancel}
                submitLabel="Sure"
                cancelLabel="Cancel"
            >
                <Box mt={1}>
                    <Box mb={2}>
                        Are you sure want to discard the changes?
                    </Box>
                </Box>
            </ShowPopup>
            {/* <Dialog open={confirmCancel} onClose={() => setConfirmCancel(false)}>
                <DialogTitle>Discard changes?</DialogTitle>
                <DialogContent>
                    <Typography></Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setConfirmCancel(false)}>No</Button>
                    <Button color="error" onClick={onCancel}>Yes</Button>
                </DialogActions>
            </Dialog> */}
        </Box >
    );
}
