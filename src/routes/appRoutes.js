import Dashboard from "../pages/dashboard/Dashboard";
import LoginPage from "../pages/authmanagement/login/LoginPage";
import UnauthorizedPage from "../pages/authmanagement/unauthorized/UnauthorizedPage";

export const routesConfig = [
    {
        path: "/login",
        element: <LoginPage />,
        layout: "auth",
        module: "login",
        roleRequired: false
    },
    {
        path: "/unauthorized",
        element: <UnauthorizedPage />,
        layout: "auth",
        module: "unauthorized",
        roleRequired: false
    },
    {
        path: "/",
        element: <Dashboard />,
        layout: "app",
        module: "dashboard",
        roleRequired: true
    }
];
