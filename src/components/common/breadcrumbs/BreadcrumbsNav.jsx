import React from "react";
import { Box, Breadcrumbs, Typography, Link, useTheme, useMediaQuery } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLocation, useNavigate } from "react-router-dom";

export default function BreadcrumbsNav() {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const pathnames = location.pathname.split("/").filter((x) => x);

    // Hide breadcrumbs on login or full-screen pages if needed
    if (location.pathname === "/login") return null;

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

                {pathnames.map((value, index) => {
                    const to = "/" + pathnames.slice(0, index + 1).join("/");
                    const isLast = index === pathnames.length - 1;

                    return isLast ? (
                        <Typography key={to} color="text.primary" sx={{ fontWeight: 600 }}>
                            {decodeURI(value)}
                        </Typography>
                    ) : (
                        <Link
                            key={to}
                            underline="hover"
                            color="inherit"
                            onClick={() => navigate(to)}
                        >
                            {decodeURI(value)}
                        </Link>
                    );
                })}
            </Breadcrumbs>
        </Box>
    );
}
