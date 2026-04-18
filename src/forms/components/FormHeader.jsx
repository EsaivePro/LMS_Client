import { Box, Typography, Button, Chip, Divider } from "@mui/material";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';

export default function FormHeader({ definition = {}, submitLabel = "Save", editing = false, onToggleEdit, onCancel, onCopy, onSubmit }) {
    return (
        <Box
            sx={{
                position: 'fixed',
                top: { xs: 56, sm: 64 },
                left: 0,
                right: 0,
                zIndex: 1100,
                px: { xs: 1.5, sm: 3, md: 4 },
                py: { xs: 1.25, sm: 1.5 },
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 1.5,
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                background: 'rgba(255,255,255,0.88)',
                borderTop: '1px solid rgba(0,0,0,0.08)',
                boxShadow: '0 -4px 24px rgba(0,0,0,0.08)',
            }}
        >
            {/* ── Left: Back + Title ── */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, minWidth: 0, flex: 1 }}>
                <Button
                    variant="text"
                    onClick={onCancel}
                    startIcon={<ArrowBackIcon />}
                    sx={{
                        color: 'text.secondary',
                        fontWeight: 500,
                        fontSize: { xs: 12, sm: 13 },
                        px: { xs: 1, sm: 1.5 },
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        '&:hover': {
                            color: 'var(--primary)',
                            backgroundColor: 'rgba(0,0,0,0.04)',
                            transform: 'translateX(-2px)',
                        },
                        transition: 'all 0.2s',
                    }}
                >
                    Back
                </Button>

                <Divider orientation="vertical" flexItem sx={{ mx: 0.25 }} />

                <Typography
                    sx={{
                        fontWeight: 600,
                        fontSize: { xs: '0.85rem', sm: '0.95rem' },
                        color: 'var(--dark)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        minWidth: 0,
                    }}
                >
                    {definition.title || 'Details'}
                </Typography>

                {editing && (
                    <Chip
                        label="Editing"
                        size="small"
                        sx={{
                            fontSize: 10,
                            fontWeight: 600,
                            textTransform: 'uppercase',
                            letterSpacing: 0.5,
                            color: 'var(--primary)',
                            backgroundColor: 'var(--primaryLight, #e8f0fe)',
                            border: '1px solid var(--primary)',
                            flexShrink: 0,
                            height: 20,
                            '@keyframes fadeIn': {
                                from: { opacity: 0, transform: 'scale(0.85)' },
                                to: { opacity: 1, transform: 'scale(1)' },
                            },
                            animation: 'fadeIn 0.2s ease',
                        }}
                    />
                )}
            </Box>

            {/* ── Right: Action buttons ── */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: 0.75, sm: 1 },
                    flexShrink: 0,
                }}
            >
                {submitLabel !== "Create" && (
                    <>
                        {/* Copy */}
                        <Button
                            variant="outlined"
                            onClick={onCopy}
                            startIcon={<ContentCopyIcon fontSize="small" />}
                            sx={{
                                fontSize: { xs: 11, sm: 13 },
                                fontWeight: 500,
                                px: { xs: 1, sm: 1.75 },
                                whiteSpace: 'nowrap',
                                borderColor: 'divider',
                                color: 'text.secondary',
                                display: { xs: 'none', sm: 'inline-flex' },
                                '&:hover': {
                                    borderColor: 'var(--primary)',
                                    color: 'var(--primary)',
                                    backgroundColor: 'var(--primaryLight, #e8f0fe)',
                                },
                                transition: 'all 0.2s',
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
                                fontSize: { xs: 11, sm: 13 },
                                fontWeight: 500,
                                px: { xs: 1.25, sm: 1.75 },
                                whiteSpace: 'nowrap',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
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
                            fontSize: { xs: 12, sm: 13 },
                            fontWeight: 700,
                            px: { xs: 1.5, sm: 2.25 },
                            whiteSpace: 'nowrap',
                            background: 'linear-gradient(135deg, var(--primary) 0%, var(--darkMedium, #1a3a6b) 100%)',
                            boxShadow: '0 3px 10px rgba(0,0,0,0.18)',
                            letterSpacing: 0.3,
                            '@keyframes slideUp': {
                                from: { opacity: 0, transform: 'translateY(6px)' },
                                to: { opacity: 1, transform: 'translateY(0)' },
                            },
                            animation: 'slideUp 0.22s ease',
                            transition: 'all 0.2s',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 6px 18px rgba(0,0,0,0.22)',
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
        </Box>
    );
}
