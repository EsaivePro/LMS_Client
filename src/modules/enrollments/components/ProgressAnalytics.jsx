import React, { useMemo } from "react";
import { Grid, Card, CardContent, Typography, Box } from "@mui/material";
import {
  AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip as RTooltip,
  ResponsiveContainer, Legend,
  PieChart, Pie, Cell, Label,
  BarChart, Bar, Cell as BarCell,
  RadialBarChart, RadialBar,
} from "recharts";
import dayjs from "dayjs";

/* ─── palette ─────────────────────────────────────────────────────────── */
const P = {
  primary: "#8b5cf6",
  secondary: "#3b82f6",
  success: "#10b981",
  warning: "#f59e0b",
  pink: "#ec4899",
  teal: "#14b8a6",
  orange: "#f97316",
};

/* ─── custom tooltip ──────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        bgcolor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 2,
        px: 1.75,
        py: 1.25,
        boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
        minWidth: 110,
      }}
    >
      {label && (
        <Typography sx={{ fontSize: 11, color: "text.secondary", mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
      )}
      {payload.map((p, i) => (
        <Box key={i} sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25 }}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: p.color, flexShrink: 0 }} />
          <Typography sx={{ fontSize: 12 }}>
            {p.name}:&nbsp;<Box component="span" sx={{ fontWeight: 700 }}>{p.value}</Box>
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

/* ─── chart card ──────────────────────────────────────────────────────── */
function ChartCard({ title, accent = P.primary, children, height = 220 }) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 14px rgba(0,0,0,0.05)",
        height: "100%",
        overflow: "hidden",
        borderLeft: `3px solid ${accent}`,
        transition: "box-shadow 0.2s ease",
        "&:hover": { boxShadow: "0 6px 24px rgba(0,0,0,0.09)" },
      }}
    >
      <CardContent sx={{ pb: "12px !important" }}>
        <Typography
          sx={{
            fontSize: "0.82rem",
            fontWeight: 700,
            mb: 1.75,
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            "&::before": {
              content: '""',
              display: "block",
              width: 6,
              height: 6,
              borderRadius: "50%",
              bgcolor: accent,
              flexShrink: 0,
            },
          }}
        >
          {title}
        </Typography>
        <Box sx={{ height }}>{children}</Box>
      </CardContent>
    </Card>
  );
}

/* ─── data builders ───────────────────────────────────────────────────── */
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
    { range: "0–20", count: 0 },
    { range: "21–40", count: 0 },
    { range: "41–60", count: 0 },
    { range: "61–80", count: 0 },
    { range: "81–100", count: 0 },
  ];
  const bands = [[0, 20], [21, 40], [41, 60], [61, 80], [81, 100]];
  enrollments.forEach((e) => {
    if (e.marks == null) return;
    const i = bands.findIndex(([lo, hi]) => e.marks >= lo && e.marks <= hi);
    if (i >= 0) ranges[i].count += 1;
  });
  return ranges;
}

const BAR_COLORS = [P.secondary, P.teal, P.warning, P.success, P.pink];

/* ─── radial custom label ─────────────────────────────────────────────── */
function RadialLabel({ cx, cy, data }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0);
  return (
    <>
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#111" fontSize={20} fontWeight={800}>
        {total}
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle" fill="#888" fontSize={11}>
        Total
      </text>
    </>
  );
}

/* ─── main component ──────────────────────────────────────────────────── */
export default function ProgressAnalytics({ enrollments = [], stats }) {
  const trendData = useMemo(() => buildTrend(enrollments), [enrollments]);
  const marksData = useMemo(() => buildMarksRange(enrollments), [enrollments]);

  const donutData = [
    { name: "Courses", value: stats?.courses ?? 0 },
    { name: "Exams", value: stats?.exams ?? 0 },
  ];
  const donutTotal = (stats?.courses ?? 0) + (stats?.exams ?? 0);

  const radialData = [
    { name: "Completed", value: stats?.completed ?? 0, fill: P.success },
    { name: "In Progress", value: stats?.inprogress ?? 0, fill: P.secondary },
    { name: "Active", value: stats?.active ?? 0, fill: P.primary },
    { name: "Pending", value: stats?.pending ?? 0, fill: P.warning },
  ].filter((d) => d.value > 0);

  const radialMax = Math.max(...radialData.map((d) => d.value), 1);

  return (
    <Box>
      <Grid container spacing={2.5}>

        {/* ── Enrollment Trend — AreaChart ───────────────────────── */}
        <Grid size={{ xs: 12, md: 7 }}>
          <ChartCard title="Enrollment Trend" accent={P.primary} height={220}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 4, right: 6, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={P.primary} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={P.primary} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDone" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={P.success} stopOpacity={0.28} />
                    <stop offset="95%" stopColor={P.success} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <RTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Area
                  type="monotone" dataKey="total" stroke={P.primary} strokeWidth={2.5}
                  fill="url(#gradTotal)" dot={{ r: 3.5, fill: P.primary, strokeWidth: 0 }}
                  activeDot={{ r: 5 }} name="Total"
                  isAnimationActive animationDuration={1200} animationBegin={100}
                />
                <Area
                  type="monotone" dataKey="completed" stroke={P.success} strokeWidth={2.5}
                  fill="url(#gradDone)" dot={{ r: 3.5, fill: P.success, strokeWidth: 0 }}
                  activeDot={{ r: 5 }} name="Completed"
                  isAnimationActive animationDuration={1200} animationBegin={300}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* ── Course vs Exam — Donut ──────────────────────────────── */}
        <Grid size={{ xs: 12, sm: 6, md: 5 }}>
          <ChartCard title="Course vs Exam" accent={P.secondary} height={220}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%" cy="50%"
                  innerRadius={58} outerRadius={82}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive animationDuration={900} animationBegin={100}
                  strokeWidth={0}
                >
                  {donutData.map((_, i) => (
                    <Cell key={i} fill={[P.primary, P.secondary][i]} />
                  ))}
                  <Label
                    content={({ viewBox: { cx, cy } }) => (
                      <>
                        <text x={cx} y={cy - 7} textAnchor="middle" fill="#111" fontSize={22} fontWeight={800}>
                          {donutTotal}
                        </text>
                        <text x={cx} y={cy + 12} textAnchor="middle" fill="#888" fontSize={11}>
                          Total
                        </text>
                      </>
                    )}
                  />
                </Pie>
                <RTooltip content={<CustomTooltip />} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* ── Marks Distribution — BarChart ──────────────────────── */}
        <Grid size={{ xs: 12, sm: 6, md: 6 }}>
          <ChartCard title="Marks Distribution" accent={P.teal} height={200}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marksData} margin={{ top: 4, right: 6, left: -20, bottom: 0 }} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="range" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} axisLine={false} tickLine={false} />
                <RTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}
                  isAnimationActive animationDuration={800} animationBegin={150}
                >
                  {marksData.map((_, i) => (
                    <BarCell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </Grid>

        {/* ── Status Distribution — RadialBarChart ───────────────── */}
        {radialData.length > 0 && (
          <Grid size={{ xs: 12, sm: 6, md: 6 }}>
            <ChartCard title="Status Distribution" accent={P.success} height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart
                  cx="50%" cy="50%"
                  innerRadius={28} outerRadius={90}
                  barSize={12} data={radialData}
                  startAngle={90} endAngle={-270}
                >
                  <RadialBar
                    minAngle={4}
                    background={{ fill: "#f5f5f5" }}
                    clockWise
                    dataKey="value"
                    cornerRadius={6}
                    isAnimationActive animationDuration={1000} animationBegin={200}
                  />
                  <RTooltip content={<CustomTooltip />} />
                  <Legend
                    iconType="circle" iconSize={8}
                    layout="vertical" align="right" verticalAlign="middle"
                    wrapperStyle={{ fontSize: 11, lineHeight: "22px" }}
                    formatter={(value, entry) => (
                      <span style={{ color: "#555" }}>{value} ({entry.payload.value})</span>
                    )}
                  />
                </RadialBarChart>
              </ResponsiveContainer>
            </ChartCard>
          </Grid>
        )}

      </Grid>
    </Box>
  );
}
