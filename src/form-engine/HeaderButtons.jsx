
import { Button, Stack } from "@mui/material";
export default function HeaderButtons({ buttons, onAction }) {
  return (
    <Stack direction="row" spacing={2} mb={2}>
      {buttons?.map(b => (
        <Button key={b.Key} variant="contained" onClick={() => onAction(b)}>
          {b.Key}
        </Button>
      ))}
    </Stack>
  );
}
