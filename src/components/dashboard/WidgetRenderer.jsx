import { WIDGETS } from "../../modules/dashboard/dashboard.config";

// ── Original dashboard widgets ──
import CourseWidget from "./widgets/CourseWidget";
import ProgressWidget from "./widgets/ProgressWidget";
import ScheduleWidget from "./widgets/ScheduleWidget";
import CountWidget from "./widgets/CountWidget";
import WelcomeWidget from "./widgets/WelcomeWidget";
import StudentCountWidget from "./widgets/StudentCountWidget";
import CourseCategoryWidget from "./widgets/CourseCategoryWidget";
import EnrollmentWidget from "./widgets/EnrollmentWidget";
import ChartWidget from "./widgets/ChartWidget";
import StatWidget from "./widgets/StatWidget";

// ── Enrollment detail widgets ──
import EnrollmentInfoWidget from "./widgets/EnrollmentInfoWidget";
import UpdateScheduleWidget from "./widgets/UpdateScheduleWidget";
import ReEnrollWidget from "./widgets/ReEnrollWidget";
import RevokeEnrollmentWidget from "./widgets/RevokeEnrollmentWidget";

// ── Enrollment dashboard widgets ──
import StatsCardsWidget from "./widgets/StatsCardsWidget";
import EnrollmentFiltersWidget from "./widgets/EnrollmentFiltersWidget";
import EnrollmentListWidget from "./widgets/EnrollmentListWidget";
import ProgressAnalyticsWidget from "./widgets/ProgressAnalyticsWidget";
import UpcomingScheduleWidget from "./widgets/UpcomingScheduleWidget";

const WIDGET_MAP = {
    // ── Original ──
    course:             CourseWidget,
    progress:           ProgressWidget,
    scheduledCourses:   ScheduleWidget,
    count:              CountWidget,
    welcome:            WelcomeWidget,
    studentCounts:      StudentCountWidget,
    courseCategory:     CourseCategoryWidget,
    enrollment:         EnrollmentWidget,
    chart:              ChartWidget,
    stat:               StatWidget,

    // ── Enrollment detail ──
    enrollmentInfo:     EnrollmentInfoWidget,
    updateSchedule:     UpdateScheduleWidget,
    reEnroll:           ReEnrollWidget,
    revokeEnrollment:   RevokeEnrollmentWidget,

    // ── Enrollment dashboard ──
    statsCards:         StatsCardsWidget,
    enrollmentFilters:  EnrollmentFiltersWidget,
    enrollmentList:     EnrollmentListWidget,
    progressAnalytics:  ProgressAnalyticsWidget,
    upcomingSchedule:   UpcomingScheduleWidget,
};

export default function WidgetRenderer({ widgetId }) {
    const widget = WIDGETS[widgetId];
    if (!widget) {
        console.warn(`Widget config not found for id: ${widgetId}`);
        return null;
    }

    const Component = WIDGET_MAP[widget.type];
    if (!Component || typeof Component !== "function") {
        console.warn(`No renderer found for widget type: ${widget.type}`);
        return null;
    }

    return <Component title={widget.title} />;
}
