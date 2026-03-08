import React, { useMemo } from "react";
import {
    Box,
    Paper,
    Typography,
    Fade,
    Tabs,
    Tab,
    Select,
    MenuItem,
    useMediaQuery,
} from "@mui/material";
import THEME from '../../../constants/theme';
import { useNavigate, useLocation } from "react-router-dom";

import QuestionsList from "./QuestionsList";
import QuestionCreate from "./QuestionCreate";

/* ===================================================== */

export default function QuestionManagement() {
    const navigate = useNavigate();
    const location = useLocation();
    const isMobile = useMediaQuery("(max-width:900px)");

    /* ---------- TAB CONFIG ---------- */
    const tabs = useMemo(
        () => [
            {
                label: "All Questions",
                value: "list",
                path: "/exam/questions/list",
            },
            {
                label: "Create Question",
                value: "create",
                path: "/exam/questions/create",
            },
        ],
        []
    );

    /* ---------- CURRENT TAB (URL-DRIVEN) ---------- */
    const currentTab = useMemo(() => {
        const found = tabs.find((t) =>
            location.pathname.startsWith(t.path)
        );
        return found ? found.value : "list";
    }, [location.pathname, tabs]);

    /* ---------- HANDLERS ---------- */
    const handleChange = (_, newValue) => {
        if (!newValue) return;
        const tab = tabs.find((t) => t.value === newValue);
        if (tab) navigate(tab.path);
    };

    const handleMobileChange = (e) => {
        const tab = tabs.find((t) => t.value === e.target.value);
        if (tab) navigate(tab.path);
    };

    /* ---------- CONTENT ---------- */
    const renderContent = () => {
        if (currentTab === "create") return <QuestionCreate />;
        return <QuestionsList />;
    };

    /* ===================================================== */

    return (
        <Box sx={{ minHeight: "100vh", pt: 0, pb: 0 }}>
            {/* ================= STICKY HEADER ================= */}
            <Paper
                elevation={0}
                sx={{
                    position: "sticky",
                    top: 113,
                    zIndex: 10,
                    borderBottom: `1px solid ${THEME.colors.darkMedium}`,
                    backgroundColor: THEME.colors.surface,
                }}
            >
                <Box sx={{ px: { xs: 2, md: 3 }, py: 1.5 }}>
                    {/* ---------- Tabs / Dropdown ---------- */}
                    {!isMobile ? (
                        <Tabs
                            value={currentTab}
                            onChange={handleChange}
                            sx={{
                                backgroundColor: THEME.colors.surface,
                                borderRadius: 0,
                                minHeight: 0,
                                "& .MuiTab-root": {
                                    textTransform: "none",
                                    fontWeight: 600,
                                    px: 3,
                                    py: 1,
                                    minHeight: 0,
                                    border: 0,
                                    color: THEME.colors.darkMedium,
                                },
                                "& .Mui-selected": {
                                    color: THEME.colors.dark,
                                },
                                "& .MuiTabs-indicator": { backgroundColor: THEME.colors.dark, height: 2 }
                            }}
                            aria-label="Question management tabs"
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
