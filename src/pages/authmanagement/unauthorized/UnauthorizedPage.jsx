import React from "react";
import { useNavigate } from "react-router-dom";
import {
    Box,
    Paper,
    Typography,
    Button,
    Stack,
    SvgIcon,
    Alert,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";

export default function UnauthorizedPage() {
    const navigate = useNavigate();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", p: 2 }}>
            <Alert severity="error">You don't have access to view this page.</Alert>
            <br />
            <Button
                variant="contained"
                onClick={() => navigate(-1)}
            >
                Go Back
            </Button>
        </Box>
    );
}
