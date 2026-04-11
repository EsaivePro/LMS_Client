import React, { useEffect, useMemo, useRef, useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    IconButton,
    ListItemIcon,
    MenuItem,
    Menu,
    Slide,
    Stack,
    Tooltip,
    Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckboxFormField from "./CheckboxFormField";
import DateTimeFormField from "./DateTimeFormField";
import DefaultFormField from "./DefaultFormField";
import FileUploadFormField from "./FileUploadFormField";
import NumberFormField from "./NumberFormField";
import SelectFormField from "./SelectFormField";
import TextareaFormField from "./TextareaFormField";
import DataTableV2 from "../../../components/common/table/DataTableV2";
import { httpClient } from "../../../apiClient/httpClient";
import {
    buildConditionalFieldRules,
    filterFieldsByConditionalRules,
    getHiddenConditionalFieldNames,
} from "../conditionalFields";

const getResponseList = (response) => {
    if (response?.data?.response?.data) return response.data.response.data;
    if (Array.isArray(response?.data?.response)) return response.data.response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

const normalizeSourceConfig = (sourceConfig) => {
    if (typeof sourceConfig === "string") {
        return {
            valueKey: "id",
            labelKeys: ["label", "title", "name"],
            fallbackLabelPrefix: "Item",
        };
    }

    return {
        valueKey: "id",
        labelKeys: ["label", "title", "name"],
        fallbackLabelPrefix: "Item",
        ...(sourceConfig || {}),
    };
};

const normalizeOptionList = (items = [], sourceConfig = {}) => {
    const valueKey = sourceConfig.valueKey || "id";
    const labelKeys = sourceConfig.labelKeys || ["label", "title", "name"];
    const fallbackPrefix = sourceConfig.fallbackLabelPrefix || "Item";

    return items.map((item) => {
        const optionValue = item?.[valueKey] ?? item?.id ?? item?.value ?? null;
        const optionLabel = firstDefinedValue(item, labelKeys) || `${fallbackPrefix} ${optionValue ?? ""}`.trim();
        return { value: optionValue, label: optionLabel, raw: item };
    });
};

const resolveAutocompleteSourceRef = (dialogField, rowValues = {}) => {
    const directSource = dialogField.optionSource || dialogField.source;
    if (directSource) return directSource;

    const sourceMap = dialogField.optionSourceMap || dialogField.sourceMap;
    const sourceBy = dialogField.optionSourceField || dialogField.sourceBy;
    if (sourceMap && sourceBy) {
        return sourceMap[rowValues?.[sourceBy]] || null;
    }

    return null;
};

const DialogSlideUpTransition = React.forwardRef(function DialogSlideUpTransition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function ActionsCell({ items = [], onPreview, onEdit, onDelete }) {
    const [anchor, setAnchor] = React.useState(null);
    const open = Boolean(anchor);
    const has = (name) => items.some((item) => item.toLowerCase() === name.toLowerCase());

    return (
        <>
            <Tooltip title="More" placement="top" disableInteractive>
                <IconButton size="small" onClick={(event) => setAnchor(event.currentTarget)} sx={{ color: "var(--dark)" }}>
                    <MoreVertIcon fontSize="small" />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchor}
                open={open}
                onClose={() => setAnchor(null)}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
                slotProps={{ paper: { elevation: 2, sx: { minWidth: 120, borderRadius: 1.5 } } }}
            >
                {has("preview") ? (
                    <MenuItem onClick={() => { setAnchor(null); onPreview?.(); }} sx={{ gap: 0 }}>
                        <ListItemIcon sx={{ minWidth: 0 }}><VisibilityIcon fontSize="small" /></ListItemIcon>
                        Preview
                    </MenuItem>
                ) : null}
                {has("edit") ? (
                    <MenuItem onClick={() => { setAnchor(null); onEdit?.(); }} sx={{ gap: 0 }}>
                        <ListItemIcon sx={{ minWidth: 0 }}><EditIcon fontSize="small" /></ListItemIcon>
                        Edit
                    </MenuItem>
                ) : null}
                {has("delete") ? (
                    <MenuItem onClick={() => { setAnchor(null); onDelete?.(); }} sx={{ gap: 0, color: "error.main" }}>
                        <ListItemIcon sx={{ minWidth: 0, color: "error.main" }}><DeleteIcon fontSize="small" /></ListItemIcon>
                        Delete
                    </MenuItem>
                ) : null}
            </Menu>
        </>
    );
}

const getValueAtPath = (source, path) => {
    if (!source || !path) return undefined;
    return String(path)
        .split(".")
        .reduce((current, key) => (current === undefined || current === null ? undefined : current[key]), source);
};

const firstDefinedValue = (source, paths = []) => {
    for (const path of paths) {
        const value = getValueAtPath(source, path);
        if (value !== undefined && value !== null && value !== "") return value;
    }
    return undefined;
};

const toComparableValue = (value) => {
    if (value === undefined || value === null) return null;
    return String(value);
};

const getResolvedLabelKey = (index, labelTarget, fieldValue) => {
    return `${index}:${labelTarget}:${toComparableValue(fieldValue)}`;
};

const matchesCondition = (source, condition) => {
    if (!condition) return true;
    const actualValue = getValueAtPath(source, condition.field);
    if (Object.prototype.hasOwnProperty.call(condition, "equals")) return actualValue === condition.equals;
    if (Array.isArray(condition.in)) return condition.in.includes(actualValue);
    return true;
};

const resolveFieldLabel = (dialogField, draft) => {
    if (dialogField.labelMap && dialogField.labelMapField) {
        const mappedValue = draft?.[dialogField.labelMapField];
        return dialogField.labelMap[mappedValue] || dialogField.label;
    }
    return dialogField.label;
};

const buildEmptyRow = (dialogFields = []) => {
    const nextRow = {};
    dialogFields.forEach((dialogField) => {
        if (!dialogField.name) return;
        if (dialogField.default !== undefined) nextRow[dialogField.name] = dialogField.default;
        else if (dialogField.type === "number") nextRow[dialogField.name] = 0;
        else nextRow[dialogField.name] = "";

        if (dialogField.labelTarget && nextRow[dialogField.labelTarget] === undefined) {
            nextRow[dialogField.labelTarget] = "";
        }
    });
    return nextRow;
};

const normalizeIncomingRow = (row = {}, dialogFields = []) => {
    const normalized = { ...row };

    dialogFields.forEach((dialogField) => {
        if (!dialogField.name) return;
        const fallbackPaths = [dialogField.name, ...(dialogField.sources || [])];
        const resolvedValue = firstDefinedValue(row, fallbackPaths);

        if (resolvedValue !== undefined) normalized[dialogField.name] = resolvedValue;
        else if (normalized[dialogField.name] === undefined) {
            normalized[dialogField.name] = dialogField.default !== undefined
                ? dialogField.default
                : dialogField.type === "number"
                    ? 0
                    : "";
        }

        if (dialogField.labelTarget) {
            const labelValue = firstDefinedValue(row, [dialogField.labelTarget, ...(dialogField.labelSources || [])]);
            normalized[dialogField.labelTarget] = labelValue ?? normalized[dialogField.labelTarget] ?? "";
        }
    });

    return normalized;
};

const sanitizeRowForSave = (row, dialogFields = [], hiddenConditionalFieldNames = new Set()) => {
    const normalized = normalizeIncomingRow(row, dialogFields);
    const payload = { ...row };

    dialogFields.forEach((dialogField) => {
        if (!dialogField.name) return;
        if (hiddenConditionalFieldNames.has(dialogField.name) && dialogField.clearWhenHidden !== false) {
            delete payload[dialogField.name];
            const hiddenLabelTarget = dialogField.labelTarget || dialogField.storeLabelAs;
            if (hiddenLabelTarget) delete payload[hiddenLabelTarget];
            return;
        }

        const shouldShow = matchesCondition(normalized, dialogField.showWhen);
        if (!shouldShow && dialogField.clearWhenHidden !== false) {
            delete payload[dialogField.name];
            if (dialogField.labelTarget) delete payload[dialogField.labelTarget];
            return;
        }

        let nextValue = normalized[dialogField.name];
        if (dialogField.type === "number") {
            nextValue = nextValue === null || nextValue === "" ? null : Number(nextValue);
            if (nextValue !== null && Number.isNaN(nextValue)) nextValue = dialogField.default ?? 0;
        }
        payload[dialogField.name] = nextValue;

        if (dialogField.labelTarget) {
            payload[dialogField.labelTarget] = normalized[dialogField.labelTarget] || "";
        }
    });

    return payload;
};

export default function RecordDailogField({ field, value = [], onChange, editing, showError }) {
    const dialogConfig = field.dialogConfig || {};
    const dialogFields = dialogConfig.fields || [];
    const optionSourceConfig = dialogConfig.optionSources || {};
    const tableColumnsConfig = field.table?.columns || dialogConfig.tableColumns || dialogConfig.columns || [];
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteIndex, setDeleteIndex] = useState(null);
    const [editIndex, setEditIndex] = useState(null);
    const [dialogMode, setDialogMode] = useState("add");
    const [draft, setDraft] = useState(buildEmptyRow(dialogFields));
    const [dialogInvalidFields, setDialogInvalidFields] = useState({});
    const [resolvedLabelOverrides, setResolvedLabelOverrides] = useState({});
    const resolvingLabelsRef = useRef(false);
    const labelRequestsInFlightRef = useRef(new Set());
    const completedLabelRequestsRef = useRef(new Set());
    const onChangeRef = useRef(onChange);
    const dialogRules = useMemo(() => buildConditionalFieldRules(dialogFields), [dialogFields]);

    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    const rows = useMemo(() => (Array.isArray(value) ? value.map((row) => normalizeIncomingRow(row, dialogFields)) : []), [value, JSON.stringify(dialogFields)]);
    const recordCount = rows.length;
    const visibleDialogFields = useMemo(
        () => filterFieldsByConditionalRules(dialogFields, dialogRules, draft),
        [dialogFields, dialogRules, draft]
    );
    const hiddenConditionalFieldNames = useMemo(
        () => getHiddenConditionalFieldNames(dialogFields, dialogRules, draft),
        [dialogFields, dialogRules, draft]
    );

    useEffect(() => {
        if (!Array.isArray(value) || value.length === 0) return;
        if (resolvingLabelsRef.current) return;

        const autocompleteFields = dialogFields.filter((dialogField) => {
            const labelTarget = dialogField.labelTarget || dialogField.storeLabelAs;
            return dialogField.type === "autocomplete" && dialogField.name && labelTarget;
        });
        if (!autocompleteFields.length) return;

        const pendingRows = value.flatMap((row, index) => {
            return autocompleteFields.map((dialogField) => {
                const labelTarget = dialogField.labelTarget || dialogField.storeLabelAs;
                const fieldValue = row?.[dialogField.name];
                const overrideKey = getResolvedLabelKey(index, labelTarget, fieldValue);
                const labelValue = row?.[labelTarget] ?? resolvedLabelOverrides[overrideKey];

                if (fieldValue === undefined || fieldValue === null || fieldValue === "") return null;
                if (labelValue !== undefined && labelValue !== null && labelValue !== "") return null;

                return { row, index, dialogField, labelTarget, fieldValue, overrideKey };
            }).filter(Boolean);
        });

        if (!pendingRows.length) return;

        let isCancelled = false;
        resolvingLabelsRef.current = true;

        const loadMissingLabels = async () => {
            let nextRequestPlan = [];
            try {
                const nextRows = value.map((row) => ({ ...row }));
                const nextOverrides = {};
                let hasUpdates = false;

                const requestGroups = pendingRows.reduce((groups, pending) => {
                    const sourceRef = resolveAutocompleteSourceRef(pending.dialogField, pending.row);
                    if (!sourceRef || typeof sourceRef !== "string" || sourceRef.startsWith("fetch")) return groups;

                    const sharedConfig = optionSourceConfig?.[sourceRef];
                    const normalizedSharedConfig = normalizeSourceConfig(sharedConfig || {});
                    const sourceColumns = pending.dialogField.sourceColumns || normalizedSharedConfig.columns || ["id", "title"];
                    const valueKey = pending.dialogField.sourceValueKey || normalizedSharedConfig.valueKey || sourceColumns[0] || "id";
                    const labelKey = pending.dialogField.sourceLabelKey || sourceColumns[1] || sourceColumns[0] || "title";
                    const limit = pending.dialogField.limit || normalizedSharedConfig.limit || 10;
                    const groupKey = JSON.stringify({ sourceRef, sourceColumns, valueKey, labelKey, limit });

                    if (!groups[groupKey]) {
                        groups[groupKey] = {
                            sourceRef,
                            sourceColumns,
                            valueKey,
                            labelKey,
                            limit,
                            fallbackLabelPrefix: pending.dialogField.label || "Item",
                            pendings: [],
                        };
                    }

                    groups[groupKey].pendings.push(pending);
                    return groups;
                }, {});

                const requestPlan = Object.values(requestGroups).map((group) => {
                    const requestedValues = [...new Set(group.pendings.map((pending) => pending.fieldValue))];
                    const whereValue = requestedValues.length === 1 ? requestedValues[0] : requestedValues;

                    return {
                        ...group,
                        requestedValues,
                        whereValue,
                        signature: JSON.stringify({
                            table: group.sourceRef,
                            columns: group.sourceColumns,
                            valueKey: group.valueKey,
                            values: [...requestedValues].sort((left, right) => String(left).localeCompare(String(right))),
                        }),
                    };
                });

                nextRequestPlan = requestPlan.filter((group) => {
                    return !labelRequestsInFlightRef.current.has(group.signature)
                        && !completedLabelRequestsRef.current.has(group.signature);
                });

                if (!nextRequestPlan.length) return;

                nextRequestPlan.forEach((group) => labelRequestsInFlightRef.current.add(group.signature));

                const responses = await Promise.all(
                    nextRequestPlan.map(async (group) => ({
                        group,
                        response: await httpClient.formAutocomplete({
                            table: group.sourceRef,
                            columns: group.sourceColumns,
                            where: { [group.valueKey]: group.whereValue },
                            globalSearch: "",
                            limit: Math.max(group.limit, group.requestedValues.length),
                        }),
                    }))
                );

                if (isCancelled) return;

                responses.forEach(({ group, response }) => {
                    const options = normalizeOptionList(getResponseList(response), {
                        valueKey: group.valueKey,
                        labelKeys: [group.labelKey, "title", "name", "label"],
                        fallbackLabelPrefix: group.fallbackLabelPrefix,
                    });
                    const optionsByValue = new Map(
                        options.map((option) => [toComparableValue(option.value), option.label])
                    );

                    group.pendings.forEach((pending) => {
                        const label = optionsByValue.get(toComparableValue(pending.fieldValue));
                        if (!label) return;

                        nextOverrides[pending.overrideKey] = label;
                        nextRows[pending.index] = {
                            ...nextRows[pending.index],
                            [pending.labelTarget]: label,
                        };
                        hasUpdates = true;
                    });

                    completedLabelRequestsRef.current.add(group.signature);
                });

                if (!isCancelled && hasUpdates) {
                    setResolvedLabelOverrides((prev) => ({ ...prev, ...nextOverrides }));
                    onChangeRef.current?.(field.name, nextRows);
                }
            } finally {
                nextRequestPlan.forEach((group) => labelRequestsInFlightRef.current.delete(group.signature));
                if (!isCancelled) resolvingLabelsRef.current = false;
            }
        };

        loadMissingLabels();

        return () => {
            // isCancelled = true;
            resolvingLabelsRef.current = false;
        };
    }, [value, dialogFields, optionSourceConfig, field.name, resolvedLabelOverrides]);

    const openAddDialog = () => {
        setDialogMode("add");
        setEditIndex(null);
        setDialogInvalidFields({});
        setDraft(buildEmptyRow(dialogFields));
        setDialogOpen(true);
    };

    const openEditDialog = (index) => {
        setDialogMode("edit");
        setEditIndex(index);
        setDialogInvalidFields({});
        setDraft(normalizeIncomingRow(rows[index] || {}, dialogFields));
        setDialogOpen(true);
    };

    const openPreviewDialog = (index) => {
        setDialogMode("preview");
        setEditIndex(index);
        setDialogInvalidFields({});
        setDraft(normalizeIncomingRow(rows[index] || {}, dialogFields));
        setDialogOpen(true);
    };

    const closeDialog = () => {
        setDialogOpen(false);
        setEditIndex(null);
        setDialogMode("add");
        setDialogInvalidFields({});
        setDraft(buildEmptyRow(dialogFields));
    };

    const handleSave = () => {
        const nextInvalidFields = {};
        for (const dialogField of visibleDialogFields) {
            if (!dialogField.required || !matchesCondition(draft, dialogField.showWhen)) continue;
            const fieldValue = draft[dialogField.name];
            const isEmpty = fieldValue === undefined || fieldValue === null || fieldValue === "";
            if (isEmpty) {
                nextInvalidFields[dialogField.name] = true;
                setDialogInvalidFields(nextInvalidFields);
                showError?.(`${dialogField.label || dialogField.name} is required`);
                return;
            }
        }
        setDialogInvalidFields({});

        const nextRow = sanitizeRowForSave({
            ...(editIndex !== null ? rows[editIndex] : {}),
            ...draft,
        }, dialogFields, hiddenConditionalFieldNames);

        const nextRows = [...rows];
        if (editIndex !== null) nextRows[editIndex] = nextRow;
        else nextRows.push(nextRow);

        onChange(field.name, nextRows);
        closeDialog();
    };

    const handleDelete = () => {
        const nextRows = rows.filter((_, index) => index !== deleteIndex);
        onChange(field.name, nextRows);
        setDeleteIndex(null);
    };

    const derivedColumns = useMemo(() => {
        if (Array.isArray(tableColumnsConfig) && tableColumnsConfig.length > 0) {
            const normalizedColumns = tableColumnsConfig.map((column) => (typeof column === "string" ? { field: column } : column));
            const hasActions = normalizedColumns.some((column) => column.type === "actions" || column.field === "actions");
            if (!hasActions) normalizedColumns.push({ field: "actions", type: "actions", headerName: "", minWidth: 40, maxWidth: 40 });
            return normalizedColumns;
        }

        const result = [];
        dialogFields.forEach((dialogField) => {
            if (dialogField.table === false || dialogField.hidden === true) return;

            result.push({
                field: dialogField.name,
                headerName: dialogField.tableLabel || dialogField.label,
                minWidth: dialogField.tableMinWidth || 140,
                showWhen: dialogField.showWhen,
                hiddenValue: dialogField.hiddenValue,
            });

            const labelTarget = dialogField.labelTarget || dialogField.storeLabelAs;
            if (labelTarget && dialogField.showLabelColumn !== false) {
                result.push({
                    field: labelTarget,
                    headerName: dialogField.labelTargetLabel || "Title",
                    minWidth: dialogField.labelTargetMinWidth || 240,
                });
            }
        });

        result.push({ field: "actions", type: "actions", headerName: "", minWidth: 52, maxWidth: 52 });
        return result;
    }, [tableColumnsConfig, dialogFields]);

    const columns = useMemo(() => derivedColumns.map((column) => {
        if (column.type === "actions" || column.field === "actions") {
            return {
                ...column,
                sortable: false,
                filterable: false,
                pinned: "right",
                renderCell: ({ row }) => (
                    <ActionsCell
                        items={editing ? ["preview", "edit", "delete"] : ["preview"]}
                        onPreview={() => openPreviewDialog(row.__idx)}
                        onEdit={editing ? () => openEditDialog(row.__idx) : undefined}
                        onDelete={editing ? () => setDeleteIndex(row.__idx) : undefined}
                    />
                ),
            };
        }

        if (column.showWhen) {
            return {
                ...column,
                sortable: column.sortable ?? false,
                filterable: column.filterable ?? false,
                renderCell: ({ row }) => (matchesCondition(row, column.showWhen) ? (row[column.field] ?? column.emptyValue ?? "-") : (column.hiddenValue ?? "-")),
            };
        }

        return {
            ...column,
            headerName: column.headerName || column.label || column.field,
            sortable: column.sortable ?? false,
            filterable: column.filterable ?? false,
        };
    }), [derivedColumns, editing]);

    const preparedRows = rows.map((row, index) => {
        const nextRow = { ...row, id: row.id ?? index, __idx: index };

        dialogFields.forEach((dialogField) => {
            const labelTarget = dialogField.labelTarget || dialogField.storeLabelAs;
            if (!labelTarget) return;
            if (nextRow[labelTarget] !== undefined && nextRow[labelTarget] !== null && nextRow[labelTarget] !== "") return;

            const overrideKey = getResolvedLabelKey(index, labelTarget, nextRow[dialogField.name]);
            const overrideLabel = resolvedLabelOverrides[overrideKey];
            if (overrideLabel) nextRow[labelTarget] = overrideLabel;
        });

        return nextRow;
    });
    const isPreviewMode = dialogMode === "preview";

    const renderDialogField = (dialogField) => {
        if (!dialogField.name || !matchesCondition(draft, dialogField.showWhen)) return null;

        const componentKey = `${dialogMode}-${editIndex ?? "new"}-${dialogField.name}`;

        const fieldLabel = resolveFieldLabel(dialogField, draft);
        const adaptedField = {
            ...dialogField,
            label: fieldLabel,
            readOnly: !!isPreviewMode || !!dialogField.readOnly,
        };

        const handleComponentChange = (fieldName, nextValue) => {
            if (isPreviewMode) return;

            setDraft((prev) => {
                const nextDraft = { ...prev, [fieldName]: nextValue };

                if (fieldName === dialogField.name && (dialogField.type === "select" || dialogField.type === "autocomplete")) {
                    (dialogFields || []).forEach((otherField) => {
                        const dependentFieldName = otherField.optionSourceField || otherField.sourceBy;
                        const otherLabelTarget = otherField.labelTarget || otherField.storeLabelAs;
                        if (dependentFieldName === dialogField.name) {
                            nextDraft[otherField.name] = otherField.resetOnDependencyChange === false ? nextDraft[otherField.name] : null;
                            if (otherLabelTarget) nextDraft[otherLabelTarget] = "";
                        }
                    });
                }

                return nextDraft;
            });
        };

        const commonProps = {
            field: adaptedField,
            value: draft[dialogField.name],
            formValues: draft,
            onChange: handleComponentChange,
            editing: !isPreviewMode,
            invalidFields: dialogInvalidFields,
            setInvalidFields: setDialogInvalidFields,
        };

        if (dialogField.type === "select" || dialogField.type === "autocomplete") {
            return (
                <SelectFormField
                    key={componentKey}
                    {...commonProps}
                    optionSourceConfig={optionSourceConfig}
                />
            );
        }

        if (dialogField.type === "number") {
            return <NumberFormField key={componentKey} {...commonProps} />;
        }

        if (dialogField.type === "datetime") {
            return <DateTimeFormField key={componentKey} {...commonProps} />;
        }

        if (dialogField.type === "fileupload") {
            return <FileUploadFormField key={componentKey} {...commonProps} showError={showError} />;
        }

        if (dialogField.type === "checkbox") {
            return <CheckboxFormField key={componentKey} {...commonProps} />;
        }

        if (dialogField.type === "textarea") {
            return <TextareaFormField key={componentKey} {...commonProps} />;
        }

        return <DefaultFormField key={componentKey} {...commonProps} />;
    };

    return (
        <Box sx={{ width: "100%" }}>
            <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Typography>{field.label || "Assignments"}</Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                    <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={openAddDialog} disabled={!editing}>
                        {dialogConfig.addButtonLabel || "Add"}
                    </Button>
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
                        <DescriptionOutlinedIcon sx={{ fontSize: 20, color: "var(--primary)" }} />
                        <Typography
                            variant="body2"
                            sx={{ fontSize: "0.95rem", fontWeight: 600, color: "var(--primary)", lineHeight: 1 }}
                        >
                            {recordCount} {recordCount === 1 ? "record" : "records"}
                        </Typography>
                    </Box>
                </Stack>
            </Box>

            <DataTableV2
                rows={preparedRows}
                columns={columns}
                serverSide={false}
                hideColumnSettings
                checkboxSelection={false}
                defaultPageSize={5}
                pageSizeOptions={[5, 10, 20]}
                onRowDoubleClick={editing ? (row) => openEditDialog(row.__idx) : undefined}
            />

            <Dialog
                open={dialogOpen}
                onClose={closeDialog}
                fullWidth
                maxWidth={dialogConfig.maxWidth || "sm"}
                TransitionComponent={DialogSlideUpTransition}
                transitionDuration={{ enter: 320, exit: 220 }}
                PaperProps={{
                    sx: {
                        borderRadius: 2,
                        overflow: "hidden",
                        background: "linear-gradient(180deg, #ffffff 0%, var(--primaryLight) 100%)",
                        boxShadow: "0 28px 70px rgba(15, 23, 42, 0.18)",
                        border: "1px solid rgba(148, 163, 184, 0.18)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        px: { xs: 2.5, sm: 3 },
                        py: 2.25,
                        borderBottom: "1px solid",
                        borderColor: "divider",
                        background: "linear-gradient(135deg, rgba(15,23,42,0.04) 0%, rgba(59,130,246,0.10) 100%)",
                    }}
                >
                    <Typography variant="overline" sx={{ display: "block", fontSize:"14px", color: "text.secondary", letterSpacing: 1.2 }}>
                        {isPreviewMode ? "Preview Record" : editIndex !== null ? "Update Record" : "Create Record"}
                    </Typography>
                    {/* <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {isPreviewMode
                            ? (dialogConfig.previewTitle || "Preview")
                            : editIndex !== null
                                ? (dialogConfig.editTitle || dialogConfig.title || "Edit Record")
                                : (dialogConfig.addTitle || dialogConfig.title || "Add")}
                    </Typography> */}
                </DialogTitle>
                <DialogContent
                    sx={{
                        px: { xs: 2.5, sm: 3 },
                        mt: 2.5,
                        py: 3,
                        backgroundColor: "rgba(248, 250, 252, 0.55)",
                    }}
                >
                    <Stack spacing={2} sx={{ pt: 1 }}>
                        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                            {visibleDialogFields.map((dialogField) => renderDialogField(dialogField))}
                        </Box>
                    </Stack>
                </DialogContent>
                <DialogActions
                    sx={{
                        px: { xs: 1.5, sm: 2 },
                        py: 1.5,
                        borderTop: "1px solid",
                        borderColor: "divider",
                        backgroundColor: "rgba(255, 255, 255, 0.92)",
                    }}
                >
                    <Button
                        onClick={closeDialog}
                        variant="outlined"
                    >
                        {isPreviewMode ? "Close" : "Cancel"}
                    </Button>
                    {!isPreviewMode ? (
                        <Button
                            variant="contained"
                            onClick={handleSave}
                            disabled={!editing}
                        >
                            {editIndex !== null ? (dialogConfig.updateButtonLabel || "Update") : (dialogConfig.createButtonLabel || "Add")}
                        </Button>
                    ) : null}
                </DialogActions>
            </Dialog>

            <Dialog
                open={deleteIndex !== null}
                onClose={() => setDeleteIndex(null)}
                TransitionComponent={DialogSlideUpTransition}
                transitionDuration={{ enter: 280, exit: 200 }}
                PaperProps={{
                    sx: {
                        borderRadius: 3,
                        width: "calc(100% - 32px)",
                        maxWidth: 440,
                        overflow: "hidden",
                        background: "linear-gradient(180deg, #ffffff 0%, #fff7f7 100%)",
                        boxShadow: "0 24px 60px rgba(127, 29, 29, 0.18)",
                        border: "1px solid rgba(248, 113, 113, 0.18)",
                    },
                }}
            >
                <DialogTitle
                    sx={{
                        px: 3,
                        py: 2.25,
                        borderBottom: "1px solid rgba(248, 113, 113, 0.18)",
                        background: "linear-gradient(135deg, rgba(254,226,226,0.78) 0%, rgba(255,255,255,0.96) 100%)",
                    }}
                >
                    <Typography variant="overline" sx={{ display: "block", color: "error.main", letterSpacing: 1.1 }}>
                        Confirm Action
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                        {dialogConfig.deleteTitle || "Delete"}
                    </Typography>
                </DialogTitle>
                <DialogContent sx={{ px: 3, py: 2.5 }}>
                    <DialogContentText sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                        {dialogConfig.deleteMessage || "Are you sure you want to delete this item?"}
                    </DialogContentText>
                </DialogContent>
                <DialogActions
                    sx={{
                        px: 3,
                        py: 2,
                        borderTop: "1px solid rgba(248, 113, 113, 0.14)",
                        backgroundColor: "rgba(255,255,255,0.88)",
                    }}
                >
                    <Button
                        onClick={() => setDeleteIndex(null)}
                        sx={{
                            borderRadius: 999,
                            px: 2.25,
                            textTransform: "none",
                            fontWeight: 600,
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        color="error"
                        variant="contained"
                        onClick={handleDelete}
                        sx={{
                            borderRadius: 999,
                            px: 2.75,
                            textTransform: "none",
                            fontWeight: 700,
                            boxShadow: "none",
                        }}
                    >
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}