import React, { useState, useCallback } from "react";
import {
  Box, Container, Grid, Tabs, Tab, Typography, ToggleButtonGroup,
  ToggleButton, Breadcrumbs, Link, Alert, Skeleton, Pagination,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import SchoolIcon from "@mui/icons-material/School";
import { useAuth } from "../../../hooks/useAuth";
import StatsCards from "../components/StatsCards";
import EnrollmentFilters from "../components/EnrollmentFilters";
import EnrollmentCard from "../components/EnrollmentCard";
import EnrollmentTable from "../components/EnrollmentTable";
import UpcomingSchedule from "../components/UpcomingSchedule";
import { useEnrollmentDashboard } from "../../../hooks/useEnrollment";

const TABS = [
  { value: "all", label: "All Courses" },
  { value: "current", label: "Active" },
  { value: "completed", label: "Completed" },
  { value: "future", label: "Upcoming" },
];

const EMPTY_FILTERS = { search: "", status: "", quick: "" };

export default function CourseEnrollments() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("card");
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

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
    expiringCourses,
    allEnrollments,
    isLoading,
    isError,
    error,
    statsLoading,
  } = useEnrollmentDashboard(user?.id, {
    moduleType: "course",
    searchTerm: filters.search,
    statusFilter: filters.status || null,
    activeTab,
    page,
    limit,
  });

  const handleAction = useCallback((action, enrollment) => {
    if (action === "view_details") navigate(`/enrollment/${enrollment.id}`);
  }, [navigate]);

  const totalPages = Math.ceil((pagination.total || 0) / limit) || 1;

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
            <Typography color="text.primary" sx={{ fontSize: 13 }}>Courses</Typography>
          </Breadcrumbs>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                bgcolor: "var(--primaryLight,#fbf5ff)",
                borderRadius: 2,
                p: 1,
                display: "flex",
              }}
            >
              <SchoolIcon sx={{ color: "var(--primary,#8F00FF)", fontSize: 28 }} />
            </Box>
            <Box>
              <Typography variant="h5" fontWeight={800}>My Courses</Typography>
              <Typography variant="body2" color="text.secondary">
                {stats?.total ?? 0} total enrolled courses
              </Typography>
            </Box>
          </Box>
        </Box>

        <StatsCards stats={stats} loading={statsLoading} />

        {isError && (
          <Alert severity="error" sx={{ mb: 2 }}>{error?.message ?? "Failed to load courses."}</Alert>
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
                      <Typography variant="h6" color="text.secondary">No courses found</Typography>
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
            <UpcomingSchedule upcomingExams={[]} expiringCourses={expiringCourses} loading={statsLoading} />
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
