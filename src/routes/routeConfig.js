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
        description:
            "Provides a centralized overview of system activity, key metrics, user statistics, and quick insights to help administrators monitor platform performance efficiently.",
        permission: "dashboard.view",
        layoutProps: {},
        element: <AdminDashboard />,
    },
    {
        path: "/courses",
        title: "Course Management",
        description:
            "Allows administrators to browse, create, organize, update, and manage all courses, including course metadata, structure, and overall learning flow.",
        permission: "course.list",
        element: <CoursesList />,
    },
    {
        path: "/course/view/:id",
        title: "Course Details",
        description:
            "Displays detailed information about a selected course, including topics, lessons, progress tracking, and content structure for review and monitoring purposes.",
        permission: "course.view",
        layoutProps: { containerCard: false, courseCard: true },
        element: <CourseView />,
    },
    {
        path: "/course/edit/:id",
        title: "Edit Course",
        description:
            "Enables authorized users to modify course details, update topics and lessons, manage content structure, and ensure course information stays accurate and up to date.",
        permission: "course.edit",
        element: <CourseEdit />,
    },
    {
        path: "/usermanagement/*",
        title: "User Management",
        description:
            "Used to manage platform users by creating accounts, assigning roles, controlling permissions, and maintaining secure access across different system modules.",
        permission: "user.management",
        element: <UserManagement />,
    },
    {
        path: "/user/profile/:id",
        title: "User Profile",
        description:
            "Shows complete user profile information, including personal details, assigned roles, preferences, and activity data for review and administrative management.",
        permission: "user.profile.view",
        element: <UserProfile />,
    },
    {
        path: "/user/enrollment/*",
        title: "Enrollment Management",
        description:
            "Manages course enrollment operations such as assigning users to courses, handling bulk or individual enrollments, and tracking enrollment status effectively.",
        permission: "enrollment.management",
        element: <EnrollmentBase />,
    },
];
