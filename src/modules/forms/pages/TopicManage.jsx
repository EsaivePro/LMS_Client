import { Box, Paper } from "@mui/material";
import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/topic-details.json";
import masterConfig from "../../../forms/master-forms/topic-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";

const TopicManage = () => {
    const { id } = useParams();

    const submitLabel = id === "create" ? "Create" : "Update";

    if (id === "list") {
        return <MasterForm config={masterConfig} />;
    }
    return (
        <DetailsForm definition={formDef} id={id} submitLabel={submitLabel} />
    );
};

export default TopicManage;
