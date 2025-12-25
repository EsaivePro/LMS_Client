import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchAllRoles,
    fetchRolePermissionsById,
    createRole,
    updateRole,
    deleteRole,
    clearSelectedRole,
} from "../redux/slices/roleSlice";

const useRole = () => {
    const dispatch = useDispatch();
    const { roles, selectedRole, loading, error } = useSelector((s) => s.role || {});

    const getRoleById = useCallback(
        (id) => {
            if (!id) return null;
            const parsed = parseInt(id);
            return roles?.find((r) => r?.id === parsed) || null;
        },
        [roles]
    );

    const fetchAll = useCallback(() => dispatch(fetchAllRoles()), [dispatch]);
    const fetchPermissions = useCallback((id) => dispatch(fetchRolePermissionsById(id)), [dispatch]);
    const create = useCallback((data) => dispatch(createRole(data)), [dispatch]);
    const update = useCallback((id, data) => dispatch(updateRole({ id, data })), [dispatch]);
    const remove = useCallback((id) => dispatch(deleteRole(id)), [dispatch]);
    const clearSelected = useCallback(() => dispatch(clearSelectedRole()), [dispatch]);

    return useMemo(
        () => ({
            roles: roles || [],
            selectedRole: selectedRole || null,
            loading: !!loading,
            error: error || null,
            fetchAll,
            fetchPermissions,
            create,
            update,
            remove,
            clearSelected,
            getRoleById,
        }),
        [roles, selectedRole, loading, error, fetchAll, fetchPermissions, create, update, remove, clearSelected, getRoleById]
    );
};

export default useRole;
