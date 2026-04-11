import React, { useCallback, useMemo, useRef, useState } from "react";
import { Box, Typography } from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import DataTableV2 from "../../components/common/table/DataTableV2";
import axiosInstance from "../../apiClient/axiosInstance";
import { formatDateTimeWithSeconds } from "../../utils/resolver.utils";

/**
 * Resolves a mapData template object into a concrete delta row.
 * Placeholder syntax: "{fieldName}" → row[fieldName], "{is_deleted}" → isDeleted boolean.
 * Non-placeholder values are kept as-is.
 */
function applyMapData(mapData, row, identityKey, isDeleted) {
    if (!mapData) return { [identityKey]: row[identityKey], is_deleted: isDeleted };
    const result = {};
    for (const [key, template] of Object.entries(mapData)) {
        if (typeof template === "string" && template.startsWith("{") && template.endsWith("}")) {
            const placeholder = template.slice(1, -1);
            result[key] = placeholder === "is_deleted" ? isDeleted : (row[placeholder] ?? null);
        } else {
            result[key] = template;
        }
    }
    return result;
}

/**
 * Renders an assigned-records table for fields with type="record-assigned".
 * POSTs the structured query body to assignedConfig.endpoint.
 * Rows with is_assigned === true are pre-checked in the table automatically.
 *
 * Props:
 *   field          — form field config (includes assignedConfig)
 *   value          — current selected IDs (array)
 *   formValues     — full form values object (used to resolve {recordId})
 *   recordId       — ID of the record being edited
 *   editing        — whether the form is in edit mode
 *   onChange       — (fieldName, ids[]) => void
 */
export default function RecordAssignedForm({
    field,
    value,
    formValues = {},
    recordId,
    editing = false,
    onChange,
}) {
    const assignedConfig = field.assignedConfig || {};
    const identityKey = assignedConfig.identityKey || "id";

    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [assignedCount, setAssignedCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [preselectedIds, setPreselectedIds] = useState([]);

    // Track which IDs have already been pre-selected to avoid overriding user deselections on refetch
    const preselectedAppliedRef = useRef(new Set());
    // Map of IDs that were already assigned in server data when the form loaded
    const existingAssignedRowsRef = useRef(new Map());
    // Map of id → row for every row ever fetched — needed to build delta for removed rows
    const allSeenRowsRef = useRef(new Map());

    // Resolve {recordId} placeholder in orderby.where values
    const resolvedOrderby = useMemo(() => {
        const resolveVal = (v) => {
            if (v === "{recordId}") {
                return recordId != null ? Number(recordId) : (formValues?.id ?? null);
            }
            return v;
        };
        return (assignedConfig.orderby || []).map((ob) => ({
            table: ob.table,
            where: Object.fromEntries(
                Object.entries(ob.where || {}).map(([k, v]) => [k, resolveVal(v)])
            ),
            on: ob.on,
        }));
    }, [assignedConfig.orderby, recordId, formValues?.id]); // eslint-disable-line

    // Build DataTableV2 columns from assignedConfig.displayColumns
    const columns = useMemo(() => {
        return (assignedConfig.displayColumns || []).map((col) => {
            const base = {
                field: col.field,
                headerName: col.headerName,
                type: col.type || "text",
                sortable: col.sortable !== false,
                filterable: col.filterable || false,
                ...(col.minWidth ? { minWidth: col.minWidth } : {}),
                ...(col.maxWidth ? { maxWidth: col.maxWidth } : {}),
                ...(col.valueOptions ? { valueOptions: col.valueOptions } : {}),
            };

            if (col.type === "datetime") {
                base.renderCell = (params) => (
                    <Typography variant="body2" color="text.secondary" noWrap>
                        {formatDateTimeWithSeconds(params.value)}
                    </Typography>
                );
            }

            return base;
        });
    }, [assignedConfig.displayColumns]); // eslint-disable-line

    // Called by DataTableV2 whenever page/sort/filter changes
    const handleFetch = useCallback(
        async (queryString) => {
            if (!assignedConfig.endpoint) return;

            const params = new URLSearchParams(queryString);
            const page = parseInt(params.get("page") || "1", 10);
            const limit = parseInt(params.get("limit") || "10", 10);
            const offset = (page - 1) * limit;
            const sortBy = params.get("sort_by") || assignedConfig.sortby || "created_at";
            const sortOrder = params.get("sort_order") || assignedConfig.order || "desc";
            const globalSearch = params.get("q") || "";

            // Convert DataTableV2 filter params → filterColumns structure
            const filterColumns = {};
            params.forEach((val, key) => {
                const match = key.match(/^filters\[(.+)\]$/);
                if (match) {
                    const fieldName = match[1];
                    const operator = params.get(`operators[${fieldName}]`) || "contains";
                    filterColumns[fieldName] = { search: val, order: "asc", condition: operator };
                }
            });

            if (!editing) {
                filterColumns.is_assigned = { search: true, order: "asc", condition: "=" };
            }

            const body = {
                table: assignedConfig.table,
                columns: (assignedConfig.displayColumns || []).map((col) => col.field),
                orderby: resolvedOrderby,
                globalSearch,
                ...(Object.keys(filterColumns).length ? { filterColumns } : {}),
                sortby: sortBy,
                order: sortOrder,
                limit,
                offset,
            };

            setLoading(true);
            try {
                const res = await axiosInstance.post(assignedConfig.endpoint, body);
                const raw = res?.data || {};
                const dataNode = raw.response || raw;
                const data = Array.isArray(dataNode.data)
                    ? dataNode.data
                    : Array.isArray(dataNode)
                        ? dataNode
                        : [];
                const newTotal = dataNode.total ?? data.length;
                const newAssignedCount = dataNode.assignedCount ?? 0;

                setRows(data);
                setTotal(newTotal);
                setAssignedCount(newAssignedCount);

                // Record all fetched rows for delta mapping (id → row, never overwritten)
                data.forEach((row) => {
                    const rowId = row[identityKey];
                    if (!allSeenRowsRef.current.has(rowId)) {
                        allSeenRowsRef.current.set(rowId, row);
                    }
                });

                // Capture existing server-assigned rows (accumulate across pages, never reset)
                data
                    .filter((row) => row.is_assigned === true)
                    .forEach((row) => {
                        const rowId = row[identityKey];
                        if (!existingAssignedRowsRef.current.has(rowId)) {
                            existingAssignedRowsRef.current.set(rowId, row);
                        }
                    });

                // Pre-select rows where is_assigned === true (once per ID)
                const newlyAssigned = data
                    .filter((row) => row.is_assigned === true)
                    .map((row) => row[identityKey])
                    .filter((id) => !preselectedAppliedRef.current.has(id));

                if (newlyAssigned.length > 0) {
                    newlyAssigned.forEach((id) => preselectedAppliedRef.current.add(id));
                    setPreselectedIds(newlyAssigned);
                }
            } catch (err) {
                console.error("RecordAssignedForm fetch error:", err);
                setRows([]);
                setTotal(0);
            } finally {
                setLoading(false);
            }
        },
        // eslint-disable-next-line
        [
            assignedConfig.endpoint,
            assignedConfig.table,
            assignedConfig.displayColumns,
            assignedConfig.sortby,
            assignedConfig.order,
            editing,
            identityKey,
            resolvedOrderby,
        ]
    );

    const handleSelectionChange = useCallback(
        (ids) => {
            const idSet = new Set(ids);

            // Sync is_assigned on local rows to reflect current checkbox state
            setRows((prev) =>
                prev.map((row) => ({
                    ...row,
                    is_assigned: idSet.has(row[identityKey]),
                }))
            );

            // Compute delta: only rows that changed relative to the initial server state
            const mapData = assignedConfig.mapData || null;
            const existingAssignedRows = existingAssignedRowsRef.current;
            const delta = [];

            // Newly checked — not assigned on server initially
            for (const id of ids) {
                if (!existingAssignedRows.has(id)) {
                    const row = allSeenRowsRef.current.get(id) || { [identityKey]: id };
                    delta.push(applyMapData(mapData, row, identityKey, false));
                }
            }
            // Newly unchecked — was assigned on server but now deselected
            for (const [id, row] of existingAssignedRows.entries()) {
                if (!idSet.has(id)) {
                    delta.push(applyMapData(mapData, row, identityKey, true));
                }
            }

            onChange?.(field.name, delta);
        },
        [field.name, identityKey, assignedConfig.mapData, onChange]
    );

    return (
        <Box sx={{ width: "100%" }}>
            {/* Header row */}
            <Box sx={{ mb: 3, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography variant="subtitle1" fontWeight={500}>
                    {field.label}
                </Typography>
                {assignedCount > 0 && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.75,
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 1,
                            border: "1px solid",
                            borderColor: "var(--primary)",
                            backgroundColor: "var(--primaryLight)",
                            transition: "background-color 0.2s ease"
                        }}
                    >
                        <GroupsIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
                        <Typography
                            variant="body2"
                            sx={{ fontSize: "1rem", fontWeight: 500, color: "var(--primary)", lineHeight: 1 }}
                        >
                            {assignedCount} assigned
                        </Typography>
                    </Box>
                )}
            </Box>

            {/* Checkbox-enabled data table */}
            <DataTableV2
                serverSide
                rows={rows}
                totalCount={total}
                loading={loading}
                columns={columns}
                tableKey={`record-assigned-${field.name}-${editing ? "edit" : "view"}`}
                tableName={assignedConfig.table}
                onFetchData={handleFetch}
                checkboxSelection
                onSelectionChange={handleSelectionChange}
                checkboxDisabled={!editing}
                hideColumnSettings
                preselectedIds={preselectedIds}
                minHeight={320}
                emptySubtitle="No records found."
            />
        </Box>
    );
}
