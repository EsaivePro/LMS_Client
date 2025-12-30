import { WIDGETS } from "../../modules/dashboard/dashboard.config";
import CourseWidget from "./widgets/CourseWidget";
import ProgressWidget from "./widgets/ProgressWidget";
import ScheduleWidget from "./widgets/ScheduleWidget";
import CountWidget from "./widgets/CountWidget";
import WelcomeWidget from "./widgets/WelcomeWidget";
import StudentCountWidget from "./widgets/StudentCountWidget";

export default function WidgetRenderer({ widgetId }) {
    const widget = WIDGETS[widgetId];
    if (!widget) {
        console.warn(`Widget config not found for id: ${widgetId}`);
        return null; // or fallback UI
    }
    const map = {
        course: CourseWidget,
        progress: ProgressWidget,
        scheduledCourses: ScheduleWidget,
        count: CountWidget,
        welcome: WelcomeWidget,
        studentCounts: StudentCountWidget
    };

    const Component = map[widget.type];
    if (!Component) {
        console.warn(`No renderer found for widget type: ${widget.type}`);
        return null;
    }

    return <Component title={widget.title} />;
}
