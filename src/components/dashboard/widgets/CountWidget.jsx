import { Box, Typography, Grid, Paper } from "@mui/material";
import {
    People as PeopleIcon,
    LibraryBooks as LibraryBooksIcon,
    OnlinePrediction as OnlinePredictionIcon,
} from "@mui/icons-material";

/* ---------- Dummy Data ---------- */
const summaryData = [
    {
        title: "Total Users",
        value: "2,450",
        icon: PeopleIcon,
        color: "#5b90faff",
    },
    {
        title: "Total Courses",
        value: "120",
        icon: LibraryBooksIcon,
        color: "#5b90faff",
    },
    {
        title: "Active Users",
        value: "157",
        icon: OnlinePredictionIcon,
        color: "#5b90faff",
    },
];

export default function CountWidget() {
    return (
        <Box sx={{ flexGrow: 1, gap: 5, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr" } }}>
            {summaryData.map((item, index) => {
                const Icon = item.icon;

                return (
                    <Grid item xs={12} sm={6} md={4} key={index}>
                        <Paper
                            elevation={0}
                            sx={{
                                p: 3,
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
                                    variant="h4"
                                    fontWeight={700}
                                    lineHeight={1.2}
                                >
                                    {item.value}
                                </Typography>
                            </Box>

                            {/* ICON */}
                            <Box
                                sx={{
                                    width: 56,
                                    height: 56,
                                    borderRadius: "50%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: `${item.color}15`,
                                }}
                            >
                                <Icon
                                    sx={{
                                        fontSize: 40,
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
