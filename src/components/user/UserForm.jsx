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

/* -------------------- Validation Schema -------------------- */
const schema = (mode, resetPassword) =>
    yup.object({
        username: yup.string().required("Username is required"),
        email: yup.string().email("Invalid email").required("Email is required"),
        phonenumber: yup.string().required("Phone number is required"),

        role_id: yup
            .number()
            .transform((v) => (isNaN(v) ? undefined : v))
            .required("Role is required"),

        status: yup
            .string()
            .oneOf(["active", "inactive", "suspended", "deleted"])
            .required("Status is required"),

        suspended_reason: yup.string().when("status", {
            is: "suspended",
            then: (s) => s.required("Suspension reason required"),
            otherwise: (s) => s.notRequired(),
        }),

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
        <Box sx={{ px: 3, py: 1.5, background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
            <Typography fontWeight={600}>{title}</Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>{children}</Stack>
        </CardContent>
    </Card>
);

/* -------------------- Component -------------------- */
export default function UserForm({ mode = "create", user, onSuccess, onCancel, profileMode = false }) {
    const [details, setDetails] = useState(user?.details || "");
    const [loading, setLoading] = useState(false);
    const [confirmCancel, setConfirmCancel] = useState(false);
    const [resetPassword, setResetPassword] = useState(false);

    const { create, update } = useUser();
    const { roles, fetchAll: fetchAllRoles } = useRole();
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
            role_id: user?.role_id ?? undefined,
            status: user?.status || "active",
            email_verified: user?.email_verified || false,

            first_name: user?.first_name || "",
            last_name: user?.last_name || "",
            location: user?.location || "",
            timezone: user?.timezone || "UTC",
            language: user?.language || "en",

            password: "",
            confirmPassword: "",
            suspended_reason: user?.suspended_reason || "",
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
    }, []);

    /* ---------------- Submit ---------------- */
    const onSubmit = async (data) => {
        setLoading(true);
        const payload = {
            ...data,
            role_id: Number(data.role_id),
            details,
        };
        delete payload.confirmPassword;

        if (profileMode) {
            delete payload.role_id;
            delete payload.username;
            delete payload.email;
        }
        showLoader();
        try {
            if (mode === "create") {
                const res = await create(payload).unwrap();
                hideLoader();
                if (!errorValidation(res)) {
                    showSuccess("User created successfully");
                    onSuccess?.();
                } else {
                    showError("Failed to create user");
                }
            } else {
                const res = await update(user?.id, payload).unwrap();
                hideLoader();
                if (!errorValidation(res)) {
                    showSuccess("User updated successfully");
                    onSuccess?.();
                } else {
                    showError("Failed to update user");
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
        if (isDirty) setConfirmCancel(true);
        else onCancel();
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ width: "100%" }}>
            {!profileMode && <Typography variant="h6" fontWeight={500} m={3}>
                {mode === "create" ? "Create User" : "Edit User"}
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
                    <Controller name="timezone" control={control} render={({ field }) => (
                        <TextField {...field} label="Timezone" size="small" fullWidth />
                    )} />
                    <Controller name="language" control={control} render={({ field }) => (
                        <TextField {...field} label="Language" size="small" fullWidth />
                    )} />
                </Section>

                {/* Security */}
                {(mode === "create" || resetPassword) && (
                    <Section title="Security">
                        <Controller name="password" control={control} render={({ field }) => (
                            <TextField {...field} label="Password *" size="small" type="password" fullWidth InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <Tooltip title="Use strong password">
                                            <IconButton size="small">
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
                            <TextField {...field} label="Confirm Password *" size="small" type="password" fullWidth />
                        )} />
                    </Section>
                )}

                {mode === "edit" && (
                    <FormControlLabel
                        control={<Switch checked={resetPassword} onChange={(e) => setResetPassword(e.target.checked)} />}
                        label="Reset Password"
                    />
                )}

                {/* Role & Status */}
                {!profileMode && <Section title="Role & Status">
                    <Controller name="role_id" control={control} render={({ field }) => (
                        <TextField {...field} select label="Role *" size="small" fullWidth>
                            {(roles || []).map((r) => (
                                <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                            ))}
                        </TextField>
                    )} />
                    <Controller name="status" control={control} render={({ field }) => (
                        <TextField {...field} select label="Status *" size="small" fullWidth>
                            <MenuItem value="active">Active</MenuItem>
                            <MenuItem value="inactive">Inactive</MenuItem>
                            <MenuItem value="suspended">Suspended</MenuItem>
                            <MenuItem value="deleted">Deleted</MenuItem>
                        </TextField>
                    )} />
                    {status === "suspended" && (
                        <Controller name="suspended_reason" control={control} render={({ field }) => (
                            <TextField {...field} label="Suspension Reason *" size="small" fullWidth />
                        )} />
                    )}
                    <Controller disabled name="email_verified" control={control} render={({ field }) => (
                        <FormControlLabel control={<Switch {...field} checked={field.value} />} label="Email Verified" />
                    )} />
                </Section>
                }

                {!profileMode && <Section title="Additional Details">
                    <AdditionalDetails onChange={setDetails} />
                </Section>}
            </Stack>

            {/* Sticky Footer */}
            <Box sx={{ position: "sticky", bottom: 0, mt: 4, background: "#fff", borderTop: "1px solid #e5e7eb", boxShadow: "0 -4px 12px rgba(0,0,0,0.06)", zIndex: 10 }}>
                {Object.keys(errors).length > 0 && (
                    <Typography variant="caption" color="error" sx={{ px: 2 }}>
                        {Object.keys(errors).length} required field(s) missing
                    </Typography>
                )}
                <Box sx={{ p: 1, display: "flex", gap: 2 }}>
                    <Button fullWidth variant="contained" type="submit" disabled={!isValid || !isDirty || loading}>
                        {!profileMode ? (mode === "create" ? "Add User" : "Update User") : "Save Changes"}
                    </Button>
                    <Button fullWidth variant="outlined" onClick={handleCancel}>
                        Cancel
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
        </Box>
    );
}
