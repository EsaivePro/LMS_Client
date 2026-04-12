import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    Drawer,
    IconButton,
} from "@mui/material";
import {
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import MoreVertIcon from "@mui/icons-material/MoreVert";

import { useNavigate } from "react-router-dom";

import DataTable from "../../../components/common/table/DataTable";
import DatatableV1 from "../../../components/common/table/DataTableV1";

import UserDrawer from "../../../components/user/UserDrawer";
import useCommon from "../../../hooks/useCommon";
import useUser from "../../../hooks/useUser";
import useRole from "../../../hooks/useRole";
import axiosInstance from "../../../apiClient/axiosInstance";

/* ========================================================= */

function ActionsCell({ onEdit, onDelete }) {
    const [anchor, setAnchor] = useState(null);
    const open = Boolean(anchor);

    return (
        <>
            <Tooltip title="More" placement="top" disableInteractive>
                <IconButton size="small" onClick={(event) => setAnchor(event.currentTarget)} sx={{ color: "var(--dark)" }}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchor}
                open={open}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { elevation: 2, sx: { minWidth: 120, borderRadius: 1.5 } } }}
            >
                <MenuItem onClick={() => { setAnchor(null); onEdit(); }} sx={{ gap: 0 }}>
                    <ListItemIcon sx={{ minWidth: 0 }}>
                        <EditIcon fontSize="small" />
                    </ListItemIcon>
                    Edit
                </MenuItem>
                <MenuItem onClick={() => { setAnchor(null); onDelete(); }} sx={{ gap: 0, color: "error.main" }}>
                    <ListItemIcon sx={{ minWidth: 0, color: "error.main" }}>
                        <DeleteOutlineIcon fontSize="small" />
                    </ListItemIcon>
                    Delete
                </MenuItem>
            </Menu>
        </>
    );
}

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
                `/user-service/search?${queryString}`
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
                pinned: "right",
                minWidth: 60,
                maxWidth: 60,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <ActionsCell
                        onEdit={() => openEdit(params.row)}
                        onDelete={() => handleDelete(params.row.id)}
                    />
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
        <Box p={1} mt={1.5}>
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

            <Box>
                {/* ---------- DATA TABLE ---------- */}
                <DatatableV1
                    serverSide={true}
                    rows={rows}
                    totalCount={total}
                    loading={loading}
                    columns={columns}
                    tableKey="users-table"
                    onFetchData={fetchUsers}
                    onRowDoubleClick={(row) => openEdit(row)}
                />
            </Box>

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
