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
import BreadcrumbsNav from "../common/breadcrumbs/BreadcrumbsNav";

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
    if (title.includes("dashboard")) return <DashboardIcon fontSize="small" sx={{ color: "var(--primary)" }} />;
    if (title.includes("course")) return <SchoolIcon fontSize="small" sx={{ color: "var(--primary)" }} />;
    if (title.includes("user management")) return <ManageAccountsIcon fontSize="small" sx={{ color: "var(--primary)" }} />;
    if (title.includes("enrollment")) return <FolderSharedIcon fontSize="small" sx={{ color: "var(--primary)" }} />;
    if (title.includes("profile")) return <AccountBoxIcon fontSize="small" sx={{ color: "var(--primary)" }} />;
    return <StarIcon fontSize="small" />; // ⭐ fallback icon
  };

  const loginAnim = keyframes`
    from { opacity: 0; transform: translateY(-6px); }
    to { opacity: 1; transform: translateY(0); }
  `;

  const reduxLastLogin = useSelector((s) => s.auth?.user?.lastLogin || s.user?.lastLogin || null);
  const [lastLogin, setLastLogin] = React.useState(reduxLastLogin || localStorage.getItem("lastLogin") || null);

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
      {/* <BreadcrumbsNav /> */}
      {/* <Box
        sx={{
          background: "var(--surface)",
          color: "var(--primary)",
          px: isMobile ? 2 : 2,
          py: isMobile ? 3 : 2,
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          gap: 2,
          width: "100%",
          borderRadius: 1,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.7, width: isMobile ? "100%" : "auto" }}>
         
          <Avatar
            sx={{
              bgcolor: "var(--onPrimary)",
              width: isMobile ? 46 : 30,
              height: isMobile ? 46 : 30,
            }}
          >
            {getHeaderIcon()}
          </Avatar>

          <Box>
            <Typography
              variant={isMobile ? "h6" : "h5"}
              sx={{ fontWeight: 700, letterSpacing: 0.3 }}
            >
              {containerTitle}
            </Typography>

            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
            </Typography>
          </Box>
        </Box>
        <Box sx={{ ml: isMobile ? 0 : "auto", mt: isMobile ? 1 : 0, textAlign: isMobile ? "left" : "right", animation: `${loginAnim} 520ms ease both` }}>
          <Typography variant="caption" sx={{ color: "var(--onPrimary)", display: "block" }}>
            Last login
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: "#303030ff" }}>
            {formatLogin(lastLogin || new Date().toISOString())}
          </Typography>
        </Box>
      </Box> */}

      {/* PAGE CONTENT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minHeight: "calc(100vh - 200px)",
          // mb: 3,
          mt: isMobile ? 2 : 2,
          pt: isMobile ? 0 : 0,
          // pb: isMobile ? 1 : 3,
          mb: isMobile ? 2 : 2,
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
