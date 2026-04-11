import React from "react";
import { TextField } from "@mui/material";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

export default function ArrayFormField({ field, value, onChange, editing, invalidFields, setInvalidFields }) {
    return (
        <TextField
            {...commonProps}
            label={buildLabel(field)}
            value={JSON.stringify(value || [])}
            onChange={(event) => {
                onChange(field.name, JSON.parse(event.target.value || "[]"));
                clearInvalid(field.name, setInvalidFields);
            }}
            helperText="JSON array editor"
            disabled={!editing || field.readOnly}
            error={!!invalidFields[field.name]}
            InputProps={{ endAdornment: buildErrorAdornment(!!invalidFields[field.name]) }}
        />
    );
}