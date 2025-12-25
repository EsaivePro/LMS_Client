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
    Collapse
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
    },
    {
        label: "Courses",
        icon: <FeedIcon />,
        to: "/courses",
        type: "item",
    },
    {
        label: "User managemet",
        icon: <ManageAccountsIcon />,
        to: "/usermanagement/users",
        type: "item",
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
    const location = useLocation();
    const viewSidebarHeader = useSelector((s) => s.ui.viewSidebarHeader) || true;
    const [open, setOpen] = React.useState(false);
    const [expandedGroup, setExpandedGroup] = React.useState(null);
    const sidebarRef = React.useRef(null);
    const { logout } = useAuth();
    const { viewContainerCard, viewCourseCard } = useCommon();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };
    const handleProfile = () => {

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
                            backdropFilter: "blur(3px)",
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
                        background: "linear-gradient(180deg, #39abe0, #2575fc)",
                        color: "#fff",
                        transition: "left 0.3s ease",
                        zIndex: 2000,
                        overflowY: "auto",
                        boxShadow: "2px 0 12px rgba(0,0,0,0.3)",
                    }}
                >
                    {/* CLOSE BUTTON */}
                    <Box
                        sx={{
                            height: 56,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            px: 2,
                        }}
                    >
                        <IconButton onClick={() => setOpen(false)} sx={{ color: "white" }}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </Box>

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

                    {/* MENU LIST */}
                    <List>
                        {MENU.map((item, index) => {
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
                                                            ? "rgba(255,255,255,0.9)"
                                                            : "transparent",
                                                        color: isActive ? "#000" : "#fff",
                                                        borderLeft: isActive
                                                            ? "4px solid #fff"
                                                            : "4px solid transparent",
                                                        "&:hover": {
                                                            backgroundColor: isActive
                                                                ? "rgba(255,255,255,0.9)"
                                                                : "rgba(255,255,255,0.12)",
                                                        },
                                                    }}
                                                >
                                                    <ListItemIcon
                                                        sx={{
                                                            color: isActive ? "#000" : "#fff",
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
                                                        ? "4px solid #fff"
                                                        : "4px solid transparent",
                                                    "&:hover": {
                                                        backgroundColor: "rgba(255,255,255,0.20)",
                                                    },
                                                }}
                                            >
                                                <ListItemIcon sx={{ color: "#fff", minWidth: 40 }}>
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
                                                                                ? "#000"
                                                                                : "#fff",
                                                                            borderLeft: isChildActive
                                                                                ? "4px solid #fff"
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
                                                                                    ? "#000"
                                                                                    : "#fff",
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

                    <Divider sx={{ borderColor: "rgba(255,255,255,0.2)" }} />

                    {/* LOGOUT */}
                    <List>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleProfile}>
                                <ListItemIcon sx={{ color: "white" }}>
                                    < Person2Icon />
                                </ListItemIcon>
                                <ListItemText primary="Profiler" />
                            </ListItemButton>
                        </ListItem>
                        <ListItem disablePadding>
                            <ListItemButton onClick={handleLogout}>
                                <ListItemIcon sx={{ color: "white" }}>
                                    <LogoutIcon />
                                </ListItemIcon>
                                <ListItemText primary="Logout" />
                            </ListItemButton>
                        </ListItem>
                    </List>
                </Box>

                {/* MAIN CONTENT */}
                <Main sx={{ m: 0, p: 0 }}>
                    <Box sx={{ m: 4, mt: 2 }}>
                        {viewContainerCard && <ContentContainer>{children}</ContentContainer>}
                        {(!viewContainerCard && !viewCourseCard) && <Box>{children}</Box>}
                    </Box>
                    <Box sx={{ mt: 8 }}>
                        {viewCourseCard && <CourseContainer>{children}</CourseContainer>}
                    </Box>
                </Main>
            </Box>
        </div>
    );
}
