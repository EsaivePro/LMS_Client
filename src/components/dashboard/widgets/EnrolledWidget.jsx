import React, { useState, useCallback } from "react";
import { Box, Container, Grid, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { useEnrollmentDashboard } from "../../../hooks/useEnrollment";
import StatsCardsWidget from "./StatsCardsWidget";
import EnrollmentFiltersWidget from "./EnrollmentFiltersWidget";
import EnrollmentListWidget from "./EnrollmentListWidget";
import ProgressAnalyticsWidget from "./ProgressAnalyticsWidget";
import UpcomingScheduleWidget from "./UpcomingScheduleWidget";

const EMPTY_FILTERS = { search: "", status: "", quick: "" };

export default function EnrolledWidget() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("all");
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(12);

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
        tabCounts,
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
        <Box sx={{ minHeight: "30vh" }}>
            {isError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error?.message ?? "Failed to load enrollments. Please try again."}
                </Alert>
            )}
            <EnrollmentFiltersWidget
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
            />
            <Grid container>
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
                    toggleWant={false}
                    tabCounts={tabCounts}
                />
            </Grid>
        </Box>
    );
}
