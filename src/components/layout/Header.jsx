import * as React from 'react';
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CloseIcon from '@mui/icons-material/Close';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import Slide from '@mui/material/Slide';
import Divider from '@mui/material/Divider';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Alert } from '@mui/material';

import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import THEME from "../../constants/theme";

import DashboardCustomizer from '../dashboard/admin/DashboardCustomizer';

/* ---------------- TRANSITION ---------------- */
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="up" ref={ref} {...props} />;
});

const sideBarItems = [
    { label: "Dashboard", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: "Topics", to: "/topics" },
    { label: "Users", to: "/users" },
];

function Header({ toggleSidebar, profile, logout, open }) {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    /* ---------------- SEARCH ---------------- */
    const [search, setSearch] = React.useState("");
    const [results, setResults] = React.useState([]);
    const [searchFocused, setSearchFocused] = React.useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = React.useState(false);

    React.useEffect(() => {
        if (search.length >= 3) {
            setResults(
                sideBarItems.filter(item =>
                    item.label.toLowerCase().includes(search.toLowerCase())
                )
            );
        } else {
            setResults([]);
        }
    }, [search]);

    const closeSearch = () => {
        setSearch("");
        setResults([]);
        setSearchFocused(false);
        setMobileSearchOpen(false);
    };

    /* ---------------- USER MENU ---------------- */
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    /* ---------------- SETTINGS MODAL ---------------- */
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [settingsMenu, setSettingsMenu] = React.useState("dashboard");

    const handleOpenSettings = () => {
        setAnchorElUser(null);
        setSettingsMenu("dashboard");
        setSettingsOpen(true);
    };

    /* ---------------- USER INFO ---------------- */
    const [userInitial, setUserInitial] = React.useState("U");
    const [roleName, setRoleName] = React.useState("Role");
    const [username, setUsername] = React.useState("username");

    React.useEffect(() => {
        const name =
            user?.fullName || user?.name || user?.username || user?.email || "U";
        setUserInitial(String(name).charAt(0).toUpperCase());
        setRoleName(user?.role || user?.roleName || user?.roles?.[0]?.name || "Role");
        setUsername(user?.username || user?.email || "username");
    }, [user, isAuthenticated]);

    const settings = [
        { label: "Profile", to: profile },
        { label: "Logout", to: logout },
    ];

    return (
        <AppBar
            position="fixed"
            color="default"
            elevation={1}
            sx={{
                px: { xs: 0.5, sm: 1, md: 0 }, // 🔥 MOBILE PX REDUCED
            }}
        >
            <Container
                maxWidth="xl"
                sx={{
                    px: { xs: 0, sm: 1, md: 2 }, // 🔥 MOBILE PX REDUCED
                }}
            >
                <Toolbar
                    disableGutters
                    sx={{
                        justifyContent: "space-between",
                        px: { xs: 0.5, sm: 1, md: 0 }, // 🔥 MOBILE PX REDUCED
                        minHeight: { xs: 80, sm: 64 },
                    }}
                >

                    {/* ---------------- LEFT ---------------- */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0, md: 1 } }}>
                        <IconButton size="medium" onClick={() => toggleSidebar(!open)}>
                            <MenuIcon />
                        </IconButton>


                        <img src={THEME?.manifest?.icons?.[0]?.src ? `/${THEME.manifest.icons[0].src}` : '/logo/EsaiLogo.png'} alt={THEME?.manifest?.name || 'Esai'} width="150" />

                        {/* <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                fontSize: { xs: 18, sm: 18, md: 20 },
                                color: "var(--primary)",

                            whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",

                        maxWidth: {xs: 160, sm: 220, md: "none" },

                        display: "block",
                            }}
                        >
                        {THEME?.manifest?.name || 'LMS Platform'}
                    </Typography> */}

                    </Box>

                    {/* ---------------- RIGHT ---------------- */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: { xs: 0.75, sm: 1.5, md: 3 }, // 🔥 GAP REDUCED
                        }}
                    >

                        {/* ---------- DESKTOP SEARCH ---------- */}
                        {!isMobile && (
                            <Box sx={{ position: "relative" }}>
                                <TextField
                                    size="small"
                                    placeholder="Search..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => setSearchFocused(true)}
                                    sx={{
                                        width: searchFocused ? 300 : 260,
                                        transition: "width 0.25s ease",
                                        background: "var(--surface)",
                                        borderRadius: 2,
                                    }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon fontSize="small" />
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                {results.length > 0 && (
                                    <Paper sx={{ position: "absolute", top: 45, width: "100%", zIndex: 2000 }}>
                                        <List>
                                            {results.map((item, i) => (
                                                <ListItemButton
                                                    key={i}
                                                    onClick={() => {
                                                        navigate(item.to);
                                                        closeSearch();
                                                    }}
                                                >
                                                    <ListItemText primary={item.label} />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Paper>
                                )}
                            </Box>
                        )}

                        {/* ---------- MOBILE SEARCH ---------- */}
                        {/* {isMobile && (
                            <IconButton size="medium" onClick={() => setMobileSearchOpen(true)}>
                                <SearchIcon fontSize="medium" />
                            </IconButton>
                        )} */}

                        {!isMobile && (<IconButton size="medium" onClick={handleOpenSettings}>
                            <ManageAccountsIcon fontSize="medium" />
                        </IconButton>)}

                        {/* ---------- USER BLOCK ---------- */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                            <Avatar sx={{ width: isMobile ? 31 : 36, height: isMobile ? 31 : 36, fontSize: isMobile ? 16 : 20, backgroundColor: "var(--primary)" }}>
                                {userInitial}
                            </Avatar>

                            <Box sx={{ lineHeight: 1, ml: isMobile ? 0.2 : .5, textAlign: { xs: "left", sm: "right" } }}>
                                <Typography
                                    variant={isMobile ? "body3" : "body2"}
                                    sx={{
                                        fontWeight: 700,
                                        lineHeight: 1.3,

                                        /* no wrap + ellipsis */
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",

                                        /* limit width so ellipsis can happen */
                                        maxWidth: { xs: 160, sm: 220, md: "none" },

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

                                        /* no wrap + ellipsis */
                                        whiteSpace: "nowrap",
                                        overflow: "hidden",
                                        textOverflow: "ellipsis",

                                        /* limit width so ellipsis can happen */
                                        maxWidth: { xs: 160, sm: 220, md: "none" },

                                        display: "block",
                                    }}
                                >
                                    {roleName}
                                </Typography>
                            </Box>

                            <IconButton
                                size="small"
                                onClick={(e) => setAnchorElUser(e.currentTarget)}
                            >
                                <ExpandMoreIcon fontSize="small" />
                            </IconButton>
                        </Box>

                        {/* ---------- PROFILE / LOGOUT MENU ---------- */}
                        <Menu
                            anchorEl={anchorElUser}
                            open={Boolean(anchorElUser)}
                            onClose={() => setAnchorElUser(null)}
                            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                            transformOrigin={{ vertical: "top", horizontal: "right" }}
                            sx={{ mt: isMobile ? 2.7 : 2 }}
                        >
                            {settings.map((s, i) => (
                                <MenuItem
                                    key={i}
                                    sx={{
                                        justifyContent: "left",
                                        px: { xs: 1, sm: 1.5 },
                                        py: 0.5,
                                        minHeight: isMobile ? 10 : 36,
                                        minWidth: 150,
                                    }}
                                    onClick={() => {
                                        setAnchorElUser(null);
                                        s.to();
                                    }}
                                >
                                    {s.label}
                                </MenuItem>
                            ))}
                            {isMobile && (
                                <MenuItem
                                    sx={{ px: { xs: 1, sm: 1.5 }, py: 0.5, minHeight: 36 }}
                                    onClick={handleOpenSettings}
                                >
                                    Settings
                                </MenuItem>
                            )}
                        </Menu>

                        {/* ---------- SETTINGS MODAL ---------- */}
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
                                            width: { xs: "100%", md: 260 },
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
                                            {["dashboard", "account", "preferences"].map((key) => (
                                                <ListItemButton
                                                    key={key}
                                                    selected={settingsMenu === key}
                                                    onClick={() => setSettingsMenu(key)}
                                                    sx={{ flex: 1, textAlign: { xs: "left", md: "center" } }}
                                                >
                                                    <ListItemText
                                                        primary={
                                                            key === "dashboard"
                                                                ? "Dashboard Customizer"
                                                                : key.charAt(0).toUpperCase() + key.slice(1)
                                                        }
                                                    />
                                                </ListItemButton>
                                            ))}
                                        </List>
                                    </Box>

                                    <Box sx={{ flex: 1 }}>
                                        {settingsMenu === "dashboard" && (
                                            <DashboardCustomizer role="student" />
                                        )}
                                        {settingsMenu !== "dashboard" && (
                                            <Alert severity="warning">
                                                Currently no settings available.
                                            </Alert>
                                        )}
                                    </Box>
                                </Box>
                            </DialogContent>
                        </Dialog>
                    </Box>
                </Toolbar>
            </Container>

            {/* ---------- MOBILE SEARCH OVERLAY ---------- */}
            {
                isMobile && mobileSearchOpen && (
                    <Box
                        sx={{
                            position: "fixed",
                            inset: 0,
                            bgcolor: "var(--surface)",
                            zIndex: 1300,
                            p: 2,
                        }}
                    >
                        <TextField
                            autoFocus
                            fullWidth
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton onClick={closeSearch}>
                                            <CloseIcon />
                                        </IconButton>
                                    </InputAdornment>
                                ),
                            }}
                        />

                        <List>
                            {results.map((item, i) => (
                                <ListItemButton
                                    key={i}
                                    onClick={() => {
                                        navigate(item.to);
                                        closeSearch();
                                    }}
                                >
                                    <ListItemText primary={item.label} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Box>
                )
            }
        </AppBar >
    );
}

export default Header;
