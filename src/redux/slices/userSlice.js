import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchAllUsers as fetchAllUsersAPI,
    fetchUserById as fetchUserByIdAPI,
    createUser as createUserAPI,
    updateUser as updateUserAPI,
    deleteUser as deleteUserAPI,
} from "../../services/LMSGateway";

export const fetchUsers = createAsyncThunk(
    "users/fetch",
    async (_, { dispatch }) => {
        const res = await fetchAllUsersAPI(dispatch);
        return res;
    }
);

export const fetchUserById = createAsyncThunk(
    "users/getUser",
    async (id, { dispatch }) => {
        const res = await fetchUserByIdAPI(dispatch, id);
        return res;
    }
);

export const addUser = createAsyncThunk(
    "users/create",
    async (data, { dispatch }) => {
        const res = await createUserAPI(dispatch, data);
        return res;
    }
);

export const updateUser = createAsyncThunk(
    "users/update",
    async ({ id, data }, { dispatch }) => {
        const res = await updateUserAPI(dispatch, id, data);
        return res;
    }
);

export const deleteUser = createAsyncThunk(
    "users/delete",
    async (id, { dispatch }) => {
        const res = await deleteUserAPI(dispatch, id);
        return res;
    }
);

const userSlice = createSlice({
    name: "users",
    initialState: {
        allUsers: [],
        userDetails: [],
        loading: false,
        error: false,
        message: null,
    },
    reducers: {
        setUsers: (state, action) => {
            state.allUsers = action.payload || [];
        },
        setUserDetails: (state, action) => {
            state.userDetails = action.payload || [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchUsers.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchUsers.fulfilled, (state, action) => {
                state.loading = false;
                state.allUsers = action?.payload?.data?.response || [];
                state.error = action?.payload?.data?.error || action?.payload?.isError;
                state.message = action?.payload?.data?.message;
            })
            .addCase(fetchUsers.rejected, (state) => {
                state.loading = false;
            })

            .addCase(fetchUserById.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error || action?.payload?.isError;
                state.message = action?.payload?.data?.message;
                if (!state.error) {
                    const resp = action?.payload?.data?.response;
                    const idx = state.userDetails.findIndex((u) => u.id === resp?.id);
                    if (idx === -1) state.userDetails.push(resp);
                    else state.userDetails[idx] = { ...state.userDetails[idx], ...resp };
                }
            })

            .addCase(addUser.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
                if (!(state.error) && !(action?.payload?.isError)) {
                    const created = action?.payload?.data?.response;
                    if (created) state.allUsers.push(created);
                }
            })

            .addCase(updateUser.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
                if (!(state.error) && !(action?.payload?.isError)) {
                    const updated = action?.payload?.data?.response;
                    const idx = state.allUsers.findIndex((u) => u.id === updated?.id);
                    if (idx !== -1) state.allUsers[idx] = updated;
                }
            })

            .addCase(deleteUser.fulfilled, (state, action) => {
                state.error = action?.payload?.data?.error;
                state.message = action?.payload?.data?.message;
                if (!(state.error)) {
                    const deletedId = action?.payload?.data?.response?.id || action?.meta?.arg;
                    state.allUsers = state.allUsers.filter((u) => u.id !== deletedId);
                }
            });
    },
});

export const { setUsers, setUserDetails } = userSlice.actions;

export default userSlice.reducer;
