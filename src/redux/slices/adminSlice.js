import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as LMSGateway from "../../services/LMSGateway";

export const fetchPermissionByUserId = createAsyncThunk(
    "admin/fetchPermissionByUserId",
    async (_, thunkAPI) => {
        try {
            const res = await LMSGateway.permissionByUserId();
            return res.data;
        } catch (err) {
            return thunkAPI.rejectWithValue(err.response?.data || err.message);
        }
    }
);

export const fetchAllPermissions = createAsyncThunk(
    "permissions/getAll",
    async (_, { dispatch }) => {
        const res = await LMSGateway.fetchAllPermissions(dispatch);
        return res.data;
    }
);

const initialState = {
    allPermissions: [],
    module: null,
    pagePermissions: [],
    hasPermissionView: false,
    permissions: {},
    loading: false,
    error: null,
};

const adminSlice = createSlice({
    name: "admin",
    initialState,
    reducers: {
        setPageModule: (state, action) => {
            state.module = action.payload;
        },

        setPagePermissions: (state, action) => {
            const moduleName = action.payload?.module;
            const modulePerms = state.permissions[moduleName] || [];

            state.pagePermissions = modulePerms;
            state.hasPermissionView = modulePerms.some(p => p.includes(".view"));
        },

        setPermissions: (state, action) => {
            state.permissions = action.payload || {};
        },
    },

    extraReducers: (builder) => {
        builder
            .addCase(fetchPermissionByUserId.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchPermissionByUserId.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload?.statusCode === 200 && action.payload?.error === false) {
                    state.permissions = action.payload.response;
                }
            })

            .addCase(fetchPermissionByUserId.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            })
            .addCase(fetchAllPermissions.pending, (state) => {
                state.loading = true;
                state.error = null;
            })

            .addCase(fetchAllPermissions.fulfilled, (state, action) => {
                state.loading = false;

                if (action.payload?.statusCode === 200 && action.payload?.error === false) {
                    state.allPermissions = action.payload.response;
                }
            })

            .addCase(fetchAllPermissions.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload || action.error.message;
            });
    },
});

export const { setPageModule, setPagePermissions, setPermissions } = adminSlice.actions;
export default adminSlice.reducer;
