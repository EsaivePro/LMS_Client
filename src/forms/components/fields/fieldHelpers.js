import React from "react";
import { InputAdornment, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

export const commonProps = { fullWidth: true, size: "small" };

export const buildLabel = (field) => `${field.label}${field.required ? " *" : ""}`;

export const clearInvalid = (fieldName, setInvalidFields) => {
    setInvalidFields?.((prev) => ({ ...(prev || {}), [fieldName]: false }));
};

export const buildErrorAdornment = (hasError, extraAdornment = null) => {
    if (!hasError && !extraAdornment) return null;

    return (
        <InputAdornment position="end">
            {hasError ? (
                <Tooltip title="Required">
                    <InfoOutlinedIcon color="error" fontSize="small" sx={{ mr: extraAdornment ? 1 : 0 }} />
                </Tooltip>
            ) : null}
            {extraAdornment}
        </InputAdornment>
    );
};