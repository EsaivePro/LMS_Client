import DashboardGrid from "../../../components/dashboard/DashboardGrid";
import DashboardCustomizer from "../../../components/dashboard/admin/DashboardCustomizer";
import { Box } from "@mui/material";

export default function AdminDashboard() {
    return (
        <Box>
            <DashboardGrid role="admin" />
        </Box>
    );
}
