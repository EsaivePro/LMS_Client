import React, { useEffect, useState } from "react";
import { Box, Paper, Stack, Typography } from "@mui/material";
import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/exam-details.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import { httpClient } from "../../../apiClient/httpClient";
import useCommon from "../../../hooks/useCommon";

const ExamManage = () => {
    const { id } = useParams();

    const { showError, showLoader, hideLoader } = useCommon();
    const [formDefinition, setFormDefinition] = useState(formDef);
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        const load = async () => {
            showLoader();
            try {
                const derived = JSON.parse(JSON.stringify(formDef));
                setFormDefinition(derived);
                if (id === "create") {
                    setInitialValues({});
                    return;
                }
                const [examRes] = await Promise.all([httpClient.fetchExamById(id)]);
                const examData = examRes?.data?.data || examRes?.data?.response?.data || examRes?.data?.response || {};
                setInitialValues(examData);
            } catch (err) {
                showError(err?.message || "Failed to load exam details");
            } finally {
                hideLoader();
            }
        };

        if (!id) return;
        load();
    }, [id]);

    const submitLabel = id === "create" ? "Create" : "Update";

    return (
        <Box sx={{ mx: "auto", width: "100%" }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.300", mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <DetailsForm definition={formDefinition} initialValues={initialValues} submitLabel={submitLabel} />
                </Box>
            </Paper>
        </Box>
    );
};

export default ExamManage;
