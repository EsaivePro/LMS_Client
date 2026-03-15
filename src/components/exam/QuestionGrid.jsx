import React from "react";
import { Box, Button } from "@mui/material";

export default function QuestionGrid({
    questions,
    current,
    answeredSet,
    markedSet,
    onJump
}) {
    const getColor = (number) => {
        if (answeredSet.has(number)) return "#22c55e";
        if (markedSet.has(number)) return "#a855f7";
        return "#4b5563";
    };

    return (
        <Box
            sx={{
                display: "grid",
                gridTemplateColumns: "repeat(5,1fr)",
                gap: 1
            }}
        >
            {questions.map((q, idx) => {
                const number = idx;

                return (
                    <Button
                        key={number}
                        onClick={() => onJump(q.id)}
                        variant={current === q.id ? "outlined" : "contained"}
                        sx={{
                            minWidth: 42,
                            height: 42,
                            bgcolor: current === q.id ? "#fff" : getColor(number),
                            color: current === q.id ? "primary.main" : "#fff",
                            borderRadius: 2
                        }}
                    >
                        {number}
                    </Button>
                );
            })}
        </Box>
    );
}