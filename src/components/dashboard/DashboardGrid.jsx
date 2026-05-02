import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { setLayout } from "../../redux/slices/dashboardSlice";
import WidgetRenderer from "./WidgetRenderer";
import { Box, Paper, Typography, Divider } from "@mui/material";
import { useAuth } from "../../hooks/useAuth";
import { useEnrollmentDashboard } from "../../hooks/useEnrollment";
import { WIDGETS } from "../../modules/dashboard/dashboard.config";
import useDashboard from "../../hooks/useDashboard";

/* ── Icon imports ──────────────────────────────────────────────────────── */
import WavingHandIcon from "@mui/icons-material/WavingHand";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import CollectionsBookmarkIcon from "@mui/icons-material/CollectionsBookmark";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import GroupIcon from "@mui/icons-material/Group";
import AssessmentIcon from "@mui/icons-material/Assessment";
import SchoolIcon from "@mui/icons-material/School";
import InsightsIcon from "@mui/icons-material/Insights";
import ScheduleIcon from "@mui/icons-material/Schedule";

/* ── Per-widget icon + color config ────────────────────────────────────── */
const WIDGET_META = {
    welcome: { Icon: WavingHandIcon, color: "#d97706", bg: "#fef3c7" },
    counts: { Icon: BarChartRoundedIcon, color: "#0891b2", bg: "#e0f2fe" },
    myCourses: { Icon: MenuBookIcon, color: "#7c3aed", bg: "#ede9fe" },
    courses: { Icon: LibraryBooksIcon, color: "#1d4ed8", bg: "#dbeafe" },
    courseCategory: { Icon: CollectionsBookmarkIcon, color: "#4338ca", bg: "#e0e7ff" },
    scheduledCourses: { Icon: CalendarMonthIcon, color: "#ea580c", bg: "#ffedd5" },
    studentCounts: { Icon: GroupIcon, color: "#059669", bg: "#d1fae5" },
    statsCards: { Icon: AssessmentIcon, color: "#2563eb", bg: "#dbeafe" },
    enrolledWidget: { Icon: SchoolIcon, color: "#7c3aed", bg: "#ede9fe" },
    progressAnalytics: { Icon: InsightsIcon, color: "#10b981", bg: "#d1fae5" },
    upcomingSchedule: { Icon: ScheduleIcon, color: "#b45309", bg: "#fef3c7" },
};

const FALLBACK_META = { Icon: BarChartRoundedIcon, color: "#64748b", bg: "#f1f5f9" };

/* ── Widget section title ───────────────────────────────────────────────── */
function WidgetTitle({ id, title }) {
    if (!title) return null;
    const { Icon, color, bg } = WIDGET_META[id] ?? FALLBACK_META;

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                mb: 2.5,
                animation: "wgtFadeIn 0.35s ease both",
                "@keyframes wgtFadeIn": {
                    from: { opacity: 0, transform: "translateX(-8px)" },
                    to: { opacity: 1, transform: "translateX(0)" },
                },
            }}
        >
            {/* Icon badge */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 38,
                    height: 38,
                    borderRadius: 2,
                    bgcolor: bg,
                    boxShadow: `0 2px 10px ${color}28`,
                    flexShrink: 0,
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": { transform: "scale(1.1)", boxShadow: `0 4px 14px ${color}40` },
                }}
            >
                <Icon sx={{ fontSize: 20, color }} />
            </Box>

            {/* Left-accent + text */}
            <Box
            >
                <Typography
                    sx={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        lineHeight: 1.2,
                        color: "text.primary",
                        // letterSpacing: "0.01em",
                    }}
                >
                    {title}
                </Typography>
            </Box>
        </Box>
    );
}

/* ── Main grid ──────────────────────────────────────────────────────────── */
export default function DashboardGrid({ role }) {
    const layout = useSelector((s) => s.dashboard.layout[role]);
    const widgets = useSelector((s) => s.dashboard.widgets[role]);
    const { loadDashboardStatus } = useDashboard();

    useEffect(() => {
        loadDashboardStatus({});
    }, []);

    return (
        <Box>
            <Box>
                {widgets.map((id) => {
                    const title = WIDGETS[id]?.title;
                    return (
                        <div key={id}>
                            <Paper
                                sx={{
                                    my: 3,
                                    height: "100%",
                                    boxShadow: 0,
                                    borderRadius: 1,
                                    backgroundColor: "transparent",
                                }}
                            >
                                {/* <WidgetTitle id={id} title={title} /> */}
                                <Box sx={{
                                    // display: "flex",
                                    // flexDirection: "column",
                                    // gap: 2,
                                    // p: 2.5,
                                    // borderRadius: 3,
                                    // border: "1px solid",
                                    // borderColor: "divider",
                                    // background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                                }}>
                                    <WidgetRenderer widgetId={id} />
                                </Box>
                            </Paper>
                        </div>
                    );
                })}
            </Box>
        </Box>
    );
}
