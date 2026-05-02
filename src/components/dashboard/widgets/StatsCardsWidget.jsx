import React from "react";
import StatsCards from "../../../modules/enrollments/components/StatsCards";
import useDashboard from "../../../hooks/useDashboard";

export default function StatsCardsWidget() {
    const { counts, statusLoading } = useDashboard();

    const stats = {
        active: counts?.total_enrolled_courses ?? 0,
        completed: counts?.completed_courses ?? 0,
        inprogress: counts?.inprogress_courses ?? 0,
        scheduled: counts?.upcoming_exams ?? 0,
    };

    return <StatsCards stats={stats} loading={statusLoading} />;
}
