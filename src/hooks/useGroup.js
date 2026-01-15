import { useDispatch, useSelector } from "react-redux";
import {
    fetchGroups,
    fetchGroupById,
    createGroup,
    updateGroup,
    deleteGroup,
    assignUser,
    unassignUser,
    fetchAssignments,
} from "../redux/slices/groupSlice";
import { useCallback } from "react";

export default function useGroup() {
    const dispatch = useDispatch();
    const { groups = [], assignments = {}, currentGroup = null, loading = false } = useSelector((s) => s.group || {});

    const loadGroups = useCallback(() => dispatch(fetchGroups()).unwrap(), [dispatch]);
    const getGroup = useCallback((id) => dispatch(fetchGroupById(id)).unwrap(), [dispatch]);
    const create = useCallback((data) => dispatch(createGroup(data)).unwrap(), [dispatch]);
    const update = useCallback((id, data) => dispatch(updateGroup({ id, data })).unwrap(), [dispatch]);
    const remove = useCallback((id) => dispatch(deleteGroup(id)).unwrap(), [dispatch]);
    const assign = useCallback((data) => dispatch(assignUser(data)).unwrap(), [dispatch]);
    const unassign = useCallback((id) => dispatch(unassignUser(id)).unwrap(), [dispatch]);
    const loadAssignments = useCallback((groupId) => dispatch(fetchAssignments(groupId)).unwrap(), [dispatch]);

    return {
        groups,
        assignments,
        currentGroup,
        loading,
        loadGroups,
        getGroup,
        create,
        update,
        remove,
        assign,
        unassign,
        loadAssignments,
    };
}
