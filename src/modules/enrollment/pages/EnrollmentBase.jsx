import React, { useState } from "react";
import { Box, Tabs, Tab, Typography, Stack, Button } from "@mui/material";
import IndividualEnrollment from "../../../components/enrollment/IndividualEnrollment";
import BulkUserEnrollment from "../../../components/enrollment/BulkUserEnrollment";
import useCourseCategory from "../../../hooks/useCourseCategory";
import { useAuth } from "../../../hooks/useAuth";

function TabPanel({ children, value, index }) {
    return (
        <div role="tabpanel" hidden={value !== index}>
            {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
        </div>
    );
}

export default function EnrollmentBase({ defaultTab = 0, onEnroll }) {
    const [tab, setTab] = useState(defaultTab);
    const [manualMultiple, setManualMultiple] = useState(false);
    const { allCourses } = useCourseCategory();
    const { user } = useAuth();

    const handleTab = (_, v) => setTab(v);

    const handleManualSubmit = (payload) => {
        // payload from IndividualEnrollment: single or multi depending on allowMultiple
        if (onEnroll) onEnroll(payload);
        else console.log("Manual enroll payload", payload);
    };

    const handleBulkSubmit = (payload) => {
        if (onEnroll) onEnroll(payload);
        else console.log("Bulk enroll payload", payload);
    };

    return (
        <Box>
            <Tabs value={tab} onChange={handleTab} aria-label="enrollment-tabs">
                <Tab label="Manual Enrollment" />
                <Tab label="Bulk Upload" />
            </Tabs>

            <TabPanel value={tab} index={0}>
                <IndividualEnrollment />
            </TabPanel>

            <TabPanel value={tab} index={1}>
                <Stack spacing={2}>
                    <BulkUserEnrollment
                        users={[]}
                        courses={allCourses}
                        onSubmit={handleBulkSubmit}
                    />
                </Stack>
            </TabPanel>
        </Box>
    );
}
