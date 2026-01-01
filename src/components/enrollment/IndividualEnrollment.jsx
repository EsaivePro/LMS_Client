import React from "react";
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Typography,
    Stack,
    Switch,
    FormControlLabel,
    Alert,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useForm, Controller, useWatch } from "react-hook-form";
import useEnrollment from "../../hooks/useEnrollment";
import { useState, useEffect } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";

/* ---------------- Section Wrapper ---------------- */
const Section = ({ title, children }) => (
    <Card variant="outlined">
        <Box sx={{ px: 3, py: 1.5, bgcolor: "var(--lightgrey)", borderBottom: "1px solid var(--lightgrey)" }}>
            <Typography fontWeight={600}>{title}</Typography>
        </Box>
        <CardContent>
            <Stack spacing={2}>{children}</Stack>
        </CardContent>
    </Card>
);

/* ---------------- Component ---------------- */
export default function IndividualEnrollment() {
    const { control, handleSubmit } = useForm({
        defaultValues: {
            course_ids: [], // array of selected course ids
            user_ids: "", // comma-separated user ids
            enrollment_type: "assigned",
            scheduled_start_at: "",
            scheduled_end_at: "",
            schedule_timezone: "UTC",
        },
    });

    const enrollmentType = useWatch({ control, name: "enrollment_type" });
    const scheduledStartWatch = useWatch({ control, name: "scheduled_start_at" });

    const startRef = React.useRef(null);
    const endRef = React.useRef(null);

    const toInputDateTime = (iso) => {
        if (!iso) return "";
        try {
            const d = new Date(iso);
            if (isNaN(d.getTime())) return "";
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            const hh = String(d.getHours()).padStart(2, "0");
            const min = String(d.getMinutes()).padStart(2, "0");
            return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
        } catch {
            return "";
        }
    };

    const fromInputDateTime = (localValue) => {
        if (!localValue) return null;
        try {
            // localValue is like 'YYYY-MM-DDTHH:MM' (no seconds, local timezone)
            const d = new Date(localValue);
            if (isNaN(d.getTime())) return null;
            return d.toISOString();
        } catch {
            return null;
        }
    };

    const { manualEnrollment, loading: enrollLoading, enrollmentCourses, fetchEnrollCourses } = useEnrollment();
    const [enrollResult, setEnrollResult] = useState(null);
    const [enrollError, setEnrollError] = useState(null);

    useEffect(() => {
        fetchEnrollCourses();
    }, [fetchEnrollCourses]);

    const submit = async (data) => {
        // prepare payload for multi-user multi-course flow
        const payload = {
            userIds: (data.user_ids || "")
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
                .map((v) => (isNaN(Number(v)) ? v : Number(v))),
            courseIds: data.course_ids || [],
            enrollmentType: data.enrollment_type,
            scheduledStartAt: data.scheduled_start_at || null,
            scheduledEndAt: data.scheduled_end_at || null,
            scheduleTimezone: data.schedule_timezone || "UTC",
        };

        // Use enrollment hook (calls manualEnrollUsers thunk)
        try {
            const action = await manualEnrollment(payload);
            const result = action?.payload || action;
            // normalize possible shapes
            const dataResp = result?.data?.response || result?.response || result || null;
            // Expecting { created, updated, total, createdCount, updatedCount }
            setEnrollResult(dataResp);
            setEnrollError(null);
        } catch (err) {
            setEnrollError(err?.message || String(err));
            setEnrollResult(null);
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit(submit)} className="individual-enroll">
            <style>{`
                .individual-enroll .MuiInputBase-root { position: relative; }
                .individual-enroll input[type=datetime-local] { padding-right: 44px; }
                .individual-enroll input[type=datetime-local]::-webkit-calendar-picker-indicator {
                    position: absolute;
                    right: 8px;
                    top: 50%;
                    transform: translateY(-50%);
                    opacity: 1;
                    width: 20px;
                    height: 20px;
                    cursor: pointer;
                    color: red;
                }
                /* Firefox uses different pseudo; ensure pointer cursor */
                .individual-enroll input[type=datetime-local]::-moz-focus-inner { border: 0; }
            `}</style>
            <Box sx={{ p: 3 }}>

                <Stack spacing={3}>
                    {/* Course */}
                    <Section title="Course">
                        <Controller
                            name="course_ids"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    select
                                    SelectProps={{ multiple: true }}
                                    label="Courses"
                                    size="small"
                                    fullWidth
                                >
                                    {enrollmentCourses.map((c) => (
                                        <MenuItem key={c.id} value={c.id}>
                                            {c.title}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            )}
                        />

                        <Controller
                            name="user_ids"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="User IDs (comma separated)"
                                    size="small"
                                    fullWidth
                                    placeholder="e.g. 12,34,56 or user1,user2"
                                />
                            )}
                        />

                        <Controller
                            name="enrollment_type"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} select label="Enrollment Type" size="small" fullWidth>
                                    <MenuItem value="free">Free</MenuItem>
                                    <MenuItem value="assigned">Assigned</MenuItem>
                                    <MenuItem value="scheduled">Scheduled</MenuItem>
                                </TextField>
                            )}
                        />
                    </Section>

                    {/* Schedule */}
                    {enrollmentType === "scheduled" && (
                        <Section title="Schedule">
                            <Controller
                                name="scheduled_start_at"
                                control={control}
                                render={({ field: { value, onChange, ...rest } }) => (
                                    <TextField
                                        {...rest}
                                        value={toInputDateTime(value)}
                                        onChange={(e) => onChange(fromInputDateTime(e.target.value))}
                                        type="datetime-local"
                                        label="Start Date & Time *"
                                        size="small"
                                        fullWidth
                                        InputLabelProps={{ shrink: true }}
                                        inputProps={{ step: 60 }}
                                        inputRef={startRef}
                                        onFocus={() => {
                                            const el = startRef.current;
                                            if (!el) return;
                                            if (typeof el.showPicker === "function") {
                                                try { el.showPicker(); } catch (e) { el.click(); }
                                            } else el.click();
                                        }}
                                        onKeyDown={(e) => e.preventDefault()}
                                    />
                                )}
                            />
                            <Controller
                                name="scheduled_end_at"
                                control={control}
                                render={({ field: { value, onChange, ...rest } }) => {
                                    const minVal = toInputDateTime(scheduledStartWatch) || undefined;
                                    return (
                                        <TextField
                                            {...rest}
                                            value={toInputDateTime(value)}
                                            onChange={(e) => onChange(fromInputDateTime(e.target.value))}
                                            type="datetime-local"
                                            label="End Date & Time"
                                            size="small"
                                            fullWidth
                                            InputLabelProps={{ shrink: true }}
                                            inputProps={{ step: 60, min: minVal }}
                                            inputRef={endRef}
                                            onFocus={() => {
                                                const el = endRef.current;
                                                if (!el) return;
                                                if (typeof el.showPicker === "function") {
                                                    try { el.showPicker(); } catch (e) { el.click(); }
                                                } else el.click();
                                            }}
                                            onKeyDown={(e) => e.preventDefault()}
                                        />
                                    );
                                }}
                            />
                            <Controller
                                name="schedule_timezone"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Timezone" size="small" fullWidth />
                                )}
                            />
                        </Section>
                    )}
                </Stack>

                {/* Footer */}
                <Box
                    sx={{
                        // position: "sticky",
                        bottom: 0,
                        mt: 4,
                        // p: 2,
                        // bgcolor: "white",
                        // borderTop: "1px solid #09090aff",
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                        zIndex: 10,
                    }}
                >
                    <Button variant="contained" type="submit" disabled={enrollLoading}>
                        {enrollLoading ? "Enrolling..." : "Enroll User(s)"}
                    </Button>
                </Box>
            </Box>
            {/* Result */}
            <Box sx={{ px: 3, mt: 3 }}>
                {enrollError && <Alert severity="error">{enrollError}</Alert>}

                {enrollResult && (
                    <Box sx={{ height: 300, mt: 2 }}>
                        <Typography fontWeight={600} sx={{ mb: 1 }}>
                            Enrollment Result
                        </Typography>
                        <DataGrid
                            rows={(() => {
                                const rows = [];
                                const created = enrollResult.created || enrollResult.createdRows || [];
                                const updated = enrollResult.updated || enrollResult.updatedRows || [];
                                created.forEach((r, i) => rows.push({ id: `c-${i}`, ...r, status: "created" }));
                                updated.forEach((r, i) => rows.push({ id: `u-${i}`, ...r, status: "updated" }));
                                return rows;
                            })()}
                            columns={[
                                { field: "id", headerName: "ID", width: 120 },
                                { field: "user_id", headerName: "User ID", width: 140 },
                                { field: "course_id", headerName: "Course ID", width: 140 },
                                { field: "status", headerName: "Status", width: 120 },
                            ]}
                            autoHeight
                            pageSize={10}
                            rowsPerPageOptions={[10, 25, 50]}
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
