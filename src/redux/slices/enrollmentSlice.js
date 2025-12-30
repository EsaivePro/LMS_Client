import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEnrollmentCourses, courseManualEnrollment, getEnrollmentCoursesByUserId } from "../../services/LMSGateway";

export const fetchEnrollmentCourses = createAsyncThunk(
    "enrollment/fetchCourses",
    async (_, { dispatch }) => {
        const res = await getEnrollmentCourses(dispatch);
        return res;
    }
);

export const manualEnrollUsers = createAsyncThunk(
    "enrollment/manualEnroll",
    async (data, { dispatch }) => {
        const res = await courseManualEnrollment(dispatch, data);
        return res;
    }
);

export const fetchEnrollmentCoursesByUser = createAsyncThunk(
    "enrollment/fetchByUser",
    async (userId, { dispatch }) => {
        const res = await getEnrollmentCoursesByUserId(dispatch, userId);
        return { userId, res };
    }
);

const enrollmentSlice = createSlice({
    name: "enrollment",
    initialState: {
        enrollmentCourses: [],
        enrollmentCoursesByUser: [],
        loading: false,
        error: false,
        message: null,
    },
    reducers: {
        setEnrollmentCourses: (state, action) => {
            state.enrollmentCourses = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchEnrollmentCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEnrollmentCourses.fulfilled, (state, action) => {
                state.loading = false;
                state.enrollmentCourses = action?.payload?.data?.response || [];
                state.error = action?.payload?.data?.error || action?.payload?.isError;
                state.message = action?.payload?.data?.message;
            })
            .addCase(fetchEnrollmentCourses.rejected, (state) => {
                state.loading = false;
            })

            .addCase(manualEnrollUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(manualEnrollUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.error = action?.payload?.data?.error || action?.payload?.isError;
                state.message = action?.payload?.data?.message;
            })
            .addCase(manualEnrollUsers.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(fetchEnrollmentCoursesByUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEnrollmentCoursesByUser.fulfilled, (state, action) => {
                state.loading = false;
                const userId = action?.payload?.userId;
                const data = action?.payload?.res?.data?.response || [];
                if (userId != null) state.enrollmentCoursesByUser[userId] = data;
                state.error = action?.payload?.res?.data?.error || action?.payload?.res?.isError;
                state.message = action?.payload?.res?.data?.message;
            })
            .addCase(fetchEnrollmentCoursesByUser.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setEnrollmentCourses } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
