import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchEnrollmentCourses, fetchEnrollmentCoursesByUser, manualEnrollUsers, setEnrollmentCourses } from "../redux/slices/enrollmentSlice";

const useEnrollment = () => {
    const dispatch = useDispatch();
    const { enrollmentCourses, enrollmentCoursesByUser, loading, error, message } = useSelector((s) => s.enrollment || {});

    const fetchEnrollCourses = useCallback(() => dispatch(fetchEnrollmentCourses()), [dispatch]);
    const fetchEnrollCoursesByUser = useCallback((userId) => dispatch(fetchEnrollmentCoursesByUser(userId)), [dispatch]);
    const manualEnrollment = useCallback((data) => dispatch(manualEnrollUsers(data)), [dispatch]);
    const setList = useCallback((list) => dispatch(setEnrollmentCourses(list)), [dispatch]);

    return useMemo(
        () => ({
            enrollmentCourses: enrollmentCourses || [],
            enrollmentCoursesByUser: enrollmentCoursesByUser || {},
            loading: !!loading,
            error,
            message,
            fetchEnrollCourses,
            fetchEnrollCoursesByUser,
            manualEnrollment,
            setList,
        }),
        [enrollmentCourses, enrollmentCoursesByUser, loading, error, message, fetchEnrollCourses, fetchEnrollCoursesByUser, manualEnrollment, setList]
    );
};

export default useEnrollment;
