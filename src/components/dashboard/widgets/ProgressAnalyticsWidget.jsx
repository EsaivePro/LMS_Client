import React from "react";
import ProgressAnalytics from "../../../modules/enrollments/components/ProgressAnalytics";

export default function ProgressAnalyticsWidget({ enrollments, stats }) {
    return <ProgressAnalytics enrollments={enrollments} stats={stats} />;
}
