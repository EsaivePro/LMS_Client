import React, { useMemo, useState, useCallback, useEffect } from "react";
import { Box, Stack, Typography, Button, IconButton, TextField, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import SearchIcon from '@mui/icons-material/Search';
import DataTableV1 from "../../components/common/table/DataTableV1";
import axiosInstance from "../../apiClient/axiosInstance";
import useCommon from "../../hooks/useCommon";

// MasterForm now builds columns from config.fields and renders DataTableV1

export default function MasterForm({ config = {}, total: initialTotal = 0, onCreate, onDelete, tableKey, tableName, onRowDoubleClick, pickerMode = false, onPickerSelect }) {
    const navigate = useNavigate();
    const header = config.header || {};
    const title = header.title || "";
    const showCount = header.showCount !== false;
    const { showLoader, hideLoader, setTitleContainer } = useCommon();

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(initialTotal || 0);
    const [quickSearch, setQuickSearch] = useState('');
    const [selectedIds, setSelectedIds] = useState([]);

    const getByPath = (obj, path) => {
        if (!path) return undefined;
        return path.split('.').reduce((o, k) => (o && Object.prototype.hasOwnProperty.call(o, k) ? o[k] : undefined), obj);
    };

    const handleFetchData = useCallback(async (queryString) => {
        showLoader();
        try {
            const res = await axiosInstance.get(`${config.endpoint}?${queryString}`);
            const raw = res?.data || {};
            let dataNode = raw;
            if (config.readFrom) {
                dataNode = getByPath(raw, config.readFrom);
            } else if (raw.response) {
                dataNode = raw.response;
            }

            if (Array.isArray(dataNode)) {
                setRows(dataNode);
                setTotal(dataNode.length);
            } else if (dataNode && Array.isArray(dataNode.data)) {
                setRows(dataNode.data || []);
                setTotal(dataNode.total || dataNode.data.length || 0);
            } else {
                setRows([]);
                setTotal(0);
            }
        } catch (err) {
            console.error('Failed to fetch data in MasterForm', err);
            setRows([]);
            setTotal(0);
        } finally {
            hideLoader();
        }
    }, [config.endpoint, config.readFrom, showLoader, hideLoader]);

    // set container title from config so pages don't need to
    useEffect(() => {
        if (pickerMode) return;
        const headerObj = config.header || {};
        const titleStr = typeof headerObj === 'string' ? headerObj : (headerObj.title || '');
        if (titleStr) setTitleContainer(titleStr);
    }, [config.header, setTitleContainer, pickerMode]);

    const handleButton = (btn) => {
        if (btn.key === 'create') {
            if (onCreate) return onCreate();
            if (btn.path) return navigate(btn.path);
            // fallback to config route or baseRoute/create
            if (config.routes?.create) return navigate(config.routes.create.replace('{id}', ''));
            if (config.baseRoute) return navigate(`${config.baseRoute.replace(/\/+$/, '')}/create`);
        }
        if (btn.key === 'delete') {
            if (onDelete) return onDelete();
            // could implement bulk delete here using config.deleteEndpoint
            console.warn('Delete action requested but no onDelete handler provided');
        }
    };

    const columns = useMemo(() => {
        const cfgFields = (config.fields || []);
        return cfgFields.map((f) => {
            const col = {
                field: f.name,
                headerName: f.label || f.name,
                type: f.type || 'string'
            };
            if (f.maxWidth) col.maxWidth = f.maxWidth;
            if (f.minWidth) col.minWidth = f.minWidth;
            if (f.filterable) col.filterable = f.filterable;
            if (f.valueOptions) col.valueOptions = f.valueOptions;

            if (f.name === 'title') {
                const linkTpl = f.linkTemplate || (config.routes && config.routes.titleLink) || null;
                const resolveRoute = (tpl) => {
                    if (!tpl) return null;
                    if (tpl.startsWith('/')) return tpl;
                    const base = (config.baseRoute || '').replace(/\/+$/, '');
                    return `${base}/${tpl.replace(/^\/+/, '')}`;
                };

                col.renderCell = (params) => {
                    const text = params.row[f.name];
                    let tpl = linkTpl;
                    if (!tpl && config.baseRoute) tpl = '{id}';
                    if (tpl) {
                        const raw = tpl.replace('{id}', params.row.id);
                        const to = resolveRoute(raw);
                        return (
                            <Tooltip title={text ?? ''} placement="top-start" disableInteractive enterDelay={300}>
                                <Typography
                                    style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}
                                    sx={{ cursor: 'pointer', color: 'var(--primary)', fontWeight: 400 }}
                                    onClick={() => { if (to) navigate(to); }}
                                >
                                    {text}
                                </Typography>
                            </Tooltip>
                        );
                    }
                    return (
                        <Tooltip title={text ?? ''} placement="top-start" disableInteractive enterDelay={300}>
                            <Typography
                                style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden', wordBreak: 'break-word' }}
                                sx={{ fontWeight: 500 }}
                            >
                                {text}
                            </Typography>
                        </Tooltip>
                    );
                };
            }

            if (f.name === 'is_active') {
                col.renderCell = (params) => (
                    <Typography sx={{ fontWeight: 600, color: params.value ? 'success.main' : 'text.secondary' }}>{params.value ? 'Active' : 'Inactive'}</Typography>
                );
            }

            if (f.name === 'actions') {
                col.align = 'center';
                col.sortable = f.sortable === undefined ? false : f.sortable;
                col.pinned = f.pinned || undefined;
                col.renderCell = (params) => {
                    const editTpl = f.editTemplate || (config.routes && config.routes.edit) || null;
                    const copyTpl = f.copyTemplate || (config.routes && config.routes.copy) || null;
                    const createTpl = (config.routes && config.routes.create) || null;

                    const onEdit = () => {
                        const template = editTpl || (config.routes && config.routes.titleLink) || (config.routes && config.routes.edit) || null;
                        let raw;
                        if (template) raw = template.replace('{id}', params.row.id);
                        else if (config.baseRoute) raw = '{id}'.replace('{id}', params.row.id);
                        if (raw) {
                            const base = raw.startsWith('/') ? raw : `${config.baseRoute.replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`;
                            const to = `${base}${base.includes('?') ? '&' : '?'}editmode=true`;
                            navigate(to);
                        }
                    };

                    const onCopy = () => {
                        const template = copyTpl || (config.routes && config.routes.titleLink) || (config.routes && config.routes.edit) || null;
                        let raw;
                        if (template) raw = template.replace('{id}', params.row.id);
                        else if (config.baseRoute) raw = '{id}'.replace('{id}', params.row.id);
                        if (raw) {
                            const base = raw.startsWith('/') ? raw : `${config.baseRoute.replace(/\/+$/, '')}/${raw.replace(/^\/+/, '')}`;
                            const to = `${base}${base.includes('?') ? '&' : '?'}copymode=true`;
                            navigate(to);
                            return;
                        }
                        const baseCreate = `${(config.baseRoute || '').replace(/\/+$/, '')}/create`;
                        navigate(`${baseCreate}?copymode=true`);
                    };

                    const onDelete = async () => {
                        if (typeof onDelete === 'function') {
                            return onDelete(params.row);
                        }
                        const deleteEndpoint = config.deleteEndpoint;
                        if (deleteEndpoint) {
                            const url = deleteEndpoint.replace('{id}', params.row.id);
                            try {
                                await axiosInstance.delete(url);
                                // refetch (blank query will trigger default load)
                                handleFetchData('');
                            } catch (err) {
                                console.error('Delete failed', err);
                            }
                        } else {
                            console.warn('No delete handler or deleteEndpoint configured');
                        }
                    };

                    return (
                        <>
                            <IconButton size="small" onClick={onEdit} aria-label="edit" sx={{ color: 'var(--dark)' }}>
                                <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={onCopy} aria-label="copy" sx={{ color: 'var(--dark)' }}>
                                <ContentCopyIcon fontSize="small" />
                            </IconButton>
                            <IconButton size="small" onClick={onDelete} aria-label="delete" sx={{ color: 'var(--dark)' }}>
                                <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                        </>
                    );
                };
            }

            return col;
        });
    }, [config.fields, navigate]);

    return (
        <Box
            sx={{
                flex: 1,
                width: "100%",
                minHeight: pickerMode ? 'auto' : "100%",
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                borderRadius: pickerMode ? 0 : 2,
                boxShadow: pickerMode ? 'none' : "0 1px 5px rgba(0,0,0,0.08)",
                mt: pickerMode ? 0 : 3,
                overflow: "hidden"
            }}
        >
            {/* HEADER — hidden in pickerMode (Drawer has its own header) */}
            {!pickerMode && (
                <Box
                    sx={{
                        bgcolor: "background.paper",
                        px: 2,
                        py: 1.5
                    }}
                >
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Typography variant="h6" fontWeight={700}>
                            {title}
                        </Typography>

                        <Stack direction="row" spacing={1}>
                            {(header.buttons || []).map((btn) => (
                                <Button
                                    key={btn.key}
                                    variant={btn.variant || "contained"}
                                    onClick={() => handleButton(btn)}
                                    startIcon={
                                        btn.key === "create" ? <AddIcon /> : null
                                    }
                                >
                                    {btn.label}
                                </Button>
                            ))}
                        </Stack>
                    </Stack>
                </Box>
            )}

            {/* TABLE CONTAINER */}
            <Box
                sx={{
                    flex: 1,
                    bgcolor: "background.paper",
                    // borderRadius: 2,
                    overflow: "hidden",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                <Box sx={{ flex: 1, overflow: "auto" }}>
                    <DataTableV1
                        serverSide
                        rows={rows}
                        totalCount={total}
                        columns={columns}
                        tableKey={
                            tableKey ||
                            config.tableKey ||
                            `${config.tableName || "table"}-table`
                        }
                        onFetchData={handleFetchData}
                        tableName={tableName || config.tableName}
                        externalSearch={quickSearch}
                        checkboxSelection={pickerMode}
                        onSelectionChange={pickerMode ? (ids) => setSelectedIds(ids) : undefined}
                        onRowDoubleClick={
                            pickerMode ? undefined :
                                (onRowDoubleClick ||
                                    ((row) => {
                                        const route = config.routes?.rowDoubleClick;
                                        if (route) {
                                            navigate(route.replace("{id}", row.id));
                                        }
                                    }))
                        }
                    />
                </Box>
            </Box>

            {/* PICKER FOOTER */}
            {pickerMode && (
                <Box sx={{ px: 2, py: 1.5, borderTop: '1px solid', borderColor: 'divider', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, bgcolor: 'background.paper' }}>
                    <Typography variant="body2" color="text.secondary">
                        {selectedIds.length} selected
                    </Typography>
                    <Button
                        variant="contained"
                        disabled={!selectedIds.length}
                        onClick={() => onPickerSelect?.(rows.filter(r => selectedIds.includes(r.id)))}
                    >
                        Add Selected ({selectedIds.length})
                    </Button>
                </Box>
            )}
        </Box>
    );
}
