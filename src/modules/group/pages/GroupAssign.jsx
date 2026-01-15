import React, { useEffect, useState, useMemo } from "react";
import { Box, Grid, Paper, List, ListItemButton, ListItemIcon, ListItemText, Checkbox, Button, Typography, FormControl, InputLabel, Select, MenuItem, Avatar, Divider, TextField, Stack } from "@mui/material";
import useGroup from "../../../hooks/useGroup";
import axiosInstance from "../../../apiClient/axiosInstance";
import useCommon from "../../../hooks/useCommon";

function not(a, b) {
    return a.filter((value) => !b.includes(value));
}

function intersection(a, b) {
    return a.filter((value) => b.includes(value));
}

export default function GroupAssign() {
    const { groups = [], loadGroups, loadAssignments, assign, unassign } = useGroup();
    const { showLoader, hideLoader, showSuccess, showError } = useCommon();

    const [groupId, setGroupId] = useState("");
    const [users, setUsers] = useState([]); // all users
    const [left, setLeft] = useState([]); // user ids available
    const [right, setRight] = useState([]); // user ids assigned
    const [checked, setChecked] = useState([]);
    const [initialRight, setInitialRight] = useState([]);
    const [assignmentMap, setAssignmentMap] = useState({}); // userId -> assignmentObj
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => { loadGroups().catch(() => { }); fetchUsers(); }, []);

    const fetchUsers = async () => {
        showLoader();
        try {
            const res = await axiosInstance.get(`/user/search?limit=10000`);
            const payload = res?.data?.response || {};
            const list = payload?.data || [];
            setUsers(list);
            setLeft(list.map((u) => u.id));
        } catch (e) {
            console.error(e);
        } finally {
            hideLoader();
        }
    };

    useEffect(() => {
        if (!groupId) {
            setLeft(users.map((u) => u.id));
            setRight([]);
            setInitialRight([]);
            setAssignmentMap({});
            return;
        }

        (async () => {
            showLoader();
            try {
                const res = await loadAssignments(groupId);
                const data = res?.data?.response ?? res?.data ?? res;
                const assigns = Array.isArray(data) ? data : [];
                const rightIds = assigns.map((a) => a.user_id);
                const map = {};
                assigns.forEach((a) => { map[a.user_id] = a; });
                setAssignmentMap(map);
                setRight(rightIds);
                setInitialRight(rightIds.slice());
                // left = all users not in right
                const leftIds = users.map((u) => u.id).filter((id) => !rightIds.includes(id));
                setLeft(leftIds);
            } catch (e) {
                console.error(e);
            } finally {
                hideLoader();
            }
        })();
    }, [groupId, users]);

    const leftChecked = intersection(checked, left);
    const rightChecked = intersection(checked, right);

    const handleToggle = (value) => () => {
        const currentIndex = checked.indexOf(value);
        const newChecked = [...checked];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        setChecked(newChecked);
    };

    const handleAllRight = () => {
        setRight(right.concat(left));
        setLeft([]);
    };

    const handleCheckedRight = () => {
        setRight(right.concat(leftChecked));
        setLeft(not(left, leftChecked));
        setChecked(not(checked, leftChecked));
    };

    const handleCheckedLeft = () => {
        setLeft(left.concat(rightChecked));
        setRight(not(right, rightChecked));
        setChecked(not(checked, rightChecked));
    };

    const handleAllLeft = () => {
        setLeft(left.concat(right));
        setRight([]);
    };

    const customList = (items) => {
        const filtered = items.filter((id) => {
            if (!searchQuery) return true;
            const u = users.find((x) => x.id === id) || {};
            const q = searchQuery.toLowerCase();
            return (String(u.username || "").toLowerCase().includes(q) || String(u.email || "").toLowerCase().includes(q));
        });

        return (
            <Paper sx={{ width: '90vw', height: 420, overflow: 'auto', p: 1, borderRadius: 2, backgroundColor: 'grey.200', boxShadow: 3 }} elevation={2}>
                <List dense component="div" role="list">
                    {filtered.map((id) => {
                        const user = users.find((u) => u.id === id) || { id, username: String(id), email: '' };
                        const labelId = `transfer-list-item-${id}-label`;
                        const initials = (user.username || user.email || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();

                        return (
                            <ListItemButton key={id} role="listitem" onClick={handleToggle(id)}>
                                <ListItemIcon>
                                    <Checkbox checked={checked.indexOf(id) !== -1} tabIndex={-1} disableRipple />
                                </ListItemIcon>
                                <ListItemIcon sx={{ minWidth: 40 }}>
                                    <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>{initials}</Avatar>
                                </ListItemIcon>
                                <ListItemText id={labelId} primary={user.username || user.email || `User ${id}`} secondary={user.email || ''} />
                            </ListItemButton>
                        );
                    })}
                </List>
            </Paper>
        );
    };

    const handleSave = async () => {
        if (!groupId) { showError('Select a group first'); return; }
        showLoader();
        try {
            // newly assigned = right - initialRight
            const newly = right.filter((id) => !initialRight.includes(id));
            for (const uid of newly) {
                await assign({ user_id: uid, course_category_id: Number(groupId) });
            }

            // removed = initialRight - right
            const removed = initialRight.filter((id) => !right.includes(id));
            for (const uid of removed) {
                const assignObj = assignmentMap[uid];
                const assignId = assignObj?.id;
                if (assignId) await unassign(assignId);
            }

            showSuccess('Assignments updated');
            // refresh assignments
            const res = await loadAssignments(groupId);
            const data = res?.data?.response ?? res?.data ?? res;
            const assigns = Array.isArray(data) ? data : [];
            const rightIds = assigns.map((a) => a.user_id);
            const map = {};
            assigns.forEach((a) => { map[a.user_id] = a; });
            setAssignmentMap(map);
            setRight(rightIds);
            setInitialRight(rightIds.slice());
            setLeft(users.map((u) => u.id).filter((id) => !rightIds.includes(id)));
        } catch (e) {
            console.error(e);
            showError('Failed to update assignments');
        } finally {
            hideLoader();
        }
    };

    return (
        <Box sx={{ minHeight: '100vh', width: '100%', py: 4, display: 'flex', justifyContent: 'center' }}>
            <Box sx={{ width: '100%', px: 2 }}>
                <Paper sx={{ p: 2 }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2} sx={{ mb: 2 }}>
                        <Box>
                            <Typography variant="h6">Assign Users to Group</Typography>
                            <Typography variant="body2" color="text.secondary">Select a group and move users between the lists to assign or unassign.</Typography>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            <FormControl sx={{ minWidth: 220 }}>
                                <InputLabel id="select-group-label">Group</InputLabel>
                                <Select labelId="select-group-label" value={groupId} label="Group" onChange={(e) => setGroupId(e.target.value)}>
                                    <MenuItem value="">Select</MenuItem>
                                    {groups.map((g) => <MenuItem key={g.id} value={g.id}>{g.name}</MenuItem>)}
                                </Select>
                            </FormControl>

                            <TextField size="small" placeholder="Search users" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                        </Box>
                    </Stack>
                    <Grid container spacing={2} sx={{ alignItems: 'center', justifyContent: 'center' }}>
                        <Grid item xs={12} md={4}>{customList(left)}</Grid>
                        <Grid item xs={12} md={2}>
                            <Grid container direction="column" sx={{ alignItems: 'center' }}>
                                <Button sx={{ my: 0.5 }} variant="contained" color="primary" size="small" onClick={handleAllRight} disabled={left.length === 0}>≫</Button>
                                <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleCheckedRight} disabled={leftChecked.length === 0}>&gt;</Button>
                                <Button sx={{ my: 0.5 }} variant="outlined" size="small" onClick={handleCheckedLeft} disabled={rightChecked.length === 0}>&lt;</Button>
                                <Button sx={{ my: 0.5 }} variant="contained" color="primary" size="small" onClick={handleAllLeft} disabled={right.length === 0}>≪</Button>
                            </Grid>
                        </Grid>
                        <Grid item xs={12} md={4}>{customList(right)}</Grid>
                    </Grid>

                    <Divider sx={{ my: 2 }} />

                    <Box sx={{ mt: 1, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={() => { setGroupId(''); setLeft(users.map((u) => u.id)); setRight([]); }}>Reset</Button>
                        <Button variant="contained" onClick={handleSave}>Save</Button>
                    </Box>
                </Paper>
            </Box>
        </Box>
    );
}
