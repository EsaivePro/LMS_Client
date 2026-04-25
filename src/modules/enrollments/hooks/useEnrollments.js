import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import { enrollmentService } from "../services/enrollmentService";

// Tab → API status mapping. "current" is handled via client-side filter.
const TAB_STATUS = {
    all:       null,
    current:   null,   // filtered client-side: active + inprogress
    completed: "completed",
    future:    "scheduled",
};

/**
 * Single-query enrollment hook.
 * Calls POST /enrollment-service/dashboard with all requested sections
 * and returns the same shape as the previous multi-query version so all
 * consumers (EnrollmentDashboard, CourseEnrollments, ExamEnrollments,
 * EnrollmentWidget) need zero changes.
 */
export function useEnrollments(userId, options = {}) {
    const {
        moduleType   = null,
        statusFilter = null,
        searchTerm   = "",
        page         = 1,
        limit        = 12,
        activeTab    = "all",
        include      = ["list", "stats", "widgets", "tabCounts"],
    } = options;

    const apiStatus = statusFilter || TAB_STATUS[activeTab] || null;

    const payload = {
        search:      searchTerm,
        module_type: moduleType,
        status:      apiStatus,
        tab:         activeTab,
        page,
        limit,
        include,
    };

    const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
        queryKey:        ["enrollment-dashboard", userId, payload],
        queryFn:         () => enrollmentService.getDashboard(userId, payload),
        enabled:         !!userId,
        staleTime:       30_000,
        placeholderData: keepPreviousData,
    });

    // "current" tab: backend sends status=null; filter active+inprogress client-side
    const enrollments = useMemo(() => {
        const rows = data?.enrollments ?? [];
        if (activeTab === "current") {
            return rows.filter((e) => ["active", "inprogress"].includes(e.status));
        }
        return rows;
    }, [data?.enrollments, activeTab]);

    return {
        enrollments,
        pagination:      data?.pagination      ?? { total: 0, page: 1, limit },
        stats:           data?.stats           ?? {},
        tabCounts:       data?.tabCounts       ?? {},
        upcomingExams:   data?.upcomingExams   ?? [],
        expiringCourses: data?.expiringCourses ?? [],
        // allEnrollments kept for ProgressAnalytics; equals the current page until
        // the backend exposes a dedicated raw-data include
        allEnrollments:  data?.enrollments     ?? [],
        isLoading,
        isFetching,
        isError,
        error,
        statsLoading: isLoading,
        refetch,
    };
}
