import { Box, AppBar, Toolbar, Typography, Container, Avatar } from "@mui/material";
import { keyframes } from "@mui/system";
import React from "react";
import UserRegistration from "./UserRegistration";
import THEME from "../../constants/theme";

export default function RegistrationPage() {
    const fadeIn = keyframes`
        from { opacity: 0; transform: translateY(-8px); }
        to { opacity: 1; transform: translateY(0); }
    `;

    return (
        <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#ffffff' }}>
            <AppBar position="fixed" color="transparent" elevation={0} sx={{ bgcolor: '#e4e4e4' }}>
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <img src={THEME?.manifest?.icons?.[0]?.src ? `/${THEME.manifest.icons[0].src}` : '/logo/EsaiLogo.png'} alt={THEME?.manifest?.name || 'Esai'} width="150" />
                    </Box>
                </Toolbar>
            </AppBar>

            <Container sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: { xs: 8, sm: 8 } }}>
                <UserRegistration />
            </Container>

            <Box component="footer" sx={{ py: 1.5, textAlign: 'center', fontSize: '0.9rem', color: 'var(--onPrimary)', backgroundColor: "var(--primary)" }}>
                © {new Date().getFullYear()} LMS — All rights reserved.
            </Box>
        </Box>
    );
};