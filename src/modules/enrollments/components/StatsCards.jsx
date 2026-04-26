import React from "react";
import { Grid, Card, CardContent, Typography, Box, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import SchoolIcon from "@mui/icons-material/School";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";
import StarOutlineIcon from "@mui/icons-material/StarOutline";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const CARDS = [
  {
    key: "active",
    label: "Active Courses",
    icon: SchoolIcon,
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    glow: "rgba(102,126,234,0.35)",
  },
  {
    key: "inprogress",
    label: "In Progress",
    icon: PlayCircleOutlineIcon,
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    glow: "rgba(245,87,108,0.35)",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckCircleOutlineIcon,
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    glow: "rgba(0,242,254,0.35)",
  },
  {
    key: "scheduled",
    label: "Upcoming Exams",
    icon: QuizIcon,
    gradient: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    glow: "rgba(67,233,123,0.35)",
  },
  {
    key: "avgMarks",
    label: "Avg Marks",
    icon: StarOutlineIcon,
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    glow: "rgba(250,112,154,0.35)",
    format: (v) => (v ? `${Math.round(v)}%` : "N/A"),
  },
  {
    key: "certificates",
    label: "Certificates",
    icon: WorkspacePremiumIcon,
    gradient: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
    glow: "rgba(161,140,209,0.35)",
  },
];

function StatCard({ config, value, loading }) {
  const Icon = config.icon;
  const display = config.format ? config.format(value) : (value ?? 0);

  return (
    <motion.div whileHover={{ y: -5, scale: 1.03 }} transition={{ type: "spring", stiffness: 320, damping: 20 }}>
      <Card
        sx={{
          background: config.gradient,
          boxShadow: `0 8px 32px ${config.glow}`,
          borderRadius: 3,
          overflow: "hidden",
          color: "#fff",
          minHeight: 116,
          position: "relative",
          border: "none",
        }}
      >
        {/* Decorative circle */}
        <Box
          sx={{
            position: "absolute",
            top: -28,
            right: -28,
            width: 90,
            height: 90,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.12)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -24,
            left: -24,
            width: 70,
            height: 70,
            borderRadius: "50%",
            bgcolor: "rgba(255,255,255,0.08)",
            pointerEvents: "none",
          }}
        />
        <CardContent sx={{ position: "relative", zIndex: 1, p: "14px 16px !important" }}>
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
            <Box>
              <Typography
                variant="caption"
                sx={{ opacity: 0.88, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.6, fontSize: "0.65rem" }}
              >
                {config.label}
              </Typography>
              {loading ? (
                <Skeleton variant="text" width={56} height={42} sx={{ bgcolor: "rgba(255,255,255,0.28)" }} />
              ) : (
                <Typography variant="h4" fontWeight={800} sx={{ mt: 0.25, lineHeight: 1 }}>
                  {display}
                </Typography>
              )}
            </Box>
            <Box sx={{ bgcolor: "rgba(255,255,255,0.22)", borderRadius: 2, p: 0.9, display: "flex", mt: 0.25 }}>
              <Icon sx={{ fontSize: 26 }} />
            </Box>
          </Box>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function StatsCards({ stats, loading }) {
  return (
    <Grid container spacing={2}>
      {CARDS.map((card, i) => (
        <Grid key={card.key} size={{ xs: 6, sm: 4, md: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07, type: "spring", stiffness: 300 }}
          >
            <StatCard config={card} value={stats?.[card.key]} loading={loading} />
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
}
