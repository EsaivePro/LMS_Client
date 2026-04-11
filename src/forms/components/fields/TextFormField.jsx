import React from "react";
import { TextField } from "@mui/material";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

export default function TextFormField({ field, value, onChange, editing, invalidFields, setInvalidFields }) {
    return (
        <TextField
            {...commonProps}
            label={buildLabel(field)}
            value={value ?? ""}
            onChange={(event) => {
                onChange(field.name, event.target.value);
                clearInvalid(field.name, setInvalidFields);
            }}
            disabled={!editing || field.readOnly}
            error={!!invalidFields[field.name]}
            InputProps={{ endAdornment: buildErrorAdornment(!!invalidFields[field.name]) }}
        />
    );
}