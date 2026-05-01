import * as React from "react";
import { useAuth } from "../../hooks/useAuth";

import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Slide from "@mui/material/Slide";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import InputBase from "@mui/material/InputBase";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import { Alert } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import THEME from "../../constants/theme";

const { colors, shadows, radius } = THEME;

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function Header({
    toggleSidebar,
    profile,
    logout,
    notificationCount = 0,
    messageCount = 0,
}) {
    const { user, isAuthenticated } = useAuth();
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(muiTheme.breakpoints.down("md"));

    /* ── User menu ── */
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    /* ── Settings modal ── */
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [settingsMenu, setSettingsMenu] = React.useState("account");

    const handleOpenSettings = () => {
        setAnchorElUser(null);
        setSettingsMenu("account");
        setSettingsOpen(true);
    };

    /* ── Derived user info ── */
    const [userInitial, setUserInitial] = React.useState("U");
    const [roleName, setRoleName] = React.useState("Role");
    const [displayName, setDisplayName] = React.useState("User");

    React.useEffect(() => {
        const raw = user?.fullName || user?.fullname || user?.name || user?.username || user?.email || "User";
        const firstName = raw.split(" ")[0].split("@")[0];
        setDisplayName(firstName.charAt(0).toUpperCase() + firstName.slice(1));
        setUserInitial(String(raw).charAt(0).toUpperCase());
        setRoleName(user?.role || user?.roleName || user?.roles?.[0]?.name || "Student");
    }, [user, isAuthenticated]);

    const menuItems = [
        { label: "Profile", action: profile },
        { label: "Sign out", action: logout },
    ];

    return (
        <AppBar
            position="fixed"
            color="default"
            elevation={0}
            sx={{
                bgcolor: colors.surface,
                borderBottom: `1px solid ${colors.border}`,
            }}
        >
            <Toolbar
                disableGutters
                sx={{
                    justifyContent: "space-between",
                    px: { xs: 1.5, sm: 2, md: 3 },
                    minHeight: { xs: 60, sm: 64 },
                    gap: 1,
                }}
            >
                {/* ══ LEFT: hamburger + logo ══ */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        flexShrink: 0,
                    }}
                >
                    {isAuthenticated && (
                        <Tooltip title="Toggle sidebar">
                            <IconButton
                                size="medium"
                                onClick={toggleSidebar}
                                sx={{
                                    color: colors.textSecondary,
                                    "&:hover": { bgcolor: colors.surface2 },
                                }}
                            >
                                <MenuIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    )}
                    <img
                        src={
                            THEME?.manifest?.icons?.[0]?.src
                                ? `/${THEME.manifest.icons[0].src}`
                                : "/logo/EsaiLogo.png"
                        }
                        alt={THEME?.manifest?.name || "LMS"}
                        style={{
                            width: "auto",
                            maxWidth: 80,
                            maxHeight: 36,
                            objectFit: "contain",
                            display: "block",
                        }}
                    />
                </Box>

                {/* ══ CENTER: search bar ══ */}
                {isAuthenticated && !isMobile && (
                    <Box
                        sx={{
                            flex: 1,
                            mx: { sm: 2, md: 4 },
                            maxWidth: 480,
                        }}
                    >
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 1,
                                bgcolor: colors.surface2,
                                border: `1px solid ${colors.border}`,
                                borderRadius: "10px",
                                px: 1.5,
                                py: 0.6,
                                transition: "border-color 0.2s, background 0.2s",
                                "&:focus-within": {
                                    borderColor: colors.primary,
                                    bgcolor: colors.surface,
                                    boxShadow: `0 0 0 3px ${colors.primaryLight}`,
                                },
                            }}
                        >
                            <SearchIcon
                                sx={{ fontSize: 17, color: colors.textMuted, flexShrink: 0 }}
                            />
                            <InputBase
                                placeholder="Search for courses, assignments..."
                                inputProps={{ "aria-label": "search" }}
                                sx={{
                                    flex: 1,
                                    fontSize: "0.875rem",
                                    color: colors.textPrimary,
                                    "& input::placeholder": {
                                        color: colors.textMuted,
                                        opacity: 1,
                                    },
                                }}
                            />
                            {/* Keyboard shortcut hint */}
                            <Box
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.4,
                                    px: 0.75,
                                    py: 0.25,
                                    bgcolor: colors.surface,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: "6px",
                                    flexShrink: 0,
                                }}
                            >
                                <Typography
                                    sx={{
                                        fontSize: "0.68rem",
                                        fontWeight: 600,
                                        color: colors.textMuted,
                                        lineHeight: 1,
                                        letterSpacing: "0.02em",
                                    }}
                                >
                                    ⌘K
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                )}

                {/* ══ RIGHT: icons + user ══ */}
                {isAuthenticated && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 0.25, sm: 0.75 },
                            flexShrink: 0,
                        }}
                    >
                        {/* Notifications */}
                        <Tooltip title="Notifications">
                            <IconButton
                                size="medium"
                                sx={{
                                    color: colors.textSecondary,
                                    "&:hover": { bgcolor: colors.surface2 },
                                }}
                            >
                                <Badge
                                    badgeContent={notificationCount}
                                    color="primary"
                                    max={99}
                                    sx={{
                                        "& .MuiBadge-badge": {
                                            fontSize: "0.6rem",
                                            minWidth: 16,
                                            height: 16,
                                            padding: "0 4px",
                                        },
                                    }}
                                >
                                    <NotificationsOutlinedIcon fontSize="small" />
                                </Badge>
                            </IconButton>
                        </Tooltip>

                        {/* Messages — tablet+ */}
                        {!isTablet && (
                            <Tooltip title="Messages">
                                <IconButton
                                    size="medium"
                                    sx={{
                                        color: colors.textSecondary,
                                        "&:hover": { bgcolor: colors.surface2 },
                                    }}
                                >
                                    <Badge
                                        badgeContent={messageCount}
                                        color="primary"
                                        max={99}
                                        sx={{
                                            "& .MuiBadge-badge": {
                                                fontSize: "0.6rem",
                                                minWidth: 16,
                                                height: 16,
                                                padding: "0 4px",
                                            },
                                        }}
                                    >
                                        <ChatBubbleOutlineIcon fontSize="small" />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                        )}


                        {/* ── User section ── */}
                        <Box
                            onClick={(e) => setAnchorElUser(e.currentTarget)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 0.75,
                                cursor: "pointer",
                                borderRadius: "10px",
                                px: 1,
                                py: 0.5,
                                transition: "background 0.15s",
                                "&:hover": { bgcolor: colors.surface2 },
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: isMobile ? 30 : 34,
                                    height: isMobile ? 30 : 34,
                                    fontSize: isMobile ? 13 : 15,
                                    fontWeight: 700,
                                    bgcolor: colors.primary,
                                    color: "#fff",
                                    flexShrink: 0,
                                }}
                            >
                                {userInitial}
                            </Avatar>

                            {!isMobile && (
                                <Box sx={{ lineHeight: 1 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.82rem",
                                            fontWeight: 700,
                                            color: colors.textPrimary,
                                            lineHeight: 1.35,
                                            whiteSpace: "nowrap",
                                            maxWidth: 130,
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        Hi, {displayName}
                                    </Typography>
                                    <Typography
                                        sx={{
                                            fontSize: "0.72rem",
                                            color: colors.textSecondary,
                                            lineHeight: 1,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {roleName}
                                    </Typography>
                                </Box>
                            )}

                            <ExpandMoreIcon
                                sx={{
                                    fontSize: 17,
                                    color: colors.textMuted,
                                    flexShrink: 0,
                                }}
                            />
                        </Box>

                        {/* ── User dropdown menu ── */}
                        <Menu
                            anchorEl={anchorElUser}
                            open={Boolean(anchorElUser)}
                            onClose={() => setAnchorElUser(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            PaperProps={{
                                elevation: 0,
                                sx: {
                                    mt: 1,
                                    minWidth: 180,
                                    border: `1px solid ${colors.border}`,
                                    borderRadius: radius.md,
                                    boxShadow: shadows.md,
                                    overflow: "visible",
                                },
                            }}
                        >
                            {/* Mobile: user info header inside menu */}
                            {isMobile && (
                                <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
                                    <Typography
                                        sx={{
                                            fontSize: "0.85rem",
                                            fontWeight: 700,
                                            color: colors.textPrimary,
                                        }}
                                    >
                                        Hi, {displayName}
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: colors.textSecondary }}
                                    >
                                        {roleName}
                                    </Typography>
                                    <Divider sx={{ mt: 1 }} />
                                </Box>
                            )}

                            {/* Mobile: Settings item */}
                            {isMobile && (
                                <MenuItem
                                    onClick={handleOpenSettings}
                                    sx={{ px: 2, py: 0.9, fontSize: "0.875rem" }}
                                >
                                    Settings
                                </MenuItem>
                            )}

                            {/* Desktop: settings icon shortcut */}
                            {!isMobile && (
                                <MenuItem
                                    onClick={handleOpenSettings}
                                    sx={{
                                        px: 2,
                                        py: 0.9,
                                        fontSize: "0.875rem",
                                        color: colors.textPrimary,
                                        gap: 1.5,
                                        "&:hover": { bgcolor: colors.surface2 },
                                    }}
                                >
                                    <ManageAccountsIcon
                                        fontSize="small"
                                        sx={{ color: colors.textSecondary }}
                                    />
                                    Settings
                                </MenuItem>
                            )}

                            <Divider sx={{ my: 0.5 }} />

                            {menuItems.map((item, i) => (
                                <MenuItem
                                    key={i}
                                    onClick={() => {
                                        setAnchorElUser(null);
                                        item.action?.();
                                    }}
                                    sx={{
                                        px: 2,
                                        py: 0.9,
                                        fontSize: "0.875rem",
                                        color:
                                            item.label === "Sign out"
                                                ? colors.danger
                                                : colors.textPrimary,
                                        "&:hover": {
                                            bgcolor:
                                                item.label === "Sign out"
                                                    ? "#FEF2F2"
                                                    : colors.surface2,
                                        },
                                    }}
                                >
                                    {item.label}
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* ── Settings dialog ── */}
                        <Dialog
                            fullWidth
                            maxWidth="md"
                            open={settingsOpen}
                            onClose={() => setSettingsOpen(false)}
                            TransitionComponent={Transition}
                            PaperProps={{
                                sx: { borderRadius: radius.lg, boxShadow: shadows.lg },
                            }}
                        >
                            <DialogTitle
                                sx={{
                                    fontWeight: 700,
                                    fontSize: "1rem",
                                    color: colors.textPrimary,
                                    borderBottom: `1px solid ${colors.border}`,
                                    py: 2,
                                }}
                            >
                                Settings
                                <IconButton
                                    onClick={() => setSettingsOpen(false)}
                                    sx={{
                                        position: "absolute",
                                        right: 12,
                                        top: 10,
                                        color: colors.textSecondary,
                                    }}
                                >
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent sx={{ p: 0 }}>
                                <Box
                                    sx={{
                                        display: "flex",
                                        gap: 0,
                                        flexDirection: { xs: "column", md: "row" },
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: { xs: "100%", md: 200 },
                                            borderRight: { md: `1px solid ${colors.border}` },
                                            borderBottom: { xs: `1px solid ${colors.border}`, md: "none" },
                                            py: 1,
                                        }}
                                    >
                                        <List sx={{ p: 0 }}>
                                            {["account", "preferences"].map((key) => (
                                                <ListItemButton
                                                    key={key}
                                                    selected={settingsMenu === key}
                                                    onClick={() => setSettingsMenu(key)}
                                                    sx={{
                                                        mx: 1,
                                                        borderRadius: "8px",
                                                        "&.Mui-selected": {
                                                            bgcolor: colors.primaryLight,
                                                            color: colors.primary,
                                                            "&:hover": { bgcolor: colors.primaryLight },
                                                        },
                                                    }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            key.charAt(0).toUpperCase() + key.slice(1)
                                                        }
                                                        primaryTypographyProps={{
                                                            fontSize: "0.875rem",
                                                            fontWeight: 500,
                                                        }}
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box sx={{ flex: 1, p: 3 }}>
                                        <Alert severity="warning">
                                            Currently no settings available.
                                        </Alert>
                                    </Box>
                                </Box>
                            </DialogContent>
                        </Dialog>
                    </Box>
                )}
            </Toolbar>
        </AppBar>
    );
}

export default Header;
