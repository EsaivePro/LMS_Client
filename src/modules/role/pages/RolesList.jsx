import React, { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, Stack, Typography, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { useDispatch } from "react-redux";
import { fetchAllPermissions } from "../../../redux/slices/adminSlice";

import useRole from "../../../hooks/useRole";
import DataTable from "../../../components/common/table/DataTable";
import RoleDrawer from "../../../components/role/RoleDrawer";
import { fetchRolePermissionsById } from "../../../redux/slices/roleSlice";
import { errorValidation } from "../../../utils/resolver.utils";
import { useAdmin } from "../../../hooks/useAdmin";
import useCommon from "../../../hooks/useCommon";

export default function RolesList() {
    const dispatch = useDispatch();
    const { roles, totalCount, loading, fetchAll, create, update, remove } = useRole();
    const { allPermissions } = useAdmin();
    const { showError } = useCommon();

    const [open, setOpen] = useState(false);
    const [mode, setMode] = useState("create");
    const [selectedRole, setSelectedRole] = useState(null);
    const [existingPermissions, setExistingPermissions] = useState([]);
    const hasFetched = useRef(false);

    useEffect(() => {
        if (!hasFetched.current) {
            if (allPermissions?.length === 0) dispatch(fetchAllPermissions());
            if (roles?.length === 0) fetchAll();

            hasFetched.current = true;
        }
    }, []);

    const openDrawer = async (type, role = null) => {
        if (type !== "create") {
            const res = await dispatch(fetchRolePermissionsById(role?.id)).unwrap();
            if (!errorValidation(res)) {
                setExistingPermissions(res?.data?.response?.permissions || []);
            }
        }
        setMode(type);
        setSelectedRole(role);
        setOpen(true);
    };

    const handleSave = async (payload, modeArg, oldRole) => {
        // validation: name is required
        if (!payload || !payload.name || String(payload.name).trim().length === 0) {
            showError("Role name is required");
            return;
        }
        let res = null;
        if (modeArg === "edit") {
            res = await update(oldRole.id, payload).unwrap();
        } else {
            res = await create(payload).unwrap();
        }
        if (!errorValidation(res)) {
            setOpen(false);
        }
    };

    const columns = useMemo(
        () => [
            { field: "id", headerName: "ID", filterable: false, sortable: true, pinned: "left", maxWidth: 80, type: "number" },
            { field: "name", headerName: "ROLE NAME", filterable: true, sortable: true, minWidth: 220 },
            { field: "description", headerName: "DESCRIPTION", filterable: true, sortable: false, minWidth: 300 },
            {
                field: "actions",
                headerName: "ACTIONS",
                filterable: false,
                sortable: false,
                maxWidth: 160,
                renderCell: ({ row }) => (
                    <Stack direction="row" spacing={1}>
                        <IconButton size="small" onClick={async () => await openDrawer("edit", row)}>
                            <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton size="small" onClick={async () => await openDrawer("copy", row)}>
                            <ContentCopyIcon fontSize="small" />
                        </IconButton>
                    </Stack>
                ),
            },
        ],
        []
    );

    return (
        <Box p={1}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight={500}>
                    Manage Roles ({totalCount || (roles && roles.length) || 0})
                </Typography>

                <Button variant="contained" startIcon={<AddIcon />} onClick={async () => await openDrawer("create")}>
                    New Role
                </Button>
            </Stack>

            <DataTable
                tableKey="roles"
                rows={roles}
                columns={columns}
                totalCount={totalCount}
                serverSide={false}
                defaultPageSize={10}
                pageSizeOptions={[10, 25, 50]}
                maxHeight={520}
                onRowDoubleClick={async (row) => await openDrawer("edit", row)}
            />

            {/* Drawer placed here so it mirrors the UsersList pattern */}
            <RoleDrawer
                open={open}
                mode={mode}
                roleData={selectedRole}
                onClose={() => setOpen(false)}
                onSave={handleSave}
                existingPermissions={existingPermissions}
            />
        </Box>
    );
}
