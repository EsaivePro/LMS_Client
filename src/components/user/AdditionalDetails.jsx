import React, { useState } from "react";
import {
    TextField,
    Grid,
    IconButton,
    Typography,
    Tooltip,
    Box,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

const MAX_FIELDS = 10;

export default function AdditionalDetails({ onChange }) {
    const [fields, setFields] = useState([{ key: "", value: "" }]);

    /* ---------------- Helpers ---------------- */
    const buildJson = (updatedFields) => {
        const jsonObj = {};
        updatedFields.forEach(({ key, value }) => {
            const trimmedKey = key.trim();
            if (trimmedKey) {
                jsonObj[trimmedKey] = value;
            }
        });
        onChange(JSON.stringify(jsonObj));
    };

    const updateDetails = (updatedFields) => {
        setFields(updatedFields);
        buildJson(updatedFields);
    };

    const handleFieldChange = (index, field, value) => {
        const updated = [...fields];
        updated[index][field] = value;
        updateDetails(updated);
    };

    const addNewField = () => {
        if (fields.length >= MAX_FIELDS) return;
        updateDetails([...fields, { key: "", value: "" }]);
    };

    const removeField = (index) => {
        if (fields.length === 1) return;
        updateDetails(fields.filter((_, i) => i !== index));
    };

    const hasDuplicateKeys = () => {
        const keys = fields.map((f) => f.key.trim()).filter(Boolean);
        return new Set(keys).size !== keys.length;
    };

    /* ---------------- UI ---------------- */
    return (
        <Box>
            <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 2 }}>
                Custom Field
            </Typography>

            <Grid container spacing={2}>
                {fields.map((field, index) => (
                    <Grid container item spacing={2} key={index} alignItems="center">
                        {/* Field Name */}
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Field Name"
                                value={field.key}
                                error={hasDuplicateKeys()}
                                helperText={
                                    hasDuplicateKeys() ? "Duplicate keys not allowed" : ""
                                }
                                onChange={(e) =>
                                    handleFieldChange(index, "key", e.target.value)
                                }
                            />
                        </Grid>

                        {/* Value */}
                        <Grid item xs={12} md={5}>
                            <TextField
                                fullWidth
                                size="small"
                                label="Value"
                                value={field.value}
                                onChange={(e) =>
                                    handleFieldChange(index, "value", e.target.value)
                                }
                            />
                        </Grid>

                        {/* Actions */}
                        <Grid
                            item
                            xs={12}
                            md={2}
                            display="flex"
                            justifyContent="center"
                            gap={1}
                        >
                            {/* Delete */}
                            <Tooltip title="Remove field">
                                <span>
                                    <IconButton
                                        color="error"
                                        disabled={fields.length === 1}
                                        onClick={() => removeField(index)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </span>
                            </Tooltip>

                            {/* Add (only show on last row) */}
                            {index === fields.length - 1 && (
                                <Tooltip
                                    title={
                                        fields.length >= MAX_FIELDS
                                            ? "Maximum fields reached"
                                            : "Add field"
                                    }
                                >
                                    <span>
                                        <IconButton
                                            color="primary"
                                            onClick={addNewField}
                                            disabled={
                                                fields.length >= MAX_FIELDS || hasDuplicateKeys()
                                            }
                                        >
                                            <AddCircleOutlineIcon />
                                        </IconButton>
                                    </span>
                                </Tooltip>
                            )}
                        </Grid>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
