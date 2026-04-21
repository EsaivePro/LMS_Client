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
import ConfirmationPopup from "../common/dialog/ConfirmationPopup";

// Icons
import LogoutIcon from "@mui/icons-material/Logout";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Person2Icon from "@mui/icons-material/Person2";

import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useCommon from "../../hooks/useCommon";
import { useAdmin } from "../../hooks/useAdmin";
import { httpClient } from "../../apiClient/httpClient";
import { tokenStorage } from "../../utils/tokenStorage.utils";
import { getMenuFromRoutes } from "../../routes/routeConfig";

const drawerWidth = 240;

const AppBar = styled(MuiAppBar)(({ theme }) => ({
    zIndex: theme.zIndex.drawer + 5,
}));

const Main = styled("main")(({ theme }) => ({
    flexGrow: 1,
    padding: theme.spacing(3),
}));

export default function SideBarWithHeader({ children, fixed = true, footer = null }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const location = useLocation();
    const isCourseViewPage = location.pathname.startsWith("/course/view/");

    const [open, setOpen] = React.useState(() => fixed && !isMobile && !isCourseViewPage);
    const [expandedGroup, setExpandedGroup] = React.useState(null);
    const [search, setSearch] = React.useState("");
    const [collapsedSections, setCollapsedSections] = React.useState(new Set());
    const [logoutConfirmOpen, setLogoutConfirmOpen] = React.useState(false);

    const sidebarRef = React.useRef(null);
    const { user, isAuthenticated, logout } = useAuth();
    const { viewContainerCard, viewCourseCard, viewHeader, showLoader, hideLoader } = useCommon();
    const { permissions } = useAdmin();
    const navigate = useNavigate();

    // Get menu from route config
    const MENU = React.useMemo(() => getMenuFromRoutes(), []);

    // ── Logout ─────────────────────────────────────────────────
    const handleLogout = async () => {
        setLogoutConfirmOpen(false);
        showLoader("Signing out...");
        try {
            await httpClient.logoutUser();
        } catch (err) {
            console.error("Server logout failed:", err);
        } finally {
            try {
                await logout();
                tokenStorage.clearAll();
                navigate("/login", { replace: true });
            } finally {
                hideLoader();
            }
        }
    };

    const requestLogout = (e) => {
        if (e?.preventDefault) e.preventDefault();
        setLogoutConfirmOpen(true);
    };

    // ── Auto-expand group for active child ──────────────────────
    React.useEffect(() => {
        MENU.forEach((item) => {
            if (
                item.type === "group" &&
                item.children?.some((c) =>
                    c.matchPath
                        ? location.pathname.startsWith(c.matchPath)
                        : c.to === location.pathname
                )
            ) {
                setExpandedGroup(item.label);
            }
        });
    }, [location.pathname]);

    // Keep sidebar default closed when entering course view page.
    React.useEffect(() => {
        if (isCourseViewPage) {
            setOpen(false);
        }
    }, [isCourseViewPage]);

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

    const toggleSection = (sectionLabel) => {
        setCollapsedSections((prev) => {
            const next = new Set(prev);
            if (next.has(sectionLabel)) next.delete(sectionLabel);
            else next.add(sectionLabel);
            return next;
        });
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
                            logout={requestLogout}
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
                            zIndex: (theme) => theme.zIndex.drawer - 1,
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
                        zIndex: (theme) => theme.zIndex.drawer,
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
                            {(() => {
                                let currentSection = null;
                                return visibleMenu.map((item, index) => {
                                    // Section header
                                    if (item.type === "section") {
                                        currentSection = item.label;
                                        const isSectionOpen = !collapsedSections.has(item.label);
                                        return (
                                            <Box
                                                key={`sec-${index}`}
                                                onClick={() => toggleSection(item.label)}
                                                sx={{
                                                    mt: index === 0 ? 0.5 : 2,
                                                    mb: 0.5,
                                                    display: "flex",
                                                    alignItems: "center",
                                                    justifyContent: "space-between",
                                                    px: 1.5,
                                                    cursor: "pointer",
                                                    borderRadius: 1,
                                                    "&:hover": { background: "rgba(255,255,255,0.04)" },
                                                }}
                                            >
                                                <Typography
                                                    sx={{
                                                        fontSize: 11,
                                                        fontWeight: 700,
                                                        letterSpacing: 1.8,
                                                        color: "rgba(255,255,255,0.28)",
                                                        textTransform: "uppercase",
                                                    }}
                                                >
                                                    {item.label}
                                                </Typography>
                                                {isSectionOpen ? (
                                                    <ExpandLess sx={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }} />
                                                ) : (
                                                    <ExpandMore sx={{ fontSize: 14, color: "rgba(255,255,255,0.25)" }} />
                                                )}
                                            </Box>
                                        );
                                    }

                                    // Hide items if their section is collapsed
                                    if (currentSection && collapsedSections.has(currentSection)) return null;

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
                                                                ? "rgba(143,0,255,0.14)"
                                                                : expanded
                                                                    ? "rgba(255,255,255,0.05)"
                                                                    : "transparent",
                                                            borderLeft: isGroupActive || expanded
                                                                ? "3px solid rgba(143,0,255,0.65)"
                                                                : "3px solid transparent",
                                                            "&:hover": {
                                                                background: isGroupActive
                                                                    ? "rgba(143,0,255,0.18)"
                                                                    : "rgba(255,255,255,0.07)",
                                                            },
                                                            transition: "all 0.2s ease",
                                                        }}
                                                    >
                                                        <ListItemIcon
                                                            sx={{
                                                                color: isGroupActive || expanded
                                                                    ? "#b87bff"
                                                                    : "rgba(255,255,255,0.5)",
                                                                minWidth: 34,
                                                                "& .MuiSvgIcon-root": { fontSize: 20 },
                                                                transition: "color 0.2s ease",
                                                            }}
                                                        >
                                                            {item.icon}
                                                        </ListItemIcon>
                                                        <ListItemText
                                                            primary={item.label}
                                                            primaryTypographyProps={{
                                                                fontSize: 14,
                                                                fontWeight: isGroupActive || expanded ? 600 : 500,
                                                                color: isGroupActive || expanded
                                                                    ? "#b87bff"
                                                                    : "rgba(255,255,255,0.78)",
                                                                letterSpacing: 0.3,
                                                            }}
                                                        />
                                                        <Box
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                justifyContent: "center",
                                                                width: 20,
                                                                height: 20,
                                                                borderRadius: "50%",
                                                                background: expanded
                                                                    ? "rgba(143,0,255,0.2)"
                                                                    : "rgba(255,255,255,0.06)",
                                                                flexShrink: 0,
                                                                transition: "all 0.2s ease",
                                                            }}
                                                        >
                                                            {expanded ? (
                                                                <ExpandLess sx={{ fontSize: 14, color: isGroupActive || expanded ? "#b87bff" : "rgba(255,255,255,0.4)" }} />
                                                            ) : (
                                                                <ExpandMore sx={{ fontSize: 14, color: "rgba(255,255,255,0.4)" }} />
                                                            )}
                                                        </Box>
                                                    </ListItemButton>
                                                </ListItem>

                                                <Collapse in={expanded} timeout="auto" unmountOnExit>
                                                    <Box
                                                        sx={{
                                                            ml: 2.5,
                                                            pl: 1,
                                                            borderLeft: "1.5px solid rgba(143,0,255,0.3)",
                                                            mt: 0.25,
                                                            mb: 0.5,
                                                        }}
                                                    >
                                                        <List disablePadding>
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
                                                                        <ListItem disablePadding sx={{ mb: 0.2 }}>
                                                                            <ListItemButton
                                                                                sx={{
                                                                                    borderRadius: 1.5,
                                                                                    py: 0.55,
                                                                                    px: 1.2,
                                                                                    background: isChildActive
                                                                                        ? "linear-gradient(90deg, rgba(143,0,255,0.85) 0%, rgba(109,0,196,0.85) 100%)"
                                                                                        : "transparent",
                                                                                    boxShadow: isChildActive
                                                                                        ? "0 1px 6px rgba(143,0,255,0.28)"
                                                                                        : "none",
                                                                                    "&:hover": {
                                                                                        background: isChildActive
                                                                                            ? "linear-gradient(90deg, rgba(143,0,255,0.9) 0%, rgba(109,0,196,0.9) 100%)"
                                                                                            : "rgba(255,255,255,0.07)",
                                                                                    },
                                                                                    transition: "all 0.15s ease",
                                                                                }}
                                                                            >
                                                                                <ListItemIcon
                                                                                    sx={{
                                                                                        color: isChildActive
                                                                                            ? "#fff"
                                                                                            : "rgba(255,255,255,0.45)",
                                                                                        minWidth: 28,
                                                                                        "& .MuiSvgIcon-root": { fontSize: 17 },
                                                                                    }}
                                                                                >
                                                                                    {child.icon}
                                                                                </ListItemIcon>
                                                                                <ListItemText
                                                                                    primary={child.label}
                                                                                    primaryTypographyProps={{
                                                                                        fontSize: 13.5,
                                                                                        fontWeight: isChildActive ? 600 : 400,
                                                                                        color: isChildActive
                                                                                            ? "#fff"
                                                                                            : "rgba(255,255,255,0.72)",
                                                                                    }}
                                                                                />
                                                                                {isChildActive && (
                                                                                    <Box
                                                                                        sx={{
                                                                                            width: 5,
                                                                                            height: 5,
                                                                                            borderRadius: "50%",
                                                                                            background: "rgba(255,255,255,0.85)",
                                                                                            flexShrink: 0,
                                                                                        }}
                                                                                    />
                                                                                )}
                                                                            </ListItemButton>
                                                                        </ListItem>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </List>
                                                    </Box>
                                                </Collapse>
                                            </React.Fragment>
                                        );
                                    }

                                    return null;
                                });
                            })()}

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
                                onClick={requestLogout}
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

                <ConfirmationPopup
                    open={logoutConfirmOpen}
                    onClose={() => setLogoutConfirmOpen(false)}
                    title="Confirm Logout"
                    onConfirm={handleLogout}
                    confirmLabel="Logout"
                    cancelLabel="Cancel"
                    confirmColor="error"
                    message="You are about to sign out of your current session. Do you want to continue?"
                />

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
