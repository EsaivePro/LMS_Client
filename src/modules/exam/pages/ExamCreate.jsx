import React, { useEffect, useState } from "react";
import {
    Box,
    Paper,
    Stack,
    Typography,
    Divider,
    TextField,
    IconButton,
    Button,
    Switch,
    FormControlLabel,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import DynamicForm from "../../../components/common/form/DynamicForm";
import formDef from "../../../components/common/form/examForm.json";
import { httpClient } from "../../../apiClient/httpClient";
import useCommon from "../../../hooks/useCommon";

const ExamCreate = () => {
    const { showError } = useCommon();
    const [questions, setQuestions] = useState([]);
    const [selected, setSelected] = useState([]); // [{ question_id, marks, order_no }]
    const [schedules, setSchedules] = useState([]);
    const [loadingQuestions, setLoadingQuestions] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoadingQuestions(true);
            try {
                const res = await httpClient.fetchQuestions();
                setQuestions(res.data?.data || []);
            } catch (err) {
                showError(err?.message || "Failed to load questions");
            } finally {
                setLoadingQuestions(false);
            }
        };
        load();
    }, []);

    const initialValues = {
        title: "",
        description: "",
        total_marks: 0,
        passing_marks: 0,
        duration: 30,
        shuffle_questions: true,
        shuffle_options: true,
        is_active: true,
    };

    const toggleQuestion = (q) => {
        const exists = selected.find((s) => s.question_id === q.id);
        if (exists) {
            setSelected(selected.filter((s) => s.question_id !== q.id));
        } else {
            setSelected([...selected, { question_id: q.id, marks: null, order_no: selected.length + 1 }]);
        }
    };

    const updateSelectedField = (questionId, key, value) => {
        setSelected((prev) => prev.map((s) => (s.question_id === questionId ? { ...s, [key]: value } : s)));
    };

    const addSchedule = () => {
        setSchedules((s) => [...s, { start_time: "", end_time: "", timezone: "UTC", max_attempts: 1, is_proctored: false, is_active: true }]);
    };

    const updateSchedule = (idx, key, value) => {
        setSchedules((s) => s.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
    };

    const removeSchedule = (idx) => setSchedules((s) => s.filter((_, i) => i !== idx));

    const handleSubmit = async (values) => {
        try {
            const payload = {
                title: values.title,
                description: values.description || null,
                total_marks: Number(values.total_marks) || 0,
                passing_marks: Number(values.passing_marks) || null,
                duration: Number(values.duration) || 0,
                shuffle_questions: !!values.shuffle_questions,
                shuffle_options: !!values.shuffle_options,
                is_active: !!values.is_active
            };

            const res = await httpClient.createExam(payload);
            const created = res.data?.response;
            if (!created || !created.id) throw new Error("Failed to create exam");

            return { skipSuccess: false };
        } catch (err) {
            showError(err?.response?.data?.message || err.message || "Failed to create exam");
            throw err;
        }
    };

    return (
        <Box sx={{ mx: "auto", p: 1, mt: 3, width: "100%" }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.300", mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <Stack spacing={2}>
                        <Typography variant="h6">Create Exam</Typography>
                        <DynamicForm definition={formDef} initialValues={initialValues} onSubmit={handleSubmit} submitLabel="Create Exam" successMessage="Exam created successfully!" />
                    </Stack>
                </Box>
            </Paper>
        </Box>
    );
};

export default ExamCreate;
