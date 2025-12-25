import React from "react";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  People as PeopleIcon,
  LibraryBooks as LibraryBooksIcon,
  Assignment as AssignmentIcon,
  OnlinePrediction as OnlinePredictionIcon,
  AttachMoney as AttachMoneyIcon,
  BarChart as BarChartIcon,
  LiveTv as LiveTvIcon,
} from "@mui/icons-material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { useDispatch } from "react-redux";
import { setContainerTitle } from "../../redux/slices/uiSlice";

// ---------- Dummy Data ----------
const summaryData = [
  { title: "Total Users", value: "2,450", icon: <PeopleIcon color="primary" /> },
  { title: "Total Courses", value: "120", icon: <LibraryBooksIcon color="primary" /> },
  { title: "Exams Conducted", value: "86", icon: <AssignmentIcon color="primary" /> },
  { title: "Active Users", value: "157", icon: <OnlinePredictionIcon color="primary" /> },
  { title: "Revenue", value: "$12,340", icon: <AttachMoneyIcon color="primary" /> },
];

const courseData = [
  { name: "React", users: 120 },
  { name: "Python", users: 95 },
  { name: "Java", users: 80 },
  { name: "SQL", users: 60 },
  { name: "Node.js", users: 45 },
];

const examData = [
  { month: "Jan", pass: 80 },
  { month: "Feb", pass: 75 },
  { month: "Mar", pass: 85 },
  { month: "Apr", pass: 90 },
  { month: "May", pass: 70 },
];

const recentActivities = [
  "New course 'Advanced React' added",
  "Exam 'JS Fundamentals' conducted",
  "User 'John Doe' registered",
  "Payment received: $49",
];

export default function Dashboard() {
  const dispatch = useDispatch();
  React.useEffect(() => {
    dispatch(setContainerTitle("Dashboard"));
  }, [dispatch]);
  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, mt: 4, backgroundColor: "#f9f9f9", minHeight: "100vh" }}>

      {/* ---------- Summary Cards ---------- */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          justifyContent: "center",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {summaryData.map((item, index) => (
          <Paper
            key={index}
            sx={{
              p: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              borderRadius: 3,
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: 4,
                transform: "translateY(-4px)",
              },
            }}
          >
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                {item.title}
              </Typography>
              <Typography variant="h6" fontWeight={600}>
                {item.value}
              </Typography>
            </Box>
            {item.icon}
          </Paper>
        ))}
      </Box>

      {/* ---------- Charts Section ---------- */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          justifyContent: "center",
          mt: 4,
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Bar Chart */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: 4, transform: "translateY(-4px)" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Course Enrollment Overview
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={courseData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="users" fill="#1976d2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>

        {/* Line Chart */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: 4, transform: "translateY(-4px)" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Exam Performance
          </Typography>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={examData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="pass" stroke="#1976d2" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </Paper>
      </Box>

      {/* ---------- Live Users & Activity Feed ---------- */}
      <Box
        sx={{
          display: "grid",
          gap: 3,
          justifyContent: "center",
          mt: 4,
          gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
          maxWidth: 1200,
          mx: "auto",
        }}
      >
        {/* Live Users */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: 4, transform: "translateY(-4px)" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Live Users{" "}
            <LiveTvIcon
              sx={{ ml: 1, verticalAlign: "middle", color: "primary.main" }}
            />
          </Typography>
          <Typography variant="h4" color="primary" fontWeight={700}>
            157
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Currently active across all courses.
          </Typography>
        </Paper>

        {/* Recent Activities */}
        <Paper
          sx={{
            p: 3,
            borderRadius: 3,
            transition: "all 0.3s ease",
            "&:hover": { boxShadow: 4, transform: "translateY(-4px)" },
          }}
        >
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Recent Activities
          </Typography>
          <List dense>
            {recentActivities.map((activity, i) => (
              <ListItem key={i} sx={{ py: 0.5 }}>
                <ListItemIcon>
                  <BarChartIcon color="primary" />
                </ListItemIcon>
                <ListItemText primary={activity} />
              </ListItem>
            ))}
          </List>
        </Paper>
      </Box>
    </Box>
  );
}
