import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { getEnrollmentCourses, courseManualEnrollment, getEnrollmentCoursesByUserId, getUserEnrolledCourseCategory, enrollUserToCourseCategory, getUserCourses, getCourseCategoryAssignmentsForUser } from "../../services/LMSGateway";

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

export const fetchEnrolledCategoriesByUser = createAsyncThunk(
    "enrollment/fetchEnrolledCategories",
    async (userId, { dispatch }) => {
        const res = await getUserEnrolledCourseCategory(dispatch, userId);
        return { userId, res };
    }
);

export const enrollUserToCategory = createAsyncThunk(
    "enrollment/enrollToCategory",
    async ({ userId, categoryId }, { dispatch }) => {
        const res = await enrollUserToCourseCategory(dispatch, userId, categoryId);
        return { userId, categoryId, res };
    }
);

export const fetchUserCourses = createAsyncThunk(
    "enrollment/fetchUserCourses",
    async (payload, { dispatch }) => {
        // payload can be either userId or { userId, statuses }
        let userId = null;
        let statuses = null;
        if (payload && typeof payload === 'object' && ('userId' in payload || 'statuses' in payload)) {
            userId = payload.userId;
            statuses = payload.statuses || null;
        } else {
            userId = payload;
        }
        const res = await getUserCourses(dispatch, userId, statuses);
        return { userId, res };
    }
);

export const fetchCourseCategoryAssignmentsForUser = createAsyncThunk(
    "enrollment/fetchCategoryAssignments",
    async ({ userId, categoryId }, { dispatch }) => {
        const res = await getCourseCategoryAssignmentsForUser(dispatch, userId, categoryId);
        return { userId, categoryId, res };
    }
);

const enrollmentSlice = createSlice({
    name: "enrollment",
    initialState: {
        enrollmentCourses: [],
        enrollmentCoursesByUser: [],
        enrolledCategoriesByUser: [],
        categoryAssignmentsByUser: {},
        userCoursesByUser: [],
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

        builder
            .addCase(fetchEnrolledCategoriesByUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchEnrolledCategoriesByUser.fulfilled, (state, action) => {
                state.loading = false;
                const userId = action?.payload?.userId;
                const data = action?.payload?.res?.data?.response || [];
                if (userId != null) state.enrolledCategoriesByUser[userId] = data;
                state.error = action?.payload?.res?.data?.error || action?.payload?.res?.isError;
                state.message = action?.payload?.res?.data?.message;
            })
            .addCase(fetchEnrolledCategoriesByUser.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(enrollUserToCategory.pending, (state) => {
                state.loading = true;
            })
            .addCase(enrollUserToCategory.fulfilled, (state, action) => {
                state.loading = false;
                // result is list of enrollments for the user+category
                state.error = action?.payload?.res?.data?.error || action?.payload?.res?.isError;
                state.message = action?.payload?.res?.data?.message;
            })
            .addCase(enrollUserToCategory.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(fetchUserCourses.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUserCourses.fulfilled, (state, action) => {
                state.loading = false;
                const userId = action?.payload?.userId;
                const data = action?.payload?.res?.data?.response || [];
                if (userId != null) state.userCoursesByUser[userId] = data;
                state.error = action?.payload?.res?.data?.error || action?.payload?.res?.isError;
                state.message = action?.payload?.res?.data?.message;
            })
            .addCase(fetchUserCourses.rejected, (state) => {
                state.loading = false;
            });

        builder
            .addCase(fetchCourseCategoryAssignmentsForUser.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCourseCategoryAssignmentsForUser.fulfilled, (state, action) => {
                state.loading = false;
                const userId = action?.payload?.userId;
                const categoryId = action?.payload?.categoryId;
                const data = action?.payload?.res?.data?.response || [];
                if (userId != null) {
                    if (!state.categoryAssignmentsByUser[userId]) state.categoryAssignmentsByUser[userId] = {};
                    state.categoryAssignmentsByUser[userId][categoryId] = data;
                }
                state.error = action?.payload?.res?.data?.error || action?.payload?.res?.isError;
                state.message = action?.payload?.res?.data?.message;
            })
            .addCase(fetchCourseCategoryAssignmentsForUser.rejected, (state) => {
                state.loading = false;
            });
    },
});

export const { setEnrollmentCourses } = enrollmentSlice.actions;
export default enrollmentSlice.reducer;
