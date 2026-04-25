import React from "react";
import StatsCards from "../../../modules/enrollments/components/StatsCards";

export default function StatsCardsWidget({ stats, loading }) {
    return <StatsCards stats={stats} loading={loading} />;
}
