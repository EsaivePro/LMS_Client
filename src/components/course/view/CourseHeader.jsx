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
                backgroundColor: "#1c1c24",
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
                        <IconButton onClick={onMenuClick} sx={{ color: "white" }}>
                            <MenuIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    )}

                    <Typography
                        sx={{
                            fontSize: "20px",
                            fontWeight: 600,
                            color: "white",
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
                            color: isFav ? "var(--primaryColor)" : "white",
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
                                sx={{ color: "var(--primaryColor)" }}
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
                                    sx={{ fontSize: 18, color: "var(--primaryColor)" }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography sx={{ fontWeight: 500, color: "white" }}>
                                Your progress
                            </Typography>
                            <Typography sx={{ fontSize: 12, color: "#d1d1d1" }}>
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
