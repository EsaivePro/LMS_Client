import DashboardGrid from "../../../components/dashboard/DashboardGrid";
import DashboardCustomizer from "../../../components/dashboard/admin/DashboardCustomizer";
import { Box } from "@mui/material";

export default function StudentDashboard() {
    return (
        <Box>
            <DashboardCustomizer role="student" />
            <DashboardGrid role="student" />
        </Box>
    );
}