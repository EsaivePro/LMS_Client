import AdminDashboard from "../modules/dashboard/pages/AdminDashBoard";
import CoursesList from "../modules/course/pages/CoursesList";
import CourseView from "../modules/course/pages/CourseView";
import CourseEdit from "../modules/course/pages/CourseEdit";
import UserManagement from "../modules/user/pages/UserManagement";
import UserProfile from "../modules/user/pages/UserProfile";
import EnrollmentBase from "../modules/enrollment/pages/EnrollmentBase";

export const protectedRoutes = [
    {
        path: "/",
        title: "Dashboard",
        description: "View overall system status, key metrics, and quick insights.",
        permission: "dashboard.view",
        layoutProps: {},
        element: <AdminDashboard />,
    },
    {
        path: "/courses",
        title: "Course Management",
        description: "View, create, and manage courses and their content.",
        permission: "course.list",
        element: <CoursesList />,
    },
    {
        path: "/course/view/:id",
        title: "Course Details",
        description: "View course information, lessons, and learning progress.",
        permission: "course.view",
        layoutProps: { containerCard: false, courseCard: true, footer: false },
        element: <CourseView />,
    },
    {
        path: "/course/edit/:id",
        title: "Edit Course",
        description: "Update course details, topics, and lessons.",
        permission: "course.edit",
        element: <CourseEdit />,
    },
    {
        path: "/usermanagement/*",
        title: "User Management",
        description: "Create users, assign roles, and manage access.",
        permission: "user.management",
        element: <UserManagement />,
    },
    {
        path: "/user/profile/:id",
        title: "User Profile",
        description: "View and manage user profile details and roles.",
        permission: "user.profile.view",
        element: <UserProfile />,
    },
    {
        path: "/user/enrollment/*",
        title: "Enrollment Management",
        description: "Assign users to courses and manage enrollments.",
        permission: "enrollment.management",
        element: <EnrollmentBase />,
    },
];
