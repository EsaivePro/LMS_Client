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
        return <UserList />;
    };

    /* ===================================================== */

    return (
        <Box sx={{ minHeight: "100vh", pt: 0, pb: 0 }}>
            {/* ================= STICKY HEADER ================= */}
            <Paper
                elevation={0}
                sx={{
                    position: "sticky",
                    top: 64,
                    zIndex: 10,
                    borderBottom: "1px solid #e0e0e0",
                    backgroundColor: "#fff",
                }}
            >
                <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
                    {/* ---------- Breadcrumb ---------- */}
                    {/* <Breadcrumbs sx={{ mb: 1 }}>
                        <Link
                            underline="hover"
                            color="inherit"
                            sx={{ cursor: "pointer" }}
                            onClick={() =>
                                navigate("/usermanagement/users")
                            }
                        >
                            User Management
                        </Link>
                        <Typography color="text.primary">
                            {tabs.find((t) => t.value === currentTab)?.label}
                        </Typography>
                    </Breadcrumbs> */}

                    {/* ---------- Tabs / Dropdown ---------- */}
                    {!isMobile ? (
                        <Tabs
                            value={currentTab}
                            onChange={handleChange}
                            sx={{
                                backgroundColor: "#ffffffff",
                                borderRadius: 0,
                                minHeight: 0,
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    minHeight: 0,
                                    border: 0,
                                },
                                "& .Mui-selected": {
                                    backgroundColor: "#efefefff !important",
                                    color: "#353535ff",
                                },
                            }}
                            aria-label="User management tabs"
                        >
                            {tabs.map((tab) => (
                                <Tab key={tab.value} label={tab.label} value={tab.value} />
                            ))}
                        </Tabs>
                    ) : (
                        <Select
                            fullWidth
                            size="small"
                            value={currentTab}
                            onChange={handleMobileChange}
                        >
                            {tabs.map((tab) => (
                                <MenuItem
                                    key={tab.value}
                                    value={tab.value}
                                >
                                    {tab.label}
                                </MenuItem>
                            ))}
                        </Select>
                    )}
                </Box>
            </Paper>

            {/* ================= CONTENT ================= */}
            <Box sx={{ px: { xs: 1.5, md: 3 }, py: 2 }}>
                <Fade key={currentTab} in timeout={250}>
                    <Box>{renderContent()}</Box>
                </Fade>
            </Box>
        </Box>
    );
}
