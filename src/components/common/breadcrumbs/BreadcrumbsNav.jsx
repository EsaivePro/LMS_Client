import React from "react";
import { Box, Breadcrumbs, Typography, Link } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { useLocation, useNavigate } from "react-router-dom";

export default function BreadcrumbsNav() {
    const location = useLocation();
    const navigate = useNavigate();

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
                px: 3,
            }}
        >
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>

                <Link underline="hover" color="inherit" onClick={() => navigate("/")}>
                    Home
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
