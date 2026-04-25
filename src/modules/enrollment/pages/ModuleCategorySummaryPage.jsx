import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Box, Typography, Autocomplete, TextField, Button, IconButton,
    Stack, Grid, Card, CardContent, CircularProgress, Alert,
    Table, TableHead, TableBody, TableRow, TableCell, TableContainer,
    TableSortLabel, Paper, Breadcrumbs, Link,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";
import { enrollmentApi } from "../../../services/enrollmentApi";
import ModuleTypeBadge from "../../../components/enrollment/ModuleTypeBadge";
import ProgressCell from "../../../components/enrollment/ProgressCell";

const CHART_COLORS = ["#2196f3", "#e0e0e0", "#009688", "#1976d2"];

function StatCard({ label, value, color }) {
    return (
        <Card variant="outlined" sx={{ flex: 1, minWidth: 130 }}>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
                <Typography variant="h4" fontWeight={700} sx={{ color: color ?? "text.primary" }}>
                    {value}
                </Typography>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
            </CardContent>
        </Card>
    );
}

function descendingComparator(a, b, key) {
    if ((b[key] ?? 0) < (a[key] ?? 0)) return -1;
    if ((b[key] ?? 0) > (a[key] ?? 0)) return 1;
    return 0;
}

function getComparator(order, key) {
    return order === "desc"
        ? (a, b) => descendingComparator(a, b, key)
        : (a, b) => -descendingComparator(a, b, key);
}

export default function ModuleCategorySummaryPage() {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [refreshKey, setRefreshKey] = useState(0);
    const [selectedRow, setSelectedRow] = useState(null);
    const [orderBy, setOrderBy] = useState("sortorder");
    const [order, setOrder] = useState("asc");

    const { data: categories = [], isLoading: catLoading } = useQuery({
        queryKey: ["module-categories", "list"],
        queryFn: () => enrollmentApi.getModuleCategoryList(),
    });
    const catList = Array.isArray(categories) ? categories : [];

    const { data: summary, isLoading, error, refetch } = useQuery({
        queryKey: ["enrollments", "category-summary", selectedCategory?.id, refreshKey],
        queryFn: () => enrollmentApi.getModuleCategorySummary(selectedCategory?.id ?? selectedCategory?.module_category_id),
        enabled: !!selectedCategory,
    });

    const rows = useMemo(() => Array.isArray(summary) ? summary : (summary?.data ?? []), [summary]);

    const totalModules = rows.length;
    const totalUsers = useMemo(() => rows.reduce((s, r) => s + (Number(r.total_group_users) || 0), 0), [rows]);
    const totalEnrolled = useMemo(() => rows.reduce((s, r) => s + (Number(r.enrolled_count) || 0), 0), [rows]);
    const totalCompleted = useMemo(() => rows.reduce((s, r) => s + (Number(r.completed_count) || 0), 0), [rows]);

    const sortedRows = useMemo(
        () => [...rows].sort(getComparator(order, orderBy)),
        [rows, order, orderBy]
    );

    const handleSort = (key) => {
        setOrder(orderBy === key && order === "asc" ? "desc" : "asc");
        setOrderBy(key);
    };

    const chartData = selectedRow
        ? [
            { name: "Enrolled", value: Number(selectedRow.enrolled_count) || 0 },
            { name: "Not Enrolled", value: Number(selectedRow.not_enrolled_count) || 0 },
            { name: "Completed", value: Number(selectedRow.completed_count) || 0 },
            { name: "In Progress", value: Number(selectedRow.inprogress_count) || 0 },
        ]
        : [];

    const SortCell = ({ label, field }) => (
        <TableCell sortDirection={orderBy === field ? order : false} sx={{ fontWeight: 700 }}>
            <TableSortLabel
                active={orderBy === field}
                direction={orderBy === field ? order : "asc"}
                onClick={() => handleSort(field)}
            >
                {label}
            </TableSortLabel>
        </TableCell>
    );

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>Home</Link>
                <Typography color="text.secondary">Enrollment</Typography>
                <Typography color="text.primary">Category Summary</Typography>
            </Breadcrumbs>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Module Category Enrollment Dashboard</Typography>

            {/* Controls */}
            <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
                <Autocomplete
                    options={catList}
                    getOptionLabel={(o) => o.name ?? o.category_name ?? String(o.id)}
                    loading={catLoading}
                    value={selectedCategory}
                    onChange={(_, v) => { setSelectedCategory(v); setSelectedRow(null); }}
                    sx={{ width: 300 }}
                    renderInput={(params) => (
                        <TextField {...params} label="Select Module Category" size="small" />
                    )}
                />
                <IconButton onClick={() => { setRefreshKey((k) => k + 1); refetch(); }} disabled={!selectedCategory}>
                    <RefreshIcon />
                </IconButton>
            </Stack>

            {!selectedCategory && (
                <Alert severity="info">Select a module category to view the summary.</Alert>
            )}

            {selectedCategory && isLoading && (
                <Box sx={{ textAlign: "center", py: 6 }}><CircularProgress /></Box>
            )}

            {selectedCategory && error && (
                <Alert severity="error">{error?.message || "Failed to load summary"}</Alert>
            )}

            {selectedCategory && !isLoading && !error && (
                <>
                    {/* Stats row */}
                    <Stack direction="row" spacing={2} sx={{ mb: 3, flexWrap: "wrap", gap: 2 }}>
                        <StatCard label="Total Modules" value={totalModules} />
                        <StatCard label="Total Users" value={totalUsers} color="#1976d2" />
                        <StatCard label="Total Enrolled" value={totalEnrolled} color="#009688" />
                        <StatCard label="Total Completed" value={totalCompleted} color="#4caf50" />
                    </Stack>

                    {/* Table + Chart */}
                    <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start" }}>
                        {/* Table — 65% */}
                        <Box sx={{ flex: "0 0 65%" }}>
                            <TableContainer component={Paper} variant="outlined">
                                <Table size="small">
                                    <TableHead>
                                        <TableRow sx={{ bgcolor: "var(--lightgrey, #f5f5f5)" }}>
                                            <SortCell label="#" field="sortorder" />
                                            <TableCell sx={{ fontWeight: 700 }}>Type</TableCell>
                                            <SortCell label="Module Title" field="module_title" />
                                            <SortCell label="Users" field="total_group_users" />
                                            <SortCell label="Enrolled" field="enrolled_count" />
                                            <TableCell sx={{ fontWeight: 700, color: "#f44336" }}>Not Enrolled</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Active</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>In Progress</TableCell>
                                            <TableCell sx={{ fontWeight: 700, color: "#4caf50" }}>Completed</TableCell>
                                            <TableCell sx={{ fontWeight: 700 }}>Rev/Exp</TableCell>
                                            <SortCell label="Avg Progress" field="avg_progress" />
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {sortedRows.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={11} align="center" sx={{ py: 4, color: "text.secondary" }}>
                                                    No modules found for this category
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            sortedRows.map((row, i) => {
                                                const notEnrolled = Number(row.not_enrolled_count) || 0;
                                                const completed = Number(row.completed_count) || 0;
                                                const isSelected = selectedRow?.module_id === row.module_id;
                                                return (
                                                    <TableRow
                                                        key={row.module_id ?? i}
                                                        hover
                                                        selected={isSelected}
                                                        onClick={() => setSelectedRow(isSelected ? null : row)}
                                                        sx={{ cursor: "pointer" }}
                                                    >
                                                        <TableCell>{row.sortorder ?? i + 1}</TableCell>
                                                        <TableCell><ModuleTypeBadge type={row.module_type} /></TableCell>
                                                        <TableCell sx={{ fontWeight: 500 }}>{row.module_title ?? "—"}</TableCell>
                                                        <TableCell>{row.total_group_users ?? 0}</TableCell>
                                                        <TableCell>{row.enrolled_count ?? 0}</TableCell>
                                                        <TableCell sx={{ color: notEnrolled > 0 ? "#f44336" : undefined, fontWeight: notEnrolled > 0 ? 700 : 400 }}>
                                                            {notEnrolled}
                                                        </TableCell>
                                                        <TableCell>{row.active_count ?? 0}</TableCell>
                                                        <TableCell>{row.inprogress_count ?? 0}</TableCell>
                                                        <TableCell sx={{ color: completed > 0 ? "#4caf50" : undefined, fontWeight: completed > 0 ? 700 : 400 }}>
                                                            {completed}
                                                        </TableCell>
                                                        <TableCell>{(Number(row.revoked_count) || 0) + (Number(row.expired_count) || 0)}</TableCell>
                                                        <TableCell>
                                                            <ProgressCell percent={row.avg_progress ?? 0} />
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                            {rows.length > 0 && (
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                                    Click a row to view enrollment breakdown chart
                                </Typography>
                            )}
                        </Box>

                        {/* Chart panel — 35% */}
                        <Box sx={{ flex: "0 0 33%", minWidth: 240 }}>
                            {selectedRow ? (
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1 }}>
                                            {selectedRow.module_title}
                                        </Typography>
                                        <ResponsiveContainer width="100%" height={220}>
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={50}
                                                    outerRadius={80}
                                                    dataKey="value"
                                                    paddingAngle={3}
                                                >
                                                    {chartData.map((_, idx) => (
                                                        <Cell key={idx} fill={CHART_COLORS[idx % CHART_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip formatter={(v) => [v, ""]} />
                                                <Legend iconSize={10} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>
                            ) : (
                                <Card variant="outlined" sx={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ px: 2 }}>
                                        Click a table row to see<br />the enrollment breakdown
                                    </Typography>
                                </Card>
                            )}
                        </Box>
                    </Box>
                </>
            )}
        </Box>
    );
}
