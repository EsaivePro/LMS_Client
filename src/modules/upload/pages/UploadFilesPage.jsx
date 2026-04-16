import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    Autocomplete,
    Box,
    Button,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    IconButton,
    MenuItem,
    Paper,
    Stack,
    Switch,
    TextField,
    Tooltip,
    Typography,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import AddIcon from "@mui/icons-material/Add";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import DataTableV2 from "../../../components/common/table/DataTableV2";
import { httpClient } from "../../../apiClient/httpClient";
import useCommon from "../../../hooks/useCommon";

// ─── Constants ───────────────────────────────────────────────────────────────

const FILE_COLUMNS = [
    "id", "uuid", "file_name", "location", "mime_type", "file_type",
    "extension", "file_size", "file_path", "file_module", "status",
    "description", "checksum", "expires_at", "is_public", "video_id",
    "created_by", "updated_by", "is_deleted", "deleted_at", "created_at", "updated_at",
];

const STATUS_OPTIONS = ["active", "inactive", "pending", "archived", "error"];

const FILE_TYPE_OPTIONS = ["image", "video", "audio", "document", "archive", "other"];

const EMPTY_FORM = {
    file_name: "",
    location: "",
    mime_type: "",
    file_type: "",
    extension: "",
    file_size: "",
    file_path: "",
    file_module: "",
    status: "active",
    description: "",
    checksum: "",
    expires_at: "",
    is_public: false,
    video_id: "",
    created_by: null,
    updated_by: null,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

const formatBytes = (bytes) => {
    if (!bytes || isNaN(bytes)) return "-";
    const b = Number(bytes);
    if (b < 1024) return `${b} B`;
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDateTime = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
};

const toISOLocal = (value) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    // datetime-local input expects "YYYY-MM-DDTHH:mm"
    return date.toISOString().slice(0, 16);
};

const buildStatusColor = (status) => {
    const s = String(status || "").toLowerCase();
    if (s === "active") return "success";
    if (s === "inactive") return "default";
    if (s === "pending") return "warning";
    if (s === "archived") return "secondary";
    if (s === "error") return "error";
    return "default";
};

// ─── Delete Confirm Dialog ───────────────────────────────────────────────────

function DeleteConfirmDialog({ open, row, onClose, onConfirm }) {
    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Delete File Record</DialogTitle>
            <DialogContent>
                <Typography>
                    Are you sure you want to delete{" "}
                    <strong>{row?.file_name || "this record"}</strong>? This action cannot be undone.
                </Typography>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} variant="outlined" size="small">Cancel</Button>
                <Button onClick={onConfirm} variant="contained" color="error" size="small">Delete</Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── File Form Dialog ────────────────────────────────────────────────────────

function FileFormDialog({ open, mode, initialData, userOptions, onUserSearch, onClose, onSave }) {
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (open) {
            setForm(
                mode === "edit" && initialData
                    ? {
                        ...EMPTY_FORM,
                        ...initialData,
                        file_size: initialData.file_size ?? "",
                        expires_at: toISOLocal(initialData.expires_at),
                        is_public: Boolean(initialData.is_public),
                        created_by: initialData._created_by_user || null,
                        updated_by: initialData._updated_by_user || null,
                    }
                    : { ...EMPTY_FORM }
            );
            setErrors({});
        }
    }, [open, mode, initialData]);

    const set = (field) => (e) =>
        setForm((prev) => ({ ...prev, [field]: e.target.value }));

    const validate = () => {
        const next = {};
        if (!form.file_name.trim()) next.file_name = "File name is required";
        setErrors(next);
        return Object.keys(next).length === 0;
    };

    const handleSave = () => {
        if (!validate()) return;
        onSave(form);
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}>
            <DialogTitle sx={{ fontWeight: 700, pb: 1 }}>
                {mode === "edit" ? "Edit File Record" : "New File Record"}
            </DialogTitle>
            <Divider />

            <DialogContent sx={{ pt: 2 }}>
                <Stack spacing={2}>
                    {/* Row 1 */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="File Name *"
                            value={form.file_name}
                            onChange={set("file_name")}
                            error={!!errors.file_name}
                            helperText={errors.file_name}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Extension"
                            placeholder=".pdf, .mp4, .png …"
                            value={form.extension}
                            onChange={set("extension")}
                        />
                    </Stack>

                    {/* Row 2 */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            fullWidth
                            size="small"
                            select
                            label="File Type"
                            value={form.file_type}
                            onChange={set("file_type")}
                        >
                            <MenuItem value="">None</MenuItem>
                            {FILE_TYPE_OPTIONS.map((t) => (
                                <MenuItem key={t} value={t}>{t}</MenuItem>
                            ))}
                        </TextField>
                        <TextField
                            fullWidth
                            size="small"
                            label="MIME Type"
                            placeholder="application/pdf, video/mp4 …"
                            value={form.mime_type}
                            onChange={set("mime_type")}
                        />
                    </Stack>

                    {/* Row 3 */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="File Module"
                            placeholder="courses, lessons, users …"
                            value={form.file_module}
                            onChange={set("file_module")}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            select
                            label="Status"
                            value={form.status}
                            onChange={set("status")}
                        >
                            {STATUS_OPTIONS.map((s) => (
                                <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
                            ))}
                        </TextField>
                    </Stack>

                    {/* Row 4 – paths */}
                    <TextField
                        fullWidth
                        size="small"
                        label="Location (URL)"
                        placeholder="https://…"
                        value={form.location}
                        onChange={set("location")}
                    />
                    <TextField
                        fullWidth
                        size="small"
                        label="File Path (storage path)"
                        placeholder="uploads/2024/01/file.pdf"
                        value={form.file_path}
                        onChange={set("file_path")}
                    />

                    {/* Row 5 */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            fullWidth
                            size="small"
                            type="number"
                            label="File Size (bytes)"
                            value={form.file_size}
                            onChange={set("file_size")}
                            inputProps={{ min: 0 }}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            label="Video ID"
                            placeholder="Vimeo / YouTube ID"
                            value={form.video_id}
                            onChange={set("video_id")}
                        />
                    </Stack>

                    {/* Row 6 */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <TextField
                            fullWidth
                            size="small"
                            label="Checksum"
                            placeholder="md5 / sha256 hash"
                            value={form.checksum}
                            onChange={set("checksum")}
                        />
                        <TextField
                            fullWidth
                            size="small"
                            type="datetime-local"
                            label="Expires At"
                            value={form.expires_at}
                            onChange={set("expires_at")}
                            InputLabelProps={{ shrink: true }}
                        />
                    </Stack>

                    {/* Row 7 – users */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                        <Autocomplete
                            fullWidth
                            options={userOptions}
                            value={form.created_by}
                            onChange={(_, v) => setForm((prev) => ({ ...prev, created_by: v }))}
                            onInputChange={(_, input, reason) => { if (reason === "input") onUserSearch(input); }}
                            getOptionLabel={(o) => o?.label || ""}
                            isOptionEqualToValue={(o, v) => o?.id === v?.id}
                            renderInput={(params) => (
                                <TextField {...params} size="small" label="Created By" placeholder="Search user…" />
                            )}
                        />
                        <Autocomplete
                            fullWidth
                            options={userOptions}
                            value={form.updated_by}
                            onChange={(_, v) => setForm((prev) => ({ ...prev, updated_by: v }))}
                            onInputChange={(_, input, reason) => { if (reason === "input") onUserSearch(input); }}
                            getOptionLabel={(o) => o?.label || ""}
                            isOptionEqualToValue={(o, v) => o?.id === v?.id}
                            renderInput={(params) => (
                                <TextField {...params} size="small" label="Updated By" placeholder="Search user…" />
                            )}
                        />
                    </Stack>

                    {/* Row 8 – description */}
                    <TextField
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        label="Description"
                        value={form.description}
                        onChange={set("description")}
                    />

                    {/* Row 9 – toggle */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={Boolean(form.is_public)}
                                onChange={(e) => setForm((prev) => ({ ...prev, is_public: e.target.checked }))}
                                color="primary"
                            />
                        }
                        label="Public file (accessible without authentication)"
                    />
                </Stack>
            </DialogContent>

            <Divider />
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} variant="outlined" size="small">Cancel</Button>
                <Button onClick={handleSave} variant="contained" size="small">
                    {mode === "edit" ? "Save Changes" : "Create Record"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function UploadFilesPage() {
    const { setTitleContainer, setContainerDescription, showError, showSuccess, showLoader, hideLoader } = useCommon();
    const setTitleRef = useRef(setTitleContainer);
    const setDescRef = useRef(setContainerDescription);
    const showErrorRef = useRef(showError);
    const showSuccessRef = useRef(showSuccess);
    const showLoaderRef = useRef(showLoader);
    const hideLoaderRef = useRef(hideLoader);

    const [rows, setRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userOptions, setUserOptions] = useState([]);
    const [search, setSearch] = useState("");
    const [moduleFilter, setModuleFilter] = useState("");
    const [statusFilter, setStatusFilter] = useState("");

    // Dialog state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogMode, setDialogMode] = useState("create"); // "create" | "edit"
    const [activeRow, setActiveRow] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, row: null });

    // Sync refs
    useEffect(() => {
        setTitleRef.current = setTitleContainer;
        setDescRef.current = setContainerDescription;
        showErrorRef.current = showError;
        showSuccessRef.current = showSuccess;
        showLoaderRef.current = showLoader;
        hideLoaderRef.current = hideLoader;
    });

    useEffect(() => {
        setTitleRef.current?.("File Upload Manager");
        setDescRef.current?.("Browse, add, edit, and remove tracked file records.");
    }, []);

    // ── Load users ──────────────────────────────────────────────────────────
    const loadUsers = useCallback(async (searchText = "") => {
        try {
            const response = await httpClient.formSearch({
                table: "users",
                columns: ["id", "username", "email"],
                where: {},
                globalSearch: searchText,
                limit: 10,
            });
            const list = response?.data?.response?.data || response?.data?.response || response?.data || [];
            setUserOptions(
                list.map((u) => ({
                    id: u.id,
                    label: u.username || u.email || `User ${u.id}`,
                    email: u.email || "",
                }))
            );
        } catch (err) {
            console.error("Failed to load users", err);
        }
    }, []);

    // ── Load file records ────────────────────────────────────────────────────
    const loadFiles = useCallback(async () => {
        setLoading(true);
        showLoaderRef.current?.("Loading file records…");
        try {
            const where = {
                ...(moduleFilter ? { file_module: moduleFilter } : {}),
                ...(statusFilter ? { status: statusFilter } : {}),
                is_deleted: false,
            };

            const response = await httpClient.formSearch({
                table: "upload_files",
                columns: FILE_COLUMNS,
                where,
                globalSearch: search,
                limit: 100,
            });

            const list = response?.data?.response?.data || response?.data?.response || response?.data || [];

            // Resolve user names in one batch
            const userIds = [
                ...new Set(
                    list.flatMap((r) => [r.created_by, r.updated_by]).filter(Boolean)
                ),
            ];

            let userMap = new Map();
            if (userIds.length) {
                const usersRes = await httpClient.formSearch({
                    table: "users",
                    columns: ["id", "username", "email"],
                    where: { id: userIds },
                    globalSearch: "",
                    limit: userIds.length,
                });
                const users = usersRes?.data?.response?.data || usersRes?.data?.response || usersRes?.data || [];
                userMap = new Map(
                    users.map((u) => [String(u.id), { label: u.username || u.email || `User ${u.id}`, ...u }])
                );
            }

            setRows(
                list.map((item) => ({
                    ...item,
                    _created_by_user: item.created_by ? userMap.get(String(item.created_by)) || null : null,
                    _updated_by_user: item.updated_by ? userMap.get(String(item.updated_by)) || null : null,
                    _created_by_label: item.created_by
                        ? userMap.get(String(item.created_by))?.label || `User ${item.created_by}`
                        : "-",
                }))
            );
        } catch (err) {
            console.error("Failed to load file records", err);
            showErrorRef.current?.("Failed to load file records");
        } finally {
            setLoading(false);
            hideLoaderRef.current?.();
        }
    }, [search, moduleFilter, statusFilter]);

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { loadFiles(); }, [loadFiles]);

    // ── Filter options derived from rows ─────────────────────────────────────
    const moduleOptions = useMemo(() => {
        const s = new Set(rows.map((r) => r.file_module).filter(Boolean));
        return [...s];
    }, [rows]);

    // ── CRUD handlers ─────────────────────────────────────────────────────────

    const handleCreate = () => {
        setDialogMode("create");
        setActiveRow(null);
        setDialogOpen(true);
    };

    const handleEdit = (row) => {
        setDialogMode("edit");
        setActiveRow(row);
        setDialogOpen(true);
    };

    const handleDeletePrompt = (row) => setDeleteDialog({ open: true, row });

    const handleDeleteConfirm = async () => {
        const row = deleteDialog.row;
        setDeleteDialog({ open: false, row: null });
        showLoaderRef.current?.("Deleting…");
        try {
            const res = await httpClient.deleteForm({ table: "upload_files", id: row.id });
            if (res?.data?.error === false && res?.data?.statusCode === 200) {
                showSuccessRef.current?.("File record deleted");
                loadFiles();
            } else {
                showErrorRef.current?.(res?.data?.message || "Failed to delete");
            }
        } catch (err) {
            showErrorRef.current?.(err?.response?.data?.message || err.message || "Failed to delete");
        } finally {
            hideLoaderRef.current?.();
        }
    };

    const handleSave = async (form) => {
        showLoaderRef.current?.(dialogMode === "create" ? "Creating…" : "Saving…");
        try {
            const data = {
                file_name: form.file_name.trim(),
                location: form.location || null,
                mime_type: form.mime_type || null,
                file_type: form.file_type || null,
                extension: form.extension || null,
                file_size: form.file_size !== "" ? Number(form.file_size) : null,
                file_path: form.file_path || null,
                file_module: form.file_module || null,
                status: form.status || null,
                description: form.description || null,
                checksum: form.checksum || null,
                expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
                is_public: Boolean(form.is_public),
                video_id: form.video_id || null,
                created_by: form.created_by?.id || null,
                updated_by: form.updated_by?.id || null,
            };

            if (dialogMode === "create") {
                const res = await httpClient.insertForm({ table: "upload_files", data });
                if (res?.data?.error === false && res?.data?.statusCode === 200) {
                    showSuccessRef.current?.("File record created");
                    setDialogOpen(false);
                    loadFiles();
                } else {
                    showErrorRef.current?.(res?.data?.message || "Failed to create");
                }
            } else {
                const res = await httpClient.updateForm({ table: "upload_files", id: activeRow.id, data });
                if (res?.data?.error === false && res?.data?.statusCode === 200) {
                    showSuccessRef.current?.("File record updated");
                    setDialogOpen(false);
                    loadFiles();
                } else {
                    showErrorRef.current?.(res?.data?.message || "Failed to update");
                }
            }
        } catch (err) {
            showErrorRef.current?.(err?.response?.data?.message || err.message || "Failed to save");
        } finally {
            hideLoaderRef.current?.();
        }
    };

    // ── Table columns ─────────────────────────────────────────────────────────

    const columns = useMemo(() => [
        {
            field: "file_name",
            headerName: "File",
            minWidth: 260,
            renderCell: ({ row }) => (
                <Box>
                    <Stack direction="row" spacing={0.75} alignItems="center">
                        <InsertDriveFileOutlinedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        <Typography sx={{ fontWeight: 600, fontSize: 13.5 }}>{row.file_name}</Typography>
                    </Stack>
                    <Typography sx={{ color: "text.secondary", fontSize: 12, ml: 2.75 }}>
                        {row.mime_type || "-"} {row.extension ? `· .${row.extension}` : ""}
                    </Typography>
                </Box>
            ),
        },
        {
            field: "file_module",
            headerName: "Module",
            minWidth: 140,
            renderCell: ({ value }) => (
                <Chip
                    size="small"
                    label={value || "—"}
                    sx={{ borderRadius: 1.5, fontWeight: 600, textTransform: "capitalize" }}
                />
            ),
        },
        {
            field: "file_type",
            headerName: "Type",
            minWidth: 110,
            renderCell: ({ value }) => (
                <Typography sx={{ textTransform: "capitalize", fontSize: 13 }}>{value || "-"}</Typography>
            ),
        },
        {
            field: "file_size",
            headerName: "Size",
            minWidth: 100,
            renderCell: ({ value }) => (
                <Typography sx={{ fontSize: 13 }}>{formatBytes(value)}</Typography>
            ),
        },
        {
            field: "status",
            headerName: "Status",
            minWidth: 120,
            renderCell: ({ value }) => (
                <Chip size="small" label={value || "unknown"} color={buildStatusColor(value)}
                    sx={{ textTransform: "capitalize", fontWeight: 600 }} />
            ),
        },
        {
            field: "is_public",
            headerName: "Public",
            minWidth: 90,
            renderCell: ({ value }) => (
                <Chip size="small"
                    label={value ? "Yes" : "No"}
                    color={value ? "info" : "default"}
                    sx={{ fontWeight: 600 }} />
            ),
        },
        {
            field: "_created_by_label",
            headerName: "Uploaded By",
            minWidth: 180,
            renderCell: ({ value }) => (
                <Typography sx={{ fontSize: 13 }}>{value || "-"}</Typography>
            ),
        },
        {
            field: "created_at",
            headerName: "Date",
            minWidth: 160,
            renderCell: ({ value }) => (
                <Typography sx={{ fontSize: 13 }}>{formatDateTime(value)}</Typography>
            ),
        },
        {
            field: "_actions",
            headerName: "Actions",
            minWidth: 100,
            pinned: "right",
            sortable: false,
            renderCell: ({ row }) => (
                <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Edit">
                        <IconButton size="small" onClick={() => handleEdit(row)}>
                            <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                        <IconButton size="small" color="error" onClick={() => handleDeletePrompt(row)}>
                            <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Stack>
            ),
        },
    ], []);

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <Box p={1} mt={1.5}>
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
                }}
            >
                {/* Header */}
                <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between"
                    alignItems={{ md: "center" }} spacing={2} mb={2.5}>
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
                            <CloudUploadIcon sx={{ color: "var(--primary)" }} />
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>
                                File Upload Manager
                            </Typography>
                        </Stack>
                        <Typography sx={{ color: "text.secondary" }}>
                            Track and manage uploaded file records across modules.
                        </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} alignItems="center">
                        <Chip
                            label={`${rows.length} ${rows.length === 1 ? "file" : "files"}`}
                            sx={{ borderRadius: 2, px: 1, fontWeight: 600 }}
                        />
                        <Button
                            variant="contained"
                            size="small"
                            startIcon={<AddIcon />}
                            onClick={handleCreate}
                            sx={{ borderRadius: 2 }}
                        >
                            New File Record
                        </Button>
                    </Stack>
                </Stack>

                {/* Filters */}
                <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} mb={2} flexWrap="wrap">
                    <TextField
                        size="small"
                        label="Search files"
                        placeholder="file name, module, path…"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        sx={{ minWidth: 260, flex: 1 }}
                    />

                    <TextField
                        select
                        size="small"
                        label="Module"
                        value={moduleFilter}
                        onChange={(e) => setModuleFilter(e.target.value)}
                        sx={{ minWidth: 180 }}
                    >
                        <MenuItem value="">All Modules</MenuItem>
                        {moduleOptions.map((m) => (
                            <MenuItem key={m} value={m} sx={{ textTransform: "capitalize" }}>{m}</MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        select
                        size="small"
                        label="Status"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        sx={{ minWidth: 160 }}
                    >
                        <MenuItem value="">All Statuses</MenuItem>
                        {STATUS_OPTIONS.map((s) => (
                            <MenuItem key={s} value={s} sx={{ textTransform: "capitalize" }}>{s}</MenuItem>
                        ))}
                    </TextField>
                </Stack>

                {/* Table */}
                <DataTableV2
                    rows={rows}
                    columns={columns}
                    serverSide={false}
                    loading={loading}
                    hideColumnSettings
                    hideSearch
                    checkboxSelection={false}
                    defaultPageSize={10}
                    pageSizeOptions={[10, 25, 50]}
                    tableKey="upload-files-table"
                    emptySubtitle="No file records found. Click 'New File Record' to add one."
                />
            </Paper>

            {/* Create / Edit Modal */}
            <FileFormDialog
                open={dialogOpen}
                mode={dialogMode}
                initialData={activeRow}
                userOptions={userOptions}
                onUserSearch={loadUsers}
                onClose={() => setDialogOpen(false)}
                onSave={handleSave}
            />

            {/* Delete Confirm */}
            <DeleteConfirmDialog
                open={deleteDialog.open}
                row={deleteDialog.row}
                onClose={() => setDeleteDialog({ open: false, row: null })}
                onConfirm={handleDeleteConfirm}
            />
        </Box>
    );
}
