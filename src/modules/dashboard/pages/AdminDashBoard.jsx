import DashboardGrid from "../../../components/dashboard/DashboardGrid";
import DashboardCustomizer from "../../../components/dashboard/admin/DashboardCustomizer";
import { Box } from "@mui/material";
import { useEffect } from "react";
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminDashboard() {
    const { fetchEnrollCoursesByUser } = useEnrollment();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user?.id) {
            fetchEnrollCoursesByUser(user?.id);
        }
    }, [user, fetchEnrollCoursesByUser]);

    return (
        <Box>
            <DashboardGrid role="student" />
        </Box>
    );
}
