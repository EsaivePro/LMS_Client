import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Drawer,
    IconButton,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import DeleteIcon from "@mui/icons-material/Delete";

import { useNavigate } from "react-router-dom";
import axios from "axios";

import DataTable from "../../../components/common/table/DataTable";
import UserDrawer from "./UserDrawer";
import useCommon from "../../../hooks/useCommon";
import useUser from "../../../hooks/useUser";
import useRole from "../../../hooks/useRole";
import axiosInstance from "../../../apiClient/axiosInstance";

/* ========================================================= */

export default function UserList() {
    const navigate = useNavigate();
    const { setTitleContainer } = useCommon();
    const { remove } = useUser();
    const { roles, fetchAll: fetchAllRoles } = useRole();
    const { showLoader, hideLoader } = useCommon();

    /* ---------- UI STATE ---------- */
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedUser, setSelectedUser] = useState(null);

    /* ---------- TABLE STATE ---------- */
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);

    /* ---------- INIT ---------- */
    useEffect(() => {
        setTitleContainer("User Management");
        if (roles?.length === 0)
            fetchAllRoles();
    }, []);

    /* ---------- ROLE MAP ---------- */
    const roleMaps = useMemo(() => {
        if (!roles?.length) return [];
        return roles.map((r) => ({
            value: r.id,
            label: r.name,
        }));
    }, [roles]);

    /* ---------- DRAWER HANDLERS ---------- */
    const openCreate = () => {
        setMode("create");
        setSelectedUser(null);
        setDrawerOpen(true);
    };

    const openEdit = (user) => {
        setMode("edit");
        setSelectedUser(user);
        setDrawerOpen(true);
    };

    /* ---------- DELETE ---------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        const res = await remove(id);
        if (res && !res.isError) {
            // DataTable will auto-refetch (same query)
            setDrawerOpen(false);
        }
    };

    /* =========================================================
       SERVER FETCH (URL IS FRAMED BY DATATABLE)
       ========================================================= */

    const fetchUsers = useCallback(async (queryString) => {
        showLoader();
        try {
            const res = await axiosInstance.get(
                `/user/search?${queryString}`
            );
            const payload = res?.data?.response || {};
            setRows(payload?.data || []);
            setTotal(payload?.total || 0);
        } catch (err) {
            console.error("Failed to fetch users", err);
        } finally {
            hideLoader();
        }
    }, []);

    /* =========================================================
       COLUMN CONFIG (SINGLE SOURCE OF TRUTH)
       ========================================================= */

    const columns = useMemo(
        () => [
            {
                field: "id",
                headerName: "ID",
                maxWidth: 80,
                type: "number",
            },
            {
                field: "username",
                headerName: "USERNAME",
                minWidth: 200,
                type: "string",
                filterable: true,
                renderCell: (params) => (
                    <Typography
                        sx={{
                            cursor: "pointer",
                            color: "primary.main",
                            fontWeight: 500,
                            "&:hover": { textDecoration: "underline" },
                        }}
                        onClick={() => navigate(`/users/view/${params.row.id}`)}
                    >
                        {params.row.username}
                    </Typography>
                ),
            },
            {
                field: "email",
                headerName: "EMAIL",
                minWidth: 250,
                filterable: true,
                type: "string",
            },
            {
                field: "phonenumber",
                headerName: "PHONE",
                minWidth: 160,
                filterable: true,
                type: "string",
            },
            {
                field: "role_id",
                headerName: "ROLE",
                minWidth: 150,
                filterable: true,
                type: "select",
                valueOptions: roleMaps,
                defaultOperator: "in",
            },
            {
                field: "status",
                headerName: "STATUS",
                minWidth: 140,
                filterable: true,
                type: "select",
                valueOptions: ["active", "inactive", "suspended"],
                defaultOperator: "in",
                renderCell: (params) => (
                    <Typography
                        sx={{
                            fontWeight: 500,
                            color:
                                params.value === "active"
                                    ? "success.main"
                                    : params.value === "inactive"
                                        ? "warning.main"
                                        : "error.main",
                        }}
                    >
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: "details",
                headerName: "DEPARTMENT",
                minWidth: 180,
                filterable: true,
                type: "string",
                renderCell: (params) => params.value?.department || "-",
            },
            {
                field: "actions",
                headerName: "ACTIONS",
                maxWidth: 120,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                            size="small"
                            color="primary"
                            onClick={() => openEdit(params.row)}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>

                        {/* <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(params.row.id)}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton> */}
                    </Box>
                ),
            },
            {
                field: "manage",
                headerName: "MANAGE",
                pinned: "left",
                maxWidth: 90,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <IconButton
                        size="small"
                        color="primary"
                        onClick={() => navigate(`/users/edit/${params.row.id}`)}
                    >
                        <ManageAccountsIcon fontSize="small" />
                    </IconButton>
                ),
            },
        ],
        [roleMaps]
    );

    /* ========================================================= */

    return (
        <Box p={1}>
            {/* ---------- HEADER ---------- */}
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight={500}>
                    Manage Users ({total})
                </Typography>

                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={openCreate}
                >
                    New User
                </Button>
            </Stack>

            {/* ---------- DATA TABLE ---------- */}
            <DataTable
                serverSide={true}
                rows={rows}
                totalCount={total}
                loading={loading}
                columns={columns}
                tableKey="users-table"
                checkboxSelection
                onFetchData={fetchUsers}
                onRowDoubleClick={(row) => openEdit(row)}
            />

            {/* ---------- DRAWER ---------- */}
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={() => setDrawerOpen(false)}
                disableEscapeKeyDown
                PaperProps={{ sx: { width: { xs: "100%", md: "50%" } } }}
                ModalProps={{
                    BackdropProps: { onClick: (e) => e.stopPropagation() },
                }}
            >
                <UserDrawer
                    mode={mode}
                    user={selectedUser}
                    onClose={() => setDrawerOpen(false)}
                />
            </Drawer>
        </Box>
    );
}
