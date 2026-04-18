import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/content-library-details.json";
import masterConfig from "../../../forms/master-forms/content-library-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";
import { useFormController } from "../../../forms/components/useFormController";

const ContentLibraryManage = () => {
    const { id } = useParams();

    const submitLabel = id === "create" ? "Create" : "Update";
    const { definition, onFieldChange, onLoad } = useFormController(formDef);

    if (id === "list") {
        return <MasterForm config={masterConfig} />;
    }

    return (
        <DetailsForm
            definition={definition}
            id={id}
            submitLabel={submitLabel}
            onFieldChange={onFieldChange}
            onLoad={onLoad}
        />
    );
};

export default ContentLibraryManage;