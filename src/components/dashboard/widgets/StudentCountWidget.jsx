import { Box, Typography, Grid, Paper, useMediaQuery, useTheme } from "@mui/material";
import {
    People as PeopleIcon,
    LibraryBooks as LibraryBooksIcon,
    OnlinePrediction as OnlinePredictionIcon,
} from "@mui/icons-material";
import ChecklistIcon from '@mui/icons-material/Checklist';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import DoNotTouchIcon from '@mui/icons-material/DoNotTouch';
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";
import { useMemo } from "react";

/* ---------- Dummy Data ---------- */
// Default/dummy summary configuration (values will be replaced dynamically)
const baseSummary = [
    { title: "Total Courses", icon: LibraryBooksIcon, color: "var(--dark)" },
    { title: "Completed Courses", icon: ChecklistIcon, color: "var(--dark)" },
    { title: "Not Started", icon: DoNotTouchIcon, color: "var(--dark)" },
];

export default function StudentCountWidget() {
    const { enrollmentCoursesByUser } = useEnrollment();
    const { user } = useAuth();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const summaryData = useMemo(() => {
        const rows = (user && enrollmentCoursesByUser && enrollmentCoursesByUser[user.id]) || [];
        const total = rows.length;
        const completed = rows.filter((r) => r.completed_at || r.status === "completed").length;
        const notStarted = rows.filter((r) => !r.started_at).length;

        return [
            { ...baseSummary[0], value: String(total) },
            { ...baseSummary[1], value: String(completed) },
            { ...baseSummary[2], value: String(notStarted) },
        ];
    }, [enrollmentCoursesByUser, user]);

    return (
        <Box sx={{ flexGrow: 1, gap: isMobile ? 2 : 5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
            {summaryData.map((item, index) => {
                const Icon = item.icon;

                return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: isMobile ? 2 : 3,
                                height: "100%",
                                borderRadius: 1,
                                border: "1px solid",
                                borderColor: "divider",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                background:
                                    "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,245,0.9))",
                                transition: "all 0.25s ease",
                                "&:hover": {
                                    transform: "translateY(-6px)",
                                    boxShadow: 3,
                                },
                            }}
                        >
                            {/* LEFT CONTENT */}
                            <Box>
                                <Typography
                                    variant="body2"
                                    color="text.secondary"
                                    gutterBottom
                                >
                                    {item.title}
                                </Typography>

                                <Typography
                                    variant={isMobile ? "h5" : "h4"}
                                    fontWeight={700}
                                    lineHeight={1.2}
                                    color="var(--darkMedium)"
                                >
                                    {item.value}
                                </Typography>
                            </Box>

                            {/* ICON */}
                            <Box
                                sx={{
                                    width: isMobile ? 30 : 56,
                                    height: isMobile ? 30 : 56,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: `${item.color}15`,
                                }}
                            >
                                <Icon
                                    sx={{
                                        fontSize: isMobile ? 30 : 40,
                                        color: item.color,
                                    }}
                                />
                            </Box>
                        </Paper>
                    </Grid>
                );
            })}
        </Box>
    );
}
