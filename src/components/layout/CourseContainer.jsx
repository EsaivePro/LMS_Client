import React from "react";
import { useSelector } from "react-redux";
import PropTypes from "prop-types";
import {
  Box,
  Typography,
  useMediaQuery,
  Stack,
  Chip,
  Card,
} from "@mui/material";
import { Fade } from "react-awesome-reveal";
import { useLocation } from "react-router-dom";

const courseData = {
  title: "Master React & Material UI — Full Course",
  subtitle:
    "Learn to build modern and responsive web apps using React + MUI.",
  category: "Frontend Development",
  duration: "12 Hours",
  courseId: "CRS-2025-REACT",
  updated: "Nov 2025",
};

// ---------------------------------------------------

export default function CourseContainer({ children }) {
  const containerTitle = useSelector((s) => s.ui.containerTitle) || "";
  const isMobile = useMediaQuery("(max-width:600px)");
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  return (
    <Box sx={{ m: 0 }}>
      {/* Space below navbar */}
      {/* <Box height={isMobile ? 15 : 20} /> */}
      {/* -------------------- PAGE CONTENT WRAPPER -------------------- */}
      <Box
        sx={{
          borderRadius: "12px",
          display: "flex",
          flexDirection: "column",
          marginTop: "-15px"
          // gap: 2,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

CourseContainer.propTypes = {
  children: PropTypes.node,
};
