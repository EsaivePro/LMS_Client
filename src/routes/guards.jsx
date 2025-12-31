import React from "react";
import { Navigate } from "react-router-dom";
import { RequireRole } from "../components/protectedRoute/ProtectedRoute";

export const withPermission = (element, permission) => {
    if (!permission) return element;
    return <RequireRole role={permission}>{element}</RequireRole>;
};

export const withUnauthorizedRedirect = (isAllowed, element) => {
    return isAllowed ? element : <Navigate to="/unauthorized" replace />;
};
