import { useCallback, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCourseDetail, setCurrentEditingCourseId, fetchCourses, updateLessonProgress, updateCourseProgress } from "../redux/slices/coursesSlice";

const useCourseCategory = () => {
    const dispatch = useDispatch();
    const { allCourses, courseDetails, currentEditingCourseId } = useSelector((s) => s.courses || {});
    const { loading: coursesLoading, error: coursesError } = useSelector((s) => s.courses || {});
    const { topicsInCourse } = useSelector((s) => s.topics || {});
    const { lessonsInTopics } = useSelector((s) => s.lessons || {});

    // Memoized helper: Get course by ID from courseDetails
    const getCourseById = useCallback((courseId) => {
        if (!courseId || !courseDetails) return null;
        const parsed = parseInt(courseId);
        return courseDetails.find((c) => c?.courseId === parsed || c?.id === parsed) || null;
    }, [courseDetails]);

    // Memoized helper: Set the current editing course
    const setEditingCourse = useCallback((courseId) => {
        dispatch(setCurrentEditingCourseId(courseId ? parseInt(courseId) : null));
    }, [dispatch]);

    // Load courses helper
    const loadCourses = useCallback(() => {
        // dispatch(fetchCourses());
    }, [dispatch]);

    // Optionally auto-load on first use (can be removed if caller wants explicit control)
    useEffect(() => {
        if (!allCourses || allCourses.length === 0) {

        }
    }, [allCourses, loadCourses]);

    // Dispatch wrappers for progress updates
    const updateLessonProgressInCourse = useCallback(async (data) => {
        try {
            const res = await dispatch(updateLessonProgress(data)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const updateCourseProgressInCourse = useCallback(async (data) => {
        try {
            const res = await dispatch(updateCourseProgress(data)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    return useMemo(() => ({
        allCourses: allCourses || [],
        courseDetails: courseDetails || [],
        topicsInCourse: topicsInCourse || [],
        lessonsInTopics: lessonsInTopics || [],
        currentEditingCourseId,
        getCourseById,
        setEditingCourse,
        loadCourses,
        coursesLoading,
        coursesError,
        updateCourseDetail: (course) => dispatch(setCourseDetail(course)),
        updateLessonProgress: updateLessonProgressInCourse,
        updateCourseProgress: updateCourseProgressInCourse,
    }), [allCourses, courseDetails, topicsInCourse, lessonsInTopics, currentEditingCourseId, getCourseById, setEditingCourse, dispatch]);
};

export default useCourseCategory;