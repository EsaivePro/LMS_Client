import React from "react";
import {
    Box, Stack, TextField, MenuItem, Button,
    Card, CardContent, CardHeader, Divider,
} from "@mui/material";

const TIMEZONES = ["UTC", "Asia/Kolkata", "America/New_York", "Europe/London", "Asia/Tokyo"];

export default function UpdateScheduleWidget({ schedForm, setSchedForm, schedError, onSave, loading }) {
    if (!schedForm || !onSave) return null;

    return (
        <Card variant="outlined">
            <CardHeader
                title="Update Schedule"
                titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
                sx={{ pb: 0 }}
            />
            <Divider />
            <CardContent>
                <Stack spacing={2} sx={{ maxWidth: 440 }}>
                    <TextField
                        type="datetime-local"
                        label="Scheduled Start Date *"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        value={schedForm.start}
                        error={!!schedError}
                        helperText={schedError}
                        onChange={(e) => setSchedForm((p) => ({ ...p, start: e.target.value }))}
                    />
                    <TextField
                        type="datetime-local"
                        label="Scheduled End Date"
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        inputProps={{ min: schedForm.start || undefined }}
                        value={schedForm.end}
                        onChange={(e) => setSchedForm((p) => ({ ...p, end: e.target.value }))}
                    />
                    <TextField
                        select
                        label="Timezone"
                        size="small"
                        fullWidth
                        value={schedForm.tz}
                        onChange={(e) => setSchedForm((p) => ({ ...p, tz: e.target.value }))}
                    >
                        {TIMEZONES.map((tz) => (
                            <MenuItem key={tz} value={tz}>{tz}</MenuItem>
                        ))}
                    </TextField>
                    <Box>
                        <Button variant="contained" onClick={onSave} disabled={loading}>
                            {loading ? "Saving…" : "Save Schedule"}
                        </Button>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}
