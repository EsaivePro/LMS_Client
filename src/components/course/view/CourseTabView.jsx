import React, { useRef, useState } from "react";
import { Box, Tabs, Tab, Card, Typography, TextField, Rating, Button } from "@mui/material";
import THEME from '../../../constants/theme';
import SlideDialog from '../../common/dialog/SlideDialog';
import { useMediaQuery } from '@mui/material';
import CurriculumView from './CurriculumView';

import CourseNotes from './CourseNotes';

const CourseTabView = ({ value, handleChange, selectedLesson, darkMode, courseDetail, curriculumProps, courseProgress }) => {
    const notesRef = useRef(null);
    const isMobile = useMediaQuery('(max-width:900px)');
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingTab, setPendingTab] = useState(null);

    const onTabChange = (e, newValue) => {
        // If switching away from Notes tab and notes component has unsaved changes, show confirm
        const isNotesDirty = notesRef.current?.isDirty?.() || false;
        // If user is currently on Notes tab (value === 1) and trying to change, or trying to leave Notes to anywhere
        if (isNotesDirty && value === 1 && newValue !== 1) {
            setPendingTab(newValue);
            setConfirmOpen(true);
            return;
        }

        // Otherwise proceed
        handleChange(e, newValue);
    };

    const handleConfirmClose = () => setConfirmOpen(false);

    const handleConfirmSave = async () => {
        setConfirmOpen(false);
        // save notes, then proceed
        try {
            await notesRef.current?.save?.();
        } catch (e) {
            // ignore
        }
        if (pendingTab !== null) handleChange(null, pendingTab);
        setPendingTab(null);
    };

    const handleConfirmDiscard = () => {
        // reset and proceed
        notesRef.current?.reset?.();
        setConfirmOpen(false);
        if (pendingTab !== null) handleChange(null, pendingTab);
        setPendingTab(null);
    };

    return (
        <>
            <Box sx={{ width: "100%", backgroundColor: THEME.colors.surface }}>
                {(() => {
                    const tabLabels = isMobile
                        ? ["Sections", "Course Overview", "Lesson Overview", "Notes"]
                        : ["Course Overview", "Lesson Overview", "Notes"];

                    return (
                        <Tabs
                            value={value}
                            onChange={onTabChange}
                            variant={isMobile ? "scrollable" : "standard"}
                            scrollButtons={isMobile ? "auto" : false}
                            // allowScrollButtonsMobile={isMobile}
                            sx={{
                                px: 0,
                                borderBottom: `1px solid ${THEME.colors.darkMedium}`,
                                "& .MuiTabs-indicator": {
                                    backgroundColor: THEME.colors.dark,
                                    height: 3,
                                    borderRadius: 2,
                                    zIndex: 2
                                }
                            }}
                        >
                            {tabLabels.map((label) => (
                                <Tab
                                    key={label}
                                    label={label}
                                    sx={{
                                        textTransform: "none",
                                        fontSize: "16px",
                                        fontWeight: 600,
                                        color: THEME.colors.darkMedium,
                                        minWidth: isMobile ? 120 : undefined,
                                        "&.Mui-selected": { color: THEME.colors.dark }
                                    }}
                                />
                            ))}
                        </Tabs>
                    );
                })()}
            </Box>

            {(() => {
                const tabLabels = isMobile
                    ? ["Sections", "Course Overview", "Lesson Overview", "Notes"]
                    : ["Course Overview", "Lesson Overview", "Notes"];

                const active = tabLabels[value] || tabLabels[0];

                switch (active) {
                    case "Sections":
                        return (
                            <Card sx={{ p: 0, minHeight: 140, boxShadow: 0, minHeight: 200 }} >
                                <CurriculumView {...(curriculumProps || {})} courseProgress={courseProgress} selectedLesson={selectedLesson} />
                            </Card>
                        );

                    case "Course Overview":
                        return courseDetail?.description ? (
                            <Card sx={{ p: isMobile ? 1.5 : 2.5, minHeight: 140, boxShadow: 0, minHeight: 200 }} >
                                <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                    {courseDetail.description}
                                </Typography>
                            </Card>
                        ) : null;

                    case "Lesson Overview":
                        return selectedLesson?.description ? (
                            <Card sx={{ p: isMobile ? 1.5 : 2.5, minHeight: 140, boxShadow: 0, minHeight: 200 }} >
                                <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
                                    {selectedLesson.description}
                                </Typography>
                            </Card>
                        ) : null;

                    case "Notes":
                        return <Card sx={{ p: isMobile ? 1.5 : 2.5, minHeight: 140, boxShadow: 0, minHeight: 200 }} >
                            <CourseNotes ref={notesRef} courseDetail={courseDetail} selectedLesson={selectedLesson} />
                        </Card>;

                    default:
                        return null;
                }
            })()}

            {value === 4 && (
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6">Write a Review</Typography>
                    <Rating size="large" sx={{ mb: 2 }} />
                    <TextField fullWidth multiline minRows={5} placeholder="Share your experience..." />
                    <Button variant="contained" sx={{ mt: 2 }}>Submit Review</Button>
                </Card>
            )}

            <SlideDialog
                open={confirmOpen}
                onClose={handleConfirmDiscard}
                title="You have unsaved changes"
                onSubmit={handleConfirmSave}
                submitLabel="Save"
                cancelLabel="Discard"
            >
                <Typography sx={{ mb: 2 }}>You have unsaved changes in Notes. Save changes before leaving?</Typography>
            </SlideDialog>
        </>
    );
};

export default CourseTabView;
