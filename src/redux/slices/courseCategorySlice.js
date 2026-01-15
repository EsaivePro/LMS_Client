import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchAllCategories,
    fetchCategoryById as fetchCategoryByIdAPI,
    createCategory as createCategoryAPI,
    updateCategory as updateCategoryAPI,
    deleteCategory as deleteCategoryAPI,
    assignCourseToCategory as assignCourseAPI,
    unassignCourseById as unassignCourseAPI,
    getAssignedCourses as getAssignedCoursesAPI,
} from "../../services/LMSGateway";

export const fetchCategories = createAsyncThunk("courseCategory/fetch", async (_, { dispatch }) => {
    const res = await fetchAllCategories(dispatch);
    return res;
});

export const fetchCategoryById = createAsyncThunk("courseCategory/getById", async (id, { dispatch }) => {
    const res = await fetchCategoryByIdAPI(dispatch, id);
    return res;
});

export const createCategory = createAsyncThunk("courseCategory/create", async (data, { dispatch }) => {
    const res = await createCategoryAPI(dispatch, data);
    return res;
});

export const updateCategory = createAsyncThunk("courseCategory/update", async ({ id, data }, { dispatch }) => {
    const res = await updateCategoryAPI(dispatch, id, data);
    return res;
});

export const deleteCategory = createAsyncThunk("courseCategory/delete", async (id, { dispatch }) => {
    const res = await deleteCategoryAPI(dispatch, id);
    return res;
});

export const assignCourse = createAsyncThunk("courseCategory/assign", async (data, { dispatch }) => {
    const res = await assignCourseAPI(dispatch, data);
    return res;
});

export const unassignCourse = createAsyncThunk("courseCategory/unassign", async (id, { dispatch }) => {
    const res = await unassignCourseAPI(dispatch, id);
    return res;
});

export const fetchAssignedCourses = createAsyncThunk("courseCategory/assigned", async (categoryId, { dispatch }) => {
    const res = await getAssignedCoursesAPI(dispatch, categoryId);
    return res;
});

const slice = createSlice({
    name: "courseCategory",
    initialState: {
        categories: [],
        assigned: {},
        currentCategory: null,
        loading: false,
        error: false,
        message: null,
    },
    reducers: {
        setCurrentCategory: (state, action) => {
            state.currentCategory = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchCategories.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.loading = false;
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                state.categories = Array.isArray(data) ? data : [];
            })
            .addCase(fetchCategories.rejected, (state) => {
                state.loading = false;
                state.error = true;
            })

            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                state.currentCategory = data || null;
            })

            .addCase(createCategory.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                if (data) state.categories.unshift(data);
            })

            .addCase(updateCategory.fulfilled, (state, action) => {
                const updated = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                if (updated) {
                    const idx = state.categories.findIndex((c) => c.id === updated.id);
                    if (idx !== -1) state.categories[idx] = { ...state.categories[idx], ...updated };
                }
            })

            .addCase(deleteCategory.fulfilled, (state, action) => {
                const deleted = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                const id = deleted?.id || action?.meta?.arg;
                state.categories = state.categories.filter((c) => c.id !== id);
            })

            .addCase(assignCourse.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                if (data) {
                    const catId = data.course_category_id || data.courseCategoryId || data.course_category || action?.meta?.arg?.course_category_id;
                    state.assigned[catId] = state.assigned[catId] || [];
                    state.assigned[catId].unshift(data);
                }
            })

            .addCase(unassignCourse.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                const id = data?.id || action?.meta?.arg;
                // remove assignment entry by assign id
                Object.keys(state.assigned).forEach((k) => {
                    state.assigned[k] = (state.assigned[k] || []).filter((a) => a.id !== id && a.assign_id !== id);
                });
            })

            .addCase(fetchAssignedCourses.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                const catId = action?.meta?.arg;
                state.assigned[catId] = Array.isArray(data) ? data : [];
            });
    },
});

export const { setCurrentCategory } = slice.actions;

export default slice.reducer;
