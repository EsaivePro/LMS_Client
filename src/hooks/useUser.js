import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsers, fetchUserById, addUser, updateUser, deleteUser, setUsers } from "../redux/slices/userSlice";

const useUser = () => {
    const dispatch = useDispatch();
    const { allUsers, userDetails } = useSelector((s) => s.users || {});

    const getUserById = useCallback(
        (id) => {
            if (!id) return null;
            const parsed = parseInt(id);
            return (
                userDetails?.find((u) => u?.id === parsed) || allUsers?.find((u) => u?.id === parsed) || null
            );
        },
        [userDetails, allUsers]
    );

    const fetchAll = useCallback(() => dispatch(fetchUsers()), [dispatch]);
    const fetchOne = useCallback((id) => dispatch(fetchUserById(id)), [dispatch]);
    const create = useCallback((data) => dispatch(addUser(data)), [dispatch]);
    const update = useCallback((id, data) => dispatch(updateUser({ id, data })), [dispatch]);
    const remove = useCallback((id) => dispatch(deleteUser(id)), [dispatch]);
    const setList = useCallback((list) => dispatch(setUsers(list)), [dispatch]);

    return useMemo(
        () => ({
            allUsers: allUsers || [],
            userDetails: userDetails || [],
            fetchAll,
            fetchOne,
            create,
            update,
            remove,
            getUserById,
            setList,
        }),
        [allUsers, userDetails, fetchAll, fetchOne, create, update, remove, getUserById, setList]
    );
};

export default useUser;
