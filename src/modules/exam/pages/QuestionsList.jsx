import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Box,
    Typography,
    Button,
    Stack,
    IconButton,
    Chip,
    ToggleButtonGroup,
    ToggleButton,
    Grid,
    Divider,
    TextField,
    MenuItem,
    Paper,
    Collapse,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    Checkbox,
    ListItemText,
    InputAdornment,
    Tooltip,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";

import { useNavigate } from "react-router-dom";

import DataAccordion from "../../../components/common/accordion/DataAccordion";
import CustomDateTimePicker from "../../../components/common/datepicker/CustomDateTimePicker";
import useCommon from "../../../hooks/useCommon";
import { httpClient } from "../../../apiClient/httpClient";

/* ========================================================= */

export default function QuestionsList() {
    const navigate = useNavigate();
    const { setTitleContainer, showLoader, hideLoader } = useCommon();

    /* ---------- DATA STATE ---------- */
    const [rows, setRows] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [questionsWithOptions, setQuestionsWithOptions] = useState([]);

    /* ---------- FILTER STATE ---------- */
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        searchText: "",
        questionTypes: [],
        difficultyLevels: [],
        topics: [],
        status: "all",
        marksMin: "",
        marksMax: "",
        createdFrom: "",
        createdTo: "",
    });
    const [uniqueTopics, setUniqueTopics] = useState([]);

    /* ---------- INIT ---------- */
    useEffect(() => {
        setTitleContainer("Question Bank");
        fetchQuestions();
    }, []);

    /* ---------- FETCH QUESTIONS ---------- */
    const fetchQuestions = useCallback(async () => {
        setLoading(true);
        try {
            const res = await httpClient.fetchQuestions();
            const questions = res?.data?.response || [];
            setRows(questions);
            setTotal(questions.length);

            // Extract unique topics
            const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))];
            setUniqueTopics(topics);

            // Fetch options for questions
            const questionsWithOpts = await Promise.all(
                questions.map(async (q) => {
                    try {
                        const optRes = await httpClient.fetchOptionsByQuestion(q.id);
                        return { ...q, options: optRes?.data?.response || [] };
                    } catch (err) {
                        return { ...q, options: [] };
                    }
                })
            );
            setQuestionsWithOptions(questionsWithOpts);
        } catch (err) {
            console.error("Failed to fetch questions", err);
        } finally {
            setLoading(false);
        }
    }, []);

    /* ---------- FILTER HANDLERS ---------- */
    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleClearFilters = () => {
        setFilters({
            searchText: "",
            questionTypes: [],
            difficultyLevels: [],
            topics: [],
            status: "all",
            marksMin: "",
            marksMax: "",
            createdFrom: "",
            createdTo: "",
        });
    };

    const hasActiveFilters = useMemo(() => {
        return filters.searchText ||
            filters.questionTypes.length > 0 ||
            filters.difficultyLevels.length > 0 ||
            filters.topics.length > 0 ||
            filters.status !== "all" ||
            filters.marksMin ||
            filters.marksMax ||
            filters.createdFrom ||
            filters.createdTo;
    }, [filters]);

    /* ---------- FILTERED DATA ---------- */
    const filteredRows = useMemo(() => {
        return rows.filter(row => {
            // Search text filter
            if (filters.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                const questionText = row.question_text?.replace(/<[^>]*>/g, '').toLowerCase() || '';
                const topic = row.topic?.toLowerCase() || '';
                if (!questionText.includes(searchLower) && !topic.includes(searchLower)) {
                    return false;
                }
            }

            // Question type filter
            if (filters.questionTypes.length > 0 && !filters.questionTypes.includes(row.question_type)) {
                return false;
            }

            // Difficulty level filter
            if (filters.difficultyLevels.length > 0 && !filters.difficultyLevels.includes(row.difficulty_level)) {
                return false;
            }

            // Topic filter
            if (filters.topics.length > 0 && !filters.topics.includes(row.topic)) {
                return false;
            }

            // Status filter
            if (filters.status === "active" && !row.is_active) {
                return false;
            }
            if (filters.status === "inactive" && row.is_active) {
                return false;
            }

            // Marks range filter
            if (filters.marksMin && row.marks < parseFloat(filters.marksMin)) {
                return false;
            }
            if (filters.marksMax && row.marks > parseFloat(filters.marksMax)) {
                return false;
            }

            // Date range filter
            if (filters.createdFrom && row.created_at) {
                const createdDate = new Date(row.created_at);
                const fromDate = new Date(filters.createdFrom);
                if (createdDate < fromDate) {
                    return false;
                }
            }
            if (filters.createdTo && row.created_at) {
                const createdDate = new Date(row.created_at);
                const toDate = new Date(filters.createdTo);
                toDate.setHours(23, 59, 59, 999); // End of day
                if (createdDate > toDate) {
                    return false;
                }
            }

            return true;
        });
    }, [rows, filters]);

    const filteredQuestionsWithOptions = useMemo(() => {
        return questionsWithOptions.filter(row => {
            // Apply same filters as filteredRows
            if (filters.searchText) {
                const searchLower = filters.searchText.toLowerCase();
                const questionText = row.question_text?.replace(/<[^>]*>/g, '').toLowerCase() || '';
                const topic = row.topic?.toLowerCase() || '';
                if (!questionText.includes(searchLower) && !topic.includes(searchLower)) {
                    return false;
                }
            }

            if (filters.questionTypes.length > 0 && !filters.questionTypes.includes(row.question_type)) {
                return false;
            }

            if (filters.difficultyLevels.length > 0 && !filters.difficultyLevels.includes(row.difficulty_level)) {
                return false;
            }

            if (filters.topics.length > 0 && !filters.topics.includes(row.topic)) {
                return false;
            }

            if (filters.status === "active" && !row.is_active) {
                return false;
            }
            if (filters.status === "inactive" && row.is_active) {
                return false;
            }

            if (filters.marksMin && row.marks < parseFloat(filters.marksMin)) {
                return false;
            }
            if (filters.marksMax && row.marks > parseFloat(filters.marksMax)) {
                return false;
            }

            if (filters.createdFrom && row.created_at) {
                const createdDate = new Date(row.created_at);
                const fromDate = new Date(filters.createdFrom);
                if (createdDate < fromDate) {
                    return false;
                }
            }
            if (filters.createdTo && row.created_at) {
                const createdDate = new Date(row.created_at);
                const toDate = new Date(filters.createdTo);
                toDate.setHours(23, 59, 59, 999);
                if (createdDate > toDate) {
                    return false;
                }
            }

            return true;
        });
    }, [questionsWithOptions, filters]);

    /* ---------- DELETE ---------- */
    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this question?")) return;
        try {
            await httpClient.deleteQuestion(id);
            fetchQuestions(); // Refresh the list
        } catch (err) {
            console.error("Failed to delete question", err);
            alert("Failed to delete question");
        }
    };

    /* ---------- VIEW QUESTION ---------- */
    const handleView = async (id) => {
        try {
            const res = await httpClient.fetchQuestionById(id);
            const question = res?.data?.response;

            // Fetch options for the question
            const optionsRes = await httpClient.fetchOptionsByQuestion(id);
            const options = optionsRes?.data?.response || [];

            console.log("Question:", question);
            console.log("Options:", options);

            const questionText = question.question_text?.replace(/<[^>]*>/g, '').trim() || '[No question text]';
            // You can implement a modal or drawer to show question details
            alert(`Question: ${questionText}\nType: ${question.question_type}\nDifficulty: ${question.difficulty_level || 'N/A'}\nMarks: ${question.marks}`);
        } catch (err) {
            console.error("Failed to fetch question details", err);
        }
    };

    /* =========================================================
       COLUMN CONFIG
       ========================================================= */

    const columns = useMemo(
        () => [
            {
                field: "id",
                headerName: "ID",
                maxWidth: 80,
                type: "number",
            },
            {
                field: "question_text",
                headerName: "QUESTION",
                minWidth: 300,
                type: "string",
                filterable: true,
                renderCell: (params) => {
                    // Strip HTML tags for display
                    const text = params.value?.replace(/<[^>]*>/g, '').trim() || '';
                    const displayText = text || '[No question text]';
                    return (
                        <Typography
                            sx={{
                                cursor: "pointer",
                                color: text ? "primary.main" : "text.secondary",
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                "&:hover": { textDecoration: "underline" },
                                fontStyle: text ? "normal" : "italic",
                            }}
                            onClick={() => handleView(params.row.id)}
                            title={displayText}
                        >
                            {displayText.length > 80 ? displayText.substring(0, 80) + '...' : displayText}
                        </Typography>
                    );
                },
            },
            {
                field: "question_type",
                headerName: "TYPE",
                minWidth: 150,
                filterable: true,
                type: "select",
                valueOptions: ["MCQ", "True_False"],
                defaultOperator: "in",
                renderCell: (params) => (
                    <Chip
                        label={params.value?.toUpperCase() || 'MCQ'}
                        size="small"
                        color={
                            params.value === "mcq" ? "primary" :
                                params.value === "multiple_select" ? "secondary" :
                                    params.value === "descriptive" ? "info" :
                                        params.value === "coding" ? "warning" : "default"
                        }
                    />
                ),
            },
            {
                field: "difficulty_level",
                headerName: "DIFFICULTY",
                minWidth: 130,
                filterable: true,
                type: "select",
                valueOptions: ["easy", "medium", "high"],
                defaultOperator: "in",
                renderCell: (params) => (
                    <Chip
                        label={params.value?.toUpperCase() || 'N/A'}
                        size="small"
                        color={
                            params.value === "easy" ? "success" :
                                params.value === "medium" ? "warning" :
                                    params.value === "high" ? "error" : "default"
                        }
                        variant={params.value ? "filled" : "outlined"}
                    />
                ),
            },
            {
                field: "marks",
                headerName: "MARKS",
                maxWidth: 100,
                type: "number",
                align: "center",
                renderCell: (params) => (
                    <Typography fontWeight={500}>
                        {params.value || 1}
                    </Typography>
                ),
            },
            {
                field: "topic",
                headerName: "TOPIC",
                minWidth: 150,
                filterable: true,
                type: "string",
                renderCell: (params) => params.value || "-",
            },
            {
                field: "is_active",
                headerName: "STATUS",
                minWidth: 120,
                filterable: true,
                type: "select",
                valueOptions: [
                    { value: true, label: "Active" },
                    { value: false, label: "Inactive" }
                ],
                defaultOperator: "in",
                renderCell: (params) => (
                    <Chip
                        label={params.value ? "Active" : "Inactive"}
                        size="small"
                        color={params.value ? "success" : "default"}
                    />
                ),
            },
            {
                field: "created_at",
                headerName: "CREATED",
                minWidth: 160,
                type: "date",
                renderCell: (params) => {
                    if (!params.value) return "-";
                    return new Date(params.value).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    });
                },
            },
            {
                field: "actions",
                headerName: "ACTIONS",
                maxWidth: 150,
                sortable: false,
                align: "center",
                renderCell: (params) => (
                    <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                            size="small"
                            onClick={() => handleView(params.row.id)}
                            title="View"
                            sx={{ color: "text.primary" }}
                        >
                            <VisibilityIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => navigate(`/exam/questions/edit/${params.row.id}`)}
                            title="Edit"
                            sx={{ color: "text.primary" }}
                        >
                            <EditIcon fontSize="small" />
                        </IconButton>

                        <IconButton
                            size="small"
                            onClick={() => handleDelete(params.row.id)}
                            title="Delete"
                            sx={{ color: "green" }}
                        >
                            <DeleteIcon fontSize="small" />
                        </IconButton>
                    </Box>
                ),
            },
        ],
        []
    );

    /* ========================================================= */

    const questionTypeOptions = ["MCQ's", "True_False"];
    const difficultyOptions = ["Easy", "Medium", "High"];

    return (
        <Box p={1}>
            {/* ---------- HEADER ---------- */}
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h5" fontWeight={500}>
                    Question Bank
                </Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                    <Chip
                        label={`Questions: ${filteredRows.length} of ${total}`}
                        color="var(--onPrimary)"
                        variant="outlined"
                        sx={{ fontWeight: 500, fontSize: '0.875rem' }}
                    />
                    {/* Filter Toggle Button */}
                    <Button
                        variant={hasActiveFilters ? "contained" : "outlined"}
                        color={hasActiveFilters ? "primary" : "inherit"}
                        startIcon={<FilterListIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        size="medium"
                    >
                        {showFilters ? "Hide Filters" : "Show Filters"}
                    </Button>
                    {/* Add Question Button */}
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => navigate("/questions/create")}
                    >
                        Add Question
                    </Button>
                </Stack>
            </Stack>

            {/* ---------- FILTERS SECTION ---------- */}
            <Collapse in={showFilters}>
                <Paper
                    elevation={0}
                    sx={{
                        p: 3,
                        mb: 3,
                        bgcolor: "grey.50",
                        border: "1px solid",
                        borderColor: "grey.300",
                        borderRadius: 2,
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
                        <Typography variant="h6" fontWeight={600}>
                            Filters
                        </Typography>
                        {hasActiveFilters && (
                            <Button
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={handleClearFilters}
                                color="secondary"
                            >
                                Clear All Filters
                            </Button>
                        )}
                    </Stack>
                    {/* Search Text */}
                    <Stack mb={2}>
                        <TextField
                            size="small"
                            label="Search Questions"
                            placeholder="Search by question text or topic..."
                            value={filters.searchText}
                            onChange={(e) => handleFilterChange("searchText", e.target.value)}
                            // sx={{ width: 300 }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: filters.searchText && (
                                    <InputAdornment position="end">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleFilterChange("searchText", "")}
                                        >
                                            <ClearIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />
                    </Stack>

                    <Grid container spacing={2}>
                        {/* Question Type */}
                        <Grid item xs={12} md={6} lg={4}>
                            <FormControl size="small" sx={{ width: 300 }}>
                                <InputLabel>Question Type</InputLabel>
                                <Select
                                    multiple
                                    value={filters.questionTypes}
                                    onChange={(e) => handleFilterChange("questionTypes", e.target.value)}
                                    input={<OutlinedInput label="Question Type" />}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 300,
                                                width: 300,
                                            },
                                        },
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {questionTypeOptions.map((type) => (
                                        <MenuItem key={type} value={type} sx={{ p: 0, fontSize: 14 }}>
                                            <Checkbox checked={filters.questionTypes.indexOf(type) > -1} />
                                            <ListItemText primary={type} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Difficulty Level */}
                        <Grid item xs={12} md={6} lg={4}>
                            <FormControl size="small" sx={{ width: 300 }}>
                                <InputLabel>Difficulty Level</InputLabel>
                                <Select
                                    multiple
                                    value={filters.difficultyLevels}
                                    onChange={(e) => handleFilterChange("difficultyLevels", e.target.value)}
                                    input={<OutlinedInput label="Difficulty Level" />}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200,
                                                width: 300,
                                            },
                                        },
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip
                                                    key={value}
                                                    label={value}
                                                    size="small"
                                                    color="default"
                                                />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {difficultyOptions.map((level) => (
                                        <MenuItem key={level} value={level} sx={{ p: 0, fontSize: "14px" }}>
                                            <Checkbox checked={filters.difficultyLevels.indexOf(level) > -1} />
                                            <ListItemText primary={level} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Topics */}
                        <Grid item xs={12} md={6} lg={4}>
                            <FormControl size="small" sx={{ width: 300 }}>
                                <InputLabel>Topics</InputLabel>
                                <Select
                                    multiple
                                    value={filters.topics}
                                    onChange={(e) => handleFilterChange("topics", e.target.value)}
                                    input={<OutlinedInput label="Topics" />}
                                    MenuProps={{
                                        PaperProps: {
                                            style: {
                                                maxHeight: 200,
                                                width: 300,
                                            },
                                        },
                                    }}
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value) => (
                                                <Chip key={value} label={value} size="small" />
                                            ))}
                                        </Box>
                                    )}
                                >
                                    {uniqueTopics.map((topic) => (
                                        <MenuItem key={topic} value={topic}>
                                            <Checkbox checked={filters.topics.indexOf(topic) > -1} />
                                            <ListItemText primary={topic} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>

                        {/* Status */}
                        <Grid item xs={12} md={6} lg={4}>
                            <TextField
                                size="small"
                                select
                                label="Status"
                                value={filters.status}
                                onChange={(e) => handleFilterChange("status", e.target.value)}
                                sx={{ width: 300 }}
                            >
                                <MenuItem value="all">All</MenuItem>
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </TextField>
                        </Grid>

                        {/* Marks Range */}
                        <Grid item xs={6} md={3} lg={2}>
                            <TextField
                                size="small"
                                type="number"
                                label="Min Marks"
                                value={filters.marksMin}
                                onChange={(e) => handleFilterChange("marksMin", e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={{ width: 300 }}
                            />
                        </Grid>
                        <Grid item xs={6} md={3} lg={2}>
                            <TextField
                                size="small"
                                type="number"
                                label="Max Marks"
                                value={filters.marksMax}
                                onChange={(e) => handleFilterChange("marksMax", e.target.value)}
                                inputProps={{ min: 0 }}
                                sx={{ width: 300 }}
                            />
                        </Grid>

                        {/* Date Range */}
                        <Grid item xs={12} md={6} lg={3}>
                            <CustomDateTimePicker
                                label="Created From"
                                value={filters.createdFrom}
                                onChange={(value) => handleFilterChange("createdFrom", value)}
                                sx={{ width: 300 }}
                            />
                        </Grid>
                        <Grid item xs={12} md={6} lg={3}>
                            <CustomDateTimePicker
                                label="Created To"
                                value={filters.createdTo}
                                onChange={(value) => handleFilterChange("createdTo", value)}
                                sx={{ width: 300 }}
                            />
                        </Grid>
                    </Grid>

                    {/* Active Filters Summary */}
                    {hasActiveFilters && (
                        <Box mt={2}>
                            <Typography variant="caption" color="text.secondary" gutterBottom>
                                Active Filters:
                            </Typography>
                            <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                                {filters.searchText && (
                                    <Chip
                                        label={`Search: "${filters.searchText}"`}
                                        size="small"
                                        onDelete={() => handleFilterChange("searchText", "")}
                                    />
                                )}
                                {filters.questionTypes.map(type => (
                                    <Chip
                                        key={type}
                                        label={`Type: ${type.toUpperCase()}`}
                                        size="small"
                                        onDelete={() => handleFilterChange("questionTypes", filters.questionTypes.filter(t => t !== type))}
                                    />
                                ))}
                                {filters.difficultyLevels.map(level => (
                                    <Chip
                                        key={level}
                                        label={`Difficulty: ${level.toUpperCase()}`}
                                        size="small"
                                        onDelete={() => handleFilterChange("difficultyLevels", filters.difficultyLevels.filter(l => l !== level))}
                                    />
                                ))}
                                {filters.topics.map(topic => (
                                    <Chip
                                        key={topic}
                                        label={`Topic: ${topic}`}
                                        size="small"
                                        onDelete={() => handleFilterChange("topics", filters.topics.filter(t => t !== topic))}
                                    />
                                ))}
                                {filters.status !== "all" && (
                                    <Chip
                                        label={`Status: ${filters.status.toUpperCase()}`}
                                        size="small"
                                        onDelete={() => handleFilterChange("status", "all")}
                                    />
                                )}
                                {(filters.marksMin || filters.marksMax) && (
                                    <Chip
                                        label={`Marks: ${filters.marksMin || 0} - ${filters.marksMax || '∞'}`}
                                        size="small"
                                        onDelete={() => {
                                            handleFilterChange("marksMin", "");
                                            handleFilterChange("marksMax", "");
                                        }}
                                    />
                                )}
                                {(filters.createdFrom || filters.createdTo) && (
                                    <Chip
                                        label={`Created: ${filters.createdFrom || '...'} to ${filters.createdTo || '...'}`}
                                        size="small"
                                        onDelete={() => {
                                            handleFilterChange("createdFrom", "");
                                            handleFilterChange("createdTo", "");
                                        }}
                                    />
                                )}
                            </Stack>
                        </Box>
                    )}
                </Paper>
            </Collapse>

            {/* ---------- DATA DISPLAY ---------- */}
            <DataAccordion
                data={filteredQuestionsWithOptions}
                loading={loading}
                onEdit={(item) => navigate(`/exam/questions/edit/${item.id}`)}
                onDelete={(item) => handleDelete(item.id)}
                onView={(item) => handleView(item.id)}
                enableSearch={true}
                enablePagination={true}
                defaultPageSize={10}
                pageSizeOptions={[10, 20, 50]}
                getSummary={(item) => {
                    const text = item.question_text?.replace(/<[^>]*>/g, '').trim() || '';
                    const displayText = text || '[No question text]';
                    return (
                        <Typography
                            sx={{
                                fontWeight: 500,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                color: text ? "inherit" : "text.secondary",
                                fontStyle: text ? "normal" : "italic",
                            }}
                        >
                            {displayText.length > 100 ? displayText.substring(0, 100) + '...' : displayText}
                        </Typography>
                    );
                }}
                getChips={(item) => (
                    <>
                        <Chip
                            label={item.question_type?.toUpperCase() || 'MCQ'}
                            size="small"
                            color="default"
                        />
                        <Chip
                            label={item.difficulty_level?.toUpperCase() || 'N/A'}
                            size="small"
                            color="default"
                            variant={item.difficulty_level ? "filled" : "outlined"}
                        />
                        <Chip
                            label={`${item.marks || 1} pts`}
                            size="small"
                            color="default"
                            variant="outlined"
                        />
                    </>
                )}
                renderContent={(item) => (
                    <Box>
                        <Grid container spacing={3}>
                            {/* Question Details */}
                            <Grid item xs={12} md={6}>
                                <Stack spacing={2}>
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Question
                                        </Typography>
                                        {item.question_text?.replace(/<[^>]*>/g, '').trim() ? (
                                            <Box
                                                dangerouslySetInnerHTML={{ __html: item.question_text }}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: "grey.50",
                                                    borderRadius: 1,
                                                    border: "1px solid",
                                                    borderColor: "grey.300",
                                                }}
                                            />
                                        ) : (
                                            <Box
                                                sx={{
                                                    p: 2,
                                                    bgcolor: "grey.50",
                                                    borderRadius: 1,
                                                    border: "1px solid",
                                                    borderColor: "grey.300",
                                                    fontStyle: "italic",
                                                    color: "text.secondary",
                                                }}
                                            >
                                                [No question text provided]
                                            </Box>
                                        )}
                                    </Box>

                                    {item.question_description && (
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Description
                                            </Typography>
                                            <Box
                                                dangerouslySetInnerHTML={{ __html: item.question_description }}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: "grey.50",
                                                    borderRadius: 1,
                                                    border: "1px solid",
                                                    borderColor: "grey.300",
                                                }}
                                            />
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Details
                                        </Typography>
                                        <Stack direction="row" spacing={2} flexWrap="wrap">
                                            <Chip label={`Topic: ${item.topic || 'N/A'}`} variant="outlined" />
                                            <Chip label={`Marks: ${item.marks || 1}`} variant="outlined" />
                                            <Chip
                                                label={item.is_active ? "Active" : "Inactive"}
                                                color={item.is_active ? "success" : "default"}
                                                size="small"
                                            />
                                        </Stack>
                                    </Box>
                                </Stack>
                            </Grid>

                            {/* Options */}
                            <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Answer Options
                                </Typography>
                                {item.options && item.options.length > 0 ? (
                                    <Stack spacing={1.5}>
                                        {item.options.map((option, idx) => (
                                            <Box
                                                key={option.id}
                                                sx={{
                                                    p: 2,
                                                    bgcolor: option.is_correct ? "success.50" : "grey.50",
                                                    borderRadius: 1,
                                                    border: "2px solid",
                                                    borderColor: option.is_correct ? "success.main" : "grey.300",
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                }}
                                            >
                                                {option.is_correct ? (
                                                    <CheckCircleIcon color="success" />
                                                ) : (
                                                    <RadioButtonUncheckedIcon color="action" />
                                                )}
                                                <Typography
                                                    sx={{
                                                        flex: 1,
                                                        fontWeight: option.is_correct ? 600 : 400,
                                                    }}
                                                >
                                                    {String.fromCharCode(65 + idx)}. {option.option_text}
                                                </Typography>
                                                {option.is_correct && (
                                                    <Chip
                                                        label="Correct"
                                                        color="success"
                                                        size="small"
                                                    />
                                                )}
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography color="text.secondary" fontStyle="italic">
                                        No options available
                                    </Typography>
                                )}
                            </Grid>
                        </Grid>
                    </Box>
                )}
            />
        </Box>
    );
}