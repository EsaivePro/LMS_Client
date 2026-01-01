import * as React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
} from "@mui/material";

// ICONS
import SchoolIcon from "@mui/icons-material/School";
import TopicIcon from "@mui/icons-material/Topic";
import PersonIcon from "@mui/icons-material/Person";
import QuizIcon from "@mui/icons-material/Quiz";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PaymentIcon from "@mui/icons-material/Payment";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import StarIcon from "@mui/icons-material/Star";
import { useLocation } from "react-router-dom";
import useCommon from "../../hooks/useCommon";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import AccountBoxIcon from '@mui/icons-material/AccountBox';

export default function ContentContainer({ children }) {
  const { containerTitle, containerTitleDescription } = useCommon();

  const title = containerTitle.toLowerCase();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const location = useLocation();
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [location.pathname]);
  // -----------------------------------------------
  // 🔥 AUTO-DETECT HEADER ICON
  // -----------------------------------------------
  const getHeaderIcon = () => {
    if (title.includes("dashboard")) return <DashboardIcon fontSize="large" />;
    if (title.includes("course")) return <SchoolIcon fontSize="large" />;
    if (title.includes("user management")) return <ManageAccountsIcon fontSize="large" />;
    if (title.includes("enrollment")) return <FolderSharedIcon fontSize="large" />;
    if (title.includes("profile")) return <AccountBoxIcon fontSize="large" />;
    return <StarIcon fontSize="large" />; // ⭐ fallback icon
  };

  return (
    <Box sx={{ m: 0 }}>
      <Box height={isMobile ? 27 : 30} />
      {/* HEADER/HERO SECTION */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #1976d2 0%, #ffffff 100%)",
          color: "white",
          px: isMobile ? 2 : 4,
          py: isMobile ? 3 : 4,
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: "43px",
          width: "100%",
          borderRadius: "0 0 12px 12px",
        }}
      >
        {/* Icon */}
        <Avatar
          sx={{
            bgcolor: "rgba(255,255,255,0.25)",
            width: isMobile ? 46 : 56,
            height: isMobile ? 46 : 56,
          }}
        >
          {getHeaderIcon()}
        </Avatar>

        {/* Title text */}
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h4"}
            sx={{ fontWeight: 700, letterSpacing: 0.3 }}
          >
            {containerTitle}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {containerTitleDescription}
          </Typography>
        </Box>
      </Box>

      {/* PAGE CONTENT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          // mb: 3,
          mt: isMobile ? 2 : 3,
          pt: isMobile ? 0 : 3,
          pb: isMobile ? 1 : 3,
          mb: 0,
          background: "#ffffffff", //"linear-gradient(135deg, #f8fbff 0%, #f8fbff 100%)",
          borderRadius: 1
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

ContentContainer.propTypes = {
  children: PropTypes.node,
};
