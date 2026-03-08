import React from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import DynamicForm from "../../../components/common/form/DynamicForm";
import formDef from "../../../components/common/form/questionForm.json";
import { httpClient } from "../../../apiClient/httpClient";
import useCommon from "../../../hooks/useCommon";

const QuestionCreate = () => {
    const { showError } = useCommon();

    const initialValues = {
        question_text: "",
        question_description: "",
        options: [
            { option_text: "", is_correct: false },
            { option_text: "", is_correct: false },
        ],
        topic: "",
        difficulty: "",
        marks: 0,
        negative_marks: 0,
        question_type: "mcq",
        multiple_answers: false,
        is_active: true,
    };

    const handleSubmit = async (values) => {
        try {
            const filledOptions = (values.options || []).filter((o) => o.option_text && o.option_text.trim());
            const questionPayload = {
                question_text: values.question_text,
                question_description: values.question_description || null,
                question_type: values.question_type,
                difficulty_level: values.difficulty || null,
                topic: values.topic || null,
                marks: Number(values.marks) || 0,
                negative_marks: Number(values.negative_marks) || 0,
                metadata: {
                    multiple_answers: !!values.multiple_answers,
                    options: filledOptions.map((o) => ({ option_text: o.option_text, is_correct: o.is_correct })),
                },
                is_active: !!values.is_active,
            };

            const questionRes = await httpClient.createQuestion(questionPayload);
            const createdQuestion = questionRes.data?.data;
            if (!createdQuestion || !createdQuestion.id) throw new Error("Failed to create question");

            const optionPromises = filledOptions.map((opt) => httpClient.createOption(createdQuestion.id, { option_text: opt.option_text, is_correct: opt.is_correct }));
            await Promise.all(optionPromises);
            return { skipSuccess: false };
        } catch (err) {
            console.error("Error creating question:", err);
            showError(err?.response?.data?.message || err.message || "Failed to create question. Please try again.");
        }
    };

    return (
        <Box sx={{ mx: "auto", p: 1, mt: 3, minHeight: "100vh", width: "100%" }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.300", mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="h6">Add Question</Typography>
                        <DynamicForm definition={formDef} initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Add new question" successMessage="Question created successfully!" />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default QuestionCreate;
