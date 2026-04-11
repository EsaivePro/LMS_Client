import React from "react";
import CustomDateTimePicker from "../../../components/common/datepicker/CustomDateTimePicker";
import { buildLabel, clearInvalid } from "./fieldHelpers";

export default function DateTimeFormField({ field, value, onChange, editing, invalidFields, setInvalidFields }) {
    return (
        <CustomDateTimePicker
            label={buildLabel(field)}
            value={value || ""}
            onChange={(nextValue) => {
                onChange(field.name, nextValue);
                clearInvalid(field.name, setInvalidFields);
            }}
            size="small"
            fullWidth
            disabled={!editing || !!field.readOnly}
            error={!!invalidFields[field.name]}
        />
    );
}