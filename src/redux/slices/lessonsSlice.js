import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    createLesson,
    updateLesson as updateLessonAPI,
    deleteLesson as deleteLessonAPI,
    deleteTopic
} from "../../services/LMSGateway";

export const addLesson = createAsyncThunk(
    "courses/topic/lesson/create",
    async (lesson, { dispatch }) => {
        const res = createLesson(dispatch, lesson);
        return res;
    }
);

export const updateLesson = createAsyncThunk(
    "courses/topic/lesson/update",
    async ({ id, data }, { dispatch }) => {
        const res = updateLessonAPI(dispatch, id, data);
        return res;
    }
);

export const deleteLesson = createAsyncThunk(
    "courses/topic/lesson/delete",
    async (id, { dispatch }) => {
        const res = deleteLessonAPI(dispatch, id);
        return res;
    }
);

const lessonsSlice = createSlice({
    name: "lessons",
    initialState: {
        lessonsInTopics: [],
        loading: false,
        error: true,
        message: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            /* CREATE Topic */
            .addCase(addLesson.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
            })

            /* UPDATE Topic*/
            .addCase(updateLesson.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
            })

            /* DELETE Topic */
            .addCase(deleteLesson.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
            });
    },
});

export default lessonsSlice.reducer;