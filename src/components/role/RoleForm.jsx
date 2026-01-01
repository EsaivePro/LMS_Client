import React, { useEffect, useMemo } from "react";
import { Box, TextField, Button, Typography, Stack, Card, CardContent, FormControl, FormGroup, FormControlLabel, Checkbox } from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { useAdmin } from "../../hooks/useAdmin";

const Section = ({ title, children }) => (
    <Card variant="outlined" sx={{ width: "100%" }}>
        <Box sx={{ px: 3, py: 1.5, background: "var(--lightgrey)", borderBottom: "1px solid var(--lightgrey)" }}>
            <Typography fontWeight={600}>{title}</Typography>
        </Box>
        <CardContent sx={{ p: 3 }}>
            <Stack spacing={2}>{children}</Stack>
        </CardContent>
    </Card>
);

export default function RoleForm({ mode = "create", role = null, existingPermissions = [], onSave, onCancel }) {
    const { allPermissions } = useAdmin();

    const mapToIds = (arr) => (arr || []).map((p) => (p && typeof p === "object" && p.id !== undefined ? p.id : p));

    const { control, handleSubmit, reset, formState } = useForm({
        defaultValues: {
            name: role?.name || "",
            description: role?.description || "",
            permissions: mapToIds(existingPermissions) || [],
        },
    });

    useEffect(() => {
        reset({ name: role?.name || "", description: role?.description || "", permissions: mapToIds(existingPermissions) || [] });
    }, [role, existingPermissions]);

    const groupedPermissions = useMemo(() => {
        const list = allPermissions || [];
        return list.reduce((acc, p) => {
            const module = p?.module || "Other";
            if (!acc[module]) acc[module] = [];
            acc[module].push(p);
            return acc;
        }, {});
    }, [allPermissions]);

    const onSubmit = (data) => {
        const payload = { ...data };
        onSave?.(payload, mode === "copy" ? "create" : mode, role);
    };

    return (
        <Box component="form" onSubmit={handleSubmit(onSubmit)}>
            <Typography variant="h6" fontWeight={500} m={2}>
                {mode === "create" ? "Create Role" : mode === "copy" ? "Copy Role" : "Edit Role"}
            </Typography>

            <Stack spacing={3} sx={{ p: 2, pt: 0, pb: 0 }}>
                <Section title="Role Details">
                    <Controller name="name" control={control} render={({ field }) => (
                        <TextField {...field} label="Role Name *" size="small" fullWidth />
                    )} />
                    <Controller name="description" control={control} render={({ field }) => (
                        <TextField {...field} label="Description" size="small" fullWidth />
                    )} />
                </Section>

                <Section title="Permissions">
                    <Controller
                        name="permissions"
                        control={control}
                        render={({ field }) => (
                            <FormControl component="fieldset">
                                {Object.keys(groupedPermissions).map((module) => (
                                    <Box key={module} sx={{ mb: 2 }}>
                                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
                                            <Typography variant="subtitle2">{module}</Typography>
                                            {/* Module-level select all checkbox */}
                                            <Checkbox
                                                size="small"
                                                checked={(() => {
                                                    const ids = (groupedPermissions[module] || []).map((p) => p?.id ?? p);
                                                    const current = Array.isArray(field.value) ? field.value : [];
                                                    return ids.length > 0 && ids.every((id) => current.includes(id));
                                                })()}
                                                indeterminate={(() => {
                                                    const ids = (groupedPermissions[module] || []).map((p) => p?.id ?? p);
                                                    const current = Array.isArray(field.value) ? field.value : [];
                                                    const some = ids.some((id) => current.includes(id));
                                                    const all = ids.length > 0 && ids.every((id) => current.includes(id));
                                                    return some && !all;
                                                })()}
                                                onChange={(e) => {
                                                    const checkedAll = e.target.checked;
                                                    const ids = (groupedPermissions[module] || []).map((p) => p?.id ?? p);
                                                    const current = Array.isArray(field.value) ? [...field.value] : [];
                                                    let next;
                                                    if (checkedAll) next = [...new Set([...current, ...ids])];
                                                    else next = current.filter((id) => !ids.includes(id));
                                                    field.onChange(next);
                                                }}
                                            />
                                        </Box>

                                        <FormGroup>
                                            {groupedPermissions[module].map((p) => {
                                                const pid = p?.id ?? p;
                                                const checked = Array.isArray(field.value) && field.value.includes(pid);
                                                return (
                                                    <FormControlLabel
                                                        key={pid}
                                                        control={
                                                            <Checkbox
                                                                checked={checked}
                                                                onChange={(e) => {
                                                                    const isChecked = e.target.checked;
                                                                    const current = Array.isArray(field.value) ? [...field.value] : [];
                                                                    let next;
                                                                    if (isChecked) next = [...new Set([...current, pid])];
                                                                    else next = current.filter((id) => id !== pid);
                                                                    field.onChange(next);
                                                                }}
                                                            />
                                                        }
                                                        label={p?.label || p?.name || String(pid)}
                                                    />
                                                );
                                            })}
                                        </FormGroup>
                                    </Box>
                                ))}
                            </FormControl>
                        )}
                    />
                </Section>
            </Stack>

            <Box sx={{ position: "sticky", bottom: 0, mt: 4, background: "var(--surface)", borderTop: "1px solid var(--lightgrey)", boxShadow: "0 -4px 12px rgba(0,0,0,0.06)", zIndex: 10 }}>
                <Box sx={{ p: 1, display: "flex", gap: 2 }}>
                    <Button fullWidth variant="contained" type="submit">{mode === "create" ? "Add Role" : mode === "copy" ? "Create" : "Update Role"}</Button>
                    <Button fullWidth variant="outlined" onClick={onCancel}>Cancel</Button>
                </Box>
            </Box>
        </Box>
    );
}
