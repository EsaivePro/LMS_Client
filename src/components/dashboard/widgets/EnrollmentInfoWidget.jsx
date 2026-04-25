import React from "react";
import {
    Box, Typography, Grid, Card, CardContent, CardHeader, Divider,
} from "@mui/material";
import EnrollmentStatusBadge from "../../enrollment/EnrollmentStatusBadge";
import ModuleTypeBadge from "../../enrollment/ModuleTypeBadge";
import ProgressCell from "../../enrollment/ProgressCell";

const fmtDate = (val) => (val ? new Date(val).toLocaleString() : "—");

function DetailField({ label, children }) {
    return (
        <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block" }}>
                {label}
            </Typography>
            <Box sx={{ mt: 0.25 }}>{children}</Box>
        </Box>
    );
}

export default function EnrollmentInfoWidget({ enrollment, id }) {
    if (!enrollment) return null;

    const status = enrollment?.enrollment_status ?? "";

    return (
        <Card variant="outlined">
            <CardHeader
                title="Enrollment Information"
                titleTypographyProps={{ variant: "subtitle1", fontWeight: 700 }}
                sx={{ pb: 0 }}
            />
            <Divider />
            <CardContent>
                <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Enrollment ID">
                            <Typography>{enrollment.enrollment_id ?? id}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="User Name">
                            <Typography>
                                {`${enrollment.first_name ?? ""} ${enrollment.last_name ?? ""}`.trim() || "—"}
                            </Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Module Type">
                            <ModuleTypeBadge type={enrollment.module_type} />
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Module Title">
                            <Typography>{enrollment.module_title ?? "—"}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Status">
                            <EnrollmentStatusBadge status={status} />
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Enrollment Type">
                            <Typography sx={{ textTransform: "capitalize" }}>
                                {enrollment.enrollment_type ?? "—"}
                            </Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Progress">
                            <ProgressCell percent={enrollment.progress_percent} />
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Marks">
                            <Typography>{enrollment.marks ?? "—"}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Enrolled At">
                            <Typography>{fmtDate(enrollment.enrolled_at)}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Started At">
                            <Typography>{fmtDate(enrollment.started_at)}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Completed At">
                            <Typography>{fmtDate(enrollment.completed_at)}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Expires At">
                            <Typography>{fmtDate(enrollment.expires_at)}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Scheduled Start">
                            <Typography>{fmtDate(enrollment.scheduled_start_at)}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Scheduled End">
                            <Typography>{fmtDate(enrollment.scheduled_end_at)}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Timezone">
                            <Typography>{enrollment.schedule_timezone ?? "—"}</Typography>
                        </DetailField>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <DetailField label="Enrolled By">
                            <Typography>{enrollment.enrolled_by ?? "—"}</Typography>
                        </DetailField>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    );
}
