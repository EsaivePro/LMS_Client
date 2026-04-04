import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Box, Typography, IconButton, Chip, Tooltip } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import DataTableV1 from "../../components/common/table/DataTableV1";
import axiosInstance from "../../apiClient/axiosInstance";

const toFooterLabel = (label, count) => {
    const normalized = String(label || "items").trim().toLowerCase();
    if (!normalized) return count === 1 ? "item" : "items";
    if (count === 1 && normalized.endsWith("s")) return normalized.slice(0, -1);
    return normalized;
};

const normalizeResponseRows = (payload) => {
    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    return [];
};

const normalizeResponseTotal = (payload, rowsLength) => {
    if (typeof payload?.total === "number") return payload.total;
    if (typeof payload?.count === "number") return payload.count;
    if (typeof payload?.totalCount === "number") return payload.totalCount;
    return rowsLength;
};

const resolveTemplate = (value, context) => {
    if (Array.isArray(value)) return value.map((item) => resolveTemplate(item, context));
    if (value && typeof value === "object") {
        return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveTemplate(entry, context)]));
    }

    if (typeof value !== "string") return value;

    const wholeMatch = value.match(/^\{([^}]+)\}$/);
    if (wholeMatch) {
        const resolved = context[wholeMatch[1]];
        return resolved !== undefined ? resolved : value;
    }

    return value.replace(/\{([^}]+)\}/g, (_, token) => {
        const resolved = context[token];
        return resolved !== undefined && resolved !== null ? String(resolved) : "";
    });
};

export default function PickerMasterPage({
    columns = [],
    pickerColumns = [],
    rows = [],
    value = [],
    onSyncRows,
    onReorder,
    onRemove,
    editing,
    draggable = true,
    pickerLabel = "items",
    tableConfig = {},
    pickerCfg = {},
    formValues = {},
    recordId,
}) {
    const [search, setSearch] = useState("");
    const [serverRows, setServerRows] = useState([]);
    const [serverTotal, setServerTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [initialPersistedRows, setInitialPersistedRows] = useState([]);

    const isSearching = search.trim() !== "";
    const canReorder = draggable && !isSearching;
    const hasOrder = draggable && rows.some((row) => row.order_no !== undefined);
    const serverDataEnabled = tableConfig?.serverData === true && !!tableConfig?.endpoint && recordId && recordId !== "create";
    const infiniteScrollEnabled = tableConfig?.infiniteScroll === true;
    const hidePagination = tableConfig?.hidePagination === true || infiniteScrollEnabled;

    const effectivePickerColumns = useMemo(() => {
        if (pickerColumns.length > 0) return pickerColumns.filter((column) => column.includeInSelected !== false);
        return columns.map((column) => ({
            source: column.name,
            target: column.name,
            label: column.label,
            type: column.type,
            includeInSelected: true,
        }));
    }, [columns, pickerColumns]);

    const dataCols = draggable
        ? columns.filter((column) => column.name !== "order_no")
        : columns;

    const searchColumns = useMemo(() => dataCols.map((column) => column.name), [dataCols]);

    const identityKey = tableConfig?.identityKey || effectivePickerColumns[0]?.target || columns[0]?.name || "id";
    const getRowIdentity = useCallback(
        (row, fallbackIdx) => row?.[identityKey] ?? row?.id ?? row?.__rowKey ?? row?.__idx ?? fallbackIdx,
        [identityKey]
    );

    const getLocalRowIndex = useCallback(
        (targetRow) => rows.findIndex((row, idx) => getRowIdentity(row, idx) === getRowIdentity(targetRow, idx)),
        [getRowIdentity, rows]
    );

    const matchesSearch = useCallback(
        (row) => {
            const searchTerm = search.trim().toLowerCase();
            if (!searchTerm) return true;

            return searchColumns.some((columnName) => {
                const rawValue = row?.[columnName];
                if (rawValue == null) return false;

                if (Array.isArray(rawValue)) {
                    return rawValue.some((item) => String(item ?? "").toLowerCase().includes(searchTerm));
                }

                const normalizedValue = rawValue && typeof rawValue === "object"
                    ? rawValue.label ?? rawValue.value ?? rawValue.id ?? ""
                    : rawValue;

                return String(normalizedValue).toLowerCase().includes(searchTerm);
            });
        },
        [search, searchColumns]
    );

    const commitReorder = (nextRows) => {
        onReorder(
            nextRows.map((row, idx) => ({ ...row, ...(row.order_no !== undefined ? { order_no: idx + 1 } : {}) }))
        );
    };

    const moveRow = (row, direction) => {
        const fromIndex = getLocalRowIndex(row);
        const toIndex = fromIndex + direction;

        if (fromIndex < 0 || toIndex < 0 || toIndex >= rows.length) return;

        const next = Array.from(rows);
        const [moved] = next.splice(fromIndex, 1);
        next.splice(toIndex, 0, moved);
        commitReorder(next);
    };

    const mapServerRowToSelectedShape = useCallback(
        (row) => {
            const mapped = effectivePickerColumns.reduce((acc, column) => {
                const sourceKey = column.source;
                const targetKey = column.target;
                acc[targetKey] = sourceKey == null ? null : (row?.[sourceKey] ?? row?.[targetKey] ?? null);
                return acc;
            }, {});

            mapped.id = mapped[identityKey] ?? row?.id ?? row?.[identityKey];
            return mapped;
        },
        [effectivePickerColumns, identityKey]
    );

    const resolvedRequestContext = useMemo(() => ({
        ...formValues,
        id: formValues?.id ?? (typeof recordId === "string" && /^\d+$/.test(recordId) ? Number(recordId) : recordId),
        recordId: typeof recordId === "string" && /^\d+$/.test(recordId) ? Number(recordId) : recordId,
    }), [formValues, recordId]);

    useEffect(() => {
        setInitialPersistedRows([]);
    }, [recordId, identityKey]);

    useEffect(() => {
        if (!serverDataEnabled || !infiniteScrollEnabled) return;
        setServerRows([]);
        setServerTotal(0);
    }, [infiniteScrollEnabled, search, serverDataEnabled]);

    const handleFetchServerRows = useCallback(async (queryString) => {
        if (!serverDataEnabled) return;

        const params = new URLSearchParams(queryString || "");
        const limit = Number(params.get("limit") || 10);
        const page = Number(params.get("page") || 1);
        const offset = Math.max(0, (page - 1) * limit);
        const requestConfig = tableConfig?.requestConfig || {};

        const payload = {
            ...(resolveTemplate(requestConfig, resolvedRequestContext) || {}),
            table: resolveTemplate(requestConfig.table ?? tableConfig?.requestTable ?? pickerCfg?.tableName ?? "", resolvedRequestContext),
            join: resolveTemplate(requestConfig.join ?? requestConfig.joins ?? [], resolvedRequestContext),
            where: resolveTemplate(requestConfig.where ?? {}, resolvedRequestContext),
            search: params.get("q") ?? "",
            searchColumns: resolveTemplate(requestConfig.searchColumns ?? [], resolvedRequestContext),
            limit,
            offset,
        };

        delete payload.joins;

        setLoading(true);
        try {
            const response = await axiosInstance.post(tableConfig.endpoint, payload);
            const raw = response?.data?.response ?? response?.data?.data ?? response?.data ?? {};
            const fetchedRows = normalizeResponseRows(raw).map(mapServerRowToSelectedShape);
            setServerRows((prev) => {
                if (!infiniteScrollEnabled || page <= 1) return fetchedRows;

                const merged = [...prev];
                const existingKeys = new Set(prev.map((row, idx) => getRowIdentity(row, idx)));
                fetchedRows.forEach((row, idx) => {
                    // const rowKey = getRowIdentity(row, idx);
                    // if (!existingKeys.has(rowKey)) {
                    // existingKeys.add(rowKey);
                    merged.push(row);
                    // }
                });
                return merged;
            });
            setServerTotal(normalizeResponseTotal(raw, fetchedRows.length));
        } catch (error) {
            console.error("Failed to fetch picker master rows", error);
            // if (!infiniteScrollEnabled || page <= 1) {
            //     setServerRows([]);
            //     setServerTotal(0);
            // }
        } finally {
            setLoading(false);
        }
    }, [getRowIdentity, infiniteScrollEnabled, mapServerRowToSelectedShape, pickerCfg?.tableName, resolvedRequestContext, serverDataEnabled, tableConfig]);

    useEffect(() => {
        if (!serverDataEnabled) {
            setServerRows([]);
            setServerTotal(0);
        }
    }, [serverDataEnabled]);

    const localRows = useMemo(
        () => rows.map((row, idx) => (row.id == null ? { ...row, id: getRowIdentity(row, idx) } : row)),
        [getRowIdentity, rows]
    );

    useEffect(() => {
        if (initialPersistedRows.length > 0 || localRows.length === 0) return;
        setInitialPersistedRows(localRows);
    }, [initialPersistedRows.length, localRows]);

    const serverMappedRows = useMemo(
        () => serverRows.map((row, idx) => (row.id == null ? { ...row, id: getRowIdentity(row, idx) } : row)),
        [getRowIdentity, serverRows]
    );

    const currentLocalKeys = useMemo(
        () => new Set(localRows.map((row, idx) => getRowIdentity(row, idx))),
        [getRowIdentity, localRows]
    );

    const removedPersistedRows = useMemo(
        () => initialPersistedRows.filter((row, idx) => !currentLocalKeys.has(getRowIdentity(row, idx))),
        [currentLocalKeys, getRowIdentity, initialPersistedRows]
    );

    const removedPersistedKeys = useMemo(
        () => new Set(removedPersistedRows.map((row, idx) => getRowIdentity(row, idx))),
        [getRowIdentity, removedPersistedRows]
    );

    const visibleServerRows = useMemo(
        () => serverMappedRows.filter((row, idx) => !removedPersistedKeys.has(getRowIdentity(row, idx))),
        [getRowIdentity, removedPersistedKeys, serverMappedRows]
    );

    const localExtraRows = useMemo(() => {
        if (!serverDataEnabled) return [];

        const serverKeys = new Set(visibleServerRows.map((row, idx) => getRowIdentity(row, idx)));
        return localRows.filter((row, idx) => {
            const rowKey = getRowIdentity(row, idx);
            return !serverKeys.has(rowKey) && matchesSearch(row);
        });
    }, [getRowIdentity, localRows, matchesSearch, serverDataEnabled, visibleServerRows]);

    const displayedRows = useMemo(() => {
        if (!serverDataEnabled) {
            return localRows;
        }

        const localRowsByKey = new Map(localRows.map((row, idx) => [getRowIdentity(row, idx), row]));
        const mergedServerRows = visibleServerRows.map((row, idx) => {
            const rowKey = getRowIdentity(row, idx);
            return localRowsByKey.get(rowKey) || row;
        });

        return [...mergedServerRows, ...localExtraRows];
    }, [getRowIdentity, localExtraRows, localRows, serverDataEnabled, visibleServerRows]);

    const removedPersistedCount = useMemo(
        () => removedPersistedRows.filter((row) => matchesSearch(row)).length,
        [matchesSearch, removedPersistedRows]
    );

    const totalCount = serverDataEnabled
        ? Math.max(0, serverTotal - removedPersistedCount) + localExtraRows.length
        : displayedRows.length;
    const serverHasMore = useMemo(() => {
        if (!serverDataEnabled || !infiniteScrollEnabled) return false;
        return serverMappedRows.length < serverTotal;
    }, [infiniteScrollEnabled, serverDataEnabled, serverMappedRows.length, serverTotal]);

    const footerLabel = useMemo(() => toFooterLabel(pickerLabel, totalCount), [pickerLabel, totalCount]);

    const mergedAllRows = useMemo(() => {
        if (!serverDataEnabled) {
            return localRows;
        }

        const localRowsByKey = new Map(localRows.map((row, idx) => [getRowIdentity(row, idx), row]));
        const mergedServerRows = visibleServerRows.map((row, idx) => {
            const rowKey = getRowIdentity(row, idx);
            return localRowsByKey.get(rowKey) || row;
        });

        const mergedServerKeys = new Set(mergedServerRows.map((row, idx) => getRowIdentity(row, idx)));
        const localOnlyRows = localRows.filter((row, idx) => !mergedServerKeys.has(getRowIdentity(row, idx)));

        return [...mergedServerRows, ...localOnlyRows];
    }, [getRowIdentity, localRows, serverDataEnabled, visibleServerRows]);

    const storedRows = useMemo(() => {
        const columnNames = columns.map((column) => column.name);
        return mergedAllRows.map((row) => {
            const nextRow = {};
            columnNames.forEach((columnName) => {
                nextRow[columnName] = row?.[columnName] ?? null;
            });
            return nextRow;
        });
    }, [columns, mergedAllRows]);

    useEffect(() => {
        if (!serverDataEnabled || typeof onSyncRows !== "function") return;

        const currentKeys = new Set(localRows.map((row, idx) => getRowIdentity(row, idx)));
        const hasMissingRows = storedRows.some((row, idx) => !currentKeys.has(getRowIdentity(row, idx)));

        if (hasMissingRows) {
            onSyncRows(storedRows);
        }
    }, [getRowIdentity, localRows, onSyncRows, serverDataEnabled, storedRows]);

    const tableColumns = useMemo(() => {
        const mappedColumns = [];

        if (hasOrder) {
            mappedColumns.push({
                field: "order_no",
                headerName: "#",
                minWidth: 72,
                sortable: false,
                filterable: false,
                renderCell: ({ value }) => (
                    <Chip label={value ?? "—"} size="small" sx={{ height: 20, fontSize: 11, fontWeight: 700, minWidth: 26 }} />
                ),
            });
        }

        dataCols.forEach((column) => {
            mappedColumns.push({
                field: column.name,
                headerName: column.label,
                minWidth: column.minWidth || (column.name === "title" || column.name === "question_master_title" ? 220 : 100),
                sortable: false,
                filterable: false,
                renderCell: ({ value }) => {
                    const displayValue = value ?? "—";
                    if (column.name === "question_id" || column.name === "id" || column.name.endsWith("_id")) {
                        return (
                            <Typography variant="body2" color="text.secondary" noWrap>
                                #{displayValue}
                            </Typography>
                        );
                    }

                    return (
                        <Typography
                            variant="body2"
                            fontWeight={column.name === "title" || column.name === "question_master_title" ? 500 : 400}
                            color={column.name === "title" || column.name === "question_master_title" ? "text.primary" : "text.secondary"}
                            noWrap
                            title={String(displayValue)}
                        >
                            {displayValue}
                        </Typography>
                    );
                },
            });
        });

        mappedColumns.push({
            field: "__actions",
            headerName: "Actions",
            minWidth: draggable ? 132 : 72,
            maxWidth: draggable ? 132 : 72,
            sortable: false,
            filterable: false,
            pinned: "right",
            renderCell: ({ row }) => {
                const currentIndex = getLocalRowIndex(row);
                const removeIndex = currentIndex >= 0
                    ? currentIndex
                    : value.findIndex((item, idx) => getRowIdentity(item, idx) === getRowIdentity(row, idx));
                const disableMoveUp = !editing || !canReorder || currentIndex <= 0;
                const disableMoveDown = !editing || !canReorder || currentIndex === -1 || currentIndex >= rows.length - 1;
                const disableRemove = !editing || removeIndex < 0;

                return (
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "flex-end", width: "100%" }}>
                        {draggable && (
                            <>
                                <Tooltip title={canReorder ? "Move up" : "Clear search to reorder"}>
                                    <span>
                                        <IconButton size="small" onClick={() => moveRow(row, -1)} disabled={disableMoveUp}>
                                            <ArrowUpwardIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                                <Tooltip title={canReorder ? "Move down" : "Clear search to reorder"}>
                                    <span>
                                        <IconButton size="small" onClick={() => moveRow(row, 1)} disabled={disableMoveDown}>
                                            <ArrowDownwardIcon fontSize="small" />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            </>
                        )}
                        <Tooltip title={disableRemove ? "Row not available in current form state" : "Remove"}>
                            <span>
                                <IconButton
                                    size="small"
                                    onClick={() => onRemove(removeIndex)}
                                    disabled={disableRemove}
                                    sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
                                >
                                    <DeleteOutlineIcon fontSize="small" />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                );
            },
        });

        return mappedColumns;
    }, [canReorder, dataCols, draggable, editing, getLocalRowIndex, getRowIdentity, hasOrder, moveRow, onRemove, rows, value]);

    return (
        <Box sx={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
            <DataTableV1
                rows={displayedRows}
                columns={tableColumns}
                serverSide={serverDataEnabled}
                totalCount={totalCount}
                loading={loading}
                onFetchData={serverDataEnabled ? handleFetchServerRows : undefined}
                checkboxSelection={false}
                defaultPageSize={10}
                pageSizeOptions={[10, 20]}
                externalSearch={search}
                onExternalSearchChange={setSearch}
                searchPlaceholder={`Search in added ${pickerLabel.toLowerCase()}...`}
                searchMinLength={1}
                emptySubtitle={isSearching ? "No results match your search." : `No ${pickerLabel.toLowerCase()} added yet.`}
                tableKey={`picker-master-${pickerLabel}-${dataCols.map((column) => column.name).join("-") || "default"}`}
                tableName={tableConfig?.requestConfig?.table || pickerCfg?.tableName || pickerLabel}
                maxHeight={400}
                minHeight={220}
                pickerSelected
                hidePagination={hidePagination}
                infiniteScroll={infiniteScrollEnabled}
                infiniteScrollHasMore={serverHasMore}
                endOfResultsMessage="No more data"
            />

            {displayedRows.length > 0 && (
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                    {totalCount} {footerLabel}
                    {isSearching
                        ? " · Clear search to reorder"
                        : draggable
                            ? " · Use the arrow actions to reorder"
                            : ""}
                </Typography>
            )}
        </Box>
    );
}