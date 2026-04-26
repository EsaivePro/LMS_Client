import React, { useState, useCallback } from "react";
import {
  Box, Container, Grid, Tabs, Tab, Typography, ToggleButtonGroup,
  ToggleButton, Breadcrumbs, Link, Alert, Skeleton, Pagination, Chip, Stack,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import QuizIcon from "@mui/icons-material/Quiz";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import dayjs from "dayjs";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../components/StatsCards";
import EnrollmentFilters from "../components/EnrollmentFilters";
import EnrollmentCard from "../components/EnrollmentCard";
import EnrollmentTable from "../components/EnrollmentTable";
import UpcomingSchedule from "../components/UpcomingSchedule";
import { useEnrollmentDashboard } from "../../../hooks/useEnrollment";

const TABS = [
  { value: "all",       label: "All Exams"  },
  { value: "future",    label: "Scheduled"  },
  { value: "current",   label: "Active"     },
  { value: "completed", label: "Completed"  },
];

const EMPTY_FILTERS = { search: "", status: "", quick: "" };

// Mini card showing next scheduled exam at a glance
function NextExamBanner({ exam }) {
  if (!exam) return null;
  return (
    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
      <Box
        sx={{
          display:      "flex",
          alignItems:   "center",
          gap:          2,
          mb:           3,
          p:            2,
          borderRadius: 3,
          background:   "linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)",
          border:       "1px solid #e0e0e0",
        }}
      >
        <Box
          sx={{
            bgcolor:      "#1565c0",
            borderRadius: 2,
            p:            1.25,
            display:      "flex",
            flexShrink:   0,
          }}
        >
          <CalendarMonthIcon sx={{ color: "#fff", fontSize: 28 }} />
        </Box>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5, fontSize: "0.65rem" }}>
            Next Exam
          </Typography>
          <Typography variant="subtitle2" fontWeight={700} noWrap>
            {exam.module_title ?? "Upcoming Exam"}
          </Typography>
          {exam.scheduled_start_at && (
            <Typography variant="caption" color="text.secondary">
              {dayjs(exam.scheduled_start_at).format("dddd, MMMM D · HH:mm")}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1}>
          <Chip
            label={dayjs(exam.scheduled_start_at).fromNow()}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ fontWeight: 700, fontSize: "0.7rem" }}
          />
        </Stack>
      </Box>
    </motion.div>
  );
}

export default function ExamEnrollments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode,  setViewMode]  = useState("card");
  const [filters,   setFilters]   = useState(EMPTY_FILTERS);
  const [page,      setPage]      = useState(1);
  const [limit,     setLimit]     = useState(6);

  const handleFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  }, []);

  const handleClear = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const {
    enrollments,
    pagination,
    stats,
    upcomingExams,
    allEnrollments,
    isLoading,
    isError,
    error,
    statsLoading,
  } = useEnrollmentDashboard(user?.id, {
    moduleType:   "exam",
    searchTerm:   filters.search,
    statusFilter: filters.status || null,
    activeTab,
    page,
    limit,
  });

  const handleAction = useCallback((action, enrollment) => {
    if (action === "view_details") navigate(`/enrollment/${enrollment.id}`);
  }, [navigate]);

  const totalPages  = Math.ceil((pagination.total || 0) / limit) || 1;
  const nextExam    = upcomingExams[0] ?? null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "var(--surface,#fbfbfb)" }}>
      <Container maxWidth="xl" sx={{ py: 3 }}>

        {/* ── Header ── */}
        <Box sx={{ mb: 3 }}>
          <Breadcrumbs sx={{ mb: 0.75 }}>
            <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer", fontSize: 13 }}>
              Home
            </Link>
            <Link underline="hover" color="inherit" onClick={() => navigate("/my-learning/dashboard")} sx={{ cursor: "pointer", fontSize: 13 }}>
              My Learning
            </Link>
            <Typography color="text.primary" sx={{ fontSize: 13 }}>Exams</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ bgcolor: "#e3f2fd", borderRadius: 2, p: 1, display: "flex" }}>
              <QuizIcon sx={{ color: "#1565c0", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>My Exams</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.scheduled ?? 0} scheduled · {stats?.completed ?? 0} completed
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Next exam banner */}
        {!statsLoading && <NextExamBanner exam={nextExam} />}

        <StatsCards stats={stats} loading={statsLoading} />

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>{error?.message ?? "Failed to load exams."}</Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 9 }}>
            <EnrollmentFilters filters={filters} onFilterChange={handleFilter} onClear={handleClear} />

            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexWrap: "wrap", gap: 1 }}>
              <Tabs
                value={activeTab}
                onChange={(_, v) => { setActiveTab(v); setPage(1); }}
                sx={{ minHeight: 38, "& .MuiTab-root": { minHeight: 38, py: 0.5, fontSize: "0.82rem", fontWeight: 600 } }}
              >
                {TABS.map((tab) => <Tab key={tab.value} value={tab.value} label={tab.label} />)}
              </Tabs>

              <ToggleButtonGroup value={viewMode} exclusive onChange={(_, v) => v && setViewMode(v)} size="small">
                <ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton>
                <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* ── Pagination bar — top ── */}
            {!isLoading && pagination.total > 0 && (
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, px: 0.5, flexWrap: "wrap", gap: 1 }}>
                <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                  Showing <strong>{(page - 1) * limit + 1}–{Math.min(page * limit, pagination.total)}</strong> of <strong>{pagination.total}</strong>
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => setPage(p)}
                    color="primary"
                    size="small"
                    shape="rounded"
                  />
                </Box>
              </Box>
            )}

            <AnimatePresence mode="wait">
              {viewMode === "card" ? (
                <motion.div key="cards" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  {isLoading ? (
                    <Grid container spacing={2}>
                      {Array.from({ length: 6 }).map((_, i) => (
                        <Grid key={i} size={{ xs: 12, sm: 6, lg: 4 }}>
                          <Skeleton variant="rectangular" height={290} sx={{ borderRadius: 3 }} />
                        </Grid>
                      ))}
                    </Grid>
                  ) : enrollments.length === 0 ? (
                    <Box sx={{ py: 9, textAlign: "center" }}>
                      <Typography variant="h6" color="text.secondary">No exams found</Typography>
                      <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>Try a different filter</Typography>
                    </Box>
                  ) : (
                    <Grid container spacing={2}>
                      {enrollments.map((enrollment, i) => (
                        <Grid key={enrollment.id ?? i} size={{ xs: 12, sm: 6, lg: 4 }}>
                          <EnrollmentCard enrollment={enrollment} onAction={handleAction} index={i} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </motion.div>
              ) : (
                <motion.div key="table" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }}>
                  <EnrollmentTable
                    enrollments={enrollments}
                    pagination={pagination}
                    loading={isLoading}
                    onPageChange={setPage}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    onAction={handleAction}
                    hidePagination
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Grid>

          <Grid size={{ xs: 12, md: 3 }}>
            <UpcomingSchedule upcomingExams={upcomingExams} expiringCourses={[]} loading={statsLoading} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
