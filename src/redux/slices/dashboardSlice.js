import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    layout: {
        admin: [],
        student: [],
    },
    widgets: {
        // keys must match entries in dashboard.config.js → WIDGETS
        admin: [
            // ── Overview ──
            "welcome", "counts", "stat", "chart",
            // ── Courses ──
            "myCourses", "courses", "courseCategory", "scheduledCourses",
            // ── Students ──
            "studentCounts", "progress",
            // ── Enrollment dashboard ──
            "statsCards", "enrollmentFilters", "enrollmentList", "progressAnalytics", "upcomingSchedule",
            // ── Enrollment detail actions ──
            "enrollment", "enrollmentInfo", "updateSchedule", "reEnroll", "revokeEnrollment",
        ],
        student: [
            // ── Overview ──
            "welcome", "statsCards",
            // ── Courses ──
            "myCourses", "courseCategory", "scheduledCourses",
            // ── Progress & Analytics ──
            "progressAnalytics", "upcomingSchedule",
            // ── Enrollments ──
            "enrollment", "enrollmentInfo", "enrollmentFilters",
        ],
    },
};

const dashboardSlice = createSlice({
    name: "dashboard",
    initialState,
    reducers: {
        setLayout(state, action) {
            const { role, layout } = action.payload;
            state.layout[role] = layout;
        },
        toggleWidget(state, action) {
            const { role, widgetId } = action.payload;
            const list = state.widgets[role];

            state.widgets[role] = list.includes(widgetId)
                ? list.filter(w => w !== widgetId)
                : [...list, widgetId];
        },
    },
});

export const { setLayout, toggleWidget } = dashboardSlice.actions;
export default dashboardSlice.reducer;
