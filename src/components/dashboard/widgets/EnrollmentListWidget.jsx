import React, { useState } from "react";
import {
    Box, Grid, Tabs, Tab, Typography, Skeleton, Pagination,
    ToggleButtonGroup, ToggleButton,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import EnrollmentCard from "../../../modules/enrollments/components/EnrollmentCard";
import EnrollmentTable from "../../../modules/enrollments/components/EnrollmentTable";

const TABS = [
    { value: "all",       label: "All"       },
    { value: "current",   label: "Current"   },
    { value: "completed", label: "Completed" },
    { value: "future",    label: "Future"    },
];

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
}) {
    const [viewMode, setViewMode] = useState("card");

    if (!enrollments) return null;

    const totalPages = Math.ceil((pagination?.total || 0) / limit) || 1;

    return (
        <Box>
            {/* ── Tabs + view toggle ── */}
            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    mb: 2,
                    flexWrap: "wrap",
                    gap: 1,
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

                <ToggleButtonGroup
                    value={viewMode}
                    exclusive
                    onChange={(_, v) => v && setViewMode(v)}
                    size="small"
                >
                    <ToggleButton value="card">
                        <ViewModuleIcon fontSize="small" />
                    </ToggleButton>
                    <ToggleButton value="table">
                        <TableRowsIcon fontSize="small" />
                    </ToggleButton>
                </ToggleButtonGroup>
            </Box>

            {/* ── Card / Table view ── */}
            <AnimatePresence mode="wait">
                {viewMode === "card" ? (
                    <motion.div
                        key="cards"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
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
                                <Typography variant="h6" color="text.secondary">No enrollments found</Typography>
                                <Typography variant="body2" color="text.disabled" sx={{ mt: 1 }}>
                                    Try a different tab or clear your filters
                                </Typography>
                            </Box>
                        ) : (
                            <Grid container spacing={2}>
                                {enrollments.map((enrollment, i) => (
                                    <Grid key={enrollment.id ?? i} size={{ xs: 12, sm: 6, lg: 4 }}>
                                        <EnrollmentCard enrollment={enrollment} onAction={onAction} index={i} />
                                    </Grid>
                                ))}
                            </Grid>
                        )}

                        {!isLoading && enrollments.length > 0 && (
                            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                                <Pagination
                                    count={totalPages}
                                    page={page}
                                    onChange={(_, p) => onPageChange(p)}
                                    color="primary"
                                    size="small"
                                    shape="rounded"
                                />
                            </Box>
                        )}
                    </motion.div>
                ) : (
                    <motion.div
                        key="table"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.18 }}
                    >
                        <EnrollmentTable
                            enrollments={enrollments}
                            pagination={pagination}
                            loading={isLoading}
                            onPageChange={onPageChange}
                            onLimitChange={(l) => { onLimitChange(l); }}
                            onAction={onAction}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </Box>
    );
}
