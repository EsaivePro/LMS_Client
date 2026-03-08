import React from "react";
import { IconButton, InputAdornment } from "@mui/material";
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import ClearIcon from "@mui/icons-material/Clear";
import dayjs from 'dayjs';

/**
 * CustomDateTimePicker Component
 * A reusable date-time picker with clear functionality
 * 
 * @param {string} label - Label for the date picker
 * @param {string|null} value - ISO string or null
 * @param {function} onChange - Callback function when date changes (receives ISO string or empty string)
 * @param {boolean} fullWidth - Whether the picker should take full width
 * @param {object} slotProps - Additional props for the text field
 */
export default function CustomDateTimePicker({
    label,
    value,
    onChange,
    fullWidth = true,
    size = "small",
    slotProps = {},
    ...otherProps
}) {
    const handleChange = (newValue) => {
        onChange(newValue ? newValue.toISOString() : "");
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange("");
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
                label={label}
                value={value ? dayjs(value) : null}
                onChange={handleChange}
                slotProps={{
                    ...slotProps,
                    textField: {
                        fullWidth,
                        size,
                        ...slotProps?.textField,
                        InputProps: {
                            ...slotProps?.textField?.InputProps,
                            endAdornment: value && (
                                <InputAdornment position="end">
                                    <IconButton
                                        size="small"
                                        onClick={handleClear}
                                        edge="end"
                                        aria-label="clear date"
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    },
                }}
                {...otherProps}
            />
        </LocalizationProvider>
    );
}
