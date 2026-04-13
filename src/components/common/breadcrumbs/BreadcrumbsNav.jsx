import React from "react";
import { Box, Breadcrumbs, Typography, Link, useTheme, useMediaQuery, Fade } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import HomeIcon from "@mui/icons-material/Home";
import { useLocation, useNavigate } from "react-router-dom";
import HomeFilledIcon from '@mui/icons-material/HomeFilled';

export default function BreadcrumbsNav({ breadCurmbs = true }) {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const rawPathnames = location.pathname.split("/").filter((x) => x);
    const displayItems = rawPathnames
        .map((seg, idx) => ({ seg, idx }))
        .filter(({ seg }) => seg.toLowerCase() !== "manage");

    // Hide breadcrumbs on login or full-screen pages if needed
    if (location.pathname === "/login" || !breadCurmbs) return null;
    else if (!breadCurmbs) return null;
    return (
        <Fade in timeout={700}>
            <Box
                sx={{
                    position: "fixed",
                    top: 64,
                    left: 'var(--sidebar-offset, 0px)',
                    right: 0,
                    zIndex: 1000,
                    transition: 'left 0.3s ease',
                    bgcolor: "white",
                    p: 1.5,
                    px: isMobile ? 2.5 : 2.5,
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.13)",
                    borderRadius: 2,
                    animation: 'slideDownBreadcrumbs 0.7s cubic-bezier(.4,2,.6,1)',
                    // '@keyframes slideDownBreadcrumbs': {
                    //     '0%': { opacity: 0, transform: 'translateY(-24px) scale(0.98)' },
                    //     '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
                    // },
                }}
            >
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <Link underline="hover" color="var(--primary)" onClick={() => navigate("/")}
                        sx={{ display: 'flex', alignItems: 'center', fontWeight: 500, transition: 'color 0.3s' }}>
                        <HomeFilledIcon fontSize="small" sx={{ mr: 0.5, mt: -0.4, verticalAlign: 'middle' }} />
                        Dashboard
                    </Link>
                    {displayItems.map(({ seg, idx }, index) => {
                        const to = "/" + rawPathnames.slice(0, idx + 1).join("/");
                        const isLast = index === displayItems.length - 1;
                        return isLast ? (
                            <Typography key={to} color="text.primary" sx={{ fontWeight: 600 }}>
                                {decodeURI(seg)}
                            </Typography>
                        ) : (
                            <Link
                                key={to}
                                underline="hover"
                                color="inherit"
                                onClick={() => navigate(to)}
                            >
                                {decodeURI(seg)}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            </Box>
        </Fade>
    );
}
