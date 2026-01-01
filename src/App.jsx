import React, { useEffect, useRef, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { ProtectedRoute } from "./components/protectedRoute/ProtectedRoute";
import AuthLayout from "./components/layout/AuthLayout";
import LoginPage from "./pages/authmanagement/login/LoginPage";
import UnauthorizedPage from "./pages/authmanagement/unauthorized/UnauthorizedPage";

import { useAuth } from "./hooks/useAuth";
import { useAdmin } from "./hooks/useAdmin";
import { httpClient } from "./apiClient/httpClient";
import useCommon from "./hooks/useCommon";

import { useNavigate } from "react-router-dom";
import RouteRenderer from "./routes/RouteRenderer";
import { protectedRoutes } from "./routes/routeConfig";
import AppLayout from "./components/layout/AppLayout";

export default function App() {
  const { user, isAuthenticated } = useAuth();
  const { setPermissionsAPI } = useAdmin();
  const { showLoader, hideLoader } = useCommon();

  const [ready, setReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const fetched = useRef(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      setReady(true);
      return;
    }
    if (fetched.current || !user?.id) return;
    fetched.current = true;
    const loadPermissions = async () => {
      try {
        showLoader("Validating permissions...");
        const res = await httpClient.fetchPermissionByUserId(user.id);
        const data = res?.data;
        if (data?.response?.length) {
          setPermissionsAPI(data.response);
          setHasPermission(true);
        } else {
          setHasPermission(false);
        }
      } catch (err) {
        setHasPermission(false);
      } finally {
        hideLoader();
        setReady(true);
      }
    };
    loadPermissions();
  }, [isAuthenticated, user]);

  if (!ready) return null;

  return (
    <main>
      <Routes>
        {/* ---------- AUTH ---------- */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />

        {/* ---------- UNAUTHORIZED ---------- */}
        <Route
          path="/unauthorized"
          element={
            <ProtectedRoute>
              <AppLayout containerCard={false} >
                <UnauthorizedPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />

        {/* ---------- PROTECTED ---------- */}
        <Route element={<ProtectedRoute />}>
          {RouteRenderer({ routes: protectedRoutes })}
        </Route>

        {/* ---------- FALLBACK ---------- */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
