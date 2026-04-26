import React, { useState } from "react";
import {
    Box, Tabs, Tab, Typography, Skeleton, Pagination,
    ToggleButtonGroup, ToggleButton, Stack, Select, MenuItem,
    Chip,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import TableRowsIcon from "@mui/icons-material/TableRows";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import EnrollmentCard from "../../../modules/enrollments/components/EnrollmentCard";
import EnrollmentTable from "../../../modules/enrollments/components/EnrollmentTable";

const TABS = [
    { value: "all", label: "All" },
    { value: "current", label: "Current" },
    { value: "completed", label: "Completed" },
    { value: "future", label: "Future" },
];

/* ─── pagination bar ──────────────────────────────────────────────────── */
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
                px: 1,
                py: 0.75,
                bgcolor: "#f8fafc",
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                flexWrap: "wrap",
                gap: 1,
            }}
        >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
                <Box
                    sx={{
                        px: 1.1,
                        py: 0.25,
                        bgcolor: "primary.main",
                        color: "#fff",
                        borderRadius: 1.5,
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: 1.6,
                        letterSpacing: "0.01em",
                        boxShadow: "0 1px 4px rgba(99,102,241,0.35)",
                    }}
                >
                    {from}&nbsp;–&nbsp;{to}
                </Box>
                <Typography sx={{ fontSize: 12, color: "text.secondary" }}>
                    of&nbsp;
                    <Box component="span" sx={{ fontWeight: 800, color: "text.primary", fontSize: 13 }}>
                        {total}
                    </Box>
                    &nbsp;results
                </Typography>
            </Box>
            <Stack direction="row" spacing={1} alignItems="center">
                <Select
                    value={limit}
                    onChange={(e) => onLimitChange?.(Number(e.target.value))}
                    size="small"
                    sx={{
                        fontSize: 12.5,
                        height: 30,
                        borderRadius: 1.5,
                        "& .MuiSelect-select": { py: "4px !important" },
                    }}
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
                    siblingCount={1}
                    sx={{
                        "& .MuiPaginationItem-root": {
                            fontSize: 12,
                            borderRadius: 1.5,
                            transition: "background-color 0.18s ease, transform 0.15s ease",
                            "&:hover": { transform: "scale(1.08)" },
                        },
                        "& .Mui-selected": { fontWeight: 700 },
                    }}
                />
            </Stack>
        </Box>
    );
}

/* ─── loading skeleton (CSS grid) ────────────────────────────────────── */
function CardSkeleton({ count = 6 }) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                gap: 2,
            }}
        >
            {Array.from({ length: count }).map((_, i) => (
                <Skeleton
                    key={i}
                    variant="rectangular"
                    height={300}
                    animation="wave"
                    sx={{
                        borderRadius: 3,
                        animationDelay: `${i * 60}ms`,
                    }}
                />
            ))}
        </Box>
    );
}

/* ─── empty state ────────────────────────────────────────────────────── */
function EmptyState({ activeTab }) {
    const messages = {
        all: ["No enrollments found", "Try a different filter or clear your search"],
        current: ["No active enrollments", "All your courses are either completed or scheduled"],
        completed: ["No completed enrollments", "Complete a course to see it here"],
        future: ["No scheduled enrollments", "Your upcoming exams will appear here"],
    };
    const [title, sub] = messages[activeTab] ?? messages.all;
    return (
        <Box
            sx={{
                py: 8,
                textAlign: "center",
                animation: "ewFadeIn 0.3s ease",
                "@keyframes ewFadeIn": {
                    from: { opacity: 0, transform: "translateY(8px)" },
                    to: { opacity: 1, transform: "translateY(0)" },
                },
            }}
        >
            <Box
                sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    bgcolor: "#f1f5f9",
                    mb: 2,
                }}
            >
                <InboxOutlinedIcon sx={{ fontSize: 32, color: "text.disabled" }} />
            </Box>
            <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 700, mb: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="body2" color="text.disabled">{sub}</Typography>
        </Box>
    );
}

/* ─── main widget ─────────────────────────────────────────────────────── */
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
    toggleWant = true,
    tabCounts = {},
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
                    mt: 1
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={(_, v) => onTabChange(v)}
                    sx={{
                        minHeight: 40,
                        "& .MuiTabs-indicator": {
                            height: 3,
                            borderRadius: "3px 3px 0 0",
                            transition: "all 0.35s cubic-bezier(.4,0,.2,1)",
                        },
                        "& .MuiTab-root": {
                            minHeight: 40,
                            py: 0.5,
                            px: 1.5,
                            fontSize: "0.82rem",
                            fontWeight: 600,
                            color: "text.secondary",
                            transition: "color 0.2s ease",
                            "&.Mui-selected": { color: "primary.main" },
                            "&:hover": { color: "primary.light" },
                        },
                    }}
                >
                    {TABS.map((tab) => {
                        const count = tabCounts?.[tab.value];
                        return (
                            <Tab
                                key={tab.value}
                                value={tab.value}
                                label={
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
                                        {tab.label}
                                        {count != null && count > 0 && (
                                            <Chip
                                                label={count}
                                                size="small"
                                                sx={{
                                                    height: 17,
                                                    fontSize: "0.65rem",
                                                    fontWeight: 700,
                                                    bgcolor: activeTab === tab.value ? "primary.main" : "action.hover",
                                                    color: activeTab === tab.value ? "#fff" : "text.secondary",
                                                    transition: "background-color 0.2s ease, color 0.2s ease",
                                                    "& .MuiChip-label": { px: 0.75 },
                                                }}
                                            />
                                        )}
                                    </Box>
                                }
                            />
                        );
                    })}
                </Tabs>

                {toggleWant && (
                    <ToggleButtonGroup
                        value={viewMode}
                        exclusive
                        onChange={(_, v) => v && setViewMode(v)}
                        size="small"
                        sx={{
                            "& .MuiToggleButton-root": {
                                border: "1px solid",
                                borderColor: "divider",
                                px: 1,
                                py: 0.4,
                                transition: "background-color 0.18s ease, color 0.18s ease",
                                "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "#fff",
                                    "&:hover": { bgcolor: "primary.dark" },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="card"><ViewModuleIcon fontSize="small" /></ToggleButton>
                        <ToggleButton value="table"><TableRowsIcon fontSize="small" /></ToggleButton>
                    </ToggleButtonGroup>
                )}
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

            {/* ── Content — key forces fade-in on tab/mode change ── */}
            <Box
                key={`${activeTab}-${viewMode}`}
                sx={{
                    animation: "ewFadeIn 0.28s ease",
                    "@keyframes ewFadeIn": {
                        from: { opacity: 0, transform: "translateY(6px)" },
                        to: { opacity: 1, transform: "translateY(0)" },
                    },
                }}
            >
                {viewMode === "card" ? (
                    isLoading ? (
                        <CardSkeleton count={limit} />
                    ) : enrollments.length === 0 ? (
                        <EmptyState activeTab={activeTab} />
                    ) : (
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
                                gap: 2,
                            }}
                        >
                            {enrollments.map((enrollment, i) => (
                                <EnrollmentCard
                                    key={enrollment.id ?? i}
                                    enrollment={enrollment}
                                    onAction={onAction}
                                    index={i}
                                />
                            ))}
                        </Box>
                    )
                ) : (
                    <EnrollmentTable
                        enrollments={enrollments}
                        pagination={pagination}
                        loading={isLoading}
                        onPageChange={onPageChange}
                        onLimitChange={onLimitChange}
                        onAction={onAction}
                        hidePagination
                    />
                )}
            </Box>
        </Box>
    );
}
