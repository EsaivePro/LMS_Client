import React, { useMemo } from "react";
import {
    Box,
    Paper,
    Typography,
    Breadcrumbs,
    Link,
    Fade,
    Tabs,
    Tab,
    Select,
    MenuItem,
    useMediaQuery,
} from "@mui/material";
import THEME from '../../../constants/theme';
import { useNavigate, useLocation } from "react-router-dom";

import UserList from "./UsersList";
import RolesList from "../../role/pages/RolesList";

/* ===================================================== */

export default function UserManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery("(max-width:900px)");

    /* ---------- TAB CONFIG (ALWAYS BOTH) ---------- */
    const tabs = useMemo(
        () => [
            {
                label: "Users",
                value: "users",
                path: "/usermanagement/users",
            },
            {
                label: "Role Management",
                value: "roles",
                path: "/usermanagement/roles",
            },
        ],
        []
    );

    /* ---------- CURRENT TAB (URL-DRIVEN) ---------- */
    const currentTab = useMemo(() => {
        const found = tabs.find((t) =>
            location.pathname.startsWith(t.path)
        );
        return found ? found.value : "users";
    }, [location.pathname, tabs]);

    /* ---------- HANDLERS ---------- */
    const handleChange = (_, newValue) => {
        if (!newValue) return; // ToggleButtonGroup safety
        const tab = tabs.find((t) => t.value === newValue);
        if (tab) navigate(tab.path);
    };

    const handleMobileChange = (e) => {
        const tab = tabs.find((t) => t.value === e.target.value);
        if (tab) navigate(tab.path);
    };

    /* ---------- CONTENT ---------- */
    const renderContent = () => {
        if (currentTab === "roles") return <RolesList />;

    };

    /* ===================================================== */

    return <UserList />;
}
