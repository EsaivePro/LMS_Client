import React from "react";
import { Box, Tabs, Tab, Card, Typography, TextField, Rating, Button } from "@mui/material";

const CourseTabView = ({ value, handleChange, selectedLesson, darkMode }) => {
    return (
        <>
            <Box sx={{ borderBottom: "1px solid var(--lightgrey)", width: "100%", backgroundColor: "var(--surface)" }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    sx={{
                        px: 2,
                        "& .MuiTabs-indicator": { backgroundColor: "var(--textPrimary)", height: 2 }
                    }}
                >
                    {/* <Tab label="Overview" sx={{ textTransform: "none", fontSize: "16px", fontWeight: 600 }} />
                    <Tab label="Notes" sx={{ textTransform: "none", fontSize: "16px", fontWeight: 600 }} />
                    <Tab label="Reviews" sx={{ textTransform: "none", fontSize: "16px", fontWeight: 600 }} /> */}
                </Tabs>
            </Box>

            {/* {value === 0 && selectedLesson?.description && (
                <Card sx={{ p: 2.5 }}>
                    <Typography variant="body1" sx={{ lineHeight: 1.7, whiteSpace: "pre-line" }}>
                        {selectedLesson.description}
                    </Typography>
                </Card>
            )} */}

            {/* {value === 1 && (
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6">Your Notes</Typography>
                    <TextField fullWidth multiline minRows={6} placeholder="Write your notes here..." sx={{ mt: 2 }} />
                </Card>
            )}

            {value === 2 && (
                <Card sx={{ p: 3 }}>
                    <Typography variant="h6">Write a Review</Typography>
                    <Rating size="large" sx={{ mb: 2 }} />
                    <TextField fullWidth multiline minRows={5} placeholder="Share your experience..." />
                    <Button variant="contained" sx={{ mt: 2 }}>Submit Review</Button>
                </Card>
            )} */}
        </>
    );
};

export default CourseTabView;
