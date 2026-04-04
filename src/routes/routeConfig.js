import AdminDashboard from "../modules/dashboard/pages/AdminDashBoard";
import CoursesList from "../modules/course/pages/CoursesList";
import CourseView from "../modules/course/pages/CourseView";
import CourseEdit from "../modules/course/pages/CourseEdit";
import CourseCategory from "../modules/course/pages/CourseCategory";
import GroupPage from "../modules/group/pages/GroupPage";
import GroupAssign from "../modules/group/pages/GroupAssign";
import UserManagement from "../modules/user/pages/UserManagement";
import UserProfile from "../modules/user/pages/UserProfile";
import EnrollmentBase from "../modules/enrollment/pages/EnrollmentBase";
import UsersProgress from "../modules/user/pages/UsersProgress";
import UserCategoryPage from "../pages/user/CategoryPage";
import QuestionManagement from "../modules/exam/pages/QuestionManagement";
import QuestionsList from "../modules/exam/pages/QuestionsList";
import QuestionCreate from "../modules/exam/pages/QuestionCreate";
import ExamManage from "../modules/forms/pages/ExamManage";
import GroupManage from "../modules/forms/pages/GroupManage";
import ExamPage from "../modules/exam/pages/ExamPage";
import ExamSummaryPage from "../modules/exam/pages/ExamSummaryPage";
import QuestionManage from "../modules/forms/pages/QuestionManage";
import SectionManage from "../modules/forms/pages/SectionManage";
import TopicManage from "../modules/forms/pages/TopicManage";
import UserGroupAssignManage from "../modules/forms/pages/UserGroupAssignManage";

// Icons for sidebar menu
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedIcon from "@mui/icons-material/Feed";
import CategoryIcon from "@mui/icons-material/Category";
import InsightsIcon from "@mui/icons-material/Insights";
import GroupsIcon from "@mui/icons-material/Groups";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import LabelIcon from "@mui/icons-material/Label";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import SegmentIcon from "@mui/icons-material/Segment";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

export const protectedRoutes = [
    // ─────────────────────────────────────────────
    // Dashboard
    // ─────────────────────────────────────────────
    {
        path: "/",
        title: "Dashboard",
        description: "View overall system status, key metrics, and quick insights.",
        permission: "dashboard.view",
        layoutProps: {},
        element: <AdminDashboard />,
        sideMenu: true,
        section: null,
        label: "Dashboard",
        icon: <DashboardIcon />,
        type: "item",
    },

    // ─────────────────────────────────────────────
    // Learning Section
    // ─────────────────────────────────────────────
    {
        path: "/course/view/:id",
        title: "Course Details",
        description: "View course information, lessons, and learning progress.",
        permission: "course.view",
        layoutProps: { containerCard: false, courseCard: true, footer: false },
        element: <CourseView />,
        sideMenu: false,
    },

    {
        path: "/course/edit/:id",
        title: "Edit Course",
        description: "Update course details, topics, and lessons.",
        permission: "course.edit",
        element: <CourseEdit />,
        sideMenu: false,
    },

    // User management
    {
        path: "/usermanagement/*",
        title: "User Management",
        description: "Create users, assign roles, and manage access.",
        permission: "user.management",
        element: <UserManagement />,
        sideMenu: true,
        section: "Users & Groups",
        label: "User Management",
        icon: <ManageAccountsIcon />,
        type: "item",
    },
    {
        path: "/groups/manage/:id",
        title: "Manage group",
        description: "Create groups and assign course categories.",
        permission: "group.management",
        element: <GroupManage />,
        sideMenu: true,
        sidePath: "/groups/manage/list",
        section: "Users & Groups",
        label: "Groups",
        icon: <GroupsIcon />,
        type: "item",
        matchPath: "/groups/manage",
    },
    {
        path: "/user/profile/:id",
        title: "User Profile",
        description: "View and manage user profile details and roles.",
        permission: "user.profile.view",
        element: <UserProfile />,
        sideMenu: false,
    },
    {
        path: "/user/enrollment/*",
        title: "Enrollment Management",
        description: "Assign users to courses and manage enrollments.",
        permission: "enrollment.management",
        element: <EnrollmentBase />,
        sideMenu: false,
    },
    // Report and analytics
    {
        path: "/users/learing-insights",
        title: "User Learning Insights",
        description: "View enrollment and progress summary for users.",
        permission: "user.management",
        element: <UsersProgress />,
        sideMenu: true,
        section: "Reports & Analytics",
        label: "Learning Insights",
        icon: <InsightsIcon />,
        type: "item",
    },
    // Category management
    {
        path: "/coursecategory",
        title: "Course Categories",
        description: "Manage course categories and assign courses to categories.",
        permission: "coursecategory.manage",
        element: <CourseCategory />,
        sideMenu: true,
        section: "Category management",
        label: "Category",
        icon: <CategoryIcon />,
        type: "item",
    },
    // ─────────────────────────────────────────────
    // Manage Configurations Section
    // ─────────────────────────────────────────────
    {
        path: "/topics/manage/:id",
        title: "Manage topic",
        description: "Create topics, assign questions and schedule them.",
        permission: "user.management",
        element: <TopicManage />,
        sideMenu: true,
        sidePath: "/topics/manage/list",
        section: "Manage Configurations",
        label: "Topics",
        icon: <LabelIcon />,
        type: "item",
        matchPath: "/topics/manage",
    },
    {
        path: "/courses",
        title: "Course Management",
        description: "View, create, and manage courses and their content.",
        permission: "course.list",
        element: <CoursesList />,
        sideMenu: true,
        section: "Manage Configurations",
        label: "Courses",
        icon: <FeedIcon />,
        type: "item",
    },
    {
        path: "/questions/manage/:id",
        title: "Manage question",
        description: "Create questions, assign options and schedule them.",
        permission: "user.management",
        element: <QuestionManage />,
        sideMenu: true,
        sidePath: "/questions/manage/list",
        section: "Manage Configurations",
        label: "Questions Bank",
        icon: <QuestionAnswerIcon />,
        type: "item",
        matchPath: "/questions/manage",
    },

    {
        path: "/sections/manage/:id",
        title: "Manage section",
        description: "Create sections, assign questions and schedule them.",
        permission: "user.management",
        element: <SectionManage />,
        sideMenu: true,
        sidePath: "/sections/manage/list",
        section: "Manage Configurations",
        label: "Sections",
        icon: <SegmentIcon />,
        type: "item",
        matchPath: "/sections/manage",
    },

    {
        path: "/exams/manage/:id",
        title: "Manage exam",
        description: "Create exams, assign questions and schedule them.",
        permission: "user.management",
        element: <ExamManage />,
        sideMenu: true,
        sidePath: "/exams/manage/list",
        section: "Manage Configurations",
        label: "Exams",
        icon: <AssignmentIcon />,
        type: "item",
        matchPath: "/exams/manage",
    },
    {
        path: "/user-group-assign/manage/:id",
        title: "Manage user group assign",
        description: "Assign users to groups and manage their status.",
        permission: "group.management",
        element: <UserGroupAssignManage />,
        sideMenu: false,
        sidePath: "/user-group-assign/manage/list",
        section: "Manage Configurations",
        label: "User Group Assign",
        icon: <PlaylistAddCheckIcon />,
        type: "item",
        matchPath: "/user-group-assign/manage",
    },

    // ─────────────────────────────────────────────
    // Internal/Hidden Routes (sideMenu: false)
    // ─────────────────────────────────────────────
    {
        path: "/questions/bank",
        title: "Question Bank",
        description: "Create and manage exam questions and answers.",
        permission: "user.management",
        element: <QuestionsList />,
        sideMenu: false,
    },

    {
        path: "/questions/create",
        title: "Question Bank",
        description: "Create and manage exam questions and answers.",
        permission: "user.management",
        element: <QuestionCreate />,
        sideMenu: false,
    },

    {
        path: "/exam/:examid/user/:userid",
        title: "Exam",
        description: "Live mock test view for candidates.",
        permission: "user.management",
        layoutProps: { containerCard: false, footer: false, breadCurmbs: false, header: false },
        element: <ExamPage />,
        sideMenu: false,
    },

    {
        path: "/exam-summary/:examid",
        title: "Exam",
        description: "Live mock test view for candidates.",
        permission: "user.management",
        element: <ExamSummaryPage />,
        sideMenu: false,
    },
];

// ═══════════════════════════════════════════════════════════════════════════
// Helper function to build sidebar menu from route config
// ═══════════════════════════════════════════════════════════════════════════
export const getMenuFromRoutes = () => {
    const menu = [];
    const seenSections = new Set();

    protectedRoutes.forEach((route) => {
        // Skip routes not meant for sidebar
        if (!route.sideMenu) return;

        // Add section header if not already added
        if (route.section && !seenSections.has(route.section)) {
            menu.push({
                type: "section",
                label: route.section,
            });
            seenSections.add(route.section);
        }

        // Add route as menu item
        menu.push({
            label: route.label,
            icon: route.icon,
            to: (route?.sidePath != null && route?.sidePath != "") ? route.sidePath : route.path,
            type: route.type || "item",
            role: route.permission,
            matchPath: route.matchPath,
        });
    });

    return menu;
};
