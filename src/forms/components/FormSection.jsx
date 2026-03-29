import React from "react";
import { Box, Paper, Typography } from "@mui/material";
import FormRender from "./FormRender";

const FormSection = React.forwardRef(function FormSection(props, ref) {
    const {
        section,
        values,
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
    } = props;

    const rows = [];
    let current = [];
    let currentSum = 0;
    const fields = section.fields || [];
    for (const f of fields) {
        const isFull = f.fullWidth || f.type === 'textarea' || f.type === 'table' || f.type === 'record-picker';
        const mdUnits = isFull ? 12 : (f.col || 4);
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
        <Paper sx={{ p: 3, mb: 2 }} ref={ref}>
            <Typography variant="h6" sx={{ mb: 2 }}>{section.title}</Typography>
            {rows.map((row, rIdx) => (
                <Box key={rIdx} sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                    {row.map((cell) => (
                        <Box
                            key={cell.field.name}
                            sx={(theme) => ({
                                boxSizing: 'border-box',
                                p: 0,
                                pr: 1,
                                flex: '0 0 100%',
                                [theme.breakpoints.up('sm')]: { flex: `0 0 ${cell.isFull ? '100%' : '50%'}` },
                                [theme.breakpoints.up('md')]: { flex: `0 0 ${cell.isFull ? '100%' : '33.3333%'}` },
                                [theme.breakpoints.up('lg')]: { flex: `0 0 ${cell.isFull ? '100%' : '25%'}` },
                            })}
                        >
                            <FormRender
                                field={cell.field}
                                value={values[cell.field.name]}
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
                            />
                        </Box>
                    ))}
                </Box>
            ))}
        </Paper>
    );
});

export default FormSection;
