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

    updateCourseFavourite: async (data) => axiosInstance.put(API_ENDPOINTS.UPDATE_COURSE_FAVOURITE, data),


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

    // Enrollment APIs
    getEnrollmentCourses: async () => axiosInstance.get(API_ENDPOINTS.GET_ENROLLMENT_COURSES),
    courseManualEnrollment: async (data) => axiosInstance.post(API_ENDPOINTS.COURSE_MANUAL_ENROLLMENT, data),
    getEnrollmentCoursesByUserId: async (userId) => axiosInstance.get(API_ENDPOINTS.GET_ENROLLMENT_COURSES_BY_USER_ID + "/" + userId),
    enrollUserToCourseCategory: async (userId, categoryId) => axiosInstance.post(`${API_ENDPOINTS.ENROLL_COURSE_CATEGORY}/${userId}/${categoryId}`),
    getUserCourses: async (userId, statuses) => {
        // statuses: string (comma separated) or array of strings
        let statusParam = '';
        if (Array.isArray(statuses)) {
            statusParam = statuses.join(',');
        } else if (typeof statuses === 'string' && statuses.trim() !== '') {
            statusParam = statuses;
        }
        const url = `${API_ENDPOINTS.GET_USER_COURSES}/${userId}${statusParam ? `?status=${encodeURIComponent(statusParam)}` : ''}`;
        return axiosInstance.get(url);
    },
    getUserEnrolledCourseCategory: async (userId) => axiosInstance.get(API_ENDPOINTS.GET_USER_ENROLLED_CATEGORIES + "/" + userId),
    getCourseCategoryAssignmentsForUser: async (userId, categoryId) => axiosInstance.get(`/user/course/category/${categoryId}/user/${userId}`),

    // Course Category APIs
    getAllCategories: async () => axiosInstance.get(API_ENDPOINTS.GET_ALL_CATEGORIES),
    getCategoryById: async (id) => axiosInstance.get(`${API_ENDPOINTS.GET_CATEGORY_BY_ID}/${id}/getCategory`),
    createCategory: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_CATEGORY, data),
    updateCategory: async (id, data) => axiosInstance.put(`${API_ENDPOINTS.UPDATE_CATEGORY}/${id}/updateCategory`, data),
    deleteCategory: async (id) => axiosInstance.delete(`${API_ENDPOINTS.DELETE_CATEGORY}/${id}/deleteCategory`),
    assignCourseToCategory: async (data) => axiosInstance.post(API_ENDPOINTS.ASSIGN_COURSE, data),
    unassignCourseById: async (id) => axiosInstance.delete(`${API_ENDPOINTS.UNASSIGN_COURSE}/${id}/assign-course`),
    getAssignedCourses: async (categoryId) => axiosInstance.get(`${API_ENDPOINTS.GET_ASSIGNED_COURSES}/${categoryId}/assigned-courses`),

    // Group APIs
    getAllGroups: async () => axiosInstance.get(API_ENDPOINTS.GET_ALL_GROUPS),
    getGroupById: async (id) => axiosInstance.get(`${API_ENDPOINTS.GET_GROUP_BY_ID}/${id}/getGroup`),
    createGroup: async (data) => axiosInstance.post(API_ENDPOINTS.CREATE_GROUP, data),
    updateGroup: async (id, data) => axiosInstance.put(`${API_ENDPOINTS.UPDATE_GROUP}/${id}/updateGroup`, data),
    deleteGroup: async (id) => axiosInstance.delete(`${API_ENDPOINTS.DELETE_GROUP}/${id}/deleteGroup`),
    assignUserToGroup: async (data) => axiosInstance.post(API_ENDPOINTS.ASSIGN_USER_TO_GROUP, data),
    unassignUserFromGroup: async (id) => axiosInstance.delete(`${API_ENDPOINTS.UNASSIGN_USER_GROUP}/${id}/assigned-user/delete`),
    getGroupAssignments: async (groupId) => axiosInstance.get(`${API_ENDPOINTS.GET_GROUP_ASSIGNMENTS}/${groupId}/assigned-user`),

    // User notes APIs
    getUserNotes: async (userId, courseId) => axiosInstance.get(`${API_ENDPOINTS.GET_USER_NOTES}/${userId}/courseid/${courseId}`),
    addUserNotes: async (data) => axiosInstance.post(API_ENDPOINTS.ADD_USER_NOTES, data),
    updateUserNotes: async (id, data) => axiosInstance.put(`${API_ENDPOINTS.UPDATE_USER_NOTES}/${id}`, data),
    deleteUserNotes: async (id) => axiosInstance.delete(`${API_ENDPOINTS.DELETE_USER_NOTES}/${id}`),

};