// ===========================
// SIDE BAR WITH HEADER (Nested Menu)
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
    Avatar
} from "@mui/material";

import MuiAppBar from "@mui/material/AppBar";
import { Link, useLocation } from "react-router-dom";

import Header from "./Header";
import ContentContainer from "./ContentContainer";

// Icons
import DashboardIcon from "@mui/icons-material/Dashboard";
import FeedIcon from "@mui/icons-material/Feed";
import TopicIcon from "@mui/icons-material/Topic";
import LogoutIcon from "@mui/icons-material/Logout";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

import PeopleIcon from "@mui/icons-material/People";
import SecurityIcon from "@mui/icons-material/Security";
import GroupIcon from "@mui/icons-material/Group";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import Person2Icon from '@mui/icons-material/Person2';
import useCommon from "../../hooks/useCommon"
import CourseContainer from "./CourseContainer";
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import FolderSharedIcon from '@mui/icons-material/FolderShared';
import { useAdmin } from "../../hooks/useAdmin";
import THEME from "../../constants/theme";
import GroupsIcon from '@mui/icons-material/Groups';
import CategoryIcon from '@mui/icons-material/Category';
import AssignmentAddIcon from '@mui/icons-material/AssignmentAdd';

const drawerWidth = 240;

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 5,
}));

const Main = styled("main")(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
}));
// ==============================
// DYNAMIC MENU CONFIGURATION
// ==============================
const MENU = [
    {
        label: "Dashboard",
        icon: <DashboardIcon />,
        to: "/",
        type: "item",
        role: "dashboard.view"
    },
    {
        label: "Courses",
        icon: <FeedIcon />,
        to: "/courses",
        type: "item",
        role: "course.list"
    },
    {
        label: "Category",
        icon: <CategoryIcon />,
        to: "/coursecategory",
        type: "item",
        role: "course.view"
    },
    {
        label: "Groups",
        icon: <GroupsIcon />,
        to: "/groups",
        type: "item",
        role: "course.view"
    },
    {
        label: "Group Assign",
        icon: <AssignmentAddIcon />,
        to: "/groups/assign",
        type: "item",
        role: "course.view"
    },
    {
        label: "User managemet",
        icon: <ManageAccountsIcon />,
        to: "/usermanagement/users",
        type: "item",
        role: "user.management"
    },
    {
        label: "Enrollment",
        icon: <FolderSharedIcon />,
        to: "/user/enrollment",
        type: "item",
        role: "enrollment.management"
    },
    // {
    //     label: "Permissions",
    //     icon: <SecurityIcon />,
    //     type: "group",
    //     children: [
    //         { label: "Create Role", icon: <SecurityIcon />, to: "/permissions/createrole" },
    //         { label: "Assign Role", icon: <SecurityIcon />, to: "/permissions/assignrole" }
    //     ],
    // },
    // {
    //     label: "Manage Group",
    //     icon: <GroupIcon />,
    //     type: "group",
    //     children: [
    //         { label: "Create Group", icon: <GroupIcon />, to: "/managegroup/groupcreation" },
    //         { label: "Assign Group", icon: <GroupIcon />, to: "/managegroup/assigngroup" }
    //     ],
    // },
];

export default function SideBarWithHeader({ children }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const location = useLocation();
    const viewSidebarHeader = useSelector((s) => s.ui.viewSidebarHeader) || true;
    const [open, setOpen] = React.useState(false);
    const [expandedGroup, setExpandedGroup] = React.useState(null);
    const sidebarRef = React.useRef(null);
    const { logout, user } = useAuth();
    const { viewContainerCard, viewCourseCard } = useCommon();
    const { permissions } = useAdmin();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const handleProfile = () => {
        navigate("/user/profile/" + user?.id);
    }
    // Auto expand the group of active child
    React.useEffect(() => {
        MENU.forEach((item, index) => {
            if (item.children?.some((c) => c.to === location.pathname)) {
                setExpandedGroup(index);
            }
        });
    }, [location.pathname]);

    const toggleSidebar = () => {
        setOpen(true);
    }

    // Toggle group expand
    const handleGroupClick = (index) => {
        setExpandedGroup((prev) => (prev === index ? null : index));
    };

    // Close sidebar when clicking outside
    React.useEffect(() => {
        const handleOutside = (e) => {
            if (open && sidebarRef.current && !sidebarRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handleOutside);
        return () => document.removeEventListener("mousedown", handleOutside);
    }, [open]);

    return (
        <div>
            <Box sx={{ display: "flex" }}>
                <CssBaseline />

                {/* TOP NAVBAR */}
                <AppBar position="fixed">
                    <Header toggleSidebar={toggleSidebar} profile={handleProfile} logout={handleLogout} open />
                </AppBar>

                {/* OVERLAY BACKDROP */}
                {open && (
                    <Box
                        sx={{
                            position: "fixed",
                            top: "64px",
                            left: 0,
                            width: "100%",
                            height: "calc(100vh - 64px)",
                            backgroundColor: "rgba(0,0,0,0.25)",
                            // backdropFilter: "blur(1px)",
                            zIndex: 1500,
                        }}
                        onClick={() => setOpen(false)}
                    />
                )}

                {/* SIDEBAR */}
                <Box
                    ref={sidebarRef}
                    sx={{
                        position: "fixed",
                        top: "64px",
                        left: open ? 0 : -drawerWidth,
                        width: drawerWidth,
                        height: "calc(100vh - 64px)",
                        background: "var(--dark)",
                        color: "var(--primary)",
                        transition: "left 0.3s ease",
                        zIndex: 2000,
                        overflowY: "auto",
                        boxShadow: "2px 0 12px rgba(0,0,0,0.3)",
                    }}
                >
                    {/* CLOSE BUTTON */}
                    {/* <Box
                        sx={{
                            height: 56,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            px: 2,
                        }}
                    >
                        <IconButton onClick={() => setOpen(false)} sx={{ color: "var(--primary)" }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: "var(--primary)" }} /> */}

                    {/* MENU LIST */}
                    <List>
                        {MENU.map((item, index) => {
                            // Check permission
                            if (!(item?.role && permissions && permissions.length > 0 && permissions?.some((p) => p?.key?.includes(item?.role)))) {
                                return null;
                            }
                            const isActive = location.pathname === item.to;
                            const isGroupActive = item.children?.some(
                                (child) => child.to === location.pathname
                            );
                            const expanded = expandedGroup === index;

                            return (
                                <React.Fragment key={index}>
                                    {/* ===============================
                                    SIMPLE MENU ITEM
                                =============================== */}
                                    {item.type === "item" && (
                                        <Link
                                            to={item.to}
                                            style={{ textDecoration: "none", color: "inherit" }}
                                            onClick={() => setOpen(false)}
                                        >
                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    sx={{
                                                        backgroundColor: isActive
                                                            ? "var(--primary)"
                                                            : "transparent",
                                                        color: isActive ? "var(--onPrimary)" : "var(--onPrimary)",
                                                        borderLeft: isActive
                                                            ? "4px solid var(--primaryMedium)"
                                                            : "4px solid transparent",
                                                        "&:hover": {
                                                            backgroundColor: isActive
                                                                ? "var(--primary)"
                                                                : "rgba(255, 255, 255, 0.15)",
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            color: isActive ? "var(--onPrimary)" : "var(--primary)",
                                                            minWidth: 40,
                                                        }}
                                                    >
                                                        {item.icon}
                                                    </ListItemIcon>
                                                    <ListItemText primary={item.label} />
                                                </ListItemButton>
                                            </ListItem>
                                        </Link>
                                    )}

                                    {/* ===============================
                                    GROUP WITH NESTED MENU
                                =============================== */}
                                    {item.type === "group" && (
                                        <>
                                            <ListItemButton
                                                onClick={() => handleGroupClick(index)}
                                                sx={{
                                                    backgroundColor: isGroupActive
                                                        ? "rgba(255,255,255,0.15)"
                                                        : "transparent",
                                                    borderLeft: isGroupActive
                                                        ? "4px solid var(--onPrimary)"
                                                        : "4px solid transparent",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(255,255,255,0.20)",
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: "var(--onPrimary)", minWidth: 40 }}>
                                                    {item.icon}
                                                </ListItemIcon>
                                                <ListItemText primary={item.label} />
                                                {expanded ? <ExpandLess /> : <ExpandMore />}
                                            </ListItemButton>

                                            {/* CHILDREN */}
                                            <Collapse in={expanded} timeout="auto" unmountOnExit>
                                                <List component="div" disablePadding>
                                                    {item.children.map((child, cIndex) => {
                                                        const isChildActive =
                                                            location.pathname === child.to;

                                                        return (
                                                            <Link
                                                                key={cIndex}
                                                                to={child.to}
                                                                style={{
                                                                    textDecoration: "none",
                                                                    color: "inherit",
                                                                }}
                                                                onClick={() => setOpen(false)}
                                                            >
                                                                <ListItem disablePadding>
                                                                    <ListItemButton
                                                                        sx={{
                                                                            pl: 6,
                                                                            backgroundColor: isChildActive
                                                                                ? "rgba(255,255,255,0.9)"
                                                                                : "transparent",
                                                                            color: isChildActive
                                                                                ? "var(--textPrimary)"
                                                                                : "var(--onPrimary)",
                                                                            borderLeft: isChildActive
                                                                                ? "4px solid var(--onPrimary)"
                                                                                : "4px solid transparent",
                                                                            "&:hover": {
                                                                                backgroundColor:
                                                                                    isChildActive
                                                                                        ? "rgba(255,255,255,0.9)"
                                                                                        : "rgba(255,255,255,0.12)",
                                                                            },
                                                                        }}
                                                                    >
                                                                        <ListItemIcon
                                                                            sx={{
                                                                                color: isChildActive
                                                                                    ? "var(--textPrimary)"
                                                                                    : "var(--onPrimary)",
                                                                                minWidth: 40,
                                                                            }}
                                                                        >
                                                                            {child.icon}
                                                                        </ListItemIcon>
                                                                        <ListItemText
                                                                            primary={child.label}
                                                                        />
                                                                    </ListItemButton>
                                                                </ListItem>
                                                            </Link>
                                                        );
                                                    })}
                                                </List>
                                            </Collapse>
                                        </>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </List>

                    <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.2)" }} />

                    {/* LOGOUT */}
                    <List>
                        <Link
                            to={"/user/profile/" + user?.id}
                            style={{ textDecoration: "none", color: "inherit" }}
                            onClick={() => setOpen(false)}
                        >
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        backgroundColor: false
                                            ? "var(--primaryLight)"
                                            : "transparent",
                                        color: false ? "var(--onPrimary)" : "var(--onPrimary)",
                                        borderLeft: false
                                            ? "4px solid var(--primary)"
                                            : "4px solid transparent",
                                        "&:hover": {
                                            backgroundColor: false
                                                ? "rgba(255,255,255,0.9)"
                                                : "rgba(255,255,255,0.12)",
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: false ? "var(--onPrimary)" : "var(--primary)",
                                            minWidth: 40,
                                        }}
                                    >
                                        < Person2Icon />
                                    </ListItemIcon>
                                    <ListItemText primary="Profile" />
                                </ListItemButton>
                            </ListItem>
                        </Link>

                        <Link
                            to="/login"
                            style={{ textDecoration: "none", color: "inherit" }}
                            onClick={handleLogout}
                        >
                            <ListItem disablePadding>
                                <ListItemButton
                                    sx={{
                                        backgroundColor: false
                                            ? "var(--primaryLight)"
                                            : "transparent",
                                        color: false ? "var(--onPrimary)" : "var(--onPrimary)",
                                        borderLeft: false
                                            ? "4px solid var(--primary)"
                                            : "4px solid transparent",
                                        "&:hover": {
                                            backgroundColor: false
                                                ? "rgba(255,255,255,0.9)"
                                                : "rgba(255,255,255,0.12)",
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: false ? "var(--onPrimary)" : "var(--primary)",
                                            minWidth: 40,
                                        }}
                                    >
                                        < LogoutIcon />
                                    </ListItemIcon>
                                    <ListItemText primary="Sign out" />
                                </ListItemButton>
                            </ListItem>
                        </Link>
                    </List>
                </Box>

                {/* MAIN CONTENT */}
                <Main sx={{ m: 0, p: 0, maxWidth: '100%' }}>
                    <Box sx={{ m: isMobile ? 1.8 : 4, mt: isMobile ? 9 : 9, mb: 0 }}>
                        {viewContainerCard && <ContentContainer>{children}</ContentContainer>}
                        {(!viewContainerCard && !viewCourseCard) && <Box>{children}</Box>}
                    </Box>
                    <Box sx={{ mt: isMobile ? 16 : 16 }}>
                        {viewCourseCard && <CourseContainer>{children}</CourseContainer>}
                    </Box>
                </Main>
            </Box>
        </div>
    );
}
