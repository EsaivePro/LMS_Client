import React from "react";
import UpcomingSchedule from "../../../modules/enrollments/components/UpcomingSchedule";

export default function UpcomingScheduleWidget({ upcomingExams, expiringCourses, loading }) {
    return (
        <UpcomingSchedule
            upcomingExams={upcomingExams}
            expiringCourses={expiringCourses}
            loading={loading}
        />
    );
}
