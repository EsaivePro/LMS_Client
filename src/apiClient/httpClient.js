import axiosInstance from "./axiosInstance";
import { API_ENDPOINTS } from "../constants";
export const httpClient = {

    // Athentication APIs
    loginUser: async (data) => axiosInstance.post(API_ENDPOINTS.LOGIN, data),
    logoutUser: async () => axiosInstance.post(API_ENDPOINTS.LOGOUT),
    refresh: async (refreshToken) => axiosInstance.post(API_ENDPOINTS.REFRESH, { refreshToken }),

    // Permission APIs
    fetchPermissionByUserId: async (id) => {
        const res = await axiosInstance.get(API_ENDPOINTS.FETCH_PERMISSION_BY_USERID + "/" + id);
        return res;
    },
    fetchAllPermissions: async () => axiosInstance.get(API_ENDPOINTS.GET_ALL_PERMISSIONS),

    // Role APIs
    fetchRolePermissionsById: async (id) => axiosInstance.get(API_ENDPOINTS.GET_ROLE_PERMISSIONS_BY_ID + "/" + id),
    fetchAllRoles: async () => axiosInstance.get(API_ENDPOINTS.GET_ALL_ROLES),
    createRole: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_ROLE, data),
    updateRole: async (id, data) => axiosInstance.put(API_ENDPOINTS.UPDATE_ROLE + "/" + id, data),
    deleteRole: async (id) => axiosInstance.delete(API_ENDPOINTS.DELETE_ROLE + "/" + id),

    // Course APIs
    fetchAllCourses: async () => axiosInstance.get(API_ENDPOINTS.GET_ALL_COURSES),
    fetchCourseDeatils: async (data) => axiosInstance.post(API_ENDPOINTS.GET_COURSE_DETAILS, data),
    createCourse: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_COURSE, data),
    updateCourse: async (id, data) => axiosInstance.put(API_ENDPOINTS.UPDATE_COURSE + "/" + id, data),
    deleteCourse: async (id) => axiosInstance.delete(API_ENDPOINTS.DELETE_COURSE + "/" + id),

    updateLessonProgress: async (data) => axiosInstance.patch(API_ENDPOINTS.UPDATE_LESSON_PROGRESS, data),
    updateCourseProgress: async (data) => axiosInstance.patch(API_ENDPOINTS.UPDATE_COURSE_PROGRESS, data),

    // Topic APIs
    createTopic: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_TOPIC, data),
    updateTopic: async (id, data) => axiosInstance.put(API_ENDPOINTS.UPDATE_TOPIC + "/" + id, data),
    deleteTopic: async (id) => axiosInstance.delete(API_ENDPOINTS.DELETE_TOPIC + "/" + id),

    // Lesson APIs
    createLesson: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_LESSON, data),
    updateLesson: async (id, data) => axiosInstance.put(API_ENDPOINTS.UPDATE_LESSON + "/" + id, data),
    deleteLesson: async (id) => axiosInstance.delete(API_ENDPOINTS.DELETE_LESSON + "/" + id),

    // User APIs
    fetchAllUsers: async () => axiosInstance.get(API_ENDPOINTS.GET_ALL_USERS),
    fetchUserById: async (id) => axiosInstance.get(API_ENDPOINTS.GET_USER_DETAILS + "/" + id),
    createUser: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_USER, data),
    updateUser: async (id, data) => axiosInstance.put(API_ENDPOINTS.UPDATE_USER + "/" + id, data),
    deleteUser: async (id) => axiosInstance.delete(API_ENDPOINTS.DELETE_USER + "/" + id),
};