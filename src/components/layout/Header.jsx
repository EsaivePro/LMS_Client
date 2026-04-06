import * as React from "react";
import { useNavigate } from "react-router-dom";
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
import { Alert } from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import ManageAccountsIcon from "@mui/icons-material/ManageAccounts";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloseIcon from "@mui/icons-material/Close";

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import THEME from "../../constants/theme";

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

function Header({ toggleSidebar, profile, logout }) {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
    const [username, setUsername] = React.useState("username");

    React.useEffect(() => {
        const name = user?.fullName || user?.name || user?.username || user?.email || "U";
        setUserInitial(String(name).charAt(0).toUpperCase());
        setRoleName(user?.role || user?.roleName || user?.roles?.[0]?.name || "Role");
        setUsername(user?.username || user?.email || "username");
    }, [user, isAuthenticated]);

    const menuItems = [
        { label: "Profile", action: profile },
        { label: "Sign out", action: logout },
    ];

    return (
        <AppBar position="fixed" color="default" elevation={1}>
            <Toolbar
                disableGutters
                sx={{
                    justifyContent: "space-between",
                    px: { xs: 1, sm: 2 },
                    minHeight: { xs: 64, sm: 64 },
                    width: "100%",
                }}
            >
                    {/* ── LEFT: hamburger + logo ── */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, md: 1 }, flexShrink: 0 }}>
                        {isAuthenticated && (
                            <IconButton size="medium" onClick={toggleSidebar}>
                                <MenuIcon />
                            </IconButton>
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
                                maxWidth: THEME?.manifest?.width || 150,
                                maxHeight: 40,
                                objectFit: "contain",
                                display: "block",
                            }}
                        />
                    </Box>

                    {/* ── RIGHT: actions + user ── */}
                    {isAuthenticated && (
                        <Box
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: { xs: 0.5, sm: 1, md: 2 },
                            }}
                        >
                            {/* Settings icon — desktop only */}
                            {!isMobile && (
                                <IconButton size="medium" onClick={handleOpenSettings} title="Settings">
                                    <ManageAccountsIcon fontSize="medium" />
                                </IconButton>
                            )}

                            {/* User avatar + info */}
                            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                <Avatar
                                    sx={{
                                        width: isMobile ? 31 : 36,
                                        height: isMobile ? 31 : 36,
                                        fontSize: isMobile ? 15 : 18,
                                        backgroundColor: "var(--primary)",
                                        fontWeight: 700,
                                    }}
                                >
                                    {userInitial}
                                </Avatar>

                                {!isMobile && (
                                    <Box sx={{ lineHeight: 1, ml: 0.5 }}>
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                fontWeight: 700,
                                                lineHeight: 1.3,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: 180,
                                                display: "block",
                                            }}
                                        >
                                            {username}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{
                                                lineHeight: 1,
                                                whiteSpace: "nowrap",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis",
                                                maxWidth: 180,
                                                display: "block",
                                            }}
                                        >
                                            {roleName}
                                        </Typography>
                                    </Box>
                                )}

                                <IconButton
                                    size="small"
                                    onClick={(e) => setAnchorElUser(e.currentTarget)}
                                >
                                    <ExpandMoreIcon fontSize="small" />
                                </IconButton>
                            </Box>

                            {/* ── User dropdown ── */}
                            <Menu
                                anchorEl={anchorElUser}
                                open={Boolean(anchorElUser)}
                                onClose={() => setAnchorElUser(null)}
                                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                                transformOrigin={{ vertical: "top", horizontal: "right" }}
                                sx={{ mt: 1 }}
                            >
                                {/* Mobile: show user info + settings inside menu */}
                                {isMobile && (
                                    <Box sx={{ px: 2, py: 1 }}>
                                        <Typography variant="body2" fontWeight={700}>
                                            {username}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {roleName}
                                        </Typography>
                                        <Divider sx={{ mt: 1 }} />
                                    </Box>
                                )}
                                {isMobile && (
                                    <MenuItem
                                        onClick={handleOpenSettings}
                                        sx={{ px: 2, py: 0.75, minHeight: 36 }}
                                    >
                                        Settings
                                    </MenuItem>
                                )}

                                {menuItems.map((item, i) => (
                                    <MenuItem
                                        key={i}
                                        onClick={() => {
                                            setAnchorElUser(null);
                                            item.action();
                                        }}
                                        sx={{
                                            px: 2,
                                            py: 0.75,
                                            minHeight: 36,
                                            minWidth: 150,
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
                            >
                                <DialogTitle>
                                    Settings
                                    <IconButton
                                        onClick={() => setSettingsOpen(false)}
                                        sx={{ position: "absolute", right: 8, top: 8 }}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                </DialogTitle>

                                <DialogContent>
                                    <Box
                                        sx={{
                                            display: "flex",
                                            gap: 2,
                                            flexDirection: { xs: "column", md: "row" },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                width: { xs: "100%", md: 220 },
                                                borderRight: { md: "1px solid" },
                                                borderBottom: { xs: "1px solid", md: "none" },
                                                borderColor: "divider",
                                            }}
                                        >
                                            <List
                                                sx={{
                                                    display: "flex",
                                                    flexDirection: { xs: "row", md: "column" },
                                                    p: 0,
                                                }}
                                            >
                                                {["account", "preferences"].map((key) => (
                                                    <ListItemButton
                                                        key={key}
                                                        selected={settingsMenu === key}
                                                        onClick={() => setSettingsMenu(key)}
                                                        sx={{ flex: 1 }}
                                                    >
                                                        <ListItemText
                                                            primary={
                                                                key.charAt(0).toUpperCase() + key.slice(1)
                                                            }
                                                        />
                                                    </ListItemButton>
                                                ))}
                                            </List>
                                        </Box>

                                        <Box sx={{ flex: 1 }}>
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
