
import { Card, CardHeader, CardContent, Grid, Typography } from "@mui/material";
import FieldRenderer from "./FieldRenderer";

export default function TabRenderer({ tab, state, updateValue, mode }) {
  return (
    <Card sx={{ mb: 3 }}>
      <CardHeader title={tab.DisplayName || tab.Key} />
      <CardContent>
        {tab.Fields.map(section => (
          <div key={section.Key} style={{ marginBottom: '20px' }}>
            <Typography variant="h6" gutterBottom>{section.DisplayName || section.Key}</Typography>
            <Grid container spacing={2}>
              {section.Fields.map(f => (
                <Grid item xs={12} md={f.Type === 'MultiSelect' ? 12 : 6} key={f.Key}>
                  <FieldRenderer field={f} value={state[f.Key]} onChange={updateValue} mode={mode} />
                </Grid>
              ))}
            </Grid>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
