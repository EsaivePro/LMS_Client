import React from "react";
import {
    Button, Alert,
    Card, CardContent, CardHeader, Divider,
} from "@mui/material";

export default function ReEnrollWidget({ onReEnroll, loading }) {
    if (!onReEnroll) return null;

    return (
        <Card variant="outlined">
            <CardHeader
                title="Re-enroll"
                titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
                sx={{ pb: 0 }}
            />
            <Divider />
            <CardContent>
                <Alert severity="warning" sx={{ mb: 2 }}>
                    This will reset all progress (progress_percent, marks, started_at, completed_at) and reactivate the enrollment.
                </Alert>
                <Button
                    variant="contained"
                    color="warning"
                    onClick={onReEnroll}
                    disabled={loading}
                >
                    Re-enroll
                </Button>
            </CardContent>
        </Card>
    );
}
