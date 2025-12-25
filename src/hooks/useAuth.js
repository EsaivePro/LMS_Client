import { useDispatch, useSelector } from "react-redux";
import { loginUser, logout as logoutAction } from "../redux/slices/authSlice";

export const useAuth = () => {
    const dispatch = useDispatch();
    const { user, token, loading, error, isAuthenticated } = useSelector((s) => s.auth);

    return {
        user,
        token,
        loading,
        error,
        isAuthenticated,
        login: (creds) => dispatch(loginUser(creds)),
        logout: () => dispatch(logoutAction()),
    };
};
