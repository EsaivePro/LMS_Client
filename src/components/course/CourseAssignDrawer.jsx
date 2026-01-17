import React, { useEffect } from "react";
import { Box, Typography, IconButton, Button, Grid, FormControl, InputLabel, Select, MenuItem, TextField } from "@mui/material";
import DataTable from "../common/table/DataTable";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import useCommon from "../../hooks/useCommon";
import DeleteIcon from "@mui/icons-material/Delete";

const schema = yup.object({
    course_id: yup.number().required("Course is required"),
    day: yup.number().min(0).nullable(),
    sortorder: yup.number().min(0).nullable(),
});

export default function CourseAssignDrawer({ open, onClose, category, courses = [], onAssign, assigned = [], onUnassign }) {
    const { showLoader, hideLoader, showSuccess, showError } = useCommon();

    const { control, handleSubmit, formState: { errors, isValid }, reset } = useForm({
        resolver: yupResolver(schema),
        mode: "onChange",
        defaultValues: { course_id: "", day: 0, sortorder: 0 },
    });

    useEffect(() => {
        reset({ course_id: "" });
    }, [category, reset]);

    const onSubmit = async (data) => {
        if (!category?.id) {
            showError("Category id missing — cannot assign.");
            return;
        }
        showLoader();
        try {
            await onAssign({ course_id: Number(data.course_id), course_category_id: category.id, day: Number(data.day) || 0, sortorder: Number(data.sortorder) || 0 });
            hideLoader();
            showSuccess("Course assigned successfully");
            // onClose();
        } catch (err) {
            hideLoader();
            showError(err?.message || "Failed to assign course");
        }
    };

    const assignedColumns = [
        { field: "assign_id", headerName: "Assign ID", flex: 0.5, maxWidth: 120 },
        { field: "course_id", headerName: "Course ID", flex: 1, minWidth: 180 },
        { field: "title", headerName: "Course Title", flex: 2, minWidth: 250, filterable: true },
        { field: "day", headerName: "Day", flex: 1, minWidth: 180 },
        { field: "sortorder", headerName: "Sort Order", flex: 1, minWidth: 250 },
        {
            field: "actions",
            headerName: "",
            renderCell: ({ row }) => (
                <IconButton size="small" color="error" onClick={() => onUnassign?.(row)}><DeleteIcon /></IconButton>
            ),
            maxWidth: 120,
        },
    ];

    return (
        <Box height="100%" width="100%" display="flex" flexDirection="column">
            <Box sx={{ p: 3, borderBottom: "1px solid var(--lightgrey)", display: "flex", background: "#eaeaea", justifyContent: "space-between", alignItems: "center" }}>
                <Typography fontWeight={700} variant="h6">{category ? `Assign To ${category.title}` : "Assign Course"}</Typography>
                <IconButton onClick={onClose}><CloseIcon /></IconButton>
            </Box>

            <Box sx={{ px: 3, pt: 2, pb: 2 }}>
                <Typography variant="subtitle1" fontWeight={600}>Assign a course</Typography>
                <Grid container spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                    <Grid item xs={12} md={9}>
                        <FormControl fullWidth sx={{ width: "400px" }} size="small" variant="outlined">
                            <InputLabel id="assign-course-label">Course</InputLabel>
                            <Controller
                                name="course_id"
                                control={control}
                                render={({ field }) => (
                                    <Select {...field} labelId="assign-course-label" label="Course" fullWidth size="small">
                                        <MenuItem value="">Select</MenuItem>
                                        {courses.map((c) => (
                                            <MenuItem key={c.id} value={c.id}>{c.title || c.name || `Course ${c.id}`}</MenuItem>
                                        ))}
                                    </Select>
                                )}
                            />
                            {errors.course_id && <Typography color="error" variant="caption">{errors.course_id.message}</Typography>}
                        </FormControl>
                    </Grid>
                    <Grid item xs={6} md={1}>
                        <Controller
                            name="day"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Day" type="number" size="small" fullWidth />
                            )}
                        />
                    </Grid>
                    <Grid item xs={6} md={2}>
                        <Controller
                            name="sortorder"
                            control={control}
                            render={({ field }) => (
                                <TextField {...field} label="Order" type="number" size="small" fullWidth />
                            )}
                        />
                    </Grid>
                </Grid>
            </Box>
            <Box sx={{ px: 3, flex: 1, overflow: "auto", background: "#eaeaea" }}><Box sx={{ my: 1 }}>
                <DataTable
                    rows={assigned || []}
                    columns={assignedColumns}
                    tableKey={`assigned-${category?.id || "none"}`}
                    serverSide={false}
                />
            </Box>
            </Box>

            <Box sx={{ position: "sticky", bottom: 0, background: "var(--surface)", borderTop: "1px solid var(--lightgrey)", boxShadow: "0 -4px 12px rgba(0,0,0,0.06)", zIndex: 10, p: 3 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <Button fullWidth variant="contained" onClick={handleSubmit(onSubmit)} disabled={!isValid} size="medium">Assign</Button>
                    </Grid>
                    <Grid item xs={6}>
                        <Button fullWidth variant="outlined" onClick={onClose} size="medium">Cancel</Button>
                    </Grid>
                </Grid>
            </Box>
        </Box>
    );
}
