import { Box, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/exam-section-details.json";
import masterConfig from "../../../forms/master-forms/exam-section-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";

const ExamSectionManage = () => {
    const { id } = useParams();

    const submitLabel = id === "create" ? "Create" : "Update";

    if (id === "list") {
        return <MasterForm config={masterConfig} />;
    }
    return (
        <Box sx={{ mx: "auto", width: "100%" }}>
            <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "grey.300", mb: 2 }}>
                <Box sx={{ p: 3 }}>
                    <DetailsForm definition={formDef} id={id} submitLabel={submitLabel} />
                </Box>
            </Paper>
        </Box>
    );
};

export default ExamSectionManage;
