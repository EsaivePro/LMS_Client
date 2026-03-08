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

export default function QuestionGrid({ questions, current, answeredSet, markedSet, onJump }) {
    return (
        <Box sx={{ mt: 2 }}>
            <Grid container spacing={1}>
                {questions.map((q) => {
                    const state = answeredSet.has(q.id) ? 'answered' : markedSet.has(q.id) ? 'marked' : 'notVisited';
                    return (
                        <Grid item xs={12} sm={2.4} md={2.4} key={q.id}>
                            <Button
                                onClick={() => onJump(q.id - 1)}
                                variant={current === q.id - 1 ? 'outlined' : 'contained'}
                                sx={(theme) => ({
                                    minWidth: 44,
                                    width: '100%',
                                    height: 44,
                                    bgcolor: current === q.id - 1 ? 'background.paper' : getColorTheme(state, theme),
                                    color: current === q.id - 1 ? 'primary.main' : 'common.white',
                                    borderColor: current === q.id - 1 ? theme.palette.primary.main : undefined,
                                    '&:hover': { transform: 'translateY(-2px)' },
                                    borderRadius: 1,
                                })}
                            >
                                {q.id}
                            </Button>
                        </Grid>
                    );
                })}
            </Grid>
        </Box>
    );
}
