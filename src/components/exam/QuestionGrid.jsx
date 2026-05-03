import React from "react";
import { Box, Button } from "@mui/material";

export default function QuestionGrid({
    questions,
    current,
    answeredSet,
    markedSet,
    onJump
}) {
    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 1
            }}
        >
            {questions.map((q, idx) => {
                const isAnswered = answeredSet.has(q.id);
                const isMarked = markedSet.has(q.id);
                const isCurrent = current === q.id;
                const bgColor = isCurrent ? "#fff" : isAnswered ? "#22c55e" : isMarked ? "#a855f7" : "#4b5563";

                return (
                    <Button
                        key={q.id}
                        onClick={() => onJump(q.id)}
                        variant={isCurrent ? "outlined" : "contained"}
                        sx={{
                            minWidth: 42,
                            height: 42,
                            bgcolor: bgColor,
                            color: isCurrent ? "primary.main" : "#fff",
                            borderRadius: 2,
                            '&:hover': { bgcolor: isCurrent ? '#f0f0f0' : bgColor, opacity: 0.9 }
                        }}
                    >
                        {idx + 1}
                    </Button>
                );
            })}
        </Box>
    );
}