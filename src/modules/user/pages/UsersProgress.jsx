import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Drawer,
    IconButton,
    TextField,
    MenuItem,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";

import { useNavigate } from "react-router-dom";

import DataTable from "../../../components/common/table/DataTable";
import UserDrawer from "../../../components/user/UserDrawer";
import useCommon from "../../../hooks/useCommon";
import useRole from "../../../hooks/useRole";
import axiosInstance from "../../../apiClient/axiosInstance";
import { httpClient } from "../../../apiClient/httpClient";

export default function UsersProgress() {
    const navigate = useNavigate();
    const { setTitleContainer, showLoader, hideLoader } = useCommon();
    const { roles, fetchAll: fetchAllRoles } = useRole();

    /* UI STATE */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [groups, setGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState("");
    const selectedGroupRef = useRef(selectedGroup);

    /* TABLE STATE */
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setTitleContainer("User Learning Insights");
        if (roles?.length === 0) fetchAllRoles();
    }, []);

    const roleMaps = useMemo(() => {
        if (!roles?.length) return [];
        return roles.map((r) => ({ value: r.id, label: r.name }));
    }, [roles]);

    const openCreate = () => {
        setSelectedUser(null);
        setDrawerOpen(true);
    };

    const openEdit = (user) => {
        setSelectedUser(user);
        setDrawerOpen(true);
    };

    const fetchUsers = useCallback(async (queryString) => {
        try {
            const groupVal = selectedGroupRef.current;
            const qs = queryString + (groupVal ? `&group_id=${encodeURIComponent(groupVal)}` : "");
            const res = await axiosInstance.get(`/user/search/enrollment-summary?${qs}`);
            const payload = res?.data?.response || {};
            setRows(payload?.data || []);
            setTotal(payload?.total || 0);
        } catch (err) {
            console.error("Failed to fetch users enrollment summary", err);
        } finally {
            try { hideLoader(); } catch (e) { /* ignore */ }
        }
    }, []);

    // fetch groups for dropdown
    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                const resp = await httpClient.getAllGroups();
                const arr = resp?.data?.response || resp?.data || resp || [];
                if (!mounted) return;
                setGroups(Array.isArray(arr) ? arr : []);
            } catch (e) {
                console.error("Failed to load groups", e);
            }
        })();
        return () => { mounted = false; };
    }, []);

    // keep a ref synced for stable fetchUsers usage
    useEffect(() => { selectedGroupRef.current = selectedGroup; }, [selectedGroup]);

    // refetch when group filter changes (reset to first page) — skip initial mount
    const groupMountedRef = useRef(false);
    useEffect(() => {
        if (!groupMountedRef.current) {
            groupMountedRef.current = true;
            return;
        }
        fetchUsers("page=1&limit=20");
    }, [selectedGroup, fetchUsers]);

    const columns = useMemo(() => [
        { field: "id", headerName: "ID", maxWidth: 80, type: "number" },
        {
            field: "username",
            headerName: "USERNAME",
            minWidth: 200,
            type: "string",
            filterable: true,
            renderCell: (params) => (
                <Typography
                    sx={{ cursor: "pointer", color: "primary.main", fontWeight: 500, "&:hover": { textDecoration: "underline" } }}
                    onClick={() => navigate(`/users/view/${params.row.id}`)}
                >
                    {params.row.username}
                </Typography>
            ),
        },
        { field: "email", headerName: "EMAIL", minWidth: 250, filterable: true, type: "string" },
        { field: "phonenumber", headerName: "PHONE", minWidth: 160, filterable: true, type: "string" },
        {
            field: "status", headerName: "STATUS", minWidth: 120, filterable: true, type: "select", valueOptions: ["active", "inactive", "suspended"], defaultOperator: "in", renderCell: (params) => (
                <Typography sx={{ fontWeight: 500, color: params.value === "active" ? "success.main" : params.value === "inactive" ? "warning.main" : "error.main" }}>{params.value}</Typography>
            )
        },

        { field: "total_courses", headerName: "TOTAL", minWidth: 100, type: "number" },
        { field: "completed_courses", headerName: "COMPLETED", minWidth: 120, type: "number" },
        { field: "not_started_courses", headerName: "NOT STARTED", minWidth: 120, type: "number" },
        { field: "incomplete_courses", headerName: "INCOMPLETE", minWidth: 120, type: "number" },
        { field: "avg_progress_percent", headerName: "AVG PROGRESS", minWidth: 140, type: "number", renderCell: (p) => (`${p.value ?? 0}%`) },

        // {
        //     field: "actions",
        //     headerName: "ACTIONS",
        //     maxWidth: 120,
        //     sortable: false,
        //     align: "center",
        //     renderCell: (params) => (
        //         <Box sx={{ display: "flex", gap: 1 }}>
        //             <IconButton size="small" color="primary" onClick={() => openEdit(params.row)}>
        //                 <ManageAccountsIcon fontSize="small" />
        //             </IconButton>
        //         </Box>
        //     ),
        // },
    ], [roleMaps]);

    return (
        <Box p={1}>
            <Stack direction="row" justifyContent="space-between" mb={3} alignItems="center">
                <Typography variant="h5" fontWeight={500}>User Learning Insights ({total})</Typography>

                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <TextField
                        select
                        size="small"
                        label="Group"
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        sx={{ minWidth: 220 }}
                    >
                        <MenuItem value="">All groups</MenuItem>
                        {groups.map((g) => (
                            <MenuItem key={g.id} value={g.id}>{g.name || g.title || g.groupName || `Group ${g.id}`}</MenuItem>
                        ))}
                    </TextField>
                </Box>
            </Stack>

            <DataTable
                serverSide
                rows={rows}
                totalCount={total}
                loading={loading}
                columns={columns}
                // tableKey="users-progress-table"
                checkboxSelection
                onFetchData={fetchUsers}
            // onRowDoubleClick={(row) => openEdit(row)}
            />

            <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)} disableEscapeKeyDown PaperProps={{ sx: { width: { xs: "100%", md: "50%" } } }} ModalProps={{ BackdropProps: { onClick: (e) => e.stopPropagation() } }}>
                <UserDrawer user={selectedUser} onClose={() => setDrawerOpen(false)} />
            </Drawer>
        </Box>
    );
}
