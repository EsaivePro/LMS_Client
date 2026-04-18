import React from "react";
import { Box, Paper, Typography, Tooltip } from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import FormRender from "./FormRender";

const FormSection = React.forwardRef(function FormSection(props, ref) {
    const {
        section,
        values,
        recordId,
        handleChange,
        editing,
        invalidFields,
        setInvalidFields,
        optionsCache,
        optionsLoading,
        handleSearchInput,
        fetchOptionsForSource,
        resolveOptionLabel,
        showError,
        saveKey,
    } = props;

    // createOnly fields are locked once a record exists (not in create mode)
    const isCreateMode = !recordId || recordId === "create";

    const rows = [];
    let current = [];
    let currentSum = 0;
    const fields = section.fields || [];
    for (const f of fields) {
        const isFull = f.fullWidth || f.type === 'textarea' || f.type === 'table' || f.type === 'record-picker' || f.type === 'record-assigned' || f.type === 'record-dailog';
        const mdUnits = isFull ? 12 : (f.col || 6);
        if (isFull) {
            if (current.length) {
                rows.push(current);
                current = [];
                currentSum = 0;
            }
            rows.push([{ field: f, mdUnits, isFull }]);
        } else {
            if (currentSum + mdUnits > 12) {
                rows.push(current);
                current = [];
                currentSum = 0;
            }
            current.push({ field: f, mdUnits, isFull });
            currentSum += mdUnits;
        }
    }
    if (current.length) rows.push(current);

    return (
        <Paper sx={{ p: { xs: 1.5, sm: 2, md: 3 }, mb: 2, width: '100%', overflow: 'hidden' }} ref={ref}>
            <Typography variant="h6" sx={{ mb: 2 }}>{section.title}</Typography>
            {rows.map((row, rIdx) => (
                <Box key={rIdx} sx={{ display: 'flex', flexWrap: 'wrap', mb: { xs: 1, sm: 1.5 }, mx: { xs: 0, sm: -0.75 } }}>
                    {row.map((cell) => {
                        const isLocked = !!cell.field.createOnly && !isCreateMode;
                        const effectiveEditing = isLocked ? false : editing;

                        return (
                            <Box
                                key={cell.field.name}
                                sx={(theme) => ({
                                    boxSizing: 'border-box',
                                    minWidth: 0,
                                    width: '100%',
                                    px: { xs: 0.5, sm: 0.75 },
                                    pb: { xs: 1.25, sm: 1.5 },
                                    flex: '0 0 100%',
                                    position: 'relative',
                                    [theme.breakpoints.up('sm')]: { flex: `0 0 ${cell.isFull ? '100%' : '50%'}` },
                                    [theme.breakpoints.up('md')]: { flex: `0 0 ${cell.isFull ? '100%' : '50%'}` },
                                    [theme.breakpoints.up('lg')]: { flex: `0 0 ${cell.isFull ? '100%' : '50%'}` },
                                })}
                            >
                                <FormRender
                                    field={cell.field}
                                    value={values[cell.field.name]}
                                    formValues={values}
                                    recordId={recordId}
                                    onChange={handleChange}
                                    editing={effectiveEditing}
                                    invalidFields={invalidFields}
                                    setInvalidFields={setInvalidFields}
                                    optionsCache={optionsCache}
                                    optionsLoading={optionsLoading}
                                    handleSearchInput={handleSearchInput}
                                    fetchOptionsForSource={fetchOptionsForSource}
                                    resolveOptionLabel={resolveOptionLabel}
                                    showError={showError}
                                    saveKey={saveKey}
                                />

                                {/* Lock indicator — always shown for createOnly fields */}
                                {cell.field.createOnly && (
                                    <Tooltip
                                        title={isLocked
                                            ? "This field was set during creation and cannot be edited."
                                            : "This field can only be set now. It cannot be changed after creation."}
                                        arrow
                                        placement="top"
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                right: { xs: 4, sm: 6 },
                                                display: 'flex',
                                                alignItems: 'center',
                                                cursor: 'help',
                                                color: isLocked ? 'text.disabled' : 'warning.main',
                                                '&:hover': { color: isLocked ? 'error.main' : 'warning.dark' },
                                                transition: 'color 0.2s',
                                            }}
                                        >
                                            <LockOutlinedIcon sx={{ fontSize: 14 }} />
                                        </Box>
                                    </Tooltip>
                                )}
                            </Box>
                        );
                    })}
                </Box>
            ))}
        </Paper>
    );
});

export default FormSection;
