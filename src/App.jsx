import React, { useEffect, useState, useRef } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute, RequireRole } from "./components/protectedRoute/ProtectedRoute";

import AppLayout from "./components/layout/AppLayout";
import AuthLayout from "./components/layout/AuthLayout";

import LoginPage from "./pages/authmanagement/login/LoginPage";
import UnauthorizedPage from "./pages/authmanagement/unauthorized/UnauthorizedPage";

import { useAdmin } from "./hooks/useAdmin";
import { useAuth } from "./hooks/useAuth";
import { httpClient } from "./apiClient/httpClient";
import CoursesList from "./modules/course/pages/CoursesList";
import CourseView from "./modules/course/pages/CourseView";
import CourseEdit from "./modules/course/pages/CourseEdit";
import useCommon from "./hooks/useCommon";
import UserManagement from "./pages/usermanagement/UserManagement";
import AdminDashboard from "./modules/dashboard/pages/AdminDashBoard";
import UserPreference from "./modules/user/pages/UserPreference";

export default function App() {
  const { setPermissionsAPI } = useAdmin();
  const { isAuthenticated } = useAuth();
  const { showLoader, hideLoader } = useCommon()
  const [isRouteReady, setIsRouteReady] = useState(false);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      setIsRouteReady(true); // login page must be visible
      return;
    }
    // Only call API once
    if (isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      showLoader("Validating Permission");
      httpClient.fetchPermissionByUserId(1).then((response) => {
        if (response?.data?.statusCode === 200 && response?.data?.error === false) {
          const res = response.data.response;
          setPermissionsAPI(res); // ⬅ store permissions globally
        }
        setIsRouteReady(true); // ROUTES ARE READY NOW
        hideLoader();
      });
    }
  }, [isAuthenticated]);

  return (
    <main>
      <Routes>

        {/* ---------- AUTH PAGES ---------- */}
        <Route
          path="/login"
          element={
            <AuthLayout>
              <LoginPage />
            </AuthLayout>
          }
        />
        {/* ---------- PROTECTED APP PAGES ---------- */}
        <Route element={<ProtectedRoute />}>
          {/* Dashboard – requires: dashboard.view */}
          <Route
            path="/"
            element={
              <AppLayout title="Dashboard" titleDescription="Get a centralized overview of system activities, user engagement, and key metrics to monitor and manage the platform effectively.">
                <RequireRole module="Dashboard">
                  <AdminDashboard />
                </RequireRole>
              </AppLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/courses"
            element={
              <AppLayout title="Course Management" titleDescription="Create, organize, and maintain courses with structured content such as videos and documents, ensuring smooth learning experiences for users.">
                <CoursesList />
              </AppLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/course/view/:id"
            element={
              <AppLayout containerCard={false} courseCard={true}>
                <CourseView />
              </AppLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/course/edit/:id"
            element={
              <AppLayout>
                <CourseEdit />
              </AppLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/usermanagement/*"
            element={
              <AppLayout
                title="User Management"
                titleDescription="Manage platform users efficiently by creating, updating, assigning roles, and controlling access permissions across the system."
              >
                <UserManagement />
              </AppLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="user/preference/:id"
            element={
              <AppLayout title="User Preference" titleDescription="Manage platform users efficiently by creating, updating, assigning roles, and controlling access permissions across the system.">
                <UserPreference />
              </AppLayout>
            }
          />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route
            path="/unauthorized"
            element={
              <AppLayout containerCard={false}>
                <UnauthorizedPage />
              </AppLayout>
            }
          />
        </Route>
      </Routes>
    </main>
  );
}
