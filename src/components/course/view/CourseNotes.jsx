import React, { useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { Box, Card, Button, Typography, Stack, IconButton, useTheme, useMediaQuery } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useDispatch } from "react-redux";
import { useAuth } from "../../../hooks/useAuth";
import { fetchUserNotes, addUserNote, updateUserNote } from "../../../redux/slices/coursesSlice";
import THEME from '../../../constants/theme';
import RichTextEditor from '../../../components/common/editor/RichTextEditor';

const CourseNotes = forwardRef(({ courseDetail, selectedLesson }, ref) => {
    const dispatch = useDispatch();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { user } = useAuth();
    const [text, setText] = useState("");
    const [savedText, setSavedText] = useState("");
    const [noteId, setNoteId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [editing, setEditing] = useState(false);

    const courseId = courseDetail?.id || courseDetail?.courseId || courseDetail?.course_id;
    const userId = user?.id;
    const initialFetchRef = useRef(false);

    useEffect(() => {
        if (!userId || !courseId) return;
        (async () => {
            setLoading(true);
            try {
                const res = await dispatch(fetchUserNotes({ user_id: userId, course_id: courseId }));
                const note = res?.payload?.data?.response;
                if (note) {
                    setText(note.notes || "");
                    setSavedText(note.notes || "");
                    setNoteId(note.id);
                } else {
                    setText("");
                    setSavedText("");
                    setNoteId(null);
                }
            } catch (e) {
                console.error(e);
            } finally {
                setLoading(false);
                initialFetchRef.current = true;
            }
        })();
    }, [userId, courseId, dispatch]);

    useImperativeHandle(ref, () => ({
        isDirty: () => {
            return initialFetchRef.current && (String(text) !== String(savedText));
        },
        save: async () => {
            await handleSave();
        },
        reset: () => {
            setText(savedText);
            setEditing(false);
        }
    }));

    const handleSave = async () => {
        if (!userId || !courseId) return;
        setLoading(true);
        try {
            if (noteId) {
                await dispatch(updateUserNote({ id: noteId, data: { notes: text, updated_by: userId } }));
            } else {
                await dispatch(addUserNote({ user_id: userId, course_id: courseId, notes: text, created_by: userId }));
            }
            // update saved state
            setSavedText(text);
            setEditing(false);
        } catch (e) {
            console.error(e);
        } finally {
            // re-fetch to sync id
            const res = await dispatch(fetchUserNotes({ user_id: userId, course_id: courseId }));
            const note = res?.payload?.data?.response;
            if (note) setNoteId(note.id);
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        try {
            const plain = (text || '').replace(/<[^>]+>/g, '');
            await navigator.clipboard.writeText(plain);
        } catch (e) {
            console.error('Copy failed', e);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography
                    variant="h6"
                    sx={{
                        color: THEME.colors.dark,
                        fontWeight: 700,
                        fontSize: isMobile ? '1rem' : '1.125rem'
                    }}
                >Your Notes</Typography>
                <Box>
                    {!editing && (
                        <>
                            <IconButton aria-label="copy" onClick={handleCopy} sx={{ color: THEME.colors.darkMedium }} size={isMobile ? 'small' : 'medium'}>
                                <ContentCopyIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconButton>
                            <IconButton aria-label="edit" onClick={() => setEditing(true)} sx={{ color: THEME.colors.dark }} size={isMobile ? 'small' : 'medium'}>
                                <EditIcon fontSize={isMobile ? 'small' : 'medium'} />
                            </IconButton>
                        </>
                    )}
                </Box>
            </Box>

            {!editing ? (
                <Box>
                    {/* render saved HTML */}
                    <div
                        style={{
                            fontSize: isMobile ? 14 : 16,
                            color: savedText ? undefined : '#757575'
                        }}
                        dangerouslySetInnerHTML={{ __html: savedText || '<div>No notes yet.</div>' }}
                    />
                </Box>
            ) : (
                <Box sx={{ mt: 1, '& .ql-editor': { minHeight: isMobile ? 120 : 220 } }}>
                    <RichTextEditor value={text} onChange={setText} placeholder="Write your notes here..." />
                    <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                        <Button
                            size={isMobile ? 'small' : 'medium'}
                            variant="contained"
                            onClick={handleSave}
                            disabled={loading}
                            sx={{ backgroundColor: THEME.colors.dark, color: THEME.colors.onPrimary, '&:hover': { backgroundColor: THEME.colors.darkMedium }, fontSize: isMobile ? '0.8125rem' : undefined }}
                        >
                            Save
                        </Button>
                        <Button
                            size={isMobile ? 'small' : 'medium'}
                            variant="outlined"
                            onClick={() => { setText(savedText); setEditing(false); }}
                            sx={{ borderColor: THEME.colors.darkMedium, color: THEME.colors.darkMedium, fontSize: isMobile ? '0.8125rem' : undefined }}
                        >
                            Cancel
                        </Button>
                    </Stack>
                </Box>
            )}
        </Box>
    );
});

export default CourseNotes;
