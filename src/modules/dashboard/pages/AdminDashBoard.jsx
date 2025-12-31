import DashboardGrid from "../../../components/dashboard/DashboardGrid";
import DashboardCustomizer from "../../../components/dashboard/admin/DashboardCustomizer";
import { Box } from "@mui/material";
import { useEffect } from "react";
import useEnrollment from "../../../hooks/useEnrollment";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminDashboard() {
    const { fetchEnrollCoursesByUser, enrollmentCoursesByUser } = useEnrollment();
    const { user } = useAuth();

    useEffect(() => {
        if (user && user.id && enrollmentCoursesByUser.length === 0) {
            fetchEnrollCoursesByUser(user.id);
        }
    }, [user, fetchEnrollCoursesByUser, enrollmentCoursesByUser]);

    return (
        <Box>
            <DashboardGrid role="student" />
        </Box>
    );
}
