
import TabRenderer from "./TabRenderer";
import HeaderButtons from "./HeaderButtons";
import useFormState from "./useFormState";

function getAllFields(config) {
  const fields = [];
  config.FormConfig.Fields.forEach(tab => {
    tab.Fields.forEach(section => {
      section.Fields.forEach(field => {
        fields.push(field);
      });
    });
  });
  return fields;
}

export default function FormRenderer({ config, mode, data, onSubmit }) {
  const { state, updateValue, formMode, setFormMode } = useFormState(data, mode);

  const handleAction = (btn) => {
    if (btn.Key === "Edit") setFormMode("Edit");
    if (btn.Key === "Cancel") setFormMode("View");
    if (btn.ButtonAction === "Submit") {
      const fields = getAllFields(config);
      const errors = {};
      fields.forEach(f => {
        if (f.IsRequired && (!state[f.Key] || (Array.isArray(state[f.Key]) && state[f.Key].length === 0))) {
          errors[f.Key] = `${f.Key} is required`;
        }
      });
      if (Object.keys(errors).length === 0) {
        onSubmit(state);
      } else {
        alert("Please fill all required fields");
        // TODO: show errors in UI
      }
    }
  };

  return (
    <>
      <HeaderButtons buttons={config.FormConfig.HeaderButtons?.[formMode]} onAction={handleAction} />
      {config.FormConfig.Fields.map(tab => (
        <TabRenderer key={tab.Key} tab={tab} state={state} updateValue={updateValue} mode={formMode} />
      ))}
    </>
  );
}
