export const API_ENDPOINTS = {
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH: "/auth/refresh",
    FETCH_PERMISSION_BY_USERID: "/admin/role/fetchPermissionByUserId",

    GET_ROLE_PERMISSIONS_BY_ID: "/admin/role/getRolePermissionsById", // Get permission by role id
    GET_ALL_ROLES: "/admin/role/getAllRoles",
    CREATE_ROLE: "/admin/role/create",
    UPDATE_ROLE: "/admin/role/update",
    DELETE_ROLE: "/admin/role/delete",

    GET_ALL_PERMISSIONS: "/admin/role/getAllPermissions",

    GET_ALL_COURSES: "/courses/getAllCourses",
    GET_COURSE_DETAILS: "/courses/getCourseDetails",
    CREATE_COURSE: "/courses/createCourse",
    UPDATE_COURSE: "/courses/updateCourse",
    DELETE_COURSE: "/courses/deleteCourse",

    UPDATE_LESSON_PROGRESS: "/courses/topic/lesson/progress",
    UPDATE_COURSE_PROGRESS: "/courses/course/progress",

    UPDATE_COURSE_FAVOURITE: "/courses/user/course/favourite",

    CREATE_TOPIC: "/courses/topic/create",
    UPDATE_TOPIC: "/courses/topic/update",
    DELETE_TOPIC: "/courses/topic/delete",

    CREATE_LESSON: "/courses/topic/lesson/create",
    UPDATE_LESSON: "/courses/topic/lesson/update",
    DELETE_LESSON: "/courses/topic/lesson/delete"
    ,
    // User APIs
    GET_ALL_USERS: "/user/getUsers",
    GET_USER_DETAILS: "/user/getUserById",
    CREATE_USER: "/user/createuser",
    UPDATE_USER: "/user/updateuser",
    DELETE_USER: "/user/deleteuser",

    //Enrollment APIs
    GET_ENROLLMENT_COURSES: "/enrollment/getEnrollmentCourses",
    COURSE_MANUAL_ENROLLMENT: "/enrollment/course/manual",

    GET_ENROLLMENT_COURSES_BY_USER_ID: "/user/course/enrollments",
    // User notes APIs
    GET_USER_NOTES: "/courses/user/notes/userid",
    ADD_USER_NOTES: "/courses/user/notes/add",
    UPDATE_USER_NOTES: "/courses/user/notes/update",
    DELETE_USER_NOTES: "/courses/user/notes/delete",

};