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
import { keyframes, Stack } from "@mui/system";

// ICONS
import SchoolIcon from "@mui/icons-material/School";
import TopicIcon from "@mui/icons-material/Topic";
import PersonIcon from "@mui/icons-material/Person";
import QuizIcon from "@mui/icons-material/Quiz";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import PaymentIcon from "@mui/icons-material/Payment";
import LibraryBooksIcon from "@mui/icons-material/LibraryBooks";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import { useLocation } from "react-router-dom";
import useCommon from "../../hooks/useCommon";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import BreadcrumbsNav from "../common/breadcrumbs/BreadcrumbsNav";
import { get } from "react-hook-form";

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
    if (title.includes("dashboard")) return <DashboardIcon sx={{ color: "var(--primary)" }} />;
    if (title.includes("group")) return <GroupsIcon sx={{ color: "var(--primary)" }} />;
    if (title.includes("course")) return <SchoolIcon sx={{ color: "var(--primary)" }} />;
    if (title.includes("user management")) return <ManageAccountsIcon sx={{ color: "var(--primary)" }} />;
    if (title.includes("enrollment")) return <FolderSharedIcon sx={{ color: "var(--primary)" }} />;
    if (title.includes("profile")) return <AccountBoxIcon sx={{ color: "var(--primary)" }} />;
    return <StarIcon sx={{ color: "var(--primary)" }} />; // ⭐ fallback icon
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
    <Box>
      <Box height={isMobile ? 27 : 30} />
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between"
        alignItems={{ md: "center" }} spacing={2} mb={2.5}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
            {getHeaderIcon()}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {containerTitle}
            </Typography>
          </Stack>
          <Typography sx={{ color: "text.secondary" }}>
            {containerTitleDescription || `Manage all aspects of ${containerTitle.toLowerCase()} here.`}
          </Typography>
        </Box>

        <Stack direction="row" spacing={1} alignItems="center">
          {/* <Chip
            label={`${rows.length} ${rows.length === 1 ? "file" : "files"}`}
            sx={{ borderRadius: 2, px: 1, fontWeight: 600 }}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<AddIcon />}
            onClick={handleCreate}
            sx={{ borderRadius: 2 }}
          >
            New File Record
          </Button> */}
        </Stack>
      </Stack>

      {/* PAGE CONTENT */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          minHeight: "calc(100vh - 200px)",
          p: 2.5,
          borderRadius: 3,
          border: "1px solid",
          borderColor: "divider",
          background: "linear-gradient(180deg, #ffffff 0%, #fbfdff 100%)",
        }}
      //     sx={{
      //   bgcolor: "background.paper",
      //   px: 3,
      //   py: 2.5
      // }}
      >
        {children}
      </Box>
    </Box>
  );
}

ContentContainer.propTypes = {
  children: PropTypes.node,
};
