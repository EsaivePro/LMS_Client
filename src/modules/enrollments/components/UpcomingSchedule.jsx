import React from "react";
import { Box, Typography, Divider, Skeleton } from "@mui/material";
import { motion } from "framer-motion";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function PanelSkeleton() {
  return Array.from({ length: 3 }).map((_, i) => (
    <Box key={i}>
      {i > 0 && <Divider />}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, py: 1.5 }}>
        <Skeleton variant="rounded" width={38} height={38} />
        <Box sx={{ flex: 1 }}>
          <Skeleton width="60%" height={18} />
          <Skeleton width="40%" height={14} sx={{ mt: 0.5 }} />
        </Box>
        <Skeleton width={50} height={14} />
      </Box>
    </Box>
  ));
}

function EmptyState({ message }) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 4, gap: 1 }}>
      <Typography variant="body2" color="text.disabled" sx={{ fontSize: "0.82rem" }}>
        {message}
      </Typography>
    </Box>
  );
}

/* ── Upcoming Schedule panel ────────────────────────────────────────────── */
function UpcomingPanel({ items, loading }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
          Upcoming Schedule
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, cursor: "pointer", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.8rem", color: "primary.main" }}>
            View all
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {loading ? (
        <PanelSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No upcoming schedules" />
      ) : (
        items.map((item, i) => {
          const isExam = item.module_type === "exam";
          const Icon = isExam ? QuizIcon : SchoolIcon;
          const iconBg = isExam ? "#ede9fe" : "#dbeafe";
          const iconColor = isExam ? "#7c3aed" : "#2563eb";
          const startDate = item.scheduled_start_at;
          const daysLeft = item.days_until_start ?? dayjs(startDate).diff(dayjs(), "day");
          const daysLabel =
            daysLeft === 0 ? "Today" : daysLeft === 1 ? "Tomorrow" : `In ${daysLeft} days`;

          return (
            <React.Fragment key={item.id ?? i}>
              {i > 0 && <Divider />}
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.5,
                    px: 0.5,
                    borderRadius: 1.5,
                    cursor: "default",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {/* Icon badge */}
                  <Box
                    sx={{
                      width: 38, height: 38, borderRadius: 2,
                      bgcolor: iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <Icon sx={{ fontSize: 20, color: iconColor }} />
                  </Box>

                  {/* Title + days label */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} noWrap color="text.primary">
                      {item.module_title ?? "Untitled"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                      {daysLabel}
                    </Typography>
                  </Box>

                  {/* Date on right */}
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, flexShrink: 0 }}>
                    <CalendarMonthIcon sx={{ fontSize: 13, color: "text.disabled" }} />
                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem", whiteSpace: "nowrap" }}>
                      {startDate ? dayjs(startDate).format("MMM D, YYYY") : "TBD"}
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            </React.Fragment>
          );
        })
      )}
    </Box>
  );
}

/* ── Expiring Soon panel ────────────────────────────────────────────────── */
function ExpiringPanel({ items, loading }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: 2.5,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
        minWidth: 0,
      }}
    >
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 700, color: "text.primary", lineHeight: 1.2 }}>
          Expiring Soon
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.2, cursor: "pointer", color: "primary.main", "&:hover": { textDecoration: "underline" } }}>
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: "0.8rem", color: "primary.main" }}>
            View all
          </Typography>
          <ChevronRightIcon sx={{ fontSize: 16 }} />
        </Box>
      </Box>

      {loading ? (
        <PanelSkeleton />
      ) : items.length === 0 ? (
        <EmptyState message="No courses expiring soon" />
      ) : (
        items.map((item, i) => {
          const expiresAt = item.expires_at || item.scheduled_end_at;
          const diffDays = dayjs(expiresAt).diff(dayjs(), "day");
          const dotColor = diffDays <= 3 ? "#ef4444" : diffDays <= 7 ? "#f59e0b" : "#3b82f6";
          const iconBg = diffDays <= 3 ? "#fee2e2" : diffDays <= 7 ? "#fef3c7" : "#dbeafe";

          return (
            <React.Fragment key={item.id ?? i}>
              {i > 0 && <Divider />}
              <motion.div
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    py: 1.5,
                    px: 0.5,
                    borderRadius: 1.5,
                    cursor: "default",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  {/* Icon badge */}
                  <Box
                    sx={{
                      width: 38, height: 38, borderRadius: 2,
                      bgcolor: iconBg,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <WarningAmberIcon sx={{ fontSize: 20, color: dotColor }} />
                  </Box>

                  {/* Title + expiry label */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography fontWeight={700} fontSize={14} noWrap color="text.primary">
                      {item.module_title ?? "Untitled"}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AccessTimeIcon sx={{ fontSize: 11, color: "text.disabled" }} />
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.72rem" }}>
                        {expiresAt ? `Expires ${dayjs(expiresAt).fromNow()}` : "Expiry unknown"}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Dot indicator */}
                  <Box
                    sx={{
                      width: 9, height: 9, borderRadius: "50%",
                      bgcolor: dotColor, flexShrink: 0,
                    }}
                  />
                </Box>
              </motion.div>
            </React.Fragment>
          );
        })
      )}
    </Box>
  );
}

/* ── Main export ────────────────────────────────────────────────────────── */
export default function UpcomingSchedule({ upcomingExams = [], expiringCourses = [], loading }) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 2.5,
        alignItems: "stretch",
        flexDirection: { xs: "column", md: "row" },
      }}
    >
      <UpcomingPanel items={upcomingExams} loading={loading} />
      <ExpiringPanel items={expiringCourses} loading={loading} />
    </Box>
  );
}
