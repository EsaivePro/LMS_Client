import React from "react";
import { Box, Card, CardContent, Avatar, Typography, Chip } from "@mui/material";
import QuestionGrid from "./QuestionGrid";

export default function SidebarPanel({
    questions,
    current,
    answeredSet,
    markedSet,
    onJump,
    displayName,
    userInitial,
    roleName
}) {
    return (
        <>
            <Card sx={{ borderRadius: 0 }}>
                <CardContent>
                    <Box sx={{ display: "flex", gap: 2 }}>
                        <Avatar>{userInitial}</Avatar>

                        <Box>
                            <Typography>{displayName}</Typography>
                            <Typography variant="caption">{roleName}</Typography>
                        </Box>
                    </Box>

                    <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                        <Chip label={`Answered ${answeredSet.size}`} color="success" />
                        <Chip label={`Marked ${markedSet.size}`} color="secondary" />
                    </Box>
                </CardContent>
            </Card>

            <Box
                sx={{
                    flex: 1,
                    overflowY: "auto",
                    p: 2
                }}
            >
                <QuestionGrid
                    questions={questions}
                    current={current}
                    answeredSet={answeredSet}
                    markedSet={markedSet}
                    onJump={onJump}
                />
            </Box>
        </>
    );
}