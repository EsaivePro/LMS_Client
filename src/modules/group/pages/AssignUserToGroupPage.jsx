import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import {
    Box, Typography, Stack, Button, Autocomplete, TextField,
    Card, CardContent, CircularProgress, Alert, Chip,
    Dialog, DialogTitle, DialogContent, DialogActions, Divider,
    List, ListItem, ListItemIcon, ListItemText, Breadcrumbs, Link,
} from "@mui/material";
import SchoolIcon from "@mui/icons-material/School";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import GroupsIcon from "@mui/icons-material/Groups";
import { enrollmentApi } from "../../../services/enrollmentApi";
import useCommon from "../../../hooks/useCommon";
import { useAuth } from "../../../hooks/useAuth";
import ModuleTypeBadge from "../../../components/enrollment/ModuleTypeBadge";

// ── Step states ──────────────────────────────────────────────────
const STEP = { FORM: "form", PREVIEW: "preview", RESULT: "result" };

export default function AssignUserToGroupPage() {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const { showSuccess, showError } = useCommon();
    const { user: admin } = useAuth();

    const [selectedUser, setSelectedUser] = useState(null);
    const [userSearch, setUserSearch] = useState("");
    const [userOptions, setUserOptions] = useState([]);
    const [userLoading, setUserLoading] = useState(false);
    const [step, setStep] = useState(STEP.FORM);
    const [result, setResult] = useState(null);

    // Load group info
    const { data: group, isLoading: groupLoading } = useQuery({
        queryKey: ["group", groupId],
        queryFn: () => enrollmentApi.getGroupById(groupId),
        enabled: !!groupId,
    });

    // Load modules linked to this group (for preview)
    const { data: modules = [] } = useQuery({
        queryKey: ["group-modules", groupId],
        queryFn: () => enrollmentApi.getGroupModules(groupId),
        enabled: !!groupId,
    });
    const moduleList = Array.isArray(modules) ? modules : (modules?.data ?? []);

    // Debounced user search
    useEffect(() => {
        if (!userSearch) { setUserOptions([]); return; }
        const t = setTimeout(async () => {
            setUserLoading(true);
            try {
                const res = await enrollmentApi.getUsersList(userSearch);
                setUserOptions(Array.isArray(res) ? res : []);
            } catch { setUserOptions([]); }
            finally { setUserLoading(false); }
        }, 400);
        return () => clearTimeout(t);
    }, [userSearch]);

    // Assign + auto-enroll mutation
    const assignEnrollMutation = useMutation({
        mutationFn: async ({ user_id, autoEnroll }) => {
            // Step 1: assign to group
            await enrollmentApi.assignUserToGroup(groupId, user_id);
            // Step 2: auto-enroll (UC-10)
            if (autoEnroll) {
                const enrollResult = await enrollmentApi.autoEnrollGroup({
                    user_id,
                    group_id: groupId,
                    enrolled_by: admin?.id,
                });
                return { enrolled: true, enrollResult };
            }
            return { enrolled: false };
        },
        onSuccess: (data) => {
            setResult(data);
            setStep(STEP.RESULT);
        },
        onError: (err) => {
            showError(err?.message || "Assignment failed");
            setStep(STEP.FORM);
        },
    });

    // Assign-only mutation
    const assignOnlyMutation = useMutation({
        mutationFn: () => enrollmentApi.assignUserToGroup(groupId, selectedUser?.id ?? selectedUser?.user_id),
        onSuccess: () => {
            showSuccess(`${selectedUser?.first_name ?? "User"} assigned to group`);
            resetForm();
        },
        onError: (err) => showError(err?.message || "Assignment failed"),
    });

    const resetForm = () => {
        setSelectedUser(null);
        setUserSearch("");
        setStep(STEP.FORM);
        setResult(null);
    };

    const userName = selectedUser
        ? `${selectedUser.first_name ?? ""} ${selectedUser.last_name ?? ""}`.trim() || selectedUser.email
        : "";

    const groupName = group?.name ?? group?.group_name ?? `Group ${groupId}`;
    const linkedCategories = group?.module_categories ?? group?.categories ?? [];

    if (groupLoading) {
        return <Box sx={{ textAlign: "center", py: 8 }}><CircularProgress /></Box>;
    }

    return (
        <Box sx={{ p: 3 }}>
            <Breadcrumbs sx={{ mb: 2 }}>
                <Link underline="hover" color="inherit" onClick={() => navigate("/")} sx={{ cursor: "pointer" }}>Home</Link>
                <Link underline="hover" color="inherit" onClick={() => navigate("/groups/manage/list")} sx={{ cursor: "pointer" }}>Groups</Link>
                <Typography color="text.secondary">{groupId}</Typography>
                <Typography color="text.primary">Assign User</Typography>
            </Breadcrumbs>

            <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>Assign User to Group</Typography>

            {/* Group info card */}
            <Card variant="outlined" sx={{ mb: 3 }}>
                <CardContent>
                    <Stack direction="row" spacing={2} alignItems="center">
                        <GroupsIcon color="primary" sx={{ fontSize: 36 }} />
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle1" fontWeight={700}>{groupName}</Typography>
                            {group?.description && (
                                <Typography variant="body2" color="text.secondary">{group.description}</Typography>
                            )}
                        </Box>
                    </Stack>
                    {linkedCategories.length > 0 && (
                        <Box sx={{ mt: 1.5 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ mr: 1 }}>
                                Linked Categories:
                            </Typography>
                            {linkedCategories.map((c, i) => (
                                <Chip key={i} label={c.name ?? c} size="small" sx={{ mr: 0.5, mb: 0.5 }} />
                            ))}
                        </Box>
                    )}
                </CardContent>
            </Card>

            {/* Assignment form */}
            <Box sx={{ maxWidth: 500 }}>
                <Card variant="outlined">
                    <CardContent>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>Select User</Typography>
                        <Autocomplete
                            options={userOptions}
                            getOptionLabel={(o) => `${o.first_name ?? ""} ${o.last_name ?? ""} — ${o.email ?? ""}`.trim()}
                            loading={userLoading}
                            value={selectedUser}
                            onChange={(_, v) => setSelectedUser(v)}
                            onInputChange={(_, v) => setUserSearch(v)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search User *"
                                    size="small"
                                    InputProps={{
                                        ...params.InputProps,
                                        endAdornment: (
                                            <>
                                                {userLoading && <CircularProgress size={16} />}
                                                {params.InputProps.endAdornment}
                                            </>
                                        ),
                                    }}
                                />
                            )}
                        />
                    </CardContent>
                    <Divider />
                    <CardContent>
                        <Stack direction="row" spacing={2}>
                            <Button
                                variant="contained"
                                disabled={!selectedUser || assignEnrollMutation.isPending}
                                onClick={() => setStep(STEP.PREVIEW)}
                            >
                                Assign & Enroll
                            </Button>
                            <Button
                                variant="outlined"
                                disabled={!selectedUser || assignOnlyMutation.isPending}
                                onClick={() => assignOnlyMutation.mutate()}
                            >
                                {assignOnlyMutation.isPending ? "Assigning…" : "Assign Only"}
                            </Button>
                        </Stack>
                    </CardContent>
                </Card>
            </Box>

            {/* Preview Modal */}
            <Dialog open={step === STEP.PREVIEW} onClose={() => setStep(STEP.FORM)} maxWidth="sm" fullWidth>
                <DialogTitle>Confirm Group Assignment</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Assigning <strong>{userName}</strong> to group <strong>{groupName}</strong>.
                        {moduleList.length > 0
                            ? " The following enrollments will be created automatically:"
                            : " No modules are linked to this group yet."}
                    </Typography>
                    {moduleList.length > 0 && (
                        <List dense>
                            {moduleList.map((mod, i) => (
                                <ListItem key={mod.module_id ?? i} sx={{ py: 0.25 }}>
                                    <ListItemIcon sx={{ minWidth: 32 }}>
                                        {mod.module_type === "course"
                                            ? <SchoolIcon fontSize="small" color="primary" />
                                            : <DescriptionOutlinedIcon fontSize="small" color="warning" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={<><strong>{mod.module_title ?? mod.title ?? "—"}</strong>{" "}<ModuleTypeBadge type={mod.module_type} /></>}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={() => setStep(STEP.FORM)} disabled={assignEnrollMutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        disabled={assignEnrollMutation.isPending}
                        onClick={() =>
                            assignEnrollMutation.mutate({
                                user_id: selectedUser?.id ?? selectedUser?.user_id,
                                autoEnroll: true,
                            })
                        }
                    >
                        {assignEnrollMutation.isPending ? "Processing…" : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Result Dialog */}
            <Dialog open={step === STEP.RESULT} maxWidth="sm" fullWidth>
                <DialogTitle>Assignment Complete</DialogTitle>
                <DialogContent>
                    <List dense>
                        <ListItem sx={{ py: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: 32 }}>
                                <CheckCircleIcon color="success" />
                            </ListItemIcon>
                            <ListItemText primary={`${userName} assigned to group ${groupName}`} />
                        </ListItem>
                        {result?.enrolled && (
                            <ListItem sx={{ py: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    <CheckCircleIcon color="success" />
                                </ListItemIcon>
                                <ListItemText
                                    primary={`${result?.enrollResult?.count ?? moduleList.length} enrollment(s) created`}
                                />
                            </ListItem>
                        )}
                    </List>

                    {moduleList.length > 0 && result?.enrolled && (
                        <List dense sx={{ pl: 2 }}>
                            {moduleList.map((mod, i) => (
                                <ListItem key={i} sx={{ py: 0 }}>
                                    <ListItemText
                                        primary={`— ${mod.module_title ?? mod.title ?? "—"} (${mod.module_type ?? "—"})`}
                                        primaryTypographyProps={{ variant: "body2" }}
                                    />
                                </ListItem>
                            ))}
                        </List>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2, gap: 1 }}>
                    <Button variant="outlined" onClick={resetForm}>Assign Another User</Button>
                    <Button
                        variant="contained"
                        onClick={() => navigate(`/enrollment/user/${selectedUser?.id ?? selectedUser?.user_id}`)}
                    >
                        View User Enrollments
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}
