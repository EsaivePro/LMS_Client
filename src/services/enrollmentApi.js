import axiosInstance from "../apiClient/axiosInstance";

const extract = (res) => res?.data?.response ?? res?.data ?? res;

const withPagination = (res) => {
    const data = extract(res);
    if (res?.data?.pagination) {
        if (Array.isArray(data)) return { data, pagination: res.data.pagination };
        if (data && typeof data === "object") return { ...data, pagination: res.data.pagination };
    }
    return data;
};

// Matches the response shapes returned by /common-service/search
// Handles: response.data (paginated array), response (array), data (array)
const extractCommon = (res) => {
    const r = res?.data?.response;
    if (Array.isArray(r?.data)) return r.data;
    if (Array.isArray(r)) return r;
    if (Array.isArray(res?.data)) return res.data;
    return [];
};

const commonSearch = async (table, search = "", limit = 100) => {
    const q = encodeURIComponent(search);
    const t = encodeURIComponent(table);
    const res = await axiosInstance.get(`/common-service/search?q=${q}&table=${t}&page=1&limit=${limit}`);
    return extractCommon(res);
};

export const enrollmentApi = {
    // UC-1
    getUnenrolledUsers: (params) =>
        axiosInstance.post("/enrollment-service/unenrolled-users", params).then(withPagination),

    // UC-2
    bulkEnroll: (params) =>
        axiosInstance.post("/enrollment-service/bulk-enroll", params).then(extract),

    // UC-3
    enrollUser: (params) =>
        axiosInstance.post("/enrollment-service/enroll", params).then(extract),

    // UC-4
    revokeEnrollment: (id, updatedBy) =>
        axiosInstance.patch(`/enrollment-service/${id}/revoke`, { updated_by: updatedBy }).then(extract),

    // UC-5
    updateEnrollmentSchedule: (id, payload) =>
        axiosInstance.patch(`/enrollment-service/${id}/schedule`, payload).then(extract),

    // UC-6
    getGroupEnrollmentStatus: (params) =>
        axiosInstance.post("/enrollment-service/group-status", params).then(withPagination),

    // UC-7
    getModuleCategorySummary: (moduleCategoryId) =>
        axiosInstance
            .post("/enrollment-service/module-category-summary", { module_category_id: moduleCategoryId })
            .then(extract),

    // UC-8
    getUserEnrollments: (userId, params) =>
        axiosInstance.post(`/enrollment-service/user/${userId}/enrollments`, params).then(withPagination),

    // UC-DASH — single-round-trip analytics dashboard
    getDashboard: (userId, params) =>
        axiosInstance
            .post("/enrollment-service/dashboard", { ...params })
            .then((res) => {
                const r = res?.data?.response ?? res?.data ?? res;
                return {
                    enrollments: r?.enrollments ?? [],
                    pagination: r?.pagination ?? { total: 0, page: 1, limit: params?.limit ?? 12 },
                    stats: r?.stats ?? {},
                    tabCounts: r?.tabCounts ?? {},
                    upcomingExams: r?.upcomingExams ?? [],
                    expiringCourses: r?.expiringCourses ?? [],
                    meta: r?.meta ?? {},
                };
            }),

    // Fetch single enrollment by ID
    getEnrollmentById: (id) =>
        axiosInstance.get(`/enrollment-service/${id}`).then(extract),

    // UC-9
    reEnroll: (id, updatedBy) =>
        axiosInstance
            .post(`/enrollment-service/${id}/re-enroll`, { updated_by: updatedBy })
            .then(extract),

    // UC-10
    autoEnrollGroup: (params) =>
        axiosInstance.post("/enrollment-service/auto-enroll-group", params).then(extract),

    // Supporting — Groups
    getGroupsList: (search = "") => commonSearch("groups", search),

    // Existing: /group-service/:id/getGroup
    getGroupById: (groupId) =>
        axiosInstance.get(`/group-service/${groupId}/getGroup`).then(extract),

    // NEW — needs backend implementation (see spec below)
    getGroupModules: (groupId) =>
        axiosInstance.get(`/group-service/${groupId}/module-categories`).then(extract),

    // Existing: /group-service/assign-user  (body: { group_id, user_id })
    assignUserToGroup: (groupId, userId) =>
        axiosInstance
            .post("/group-service/assign-user", { group_id: groupId, user_id: userId })
            .then(extract),

    // Supporting — Module Categories
    getModuleCategoryList: (search = "") => commonSearch("module_category", search),

    // Supporting — Users
    getUsersList: (search = "") => commonSearch("users", search, 50),

    // Existing: /user-service/get-user-by-id/:id
    getUserById: (userId) =>
        axiosInstance.get(`/user-service/get-user-by-id/${userId}`).then(extract),

    // Supporting — Courses & Exams
    getCoursesList: (search = "") => commonSearch("courses", search, 50),

    getExamsList: (search = "") => commonSearch("exams", search, 50),
};
