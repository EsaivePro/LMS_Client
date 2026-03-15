import React from 'react';
import { Box, Button, Grid } from '@mui/material';

function getColorTheme(state, theme) {
    switch (state) {
        case 'answered':
            return theme.palette.success.main;
        case 'marked':
            return theme.palette.secondary.main;
        case 'notAnswered':
            return theme.palette.error.main;
        default:
            return theme.palette.grey[400];
    }
}

export default function QuestionGrid({ questions, current, answeredSet = new Set(), markedSet = new Set(), onJump }) {
    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
                {questions.map((q, idx) => {
                    const number = idx + 1;
                    const state = answeredSet.has(number) ? 'answered' : markedSet.has(number) ? 'marked' : 'notAnswered';
                    return (
                        <Grid item xs={3} sm={2} md={2} key={q.id || number}>
                            <Button
                                onClick={() => onJump(idx)}
                                variant={current === idx ? 'outlined' : 'contained'}
                                sx={(theme) => ({
                                    minWidth: 44,
                                    width: 44,
                                    height: 44,
                                    bgcolor: current === idx ? 'background.paper' : getColorTheme(state, theme),
                                    color: current === idx ? 'primary.main' : 'common.white',
                                    borderColor: current === idx ? theme.palette.primary.main : undefined,
                                    '&:hover': { transform: 'translateY(-2px)' },
                                    borderRadius: '50%',
                                    fontWeight: 700,
                                })}
                            >
                                {number}
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
