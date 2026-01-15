import { httpClient } from "../apiClient/httpClient";
import useApiHandler from "../utils/apiHandler";

const { apiHandler, apiHandlerWithoutLoader } = useApiHandler();

export async function loginUserValidation(dispatch, data) {
    return await apiHandler(dispatch, httpClient.loginUser, data);
}

export async function logoutUser(dispatch) {
    return await apiHandler(dispatch, httpClient.logoutUser);
}

export async function refreshToken(dispatch, token) {
    return await apiHandler(dispatch, httpClient.refresh, token);
}

export async function permissionByUserId(dispatch) {
    return await apiHandler(dispatch, httpClient.fetchPermissionByUserId, 1);
}

export async function fetchAllRoles(dispatch) {
    return await apiHandler(dispatch, httpClient.fetchAllRoles);
}

export async function fetchRolePermissionsById(dispatch, id) {
    return await apiHandler(dispatch, httpClient.fetchRolePermissionsById, id);
}

export async function createRole(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createRole, data);
}

export async function updateRole(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateRole, id, data);
}

export async function deleteRole(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteRole, id);
}

export async function fetchAllPermissions(dispatch) {
    return await apiHandler(dispatch, httpClient.fetchAllPermissions);
}

export async function fetchAllCourses(dispatch) {
    return await apiHandler(dispatch, httpClient.fetchAllCourses);
}

export async function fetchAllUsers(dispatch) {
    return await apiHandler(dispatch, httpClient.fetchAllUsers);
}

export async function fetchUserById(dispatch, id) {
    return await apiHandler(dispatch, httpClient.fetchUserById, id);
}

export async function createUser(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createUser, data);
}

export async function updateUser(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateUser, id, data);
}

export async function deleteUser(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteUser, id);
}

export async function fetchCourseDeatils(dispatch, data) {
    return await apiHandler(dispatch, httpClient.fetchCourseDeatils, data);
}

export async function createCourse(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createCourse, data);
}

export async function updateCourse(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateCourse, id, data);
}

export async function deleteCourse(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteCourse, id);
}

export async function createTopic(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createTopic, data);
}

export async function updateTopic(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateTopic, id, data);
}

export async function deleteTopic(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteTopic, id);
}

export async function createLesson(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createLesson, data);
}

export async function updateLesson(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateLesson, id, data);
}

export async function deleteLesson(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteLesson, id);
}

export async function updateLessonProgress(dispatch, data) {
    return await apiHandlerWithoutLoader(dispatch, httpClient.updateLessonProgress, data);
}

export async function updateCourseProgress(dispatch, data) {
    return await apiHandler(dispatch, httpClient.updateCourseProgress, data);
}

export async function updateCourseFavourite(dispatch, data) {
    return await apiHandler(dispatch, httpClient.updateCourseFavourite, data);
}
export async function getEnrollmentCourses(dispatch) {
    return await apiHandler(dispatch, httpClient.getEnrollmentCourses);
}

export async function courseManualEnrollment(dispatch, data) {
    return await apiHandler(dispatch, httpClient.courseManualEnrollment, data);
}

export async function getEnrollmentCoursesByUserId(dispatch, userId) {
    return await apiHandler(dispatch, httpClient.getEnrollmentCoursesByUserId, userId);
}

export async function getUserNotes(dispatch, userId, courseId) {
    return await apiHandler(dispatch, httpClient.getUserNotes, userId, courseId);
}

export async function enrollUserToCourseCategory(dispatch, userId, categoryId) {
    return await apiHandlerWithoutLoader(dispatch, httpClient.enrollUserToCourseCategory, userId, categoryId);
}

export async function getUserCourses(dispatch, userId, statuses = null) {
    return await apiHandler(dispatch, httpClient.getUserCourses, userId, statuses);
}

export async function addUserNotes(dispatch, data) {
    return await apiHandler(dispatch, httpClient.addUserNotes, data);
}

export async function updateUserNotes(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateUserNotes, id, data);
}

export async function deleteUserNotes(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteUserNotes, id);
}

// Course Category APIs
export async function fetchAllCategories(dispatch) {
    return await apiHandler(dispatch, httpClient.getAllCategories);
}

export async function getUserEnrolledCourseCategory(dispatch, userId) {
    return await apiHandler(dispatch, httpClient.getUserEnrolledCourseCategory, userId);
}

export async function getCourseCategoryAssignmentsForUser(dispatch, userId, categoryId) {
    return await apiHandler(dispatch, httpClient.getCourseCategoryAssignmentsForUser, userId, categoryId);
}

export async function fetchCategoryById(dispatch, id) {
    return await apiHandler(dispatch, httpClient.getCategoryById, id);
}

export async function createCategory(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createCategory, data);
}

export async function updateCategory(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateCategory, id, data);
}

export async function deleteCategory(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteCategory, id);
}

export async function assignCourseToCategory(dispatch, data) {
    return await apiHandler(dispatch, httpClient.assignCourseToCategory, data);
}

export async function unassignCourseById(dispatch, id) {
    return await apiHandler(dispatch, httpClient.unassignCourseById, id);
}

export async function getAssignedCourses(dispatch, categoryId) {
    return await apiHandler(dispatch, httpClient.getAssignedCourses, categoryId);
}

// Group APIs
export async function fetchAllGroups(dispatch) {
    return await apiHandler(dispatch, httpClient.getAllGroups);
}

export async function fetchGroupById(dispatch, id) {
    return await apiHandler(dispatch, httpClient.getGroupById, id);
}

export async function createGroup(dispatch, data) {
    return await apiHandler(dispatch, httpClient.createGroup, data);
}

export async function updateGroup(dispatch, id, data) {
    return await apiHandler(dispatch, httpClient.updateGroup, id, data);
}

export async function deleteGroup(dispatch, id) {
    return await apiHandler(dispatch, httpClient.deleteGroup, id);
}

export async function assignUserToGroup(dispatch, data) {
    return await apiHandler(dispatch, httpClient.assignUserToGroup, data);
}

export async function unassignUserFromGroup(dispatch, id) {
    return await apiHandler(dispatch, httpClient.unassignUserFromGroup, id);
}

export async function getGroupAssignments(dispatch, groupId) {
    return await apiHandler(dispatch, httpClient.getGroupAssignments, groupId);
}