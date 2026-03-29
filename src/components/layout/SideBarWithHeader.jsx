// ===========================
// SIDE BAR WITH HEADER
// ===========================

import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import {
    Box,
    CssBaseline,
    IconButton,
    Divider,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Collapse,
    useMediaQuery,
    Typography,
    InputBase,
} from "@mui/material";

import MuiAppBar from "@mui/material/AppBar";
import { Link, useLocation } from "react-router-dom";

import Header from "./Header";
import ContentContainer from "./ContentContainer";
import CourseContainer from "./CourseContainer";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedIcon from "@mui/icons-material/Feed";
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Person2Icon from "@mui/icons-material/Person2";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import GroupsIcon from "@mui/icons-material/Groups";
import CategoryIcon from "@mui/icons-material/Category";
import AssignmentAddIcon from "@mui/icons-material/AssignmentAdd";
import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentIcon from "@mui/icons-material/Assignment";
import LabelIcon from "@mui/icons-material/Label";
import SegmentIcon from "@mui/icons-material/Segment";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import FormatListNumberedIcon from "@mui/icons-material/FormatListNumbered";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";

import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useCommon from "../../hooks/useCommon";
import { useAdmin } from "../../hooks/useAdmin";
import { httpClient } from "../../apiClient/httpClient";
import { tokenStorage } from "../../utils/tokenStorage.utils";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 5,
}));

const Main = styled("main")(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
}));

// ==============================
// MENU CONFIG  (type: "section" = group header label; type: "item" = nav link; type: "group" = collapsible)
// ==============================
const MENU = [
    {
        label: "Dashboard",
        icon: <DashboardIcon />,
        to: "/",
        type: "item",
        role: "dashboard.view",
    },

    { type: "section", label: "Learning" },
    {
        label: "Courses",
        icon: <FeedIcon />,
        to: "/courses",
        type: "item",
        role: "course.list",
    },
    {
        label: "Category",
        icon: <CategoryIcon />,
        to: "/coursecategory",
        type: "item",
        role: "coursecategory.manage",
    },

    { type: "section", label: "People" },
    {
        label: "Learning Insights",
        icon: <InsightsIcon />,
        to: "/users/learing-insights",
        type: "item",
        role: "user.management",
    },
    {
        label: "Groups",
        icon: <GroupsIcon />,
        to: "/groups",
        type: "item",
        role: "group.management",
    },
    {
        label: "Group Assign",
        icon: <AssignmentAddIcon />,
        to: "/groups/assign",
        type: "item",
        role: "group.management",
    },
    {
        label: "User Management",
        icon: <ManageAccountsIcon />,
        to: "/usermanagement/users",
        type: "item",
        role: "user.management",
    },

    { type: "section", label: "Manage Configurations" },
    {
        label: "Topics",
        icon: <LabelIcon />,
        to: "/topics/manage/list",
        matchPath: "/topics/manage",
        type: "item",
        role: "user.management",
    },
    {
        label: "Sections",
        icon: <SegmentIcon />,
        to: "/sections/manage/list",
        matchPath: "/sections/manage",
        type: "item",
        role: "user.management",
    },
    {
        label: "Questions Bank",
        icon: <QuestionAnswerIcon />,
        to: "/questions/manage/list",
        matchPath: "/questions/manage",
        type: "item",
        role: "user.management",
    },
    {
        label: "Question Sections",
        icon: <FormatListNumberedIcon />,
        to: "/question-sections/manage/list",
        matchPath: "/question-sections/manage",
        type: "item",
        role: "user.management",
    },
    {
        label: "Exams",
        icon: <AssignmentIcon />,
        to: "/exams",
        type: "item",
        role: "user.management",
    },
    {
        label: "Exam Sections",
        icon: <PlaylistAddCheckIcon />,
        to: "/exam-sections/manage/list",
        matchPath: "/exam-sections/manage",
        type: "item",
        role: "user.management",
    },
];

export default function SideBarWithHeader({ children, fixed = true, footer = null }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const location = useLocation();

    const [open, setOpen] = React.useState(fixed ? true : false);
    const [expandedGroup, setExpandedGroup] = React.useState(null);
    const [search, setSearch] = React.useState("");

    const sidebarRef = React.useRef(null);
    const { user, isAuthenticated } = useAuth();
    const { viewContainerCard, viewCourseCard, viewHeader } = useCommon();
    const { permissions } = useAdmin();
    const navigate = useNavigate();

    // ── Logout ─────────────────────────────────────────────────
    const handleLogout = async (e) => {
        if (e?.preventDefault) e.preventDefault();
        try {
            await httpClient.logoutUser();
            tokenStorage.clearAll();
            navigate("/login");
        } catch (err) {
            console.error("Server logout failed:", err);
        }
    };

    // ── Auto-expand group for active child ──────────────────────
    React.useEffect(() => {
        MENU.forEach((item) => {
            if (item.type === "group" && item.children?.some((c) => c.to === location.pathname)) {
                setExpandedGroup(item.label);
            }
        });
    }, [location.pathname]);

    // ── Outside click closes sidebar (overlay mode / mobile) ────
    React.useEffect(() => {
        if (fixed && !isMobile) return;
        const handleOutside = (e) => {
            if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [open, isMobile, fixed]);

    const toggleSidebar = () => setOpen((prev) => !prev);

    // ── Permission helper ───────────────────────────────────────
    const isPermitted = (role) =>
        role && permissions?.length > 0 && permissions.some((p) => p?.key?.includes(role));

    // ── Build visible menu (permission + search filtered) ───────
    const visibleMenu = React.useMemo(() => {
        const q = search.trim().toLowerCase();
        const result = [];
        let pendingSection = null;
        let sectionUsed = false;

        MENU.forEach((item) => {
            if (item.type === "section") {
                pendingSection = item;
                sectionUsed = false;
                return;
            }

            if (item.type === "item") {
                if (!isPermitted(item.role)) return;
                if (q && !item.label.toLowerCase().includes(q)) return;
                if (pendingSection && !sectionUsed) {
                    result.push(pendingSection);
                    sectionUsed = true;
                }
                result.push(item);
                return;
            }

            if (item.type === "group") {
                if (item.role && !isPermitted(item.role)) return;
                const visibleChildren = (item.children || []).filter(
                    (c) => !q || c.label.toLowerCase().includes(q)
                );
                if (visibleChildren.length === 0) return;
                if (pendingSection && !sectionUsed) {
                    result.push(pendingSection);
                    sectionUsed = true;
                }
                result.push({ ...item, children: visibleChildren });
            }
        });

        return result;
    }, [search, permissions]);

    const sidebarOffset = fixed && !isMobile && open ? `${drawerWidth}px` : "0px";

    const closeSidebarOnNav = () => {
        if (!fixed || isMobile) setOpen(false);
    };

    return (
        <div style={{ "--sidebar-offset": sidebarOffset }}>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />

                {/* ── TOP APP BAR ── */}
                {viewHeader && (
                    <AppBar position="fixed">
                        <Header
                            toggleSidebar={toggleSidebar}
                            profile={() => navigate("/user/profile/" + user?.id)}
                            logout={handleLogout}
                            open={open}
                        />
                    </AppBar>
                )}

                {/* ── OVERLAY BACKDROP ── */}
                {open && (fixed ? isMobile : true) && (
                    <Box
                        onClick={() => setOpen(false)}
                        sx={{
                            position: "fixed",
                            top: "64px",
                            left: 0,
                            width: "100%",
                            height: "calc(100vh - 64px)",
                            backgroundColor: "rgba(0,0,0,0.3)",
                            zIndex: 1500,
                        }}
                    />
                )}

                {/* ── SIDEBAR DRAWER ── */}
                <Box
                    ref={sidebarRef}
                    sx={{
                        position: "fixed",
                        top: "64px",
                        left: open ? 0 : -drawerWidth,
                        width: drawerWidth,
                        height: "calc(100vh - 64px)",
                        background: "#1a1d23",
                        transition: "left 0.3s ease",
                        zIndex: 2000,
                        display: "flex",
                        flexDirection: "column",
                        boxShadow: "4px 0 20px rgba(0,0,0,0.4)",
                        overflowX: "hidden",
                        "&::-webkit-scrollbar": { width: 3 },
                        "&::-webkit-scrollbar-track": { background: "transparent" },
                        "&::-webkit-scrollbar-thumb": {
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: 2,
                        },
                    }}
                >
                    {/* ── SEARCH BAR ── */}
                    <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                background: "rgba(255,255,255,0.07)",
                                borderRadius: 2,
                                px: 1.5,
                                py: 0.8,
                                border: "1px solid rgba(255,255,255,0.06)",
                                transition: "all 0.2s ease",
                                "&:focus-within": {
                                    border: "1px solid rgba(143,0,255,0.45)",
                                    background: "rgba(255,255,255,0.1)",
                                },
                            }}
                        >
                            <SearchIcon sx={{ fontSize: 17, color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
                            <InputBase
                                placeholder="Search menu..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                sx={{
                                    flex: 1,
                                    color: "#fff",
                                    fontSize: 15,
                                    "& input::placeholder": {
                                        color: "rgba(255,255,255,0.35)",
                                        opacity: 1,
                                    },
                                }}
                            />
                            {search && (
                                <IconButton
                                    size="small"
                                    onClick={() => setSearch("")}
                                    sx={{ p: 0, color: "rgba(255,255,255,0.4)", "&:hover": { color: "#fff" } }}
                                >
                                    <CloseIcon sx={{ fontSize: 14 }} />
                                </IconButton>
                            )}
                        </Box>
                    </Box>

                    {/* ── MENU LIST ── */}
                    <Box sx={{ flex: 1, overflowY: "auto", px: 1, pb: 1 }}>
                        <List disablePadding>
                            {visibleMenu.map((item, index) => {
                                // Section header
                                if (item.type === "section") {
                                    return (
                                        <Box key={`sec-${index}`} sx={{ mt: index === 0 ? 0.5 : 2, mb: 0.5 }}>
                                            <Typography
                                                sx={{
                                                    fontSize: 11,
                                                    fontWeight: 700,
                                                    letterSpacing: 1.8,
                                                    color: "rgba(255,255,255,0.28)",
                                                    textTransform: "uppercase",
                                                    px: 1.5,
                                                }}
                                            >
                                                {item.label}
                                            </Typography>
                                        </Box>
                                    );
                                }

                                const isActive = item.matchPath
                                    ? location.pathname.startsWith(item.matchPath)
                                    : location.pathname === item.to;
                                const isGroupActive = item.children?.some((c) => c.to === location.pathname);
                                const expanded = expandedGroup === item.label;

                                // Simple nav item
                                if (item.type === "item") {
                                    return (
                                        <Link
                                            key={index}
                                            to={item.to}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                            onClick={closeSidebarOnNav}
                                        >
                                            <ListItem disablePadding sx={{ mb: 0.25 }}>
                                                <ListItemButton
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        py: 0.7,
                                                        px: 1.5,
                                                        background: isActive
                                                            ? "linear-gradient(90deg, #8F00FF 0%, #6d00c4 100%)"
                                                            : "transparent",
                                                        boxShadow: isActive
                                                            ? "0 2px 8px rgba(143,0,255,0.35)"
                                                            : "none",
                                                        "&:hover": {
                                                            background: isActive
                                                                ? "linear-gradient(90deg, #8F00FF 0%, #6d00c4 100%)"
                                                                : "rgba(255,255,255,0.06)",
                                                        },
                                                        transition: "all 0.15s ease",
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            color: isActive
                                                                ? "#fff"
                                                                : "rgba(255,255,255,0.5)",
                                                            minWidth: 34,
                                                            "& .MuiSvgIcon-root": { fontSize: 22 },
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.label}
                                                        primaryTypographyProps={{
                                                            fontSize: 16,
                                                            fontWeight: isActive ? 600 : 400,
                                                            color: isActive ? "#fff" : "rgba(255,255,255,0.78)",
                                                            letterSpacing: 0.2,
                                                        }}
                                                    />
                                                    {isActive && (
                                                        <Box
                                                            sx={{
                                                                width: 6,
                                                                height: 6,
                                                                borderRadius: "50%",
                                                                background: "rgba(255,255,255,0.8)",
                                                                flexShrink: 0,
                                                            }}
                                                        />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>
                                        </Link>
                                    );
                                }

                                // Collapsible group
                                if (item.type === "group") {
                                    return (
                                        <React.Fragment key={index}>
                                            <ListItem disablePadding sx={{ mb: 0.25 }}>
                                                <ListItemButton
                                                    onClick={() =>
                                                        setExpandedGroup((prev) =>
                                                            prev === item.label ? null : item.label
                                                        )
                                                    }
                                                    sx={{
                                                        borderRadius: 1.5,
                                                        py: 0.7,
                                                        px: 1.5,
                                                        background: isGroupActive
                                                            ? "rgba(143,0,255,0.15)"
                                                            : "transparent",
                                                        "&:hover": {
                                                            background: "rgba(255,255,255,0.06)",
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            color: isGroupActive
                                                                ? "#8F00FF"
                                                                : "rgba(255,255,255,0.5)",
                                                            minWidth: 34,
                                                            "& .MuiSvgIcon-root": { fontSize: 22 },
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText
                                                        primary={item.label}
                                                        primaryTypographyProps={{
                                                            fontSize: 16,
                                                            fontWeight: isGroupActive ? 600 : 400,
                                                            color: "rgba(255,255,255,0.78)",
                                                        }}
                                                    />
                                                    {expanded ? (
                                                        <ExpandLess
                                                            sx={{ fontSize: 17, color: "rgba(255,255,255,0.4)" }}
                                                        />
                                                    ) : (
                                                        <ExpandMore
                                                            sx={{ fontSize: 17, color: "rgba(255,255,255,0.4)" }}
                                                        />
                                                    )}
                                                </ListItemButton>
                                            </ListItem>

                                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                                                <List disablePadding sx={{ pl: 0.5 }}>
                                                    {item.children.map((child, cIdx) => {
                                                        const isChildActive = child.matchPath
                                                            ? location.pathname.startsWith(child.matchPath)
                                                            : location.pathname === child.to;
                                                        return (
                                                            <Link
                                                                key={cIdx}
                                                                to={child.to}
                                                                style={{ textDecoration: "none", color: "inherit" }}
                                                                onClick={closeSidebarOnNav}
                                                            >
                                                                <ListItem disablePadding sx={{ mb: 0.25 }}>
                                                                    <ListItemButton
                                                                        sx={{
                                                                            borderRadius: 1.5,
                                                                            py: 0.6,
                                                                            pl: 3.5,
                                                                            background: isChildActive
                                                                                ? "linear-gradient(90deg, #8F00FF 0%, #6d00c4 100%)"
                                                                                : "transparent",
                                                                            "&:hover": {
                                                                                background: isChildActive
                                                                                    ? "linear-gradient(90deg, #8F00FF 0%, #6d00c4 100%)"
                                                                                    : "rgba(255,255,255,0.06)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <ListItemIcon
                                                                            sx={{
                                                                                color: isChildActive
                                                                                    ? "#fff"
                                                                                    : "rgba(255,255,255,0.45)",
                                                                                minWidth: 30,
                                                                                "& .MuiSvgIcon-root": { fontSize: 20 },
                                                                            }}
                                                                        >
                                                                            {child.icon}
                                                                        </ListItemIcon>
                                                                        <ListItemText
                                                                            primary={child.label}
                                                                            primaryTypographyProps={{
                                                                                fontSize: 15,
                                                                                fontWeight: isChildActive ? 600 : 400,
                                                                                color: isChildActive
                                                                                    ? "#fff"
                                                                                    : "rgba(255,255,255,0.7)",
                                                                            }}
                                                                        />
                                                                    </ListItemButton>
                                                                </ListItem>
                                                            </Link>
                                                        );
                                                    })}
                                                </List>
                                            </Collapse>
                                        </React.Fragment>
                                    );
                                }

                                return null;
                            })}

                            {/* Empty search state */}
                            {search && visibleMenu.length === 0 && (
                                <Box sx={{ textAlign: "center", py: 3 }}>
                                    <Typography sx={{ fontSize: 14, color: "rgba(255,255,255,0.3)" }}>
                                        No results for "{search}"
                                    </Typography>
                                </Box>
                            )}
                        </List>
                    </Box>

                    {/* ── BOTTOM: PROFILE + SIGN OUT ── */}
                    <Box>
                        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mx: 1.5 }} />
                        <Box sx={{ px: 1, py: 1 }}>
                            <Link
                                to={"/user/profile/" + user?.id}
                                style={{ textDecoration: "none", color: "inherit" }}
                                onClick={closeSidebarOnNav}
                            >
                                <ListItemButton
                                    sx={{
                                        borderRadius: 1.5,
                                        py: 0.7,
                                        px: 1.5,
                                        mb: 0.25,
                                        "&:hover": { background: "rgba(255,255,255,0.06)" },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: "rgba(255,255,255,0.5)",
                                            minWidth: 34,
                                            "& .MuiSvgIcon-root": { fontSize: 22 },
                                        }}
                                    >
                                        <Person2Icon />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="Profile"
                                        primaryTypographyProps={{
                                            fontSize: 16,
                                            color: "rgba(255,255,255,0.78)",
                                        }}
                                    />
                                </ListItemButton>
                            </Link>

                            <ListItemButton
                                onClick={handleLogout}
                                sx={{
                                    borderRadius: 1.5,
                                    py: 0.7,
                                    px: 1.5,
                                    "&:hover": { background: "rgba(255,80,80,0.1)" },
                                }}
                            >
                                <ListItemIcon
                                    sx={{
                                        color: "rgba(255,120,120,0.7)",
                                        minWidth: 34,
                                        "& .MuiSvgIcon-root": { fontSize: 22 },
                                    }}
                                >
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Sign out"
                                    primaryTypographyProps={{
                                        fontSize: 16,
                                        color: "rgba(255,140,140,0.85)",
                                    }}
                                />
                            </ListItemButton>
                        </Box>
                    </Box>
                </Box>

                {/* ── MAIN CONTENT ── */}
                {viewHeader ? (
                    <Main
                        sx={{
                            m: 0,
                            p: 0,
                            // maxWidth: "100%",
                            ml: fixed && !isMobile && open ? `${drawerWidth}px` : 0,
                            transition: "margin-left 0.3s ease",
                            flex: 1,
                            minWidth: 0,   // 🔥 VERY IMPORTANT (prevents overflow)
                            overflowX: "clip"  // clip (not hidden) — overflow:hidden/auto creates a scroll container that breaks position:sticky
                        }}
                    >
                        <Box
                            sx={{
                                m: 0,
                                px: isMobile ? 1.8 : 4,
                                mt: isMobile ? 9 : 9,
                                mb: 0,
                                background:
                                    "linear-gradient(135deg, #f8f9fb 0%, #fdfdff 50%, #ffffff 100%)",
                            }}
                        >
                            {viewContainerCard && <ContentContainer>{children}</ContentContainer>}
                            {!viewContainerCard && !viewCourseCard && <Box>{children}</Box>}
                        </Box>
                        <Box sx={{ mt: isMobile ? 16 : 16 }}>
                            {viewCourseCard && <CourseContainer>{children}</CourseContainer>}
                        </Box>
                        {footer}
                    </Main>
                ) : (
                    <Main sx={{ m: 0, p: 0, maxWidth: "100%" }}>
                        <Box>{children}</Box>
                    </Main>
                )}
            </Box>
        </div>
    );
}
