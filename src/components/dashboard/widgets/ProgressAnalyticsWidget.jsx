import React from "react";
import { useSelector } from "react-redux";
import ProgressAnalytics from "../../../modules/enrollments/components/ProgressAnalytics";

export default function ProgressAnalyticsWidget() {
    const enrollments = useSelector((s) => s.enrollment?.dashboardData?.enrollments ?? []);
    const stats       = useSelector((s) => s.enrollment?.dashboardData?.stats       ?? {});
    return <ProgressAnalytics enrollments={enrollments} stats={stats} />;
}
