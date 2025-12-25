import React, { useEffect, useMemo } from "react";
import {
    Drawer,
    Box,
    Typography,
    TextField,
    Checkbox,
    FormControlLabel,
    Button,
    Divider,
    Paper,
    IconButton,
    Slide,
    Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { useForm, Controller } from "react-hook-form";
import { useAdmin } from "../../../hooks/useAdmin";

export default function RoleCreationDrawer({
    open,
    onClose,
    mode,
    roleData,
    onSave,
    existingPermissions = [],
}) {
    const { allPermissions } = useAdmin();

    const {
        control,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            name: "",
            description: "",
            permissions: [],
        },
    });

    /* ---------------------------------------------
       Map existingPermissions (key) -> permission IDs
    --------------------------------------------- */
    const existingPermissionIds = useMemo(() => {
        if (!existingPermissions?.length || !allPermissions?.length) return [];

        const existingKeys = new Set(existingPermissions.map((p) => p.key));

        return allPermissions
            .filter((p) => existingKeys.has(p.key))
            .map((p) => p.id);
    }, [existingPermissions, allPermissions]);

    /* ---------------------------------------------
       Load role data into form
    --------------------------------------------- */
    useEffect(() => {
        if (!open) return;

        reset({
            name:
                mode === "copy"
                    ? `${roleData?.name || ""} (Copy)`
                    : roleData?.name || "",
            description: roleData?.description || "",
            permissions:
                roleData?.permissions?.map((p) => p.id) ||
                existingPermissionIds ||
                [],
        });
    }, [open, mode, roleData, reset, existingPermissionIds]);

    /* ---------------------------------------------
       Group permissions by module
    --------------------------------------------- */
    const modules = useMemo(() => {
        const map = {};
        allPermissions.forEach((p) => {
            map[p.module] = map[p.module] || [];
            map[p.module].push(p);
        });
        return map;
    }, [allPermissions]);

    const selected = watch("permissions");

    /* ---------------------------------------------
       Toggle entire module
    --------------------------------------------- */
    const toggleModule = (module) => {
        const ids = modules[module].map((p) => p.id);
        const allSelected = ids.every((id) => selected.includes(id));

        setValue(
            "permissions",
            allSelected
                ? selected.filter((id) => !ids.includes(id))
                : Array.from(new Set([...selected, ...ids]))
        );
    };

    /* ---------------------------------------------
       Submit
    --------------------------------------------- */
    const onSubmit = async (data) => {
        await onSave(data, mode, roleData);
    };

    return (
        <Drawer
            anchor="right"
            open={open}
            TransitionComponent={Slide}
            PaperProps={{ sx: { width: { xs: "100%", md: 700 } } }}
        >
            <Box height="100%" display="flex" flexDirection="column">
                {/* Header */}
                <Box
                    sx={{
                        px: 3,
                        py: 2,
                        borderBottom: "1px solid #e5e7eb",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >
                    <Typography variant="h6" fontWeight={700}>
                        {mode === "edit"
                            ? "Edit Role"
                            : mode === "copy"
                                ? "Copy Role"
                                : "Create Role"}
                    </Typography>
                    <IconButton onClick={onClose}>
                        <CloseIcon />
                    </IconButton>
                </Box>

                <Box
                    component="form"
                    onSubmit={handleSubmit(onSubmit)}
                    sx={{ display: "flex", flexDirection: "column", flex: 1 }}
                >
                    {/* Scrollable content */}
                    <Box flex={1} overflow="auto" px={3} py={2}>
                        <Controller
                            name="name"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <TextField {...field} label="Role Name" fullWidth />
                            )}
                        />

                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => (
                                <TextField
                                    {...field}
                                    label="Description"
                                    fullWidth
                                    multiline
                                    rows={2}
                                    sx={{ mt: 2 }}
                                />
                            )}
                        />

                        <Typography fontWeight={700} mt={4}>
                            Permissions
                        </Typography>
                        <Divider sx={{ my: 1 }} />

                        {Object.keys(modules).map((module) => {
                            const ids = modules[module].map((p) => p.id);
                            const all = ids.every((id) => selected.includes(id));
                            const some = ids.some((id) => selected.includes(id));

                            return (
                                <Paper key={module} sx={{ p: 2, mb: 2 }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={all}
                                                indeterminate={some && !all}
                                                onChange={() => toggleModule(module)}
                                            />
                                        }
                                        label={<Typography fontWeight={600}>{module}</Typography>}
                                    />

                                    <Stack ml={3}>
                                        {modules[module].map((perm) => (
                                            <Controller
                                                key={perm.id}
                                                name="permissions"
                                                control={control}
                                                render={({ field }) => (
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={field.value.includes(perm.id)}
                                                                onChange={() =>
                                                                    field.onChange(
                                                                        field.value.includes(perm.id)
                                                                            ? field.value.filter(
                                                                                (x) => x !== perm.id
                                                                            )
                                                                            : [...field.value, perm.id]
                                                                    )
                                                                }
                                                            />
                                                        }
                                                        label={perm.label}
                                                    />
                                                )}
                                            />
                                        ))}
                                    </Stack>
                                </Paper>
                            );
                        })}
                    </Box>

                    {/* Sticky footer */}
                    <Box sx={{ px: 3, py: 2, borderTop: "1px solid #e5e7eb" }}>
                        <Stack direction="row" gap={2}>
                            <Button
                                variant="contained"
                                fullWidth
                                onClick={handleSubmit(onSubmit)}
                                disabled={!isValid}
                            >
                                {mode === "edit" ? "Update Role" : "Save Role"}
                            </Button>
                            <Button variant="outlined" fullWidth onClick={onClose}>
                                Cancel
                            </Button>
                        </Stack>
                    </Box>
                </Box>
            </Box>
        </Drawer>
    );
}
