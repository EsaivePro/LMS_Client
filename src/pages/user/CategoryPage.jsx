import React, { useEffect, useState } from "react";
import { Box, Typography, Button, LinearProgress, List, ListItem, Chip, CircularProgress } from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import useEnrollment from "../../hooks/useEnrollment";
import { secondsToTime, formatDateTimeWithSeconds } from "../../utils/resolver.utils";
import THEME from "../../constants/theme";

export default function CategoryPage() {
    const { categoryId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { fetchCategoryAssignmentsForUser, enrollToCategory } = useEnrollment();

    const [loading, setLoading] = useState(false);
    const [enrollLoading, setEnrollLoading] = useState(false);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [isEnrolled, setIsEnrolled] = useState(false);

    useEffect(() => {
        let mounted = true;
        async function load() {
            if (!user || !user.id) return;
            setLoading(true);
            setError(null);
            try {
                const action = await fetchCategoryAssignmentsForUser({ userId: user.id, categoryId });
                const payload = action?.payload || action;
                const rows = (payload?.res?.data?.response || payload?.res?.data || payload?.response || payload) || [];
                if (mounted) {
                    setData(rows);
                    setIsEnrolled(Array.isArray(rows) && rows.length > 0);
                }
            } catch (e) {
                if (mounted) setError(e?.message || String(e));
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => { mounted = false; };
    }, [user, categoryId, fetchCategoryAssignmentsForUser]);

    async function handleEnroll() {
        if (!user || !user.id) {
            navigate('/login');
            return;
        }
        setEnrollLoading(true);
        setError(null);
        setProgress(0);
        try {
            const action = await enrollToCategory(user.id, categoryId);
            const payload = action?.payload || action;
            const rows = (payload?.res?.data?.response || payload?.res?.data || []) || [];
            setData(rows);
            setIsEnrolled(true);
            setProgress(100);
        } catch (e) {
            setError(e?.message || String(e));
        } finally {
            setEnrollLoading(false);
        }
    }

    return (
        <Box sx={{ p: { xs: 2, md: 4 }, maxWidth: 1000, mx: 'auto' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700}>Category {categoryId}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{isEnrolled ? 'Course Progress' : 'Enrollment Progress'}</Typography>
                </Box>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
            </Box>

            <Box sx={{ mb: 2 }}>
                {!isEnrolled && (
                    <Box sx={{ mb: 1 }}>
                        <Typography sx={{ mb: 1 }}>{enrollLoading ? 'Enrolling...' : ''}</Typography>
                        <LinearProgress variant="determinate" value={progress} sx={{ height: 10, borderRadius: 6 }} />
                        <Button variant="contained" sx={{ mt: 1, backgroundColor: THEME.colors.dark }} onClick={handleEnroll} disabled={enrollLoading}>{enrollLoading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Enroll'}</Button>
                    </Box>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error">{error}</Typography>
                ) : (
                    <List>
                        {(data || []).map((row, i) => (
                            <ListItem key={i} divider sx={{ alignItems: 'center' }}>
                                <Box sx={{ flex: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography sx={{ fontWeight: 700 }}>{row.title || `Course ${row.course_id}`}</Typography>
                                        {row.enrollment_result && !isEnrolled && (<Chip label={row.enrollment_result} size="small" variant="outlined" sx={{ ml: 1 }} />)}
                                    </Box>
                                    <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>{row.description}</Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>{`Duration: ${secondsToTime(row.duration)} • Lessons: ${row.total_lessons || 0}`}</Typography>
                                </Box>
                                <Box>
                                    {(['active', 'in_progress', 'inprogress', 'completed', 'complete'].includes((row.status || '').toLowerCase())) ? (
                                        <Button variant="contained" onClick={() => navigate(`/course/view/${row.course_id}`)}>View</Button>
                                    ) : (
                                        <Button variant="outlined" disabled>{row.enrollment_result === 'NOT_ENROLLED' ? 'Not Enrolled' : 'Pending'}</Button>
                                    )}
                                </Box>
                            </ListItem>
                        ))}
                    </List>
                )}
            </Box>
        </Box>
    );
}
