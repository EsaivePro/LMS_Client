
import TextFieldComp from "./field-types/TextField";
import PasswordFieldComp from "./field-types/PasswordField";
import RadioFieldComp from "./field-types/RadioField";
import DropdownFieldComp from "./field-types/DropdownField";
import MultiSelectFieldComp from "./field-types/MultiSelectField";

const MAP = { 
  text: TextFieldComp, 
  password: PasswordFieldComp,
  radio: RadioFieldComp,
  dropdown: DropdownFieldComp,
  multiselect: MultiSelectFieldComp,
  number: TextFieldComp
};

export default function FieldRenderer({ field, value, onChange, mode }) {
  const Comp = MAP[field.Type.toLowerCase()];
  if (!Comp) return null;
  return <Comp field={field} value={value} disabled={mode === "View"} onChange={(v) => onChange(field.Key, v)} />;
}
