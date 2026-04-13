import { Box, Typography, Grid, Paper, useMediaQuery, useTheme, Fade, Zoom } from "@mui/material";
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
                    <Zoom in style={{ transitionDelay: `${index * 120}ms` }} key={index}>
                        <Grid item xs={12} sm={6} md={4}>
                            <Paper
                                elevation={0}
                                sx={{
                                    p: isMobile ? 2 : 3,
                                    height: "100%",
                                    borderRadius: 3,
                                    border: "1.5px solid",
                                    borderColor: "divider",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    background:
                                        "linear-gradient(135deg, #f8fafc 0%, #e0e7ef 100%)",
                                    boxShadow: '0 4px 24px 0 rgba(31, 38, 135, 0.10)',
                                    transition: "box-shadow 0.35s cubic-bezier(.4,2,.6,1), transform 0.35s cubic-bezier(.4,2,.6,1)",
                                    position: 'relative',
                                    overflow: 'hidden',
                                    '&:hover': {
                                        transform: "translateY(-8px) scale(1.03)",
                                        boxShadow: '0 12px 32px 0 rgba(31,38,135,0.18)',
                                        borderColor: 'var(--primaryMedium, #4f8cff)',
                                    },
                                }}
                            >
                                {/* LEFT CONTENT */}
                                <Fade in timeout={700 + index * 100}>
                                    <Box>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                            gutterBottom
                                            sx={{ letterSpacing: 0.2, fontWeight: 600 }}
                                        >
                                            {item.title}
                                        </Typography>
                                        <Typography
                                            variant={isMobile ? "h5" : "h4"}
                                            fontWeight={800}
                                            lineHeight={1.2}
                                            color="var(--darkMedium)"
                                            sx={{
                                                textShadow: '0 2px 12px rgba(76,140,255,0.08)',
                                                letterSpacing: 0.5,
                                                transition: 'color 0.3s',
                                            }}
                                        >
                                            {item.value}
                                        </Typography>
                                    </Box>
                                </Fade>
                                {/* ICON */}
                                <Fade in timeout={900 + index * 100}>
                                    <Box
                                        sx={{
                                            width: isMobile ? 38 : 62,
                                            height: isMobile ? 38 : 62,
                                            borderRadius: "50%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: `radial-gradient(circle at 60% 40%, ${item.color}22 60%, #fff0 100%)`,
                                            boxShadow: `0 0 0 0 ${item.color}22, 0 2px 8px 0 ${item.color}18`,
                                            transition: 'box-shadow 0.3s, background 0.3s',
                                            '&:hover': {
                                                boxShadow: `0 0 0 8px ${item.color}22, 0 8px 24px 0 ${item.color}22`,
                                                background: `radial-gradient(circle at 60% 40%, ${item.color}33 70%, #fff0 100%)`,
                                            },
                                        }}
                                    >
                                        <Icon
                                            sx={{
                                                fontSize: isMobile ? 32 : 44,
                                                color: item.color,
                                                filter: 'drop-shadow(0 2px 8px rgba(76,140,255,0.10))',
                                                transition: 'color 0.3s',
                                            }}
                                        />
                                    </Box>
                                </Fade>
                            </Paper>
                        </Grid>
                    </Zoom>
                );
            })}
        </Box>
    );
}
