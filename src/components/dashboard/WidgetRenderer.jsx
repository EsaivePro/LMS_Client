import { WIDGETS } from "../../modules/dashboard/dashboard.config";

// ── Original dashboard widgets ──
import CourseWidget from "./widgets/CourseWidget";
import ScheduleWidget from "./widgets/ScheduleWidget";
import WelcomeWidget from "./widgets/WelcomeWidget";
import StudentCountWidget from "./widgets/StudentCountWidget";
import CourseCategoryWidget from "./widgets/CourseCategoryWidget";

// ── Enrollment dashboard widgets ──
import StatsCardsWidget from "./widgets/StatsCardsWidget";
import EnrollmentFiltersWidget from "./widgets/EnrollmentFiltersWidget";
import EnrollmentListWidget from "./widgets/EnrollmentListWidget";
import ProgressAnalyticsWidget from "./widgets/ProgressAnalyticsWidget";
import UpcomingScheduleWidget from "./widgets/UpcomingScheduleWidget";
import EnrolledWidget from "./widgets/EnrolledWidget";

const WIDGET_MAP = {

    enrolledWidget: EnrolledWidget,
    // ── Original ──
    course: CourseWidget,
    scheduledCourses: ScheduleWidget,
    welcome: WelcomeWidget,
    studentCounts: StudentCountWidget,
    courseCategory: CourseCategoryWidget,

    // ── Enrollment dashboard ──
    statsCards: StatsCardsWidget,
    enrollmentFilters: EnrollmentFiltersWidget,
    enrollmentList: EnrollmentListWidget,
    progressAnalytics: ProgressAnalyticsWidget,
    upcomingSchedule: UpcomingScheduleWidget,
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
