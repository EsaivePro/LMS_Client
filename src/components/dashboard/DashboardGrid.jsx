import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import { useDispatch, useSelector } from "react-redux";
import { setLayout } from "../../redux/slices/dashboardSlice";
import WidgetRenderer from "./WidgetRenderer";
import { Box, Paper } from "@mui/material";

export default function DashboardGrid({ role }) {
    const dispatch = useDispatch();
    const layout = useSelector((s) => s.dashboard.layout[role]);
    const widgets = useSelector((s) => s.dashboard.widgets[role]);

    return (
        <Box>
            <Box>
                {widgets.map((id) => (
                    <div key={id}>
                        <Paper sx={{ mt: 0, mx: { xs: 0.5, md: 3 }, mb: { xs: 0, md: 1 }, p: 2, height: "100%", boxShadow: 0, borderRadius: 1, backgroundColor: "transparent" }}>
                            <WidgetRenderer widgetId={id} />
                        </Paper>
                    </div>
                ))}
            </Box>
        </Box>
    );
}
