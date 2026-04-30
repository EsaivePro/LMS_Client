import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Skeleton
} from "@mui/material";

import { motion } from "framer-motion";

import SchoolIcon from "@mui/icons-material/School";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import QuizIcon from "@mui/icons-material/Quiz";

const CARDS = [
  {
    key: "active",
    label: "Enrolled Courses",
    icon: SchoolIcon,
    color: "#4F46E5",
    bg: "rgba(79,70,229,.10)"
  },
  {
    key: "completed",
    label: "Completed",
    icon: PlayCircleOutlineIcon,
    color: "#10B981",
    bg: "rgba(16,185,129,.10)"
  },
  {
    key: "inprogress",
    label: "In Progress",
    icon: CheckCircleOutlineIcon,
    color: "#2563EB",
    bg: "rgba(37,99,235,.10)"
  },
  {
    key: "scheduled",
    label: "Upcoming Exams",
    icon: QuizIcon,
    color: "#7C3AED",
    bg: "rgba(124,58,237,.10)"
  }
];

function StatCard({ config, value, loading }) {

  const Icon = config.icon;

  return (
    <motion.div
      whileHover={{
        y: -2,
        scale: 1.01
      }}
      transition={{
        type: "spring",
        stiffness: 320
      }}
      style={{ height: "100%" }}
    >

      <Card
        sx={{
          height: "100%",
          width: "100%",
          borderRadius: 2,
          background: "#fff",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15,23,42,.05)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <CardContent
          sx={{
            p: 2
          }}
        >
          <Box
            display="flex"
            gap={2}
          // justifyContent="space-between"
          // alignItems="center"
          >
            <Box
              sx={{
                width: 60,
                height: 60,
                borderRadius: 3,
                background: config.bg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <Icon
                sx={{
                  fontSize: 32,
                  color: config.color
                }}
              />
            </Box>
            <Box>
              <Typography
                sx={{
                  fontSize: 14,
                  fontWeight: 500,
                  letterSpacing: 1,
                  textTransform: "uppercase",
                  color: "#64748B"
                }}
              >
                {config.label}
              </Typography>

              {loading ? (
                <Skeleton
                  width={80}
                  height={45}
                />
              ) : (
                <Typography
                  sx={{
                    fontSize: {
                      xs: "2rem",
                      md: "2.4rem"
                    },
                    fontWeight: 800
                  }}
                >
                  {value || 0}
                </Typography>
              )}

              {/* <Typography
                sx={{
                  mt: 2,
                  fontSize: 14,
                  color: "#94A3B8"
                }}
              >
                Learning activity overview
              </Typography> */}

            </Box>
          </Box>

        </CardContent>
      </Card>

    </motion.div>
  );
}

export default function StatsCards({
  stats = {},
  loading = false
}) {
  return (

    <Box
      sx={{
        width: "100%",
        px: {
          xs: 0,
          md: 0
        },
        mb: 4
      }}
    >

      <Box
        sx={{
          display: "grid",
          gap: 3,

          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2,1fr)",
            lg: "repeat(4,1fr)"
          }
        }}
      >
        {CARDS.map(card => (
          <StatCard
            key={card.key}
            config={card}
            value={stats?.[card.key]}
            loading={loading}
          />
        ))}
      </Box>

    </Box>

  );
}