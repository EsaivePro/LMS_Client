import React from "react";
import { useSelector } from "react-redux";
import StatsCards from "../../../modules/enrollments/components/StatsCards";

export default function StatsCardsWidget() {
    const stats   = useSelector((s) => s.enrollment?.dashboardData?.stats   ?? {});
    const loading = useSelector((s) => s.enrollment?.dashboardLoading        ?? false);
    return <StatsCards stats={stats} loading={loading} />;
}
