import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    createTopic,
    updateTopic as updateTopicAPI,
    deleteTopic as deleteTopicAPI
} from "../../services/LMSGateway";

export const addTopic = createAsyncThunk(
    "courses/topic/create",
    async (topic, { dispatch }) => {
        const res = await createTopic(dispatch, topic);
        return res;
    }
);

export const updateTopic = createAsyncThunk(
    "courses/topic/update",
    async ({ id, data }, { dispatch }) => {
        const res = await updateTopicAPI(dispatch, id, data);
        return res;
    }
);

export const deleteTopic = createAsyncThunk(
    "courses/topic/delete",
    async (id, { dispatch }) => {
        const res = await deleteTopicAPI(dispatch, id);
        return res;
    }
);

const topicsSlice = createSlice({
    name: "topics",
    initialState: {
        topicsInCourse: [],
        loading: false,
        error: true,
        message: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            /* CREATE Topic */
            .addCase(addTopic.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
                if (!(state.error)) {
                    state.topicsInCourse.push(action?.payload?.response);
                }
            })

            /* UPDATE Topic*/
            .addCase(updateTopic.fulfilled, (state, action) => {
                // state.error = action?.payload?.data?.error;
                // state.message = action?.payload?.data?.message;
                // if (!(state.error)) {
                //     const index = state.topicsInCourse.findIndex(
                //         (topic) => topic.id === action.payload?.data?.response?.id
                //     );
                //     if (index !== -1) {
                //         state.topicsInCourse[index] = action.payload?.data?.response;
                //     }
                // }
            })

            /* DELETE Topic */
            .addCase(deleteTopic.fulfilled, (state, action) => {
                // state.error = action?.payload?.data?.error;
                // state.message = action?.payload?.data?.message;
                // if (!(state.error)) {
                //     state.topicsInCourse = state.topicsInCourse.filter((topic) => topic.id !== action.payload?.data?.response?.id);
                // }
            });
    },
});

export default topicsSlice.reducer;