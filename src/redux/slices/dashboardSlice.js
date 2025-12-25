import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    layout: {
        admin: [],
        student: [],
    },
    widgets: {
        // start with available widget keys defined in dashboard.config
        admin: ["welcome", "counts", "myCourses", "courses"],
        student: ["welcome", "myCourses", "schedule", "progress"],
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
