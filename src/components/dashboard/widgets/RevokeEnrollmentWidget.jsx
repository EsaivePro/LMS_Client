import React from "react";
import {
    Button, Alert,
    Card, CardContent, CardHeader, Divider,
} from "@mui/material";

export default function RevokeEnrollmentWidget({ onRevoke, loading }) {
    if (!onRevoke) return null;

    return (
        <Card variant="outlined">
            <CardHeader
                title="Revoke Enrollment"
                titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
                sx={{ pb: 0 }}
            />
            <Divider />
            <CardContent>
                <Alert severity="error" sx={{ mb: 2 }}>
                    Revoking will soft-delete this enrollment. Use Re-enroll to restore it.
                </Alert>
                <Button
                    variant="contained"
                    color="error"
                    onClick={onRevoke}
                    disabled={loading}
                >
                    Revoke
                </Button>
            </CardContent>
        </Card>
    );
}
