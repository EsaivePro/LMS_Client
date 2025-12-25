// redux/permissionSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { fetchAllPermissions } from "../../services/LMSGateway";

export const getAllPermissions = createAsyncThunk(
    "permissions/getAll",
    async (_, { dispatch }) => {
        const res = await fetchAllPermissions(dispatch);
        return res;
    }
);

const permissionSlice = createSlice({
    name: "permission",
    initialState: {
        allPermissions: [],
        loading: false,
        error: false,
        message: null
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(getAllPermissions.pending, (state) => {
                state.loading = true;
            })
            .addCase(getAllPermissions.fulfilled, (state, action) => {
                state.loading = false;
                state.allPermissions = action?.payload?.response;
                state.error = action?.payload?.error;
                state.message = action?.payload?.message;
            })
            .addCase(getAllPermissions.rejected, (state, action) => {
                state.error = action?.payload?.error;
                state.message = action?.payload?.message;
            });
    },
});

export default permissionSlice.reducer;
