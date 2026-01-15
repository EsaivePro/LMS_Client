import { useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchCategories,
    fetchCategoryById,
    createCategory,
    updateCategory,
    deleteCategory,
    assignCourse,
    unassignCourse,
    fetchAssignedCourses,
} from "../redux/slices/courseCategorySlice";

const useCategory = () => {
    const dispatch = useDispatch();
    const { categories, assigned, currentCategory, loading, error, message } = useSelector((s) => s.courseCategory || {});

    const loadCategories = useCallback(async () => {
        try {
            const res = await dispatch(fetchCategories()).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const getCategory = useCallback(async (id) => {
        try {
            const res = await dispatch(fetchCategoryById(id)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const create = useCallback(async (data) => {
        try {
            const res = await dispatch(createCategory(data)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const update = useCallback(async (id, data) => {
        try {
            const res = await dispatch(updateCategory({ id, data })).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const remove = useCallback(async (id) => {
        try {
            const res = await dispatch(deleteCategory(id)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const assign = useCallback(async (data) => {
        try {
            const res = await dispatch(assignCourse(data)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const unassign = useCallback(async (id) => {
        try {
            const res = await dispatch(unassignCourse(id)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    const loadAssigned = useCallback(async (categoryId) => {
        try {
            const res = await dispatch(fetchAssignedCourses(categoryId)).unwrap();
            return res;
        } catch (err) {
            return Promise.reject(err);
        }
    }, [dispatch]);

    return useMemo(() => ({
        categories: categories || [],
        assigned: assigned || {},
        currentCategory,
        loading,
        error,
        message,
        loadCategories,
        getCategory,
        create,
        update,
        remove,
        assign,
        unassign,
        loadAssigned,
    }), [categories, assigned, currentCategory, loading, error, message, loadCategories, getCategory, create, update, remove, assign, unassign, loadAssigned]);
};

export default useCategory;
