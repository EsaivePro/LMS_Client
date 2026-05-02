import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLayout, toggleWidget, fetchDashboardStatus } from "../redux/slices/dashboardSlice";

const useDashboard = () => {
    const dispatch = useDispatch();
    const { layout, widgets, status } = useSelector((s) => s.dashboard || {});
    const { counts, enrolledCourses, enrolledExams, upcoming, expiringSoon, lastSession, meta, loading, error, message } = status || {};

    const loadDashboardStatus = useCallback(async (data) => {
        try {
            const res = await dispatch(fetchDashboardStatus(data)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const updateLayout = useCallback((role, newLayout) => {
        dispatch(setLayout({ role, layout: newLayout }));
    }, [dispatch]);

    const toggleDashboardWidget = useCallback((role, widgetId) => {
        dispatch(toggleWidget({ role, widgetId }));
    }, [dispatch]);

    return useMemo(() => ({
        layout: layout || { admin: [], student: [] },
        widgets: widgets || { admin: [], student: [] },
        counts: counts || null,
        enrolledCourses: enrolledCourses || [],
        enrolledExams: enrolledExams || [],
        upcoming: upcoming || [],
        expiringSoon: expiringSoon || [],
        lastSession: lastSession || null,
        meta: meta || null,
        statusLoading: loading || false,
        statusError: error || false,
        statusMessage: message || null,
        loadDashboardStatus,
        updateLayout,
        toggleDashboardWidget,
    }), [layout, widgets, counts, enrolledCourses, enrolledExams, upcoming, expiringSoon, lastSession, meta, loading, error, message, loadDashboardStatus, updateLayout, toggleDashboardWidget]);
};

export default useDashboard;
