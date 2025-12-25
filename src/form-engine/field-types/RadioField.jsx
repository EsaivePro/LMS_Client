
import { RadioGroup, FormControlLabel, Radio, FormHelperText, FormLabel } from "@mui/material";
export default function RadioFieldComp({ field, value, onChange, disabled, error }) {
  const label = field.IsRequired ? `${field.Key} *` : field.Key;
  return (
    <>
      <FormLabel>{label}</FormLabel>
      <RadioGroup
        row
        value={value || ""}
        onChange={e => onChange(e.target.value)}
      >
        {field.Options.map(o => (
          <FormControlLabel
            key={o.value}
            value={o.value}
            control={<Radio disabled={disabled} />}
            label={o.label}
          />
        ))}
      </RadioGroup>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </>
  );
}
