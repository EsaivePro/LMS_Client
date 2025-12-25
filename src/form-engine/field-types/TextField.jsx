
import { TextField } from "@mui/material";
export default function TextFieldComp({ field, value, onChange, disabled }) {
  const type = field.Type === "Number" ? "number" : "text";
  const label = field.IsRequired ? `${field.Key} *` : field.Key;
  return (
    <TextField fullWidth label={label} value={value || ""} disabled={disabled} type={type}
      onChange={e => onChange(e.target.value)} />
  );
}
