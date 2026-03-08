import React from "react";
import { Box, Breadcrumbs, Typography, Link, useTheme, useMediaQuery } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLocation, useNavigate } from "react-router-dom";

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
        <Box
            sx={{
                position: "fixed",
                top: 64,          // 👈 BELOW YOUR NAVBAR HEIGHT
                left: 0,
                right: 0,
                zIndex: 1000,
                bgcolor: "white",
                // borderBottom: "1px solid #e0e0e0",
                p: 1.5,
                px: isMobile ? 2.5 : 7.5,
                boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",

            }}
        >
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>

                <Link underline="hover" color="var(--primary)" onClick={() => navigate("/")}>
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
    );
}
