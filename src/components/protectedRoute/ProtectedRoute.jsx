import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({ redirectTo = "/login", children }) => {
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
    if (!isAuthenticated) return <Navigate to={redirectTo} />;
    return children ? children : <Outlet />;
};

export const RequireRole = ({ role, children }) => {
    const { isAuthenticated } = useSelector((s) => s.auth);
    const { permissions } = useSelector((s) => s.admin);

    const [allowed, setAllowed] = useState(null); // null = loading

    useEffect(() => {
        // Not authenticated → redirect handled below
        if (!isAuthenticated) return;
        if (role == null || role === "") {
            setAllowed(true);
            return;
        }
        // Permissions not loaded yet
        if (!permissions || Object.keys(permissions).length === 0) {
            setAllowed(null);
            return;
        }

        const hasView = permissions.some((p) => p?.key?.includes(role));

        setAllowed(hasView);

    }, [permissions, role, isAuthenticated]);

    // User not logged in
    if (!isAuthenticated) return <Navigate to="/login" />;

    // Still loading permissions
    if (allowed === null) return null; //<div style={{ padding: 20 }}>Checking permissions...</div>;

    // User unauthorized
    if (!allowed) return <Navigate to="/unauthorized" />;

    // User authorized
    return children;
};
