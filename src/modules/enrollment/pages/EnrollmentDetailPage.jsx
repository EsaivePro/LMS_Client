import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
    Box, Typography, Stack, Alert, CircularProgress, Breadcrumbs, Link,
} from "@mui/material";
import { enrollmentApi } from "../../../services/enrollmentApi";
import useCommon from "../../../hooks/useCommon";
import { useAuth } from "../../../hooks/useAuth";
import EnrollmentConfirmModal from "../../../components/enrollment/EnrollmentConfirmModal";
import useEnrollmentActions from "../../../hooks/useEnrollmentActions";
import EnrollmentInfoWidget from "../../../components/dashboard/widgets/EnrollmentInfoWidget";
import UpdateScheduleWidget from "../../../components/dashboard/widgets/UpdateScheduleWidget";
import ReEnrollWidget from "../../../components/dashboard/widgets/ReEnrollWidget";
import RevokeEnrollmentWidget from "../../../components/dashboard/widgets/RevokeEnrollmentWidget";

export default function EnrollmentDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useCommon();
    const { user: admin } = useAuth();
    const { revoke, reEnroll, updateSchedule, loading: actLoading } = useEnrollmentActions();

    const [schedForm, setSchedForm] = useState({ start: "", end: "", tz: "UTC" });
    const [schedError, setSchedError] = useState("");
    const [confirm, setConfirm] = useState(null); // 'revoke' | 'reenroll'

    const { data: enrollment, isLoading, error } = useQuery({
        queryKey: ["enrollment", id],
        queryFn: () => enrollmentApi.getEnrollmentById(id),
        enabled: !!id,
        retry: false,
    });

    if (isLoading) {
        return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
    }
    if (error || !enrollment) {
        return <Alert severity="error" sx={{ m: 3 }}>Enrollment not found.</Alert>;
    }

    const status = enrollment?.enrollment_status ?? "";
    const isRevoked = status === "revoked";
    const isCompleted = status === "completed";
    const canSchedule = !isRevoked && !isCompleted;

    const handleScheduleSave = async () => {
        setSchedError("");
        if (!schedForm.start) { setSchedError("Start date is required"); return; }
        try {
            await updateSchedule(id, {
                scheduled_start_at: schedForm.start,
                scheduled_end_at: schedForm.end || null,
                schedule_timezone: schedForm.tz,
            });
            queryClient.invalidateQueries({ queryKey: ["enrollment", id] });
        } catch { /* handled in hook */ }
    };

    const handleAction = async () => {
        try {
            if (confirm === "revoke") await revoke(id, admin?.id);
            else if (confirm === "reenroll") await reEnroll(id, admin?.id);
            setConfirm(null);
        } catch { /* handled in hook */ }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>
                    Home
                </Link>
                <Typography color="text.secondary">Enrollment</Typography>
                <Typography color="text.primary">#{id}</Typography>
            </Breadcrumbs>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Enrollment Detail</Typography>

            <Stack spacing={3}>
                <EnrollmentInfoWidget enrollment={enrollment} id={id} />

                {canSchedule && (
                    <UpdateScheduleWidget
                        schedForm={schedForm}
                        setSchedForm={setSchedForm}
                        schedError={schedError}
                        onSave={handleScheduleSave}
                        loading={!!actLoading[id]}
                    />
                )}

                <ReEnrollWidget
                    onReEnroll={() => setConfirm("reenroll")}
                    loading={!!actLoading[id]}
                />

                {!isRevoked && (
                    <RevokeEnrollmentWidget
                        onRevoke={() => setConfirm("revoke")}
                        loading={!!actLoading[id]}
                    />
                )}
            </Stack>

            <EnrollmentConfirmModal
                open={!!confirm}
                title={confirm === "revoke" ? "Revoke Enrollment" : "Re-enroll User"}
                description={
                    confirm === "revoke"
                        ? "Are you sure? This will revoke the enrollment."
                        : "Are you sure you want to re-enroll? All progress will be lost."
                }
                confirmDanger={confirm === "revoke"}
                confirmText={confirm === "revoke" ? "Revoke" : "Re-enroll"}
                loading={actLoading[id]}
                onCancel={() => setConfirm(null)}
                onConfirm={handleAction}
            />
        </Box>
    );
}
