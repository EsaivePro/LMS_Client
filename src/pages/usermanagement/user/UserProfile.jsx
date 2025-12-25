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
    Stack
} from "@mui/material";

export default function UserProfile() {
    const [formData, setFormData] = useState({
        name: "Selva Raj",
        username: "selva.admin",
        email: "selva@mail.com",
        phone: "9876543210",
        role: "Admin",
    });

    return (
        <Grid container spacing={3}>
            {/* ---------- LEFT PANEL ---------- */}
            <Grid item xs={12} md={3}>
                <Paper sx={{ p: 2 }}>
                    <Stack spacing={2} alignItems="center">
                        <Avatar sx={{ width: 80, height: 80 }}>SR</Avatar>
                        <Typography fontWeight={600}>{formData.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                            {formData.role}
                        </Typography>
                    </Stack>

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1}>
                        <Typography fontWeight={600}>General Settings</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Manage your account information and preferences
                        </Typography>
                    </Stack>
                </Paper>
            </Grid>

            {/* ---------- RIGHT PANEL ---------- */}
            <Grid item xs={12} md={9}>
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
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                label="Email"
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

                    {/* ---------- SECURITY ---------- */}
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 4 }}>
                        Security
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2}>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="password" label="New Password" />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField fullWidth type="password" label="Confirm Password" />
                        </Grid>
                    </Grid>

                    {/* ---------- PREFERENCES ---------- */}
                    <Typography variant="h6" fontWeight={600} sx={{ mt: 4 }}>
                        Preferences
                    </Typography>

                    <Divider sx={{ my: 2 }} />

                    <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable Email Notifications"
                    />

                    {/* ---------- ACTIONS ---------- */}
                    <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                        <Button variant="contained">Save Changes</Button>
                        <Button variant="outlined">Cancel</Button>
                    </Stack>
                </Paper>
            </Grid>
        </Grid>
    );
}
