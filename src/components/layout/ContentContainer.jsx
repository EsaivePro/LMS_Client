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
import { keyframes } from "@mui/system";

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
    if (title.includes("dashboard")) return <DashboardIcon fontSize="medium" />;
    if (title.includes("course")) return <SchoolIcon fontSize="medium" />;
    if (title.includes("user management")) return <ManageAccountsIcon fontSize="medium" />;
    if (title.includes("enrollment")) return <FolderSharedIcon fontSize="medium" />;
    if (title.includes("profile")) return <AccountBoxIcon fontSize="medium" />;
    return <StarIcon fontSize="medium" />; // ⭐ fallback icon
  };

  const loginAnim = keyframes`
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  const reduxLastLogin = useSelector((s) => s.auth?.user?.lastLogin || s.user?.lastLogin || null);
  const [lastLogin, setLastLogin] = React.useState(reduxLastLogin || localStorage.getItem("lastLogin") || "12 Jan 2024, 10:00 AM");

  React.useEffect(() => {
    if (reduxLastLogin) setLastLogin(reduxLastLogin);
  }, [reduxLastLogin]);

  React.useEffect(() => {
    const onStorage = (e) => {
      if (e.key === "lastLogin") setLastLogin(e.newValue);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const formatLogin = (val) => {
    if (!val) return "—";
    const d = new Date(val);
    if (isNaN(d)) return String(val);
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(d);
  };

  return (
    <Box sx={{ m: 0 }}>
      <Box height={isMobile ? 27 : 30} />
      {/* HEADER/HERO SECTION */}
      <Box
        sx={{
          background: "var(--surface)",
          color: "var(--textPrimary)",
          px: isMobile ? 2 : 2,
          py: isMobile ? 3 : 2,
          display: "flex",
          alignItems: "center",
          gap: 2,
          mt: "43px",
          width: "100%",
          borderRadius: 1,
        }}
      >
        {/* Icon */}
        <Avatar
          sx={{
            bgcolor: "var(--primary)",
            width: isMobile ? 46 : 50,
            height: isMobile ? 46 : 50,
          }}
        >
          {getHeaderIcon()}
        </Avatar>

        {/* Title text */}
        <Box>
          <Typography
            variant={isMobile ? "h5" : "h5"}
            sx={{ fontWeight: 700, letterSpacing: 0.3 }}
          >
            {containerTitle}
          </Typography>

          <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            {containerTitleDescription}
          </Typography>
        </Box>
        {/* Right side: last login */}
        <Box sx={{ ml: "auto", textAlign: "right", animation: `${loginAnim} 520ms ease both` }}>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            Last login
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatLogin(lastLogin)}
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
          mt: isMobile ? 2 : 1,
          pt: isMobile ? 0 : 3,
          pb: isMobile ? 1 : 3,
          mb: 0,
          background: "var(--onPrimary)", //"linear-gradient(135deg, #f8fbff 0%, #f8fbff 100%)",
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
