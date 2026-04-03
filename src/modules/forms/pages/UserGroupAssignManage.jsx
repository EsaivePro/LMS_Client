import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/user-group-assign-details.json";
import masterConfig from "../../../forms/master-forms/user-group-assign-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";

const UserGroupAssignManage = () => {
    const { id } = useParams();

    const submitLabel = id === "create" ? "Create" : "Update";

    if (id === "list") {
        return <MasterForm config={masterConfig} />;
    }
    return (
        <DetailsForm definition={formDef} id={id} submitLabel={submitLabel} />
    );
};

export default UserGroupAssignManage;
