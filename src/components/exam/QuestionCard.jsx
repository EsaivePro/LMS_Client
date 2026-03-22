import React from "react";
import {
    Typography, RadioGroup, FormControlLabel, Radio,
    Box, Checkbox, FormGroup, Chip
} from "@mui/material";

export default function QuestionCard({ question, questionIndex, selected, onSelect }) {
    if (!question) return null;

    const type = question.type; // 'mcq' | 'multiple_select' | 'true_false'

    // For multiple_select selected is an array; for others a single number
    const selectedArr = Array.isArray(selected)
        ? selected
        : (selected != null ? [Number(selected)] : []);

    function handleMultiToggle(optId) {
        const newArr = selectedArr.includes(optId)
            ? selectedArr.filter(id => id !== optId)
            : [...selectedArr, optId];
        onSelect(newArr);
    }

    const typeLabel = {
        mcq: 'Single Choice',
        multiple_select: 'Multiple Select',
        true_false: 'True / False',
    }[type] || type;

    const typeColor = {
        mcq: { bg: '#eff6ff', color: '#1d4ed8' },
        multiple_select: { bg: '#f0fdf4', color: '#15803d' },
        true_false: { bg: '#fff7ed', color: '#c2410c' },
    }[type] || { bg: '#f3f4f6', color: '#374151' };

    return (
        <Box>
            {/* Question header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                    Question {questionIndex}
                </Typography>
                {/* <Chip
                    label={typeLabel}
                    size="small"
                    sx={{
                        fontSize: '0.72rem', height: 22, fontWeight: 600,
                        bgcolor: typeColor.bg, color: typeColor.color,
                    }}
                /> */}
            </Box>

            <Typography variant="h6" sx={{ mb: 3, fontWeight: 500, lineHeight: 1.5 }}>
                {question.text}
            </Typography>

            {/* ── MCQ / True-False: Radio ── */}
            {(type === 'mcq' || type === 'true_false') && (
                <RadioGroup
                    value={selected ?? ""}
                    onChange={(e) => onSelect(Number(e.target.value))}
                >
                    {question.rawOptions.map((opt) => {
                        const isSelected = Number(selected) === opt.id;
                        return (
                            <Box key={opt.id} sx={{
                                border: isSelected ? '1.5px solid #1976d2' : '1px solid #e5e7eb',
                                borderRadius: 2, mb: 1,
                                bgcolor: isSelected ? '#eff6ff' : 'transparent',
                                transition: 'border-color 0.15s, background 0.15s',
                            }}>
                                <FormControlLabel
                                    value={opt.id}
                                    control={<Radio size="small" />}
                                    label={opt.option_text}
                                    sx={{ width: '100%', p: 1, m: 0 }}
                                />
                            </Box>
                        );
                    })}
                </RadioGroup>
            )}

            {/* ── Multiple Select: Checkboxes ── */}
            {type === 'multiple_select' && (
                <>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
                        Select all that apply
                    </Typography>
                    <FormGroup>
                        {question.rawOptions.map((opt) => {
                            const checked = selectedArr.includes(opt.id);
                            return (
                                <Box key={opt.id} sx={{
                                    border: checked ? '1.5px solid #1976d2' : '1px solid #e5e7eb',
                                    borderRadius: 2, mb: 1,
                                    bgcolor: checked ? '#eff6ff' : 'transparent',
                                    transition: 'border-color 0.15s, background 0.15s',
                                }}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                size="small"
                                                checked={checked}
                                                onChange={() => handleMultiToggle(opt.id)}
                                                sx={{ '&.Mui-checked': { color: '#1976d2' } }}
                                            />
                                        }
                                        label={opt.option_text}
                                        sx={{ width: '100%', p: 1, m: 0 }}
                                    />
                                </Box>
                            );
                        })}
                    </FormGroup>
                </>
            )}
        </Box>
    );
}
