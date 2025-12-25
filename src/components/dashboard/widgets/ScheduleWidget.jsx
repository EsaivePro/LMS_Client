import { Box, Typography, List, ListItem, ListItemText, Divider, Paper } from "@mui/material";

const sampleSchedule = [
    {
        date: "20/12/2023", items: [
            { time: "11:30 AM", title: "Course One - Lesson 4", instructor: "Michael Brown", duration: "50 Min" },
            { time: "14:30 PM", title: "Course Two - Lesson 5", instructor: "John Johnson", duration: "30 Min" },
        ]
    },
    {
        date: "21/12/2023", items: [
            { time: "10:30 AM", title: "Course Three - Lesson 1", instructor: "William Jones", duration: "40 Min" },
            { time: "16:30 PM", title: "Course Four - Lesson 4", instructor: "John Johnson", duration: "60 Min" },
        ]
    },
];

export default function ScheduleWidget({ title }) {
    return (
        <Box>
            <Typography fontWeight={700} variant="h6" sx={{ mb: 1 }}>{title}</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {sampleSchedule.map((day, idx) => (
                    <Paper key={idx} sx={{ p: 1 }}>
                        <Typography fontWeight={700} sx={{ mb: 1 }}>{day.date}</Typography>
                        <List dense>
                            {day.items.map((it, i) => (
                                <div key={i}>
                                    <ListItem sx={{ py: 0.5 }}>
                                        <ListItemText primary={it.title} secondary={`${it.instructor} — ${it.time} • ${it.duration}`} />
                                    </ListItem>
                                    {i < day.items.length - 1 && <Divider />}
                                </div>
                            ))}
                        </List>
                    </Paper>
                ))}
            </Box>
        </Box>
    );
}
