import React, { useState } from "react";
import {
    Dialog, DialogTitle, DialogContent, DialogActions,
    Button, Typography, TextField, MenuItem, Stack, Divider,
} from "@mui/material";

const TIMEZONES = ["UTC", "Asia/Kolkata", "America/New_York", "America/Chicago",
    "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore"];

export default function BulkEnrollModal({
    open,
    userCount = 0,
    moduleCount = 0,
    userIds = "",
    onConfirm,
    onCancel,
    loading = false,
}) {
    const [enrollmentType, setEnrollmentType] = useState("assigned");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [timezone, setTimezone] = useState("UTC");

    const handleConfirm = () => {
        onConfirm({
            enrollment_type: enrollmentType,
            scheduled_start_at: startDate || null,
            scheduled_end_at: endDate || null,
            schedule_timezone: timezone,
            ...(userIds ? { userIds } : {}),
        });
    };

    return (
        <Dialog open={open} onClose={onCancel} maxWidth="sm" fullWidth>
            <DialogTitle>Bulk Enroll Users</DialogTitle>
            <DialogContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    <strong>{userCount}</strong> user{userCount !== 1 ? "s" : ""} will be enrolled
                    into <strong>{moduleCount}</strong> module{moduleCount !== 1 ? "s" : ""}.
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack spacing={2}>
                    <TextField
                        select
                        label="Enrollment Type"
                        size="small"
                        fullWidth
                        value={enrollmentType}
                        onChange={(e) => setEnrollmentType(e.target.value)}
                    >
                        <MenuItem value="assigned">Assigned</MenuItem>
                        <MenuItem value="self">Self</MenuItem>
                        <MenuItem value="mandatory">Mandatory</MenuItem>
                    </TextField>

                    <TextField
                        type="date"
                        label="Scheduled Start Date (optional)"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                    />

                    <TextField
                        type="date"
                        label="Scheduled End Date (optional)"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: startDate || undefined }}
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                    />

                    <TextField
                        select
                        label="Timezone"
                        size="small"
                        fullWidth
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                    >
                        {TIMEZONES.map((tz) => (
                            <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                        ))}
                    </TextField>
                </Stack>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                <Button variant="outlined" onClick={onCancel} disabled={loading}>
                    Cancel
                </Button>
                <Button variant="contained" onClick={handleConfirm} disabled={loading}>
                    {loading ? "Enrolling…" : "Confirm Enroll"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
