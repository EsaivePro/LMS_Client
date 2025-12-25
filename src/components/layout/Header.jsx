import * as React from 'react';
import { useNavigate } from "react-router-dom";

import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Badge from '@mui/material/Badge';

import NotificationsIcon from '@mui/icons-material/Notifications';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';


const sideBarItems = [
    { label: "Dashboard", to: "/" },
    { label: "Courses", to: "/courses" },
    { label: "Topics", to: "/topics" },
    { label: "Users", to: "/users" },
];

function Header({ toggleSidebar, profile, logout, open }) {
    const navigate = useNavigate();

    // Search state
    const [search, setSearch] = React.useState("");
    const [results, setResults] = React.useState([]);
    const [searchFocused, setSearchFocused] = React.useState(false);

    // Notification menu state
    const [anchorNotif, setAnchorNotif] = React.useState(null);
    const [notifications, setNotifications] = React.useState([
        "New user registered",
        "Payment received",
        "New course added",
        "Exam results published",
        "New support ticket received"
    ]);
    const settings = [
        { label: "Profile", to: profile },
        { label: "Logout", to: logout }
    ];

    // User menu state
    const [anchorElUser, setAnchorElUser] = React.useState(null);

    // ➊ SEARCH LOGIC
    React.useEffect(() => {
        if (search.length >= 3) {
            const filter = sideBarItems.filter((item) =>
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

    // ➋ NOTIFICATION CLICK HANDLING
    const handleNotificationClick = (index) => {
        const updated = notifications.filter((_, i) => i !== index);
        setNotifications(updated);
    };

    return (
        <AppBar position="fixed" color="default" elevation={1}>
            <Container maxWidth="xl">
                <Toolbar disableGutters sx={{ justifyContent: "space-between" }}>

                    {/* LEFT SIDE: LOGO + TITLE */}
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

                    {/* RIGHT SIDE: equal spaced */}
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            minWidth: "380px",
                            justifyContent: "flex-end",
                        }}
                    >

                        {/* SEARCH BAR (expand on focus) */}
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

                            {/* SEARCH DROPDOWN */}
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

                        {/* NOTIFICATION ICON */}
                        {/* <IconButton onClick={(e) => setAnchorNotif(e.currentTarget)}>
                            <Badge badgeContent={notifications.length || 0} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton> */}

                        {/* NOTIFICATION DROPDOWN */}
                        <Menu
                            anchorEl={anchorNotif}
                            open={Boolean(anchorNotif)}
                            onClose={() => setAnchorNotif(null)}
                            PaperProps={{
                                elevation: 4,
                                sx: {
                                    width: 300,
                                    maxHeight: 300,
                                    overflowY: "auto",
                                    mt: 1.2,
                                    borderRadius: "10px",
                                }
                            }}
                        >
                            {notifications.length === 0 && (
                                <MenuItem disabled sx={{ justifyContent: "center", py: 2 }}>
                                    No new notifications
                                </MenuItem>
                            )}

                            {notifications.map((note, index) => (
                                <Box key={index}>
                                    <MenuItem
                                        onClick={() => handleNotificationClick(index)}
                                        sx={{ whiteSpace: "normal", py: 1.5 }}
                                    >
                                        {note}
                                    </MenuItem>

                                    {/* Divider */}
                                    {index !== notifications.length - 1 && (
                                        <Box
                                            sx={{
                                                height: "1px",
                                                bgcolor: "rgba(0,0,0,0.1)",
                                                mx: 2,
                                            }}
                                        />
                                    )}
                                </Box>
                            ))}
                        </Menu>

                        {/* SETTINGS ICON */}
                        <IconButton>
                            <ManageAccountsIcon />
                        </IconButton>

                        {/* AVATAR */}
                        <Tooltip title="User Menu">
                            <IconButton onClick={(e) => setAnchorElUser(e.currentTarget)}>
                                <Avatar sx={{ bgcolor: "var(--primaryColor)" }}>S</Avatar>
                            </IconButton>
                        </Tooltip>

                        {/* AVATAR MENU */}
                        <Menu
                            anchorEl={anchorElUser}
                            open={Boolean(anchorElUser)}
                            onClose={() => setAnchorElUser(null)}
                        >
                            {settings.map((setting, index) => (
                                <MenuItem key={index} onClick={setting.to}>{setting.label}</MenuItem>
                            ))}
                        </Menu>

                    </Box>
                </Toolbar>
            </Container>
        </AppBar>
    );
}

export default Header;
