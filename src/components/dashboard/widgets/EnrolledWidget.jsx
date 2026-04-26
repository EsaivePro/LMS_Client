import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Box, Grid, Alert } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { fetchEnrollmentDashboard } from "../../../redux/slices/enrollmentSlice";
import EnrollmentFiltersWidget from "./EnrollmentFiltersWidget";
import EnrollmentListWidget from "./EnrollmentListWidget";

const EMPTY_FILTERS = { search: "", status: "", quick: "" };

const TAB_STATUS = {
    all:       null,
    current:   null,
    completed: "completed",
    future:    "scheduled",
};

export default function EnrolledWidget() {
    const dispatch  = useDispatch();
    const navigate  = useNavigate();
    const { user }  = useAuth();

    const [activeTab, setActiveTab] = useState("all");
    const [filters,   setFilters]   = useState(EMPTY_FILTERS);
    const [page,      setPage]      = useState(1);
    const [limit,     setLimit]     = useState(6);

    const dashboardData    = useSelector((s) => s.enrollment?.dashboardData    ?? {});
    const dashboardLoading = useSelector((s) => s.enrollment?.dashboardLoading ?? false);
    const dashboardError   = useSelector((s) => s.enrollment?.dashboardError   ?? null);

    const apiStatus = filters.status || TAB_STATUS[activeTab] || null;

    useEffect(() => {
        if (!user?.id) return;
        dispatch(fetchEnrollmentDashboard({
            userId: user.id,
            search: filters.search,
            status: apiStatus,
            tab:    activeTab,
            page,
            limit,
        }));
    }, [user?.id, filters.search, apiStatus, activeTab, page, limit, dispatch]);

    const enrollments = useMemo(() => {
        const rows = dashboardData?.enrollments ?? [];
        if (activeTab === "current") {
            return rows.filter((e) => ["active", "inprogress"].includes(e.status));
        }
        return rows;
    }, [dashboardData?.enrollments, activeTab]);

    const pagination = dashboardData?.pagination ?? { total: 0, page: 1, limit };

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

    const handleAction = useCallback((action, enrollment) => {
        if (action === "view_details") navigate(`/enrollment/${enrollment.id}`);
    }, [navigate]);

    return (
        <Box sx={{ minHeight: "30vh" }}>
            {dashboardError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {dashboardError?.message ?? "Failed to load enrollments. Please try again."}
                </Alert>
            )}

            <EnrollmentFiltersWidget
                filters={filters}
                onFilterChange={handleFilterChange}
                onClear={handleClear}
            />
            <Grid container>
                <EnrollmentListWidget
                    enrollments={enrollments}
                    pagination={pagination}
                    isLoading={dashboardLoading}
                    activeTab={activeTab}
                    onTabChange={handleTabChange}
                    page={page}
                    onPageChange={setPage}
                    limit={limit}
                    onLimitChange={(l) => { setLimit(l); setPage(1); }}
                    onAction={handleAction}
                    toggleWant={false}
                />
            </Grid>
        </Box>
    );
}
