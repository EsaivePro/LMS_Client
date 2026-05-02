import React, { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import {
    Box, Typography, TextField, MenuItem, Button, Stack,
    Card, CardContent, Radio, RadioGroup, FormControlLabel,
    FormLabel, Alert, Autocomplete, CircularProgress,
    Breadcrumbs, Link, Divider,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { enrollmentApi } from "../../../services/enrollmentApi";
import useCommon from "../../../hooks/useCommon";
import { useAuth } from "../../../hooks/useAuth";

const TIMEZONES = [
    "UTC", "Asia/Kolkata", "America/New_York", "America/Chicago",
    "America/Los_Angeles", "Europe/London", "Europe/Paris",
    "Asia/Tokyo", "Asia/Singapore", "Australia/Sydney",
];

const Section = ({ title, children }) => (
    <Card variant="outlined">
        <Box sx={{ px: 3, py: 1.5, bgcolor: "var(--lightgrey, #f5f5f5)", borderBottom: "1px solid #e0e0e0" }}>
            <Typography fontWeight={600}>{title}</Typography>
        </Box>
        <CardContent><Stack spacing={2}>{children}</Stack></CardContent>
    </Card>
);

const EMPTY = {
    user: null,
    module_type: "course",
    module: null,
    enrollment_type: "assigned",
    scheduled_start_at: "",
    scheduled_end_at: "",
    schedule_timezone: "UTC",
};

export default function EnrollUserPage() {
    const navigate = useNavigate();
    const { showSuccess, showError } = useCommon();
    const { user: admin } = useAuth();

    const [form, setForm] = useState(EMPTY);
    const [fieldErrors, setFieldErrors] = useState({});
    const [successMsg, setSuccessMsg] = useState("");
    const [warnMsg, setWarnMsg] = useState("");

    // Search states for async autocompletes
    const [userSearch, setUserSearch] = useState("");
    const [userOptions, setUserOptions] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [moduleSearch, setModuleSearch] = useState("");
    const [moduleOptions, setModuleOptions] = useState([]);
    const [moduleLoading, setModuleLoading] = useState(false);

    // Debounce user search
    useEffect(() => {
        if (!userSearch) { setUserOptions([]); return; }
        const t = setTimeout(async () => {
            setUserLoading(true);
            try {
                const res = await enrollmentApi.getUsersList(userSearch);
                setUserOptions(Array.isArray(res) ? res : []);
            } catch { setUserOptions([]); }
            finally { setUserLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [userSearch]);

    // Debounce module search (course or exam)
    useEffect(() => {
        if (!moduleSearch) { setModuleOptions([]); return; }
        const t = setTimeout(async () => {
            setModuleLoading(true);
            try {
                const res = form.module_type === "course"
                    ? await enrollmentApi.getCoursesList(moduleSearch)
                    : await enrollmentApi.getExamsList(moduleSearch);
                setModuleOptions(Array.isArray(res) ? res : []);
            } catch { setModuleOptions([]); }
            finally { setModuleLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [moduleSearch, form.module_type]);

    const set = (key, val) => setForm((p) => ({ ...p, [key]: val }));

    const validate = () => {
        const errs = {};
        if (!form.user) errs.user = "User is required";
        if (!form.module) errs.module = `${form.module_type === "course" ? "Course" : "Exam"} is required`;
        if (form.scheduled_start_at && form.scheduled_end_at &&
            form.scheduled_end_at < form.scheduled_start_at) {
            errs.scheduled_end_at = "End date must be after start date";
        }
        setFieldErrors(errs);
        return Object.keys(errs).length === 0;
    };

    const mutation = useMutation({
        mutationFn: (payload) => enrollmentApi.enrollUser(payload),
        onSuccess: () => {
            setSuccessMsg("Enrollment created successfully");
            setWarnMsg("");
            setFieldErrors({});
            setForm(EMPTY);
            setUserSearch("");
            setModuleSearch("");
        },
        onError: (err) => {
            const status = err?.status;
            if (status === 409) {
                setWarnMsg("User is already enrolled in this module");
            } else if (status === 400 && err?.data?.data?.errors) {
                const serverErrors = {};
                (err.data.data.errors ?? []).forEach((e) => {
                    serverErrors[e.field] = e.message;
                });
                setFieldErrors(serverErrors);
            } else {
                showError(err?.message || "Enrollment failed");
            }
        },
    });

    const handleSubmit = () => {
        setSuccessMsg("");
        setWarnMsg("");
        if (!validate()) return;
        mutation.mutate({
            user_id: form.user?.id ?? form.user?.user_id,
            module_type: form.module_type,
            module_id: form.module?.id,
            enrollment_type: form.enrollment_type,
            scheduled_start_at: form.scheduled_start_at || null,
            scheduled_end_at: form.scheduled_end_at || null,
            schedule_timezone: form.schedule_timezone,
            enrolled_by: admin?.id,
        });
    };

    const handleReset = () => {
        setForm(EMPTY);
        setFieldErrors({});
        setSuccessMsg("");
        setWarnMsg("");
        setUserSearch("");
        setModuleSearch("");
    };

    return (
        <Box sx={{ width: "100%" }}>
            {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
            {warnMsg && <Alert severity="warning" sx={{ mb: 2 }}>{warnMsg}</Alert>}

            <Stack spacing={3}>
                {/* Section 1: User & Module */}
                <Section title="User & Module">
                    {/* 1. User */}
                    <Autocomplete
                        options={userOptions}
                        getOptionLabel={(o) => `${o.first_name ?? ""} ${o.last_name ?? ""} (${o.email ?? ""})`.trim()}
                        loading={userLoading}
                        value={form.user}
                        onChange={(_, v) => set("user", v)}
                        onInputChange={(_, v) => setUserSearch(v)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="User *"
                                size="small"
                                error={!!fieldErrors.user}
                                helperText={fieldErrors.user}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {userLoading && <CircularProgress size={16} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />

                    {/* 2. Module Type */}
                    <Box>
                        <FormLabel sx={{ fontSize: 13, fontWeight: 600 }}>Module Type *</FormLabel>
                        <RadioGroup
                            row
                            value={form.module_type}
                            onChange={(e) => { set("module_type", e.target.value); set("module", null); setModuleSearch(""); }}
                        >
                            <FormControlLabel value="course" control={<Radio size="small" />} label="Course" />
                            <FormControlLabel value="exam" control={<Radio size="small" />} label="Exam" />
                        </RadioGroup>
                    </Box>

                    {/* 3. Course/Exam select */}
                    <Autocomplete
                        key={form.module_type}
                        options={moduleOptions}
                        getOptionLabel={(o) => o.title ?? o.name ?? String(o.id)}
                        loading={moduleLoading}
                        value={form.module}
                        onChange={(_, v) => set("module", v)}
                        onInputChange={(_, v) => setModuleSearch(v)}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label={`${form.module_type === "course" ? "Course" : "Exam"} *`}
                                size="small"
                                error={!!fieldErrors.module}
                                helperText={fieldErrors.module}
                                InputProps={{
                                    ...params.InputProps,
                                    endAdornment: (
                                        <>
                                            {moduleLoading && <CircularProgress size={16} />}
                                            {params.InputProps.endAdornment}
                                        </>
                                    ),
                                }}
                            />
                        )}
                    />
                </Section>

                {/* Section 2: Enrollment Settings */}
                <Section title="Enrollment Settings">
                    {/* 4. Enrollment Type */}
                    <TextField
                        select label="Enrollment Type" size="small" fullWidth
                        value={form.enrollment_type}
                        onChange={(e) => set("enrollment_type", e.target.value)}
                    >
                        <MenuItem value="assigned">Assigned</MenuItem>
                        <MenuItem value="self">Self</MenuItem>
                        <MenuItem value="mandatory">Mandatory</MenuItem>
                    </TextField>

                    {/* 5. Scheduled Start */}
                    <TextField
                        type="datetime-local" label="Scheduled Start Date" size="small" fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={form.scheduled_start_at}
                        onChange={(e) => set("scheduled_start_at", e.target.value)}
                    />

                    {/* 6. Scheduled End */}
                    <TextField
                        type="datetime-local" label="Scheduled End Date" size="small" fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: form.scheduled_start_at || undefined }}
                        value={form.scheduled_end_at}
                        error={!!fieldErrors.scheduled_end_at}
                        helperText={fieldErrors.scheduled_end_at}
                        onChange={(e) => set("scheduled_end_at", e.target.value)}
                    />

                    {/* 7. Timezone */}
                    <Autocomplete
                        options={TIMEZONES}
                        value={form.schedule_timezone}
                        onChange={(_, v) => set("schedule_timezone", v ?? "UTC")}
                        renderInput={(params) => (
                            <TextField {...params} label="Timezone" size="small" />
                        )}
                    />
                </Section>
            </Stack>

            <Divider sx={{ my: 3 }} />

            <Stack direction="row" spacing={2} justifyContent="flex-end">
                <Button variant="outlined" onClick={handleReset} disabled={mutation.isPending}>
                    Reset
                </Button>
                <Button variant="contained" onClick={handleSubmit} disabled={mutation.isPending}>
                    {mutation.isPending ? "Enrolling…" : "Enroll"}
                </Button>
            </Stack>
        </Box>
    );
}
