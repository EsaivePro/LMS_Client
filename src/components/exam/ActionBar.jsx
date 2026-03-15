import React from "react";
import { Box, Button, Stack } from "@mui/material";

export default function ActionBar({ onMark, onClear, onSaveNext, isMarked }) {
    return (
        <Box
            sx={{
                position: "fixed",
                bottom: 0,
                left: 0,
                right: 0,
                bgcolor: "#fff",
                borderTop: "1px solid #e5e7eb",
                zIndex: 100,
                py: 1.5
            }}
        >
            <Box
                sx={{
                    maxWidth: 1400,
                    mx: "auto",
                    px: { xs: 2, md: 3 },
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1
                }}
            >
                {/* LEFT SIDE */}
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="outlined"
                        color="warning"
                        onClick={onMark}
                        sx={{
                            fontWeight: 600,
                            textTransform: "none"
                        }}
                    >
                        {isMarked ? "Unmark Review" : "Mark for Review"}
                    </Button>

                    <Button
                        variant="outlined"
                        onClick={onClear}
                        sx={{
                            fontWeight: 600,
                            textTransform: "none"
                        }}
                    >
                        Clear Response
                    </Button>
                </Stack>

                {/* RIGHT SIDE */}
                <Stack direction="row" spacing={1}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={onSaveNext}
                        sx={{
                            fontWeight: 600,
                            px: 3,
                            textTransform: "none"
                        }}
                    >
                        Save & Next
                    </Button>

                    <Button
                        variant="contained"
                        color="error"
                        sx={{
                            fontWeight: 600,
                            px: 3,
                            textTransform: "none"
                        }}
                    >
                        Submit Test
                    </Button>
                </Stack>
            </Box>
        </Box>
    );
}