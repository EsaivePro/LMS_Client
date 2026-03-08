import React from 'react';
import { Box, Button, Stack } from '@mui/material';

export default function ActionBar({ onMark, onClear, onSaveNext, isMarked }) {
    return (
        <Box sx={{ position: 'sticky', bottom: 0, left: 0, right: 0, py: 1, bgcolor: 'background.paper', mt: 2, boxShadow: 3 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="flex-end" sx={{ px: { xs: 1, md: 0 } }}>
                <Button color="warning" variant="contained" onClick={onMark}>{isMarked ? 'Unmark' : 'Mark for Review'}</Button>
                <Button variant="outlined" onClick={onClear}>Clear Response</Button>
                <Button variant="contained" color="primary" onClick={onSaveNext}>Save & Next</Button>
            </Stack>
        </Box>
    );
}
