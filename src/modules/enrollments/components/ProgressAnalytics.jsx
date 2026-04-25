import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
  PieChart, Pie, Cell,
  BarChart, Bar,
  RadialBarChart, RadialBar,
} from "recharts";
import dayjs from "dayjs";

const PALETTE = {
  primary:   "#8F00FF",
  secondary: "#4facfe",
  success:   "#43e97b",
  warning:   "#fee140",
  pink:      "#f093fb",
};

function ChartCard({ title, children, height = 220 }) {
  return (
    <Card
      variant="outlined"
      sx={{ borderRadius: 3, boxShadow: "0 2px 14px rgba(0,0,0,0.05)", height: "100%" }}
    >
      <CardContent>
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.75, fontSize: "0.83rem" }}>
          {title}
        </Typography>
        <Box sx={{ height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

function buildTrend(enrollments) {
  const map = {};
  enrollments.forEach((e) => {
    if (!e.enrolled_at) return;
    const month = dayjs(e.enrolled_at).format("MMM YY");
    if (!map[month]) map[month] = { month, total: 0, completed: 0 };
    map[month].total += 1;
    if (e.status === "completed") map[month].completed += 1;
  });
  return Object.values(map).slice(-9);
}

function buildMarksRange(enrollments) {
  const ranges = [
    { range: "0–20",  count: 0 },
    { range: "21–40", count: 0 },
    { range: "41–60", count: 0 },
    { range: "61–80", count: 0 },
    { range: "81–100",count: 0 },
  ];
  const bands = [[0,20],[21,40],[41,60],[61,80],[81,100]];
  enrollments.forEach((e) => {
    if (e.marks == null) return;
    const i = bands.findIndex(([lo, hi]) => e.marks >= lo && e.marks <= hi);
    if (i >= 0) ranges[i].count += 1;
  });
  return ranges;
}

export default function ProgressAnalytics({ enrollments = [], stats }) {
  const trendData  = useMemo(() => buildTrend(enrollments),      [enrollments]);
  const marksData  = useMemo(() => buildMarksRange(enrollments), [enrollments]);

  const donutData  = [
    { name: "Courses", value: stats?.courses  ?? 0 },
    { name: "Exams",   value: stats?.exams    ?? 0 },
  ];
  const radialData = [
    { name: "Completed",  value: stats?.completed  ?? 0, fill: PALETTE.success   },
    { name: "In Progress",value: stats?.inprogress ?? 0, fill: PALETTE.secondary },
    { name: "Active",     value: stats?.active     ?? 0, fill: PALETTE.primary   },
    { name: "Pending",    value: stats?.pending    ?? 0, fill: PALETTE.warning   },
  ];

  const tooltipStyle = {
    borderRadius: 8,
    fontSize:     12,
    boxShadow:    "0 4px 16px rgba(0,0,0,0.12)",
  };

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, fontSize: "1rem" }}>
        Learning Analytics
      </Typography>

      <Grid container spacing={2.5}>
        {/* Enrollment Trend */}
        <Grid size={{ xs: 12, md: 6 }}>
          <ChartCard title="Enrollment Trend">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <RTooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                <Line
                  type="monotone" dataKey="total" stroke={PALETTE.primary}
                  strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.primary }} name="Total"
                />
                <Line
                  type="monotone" dataKey="completed" stroke={PALETTE.success}
                  strokeWidth={2.5} dot={{ r: 3, fill: PALETTE.success }} name="Completed"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Course vs Exam donut */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ChartCard title="Course vs Exam">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%" cy="48%"
                  innerRadius={52} outerRadius={78}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={[PALETTE.primary, PALETTE.secondary][i]} />
                  ))}
                </Pie>
                <RTooltip contentStyle={tooltipStyle} />
                <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Radial status breakdown */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <ChartCard title="Completion Status">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart
                cx="50%" cy="55%"
                innerRadius={16} outerRadius={88}
                data={radialData}
                startAngle={90} endAngle={-270}
              >
                <RadialBar
                  minAngle={8}
                  background
                  clockWise
                  dataKey="value"
                  label={{ position: "insideStart", fill: "#fff", fontSize: 10 }}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="bottom"
                  wrapperStyle={{ fontSize: 10 }}
                />
                <RTooltip contentStyle={tooltipStyle} />
              </RadialBarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* Marks distribution */}
        <Grid size={{ xs: 12 }}>
          <ChartCard title="Marks Distribution" height={180}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData} barSize={32} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={PALETTE.primary} />
                    <stop offset="100%" stopColor={PALETTE.pink}    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <RTooltip contentStyle={tooltipStyle} />
                <Bar dataKey="count" fill="url(#barGrad)" radius={[5, 5, 0, 0]} name="Students" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>
      </Grid>
    </Box>
  );
}
