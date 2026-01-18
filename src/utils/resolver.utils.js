// utility functions for resolvers

export function secondsToTime(seconds) {
    if (!seconds || seconds < 0) return "00:00";

    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const pad = (n) => String(n).padStart(2, "0");
    // If hours is zero → MM:SS
    if (hrs === 0) {
        return `${pad(mins)}:${pad(secs)}`;
    }
    // Else → HH:MM:SS
    return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export function errorValidation(res) {
    let isError = true;
    if (res?.payload?.isError == false) isError = false;
    else if (res?.payload?.data?.error == false) isError = false;
    else if (res?.data?.error == false) isError = false;
    return isError;
}

export const buildServerQueryFromColumns = ({
    page,
    rowsPerPage,
    sortModel,
    filters,
    operators,
    columns,
}) => {
    const params = new URLSearchParams();

    /* ---------- PAGINATION ---------- */
    params.set("page", page + 1);
    params.set("limit", rowsPerPage);

    /* ---------- SORT ---------- */
    if (sortModel?.field) {
        params.set("sort_by", sortModel.field);
        params.set("sort_order", sortModel.direction);
    }

    /* ---------- FILTERS (COLUMN DRIVEN) ---------- */
    columns.forEach((col) => {
        if (!col.filterable) return;

        const value = filters[col.field];
        if (value == null || value.length === 0) return;

        const operator =
            operators[col.field] ||
            col.defaultOperator ||
            (col.type === "select"
                ? "in"
                : col.type === "number"
                    ? "="
                    : "contains");

        params.append(
            `filters[${col.field}]`,
            Array.isArray(value) ? value.join(",") : value
        );
        params.append(`operators[${col.field}]`, operator);
    });

    return params.toString();
};

// NOTE: Hooks (like useAdmin) must not be called from plain functions.
// Accept `permissions` as the first argument so callers can pass hook-derived data.
export function hasPermission(permissions, role) {
    if (!role) return false;
    if (!permissions || permissions.length === 0) return false;
    return permissions.some((p) => p?.key?.includes(role));
}

/**
 * Format a date/time value into a readable string including seconds and am/pm.
 * Example output: "Jan 18, 2026 7:26:50 am"
 */
export function formatDateTimeWithSeconds(value) {
    if (!value) return "";
    try {
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return String(value);

        const datePart = d.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
        const h = d.getHours();
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const m = String(d.getMinutes()).padStart(2, "0");
        const s = String(d.getSeconds()).padStart(2, "0");
        const ampm = h >= 12 ? "pm" : "am";
        const timePart = `${h12}:${m}:${s} ${ampm}`;
        return `${datePart} ${timePart}`;
    } catch (e) {
        return String(value);
    }
}