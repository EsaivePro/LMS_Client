import React, { useEffect, useMemo, useRef, useState } from "react";
import { Autocomplete, TextField } from "@mui/material";
import { buildErrorAdornment, buildLabel, clearInvalid } from "./fieldHelpers";
import { httpClient } from "../../../apiClient/httpClient";

const getResponseList = (response) => {
    if (response?.data?.response?.data) return response.data.response.data;
    if (Array.isArray(response?.data?.response)) return response.data.response;
    if (Array.isArray(response?.data)) return response.data;
    return [];
};

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

const normalizeSourceConfig = (sourceConfig) => {
    if (typeof sourceConfig === "string") {
        return {
            fetcher: sourceConfig,
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
        const value = item?.[valueKey] ?? item?.id ?? item?.value ?? null;
        const label = firstDefinedValue(item, labelKeys) || `${fallbackPrefix} ${value ?? ""}`.trim();
        return { value, label, raw: item };
    });
};

const resolveRemoteSourceRef = (field, formValues = {}) => {
    const directSource = field.optionSource || field.source;
    if (directSource) return directSource;

    const sourceMap = field.optionSourceMap || field.sourceMap;
    const sourceBy = field.optionSourceField || field.sourceBy;
    if (sourceMap && sourceBy) {
        return sourceMap[formValues?.[sourceBy]] || null;
    }

    return null;
};

const getRemoteCacheKey = (field, formValues = {}) => {
    const sourceRef = resolveRemoteSourceRef(field, formValues);
    return sourceRef ? `${field.name}:${sourceRef}` : field.name;
};

const resolveRequestWhere = (field, formValues = {}) => {
    const baseWhere = field.where || field.sourceWhere;
    if (!baseWhere || typeof baseWhere !== "object" || Array.isArray(baseWhere)) return {};

    return Object.fromEntries(
        Object.entries(baseWhere).map(([key, entry]) => {
            if (typeof entry === "string" && entry.startsWith("$")) {
                return [key, getValueAtPath(formValues, entry.slice(1))];
            }
            return [key, entry];
        }).filter(([, entry]) => entry !== undefined)
    );
};

export default function SelectFormField({
    field,
    value,
    formValues,
    onChange,
    editing,
    invalidFields,
    setInvalidFields,
    optionsCache,
    optionsLoading,
    handleSearchInput,
    optionSourceConfig,
}) {
    const [remoteOptions, setRemoteOptions] = useState({});
    const [remoteLoading, setRemoteLoading] = useState({});
    const searchTimers = useRef({});
    const labelTarget = field.labelTarget || field.storeLabelAs;
    const usesRemoteFieldSource = useMemo(
        () => !!(field.source || field.optionSource || field.sourceMap || field.optionSourceMap || field.sourceColumns),
        [field]
    );
    const remoteCacheKey = useMemo(() => getRemoteCacheKey(field, formValues), [field, formValues]);
    const options = usesRemoteFieldSource
        ? (remoteOptions[remoteCacheKey] || field.options || [])
        : (field.optionsSource ? optionsCache?.[field.optionsSource] || [] : field.options || []);

    useEffect(() => {
        return () => {
            Object.values(searchTimers.current).forEach((timerId) => clearTimeout(timerId));
        };
    }, []);

    const fetchRemoteOptions = async (globalSearch = "", overrides = {}) => {
        const sourceRef = resolveRemoteSourceRef(field, formValues);
        if (!sourceRef) {
            setRemoteOptions((prev) => ({ ...prev, [remoteCacheKey]: [] }));
            return [];
        }

        const sharedConfig = optionSourceConfig?.[sourceRef];
        const normalizedSharedConfig = normalizeSourceConfig(sharedConfig || {});
        const sourceColumns = field.sourceColumns || normalizedSharedConfig.columns || ["id", "title"];
        const valueKey = field.sourceValueKey || normalizedSharedConfig.valueKey || sourceColumns[0] || "id";
        const labelKey = field.sourceLabelKey || sourceColumns[1] || sourceColumns[0] || "title";
        const limit = field.limit || normalizedSharedConfig.limit || 10;
        const requestWhere = {
            ...resolveRequestWhere(field, formValues),
            ...(overrides.where || {}),
        };

        setRemoteLoading((prev) => ({ ...prev, [remoteCacheKey]: true }));
        try {
            let mapped = [];

            if (typeof sourceRef === "string" && sourceRef.startsWith("fetch")) {
                const fetcher = httpClient[sourceRef];
                if (typeof fetcher === "function") {
                    const response = await fetcher();
                    mapped = normalizeOptionList(getResponseList(response), {
                        valueKey,
                        labelKeys: [labelKey, "title", "name", "label"],
                        fallbackLabelPrefix: field.label || "Item",
                    });
                }
            } else {
                const response = await httpClient.formAutocomplete({
                    table: sourceRef,
                    columns: sourceColumns,
                    where: requestWhere,
                    globalSearch,
                    limit,
                });

                mapped = normalizeOptionList(getResponseList(response), {
                    valueKey,
                    labelKeys: [labelKey, "title", "name", "label"],
                    fallbackLabelPrefix: field.label || "Item",
                });
            }

            setRemoteOptions((prev) => ({ ...prev, [remoteCacheKey]: mapped }));
            return mapped;
        } catch (error) {
            setRemoteOptions((prev) => ({ ...prev, [remoteCacheKey]: [] }));
            return [];
        } finally {
            setRemoteLoading((prev) => ({ ...prev, [remoteCacheKey]: false }));
        }
    };

    useEffect(() => {
        if (!usesRemoteFieldSource) return;
        if (value === undefined || value === null || value === "") return;
        if (options.length > 0) return;

        const sourceRef = resolveRemoteSourceRef(field, formValues);
        const sharedConfig = optionSourceConfig?.[sourceRef];
        const normalizedSharedConfig = normalizeSourceConfig(sharedConfig || {});
        const sourceColumns = field.sourceColumns || normalizedSharedConfig.columns || ["id", "title"];
        const valueKey = field.sourceValueKey || normalizedSharedConfig.valueKey || sourceColumns[0] || "id";

        fetchRemoteOptions("", { where: { [valueKey]: value } });
    }, [usesRemoteFieldSource, value, options.length, remoteCacheKey, field, formValues, optionSourceConfig]);

    const handleOpen = () => {
        if (usesRemoteFieldSource && options.length === 0) {
            fetchRemoteOptions("");
            return;
        }

        if (field.optionsSource && options.length === 0) {
            handleSearchInput(field.optionsSource, "");
        }
    };

    const handleRemoteSearch = (input) => {
        if (searchTimers.current[remoteCacheKey]) clearTimeout(searchTimers.current[remoteCacheKey]);
        searchTimers.current[remoteCacheKey] = setTimeout(() => {
            fetchRemoteOptions(input || "");
        }, 300);
    };

    return (
        <Autocomplete
            options={options}
            getOptionLabel={(option) => option.label || String(option.value)}
            value={options.find((option) => option.value === value) || null}
            onChange={(_, selected) => {
                onChange(field.name, selected ? selected.value : null);
                if (labelTarget) onChange(labelTarget, selected?.label || "");
                clearInvalid(field.name, setInvalidFields);
            }}
            onInputChange={(_, input, reason) => {
                if (reason !== "input") return;

                if (usesRemoteFieldSource) {
                    handleRemoteSearch(input);
                } else if (field.optionsSource) {
                    handleSearchInput(field.optionsSource, input);
                }
            }}
            filterOptions={(items) => items}
            isOptionEqualToValue={(option, current) => option.value === (current && (current.value ?? current))}
            loading={usesRemoteFieldSource
                ? !!remoteLoading[remoteCacheKey]
                : !!(field.optionsSource && optionsLoading?.[field.optionsSource])}
            disabled={!editing || !!field.readOnly}
            onOpen={handleOpen}
            renderInput={(params) => (
                <TextField
                    {...params}
                    fullWidth
                    size="small"
                    label={buildLabel(field)}
                    error={!!invalidFields[field.name]}
                    InputProps={{
                        ...params.InputProps,
                        endAdornment: buildErrorAdornment(!!invalidFields[field.name], params.InputProps.endAdornment),
                    }}
                />
            )}
            sx={{ minWidth: field.minWidth || 160 }}
        />
    );
}