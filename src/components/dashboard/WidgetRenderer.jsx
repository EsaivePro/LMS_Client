import { WIDGETS } from "../../modules/dashboard/dashboard.config";
import CourseWidget from "./widgets/CourseWidget";
import ProgressWidget from "./widgets/ProgressWidget";
import ScheduleWidget from "./widgets/ScheduleWidget";
import CountWidget from "./widgets/CountWidget";
import WelcomeWidget from "./widgets/WelcomeWidget";

export default function WidgetRenderer({ widgetId }) {
    const widget = WIDGETS[widgetId];
    if (!widget) {
        console.warn(`Widget config not found for id: ${widgetId}`);
        return null; // or fallback UI
    }
    const map = {
        course: CourseWidget,
        progress: ProgressWidget,
        schedule: ScheduleWidget,
        count: CountWidget,
        welcome: WelcomeWidget,
    };

    const Component = map[widget.type];
    return <Component title={widget.title} />;
}
