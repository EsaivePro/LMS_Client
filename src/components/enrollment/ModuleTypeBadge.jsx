import React from "react";
import { Chip } from "@mui/material";
import BookOutlinedIcon from "@mui/icons-material/BookOutlined";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

export default function ModuleTypeBadge({ type }) {
    const isCourse = type === "course";
    return (
        <Chip
            icon={
                isCourse
                    ? <BookOutlinedIcon sx={{ fontSize: "14px !important" }} />
                    : <DescriptionOutlinedIcon sx={{ fontSize: "14px !important" }} />
            }
            label={isCourse ? "Course" : "Exam"}
            size="small"
            sx={{
                bgcolor: isCourse ? "#1976d2" : "#ed6c02",
                color: "white",
                fontWeight: 600,
                fontSize: 11,
                "& .MuiChip-icon": { color: "white" },
            }}
        />
    );
}
