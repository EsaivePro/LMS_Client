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
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import { Alert } from '@mui/material';
import DashboardCustomizer from '../dashboard/admin/DashboardCustomizer';

/* ========================================================= */
/* 🔧 FIX 1: Transition moved OUTSIDE component               */
/* ========================================================= */
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
    const { user } = useAuth();

    /* ---------------- SEARCH ---------------- */
    const [search, setSearch] = React.useState("");
    const [results, setResults] = React.useState([]);
    const [searchFocused, setSearchFocused] = React.useState(false);

    React.useEffect(() => {
        if (search.length >= 3) {
            const filter = sideBarItems.filter(item =>
                item.label.toLowerCase().includes(search.toLowerCase())
            );
            setResults(filter);
        } else {
            setResults([]);
        }
    }, [search]);

    const handleSearchBlur = () => {
        setTimeout(() => setSearchFocused(false), 150);
    };

    /* ---------------- USER MENU ---------------- */
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    /* ---------------- SETTINGS MODAL ---------------- */
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [settingsMenu, setSettingsMenu] = React.useState("dashboard");

    const [showWelcomeWidget, setShowWelcomeWidget] = React.useState(true);
    const [showQuickLinks, setShowQuickLinks] = React.useState(true);

    /* ========================================================= */
    /* 🔧 FIX 2: Open settings safely (close menu + reset tab)   */
    /* ========================================================= */
    const handleOpenSettings = () => {
        setAnchorElUser(null);
        setSettingsMenu("dashboard");
        setSettingsOpen(true);
    };

    /* ========================================================= */
    /* 🔧 FIX 3: Simple close handler (no blocking reasons)      */
    /* ========================================================= */
    const handleSettingsClose = () => {
        setSettingsOpen(false);
    };

    /* ---------------- USER DATA ---------------- */
    const userInitial = React.useMemo(() => {
        const name =
            user?.fullName ||
            user?.name ||
            user?.username ||
            user?.email ||
            "U";
        return String(name).charAt(0).toUpperCase();
    }, [user]);

    const roleName =
        user?.role ||
        user?.roleName ||
        user?.roles?.[0]?.name ||
        "Role";

    const username =
        user?.username || user?.email || "username";

    const settings = [
        { label: "Profile", to: profile },
        { label: "Logout", to: logout }
    ];

    return (
        <AppBar position="fixed" color="default" elevation={1}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>

                    {/* LEFT SIDE */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <IconButton onClick={() => toggleSidebar(!open)}>
                            <MenuIcon />
                        </IconButton>

                        <img
                            src="/logo/EsaiLogo.png"
                            alt="Esai"
                            width="45"
                            style={{ borderRadius: 8 }}
                        />

                        <Typography
                            variant="h6"
                            sx={{
                                fontWeight: 600,
                                color: "var(--primaryColor)",
                                display: { xs: "none", sm: "block" }
                            }}
                        >
                            LMS Platform
                        </Typography>
                    </Box>

                    {/* RIGHT SIDE */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            minWidth: "380px",
                            justifyContent: "flex-end",
                        }}
                    >

                        {/* SEARCH */}
                        <Box sx={{ position: "relative" }}>
                            <TextField
                                size="small"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onFocus={() => setSearchFocused(true)}
                                onBlur={handleSearchBlur}
                                sx={{
                                    width: searchFocused ? "300px" : "260px",
                                    transition: "width 0.25s ease",
                                    background: "#fff",
                                    borderRadius: "8px",
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
                                <Paper
                                    elevation={4}
                                    sx={{
                                        position: "absolute",
                                        top: "45px",
                                        width: "100%",
                                        zIndex: 2000,
                                    }}
                                >
                                    <List>
                                        {results.map((item, i) => (
                                            <ListItemButton
                                                key={i}
                                                onClick={() => {
                                                    navigate(item.to);
                                                    setSearch("");
                                                    setResults([]);
                                                    setSearchFocused(false);
                                                }}
                                            >
                                                <ListItemText primary={item.label} />
                                            </ListItemButton>
                                        ))}
                                    </List>
                                </Paper>
                            )}
                        </Box>

                        {/* SETTINGS ICON */}
                        <IconButton onClick={handleOpenSettings}>
                            <ManageAccountsIcon />
                        </IconButton>

                        {/* USER INFO (UNCHANGED UI) */}
                        <Box sx={{ display: "flex", alignItems: "center", borderRadius: 2 }}>
                            <Box sx={{ display: "flex", gap: 1 }}>
                                <Avatar
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        bgcolor: "var(--primaryColor)",
                                        fontWeight: 500,
                                    }}
                                >
                                    {userInitial}
                                </Avatar>

                                <Box>
                                    <Typography
                                        variant="body2"
                                        sx={{ fontWeight: 700, textTransform: "capitalize" }}
                                    >
                                        {username}
                                    </Typography>

                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            maxWidth: 140,
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                            display: "block",
                                        }}
                                    >
                                        {roleName}
                                    </Typography>
                                </Box>
                            </Box>

                            <IconButton
                                size="small"
                                onClick={(e) => setAnchorElUser(e.currentTarget)}
                                sx={{ ml: 0.5 }}
                            >
                                <ExpandMoreIcon />
                            </IconButton>
                        </Box>

                        {/* USER MENU */}
                        <Menu
                            anchorEl={anchorElUser}
                            open={Boolean(anchorElUser)}
                            onClose={() => setAnchorElUser(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        >
                            {settings.map((setting, index) => (
                                <MenuItem key={index} onClick={() => {
                                    setAnchorElUser(null); // ✅ CLOSE MENU
                                    setting.to();          // ✅ EXECUTE ACTION (navigate / logout)
                                }} >
                                    {setting.label}
                                </MenuItem>
                            ))}
                        </Menu>

                        {/* SETTINGS MODAL */}
                        <Dialog
                            fullWidth
                            maxWidth="md"
                            open={settingsOpen}
                            onClose={handleSettingsClose}
                            TransitionComponent={Transition}
                            keepMounted
                            PaperProps={{ sx: { borderRadius: 2 } }}
                        >
                            <DialogTitle sx={{ pr: 5 }}>
                                Settings
                                <IconButton
                                    onClick={handleSettingsClose}
                                    sx={{ position: 'absolute', right: 8, top: 8 }}
                                >
                                    <CloseIcon />
                                </IconButton>
                            </DialogTitle>

                            <DialogContent>
                                <Box sx={{ display: 'flex', gap: 2, minHeight: 240 }}>

                                    <Box sx={{ width: 260, borderRight: '1px solid', borderColor: 'divider', pr: 1 }}>
                                        <List>
                                            <ListItemButton
                                                selected={settingsMenu === 'dashboard'}
                                                onClick={() => setSettingsMenu('dashboard')}
                                            >
                                                <ListItemText primary="Dashboard Customizer" />
                                            </ListItemButton>
                                            <Divider />
                                            <ListItemButton
                                                selected={settingsMenu === 'account'}
                                                onClick={() => setSettingsMenu('account')}
                                            >
                                                <ListItemText primary="Account" />
                                            </ListItemButton>
                                            <ListItemButton
                                                selected={settingsMenu === 'preferences'}
                                                onClick={() => setSettingsMenu('preferences')}
                                            >
                                                <ListItemText primary="Preferences" />
                                            </ListItemButton>
                                        </List>
                                    </Box>

                                    <Box sx={{ flex: 1, p: 1 }}>
                                        {settingsMenu === 'dashboard' && (
                                            <>
                                                <DashboardCustomizer role="student" />
                                            </>
                                        )}

                                        {settingsMenu === 'account' && (
                                            <Alert severity="warning">Currently you don't have settings like that.</Alert>
                                        )}

                                        {settingsMenu === 'preferences' && (
                                            <Alert severity="warning">Currently you don't have display preferences.</Alert>
                                        )}
                                    </Box>

                                </Box>
                            </DialogContent>
                        </Dialog>

                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;
