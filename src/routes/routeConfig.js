import FileUploadPage from "../pages/FileUploadPage";
import AdminDashboard from "../modules/dashboard/pages/AdminDashBoard";
import CoursesList from "../modules/course/pages/CoursesList";
import CourseView from "../modules/course/pages/CourseView";
import CourseViewV2 from "../modules/course/pages/CourseViewV2";
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
import QuestionsSectionManage from "../modules/forms/pages/QuestionsSectionManage";
import ContentsSectionManage from "../modules/forms/pages/ContentsSectionManage";
import TopicManage from "../modules/forms/pages/TopicManage";
import CourseManage from "../modules/forms/pages/CourseManage";
import ContentLibraryManage from "../modules/forms/pages/ContentLibraryManage";
import UserGroupAssignManage from "../modules/forms/pages/UserGroupAssignManage";
import RoleManage from "../modules/forms/pages/RoleManage";
import UserManage from "../modules/forms/pages/UserManage";
import ModuleCategoryManage from "../modules/forms/pages/ModuleCategoryManage";
import EnrollmentJobManage from "../modules/forms/pages/EnrollmentJobManage";
import AuditLogPage from "../modules/audit/pages/AuditLogPage";
import UploadFilesPage from "../modules/upload/pages/UploadFilesPage";
import VimeoDemoPage from "../pages/video/VimeoDemoPage";

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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import PeopleIcon from "@mui/icons-material/People";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import UserList from "../modules/user/pages/UsersList";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";

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
        path: "/course/view-2/:id",
        title: "Course Details",
        description: "View course information, lessons, and learning progress.",
        permission: "course.view",
        layoutProps: { containerCard: false, courseCard: true, footer: false },
        element: <CourseView />,
        sideMenu: false,
    },

    {
        path: "/course/view/:id",
        title: "Course Details V2",
        description: "View course information with Vimeo video player (new API structure).",
        permission: "course.view",
        layoutProps: { containerCard: false, courseCard: true, footer: false },
        element: <CourseViewV2 />,
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
        path: "/users/list",
        title: "User Management",
        description: "Create users, assign roles, and manage access.",
        permission: "user.management",
        element: <UserList />,
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
    // Role management
    {
        path: "/roles/manage/:id",
        title: "Manage role",
        description: "Create roles and assign permissions.",
        permission: "user.management",
        element: <RoleManage />,
        sideMenu: true,
        sidePath: "/roles/manage/list",
        section: "Roles & Permissions",
        label: "Roles",
        icon: <AdminPanelSettingsIcon />,
        type: "item",
        matchPath: "/roles/manage",
    },
    // Report and analytics
    {
        path: "/users/learing-insights",
        title: "User Learning Insights",
        description: "View enrollment and progress summary for users.",
        permission: "user.management",
        element: <UsersProgress />,
        sideMenu: true,
        section: "Reports/Analytics",
        label: "Learning Insights",
        icon: <InsightsIcon />,
        type: "item",
    },
    {
        path: "/audit/logs",
        title: "Audit Logs",
        description: "Review actions, status, and entity-level changes across the platform.",
        permission: "user.management",
        element: <AuditLogPage />,
        sideMenu: true,
        section: "Reports/Analytics",
        label: "Audit logs",
        icon: <ReceiptLongIcon />,
        type: "item",
    },
    {
        path: "/upload/files",
        title: "File Upload Manager",
        description: "Browse, add, edit, and remove tracked file records.",
        permission: "user.management",
        element: <UploadFilesPage />,
        sideMenu: true,
        section: "Reports/Analytics",
        label: "File Uploads",
        icon: <CloudUploadIcon />,
        type: "item",
    },
    {
        path: "/module-category/manage/:id",
        title: "Manage Module Category",
        description: "Create module categories and assign courses or exams with scheduling.",
        permission: "user.management",
        element: <ModuleCategoryManage />,
        sideMenu: true,
        sidePath: "/module-category/manage/list",
        section: "Assigns",
        label: "Category Assign",
        icon: <ViewModuleIcon />,
        type: "item",
        matchPath: "/module-category/manage"
    },

    {
        path: "/enrollment-job/manage/:id",
        title: "Manage Enrollment Jobs",
        description: "View and manage bulk enrollment jobs, their status, and execution progress.",
        permission: "enrollment.management",
        element: <EnrollmentJobManage />,
        sideMenu: true,
        sidePath: "/enrollment-job/manage/list",
        section: "Assigns",
        label: "Enrollment Jobs",
        icon: <WorkHistoryIcon />,
        type: "item",
        matchPath: "/enrollment-job/manage",
    },

    // ─────────────────────────────────────────────
    // Manage Configurations Section
    // ─────────────────────────────────────────────
    {
        path: "/topics/manage/:id",
        title: "Manage topic",
        description: "Create topics, assign questions and schedule them.",
        permission: "exam.management",
        element: <TopicManage />,
        sideMenu: true,
        sidePath: "/topics/manage/list",
        section: "General Configurations",
        label: "Topics",
        icon: <LabelIcon />,
        type: "item",
        matchPath: "/topics/manage"
    },
    {
        path: "/courses/manage/:id",
        title: "Manage course",
        description: "Create and update courses with image and description details.",
        permission: "course.list",
        element: <CourseManage />,
        sideMenu: true,
        sidePath: "/courses/manage/list",
        section: "Manage Courses",
        label: "Courses",
        icon: <FeedIcon />,
        type: "item",
        matchPath: "/courses/manage",
    },
    {
        path: "/content-library/manage/:id",
        title: "Manage content library",
        description: "Create and maintain reusable content assets, files, and visibility settings.",
        permission: "user.management",
        element: <ContentLibraryManage />,
        sideMenu: true,
        sidePath: "/content-library/manage/list",
        section: "Library",
        label: "Content Library",
        icon: <CategoryIcon />,
        type: "item",
        matchPath: "/content-library/manage",
    },
    {
        path: "/content-section/manage/:id",
        title: "Manage content section",
        description: "Create content sections, assign questions and schedule them.",
        permission: "user.management",
        element: <ContentsSectionManage />,
        sideMenu: true,
        sidePath: "/content-section/manage/list",
        section: "Manage Courses",
        label: "Content Sections",
        icon: <SegmentIcon />,
        type: "item",
        matchPath: "/content-section/manage",
    },
    {
        path: "/questions/manage/:id",
        title: "Manage question",
        description: "Create questions, assign options and schedule them.",
        permission: "exam.management",
        element: <QuestionManage />,
        sideMenu: true,
        sidePath: "/questions/manage/list",
        section: "Questions Bank",
        label: "Questions Bank",
        icon: <QuestionAnswerIcon />,
        type: "item",
        matchPath: "/questions/manage",
    },

    {
        path: "/questions-section/manage/:id",
        title: "Manage questions section",
        description: "Create questions sections, assign questions and schedule them.",
        permission: "exam.management",
        element: <QuestionsSectionManage />,
        sideMenu: true,
        sidePath: "/questions-section/manage/list",
        section: "Questions Bank",
        label: "Questions Section",
        icon: <SegmentIcon />,
        type: "item",
        matchPath: "/questions-section/manage",
    },

    {
        path: "/exams/manage/:id",
        title: "Manage exam",
        description: "Create exams, assign questions and schedule them.",
        permission: "exam.management",
        element: <ExamManage />,
        sideMenu: true,
        sidePath: "/exams/manage/list",
        section: "Manage Exams",
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
        permission: "exam.management",
        element: <QuestionsList />,
        sideMenu: false,
    },

    {
        path: "/questions/create",
        title: "Question Bank",
        description: "Create and manage exam questions and answers.",
        permission: "exam.management",
        element: <QuestionCreate />,
        sideMenu: false,
    },

    {
        path: "/exam/:examid/user/:userid",
        title: "Exam",
        description: "Live mock test view for candidates.",
        permission: "exam.management",
        layoutProps: { containerCard: false, footer: false, breadCurmbs: false, header: false },
        element: <ExamPage />,
        sideMenu: false,
    },

    {
        path: "/exam-summary/:examid",
        title: "Exam",
        description: "Live mock test view for candidates.",
        permission: "exam.management",
        element: <ExamSummaryPage />,
        sideMenu: false,
    },

    {
        path: "/demo",
        title: "Demo",
        description: "Demo video for the platform.",
        permission: "exam.management",
        element: <VimeoDemoPage />,
        sideMenu: false,
    },

    {
        path: "/video/vimeo-demo",
        title: "Vimeo Video Demo",
        description: "Standalone Vimeo video player demo page.",
        permission: "dashboard.view", // Or adjust as needed
        element: <VimeoDemoPage />,
        sideMenu: false,
        section: "Demo",
        label: "Vimeo Video Demo",
        icon: <LiveTvIcon />,
        type: "item",
    }
];

// ═══════════════════════════════════════════════════════════════════════════
// Helper function to build sidebar menu from route config
// ═══════════════════════════════════════════════════════════════════════════
export const getMenuFromRoutes = () => {
    const menu = [];
    const seenSections = new Set();
    const seenSubGroups = new Map(); // "section::subGroup" -> group object

    protectedRoutes.forEach((route) => {
        // Skip routes not meant for sidebar
        if (!route.sideMenu) return;

        // Add section header if not already added
        if (route.section && !seenSections.has(route.section)) {
            menu.push({ type: "section", label: route.section });
            seenSections.add(route.section);
        }

        const item = {
            label: route.label,
            icon: route.icon,
            to: (route?.sidePath != null && route?.sidePath != "") ? route.sidePath : route.path,
            type: "item",
            role: route.permission,
            matchPath: route.matchPath,
        };

        // If the route belongs to a sub-group, nest it inside a group entry
        if (route.subGroup) {
            const groupKey = `${route.section}::${route.subGroup}`;
            if (!seenSubGroups.has(groupKey)) {
                const group = {
                    type: "group",
                    label: route.subGroup,
                    icon: route.subGroupIcon || null,
                    role: route.permission,
                    children: [],
                };
                seenSubGroups.set(groupKey, group);
                menu.push(group);
            }
            seenSubGroups.get(groupKey).children.push(item);
        } else {
            menu.push(item);
        }
    });

    return menu;
};
