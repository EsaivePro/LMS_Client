import { useDispatch, useSelector } from "react-redux";
import { toggleWidget } from "../../../redux/slices/dashboardSlice";
import { FormControlLabel, Checkbox, Paper } from "@mui/material";
import { WIDGETS } from "../../../modules/dashboard/dashboard.config";

export default function DashboardCustomizer({ role }) {
    const dispatch = useDispatch();
    const active = useSelector(s => s.dashboard.widgets[role]);

    return (
        <Paper sx={{ p: 2 }}>
            {Object.keys(WIDGETS).map(id => (
                <FormControlLabel
                    key={id}
                    control={
                        <Checkbox
                            checked={active.includes(id)}
                            onChange={() =>
                                dispatch(toggleWidget({ role, widgetId: id }))
                            }
                        />
                    }
                    label={WIDGETS[id].title}
                />
            ))}
        </Paper>
    );
}
