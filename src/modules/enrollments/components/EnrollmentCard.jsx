import React from "react";
import {
  Card, CardContent, CardActions, Box, Typography,
  LinearProgress, Tooltip, IconButton, Chip, Stack,
  Divider, Avatar,
} from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import RestoreIcon from "@mui/icons-material/Restore";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import TimerIcon from "@mui/icons-material/Timer";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import StatusChip from "./StatusChip";

dayjs.extend(relativeTime);

const TYPE_CFG = {
  course: { icon: SchoolIcon, label: "Course", color: "#7b1fa2", bg: "#f3e5f5" },
  exam:   { icon: QuizIcon,   label: "Exam",   color: "#1565c0", bg: "#e3f2fd" },
};

function TypeBadge({ type }) {
  const cfg = TYPE_CFG[type?.toLowerCase()] ?? TYPE_CFG.course;
  const Icon = cfg.icon;
  return (
    <Chip
      icon={<Icon sx={{ fontSize: "13px !important", color: `${cfg.color} !important` }} />}
      label={cfg.label}
      size="small"
      sx={{ bgcolor: cfg.bg, color: cfg.color, fontWeight: 700, fontSize: "0.66rem", height: 20 }}
    />
  );
}

function MetaRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
      <Icon sx={{ fontSize: 12, color: "text.disabled" }} />
      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.67rem" }}>
        {label}:
      </Typography>
      <Typography variant="caption" fontWeight={600} sx={{ fontSize: "0.67rem" }}>
        {value}
      </Typography>
    </Box>
  );
}

function getCardAction(enrollment) {
  const { status, module_type } = enrollment;
  const isExam = module_type === "exam";
  if (isExam && ["active", "scheduled"].includes(status))
    return { label: "Start Exam",        icon: QuizIcon,      key: "start_exam"  };
  if (status === "inprogress")
    return { label: "Resume",            icon: RestoreIcon,   key: "resume"      };
  if (status === "active")
    return { label: "Continue Learning", icon: PlayArrowIcon, key: "continue"    };
  return null;
}

export default function EnrollmentCard({ enrollment, onAction, index = 0 }) {
  const {
    module_title,
    module_type,
    status,
    progress_percent = 0,
    marks,
    enrolled_at,
    scheduled_end_at,
    scheduled_start_at,
    thumbnail_url,
    certificate_issued,
  } = enrollment;

  const isCompleted = status === "completed";
  const action      = getCardAction(enrollment);
  const progress    = Math.min(100, Math.round(progress_percent ?? 0));

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, type: "spring", stiffness: 280, damping: 22 }}
      whileHover={{ y: -4 }}
      style={{ height: "100%" }}
    >
      <Card
        sx={{
          height:        "100%",
          display:       "flex",
          flexDirection: "column",
          borderRadius:  3,
          boxShadow:     "0 2px 14px rgba(0,0,0,0.07)",
          transition:    "box-shadow 0.2s ease",
          overflow:      "hidden",
          "&:hover":     { boxShadow: "0 8px 28px rgba(0,0,0,0.13)" },
        }}
      >
        {/* ── Thumbnail ── */}
        <Box
          sx={{
            height:          108,
            backgroundImage: thumbnail_url ? `url(${thumbnail_url})` : undefined,
            backgroundSize:  "cover",
            backgroundPosition: "center",
            background:      thumbnail_url
              ? undefined
              : "linear-gradient(135deg, var(--primaryLight,#fbf5ff) 0%, #ede7f6 100%)",
            position:        "relative",
            display:         "flex",
            alignItems:      "center",
            justifyContent:  "center",
            flexShrink:      0,
          }}
        >
          {!thumbnail_url && (
            <Avatar sx={{ bgcolor: "var(--primary,#8F00FF)", width: 46, height: 46 }}>
              {module_type === "exam" ? <QuizIcon /> : <SchoolIcon />}
            </Avatar>
          )}

          <Box sx={{ position: "absolute", top: 8, left: 8 }}>
            <TypeBadge type={module_type} />
          </Box>
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <StatusChip status={status} />
          </Box>
          {certificate_issued && (
            <Box sx={{ position: "absolute", bottom: 6, right: 8 }}>
              <Chip
                icon={<EmojiEventsIcon sx={{ fontSize: "13px !important", color: "#f9a825 !important" }} />}
                label="Certified"
                size="small"
                sx={{ bgcolor: "#fff8e1", color: "#f9a825", fontWeight: 700, fontSize: "0.64rem", height: 20 }}
              />
            </Box>
          )}
        </Box>

        {/* ── Body ── */}
        <CardContent sx={{ flexGrow: 1, pb: "8px !important", pt: 1.5, px: 1.75 }}>
          <Tooltip title={module_title ?? ""} placement="top">
            <Typography
              variant="subtitle2"
              fontWeight={700}
              sx={{
                mb: 1.25,
                display:            "-webkit-box",
                WebkitLineClamp:    2,
                WebkitBoxOrient:    "vertical",
                overflow:           "hidden",
                lineHeight:         1.38,
                minHeight:          38,
                fontSize:           "0.83rem",
              }}
            >
              {module_title ?? "Untitled Module"}
            </Typography>
          </Tooltip>

          {/* Progress bar */}
          {!isCompleted && (
            <Box sx={{ mb: 1.5 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.66rem" }}>
                  Progress
                </Typography>
                <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.66rem" }}>
                  {progress}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={progress}
                sx={{
                  borderRadius: 4,
                  height:       6,
                  bgcolor:      "action.hover",
                  "& .MuiLinearProgress-bar": {
                    borderRadius: 4,
                    background:   "linear-gradient(90deg, var(--primary,#8F00FF) 0%, #f093fb 100%)",
                  },
                }}
              />
            </Box>
          )}

          {/* Marks badge */}
          {marks != null && (
            <Chip
              label={`${marks}% marks`}
              size="small"
              sx={{ mb: 1.25, bgcolor: "#e8f5e9", color: "#2e7d32", fontWeight: 700, fontSize: "0.66rem", height: 20 }}
            />
          )}

          {/* Meta rows */}
          <Stack spacing={0.5}>
            <MetaRow
              icon={CalendarTodayIcon}
              label="Enrolled"
              value={enrolled_at ? dayjs(enrolled_at).format("MMM D, YYYY") : null}
            />
            {scheduled_end_at && (
              <MetaRow
                icon={TimerIcon}
                label="Expires"
                value={dayjs(scheduled_end_at).fromNow()}
              />
            )}
            {module_type === "exam" && scheduled_start_at && (
              <MetaRow
                icon={CalendarTodayIcon}
                label="Exam on"
                value={dayjs(scheduled_start_at).format("MMM D, YYYY HH:mm")}
              />
            )}
          </Stack>
        </CardContent>

        <Divider />

        {/* ── Actions ── */}
        <CardActions sx={{ px: 1.75, py: 1, justifyContent: "space-between" }}>
          {action ? (
            <Box
              component="button"
              onClick={() => onAction?.(action.key, enrollment)}
              sx={{
                display:      "flex",
                alignItems:   "center",
                gap:          0.5,
                px:           1.5,
                py:           0.6,
                border:       "1.5px solid",
                borderColor:  "primary.main",
                borderRadius: 2,
                bgcolor:      "primary.main",
                color:        "#fff",
                cursor:       "pointer",
                fontSize:     "0.75rem",
                fontWeight:   700,
                transition:   "all 0.15s",
                "&:hover":    { bgcolor: "primary.dark", borderColor: "primary.dark" },
              }}
            >
              <action.icon sx={{ fontSize: 14 }} />
              {action.label}
            </Box>
          ) : (
            <Box />
          )}
          <Tooltip title="View Details">
            <IconButton size="small" onClick={() => onAction?.("view_details", enrollment)}>
              <InfoOutlinedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </CardActions>
      </Card>
    </motion.div>
  );
}
