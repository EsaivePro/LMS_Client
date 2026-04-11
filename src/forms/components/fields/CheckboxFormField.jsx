import React from "react";
import { Checkbox, FormControlLabel, Tooltip } from "@mui/material";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { clearInvalid } from "./fieldHelpers";

export default function CheckboxFormField({ field, value, onChange, editing, invalidFields, setInvalidFields }) {
    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={!!value}
                    onChange={(event) => {
                        onChange(field.name, event.target.checked);
                        clearInvalid(field.name, setInvalidFields);
                    }}
                    disabled={!editing || field.readOnly}
                />
            }
            label={
                <span>
                    {field.label}
                    {invalidFields[field.name] ? (
                        <Tooltip title="Required">
                            <InfoOutlinedIcon color="error" fontSize="small" sx={{ ml: 0.5 }} />
                        </Tooltip>
                    ) : null}
                </span>
            }
        />
    );
}