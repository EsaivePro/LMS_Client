import React from "react";
import { Box, Paper, Typography } from "@mui/material";
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

    const rows = [];
    let current = [];
    let currentSum = 0;
    const fields = section.fields || [];
    for (const f of fields) {
        const isFull = f.fullWidth || f.type === 'textarea' || f.type === 'table' || f.type === 'record-picker' || f.type === 'record-assigned';
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
                    {row.map((cell) => (
                        <Box
                            key={cell.field.name}
                            sx={(theme) => ({
                                boxSizing: 'border-box',
                                minWidth: 0,
                                width: '100%',
                                px: { xs: 0.5, sm: 0.75 },
                                pb: { xs: 1.25, sm: 1.5 },
                                flex: '0 0 100%',
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
                                editing={editing}
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
                        </Box>
                    ))}
                </Box>
            ))}
        </Paper>
    );
});

export default FormSection;
