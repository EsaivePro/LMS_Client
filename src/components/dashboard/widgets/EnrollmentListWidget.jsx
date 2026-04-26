import React, { useState } from "react";
import {
    Box, Grid, Tabs, Tab, Typography, Skeleton, Pagination,
    ToggleButtonGroup, ToggleButton, Stack, Select, MenuItem,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import EnrollmentCard from "../../../modules/enrollments/components/EnrollmentCard";
import EnrollmentTable from "../../../modules/enrollments/components/EnrollmentTable";

const TABS = [
    { value: "all", label: "All" },
    { value: "current", label: "Current" },
    { value: "completed", label: "Completed" },
    { value: "future", label: "Future" },
];

function PaginationBar({ pagination, page, limit, onPageChange, onLimitChange }) {
    const total = pagination?.total ?? 0;
    if (total === 0) return null;
    const totalPages = Math.ceil(total / limit) || 1;
    const from = (page - 1) * limit + 1;
    const to = Math.min(page * limit, total);
    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
                px: 0.5,
                flexWrap: "wrap",
                gap: 1,
            }}
        >
            <Typography sx={{ fontSize: 13, color: "text.secondary" }}>
                Showing <strong>{from}–{to}</strong> of <strong>{total}</strong>
            </Typography>
            <Stack direction="row" spacing={1.5} alignItems="center">
                <Select
                    value={limit}
                    onChange={(e) => onLimitChange?.(Number(e.target.value))}
                    size="small"
                    sx={{ fontSize: 13, height: 32 }}
                >
                    {[6, 12, 24].map((n) => (
                        <MenuItem key={n} value={n} sx={{ fontSize: 13 }}>{n} / page</MenuItem>
                    ))}
                </Select>
                <Pagination
                    count={totalPages}
                    page={page}
                    onChange={(_, p) => onPageChange(p)}
                    color="primary"
                    size="small"
                    shape="rounded"
                />
            </Stack>
        </Box>
    );
}

export default function EnrollmentListWidget({
    enrollments,
    pagination,
    isLoading,
    activeTab,
    onTabChange,
    page,
    onPageChange,
    limit,
    onLimitChange,
    onAction,
    toggleWant = true
}) {
    const [viewMode, setViewMode] = useState("card");

    if (!enrollments) return null;

    return (
        <Box sx={{ width: "100%" }}>
            {/* ── Tabs + view toggle ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 1.5,
                    flexWrap: "wrap",
                    gap: 1,
                    width: "100%",
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => { onTabChange(v); }}
                    sx={{
                        minHeight: 38,
                        "& .MuiTab-root": { minHeight: 38, py: 0.5, fontSize: "0.82rem", fontWeight: 600 },
                    }}
                >
                    {TABS.map((tab) => (
                        <Tab key={tab.value} value={tab.value} label={tab.label} />
                    ))}
                </Tabs>

                {toggleWant && <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                    size="small"
                >
                    <ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton>
                    <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
                </ToggleButtonGroup>}
            </Box>

            {/* ── Pagination bar — top ── */}
            {!isLoading && (
                <PaginationBar
                    pagination={pagination}
                    page={page}
                    limit={limit}
                    onPageChange={onPageChange}
                    onLimitChange={onLimitChange}
                />
            )}

            {/* ── Card / Table view ── */}
            <Box>
                {viewMode === "card" ? (
                    <Box sx={{ width: "100%" }}>
                        {isLoading ? (
                            <Grid container spacing={2}>
                                {Array.from({ length: 8 }).map((_, i) => (
                                    <Grid key={i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <Skeleton variant="rectangular" height={290} sx={{ borderRadius: 3 }} />
                                    </Grid>
                                ))}
                            </Grid>
                        ) : enrollments.length === 0 ? (
                            <Box sx={{ py: 9, textAlign: "center" }}>
                                <Typography variant="h6" color="text.secondary">No enrollments found</Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                                    Try a different tab or clear your filters
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {enrollments.map((enrollment, i) => (
                                    <Grid key={enrollment.id ?? i} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
                                        <EnrollmentCard enrollment={enrollment} onAction={onAction} index={i} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}
                    </Box>
                ) : (
                    <Box>
                        <EnrollmentTable
                            enrollments={enrollments}
                            pagination={pagination}
                            loading={isLoading}
                            onPageChange={onPageChange}
                            onLimitChange={onLimitChange}
                            onAction={onAction}
                            hidePagination
                        />
                    </Box>
                )}
            </Box>
        </Box>
    );
}
