import React from 'react';
import { Box, Card, CardContent, Avatar, Typography, Chip, Stack, Button, Divider } from '@mui/material';
import QuestionGrid from './QuestionGrid';

export default function SidebarPanel({ questions = [], current, answeredSet = new Set(), markedSet = new Set(), onJump, displayName = 'User', userInitial = 'U', roleName = '', timeLeft = 0 }) {
    return (
        <Box>
            <Card sx={{ borderRadius: 0, boxShadow: 0 }}>
                <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main' }}>{userInitial}</Avatar>
                        <Box sx={{ display: 'flex', flexDirection: 'column', lineHeight: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, py: 0 }}>{displayName}</Typography>
                            {roleName && <Typography variant="caption" color="text.secondary" sx={{ py: 0 }}>{roleName}</Typography>}
                        </Box>
                    </Box>

                    <Stack direction="row" spacing={1} sx={{ mt: 2, boxShadow: 0 }}>
                        <Chip label={`Answered ${answeredSet.size}`} color="success" size="small" />
                        <Chip label={`Not Answered ${Math.max(0, (questions.length || 0) - answeredSet.size)}`} color="error" size="small" />
                        <Chip label={`Marked ${markedSet.size}`} color="secondary" size="small" />
                    </Stack>
                </CardContent>
            </Card>

            <Card sx={{ mb: 0, borderRadius: 1, boxShadow: 0 }}>
                <CardContent>
                    <Stack spacing={1}>
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: 'primary.main', borderRadius: '50%' }} />
                                <Typography variant="caption">Current</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: 'success.main', borderRadius: '50%' }} />
                                <Typography variant="caption">Answered</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: 'error.main', borderRadius: '50%' }} />
                                <Typography variant="caption">Not Answered</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Box sx={{ width: 12, height: 12, bgcolor: 'secondary.main', borderRadius: '50%' }} />
                                <Typography variant="caption">Marked for Review</Typography>
                            </Box>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            <Box sx={{ maxHeight: '62vh', overflow: 'auto', p: 1 }}>
                <QuestionGrid questions={questions} current={current} answeredSet={answeredSet} markedSet={markedSet} onJump={onJump} />
            </Box>
        </Box>
    );
}
