import React, { useState, useEffect } from "react";
import {
  Card, CardContent, CardActions, Box, Typography,
  LinearProgress, Tooltip, IconButton, Chip, Stack,
  Divider,
} from "@mui/material";
import { motion } from "framer-motion";
import PlayArrowIcon        from "@mui/icons-material/PlayArrow";
import InfoOutlinedIcon     from "@mui/icons-material/InfoOutlined";
import RestoreIcon          from "@mui/icons-material/Restore";
import QuizIcon             from "@mui/icons-material/Quiz";
import SchoolIcon           from "@mui/icons-material/School";
import CalendarTodayIcon    from "@mui/icons-material/CalendarToday";
import TimerIcon            from "@mui/icons-material/Timer";
import EmojiEventsIcon      from "@mui/icons-material/EmojiEvents";
import CheckCircleIcon      from "@mui/icons-material/CheckCircle";
import MenuBookIcon         from "@mui/icons-material/MenuBook";
import AccessTimeIcon       from "@mui/icons-material/AccessTime";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import StatusChip from "./StatusChip";

dayjs.extend(relativeTime);

const DEFAULT_IMAGE = "/course/default-course-card.png";

// Per-type visual theme
const COURSE_THEME = {
  strip:       "#9c27b0",
  accent:      "#7b1fa2",
  badgeBg:     "rgba(123,31,162,0.14)",
  badgeBorder: "#7b1fa233",
  overlay:     "linear-gradient(to bottom, rgba(80,0,120,0.18) 0%, rgba(0,0,0,0.68) 100%)",
  progressBar: "linear-gradient(90deg, #7b1fa2 0%, #ce93d8 100%)",
};
const EXAM_THEME = {
  strip:       "#1976d2",
  accent:      "#1565c0",
  badgeBg:     "rgba(21,101,192,0.14)",
  badgeBorder: "#1565c033",
  overlay:     "linear-gradient(to bottom, rgba(0,50,130,0.18) 0%, rgba(0,0,0,0.68) 100%)",
  progressBar: null,
};

// ── Image with error → default fallback ──────────────────────────────────────
function ThumbnailImage({ src, alt }) {
  const resolved = src || DEFAULT_IMAGE;
  const [imgSrc, setImgSrc] = useState(resolved);
  useEffect(() => setImgSrc(resolved), [resolved]);
  return (
    <img
      src={imgSrc}
      alt={alt ?? ""}
      onError={() => setImgSrc(DEFAULT_IMAGE)}
      style={{
        position:       "absolute",
        inset:          0,
        width:          "100%",
        height:         "100%",
        objectFit:      "cover",
        objectPosition: "center",
      }}
    />
  );
}

// ── Shared type badge ─────────────────────────────────────────────────────────
function TypeBadge({ type, theme }) {
  const Icon = type === "exam" ? QuizIcon : SchoolIcon;
  const label = type === "exam" ? "Exam" : "Course";
  return (
    <Chip
      icon={<Icon sx={{ fontSize: "14px !important", color: `${theme.accent} !important` }} />}
      label={label}
      size="small"
      sx={{
        bgcolor:        theme.badgeBg,
        color:          theme.accent,
        fontWeight:     700,
        fontSize:       "0.72rem",
        height:         22,
        backdropFilter: "blur(4px)",
        border:         `1px solid ${theme.badgeBorder}`,
      }}
    />
  );
}

// ── Shared meta row ───────────────────────────────────────────────────────────
function MetaRow({ icon: Icon, label, value, iconColor }) {
  if (!value) return null;
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
      <Icon sx={{ fontSize: 14, color: iconColor ?? "text.disabled", flexShrink: 0 }} />
      <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
        {label}:&nbsp;<Box component="span" sx={{ fontWeight: 600, color: "text.primary" }}>{value}</Box>
      </Typography>
    </Box>
  );
}

// ── Course-specific actions ───────────────────────────────────────────────────
function getCourseAction(status) {
  if (status === "inprogress") return { label: "Resume",         icon: RestoreIcon,   key: "resume"   };
  if (status === "active")     return { label: "Start Learning", icon: PlayArrowIcon, key: "continue" };
  if (status === "completed")  return { label: "Review Course",  icon: MenuBookIcon,  key: "review"   };
  return null;
}

// ── Exam-specific actions ─────────────────────────────────────────────────────
function getExamAction(status) {
  if (["active", "scheduled"].includes(status)) return { label: "Start Exam",   icon: QuizIcon,        key: "start_exam"   };
  if (status === "inprogress")                  return { label: "Resume Exam",  icon: RestoreIcon,     key: "resume"       };
  if (status === "completed")                   return { label: "View Results", icon: EmojiEventsIcon, key: "view_results" };
  return null;
}

// ── Course card body ──────────────────────────────────────────────────────────
function CourseBody({ enrollment }) {
  const {
    status,
    progress_percent = 0,
    enrolled_at,
    expires_at,
    duration,
    certificate_issued,
  } = enrollment;

  const isCompleted = status === "completed";
  const progress    = Math.min(100, Math.round(progress_percent ?? 0));

  return (
    <>
      {isCompleted ? (
        <Box
          sx={{
            display:      "flex",
            alignItems:   "center",
            gap:          1,
            mb:           1.75,
            px:           1.5,
            py:           1,
            bgcolor:      "#e8f5e9",
            borderRadius: 2,
            border:       "1px solid #c8e6c9",
          }}
        >
          <CheckCircleIcon sx={{ color: "#2e7d32", fontSize: 22, flexShrink: 0 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 700, color: "#2e7d32" }}>Completed</Typography>
            <Typography sx={{ fontSize: 12, color: "#388e3c" }}>{progress}% lessons done</Typography>
          </Box>
          {certificate_issued && (
            <Tooltip title="Certificate Issued">
              <EmojiEventsIcon sx={{ color: "#f9a825", fontSize: 22, flexShrink: 0 }} />
            </Tooltip>
          )}
        </Box>
      ) : (
        <Box sx={{ mb: 1.75 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>Progress</Typography>
            <Typography sx={{ fontSize: 14, fontWeight: 700 }}>{progress}%</Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              borderRadius: 4,
              height:       7,
              bgcolor:      "action.hover",
              "& .MuiLinearProgress-bar": {
                borderRadius: 4,
                background:   COURSE_THEME.progressBar,
              },
            }}
          />
        </Box>
      )}

      <Stack spacing={0.75}>
        <MetaRow
          icon={CalendarTodayIcon}
          label="Enrolled"
          value={enrolled_at ? dayjs(enrolled_at).format("MMM D, YYYY") : null}
        />
        <MetaRow
          icon={TimerIcon}
          label="Expires"
          value={expires_at ? dayjs(expires_at).fromNow() : null}
          iconColor="#e65100"
        />
        {duration && (
          <MetaRow icon={AccessTimeIcon} label="Duration" value={duration} />
        )}
      </Stack>
    </>
  );
}

// ── Exam card body ────────────────────────────────────────────────────────────
function ExamBody({ enrollment }) {
  const {
    status,
    marks,
    enrolled_at,
    scheduled_start_at,
    scheduled_end_at,
    expires_at,
    certificate_issued,
  } = enrollment;

  const isCompleted = status === "completed";
  const isUpcoming  = ["active", "scheduled"].includes(status);
  const passed      = (marks ?? 0) >= 60;

  return (
    <>
      {isCompleted ? (
        <Box
          sx={{
            display:      "flex",
            alignItems:   "center",
            gap:          1.5,
            mb:           1.75,
            px:           1.5,
            py:           1.25,
            bgcolor:      passed ? "#e8f5e9" : "#ffebee",
            borderRadius: 2,
            border:       `1px solid ${passed ? "#c8e6c9" : "#ffcdd2"}`,
          }}
        >
          <Box sx={{ textAlign: "center", minWidth: 60 }}>
            <Typography
              sx={{
                fontSize:   28,
                fontWeight: 800,
                lineHeight: 1,
                color:      passed ? "#2e7d32" : "#c62828",
              }}
            >
              {marks ?? 0}%
            </Typography>
            <Typography sx={{ fontSize: 11, fontWeight: 600, color: passed ? "#388e3c" : "#d32f2f" }}>
              Score
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography sx={{ fontSize: 15, fontWeight: 700, color: passed ? "#2e7d32" : "#c62828" }}>
              {passed ? "Passed" : "Not Passed"}
            </Typography>
            {certificate_issued && (
              <Typography
                sx={{
                  fontSize:   12,
                  color:      "#f57f17",
                  fontWeight: 600,
                  display:    "flex",
                  alignItems: "center",
                  gap:        0.4,
                  mt:         0.25,
                }}
              >
                <EmojiEventsIcon sx={{ fontSize: 14 }} />
                Certificate Issued
              </Typography>
            )}
          </Box>
        </Box>
      ) : isUpcoming && scheduled_start_at ? (
        <Box
          sx={{
            mb:           1.75,
            px:           1.5,
            py:           1,
            bgcolor:      "#e3f2fd",
            borderRadius: 2,
            border:       "1px solid #bbdefb",
          }}
        >
          <Typography
            sx={{
              fontSize:      11,
              fontWeight:    700,
              color:         "#1565c0",
              textTransform: "uppercase",
              letterSpacing: 0.6,
            }}
          >
            Exam Window
          </Typography>
          <Typography sx={{ fontSize: 15, fontWeight: 700, color: "#0d47a1", mt: 0.25 }}>
            {dayjs(scheduled_start_at).format("MMM D, YYYY")}
          </Typography>
          <Typography sx={{ fontSize: 13, color: "#1565c0" }}>
            {dayjs(scheduled_start_at).format("HH:mm")}
            {scheduled_end_at ? `  –  ${dayjs(scheduled_end_at).format("HH:mm")}` : ""}
          </Typography>
          <Typography sx={{ fontSize: 12, color: "text.secondary", mt: 0.25 }}>
            {dayjs(scheduled_start_at).fromNow()}
          </Typography>
        </Box>
      ) : null}

      <Stack spacing={0.75}>
        <MetaRow
          icon={CalendarTodayIcon}
          label="Enrolled"
          value={enrolled_at ? dayjs(enrolled_at).format("MMM D, YYYY") : null}
        />
        {scheduled_start_at && !isUpcoming && (
          <MetaRow
            icon={CalendarTodayIcon}
            label="Exam Date"
            value={dayjs(scheduled_start_at).format("MMM D, YYYY")}
          />
        )}
        <MetaRow
          icon={TimerIcon}
          label="Expires"
          value={expires_at ? dayjs(expires_at).fromNow() : null}
          iconColor="#e65100"
        />
      </Stack>
    </>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function EnrollmentCard({ enrollment, onAction, index = 0 }) {
  const { module_title, module_type, status, thumbnail_url, file_path } = enrollment;

  const isExam = module_type === "exam";
  const theme  = isExam ? EXAM_THEME : COURSE_THEME;
  const image  = thumbnail_url || file_path || DEFAULT_IMAGE;
  const action = isExam ? getExamAction(status) : getCourseAction(status);

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
          "&:hover":     { boxShadow: "0 8px 28px rgba(0,0,0,0.14)" },
        }}
      >
        {/* ── Top accent strip ── */}
        <Box sx={{ height: 4, bgcolor: theme.strip, flexShrink: 0 }} />

        {/* ── Thumbnail ── */}
        <Box
          sx={{
            height:     155,
            position:   "relative",
            flexShrink: 0,
            overflow:   "hidden",
            "& img":          { transition: "transform 0.35s ease" },
            "&:hover img":    { transform: "scale(1.04)" },
          }}
        >
          <ThumbnailImage src={image} alt={module_title} />

          {/* Gradient overlay */}
          <Box sx={{ position: "absolute", inset: 0, background: theme.overlay }} />

          {/* Type badge — top left */}
          <Box sx={{ position: "absolute", top: 10, left: 10, zIndex: 1 }}>
            <TypeBadge type={module_type} theme={theme} />
          </Box>

          {/* Status chip — top right */}
          <Box sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}>
            <StatusChip status={status} />
          </Box>

          {/* Title overlay — bottom */}
          <Box
            sx={{
              position: "absolute",
              bottom:   0,
              left:     0,
              right:    0,
              px:       1.75,
              pb:       1.25,
              zIndex:   1,
            }}
          >
            <Tooltip title={module_title ?? ""} placement="top">
              <Typography
                sx={{
                  color:           "#fff",
                  fontSize:        16,
                  fontWeight:      700,
                  lineHeight:      1.35,
                  display:         "-webkit-box",
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: "vertical",
                  overflow:        "hidden",
                  textShadow:      "0 1px 4px rgba(0,0,0,0.55)",
                }}
              >
                {module_title ?? "Untitled Module"}
              </Typography>
            </Tooltip>
          </Box>
        </Box>

        {/* ── Body ── */}
        <CardContent sx={{ flexGrow: 1, pt: 1.75, px: 2, pb: "8px !important" }}>
          {isExam
            ? <ExamBody enrollment={enrollment} />
            : <CourseBody enrollment={enrollment} />
          }
        </CardContent>

        <Divider />

        {/* ── Footer actions ── */}
        <CardActions sx={{ px: 2, py: 1.25, justifyContent: "space-between" }}>
          {action ? (
            <Box
              component="button"
              onClick={() => onAction?.(action.key, enrollment)}
              sx={{
                display:      "flex",
                alignItems:   "center",
                gap:          0.6,
                px:           1.75,
                py:           0.7,
                border:       "1.5px solid",
                borderColor:  theme.accent,
                borderRadius: 2,
                bgcolor:      theme.accent,
                color:        "#fff",
                cursor:       "pointer",
                fontSize:     15,
                fontWeight:   700,
                transition:   "filter 0.15s",
                "&:hover":    { filter: "brightness(0.88)" },
              }}
            >
              <action.icon sx={{ fontSize: 16 }} />
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
