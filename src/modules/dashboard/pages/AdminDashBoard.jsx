import DashboardGrid from "../../../components/dashboard/DashboardGrid";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi } from "../../../services/enrollmentApi";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminDashboard() {
    const { user } = useAuth();
    return (
        <Box>
            <DashboardGrid role="student" />
        </Box>
    );
}
