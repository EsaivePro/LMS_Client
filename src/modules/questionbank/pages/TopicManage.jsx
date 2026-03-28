import { useEffect, useState } from "react";
import { Box, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/topic-details.json";
import masterConfig from "../../../forms/master-forms/topic-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";
import { httpClient } from "../../../apiClient/httpClient";
import useCommon from "../../../hooks/useCommon";

const TopicManage = () => {
    const { id } = useParams();

    const { showError, showLoader, hideLoader } = useCommon();
    const [formDefinition, setFormDefinition] = useState(formDef);
    const [initialValues, setInitialValues] = useState(null);

    useEffect(() => {
        if (id === "list") return;

        const load = async () => {
            showLoader();
            try {
                const derived = JSON.parse(JSON.stringify(formDef));
                setFormDefinition(derived);
                if (id === "create") {
                    setInitialValues({});
                    return;
                }
                const res = await httpClient.fetchQbTopicById(id);
                const data = res?.data?.data || res?.data?.response?.data || res?.data?.response || {};
                setInitialValues(data);
            } catch (err) {
                showError(err?.message || "Failed to load topic details");
            } finally {
                hideLoader();
            }
        };

        if (!id) return;
        load();
    }, [id]);

    const submitLabel = id === "create" ? "Create" : "Update";
    if (id === "list") {
        return <MasterForm config={masterConfig} />;
    }
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

export default TopicManage;
