import { useParams } from "react-router-dom";
import formDef from "../../../forms/details-forms/module-category-details.json";
import masterConfig from "../../../forms/master-forms/module-category-master.json";
import DetailsForm from "../../../forms/components/DetailsForm";
import MasterForm from "../../../forms/components/MasterForm";
import { useFormController } from "../../../forms/components/useFormController";

const ModuleCategoryManage = () => {
    const { id } = useParams();
    const submitLabel = id === "create" ? "Create" : "Update";

    // Visibility rules are declared in module-category-details.json
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

export default ModuleCategoryManage;
