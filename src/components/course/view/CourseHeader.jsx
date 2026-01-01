import React from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Stack,
    IconButton,
    CircularProgress,
    useMediaQuery,
    Box,
} from "@mui/material";

import MenuIcon from "@mui/icons-material/Menu";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";

const CourseHeader = ({
    courseDetail,
    isFav,
    toggleFavorite,
    percent,
    completed,
    total,
    showMenuButton = false,
    onMenuClick = () => { },
    drawerWidth,
    courseProgress
}) => {

    const isMobile = useMediaQuery("(max-width: 900px)");

    return (
        <AppBar
            position="static"          // <<< FIX: STATIC HEADER (NOT FIXED)
            sx={{
                width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
                backgroundColor: "var(--textPrimary)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                zIndex: 1300,
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    minHeight: 64,
                    px: 3,
                }}
            >
                {/* LEFT SIDE */}
                <Stack direction="row" spacing={1.5} alignItems="center">
                    {showMenuButton && (
                        <IconButton onClick={onMenuClick} sx={{ color: "var(--onPrimary)" }}>
                            <MenuIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    )}

                    <Typography
                        sx={{
                            fontSize: "20px",
                            fontWeight: 600,
                            color: "var(--onPrimary)",
                            maxWidth: isMobile ? "260px" : "520px",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                        }}
                    >
                        {courseDetail?.title || "New Course"}
                    </Typography>
                </Stack>

                {/* RIGHT SIDE */}
                <Stack direction="row" spacing={2} alignItems="center">
                    <IconButton
                        onClick={toggleFavorite}
                        sx={{
                            color: isFav ? "var(--primary)" : "var(--onPrimary)",
                        }}
                    >
                        {isFav ? (
                            <FavoriteIcon sx={{ fontSize: 28 }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: 28 }} />
                        )}
                    </IconButton>

                    {/* Progress */}
                    <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ position: "relative", display: "inline-flex" }}>
                            <CircularProgress
                                variant="determinate"
                                value={courseProgress?.progress_percent || 0}
                                size={42}
                                thickness={3}
                                sx={{ color: "var(--primary)" }}
                            />
                            <Box
                                sx={{
                                    position: "absolute",
                                    inset: 0,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                }}
                            >
                                <EmojiEventsIcon
                                    sx={{ fontSize: 18, color: "var(--primary)" }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ fontWeight: 500, color: "var(--onPrimary)" }}>
                                Your progress
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "var(--textSecondary)" }}>
                                {courseProgress?.completed_lessons || 0} of {courseProgress?.total_lessons || 0} complete
                            </Typography>
                        </Box>
                    </Stack>
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default CourseHeader;
