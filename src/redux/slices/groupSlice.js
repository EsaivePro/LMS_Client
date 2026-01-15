import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
    fetchAllGroups as fetchAllGroupsAPI,
    fetchGroupById as fetchGroupByIdAPI,
    createGroup as createGroupAPI,
    updateGroup as updateGroupAPI,
    deleteGroup as deleteGroupAPI,
    assignUserToGroup as assignUserAPI,
    unassignUserFromGroup as unassignUserAPI,
    getGroupAssignments as getGroupAssignmentsAPI,
} from "../../services/LMSGateway";

export const fetchGroups = createAsyncThunk("group/fetch", async (_, { dispatch }) => {
    const res = await fetchAllGroupsAPI(dispatch);
    return res;
});

export const fetchGroupById = createAsyncThunk("group/getById", async (id, { dispatch }) => {
    const res = await fetchGroupByIdAPI(dispatch, id);
    return res;
});

export const createGroup = createAsyncThunk("group/create", async (data, { dispatch }) => {
    const res = await createGroupAPI(dispatch, data);
    return res;
});

export const updateGroup = createAsyncThunk("group/update", async ({ id, data }, { dispatch }) => {
    const res = await updateGroupAPI(dispatch, id, data);
    return res;
});

export const deleteGroup = createAsyncThunk("group/delete", async (id, { dispatch }) => {
    const res = await deleteGroupAPI(dispatch, id);
    return res;
});

export const assignUser = createAsyncThunk("group/assign", async (data, { dispatch }) => {
    const res = await assignUserAPI(dispatch, data);
    return res;
});

export const unassignUser = createAsyncThunk("group/unassign", async (id, { dispatch }) => {
    const res = await unassignUserAPI(dispatch, id);
    return res;
});

export const fetchAssignments = createAsyncThunk("group/assignments", async (groupId, { dispatch }) => {
    const res = await getGroupAssignmentsAPI(dispatch, groupId);
    return res;
});

const slice = createSlice({
    name: "group",
    initialState: {
        groups: [],
        assignments: {},
        currentGroup: null,
        loading: false,
        error: false,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchGroups.pending, (state) => { state.loading = true; })
            .addCase(fetchGroups.fulfilled, (state, action) => {
                state.loading = false;
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                state.groups = Array.isArray(data) ? data : [];
            })
            .addCase(fetchGroups.rejected, (state) => { state.loading = false; state.error = true; })

            .addCase(createGroup.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                if (data) state.groups.unshift(data);
            })

            .addCase(updateGroup.fulfilled, (state, action) => {
                const updated = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                if (updated) {
                    const idx = state.groups.findIndex((g) => g.id === updated.id);
                    if (idx !== -1) state.groups[idx] = { ...state.groups[idx], ...updated };
                }
            })

            .addCase(deleteGroup.fulfilled, (state, action) => {
                const deleted = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                const id = deleted?.id || action?.meta?.arg;
                state.groups = state.groups.filter((g) => g.id !== id);
            })

            .addCase(assignUser.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                if (data) {
                    const gid = data.course_category_id || data.group_id || action?.meta?.arg?.course_category_id;
                    state.assignments[gid] = state.assignments[gid] || [];
                    state.assignments[gid].unshift(data);
                }
            })

            .addCase(unassignUser.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                const id = data?.id || action?.meta?.arg;
                Object.keys(state.assignments).forEach((k) => {
                    state.assignments[k] = (state.assignments[k] || []).filter((a) => a.id !== id);
                });
            })

            .addCase(fetchAssignments.fulfilled, (state, action) => {
                const data = action?.payload?.data?.response ?? action?.payload?.data ?? action?.payload;
                const gid = action?.meta?.arg;
                state.assignments[gid] = Array.isArray(data) ? data : [];
            });
    },
});

export default slice.reducer;
