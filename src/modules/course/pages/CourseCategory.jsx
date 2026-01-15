import React, { useEffect, useState } from "react";
import {
    Box,
    Button,
    TextField,
    Grid,
    MenuItem,
    Select,
    InputLabel,
    FormControl,
    Typography,
    IconButton,
} from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import useCommon from "../../../hooks/useCommon";
import { presignAndUploadFile } from "../../../services/awscloud/S3Services";
import DataTable from "../../../components/common/table/DataTable";
import ShowPopup from "../../../components/common/dialog/ShowPopup";
import SlideDialog from "../../../components/common/dialog/SlideDialog";
import Drawer from "@mui/material/Drawer";
import CourseAssignDrawer from "../../../components/course/CourseAssignDrawer";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useCategory from "../../../hooks/useCategory";
import { fetchCourses } from "../../../redux/slices/coursesSlice";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';

export default function CourseCategory() {
    const dispatch = useDispatch();
    const { categories, loadCategories, create, update, remove, assign, unassign, loadAssigned, assigned, loading } = useCategory();
    const { allCourses = [] } = useSelector((s) => s.courses || {});

    const [addOpen, setAddOpen] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [assignOpen, setAssignOpen] = useState(false);

    const [form, setForm] = useState({ title: "", description: "", enrollment_type: "manual", course_enroll: "daywise", imageurl: "", scheduled_start_at: "", scheduled_end_at: "" });
    const [editing, setEditing] = useState(null);

    const [currentCat, setCurrentCat] = useState(null);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedImageFile, setSelectedImageFile] = useState(null);
    const [selectedImageName, setSelectedImageName] = useState("");

    useEffect(() => {
        loadCategories().catch(() => { });
        if (!allCourses || allCourses.length === 0) dispatch(fetchCourses());
    }, []);

    const handleOpenAdd = () => {
        setForm({ title: "", description: "", enrollment_type: "manual", course_enroll: "daywise", imageurl: "" });
        setSelectedImageFile(null);
        setSelectedImageName("");
        setAddOpen(true);
    };

    const handleCreate = async () => {
        // if image selected, upload to s3 first
        try {
            if (selectedImageFile) {
                showLoader();
                const { cdnUrl } = await presignAndUploadFile({ file: selectedImageFile, key: `images/course-categories/${Date.now()}-${selectedImageFile.name}` });
                hideLoader();
                form.imageurl = cdnUrl;
            }
        } catch (e) {
            hideLoader();
            showError("Image upload failed");
            return;
        }
        const payload = { ...form };
        // if (payload.scheduled_start_at) payload.scheduled_start_at = new Date(payload.scheduled_start_at).toISOString();
        // if (payload.scheduled_end_at) payload.scheduled_end_at = new Date(payload.scheduled_end_at).toISOString();
        await create(payload).catch(() => { });
        setAddOpen(false);
    };

    const handleOpenEdit = (cat) => {
        setEditing(cat);
        setForm({
            title: cat.title || "",
            description: cat.description || "",
            enrollment_type: cat.enrollment_type || "manual",
            course_enroll: cat.course_enroll || "daywise",
            imageurl: cat.imageurl || "",
            scheduled_start_at: cat.scheduled_start_at || "",
            scheduled_end_at: cat.scheduled_end_at || "",
        });
        setSelectedImageFile(null);
        setSelectedImageName("");
        setEditOpen(true);
    };

    const handleUpdate = async () => {
        if (!editing) return;
        try {
            if (selectedImageFile) {
                showLoader();
                const { cdnUrl } = await presignAndUploadFile({ file: selectedImageFile, key: `images/course-categories/${editing.id || Date.now()}-${selectedImageFile.name}` });
                hideLoader();
                form.imageurl = cdnUrl;
            }
        } catch (e) {
            hideLoader();
            showError("Image upload failed");
            return;
        }
        const payload = { ...form };
        // if (payload.scheduled_start_at) payload.scheduled_start_at = new Date(payload.scheduled_start_at).toISOString();
        // if (payload.scheduled_end_at) payload.scheduled_end_at = new Date(payload.scheduled_end_at).toISOString();
        await update(editing.id, payload).catch(() => { });
        setEditOpen(false);
        setEditing(null);
    };

    const handleDelete = async (cat) => {
        if (!window.confirm(`Delete category ${cat.title}?`)) return;
        await remove(cat.id).catch(() => { });
    };

    const { showError, showLoader, hideLoader, showSuccess } = useCommon();

    function formatForDateTimeLocal(value) {
        if (!value) return "";
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return "";
        const pad = (n) => String(n).padStart(2, "0");
        const yyyy = d.getFullYear();
        const mm = pad(d.getMonth() + 1);
        const dd = pad(d.getDate());
        const hh = pad(d.getHours());
        const min = pad(d.getMinutes());
        return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }

    const getFilenameFromUrl = (url) => {
        if (!url) return "";
        try {
            const parts = url.split("/");
            return parts[parts.length - 1];
        } catch (e) {
            return url;
        }
    };

    const openAssignDialog = async (cat) => {
        // normalize: sometimes caller may pass the render param object
        const category = cat?.row ?? cat;
        const id = category?.id;
        if (!id) {
            showError("Category id is missing — cannot load assignments.");
            return;
        }
        setCurrentCat(category);
        await loadAssigned(id).catch(() => {
            showError("Failed to load assigned courses.");
        });
        setSelectedCourseId("");
        setAssignOpen(true);
    };

    const handleAssign = async () => {
        if (!currentCat || !selectedCourseId) return;
        await assign({ course_id: Number(selectedCourseId), course_category_id: currentCat.id }).catch(() => { });
        await loadAssigned(currentCat.id).catch(() => { });
        setSelectedCourseId("");
    };

    const handleUnassign = async (assignRow) => {
        const id = assignRow.assign_id || assignRow.id;
        if (!id) return;
        await unassign(id).catch(() => { });
        await loadAssigned(currentCat.id).catch(() => { });
    };

    const categoryColumns = [
        { field: "id", headerName: "ID", flex: 1, minWidth: 250, sortable: false, align: "center", maxWidth: 100 },
        { field: "title", headerName: "TITLE", flex: 1, minWidth: 250, sortable: false, align: "center", filterable: true, renderCell: ({ row }) => row.title },
        { field: "description", headerName: "DESCRIPTION", flex: 1, minWidth: 250, sortable: false, align: "center" },
        { field: "enrollment_type", headerName: "ENROLLMENT TYPE", flex: 1, minWidth: 250, sortable: false, align: "center" },
        { field: "scheduled_start_at", headerName: "START DATE", flex: 1, minWidth: 250, sortable: false, align: "center" },
        { field: "scheduled_end_at", headerName: "END DATE", flex: 1, minWidth: 250, sortable: false, align: "center" },
        {
            field: "actions",
            headerName: "ACTIONS",
            renderCell: ({ row }) => (
                <Box sx={{ display: "flex", gap: 1 }}>
                    <IconButton size="small" onClick={() => handleOpenEdit(row)}>
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" color="error" onClick={() => handleDelete(row)}>
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
        {
            field: "manage",
            headerName: "MANAGE",
            pinned: "left",
            flex: 1,
            maxWidth: 100,
            sortable: false,
            align: "center",
            renderCell: ({ row }) => (
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "start",
                        alignItems: "center",
                        gap: 1,
                        width: "100%",
                        height: "100%",
                    }}
                >
                    <IconButton
                        color="primary"
                        size="small"
                        onClick={() => openAssignDialog(row)}
                    >
                        <ManageAccountsIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    return (
        <Box p={2}>
            <Grid container alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
                <Grid item>
                    <Typography variant="h6">Course Categories</Typography>
                </Grid>
                <Grid item>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={handleOpenAdd}>
                        Add Category
                    </Button>
                </Grid>
            </Grid>

            <DataTable
                rows={categories}
                columns={categoryColumns}
                serverSide={false}
            />

            <SlideDialog open={addOpen} onClose={() => setAddOpen(false)} title="Add Course Category" onSubmit={handleCreate}>
                <Box sx={{ p: 1 }}>
                    <TextField label="Title" fullWidth sx={{ mb: 2 }} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                    <TextField label="Description" fullWidth multiline rows={3} sx={{ mb: 2 }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Enrollment Type</InputLabel>
                        <Select value={form.enrollment_type} label="Enrollment Type" onChange={(e) => setForm((p) => ({ ...p, enrollment_type: e.target.value }))}>
                            <MenuItem value="assigned">assigned</MenuItem>
                            <MenuItem value="daywise">daywise</MenuItem>
                            {/* <MenuItem value="scheduled">scheduled</MenuItem>
                            <MenuItem value="completionwise">completionwise</MenuItem>
                            <MenuItem value="all">all</MenuItem> */}
                        </Select>
                    </FormControl>
                    {form.enrollment_type === 'assigned' && (
                        <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>Note: Courses will be assigned manually after category creation.</Typography>
                    )}
                    {form.enrollment_type === 'daywise' && (
                        <Typography variant="caption" sx={{ mb: 2, display: 'block' }}>Note: Courses will be assigned dayswise after category assigned to user.</Typography>
                    )}
                    {form.enrollment_type === 'daywise' && (
                        <TextField label="Number of Days" type="number" fullWidth sx={{ mb: 2 }} value={form.number_of_days || ""} onChange={(e) => setForm((p) => ({ ...p, number_of_days: e.target.value }))} />
                    )}

                    {form.enrollment_type === 'scheduled' && (
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
                            <TextField
                                label="Start Date & Time"
                                type="datetime-local"
                                value={form.scheduled_start_at ? formatForDateTimeLocal(form.scheduled_start_at) : ''}
                                onChange={(e) => setForm((p) => ({ ...p, scheduled_start_at: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="End Date & Time"
                                type="datetime-local"
                                value={form.scheduled_end_at ? formatForDateTimeLocal(form.scheduled_end_at) : ''}
                                onChange={(e) => setForm((p) => ({ ...p, scheduled_end_at: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Box>
                    )}

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Course Enroll</InputLabel>
                        <Select aria-placeholder="Select the course enroll" value={form.course_enroll} label="Course Enroll" onChange={(e) => setForm((p) => ({ ...p, course_enroll: e.target.value }))}>
                            <MenuItem value="Free">Free</MenuItem>
                            {/* <MenuItem value="Paid">Paid</MenuItem> */}
                        </Select>
                    </FormControl>

                    <Box>
                        <input
                            type="file"
                            accept="image/*"
                            id="category-image-file"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                setSelectedImageFile(f || null);
                                setSelectedImageName(f ? f.name : "");
                            }}
                        />
                        <label htmlFor="category-image-file">
                            <Button variant="outlined" component="span">{selectedImageName || "Choose Image"}</Button>
                        </label>
                        {form.imageurl && !selectedImageName && (
                            <Typography variant="caption" sx={{ ml: 1 }}>{getFilenameFromUrl(form.imageurl)}</Typography>
                        )}
                    </Box>
                </Box>
            </SlideDialog>

            <SlideDialog open={editOpen} onClose={() => { setEditOpen(false); setSelectedImageFile(null); setSelectedImageName(""); }} title={editing ? `Edit: ${editing.title}` : "Edit Category"} onSubmit={handleUpdate}>
                <Box sx={{ p: 1 }}>
                    <TextField label="Title" fullWidth sx={{ mb: 2 }} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
                    <TextField label="Description" fullWidth multiline rows={3} sx={{ mb: 2 }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Enrollment Type</InputLabel>
                        <Select value={form.enrollment_type} label="Enrollment Type" onChange={(e) => setForm((p) => ({ ...p, enrollment_type: e.target.value }))}>
                            <MenuItem value="manual">manual</MenuItem>
                            <MenuItem value="paid">paid</MenuItem>
                            <MenuItem value="scheduled">scheduled</MenuItem>
                            <MenuItem value="assigned">assigned</MenuItem>
                        </Select>
                    </FormControl>

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Course Enroll</InputLabel>
                        <Select value={form.course_enroll} label="Course Enroll" onChange={(e) => setForm((p) => ({ ...p, course_enroll: e.target.value }))}>
                            <MenuItem value="daywise">daywise</MenuItem>
                            <MenuItem value="completionwise">completionwise</MenuItem>
                            <MenuItem value="all">all</MenuItem>
                        </Select>
                    </FormControl>
                    {form.enrollment_type === 'scheduled' && (
                        <Box sx={{ display: 'flex', gap: 2, flexDirection: { xs: 'column', md: 'row' }, mb: 2 }}>
                            <TextField
                                label="Start Date & Time"
                                type="datetime-local"
                                value={form.scheduled_start_at ? formatForDateTimeLocal(form.scheduled_start_at) : ''}
                                onChange={(e) => setForm((p) => ({ ...p, scheduled_start_at: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                            <TextField
                                label="End Date & Time"
                                type="datetime-local"
                                value={form.scheduled_end_at ? formatForDateTimeLocal(form.scheduled_end_at) : ''}
                                onChange={(e) => setForm((p) => ({ ...p, scheduled_end_at: e.target.value }))}
                                InputLabelProps={{ shrink: true }}
                                fullWidth
                            />
                        </Box>
                    )}
                    <Box>
                        <input
                            type="file"
                            accept="image/*"
                            id="category-image-file-edit"
                            style={{ display: "none" }}
                            onChange={(e) => {
                                const f = e.target.files?.[0];
                                setSelectedImageFile(f || null);
                                setSelectedImageName(f ? f.name : "");
                            }}
                        />
                        <label htmlFor="category-image-file-edit">
                            <Button variant="outlined" component="span">{selectedImageName || (form.imageurl ? "Current Image" : "Choose Image")}</Button>
                        </label>
                        {form.imageurl && !selectedImageName && (
                            <Typography variant="caption" sx={{ ml: 1 }}>{getFilenameFromUrl(form.imageurl)}</Typography>
                        )}
                    </Box>
                </Box>
            </SlideDialog>

            <Drawer
                anchor="right"
                open={assignOpen}
                onClose={() => setAssignOpen(false)}
                disableEscapeKeyDown
                PaperProps={{ sx: { width: { xs: '100%', md: '50%' }, maxWidth: '100%', top: { xs: '56px', md: '64px' }, height: { xs: 'calc(100% - 56px)', md: 'calc(100% - 64px)' } } }}
                ModalProps={{ BackdropProps: { onClick: (e) => e.stopPropagation() } }}
            >
                <CourseAssignDrawer
                    open={assignOpen}
                    onClose={() => setAssignOpen(false)}
                    category={currentCat}
                    courses={allCourses}
                    assigned={currentCat ? (assigned[currentCat.id] || []) : []}
                    onAssign={async (payload) => {
                        await assign(payload).catch(() => { });
                        await loadAssigned(currentCat.id).catch(() => { });
                    }}
                    onUnassign={async (row) => {
                        await handleUnassign(row);
                    }}
                />
            </Drawer>
        </Box>
    );
}


