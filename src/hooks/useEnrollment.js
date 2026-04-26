import { useCallback, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEnrollmentCourses, fetchEnrollmentCoursesByUser, manualEnrollUsers, setEnrollmentCourses, fetchEnrolledCategoriesByUser, enrollUserToCategory, fetchUserCourses, fetchCourseCategoryAssignmentsForUser, fetchEnrollmentDashboard } from "../redux/slices/enrollmentSlice";

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

// Tab → API status mapping. "current" is filtered client-side.
const TAB_STATUS = {
    all:       null,
    current:   null,
    completed: "completed",
    future:    "scheduled",
};

const DEFAULT_INCLUDE = ["list", "stats", "widgets", "tabCounts"];

export function useEnrollmentDashboard(userId, options = {}) {
    const dispatch = useDispatch();
    const {
        moduleType   = null,
        statusFilter = null,
        searchTerm   = "",
        page         = 1,
        limit        = 12,
        activeTab    = "all",
        include      = DEFAULT_INCLUDE,
    } = options;

    const { dashboardData, dashboardLoading, dashboardError } = useSelector(
        (s) => s.enrollment || {}
    );

    const apiStatus = statusFilter || TAB_STATUS[activeTab] || null;

    useEffect(() => {
        if (!userId) return;
        dispatch(fetchEnrollmentDashboard({
            userId,
            search:      searchTerm,
            module_type: moduleType,
            status:      apiStatus,
            tab:         activeTab,
            page,
            limit,
            include,
        }));
    }, [userId, searchTerm, moduleType, apiStatus, activeTab, page, limit, dispatch]);

    const enrollments = useMemo(() => {
        const rows = dashboardData?.enrollments ?? [];
        if (activeTab === "current") {
            return rows.filter((e) => ["active", "inprogress"].includes(e.status));
        }
        return rows;
    }, [dashboardData?.enrollments, activeTab]);

    const refetch = useCallback(() => {
        if (!userId) return;
        dispatch(fetchEnrollmentDashboard({
            userId,
            search:      searchTerm,
            module_type: moduleType,
            status:      apiStatus,
            tab:         activeTab,
            page,
            limit,
            include,
        }));
    }, [userId, searchTerm, moduleType, apiStatus, activeTab, page, limit, dispatch]);

    return {
        enrollments,
        pagination:      dashboardData?.pagination      ?? { total: 0, page: 1, limit },
        stats:           dashboardData?.stats           ?? {},
        tabCounts:       dashboardData?.tabCounts       ?? {},
        upcomingExams:   dashboardData?.upcomingExams   ?? [],
        expiringCourses: dashboardData?.expiringCourses ?? [],
        allEnrollments:  dashboardData?.enrollments     ?? [],
        isLoading:       !!dashboardLoading,
        isFetching:      !!dashboardLoading,
        isError:         !!dashboardError,
        error:           dashboardError,
        statsLoading:    !!dashboardLoading,
        refetch,
    };
}
