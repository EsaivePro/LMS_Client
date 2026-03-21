import React from "react";
import {
    Card,
    CardContent,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    Box
} from "@mui/material";

export default function QuestionCard({
    question,
    questionIndex,
    selected,
    onSelect
}) {

    if (!question) return null;

    return (

        <Card elevation={0}>

            <CardContent>

                <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                >
                    Question {questionIndex}
                </Typography>

                <Typography
                    variant="h6"
                    sx={{ mb: 3, fontWeight: 500 }}
                >
                    {question.text}
                </Typography>

                <RadioGroup
                    value={selected ?? ""}
                    onChange={(e) => onSelect(e.target.value)}
                >

                    {question.rawOptions.map((opt, idx) => (

                        <Box
                            key={opt.id}
                            sx={{
                                border: '1px solid #e5e7eb',
                                borderRadius: 2,
                                mb: 1
                            }}
                        >

                            <FormControlLabel
                                value={opt.id}
                                control={<Radio />}
                                label={opt.option_text}
                                sx={{ width: '100%', p: 1 }}
                            />

                        </Box>

                    ))}

                </RadioGroup>

            </CardContent>

        </Card>

    )

}