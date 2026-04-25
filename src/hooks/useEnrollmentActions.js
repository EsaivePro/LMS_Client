import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { enrollmentApi } from "../services/enrollmentApi";
import useCommon from "./useCommon";

export default function useEnrollmentActions({ onSuccess } = {}) {
    const queryClient = useQueryClient();
    const { showSuccess, showError } = useCommon();
    const [loading, setLoading] = useState({});

    const setFor = (id, val) =>
        setLoading((prev) => ({ ...prev, [String(id)]: val }));

    const invalidate = (id) => {
        queryClient.invalidateQueries({ queryKey: ["enrollments"] });
        if (id) queryClient.invalidateQueries({ queryKey: ["enrollment", String(id)] });
    };

    const revoke = useCallback(
        async (id, updatedBy) => {
            setFor(id, true);
            try {
                const result = await enrollmentApi.revokeEnrollment(id, updatedBy);
                showSuccess("Enrollment revoked successfully");
                invalidate(id);
                onSuccess?.(result);
                return result;
            } catch (err) {
                showError(err?.message || "Failed to revoke enrollment");
                throw err;
            } finally {
                setFor(id, false);
            }
        },
        [queryClient, showSuccess, showError, onSuccess]
    );

    const reEnroll = useCallback(
        async (id, updatedBy) => {
            setFor(id, true);
            try {
                const result = await enrollmentApi.reEnroll(id, updatedBy);
                showSuccess("Re-enrolled successfully");
                invalidate(id);
                onSuccess?.(result);
                return result;
            } catch (err) {
                showError(err?.message || "Failed to re-enroll");
                throw err;
            } finally {
                setFor(id, false);
            }
        },
        [queryClient, showSuccess, showError, onSuccess]
    );

    const updateSchedule = useCallback(
        async (id, payload) => {
            setFor(id, true);
            try {
                const result = await enrollmentApi.updateEnrollmentSchedule(id, payload);
                showSuccess("Schedule updated successfully");
                invalidate(id);
                onSuccess?.(result);
                return result;
            } catch (err) {
                showError(err?.message || "Failed to update schedule");
                throw err;
            } finally {
                setFor(id, false);
            }
        },
        [queryClient, showSuccess, showError, onSuccess]
    );

    return { revoke, reEnroll, updateSchedule, loading };
}
