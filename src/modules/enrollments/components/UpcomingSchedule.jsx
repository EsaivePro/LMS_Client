import React from "react";
import {
  Box, Typography, List, ListItem, ListItemText,
  Chip, Divider, Skeleton, Paper,
} from "@mui/material";
import { motion } from "framer-motion";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import QuizIcon from "@mui/icons-material/Quiz";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(relativeTime);

function CountdownBadge({ date }) {
  const diffHours = dayjs(date).diff(dayjs(), "hour");
  const color = diffHours < 24 ? "error" : diffHours < 72 ? "warning" : "info";
  const label = diffHours < 1
    ? "< 1h left"
    : diffHours < 24
    ? `${diffHours}h left`
    : dayjs(date).fromNow();
  return (
    <Chip
      label={label}
      size="small"
      color={color}
      variant="outlined"
      sx={{ fontSize: "0.63rem", height: 18, fontWeight: 700 }}
    />
  );
}

function ScheduleSection({ title, icon: Icon, color, items, loading, renderSub }) {
  return (
    <Box sx={{ mb: 0.5 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 1.25 }}>
        <Icon sx={{ fontSize: 15, color }} />
        <Typography variant="subtitle2" fontWeight={700} color={color} sx={{ fontSize: "0.8rem" }}>
          {title}
        </Typography>
      </Box>

      {loading ? (
        Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={50} sx={{ mb: 0.75, borderRadius: 1.5 }} />
        ))
      ) : items.length === 0 ? (
        <Typography variant="caption" color="text.disabled" sx={{ pl: 0.5, display: "block", mb: 1 }}>
          Nothing here right now
        </Typography>
      ) : (
        <List dense disablePadding>
          {items.map((item, i) => (
            <motion.div
              key={item.id ?? i}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
            >
              <ListItem
                disableGutters
                sx={{
                  bgcolor:      "background.paper",
                  border:       "1px solid",
                  borderColor:  "divider",
                  borderRadius: 2,
                  px:           1.5,
                  py:           0.8,
                  mb:           0.75,
                  "&:hover":    { bgcolor: "action.hover" },
                  cursor:       "default",
                }}
              >
                <ListItemText
                  disableTypography
                  primary={
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      noWrap
                      sx={{ fontSize: "0.78rem", maxWidth: 180 }}
                    >
                      {item.module_title ?? "Untitled"}
                    </Typography>
                  }
                  secondary={renderSub(item)}
                />
              </ListItem>
            </motion.div>
          ))}
        </List>
      )}
    </Box>
  );
}

export default function UpcomingSchedule({ upcomingExams = [], expiringCourses = [], loading }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p:           2,
        borderRadius: 3,
        position:    "sticky",
        top:         16,
        maxHeight:   "calc(100vh - 140px)",
        overflowY:   "auto",
        boxShadow:   "0 2px 14px rgba(0,0,0,0.05)",
      }}
    >
      <Typography variant="subtitle1" fontWeight={800} sx={{ mb: 2, fontSize: "0.92rem" }}>
        Schedule &amp; Deadlines
      </Typography>

      <ScheduleSection
        title="Upcoming Exams"
        icon={QuizIcon}
        color="#1565c0"
        items={upcomingExams}
        loading={loading}
        renderSub={(item) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3, flexWrap: "wrap" }}>
            <AccessTimeIcon sx={{ fontSize: 11, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.67rem" }}>
              {item.scheduled_start_at
                ? dayjs(item.scheduled_start_at).format("MMM D, HH:mm")
                : "TBD"}
            </Typography>
            {item.scheduled_start_at && <CountdownBadge date={item.scheduled_start_at} />}
          </Box>
        )}
      />

      <Divider sx={{ my: 1.75 }} />

      <ScheduleSection
        title="Expiring Soon"
        icon={WarningAmberIcon}
        color="#e65100"
        items={expiringCourses}
        loading={loading}
        renderSub={(item) => (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 0.3 }}>
            <AccessTimeIcon sx={{ fontSize: 11, color: "text.disabled" }} />
            <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.67rem" }}>
              Expires {dayjs(item.scheduled_end_at).fromNow()}
            </Typography>
          </Box>
        )}
      />
    </Paper>
  );
}
