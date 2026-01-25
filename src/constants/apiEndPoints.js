export const API_ENDPOINTS = {

    // Auth-service APIs
    LOGIN: "/auth-service/login",
    LOGOUT: "/auth-service/logout",
    REFRESH: "/auth-service/refresh",

    // Permission-service APIs
    FETCH_PERMISSION_BY_USERID: "permission-service/get-permissions",
    GET_ROLE_PERMISSIONS_BY_ID: "/permission-service/get-role-permissions",
    GET_ALL_ROLES: "/permission-service/get-all-roles",
    CREATE_ROLE: "/permission-service/create-role",
    UPDATE_ROLE: "/permission-service/update-role",
    DELETE_ROLE: "/permission-service/delete-role",
    GET_ALL_PERMISSIONS: "/permission-service/get-all-permissions",

    // Course-service APIs
    GET_ALL_COURSES: "/course-service/get-all-courses",
    GET_COURSE_DETAILS: "/course-service/get-course-details",
    CREATE_COURSE: "/course-service/create-course",
    UPDATE_COURSE: "/course-service/update-course",
    DELETE_COURSE: "/course-service/delete-course",
    UPDATE_LESSON_PROGRESS: "/course-service/topic/lesson/progress",
    UPDATE_COURSE_PROGRESS: "/course-service/course/progress",
    UPDATE_COURSE_FAVOURITE: "/course-service/user/course/favourite",
    CREATE_TOPIC: "/course-service/topic/create",
    UPDATE_TOPIC: "/course-service/topic/update",
    DELETE_TOPIC: "/course-service/topic/delete",
    CREATE_LESSON: "/course-service/topic/lesson/create",
    UPDATE_LESSON: "/course-service/topic/lesson/update",
    DELETE_LESSON: "/course-service/topic/lesson/delete",
    GET_USER_NOTES: "/course-service/user/notes/userid",
    ADD_USER_NOTES: "/course-service/user/notes/add",
    UPDATE_USER_NOTES: "/course-service/user/notes/update",
    DELETE_USER_NOTES: "/course-service/user/notes/delete",

    // User-service APIs
    GET_ALL_USERS: "/user-service/get-users",
    GET_USER_DETAILS: "/user-service/get-user-by-id",
    CREATE_USER: "/user-service/create-user",
    UPDATE_USER: "/user-service/update-user",
    DELETE_USER: "/user-service/delete-user",
    ENROLL_COURSE_CATEGORY: "/user-service/course/enroll/category",
    GET_ENROLLMENT_COURSES_BY_USER_ID: "/user-service/course/enrollments",
    GET_USER_COURSES: "/user-service/course/my",
    GET_USER_ENROLLED_CATEGORIES: "/user-service/course/enrolled-categories",

    //Enrollment-service APIs
    GET_ENROLLMENT_COURSES: "/enrollment-service/get-enrollment-courses",
    COURSE_MANUAL_ENROLLMENT: "/enrollment-service/course/manual",

    // Category-service APIs
    GET_ALL_CATEGORIES: "/category-service/get-categories",
    GET_CATEGORY_BY_ID: "/category-service",
    CREATE_CATEGORY: "/category-service/create-category",
    UPDATE_CATEGORY: "/category-service",
    DELETE_CATEGORY: "/category-service",
    ASSIGN_COURSE: "/category-service/assign-course",
    UNASSIGN_COURSE: "/category-service",
    GET_ASSIGNED_COURSES: "/category-service",

    // Group-service APIs
    GET_ALL_GROUPS: "/group-service/get-groups",
    GET_GROUP_BY_ID: "/group-service",
    CREATE_GROUP: "/group-service/create-group",
    UPDATE_GROUP: "/group-service",
    DELETE_GROUP: "/group-service",
    ASSIGN_USER_TO_GROUP: "/group-service/assign-user",
    UNASSIGN_USER_GROUP: "/group-service",
    GET_GROUP_ASSIGNMENTS: "/group-service",

};