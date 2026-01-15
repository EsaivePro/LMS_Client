import React, { useEffect, useState } from "react";
import { Box, Grid, Button, TextField, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import DataTable from "../../../components/common/table/DataTable";
import SlideDialog from "../../../components/common/dialog/SlideDialog";
import useGroup from "../../../hooks/useGroup";
import { useSelector } from "react-redux";
import AddIcon from '@mui/icons-material/Add';

export default function GroupPage() {
    const { groups, loadGroups, create, loading } = useGroup();
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({ name: "", description: "" });

    useEffect(() => { loadGroups().catch(() => { }); }, []);

    const handleCreate = async () => {
        await create(form).catch(() => { });
        setOpen(false);
    };

    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, minWidth: 80 },
        { field: 'name', headerName: 'Name', flex: 1, minWidth: 200, filterable: true },
        { field: 'description', headerName: 'Description', flex: 2, minWidth: 300 },
    ];

    return (
        <Box p={2}>
            <Grid container justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Grid item>
                    <Typography variant="h6">Groups</Typography>
                </Grid>
                <Grid item>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>Add Group</Button>
                </Grid>
            </Grid>

            <DataTable rows={groups} columns={columns} serverSide={false} />

            <SlideDialog open={open} onClose={() => setOpen(false)} title="Add Group" onSubmit={handleCreate}>
                <Box sx={{ p: 1 }}>
                    <TextField label="Name" fullWidth sx={{ mb: 1 }} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                    <TextField label="Description" fullWidth multiline rows={3} sx={{ mb: 1 }} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
                </Box>
            </SlideDialog>
        </Box>
    );
}
