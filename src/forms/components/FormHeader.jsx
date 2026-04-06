import React from "react";
import { Box, Paper, Typography, Button, Divider, Chip } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Tooltip, IconButton } from '@mui/material';
import DriveFileMoveRtlIcon from '@mui/icons-material/DriveFileMoveRtl';
export default function FormHeader({ definition = {}, submitLabel = "Save", editing = false, onToggleEdit, onCancel, onCopy, onSubmit }) {
    return (
        <Paper
            elevation={0}
            sx={{
                mt: { xs: 1, lg: 0 },
                mb: 1,
                px: { xs: 1, sm: 1.5 },
                py: { xs: 1.5, sm: 1.1 },
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'stretch', sm: 'center' },
                gap: { xs: 0.75, sm: 1 },
                background: "linear-gradient(135deg, #f8f9fb 0%, #fdfdff 50%, #ffffff 100%)",
                borderRadius: 1.5,
                width: '100%',
            }}
        >
            {/* ── Left: Title + editing badge ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0, width: { xs: '100%', sm: 'auto' } }}>

                {/* Back Button */}
                <DriveFileMoveRtlIcon sx={{
                    fontSize: 25,
                    color: 'var(--primary)',
                    // '&:hover': {
                    //     color: 'rgba(0,0,0,0.05)',
                    // }
                }} onClick={onCancel} />

                {/* Title */}
                <Typography
                    variant="h6"
                    sx={{
                        flex: 1,
                        minWidth: 0,
                        color: 'var(--dark)',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        wordBreak: 'break-word',
                    }}
                >
                    {definition.title || 'Details'}
                </Typography>

                {/* Editing Chip */}
                {/* {editing && (
                    <Chip
                        label="Editing"
                        size="small"
                        sx={{
                            fontSize: 10,
                            // height: 20,
                            textTransform: 'uppercase',
                            color: 'var(--primary)',
                            backgroundColor: 'var(--onPrimary)',
                            border: '1px solid var(--primary)',
                            '@keyframes fadeSlideIn': {
                                from: { opacity: 0, transform: 'translateX(-8px)' },
                                to: { opacity: 1, transform: 'translateX(0)' },
                            },
                            animation: 'fadeSlideIn 0.25s ease',
                        }}
                    />
                )} */}
            </Box>

            {/* ── Right: Action buttons ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    flexWrap: 'nowrap',
                    justifyContent: { xs: 'space-between', sm: 'flex-end' },
                    gap: { xs: 0.5, sm: 1 },
                    width: { xs: '100%', sm: 'auto' },
                    overflow: 'hidden',
                    pb: 0.1,
                }}
            >

                {/* Back */}
                <Button
                    variant="text"
                    onClick={onCancel}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        flex: '0 1 auto',
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: 11, sm: 14 },
                        minWidth: 0,
                        px: { xs: 0.6, sm: 1.5 },
                        whiteSpace: 'nowrap',
                        '& .MuiButton-startIcon': {
                            display: 'inline-flex',
                            mr: { xs: 0.4, sm: 1 },
                        },
                        transition: 'all 0.2s',
                        '&:hover': {
                            color: 'var(--primary)',
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            transform: 'translateX(-2px)',
                        },
                    }}
                >
                    Back
                </Button>

                {submitLabel !== "Create" && (
                    <>
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.25, display: { xs: 'none', sm: 'block' } }} />

                        {/* Copy */}
                        <Button
                            variant="outlined"
                            onClick={onCopy}
                            startIcon={<ContentCopyIcon fontSize="small" />}
                            sx={{
                                flex: '0 1 auto',
                                fontSize: { xs: 11, sm: 13 },
                                fontWeight: 500,
                                minWidth: 0,
                                px: { xs: 0.75, sm: 1.5 },
                                whiteSpace: 'nowrap',
                                '& .MuiButton-startIcon': {
                                    display: 'inline-flex',
                                    mr: { xs: 0.4, sm: 1 },
                                },
                                borderColor: 'var(--primary)',
                                color: 'var(--primary)',
                                transition: 'all 0.22s',
                                '&:hover': {
                                    backgroundColor: 'var(--primary)',
                                    color: '#fff',
                                    borderColor: 'var(--primary)',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.14)',
                                },
                            }}
                        >
                            Copy
                        </Button>

                        {/* Edit / Cancel-edit */}
                        <Button
                            variant={editing ? "outlined" : "contained"}
                            onClick={onToggleEdit}
                            startIcon={editing ? <CancelIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                            color={editing ? "error" : "primary"}
                            sx={{
                                flex: '0 1 auto',
                                fontSize: { xs: 11, sm: 13 },
                                fontWeight: 500,
                                minWidth: 0,
                                px: { xs: 0.75, sm: 1.5 },
                                whiteSpace: 'nowrap',
                                '& .MuiButton-startIcon': {
                                    display: 'inline-flex',
                                    mr: { xs: 0.4, sm: 1 },
                                },
                                transition: 'all 0.22s',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 10px rgba(0,0,0,0.14)',
                                },
                            }}
                        >
                            {editing ? 'Cancel' : 'Edit'}
                        </Button>
                    </>
                )}

                {/* Save / Create */}
                {(editing || submitLabel === "Create") && (
                    <Button
                        variant="contained"
                        onClick={onSubmit}
                        startIcon={<SaveIcon fontSize="small" />}
                        sx={{
                            flex: '0 1 auto',
                            fontSize: { xs: 11, sm: 13 },
                            fontWeight: 600,
                            minWidth: 0,
                            px: { xs: 0.85, sm: 1.75 },
                            whiteSpace: 'nowrap',
                            '& .MuiButton-startIcon': {
                                display: 'inline-flex',
                                mr: { xs: 0.4, sm: 1 },
                            },
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--darkMedium) 100%)',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                            transition: 'all 0.22s',
                            '@keyframes slideInRight': {
                                from: { opacity: 0, transform: 'translateX(10px)' },
                                to: { opacity: 1, transform: 'translateX(0)' },
                            },
                            animation: 'slideInRight 0.25s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 16px rgba(0,0,0,0.22)',
                            },
                            '&:active': {
                                transform: 'translateY(0)',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            },
                        }}
                    >
                        {submitLabel}
                    </Button>
                )}
            </Box>
        </Paper>
    );
}
