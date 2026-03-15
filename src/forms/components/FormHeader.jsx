import React from "react";
import { Box, Paper, Typography, Button } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function FormHeader({ definition = {}, submitLabel = "Save", editing = false, onToggleEdit, onCancel, onCopy, onSubmit }) {
    return (
        <Paper elevation={0} sx={(theme) => ({ mb: 2, p: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--darkMedium)', color: theme.palette.primary.contrastText })}>
            <Typography variant="h6" sx={{ color: 'inherit' }}>{definition.title || 'Details'}</Typography>
            <Box>
                <Button variant="text" onClick={onCancel} startIcon={<ArrowBackIcon />} sx={{ mr: 1, color: 'inherit' }}>Back</Button>
                {submitLabel !== "Create" && (
                    <Button variant="text" onClick={onCopy} startIcon={<ContentCopyIcon />} sx={{ mr: 1, color: 'var(--onPrimary)', borderColor: 'var(--onPrimary)' }}>Copy</Button>
                )}

                {submitLabel !== "Create" && (
                    <Button
                        variant={editing ? "text" : "contained"}
                        onClick={onToggleEdit}
                        startIcon={editing ? <CancelIcon /> : <EditIcon />}
                        sx={{ mr: 1, color: 'var(--onPrimary)', borderColor: 'var(--onPrimary)', ...(editing ? {} : { border: '1px solid var(--onPrimary)' }) }}
                    >
                        {editing ? 'Cancel' : 'Edit'}
                    </Button>
                )}

                {(editing || submitLabel === "Create") && (
                    <Button variant="contained" onClick={onSubmit} startIcon={<SaveIcon />} sx={{ color: 'var(--onPrimary)', borderColor: 'var(--onPrimary)', border: '1px solid var(--onPrimary)' }}>{submitLabel}</Button>
                )}
            </Box>
        </Paper>
    );
}
