import React from 'react';
import { Box, Card, CardContent, Avatar, Typography, Chip, Stack, Button } from '@mui/material';
import QuestionGrid from './QuestionGrid';

export default function SidebarPanel({ questions, current, answeredSet, markedSet, onJump }) {
    return (
        <Box sx={{ p: { xs: 1, md: 2 } }}>
            <Card sx={{ mb: 2, borderRadius: 2, boxShadow: 2 }}>
                <CardContent>
                    <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
                        <Chip label={`Answered ${answeredSet.size}`} color="success" size="small" />
                        <Chip label={`Not Answered ${questions.length - answeredSet.size}`} color="error" size="small" />
                        <Chip label={`Marked ${markedSet.size}`} color="secondary" size="small" />
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ maxHeight: '55vh', overflow: 'auto' }}>
                <QuestionGrid questions={questions} current={current} answeredSet={answeredSet} markedSet={markedSet} onJump={onJump} />
            </Box>
        </Box>
    );
}
