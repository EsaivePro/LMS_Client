import React from 'react';
import { Card, CardContent, Typography, RadioGroup, FormControlLabel, Radio, Box, Fade } from '@mui/material';

export default function QuestionCard({ question, questionIndex, selected, onSelect }) {
    if (!question) return null;

    return (
        <Fade in timeout={300}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent sx={{ pb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                        Question No. {questionIndex + 1}
                    </Typography>

                    <Typography variant="h6" sx={{ mb: 2 }}>{question.text}</Typography>

                    <Box>
                        <RadioGroup value={selected ?? ''} onChange={(e) => onSelect(e.target.value)}>
                            {question.options.map((opt, idx) => (
                                <FormControlLabel
                                    key={idx}
                                    value={String(idx)}
                                    control={<Radio />}
                                    label={<Typography variant="body1">{opt}</Typography>}
                                    sx={{
                                        mb: 1,
                                        borderRadius: 1,
                                        px: 1,
                                        '&:hover': { bgcolor: 'action.hover', transition: 'background-color 150ms' },
                                    }}
                                />
                            ))}
                        </RadioGroup>
                    </Box>
                </CardContent>
            </Card>
        </Fade>
    );
}
