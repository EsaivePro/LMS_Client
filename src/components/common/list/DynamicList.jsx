import React, { useCallback } from "react";
import { Box, Stack, Typography, Button, IconButton } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { useNavigate } from "react-router-dom";
import DataTable from "../table/DataTable";
import useCommon from "../../../hooks/useCommon";
import { httpClient } from "../../../apiClient/httpClient";

export default function DynamicList({
    title = "List",
    fetchUrl,
    columns = [],
    tableKey = "dynamic-list",
    createPath = null,
    viewPath = null, // template like '/exams/view/' + id
    editPath = null,
    deleteApi = null, // function(id) => promise
    permissionCreate = null,
}) {
    const navigate = useNavigate();
    const { showLoader, hideLoader, showError, showSuccess, setTitleContainer } = useCommon();

    React.useEffect(() => { setTitleContainer(title); }, [title]);

    const onFetchData = useCallback(async (queryString) => {
        showLoader();
        try {
            const res = await fetchUrl(queryString);
            // expecting controller to return { data: rows, total }
            const payload = res?.data?.response || {};
            return {
                rows: payload.data || [],
                total: payload.total || 0,
            };
        } catch (err) {
            console.error("Failed to fetch list", err);
            showError(err?.message || "Failed to fetch list");
            return { rows: [], total: 0 };
        } finally {
            hideLoader();
        }
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this item?")) return;
        try {
            showLoader();
            if (deleteApi) await deleteApi(id);
            else await httpClient.deleteExam(id); // fallback (may fail for other entities)
            showSuccess("Deleted successfully");
        } catch (err) {
            console.error("Delete failed", err);
            showError(err?.response?.data?.message || err.message || "Delete failed");
        } finally {
            hideLoader();
        }
    };

    const cols = React.useMemo(() => {
        const hasActions = columns.some((c) => c.field === "actions");
        if (hasActions) return columns;
        return [
            ...columns,
            {
                field: "actions",
                headerName: "ACTIONS",
                maxWidth: 140,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <Box sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
                        {viewPath && (
                            <IconButton size="small" color="primary" onClick={() => navigate(`${viewPath}${params.row.id}`)}>
                                <VisibilityIcon fontSize="small" />
                            </IconButton>
                        )}
                        {editPath && (
                            <IconButton size="small" color="primary" onClick={() => navigate(`${editPath}${params.row.id}`)}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDelete(params.row.id)}>
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            },
        ];
    }, [columns, viewPath, editPath]);

    const [rowsState, setRowsState] = React.useState([]);
    const [totalState, setTotalState] = React.useState(0);
    const [loading, setLoading] = React.useState(false);

    const fetchAdapter = useCallback(async (queryString) => {
        setLoading(true);
        try {
            const res = await fetchUrl(queryString);
            const payload = res?.data?.response || {};
            setRowsState(payload.data || []);
            setTotalState(payload.total || 0);
        } catch (err) {
            console.error(err);
            showError(err?.message || "Failed to fetch list");
            setRowsState([]);
            setTotalState(0);
        } finally {
            setLoading(false);
        }
    }, [fetchUrl]);

    return (
        <Box p={1}>
            <Stack direction="row" justifyContent="space-between" mb={3}>
                <Typography variant="h5" fontWeight={500}>{title} ({totalState})</Typography>
                {createPath && (
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate(createPath)}>New {title.replace(/s$/, '')}</Button>
                )}
            </Stack>

            <DataTable
                serverSide={true}
                rows={rowsState}
                totalCount={totalState}
                loading={loading}
                columns={cols}
                tableKey={tableKey}
                onFetchData={fetchAdapter}
                onRowDoubleClick={(row) => editPath ? navigate(`${editPath}${row.id}`) : null}
            />
        </Box>
    );
}
