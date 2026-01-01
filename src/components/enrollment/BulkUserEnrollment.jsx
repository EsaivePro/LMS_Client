import React, { useState } from "react";
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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ShowPopup from "../common/dialog/ShowPopup";

/* ---------------- Section ---------------- */
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
export default function BulkUserEnrollment({
    users = [],
    courses = [],
    onSubmit,
}) {
    const isProduction = false; // Set to true to simulate production environment
    const [courseId, setCourseId] = useState("");
    const [enrollmentType, setEnrollmentType] = useState("assigned");
    const [scheduled, setScheduled] = useState(false);
    const [startAt, setStartAt] = useState("");
    const [endAt, setEndAt] = useState("");
    const [timezone, setTimezone] = useState("UTC");
    const [selectedUsers, setSelectedUsers] = useState([]);
    const [confirm, setConfirm] = useState(false);

    const handleSubmit = () => {
        onSubmit({
            course_id: courseId,
            user_ids: selectedUsers,
            enrollment_type: scheduled ? "scheduled" : enrollmentType,
            scheduled_start_at: scheduled ? startAt : null,
            scheduled_end_at: scheduled ? endAt : null,
            schedule_timezone: timezone,
        });
        setConfirm(false);
    };

    return (
        <Box sx={{ minHeight: "50vh" }}>

            {!isProduction ?
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
                    <Alert severity="warning">
                        Bulk enrollment cannot be delivered in production at this time.
                    </Alert>
                </Box>
                :
                <Box>

                    <Stack spacing={3}>
                        {/* Configuration */}
                        <Section title="Enrollment Configuration">
                            <TextField
                                select
                                label="Course *"
                                size="small"
                                fullWidth
                                value={courseId}
                                onChange={(e) => setCourseId(e.target.value)}
                            >
                                {courses.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.title}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <TextField
                                select
                                label="Enrollment Type"
                                size="small"
                                fullWidth
                                value={enrollmentType}
                                onChange={(e) => setEnrollmentType(e.target.value)}
                            >
                                <MenuItem value="free">Free</MenuItem>
                                <MenuItem value="assigned">Assigned</MenuItem>
                                <MenuItem value="scheduled">Scheduled</MenuItem>
                            </TextField>
                        </Section>

                        {/* Schedule */}
                        <Section title="Schedule">
                            <FormControlLabel
                                control={<Switch checked={scheduled} onChange={(e) => setScheduled(e.target.checked)} />}
                                label="Enable Scheduled Access"
                            />

                            {scheduled && (
                                <>
                                    <TextField
                                        type="datetime-local"
                                        label="Start Date & Time *"
                                        size="small"
                                        fullWidth
                                        value={startAt}
                                        onChange={(e) => setStartAt(e.target.value)}
                                    />
                                    <TextField
                                        type="datetime-local"
                                        label="End Date & Time"
                                        size="small"
                                        fullWidth
                                        value={endAt}
                                        onChange={(e) => setEndAt(e.target.value)}
                                    />
                                    <TextField
                                        label="Timezone"
                                        size="small"
                                        fullWidth
                                        value={timezone}
                                        onChange={(e) => setTimezone(e.target.value)}
                                    />
                                </>
                            )}
                        </Section>

                        {/* User Selection */}
                        <Section title="Select Users">
                            <DataGrid
                                rows={users}
                                checkboxSelection
                                autoHeight
                                columns={[
                                    { field: "username", headerName: "Username", flex: 1 },
                                    { field: "email", headerName: "Email", flex: 1 },
                                    { field: "status", headerName: "Status", width: 120 },
                                ]}
                                onRowSelectionModelChange={(ids) => setSelectedUsers(ids)}
                            />
                        </Section>
                    </Stack>

                    {/* Footer */}
                    <Box
                        sx={{
                            position: "sticky",
                            bottom: 0,
                            mt: 4,
                            p: 2,
                            bgcolor: "var(--surface)",
                            borderTop: "1px solid var(--lightgrey)",
                            display: "flex",
                            gap: 2,
                        }}
                    >
                        <Button
                            fullWidth
                            variant="contained"
                            disabled={!courseId || selectedUsers.length === 0}
                            onClick={() => setConfirm(true)}
                        >
                            Assign ({selectedUsers.length})
                        </Button>
                    </Box>
                </Box>
            }

            {/* Confirm Dialog */}
            <ShowPopup
                open={confirm}
                title="Confirm Bulk Enrollment"
                onClose={() => setConfirm(false)}
                onSubmit={handleSubmit}
                submitLabel="Confirm"
            >
                <Typography>
                    {selectedUsers.length} users will be enrolled to this course.
                </Typography>
            </ShowPopup>
        </Box>
    );
}
