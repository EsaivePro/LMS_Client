import * as React from "react";
import PropTypes from "prop-types";
import { useSelector } from "react-redux";
import {
  Box,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { keyframes, Stack } from "@mui/system";

// ICONS
import SchoolIcon from "@mui/icons-material/School";
import QuizIcon from "@mui/icons-material/Quiz";
import DashboardIcon from "@mui/icons-material/Dashboard";
import GroupsIcon from "@mui/icons-material/Groups";
import StarIcon from "@mui/icons-material/Star";
import { useLocation } from "react-router-dom";
import useCommon from "../../hooks/useCommon";
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import AccountBoxIcon from '@mui/icons-material/AccountBox';
import FeedIcon from "@mui/icons-material/Feed";
import CategoryIcon from "@mui/icons-material/Category";
import InsightsIcon from "@mui/icons-material/Insights";
import LabelIcon from "@mui/icons-material/Label";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import ArticleIcon from "@mui/icons-material/Article";
import RuleIcon from "@mui/icons-material/Rule";
import AssignmentIcon from "@mui/icons-material/Assignment";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import LiveTvIcon from "@mui/icons-material/LiveTv";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import WorkHistoryIcon from "@mui/icons-material/WorkHistory";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import BarChartIcon from "@mui/icons-material/BarChart";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import SettingsApplicationsIcon from "@mui/icons-material/SettingsApplications";
import { useFormHeader } from "../../contexts/FormHeaderContext";

export default function ContentContainer({ children }) {
  const { containerTitle, containerTitleDescription } = useCommon();
  const { formHeader } = useFormHeader() || {};
  const isDetailsForm = Boolean(formHeader);
  const headerTitle = isDetailsForm ? "Settings" : containerTitle;
  const headerDescription = isDetailsForm
    ? "Create, update, and manage configuration details."
    : containerTitleDescription || `Manage all aspects of ${containerTitle.toLowerCase()} here.`;

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
    const iconSx = { color: "var(--primary)" };
    if (isDetailsForm && title.includes("manage content section")) return <ArticleIcon sx={iconSx} />;
    if (isDetailsForm && title.includes("manage questions section")) return <RuleIcon sx={iconSx} />;
    if (isDetailsForm) return <SettingsApplicationsIcon sx={iconSx} />;

    const iconMap = [
      { match: "course details", icon: <SchoolIcon sx={iconSx} /> },
      { match: "edit course", icon: <SchoolIcon sx={iconSx} /> },
      { match: "user management", icon: <ManageAccountsIcon sx={iconSx} /> },
      { match: "manage group", icon: <GroupsIcon sx={iconSx} /> },
      { match: "user profile", icon: <AccountBoxIcon sx={iconSx} /> },
      { match: "manage role", icon: <AdminPanelSettingsIcon sx={iconSx} /> },
      { match: "enrollment manager", icon: <PersonAddIcon sx={iconSx} /> },
      { match: "user learning insights", icon: <InsightsIcon sx={iconSx} /> },
      { match: "audit logs", icon: <ReceiptLongIcon sx={iconSx} /> },
      { match: "file upload manager", icon: <CloudUploadIcon sx={iconSx} /> },
      { match: "manage category", icon: <ViewModuleIcon sx={iconSx} /> },
      { match: "manage enrollment jobs", icon: <WorkHistoryIcon sx={iconSx} /> },
      { match: "my courses", icon: <SchoolIcon sx={iconSx} /> },
      { match: "my exams", icon: <QuizIcon sx={iconSx} /> },
      { match: "category dashboard", icon: <BarChartIcon sx={iconSx} /> },
      { match: "dashboard", icon: <DashboardIcon sx={iconSx} /> },
      { match: "enrollment detail", icon: <FolderSharedIcon sx={iconSx} /> },
      { match: "user enrollment profile", icon: <AssignmentIndIcon sx={iconSx} /> },
      { match: "assign user to group", icon: <PersonAddIcon sx={iconSx} /> },
      { match: "manage topic", icon: <LabelIcon sx={iconSx} /> },
      { match: "manage course", icon: <FeedIcon sx={iconSx} /> },
      { match: "manage content library", icon: <CategoryIcon sx={iconSx} /> },
      { match: "manage content section", icon: <ArticleIcon sx={iconSx} /> },
      { match: "manage questions section", icon: <RuleIcon sx={iconSx} /> },
      { match: "manage question", icon: <QuestionAnswerIcon sx={iconSx} /> },
      { match: "manage exam", icon: <AssignmentIcon sx={iconSx} /> },
      { match: "manage user group assign", icon: <PlaylistAddCheckIcon sx={iconSx} /> },
      { match: "question bank", icon: <QuestionAnswerIcon sx={iconSx} /> },
      { match: "vimeo video demo", icon: <LiveTvIcon sx={iconSx} /> },
      { match: "demo", icon: <LiveTvIcon sx={iconSx} /> },
      { match: "exam", icon: <QuizIcon sx={iconSx} /> },
    ];
    return iconMap.find(({ match }) => title.includes(match))?.icon || <StarIcon sx={iconSx} />;
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
    <Box sx={{ mt: isDetailsForm ? 13 : 0 }}>
      <Box height={isMobile ? 27 : 30} />
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between"
        alignItems={{ md: "center" }} spacing={2} mb={2.5}>
        <Box>
          <Stack direction="row" spacing={1} alignItems="center" mb={0.75}>
            {getHeaderIcon()}
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {headerTitle}
            </Typography>
          </Stack>
          <Typography sx={{ color: "text.secondary" }}>
            {headerDescription}
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
