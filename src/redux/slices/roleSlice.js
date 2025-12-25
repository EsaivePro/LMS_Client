import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import * as LMSGateway from "../../services/LMSGateway";

// GET all roles
export const fetchAllRoles = createAsyncThunk(
    "roles/fetchAll",
    async (_, { rejectWithValue, dispatch }) => {
        try {
            const res = await LMSGateway.fetchAllRoles(dispatch);
            if (res?.error) return rejectWithValue(res.message);
            return res;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// GET role permissions by ID
export const fetchRolePermissionsById = createAsyncThunk(
    "roles/fetchRolePermissions",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await LMSGateway.fetchRolePermissionsById(dispatch, id);
            if (res?.error) return rejectWithValue(res.message);
            return res;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// CREATE role
export const createRole = createAsyncThunk(
    "roles/create",
    async (data, { rejectWithValue, dispatch }) => {
        try {
            const res = await LMSGateway.createRole(dispatch, data);
            if (res?.error) return rejectWithValue(res.message);
            return res;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// UPDATE role
export const updateRole = createAsyncThunk(
    "roles/update",
    async ({ id, data }, { rejectWithValue, dispatch }) => {
        try {
            const res = await LMSGateway.updateRole(dispatch, id, data);
            if (res?.error) return rejectWithValue(res.message);
            return res;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

// DELETE role
export const deleteRole = createAsyncThunk(
    "roles/delete",
    async (id, { rejectWithValue, dispatch }) => {
        try {
            const res = await LMSGateway.deleteRole(dispatch, id);
            if (res?.error) return rejectWithValue(res.message);
            return id;
        } catch (err) {
            return rejectWithValue(err.message);
        }
    }
);

const initialState = {
    roles: [],
    selectedRole: null,
    loading: false,
    error: null,
};

const roleSlice = createSlice({
    name: "role",
    initialState,
    reducers: {
        clearSelectedRole: (state) => {
            state.selectedRole = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchAllRoles.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAllRoles.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = action?.payload?.data?.response || [];
                state.error = action?.payload?.data?.error || action?.payload?.isError || null;
            })
            .addCase(fetchAllRoles.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(fetchRolePermissionsById.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchRolePermissionsById.fulfilled, (state, action) => {
                state.loading = false;
                state.selectedRole = action?.payload?.data?.response || null;
                state.error = action?.payload?.data?.error || action?.payload?.isError || null;
            })
            .addCase(fetchRolePermissionsById.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(createRole.fulfilled, (state, action) => {
                state.loading = false;
                state.error = action?.payload?.data?.error || action?.payload?.isError || null;
                if (!state.error) {
                    const created = action?.payload?.data?.response;
                    if (created) {
                        state.roles.push(created);
                        state.roles.sort((a, b) => Number(b.id) - Number(a.id));
                    }
                }
            })
            .addCase(createRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(updateRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(updateRole.fulfilled, (state, action) => {
                state.loading = false;
                state.error = action?.payload?.data?.error || action?.payload?.isError || null;
                if (!state.error) {
                    const updated = action?.payload?.data?.response;
                    if (updated) {
                        state.roles = state.roles.map((r) => (r.id === updated.id ? updated : r));
                    }
                }
            })
            .addCase(updateRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })

            .addCase(deleteRole.pending, (state) => {
                state.loading = true;
            })
            .addCase(deleteRole.fulfilled, (state, action) => {
                state.loading = false;
                state.roles = state.roles.filter((r) => r.id !== action.payload);
            })
            .addCase(deleteRole.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            });
    },
});

export const { clearSelectedRole } = roleSlice.actions;
export default roleSlice.reducer;
