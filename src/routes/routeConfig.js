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
import ExamPage from "../modules/exam/pages/ExamPage";
import ExamSummaryPage from "../modules/exam/pages/ExamSummaryPage";
import QuestionManage from "../modules/forms/pages/QuestionManage";
import SectionManage from "../modules/forms/pages/SectionManage";
import TopicManage from "../modules/forms/pages/TopicManage";

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
        path: "/coursecategory",
        title: "Course Categories",
        description: "Manage course categories and assign courses to categories.",
        permission: "coursecategory.manage",
        element: <CourseCategory />,
    },

    {
        path: "/groups",
        title: "Groups",
        description: "Manage groups and assign users to groups.",
        permission: "group.management",
        element: <GroupPage />,
    },

    {
        path: "/groups/assign",
        title: "Assign Users to Group",
        description: "Assign and unassign users for a selected group.",
        permission: "group.management",
        element: <GroupAssign />,
    },

    {
        path: "/usermanagement/*",
        title: "User Management",
        description: "Create users, assign roles, and manage access.",
        permission: "user.management",
        element: <UserManagement />,
    },

    {
        path: "/users/learing-insights",
        title: "User Learning Insights",
        description: "View enrollment and progress summary for users.",
        permission: "user.management",
        element: <UsersProgress />,
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

    {
        path: "/user/category/:categoryId",
        title: "Category Details",
        description: "View category enrollment and course progress for the current user.",
        permission: "course.view",
        element: <UserCategoryPage />,
    },

    {
        path: "/questions/bank",
        title: "Question Bank",
        description: "Create and manage exam questions and answers.",
        permission: "user.management",
        element: <QuestionsList />,
    },

    {
        path: "/questions/create",
        title: "Question Bank",
        description: "Create and manage exam questions and answers.",
        permission: "user.management",
        element: <QuestionCreate />,
    },
    {
        path: "/exam/:examid/user/:userid",
        title: "Exam",
        description: "Live mock test view for candidates.",
        permission: "user.management",
        layoutProps: { containerCard: false, footer: false, breadCurmbs: false, header: false },
        element: <ExamPage />,
    },
    {
        path: "/exam-summary/:examid",
        title: "Exam",
        description: "Live mock test view for candidates.",
        permission: "user.management",
        element: <ExamSummaryPage />,
    },
    {
        path: "/questions/manage/:id",
        title: "Manage question",
        description: "Create questions, assign options and schedule them.",
        permission: "user.management",
        element: <QuestionManage />,
    },
    {
        path: "/sections/manage/:id",
        title: "Manage section",
        description: "Create sections, assign questions and schedule them.",
        permission: "user.management",
        element: <SectionManage />,
    },
    {
        path: "/topics/manage/:id",
        title: "Manage topic",
        description: "Create topics, assign questions and schedule them.",
        permission: "user.management",
        element: <TopicManage />,
    },
    {
        path: "/exams/manage/:id",
        title: "Manage exam",
        description: "Create exams, assign questions and schedule them.",
        permission: "user.management",
        element: <ExamManage />,
    }
];
