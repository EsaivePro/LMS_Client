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
    // V2 enrollment-service APIs (new table structure)
    GET_COURSE_DETAILS_V2: "/enrollment-service/course",   // append /:courseId/details (POST)
    UPDATE_CONTENT_PROGRESS: "/enrollment-service/content/progress",
    UPDATE_COURSE_PROGRESS_V2: "/enrollment-service/course/progress",

    // Category-service APIs
    GET_ALL_CATEGORIES: "/category-service/get-categories",
    GET_CATEGORY_BY_ID: "/category-service",
    CREATE_CATEGORY: "/category-service/create-category",
    UPDATE_CATEGORY: "/category-service",
    DELETE_CATEGORY: "/category-service",
    ASSIGN_COURSE: "/category-service/assign-item",
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

    // Exam-service APIs
    GET_EXAMS: "/exam-service/exams",
    GET_EXAM: "/exam-service/exams/", // append :id
    CREATE_EXAM: "/exam-service/exams",
    UPDATE_EXAM: "/exam-service/exams/", // append :id
    DELETE_EXAM: "/exam-service/exams/", // append :id

    // Question bank - Topics & Sections
    GET_QB_TOPICS: "/exam-service/qb-topics",
    GET_QB_TOPIC: "/exam-service/qb-topics/", // append :id
    CREATE_QB_TOPIC: "/exam-service/qb-topics",
    UPDATE_QB_TOPIC: "/exam-service/qb-topics/", // append :id
    DELETE_QB_TOPIC: "/exam-service/qb-topics/", // append :id

    GET_QB_SECTIONS: "/exam-service/qb-sections",
    GET_QB_SECTION: "/exam-service/qb-sections/", // append :id
    CREATE_QB_SECTION: "/exam-service/qb-sections",
    UPDATE_QB_SECTION: "/exam-service/qb-sections/", // append :id
    DELETE_QB_SECTION: "/exam-service/qb-sections/", // append :id

    GET_QUESTIONS: "/exam-service/questions",
    GET_QUESTION: "/exam-service/questions/", // append :id
    CREATE_QUESTION: "/exam-service/questions",
    UPDATE_QUESTION: "/exam-service/questions/", // append :id
    DELETE_QUESTION: "/exam-service/questions/", // append :id

    GET_OPTIONS_BY_QUESTION: "/exam-service/questions/", // append :questionId/options
    CREATE_OPTION: "/exam-service/questions/", // append :questionId/options
    UPDATE_OPTION: "/exam-service/options/", // append :id
    DELETE_OPTION: "/exam-service/options/", // append :id

    GET_SCHEDULES_BY_EXAM: "/exam-service/exams/", // append :examId/schedules
    CREATE_SCHEDULE: "/exam-service/exams/", // append :examId/schedules
    UPDATE_SCHEDULE: "/exam-service/schedules/", // append :id
    DELETE_SCHEDULE: "/exam-service/schedules/", // append :id

    CREATE_ATTEMPT: "/exam-service/attempts",
    GET_ATTEMPT: "/exam-service/attempts/", // append :id
    UPDATE_ATTEMPT: "/exam-service/attempts/", // append :id
    GET_ATTEMPTS_BY_USER: "/exam-service/users/", // append :userId/attempts

    UPSERT_ANSWER: "/exam-service/attempts/", // append :attemptId/answers
    GET_ANSWERS_BY_ATTEMPT: "/exam-service/attempts/", // append :attemptId/answers

    UPSERT_RESULT: "/exam-service/results",
    GET_RESULT: "/exam-service/results/", // append :attemptId

    INSERT_FORM: "/form-service/insert",
    UPDATE_FORM: "/form-service/update", // append :id
    DELETE_FORM: "/form-service/delete", // append :id

    EXECUTE: "/v1/execute/", // append :id
};