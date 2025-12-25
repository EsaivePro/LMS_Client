import React, { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

export const ProtectedRoute = ({ redirectTo = "/login" }) => {
    const isAuthenticated = useSelector((s) => s.auth.isAuthenticated);
    return isAuthenticated ? <Outlet /> : <Navigate to={redirectTo} />;
};

export const RequireRole = ({ module, children }) => {
    const { isAuthenticated } = useSelector((s) => s.auth);
    const { permissions } = useSelector((s) => s.admin);

    const [allowed, setAllowed] = useState(null); // null = loading

    useEffect(() => {
        // Not authenticated → redirect handled below
        if (!isAuthenticated) return;
        if (module == null || module === "") {
            setAllowed("");
            return;
        }
        // Permissions not loaded yet
        if (!permissions || Object.keys(permissions).length === 0) {
            setAllowed(null);
            return;
        }

        const modulePermission = permissions[module] || [];
        const hasView = modulePermission.some((p) => p.includes(".view"));

        setAllowed(hasView);

    }, [permissions, module, isAuthenticated]);

    // User not logged in
    if (!isAuthenticated) return <Navigate to="/login" />;

    // Still loading permissions
    if (allowed === null) return <div style={{ padding: 20 }}>Checking permissions...</div>;

    // User unauthorized
    if (!allowed) return <Navigate to="/unauthorized" />;

    // User authorized
    return children;
};
