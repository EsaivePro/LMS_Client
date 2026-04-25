import DashboardGrid from "../../../components/dashboard/DashboardGrid";
import { Box } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { enrollmentApi } from "../../../services/enrollmentApi";
import { useAuth } from "../../../hooks/useAuth";

export default function AdminDashboard() {
    const { user } = useAuth();

    // Prefetch enrollments — CourseWidget reads from the same key (shared cache)
    useQuery({
        queryKey: ["user-enrollments", user?.id],
        queryFn: () => enrollmentApi.getUserEnrollments(user.id, { page: 1, limit: 10 }),
        enabled: !!user?.id,
        staleTime: 30_000,
    });

    return (
        <Box>
            <DashboardGrid role="student" />
        </Box>
    );
}
