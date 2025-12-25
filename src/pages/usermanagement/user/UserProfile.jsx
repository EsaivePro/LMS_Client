import React, { useState } from "react";
import {
    Box,
    Grid,
    Paper,
    Typography,
    TextField,
    Button,
    Avatar,
    Divider,
    Switch,
    FormControlLabel,
    Stack,
    Chip,
} from "@mui/material";

import DashboardCustomizer from "../../../components/dashboard/admin/DashboardCustomizer";

export default function UserProfile() {
    const [formData] = useState({
        name: "Selva Raj",
        username: "selva.admin",
        email: "selva@mail.com",
        phone: "9876543210",
        role: "admin",
    });

    return (
        <Grid container spacing={3} alignItems="flex-start">
            {/* ================= LEFT PANEL ================= */}
            <Grid item xs={12} md={3}>
                <Paper
                    sx={{
                        p: 2.5,
                        position: "sticky",
                        top: 24,
                    }}
                >
                    <Stack spacing={2} alignItems="center">
                        <Avatar sx={{ width: 84, height: 84, fontSize: 30 }}>
                            SR
                        </Avatar>

                        <Box textAlign="center">
                            <Typography fontWeight={600}>
                                {formData.name}
                            </Typography>
                            <Chip
                                label={formData.role.toUpperCase()}
                                size="small"
                                sx={{ mt: 0.5 }}
                            />
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Typography fontWeight={600} gutterBottom>
                        General Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Manage profile, security, and preferences.
                    </Typography>
                </Paper>
            </Grid>

            {/* ================= RIGHT PANEL ================= */}
            <Grid item xs={12} md={9}>
                <Stack spacing={3}>
                    {/* ---------- PROFILE INFO ---------- */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Profile Information
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Full Name"
                                    value={formData.name}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Username"
                                    value={formData.username}
                                    disabled
                                    helperText="Username cannot be changed"
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Email Address"
                                    value={formData.email}
                                />
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    label="Phone Number"
                                    value={formData.phone}
                                />
                            </Grid>
                        </Grid>
                    </Paper>

                    {/* ---------- SECURITY ---------- */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Security
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Grid container spacing={2}>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="New Password"
                                />
                            </Grid>
                            <Grid item xs={12} md={6}>
                                <TextField
                                    fullWidth
                                    type="password"
                                    label="Confirm Password"
                                />
                            </Grid>
                        </Grid>

                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ mt: 1, display: "block" }}
                        >
                            Password must be at least 8 characters long.
                        </Typography>
                    </Paper>

                    {/* ---------- PREFERENCES ---------- */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Preferences
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <Stack spacing={1}>
                            <FormControlLabel
                                control={<Switch defaultChecked />}
                                label="Enable Email Notifications"
                            />
                            <FormControlLabel
                                control={<Switch />}
                                label="Dark Mode (Coming Soon)"
                            />
                        </Stack>
                    </Paper>

                    {/* ---------- DASHBOARD CUSTOMIZATION ---------- */}
                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" fontWeight={600}>
                            Dashboard Customization
                        </Typography>
                        <Divider sx={{ my: 2 }} />

                        <DashboardCustomizer
                            role={formData.role.toLowerCase()}
                        />
                    </Paper>

                    {/* ---------- ACTIONS ---------- */}
                    <Stack
                        direction="row"
                        spacing={2}
                        justifyContent="flex-end"
                    >
                        <Button variant="contained">
                            Save Changes
                        </Button>
                        <Button variant="outlined">
                            Cancel
                        </Button>
                    </Stack>
                </Stack>
            </Grid>
        </Grid>
    );
}
