import React from "react";
import { TextField } from "@mui/material";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

export default function NumberFormField({ field, value, onChange, editing, invalidFields, setInvalidFields }) {
    return (
        <TextField
            {...commonProps}
            label={buildLabel(field)}
            type="number"
            value={value ?? ""}
            onChange={(event) => {
                const raw = event.target.value;
                const nextValue = raw === "" ? null : Number(raw);
                onChange(field.name, Number.isNaN(nextValue) ? 0 : nextValue);
                clearInvalid(field.name, setInvalidFields);
            }}
            disabled={!editing || field.readOnly}
            error={!!invalidFields[field.name]}
            InputProps={{ endAdornment: buildErrorAdornment(!!invalidFields[field.name]) }}
        />
    );
}