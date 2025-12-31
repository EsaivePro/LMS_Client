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
        description: "System overview and analytics",
        permission: "dashboard.view",
        layoutProps: {},
        element: <AdminDashboard />,
    },
    {
        path: "/courses",
        title: "Course Management",
        description: "Create and manage courses",
        permission: "course.list",
        element: <CoursesList />,
    },
    {
        path: "/course/view/:id",
        permission: "course.view",
        layoutProps: { containerCard: false, courseCard: true },
        element: <CourseView />,
    },
    {
        path: "/course/edit/:id",
        title: "Edit Course",
        permission: "course.edit",
        element: <CourseEdit />,
    },
    {
        path: "/usermanagement/*",
        title: "User Management",
        permission: "user.management",
        element: <UserManagement />,
    },
    {
        path: "/user/profile/:id",
        title: "User Profile",
        permission: "user.profile.view",
        element: <UserProfile />,
    },
    {
        path: "/user/enrollment/*",
        title: "Enrollment",
        permission: "enrollment.management",
        element: <EnrollmentBase />,
    },
];
