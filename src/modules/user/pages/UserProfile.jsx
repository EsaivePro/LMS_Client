import React, { useEffect, useRef, useState } from "react";
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
import UserForm from "../../../components/user/UserForm";
import useUser from "../../../hooks/useUser";

export default function UserProfile() {
    const sections = {
        general: useRef(null),
        security: useRef(null),
        preferences: useRef(null),
    };
    const { fetchOne, userDetails } = useUser();
    const [active, setActive] = useState("general");
    const [tab, setTab] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [user, setUser] = useState(null);
    const userId = window.location.pathname.split("/").pop();

    useEffect(() => {
        fetchOne(userId);
    }, [userId]);

    useEffect(() => {
        if (userDetails?.length > 0) {
            setUser(userDetails[0] || null);
        }
    }, [userDetails]);
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
        <Box sx={{ width: "100%" }}>
            <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", px: 5 }}>
                <Box sx={{ width: '350px', mr: 3 }}>
                    <Paper sx={{ p: 2, position: "sticky", top: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
                            <ProfileAvatar
                                value={watch("avatar")}
                                onChange={(v) => (control._formValues.avatar = v)}
                            />
                        </Box>

                        <Divider sx={{ my: 2, width: '100%' }} />
                        <Box sx={{ alignSelf: 'stretch', borderBottom: 1, borderColor: "divider", pb: 1 }}>
                            <Typography>General Settings</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'left', width: '100%' }}>
                            About: Manage your profile details, privacy preferences, and notification settings from here. Update your name, email, and avatar to keep your account information up to date.
                        </Typography>
                    </Paper>
                </Box>
                <Box sx={{ flexGrow: 1 }}>
                    {user && (
                        <Box sx={{ width: '100%' }}>
                            <UserForm mode="edit" user={user} onCancel={() => setDrawerOpen(false)} onSuccess={() => setDrawerOpen(false)} profileMode={true} />
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
        // <Grid container spacing={3} alignItems="flex-start">
        //     {/* ============ LEFT SCROLL-SPY NAV ============ */}
        //     <Grid item xs={12} sm={4} md={3}>
        //         <Paper sx={{ p: 2, position: "sticky", top: 24, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        //             <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
        //                 <ProfileAvatar
        //                     value={watch("avatar")}
        //                     onChange={(v) => (control._formValues.avatar = v)}
        //                 />
        //             </Box>

        //             <Divider sx={{ my: 2, width: '100%' }} />
        //             <Box sx={{ alignSelf: 'stretch', borderBottom: 1, borderColor: "divider", pb: 1 }}>
        //                 <Typography>General Settings</Typography>
        //             </Box>
        //             <Typography variant="body2" color="text.secondary" sx={{ mt: 1, textAlign: 'left', width: '100%' }}>
        //                 About: Manage your profile details, privacy preferences, and notification settings from here. Update your name, email, and avatar to keep your account information up to date.
        //             </Typography>
        //         </Paper>
        //     </Grid>

        //     {/* ============ RIGHT CONTENT ============ */}
        //     <Grid item xs={12} sm={8} md={9} sx={{ width: "100%" }}>
        //         {user && (
        //             <Box sx={{ width: '100%' }}>
        //                 <UserForm mode="edit" user={user} onCancel={() => setDrawerOpen(false)} onSuccess={() => setDrawerOpen(false)} profileMode={true} />
        //             </Box>
        //         )}
        //     </Grid>
        // </Grid>
    );
}
