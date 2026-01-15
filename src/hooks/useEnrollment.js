import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEnrollmentCourses, fetchEnrollmentCoursesByUser, manualEnrollUsers, setEnrollmentCourses, fetchEnrolledCategoriesByUser, enrollUserToCategory, fetchUserCourses, fetchCourseCategoryAssignmentsForUser } from "../redux/slices/enrollmentSlice";

const useEnrollment = () => {
    const dispatch = useDispatch();
    const { enrollmentCourses, enrollmentCoursesByUser, userCoursesByUser, loading, error, message } = useSelector((s) => s.enrollment || {});

    const fetchEnrollCourses = useCallback(() => dispatch(fetchEnrollmentCourses()), [dispatch]);
    const fetchEnrollCoursesByUser = useCallback((userId) => dispatch(fetchEnrollmentCoursesByUser(userId)), [dispatch]);
    const fetchEnrolledCategories = useCallback((userId) => dispatch(fetchEnrolledCategoriesByUser(userId)), [dispatch]);
    const enrollToCategory = useCallback((userId, categoryId) => dispatch(enrollUserToCategory({ userId, categoryId })), [dispatch]);
    const fetchMyCourses = useCallback((userId, statuses) => {
        if (statuses !== undefined) dispatch(fetchUserCourses({ userId, statuses }));
        else dispatch(fetchUserCourses(userId));
    }, [dispatch]);
    const manualEnrollment = useCallback((data) => dispatch(manualEnrollUsers(data)), [dispatch]);
    const setList = useCallback((list) => dispatch(setEnrollmentCourses(list)), [dispatch]);
    const fetchCategoryAssignmentsForUser = useCallback((a, b) => {
        // support both (userId, categoryId) and ({ userId, categoryId }) call styles
        if (a && typeof a === 'object' && ('userId' in a || 'categoryId' in a)) {
            return dispatch(fetchCourseCategoryAssignmentsForUser(a));
        }
        return dispatch(fetchCourseCategoryAssignmentsForUser({ userId: a, categoryId: b }));
    }, [dispatch]);

    return useMemo(
        () => ({
            enrollmentCourses: enrollmentCourses || [],
            enrollmentCoursesByUser: enrollmentCoursesByUser || [],
            userCoursesByUser: userCoursesByUser || [],
            loading: !!loading,
            error,
            message,
            fetchEnrollCourses,
            fetchEnrollCoursesByUser,
            fetchEnrolledCategories,
            enrollToCategory,
            fetchMyCourses,
            manualEnrollment,
            setList,
            fetchCategoryAssignmentsForUser,
        }),
        [enrollmentCourses, enrollmentCoursesByUser, userCoursesByUser, loading, error, message, fetchEnrollCourses, fetchEnrollCoursesByUser, manualEnrollment, setList]
    );
};

export default useEnrollment;
