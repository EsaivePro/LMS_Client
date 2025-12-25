
import { TextField, MenuItem } from "@mui/material";
export default function MultiSelectFieldComp({ field, value = [], onChange, disabled }) {
  const label = field.IsRequired ? `${field.Key} *` : field.Key;
  return (
    <TextField
      select
      sx={{ minWidth: '250px' }}
      SelectProps={{ multiple: true }}
      label={label}
      value={value}
      disabled={disabled}
      onChange={e => onChange(e.target.value)}
    >
      {field.Options.map(o => (
        <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>
      ))}
    </TextField>
  );
}
