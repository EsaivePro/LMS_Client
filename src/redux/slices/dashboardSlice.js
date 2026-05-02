import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getDashboardStatus as getDashboardStatusAPI } from "../../services/LMSGateway";

export const fetchDashboardStatus = createAsyncThunk(
    "dashboard/fetchStatus",
    async (data, { dispatch }) => {
        const res = await getDashboardStatusAPI(dispatch, data);
        return res;
    }
);

const initialState = {
    layout: {
        admin: [],
        student: [],
    },
    widgets: {
        // keys must match entries in dashboard.config.js → WIDGETS
        admin: [
            "welcome", "statsCards", "courseCategory", "enrolledWidget", "progressAnalytics"
        ],
        student: [
            "welcome", "statsCards", "myCourses", "examWidget", "upcomingSchedule"
        ],
    },
    status: {
        counts: null,
        enrolledCourses: [],
        enrolledExams: [],
        upcoming: [],
        expiringSoon: [],
        lastSession: null,
        meta: null,
        loading: false,
        error: false,
        message: null,
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
    extraReducers: (builder) => {
        builder
            .addCase(fetchDashboardStatus.pending, (state) => {
                state.status.loading = true;
            })
            .addCase(fetchDashboardStatus.fulfilled, (state, action) => {
                state.status.loading = false;
                state.status.error = action?.payload?.data?.error || action?.payload?.isError || false;
                state.status.message = action?.payload?.data?.message;
                if (!state.status.error) {
                    const response = action?.payload?.data?.response;
                    state.status.counts = response?.counts || null;
                    state.status.enrolledCourses = response?.enrolled_courses || [];
                    state.status.enrolledExams = response?.enrolled_exams || [];
                    state.status.upcoming = response?.upcoming || [];
                    state.status.expiringSoon = response?.expiring_soon || [];
                    state.status.lastSession = response?.last_session || null;
                    state.status.meta = response?.meta || null;
                }
            })
            .addCase(fetchDashboardStatus.rejected, (state) => {
                state.status.loading = false;
                state.status.error = true;
            });
    },
});

export const { setLayout, toggleWidget } = dashboardSlice.actions;
export default dashboardSlice.reducer;
