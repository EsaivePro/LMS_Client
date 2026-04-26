import React, { useState, useCallback } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useEnrollmentDashboard } from "../../../hooks/useEnrollment";
import StatsCardsWidget from "../../../components/dashboard/widgets/StatsCardsWidget";
import EnrollmentFiltersWidget from "../../../components/dashboard/widgets/EnrollmentFiltersWidget";
import EnrollmentListWidget from "../../../components/dashboard/widgets/EnrollmentListWidget";
import ProgressAnalyticsWidget from "../../../components/dashboard/widgets/ProgressAnalyticsWidget";
import UpcomingScheduleWidget from "../../../components/dashboard/widgets/UpcomingScheduleWidget";

const EMPTY_FILTERS = { search: "", status: "", quick: "" };

export default function EnrollmentDashboard() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("all");
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(6);

    const handleFilterChange = useCallback((key, value) => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
    }, []);

    const handleClear = useCallback(() => {
        setFilters(EMPTY_FILTERS);
        setPage(1);
    }, []);

    const handleTabChange = useCallback((tab) => {
        setActiveTab(tab);
        setPage(1);
    }, []);

    const {
        enrollments,
        pagination,
        stats,
        upcomingExams,
        expiringCourses,
        allEnrollments,
        isLoading,
        isError,
        error,
        statsLoading,
    } = useEnrollmentDashboard(user?.id, {
        searchTerm: filters.search,
        statusFilter: filters.status || null,
        activeTab,
        page,
        limit,
    });

    const handleAction = useCallback((action, enrollment) => {
        if (action === "view_details") navigate(`/enrollment/${enrollment.id}`);
    }, [navigate]);

    return (
        <Box sx={{ minHeight: "100vh", bgcolor: "var(--surface,#fbfbfb)" }}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                {isError && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error?.message ?? "Failed to load enrollments. Please try again."}
                    </Alert>
                )}

                <Grid container spacing={3}>
                    {/* ── Main content ── */}
                    <Grid size={{ xs: 12, md: 9 }}>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, width: "100%" }}>

                            {/* ── Filters ── */}
                            <EnrollmentFiltersWidget
                                filters={filters}
                                onFilterChange={handleFilterChange}
                                onClear={handleClear}
                            />

                            {/* ── Tabs + view toggle + list + pagination ── */}
                            <EnrollmentListWidget
                                enrollments={enrollments}
                                pagination={pagination}
                                isLoading={isLoading}
                                activeTab={activeTab}
                                onTabChange={handleTabChange}
                                page={page}
                                onPageChange={setPage}
                                limit={limit}
                                onLimitChange={(l) => { setLimit(l); setPage(1); }}
                                onAction={handleAction}
                            />

                        </Box>
                    </Grid>

                    {/* ── Sidebar ── */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <UpcomingScheduleWidget
                            upcomingExams={upcomingExams}
                            expiringCourses={expiringCourses}
                            loading={statsLoading}
                        />
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
}
