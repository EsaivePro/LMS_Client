import { enrollmentApi } from "../../../services/enrollmentApi";

export const enrollmentService = {
    getUserEnrollments: (userId, params) =>
        enrollmentApi.getUserEnrollments(userId, params),

    getDashboard: (userId, params) =>
        enrollmentApi.getDashboard(userId, params),
};
