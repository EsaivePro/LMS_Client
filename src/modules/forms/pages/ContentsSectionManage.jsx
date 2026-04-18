import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/contents-section-details.json";
import masterConfig from "../../../forms/master-forms/contents-section-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";

const ContentsSectionManage = () => {
    const { id } = useParams();

    const submitLabel = id === "create" ? "Create" : "Update";

    if (id === "list") {
        return <MasterForm config={masterConfig} />;
    }
    return (
        <DetailsForm definition={formDef} id={id} submitLabel={submitLabel} />
    );
};

export default ContentsSectionManage;
