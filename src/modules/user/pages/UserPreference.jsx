import React, { useRef, useState } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Divider,
    Switch,
    FormControlLabel,
    Stack,
    Tabs,
    Tab,
    List,
    ListItemButton,
} from "@mui/material";

import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { profileSchema } from "../../../validations/userProfile.validation";
import ProfileAvatar from "../../../components/user/userPreference/ProfileAvatar";
import DashboardCustomizer from "../../../components/dashboard/admin/DashboardCustomizer";

export default function UserPreference() {
    const sections = {
        general: useRef(null),
        security: useRef(null),
        preferences: useRef(null),
    };

    const [active, setActive] = useState("general");
    const [tab, setTab] = useState(0);

    const {
        control,
        handleSubmit,
        watch,
    } = useForm({
        resolver: yupResolver(profileSchema),
        defaultValues: {
            name: "Selva Raj",
            email: "selva@mail.com",
            phone: "9876543210",
            notifications: true,
            avatar: null,
        },
    });

    const onSubmit = (data) => {
        const payload = new FormData();
        Object.entries(data).forEach(([k, v]) => payload.append(k, v?.file ?? v));

        console.log("API PAYLOAD", data);
        // axios.put("/api/user/profile", payload)
    };

    const scrollTo = (key) => {
        sections[key].current.scrollIntoView({ behavior: "smooth" });
        setActive(key);
    };

    return (
        <Grid container spacing={3} alignItems="flex-start">
            {/* ============ LEFT SCROLL-SPY NAV ============ */}
            <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2, position: "sticky", top: 24 }}>
                    <ProfileAvatar
                        value={watch("avatar")}
                        onChange={(v) =>
                            control._formValues.avatar = v
                        }
                    />

                    <Divider sx={{ my: 2 }} />

                    <List dense>
                        {["general", "security", "preferences"].map((key) => (
                            <ListItemButton
                                key={key}
                                selected={active === key}
                                onClick={() => scrollTo(key)}
                            >
                                {key.toUpperCase()}
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>
            </Grid>

            {/* ============ RIGHT CONTENT ============ */}
            <Grid item xs={12} md={9}>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack spacing={4}>
                        {/* ---------- TABS ---------- */}
                        <Paper>
                            <Tabs value={tab} onChange={(_, v) => setTab(v)}>
                                <Tab label="General" />
                                <Tab label="Security" />
                                <Tab label="Preferences" />
                            </Tabs>
                        </Paper>

                        {/* ---------- GENERAL ---------- */}
                        <Paper ref={sections.general} sx={{ p: 3 }}>
                            <Typography variant="h6">General</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Controller
                                name="name"
                                control={control}
                                render={({ field, fieldState }) => (
                                    <TextField
                                        {...field}
                                        label="Full Name"
                                        fullWidth
                                        error={!!fieldState.error}
                                        helperText={fieldState.error?.message}
                                    />
                                )}
                            />

                            <Controller
                                name="email"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Email" fullWidth sx={{ mt: 2 }} />
                                )}
                            />

                            <Controller
                                name="phone"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} label="Phone" fullWidth sx={{ mt: 2 }} />
                                )}
                            />
                        </Paper>

                        {/* ---------- SECURITY ---------- */}
                        <Paper ref={sections.security} sx={{ p: 3 }}>
                            <Typography variant="h6">Security</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Controller
                                name="password"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} type="password" label="New Password" fullWidth />
                                )}
                            />

                            <Controller
                                name="confirmPassword"
                                control={control}
                                render={({ field }) => (
                                    <TextField {...field} type="password" label="Confirm Password" fullWidth sx={{ mt: 2 }} />
                                )}
                            />
                        </Paper>

                        {/* ---------- PREFERENCES ---------- */}
                        <Paper ref={sections.preferences} sx={{ p: 3 }}>
                            <Typography variant="h6">Preferences</Typography>
                            <Divider sx={{ my: 2 }} />

                            <Controller
                                name="notifications"
                                control={control}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={<Switch {...field} checked={field.value} />}
                                        label="Email Notifications"
                                    />
                                )}
                            />

                            <Divider sx={{ my: 2 }} />
                            <DashboardCustomizer role="admin" />
                        </Paper>

                        {/* ---------- ACTIONS ---------- */}
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                            <Button type="submit" variant="contained">
                                Save Changes
                            </Button>
                            <Button variant="outlined">Cancel</Button>
                        </Stack>
                    </Stack>
                </form>
            </Grid>
        </Grid>
    );
}
