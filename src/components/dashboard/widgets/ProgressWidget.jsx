import { Box, Typography, LinearProgress, Paper } from "@mui/material";

const sampleProgress = [
    { title: "Course One", completed: 15, total: 18, price: "150 Coins" },
    { title: "Course Two", completed: 7, total: 15, price: "270 Coins" },
    { title: "Course Three", completed: 10, total: 24, price: "400 Coins" },
];

export default function ProgressWidget({ title }) {
    return (
        <Box>
            <Typography fontWeight={700} variant="h6" sx={{ mb: 1 }}>{title}</Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
                {sampleProgress.map((p, i) => {
                    const percent = Math.round((p.completed / p.total) * 100);
                    return (
                        <Paper key={i} sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Box sx={{ flex: 1 }}>
                                <Typography fontWeight={700}>{p.title}</Typography>
                                <Typography variant="caption" color="text.secondary">{p.completed}/{p.total} Lessons</Typography>
                                <LinearProgress variant="determinate" value={percent} sx={{ mt: 1, height: 8, borderRadius: 2 }} />
                            </Box>
                            <Box sx={{ ml: 2, textAlign: 'right' }}>
                                <Typography variant="subtitle2">{p.price}</Typography>
                            </Box>
                        </Paper>
                    );
                })}
            </Box>
        </Box>
    );
}
