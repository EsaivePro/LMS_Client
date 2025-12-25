
import { TextField } from "@mui/material";
export default function PasswordFieldComp({ field, value, onChange, disabled, error }) {
  const label = field.IsRequired ? `${field.Key} *` : field.Key;
  return (
    <TextField
      fullWidth
      type="password"
      label={label}
      value={value || ""}
      disabled={disabled}
      error={!!error}
      helperText={error}
      onChange={e => onChange(e.target.value)}
    />
  );
}
