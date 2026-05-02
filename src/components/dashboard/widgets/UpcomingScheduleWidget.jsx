import React from "react";
import UpcomingSchedule from "../../../modules/enrollments/components/UpcomingSchedule";
import useDashboard from "../../../hooks/useDashboard";

export default function UpcomingScheduleWidget() {
    const { upcoming, expiringSoon, statusLoading } = useDashboard();

    return (
        <UpcomingSchedule
            upcomingExams={upcoming}
            expiringCourses={expiringSoon}
            loading={statusLoading}
        />
    );
}
