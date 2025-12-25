import { useDispatch, useSelector } from "react-redux";
import { setPageModule, setPagePermissions, setPermissions } from "../redux/slices/adminSlice";

export const useAdmin = () => {
    const dispatch = useDispatch();

    const {
        module,
        allPermissions,
        pagePermissions,
        hasPermissionView,
        permissions,
        loading,
        error,
    } = useSelector((s) => s.admin);

    return {
        module,
        permissions,
        loading,
        error,
        pagePermissions,
        hasPermissionView,
        allPermissions,

        setPageModule: (mod) => dispatch(setPageModule(mod)),
        setPagePermissions: (data) => dispatch(setPagePermissions(data)),
        setPermissionsAPI: (data) => dispatch(setPermissions(data)),
    };
};
