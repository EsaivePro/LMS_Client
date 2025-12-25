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
};