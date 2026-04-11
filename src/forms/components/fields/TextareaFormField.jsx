import React from "react";
import { TextField } from "@mui/material";
import { buildErrorAdornment, buildLabel, clearInvalid, commonProps } from "./fieldHelpers";

export default function TextareaFormField({ field, value, onChange, editing, invalidFields, setInvalidFields }) {
    return (
        <TextField
            {...commonProps}
            label={buildLabel(field)}
            multiline
            rows={4}
            value={value ?? ""}
            onChange={(event) => {
                onChange(field.name, event.target.value);
                clearInvalid(field.name, setInvalidFields);
            }}
            disabled={!editing || field.readOnly}
            error={!!invalidFields[field.name]}
            sx={{
                "& .MuiOutlinedInput-inputMultiline": {
                    padding: "14px",
                },
            }}
            InputProps={{ endAdornment: buildErrorAdornment(!!invalidFields[field.name]) }}
        />
    );
}