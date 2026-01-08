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
    showMenuButton = false,
    onMenuClick = () => { },
    drawerWidth,
    courseProgress,
}) => {
    const isMobile = useMediaQuery("(max-width:900px)");

    return (
        <AppBar
            position="static"
            sx={{
                width: isMobile ? "100%" : `calc(100% - ${drawerWidth}px)`,
                backgroundColor: "#1b1b1bff",
                boxShadow: "0",
                zIndex: 1300,
            }}
        >
            <Toolbar
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    minHeight: isMobile ? 60 : 64,
                    px: isMobile ? 2 : 3,
                    gap: isMobile ? 0 : 2,
                }}
            >
                {/* ================= LEFT ================= */}
                <Stack
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                        flex: "1 1 auto",
                        minWidth: 0, // 🔑 REQUIRED FOR ELLIPSIS
                    }}
                >
                    {/* {showMenuButton && (
                        <IconButton
                            onClick={onMenuClick}
                            sx={{ color: "var(--onPrimary)" }}
                        >
                            <MenuIcon sx={{ fontSize: 28 }} />
                        </IconButton>
                    )} */}

                    <Typography
                        sx={{
                            fontSize: isMobile ? 16 : 18,
                            fontWeight: 400,
                            color: "var(--onPrimary)",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            flex: 1,
                        }}
                    >
                        {courseDetail?.title || "Searching Course..."}
                    </Typography>
                </Stack>

                {/* ================= RIGHT (LOCKED) ================= */}
                <Stack
                    direction="row"
                    spacing={isMobile ? 1 : 2}
                    alignItems="center"
                    sx={{
                        flexShrink: 0, // 🔑 NEVER SHRINK
                    }}
                >
                    <IconButton
                        onClick={toggleFavorite}
                        sx={{
                            color: isFav
                                ? "var(--primary)"
                                : "var(--onPrimary)",
                        }}
                    >
                        {isFav ? (
                            <FavoriteIcon sx={{ fontSize: isMobile ? 22 : 26 }} />
                        ) : (
                            <FavoriteBorderIcon sx={{ fontSize: isMobile ? 22 : 26 }} />
                        )}
                    </IconButton>

                    {!isMobile && <Stack direction="row" spacing={1.5} alignItems="center">
                        <Box sx={{ position: "relative" }}>
                            <CircularProgress
                                variant="determinate"
                                value={courseProgress?.progress_percent || 0}
                                size={isMobile ? 42 : 42}
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
                                    sx={{
                                        fontSize: isMobile ? 18 : 18,
                                        color: "var(--primary)",
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box>
                            <Typography
                                sx={{
                                    fontWeight: 500,
                                    color: "var(--onPrimary)",
                                }}
                            >
                                Your progress
                            </Typography>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    color: "var(--textSecondary)",
                                }}
                            >
                                {courseProgress?.completed_lessons || 0} of{" "}
                                {courseDetail?.total_lessons || 0} complete
                            </Typography>
                        </Box>
                    </Stack>}
                    {isMobile && <Stack direction="column" spacing={0} alignItems="center">
                        <Box sx={{ position: "relative" }}>
                            <CircularProgress
                                variant="determinate"
                                value={courseProgress?.progress_percent || 0}
                                size={isMobile ? 30 : 42}
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
                                    sx={{
                                        fontSize: isMobile ? 18 : 20,
                                        color: "var(--primary)",
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ marginTop: "-3px" }}>
                            <Typography
                                sx={{
                                    fontSize: 12,
                                    fontWeight: 500,
                                    color: "var(--onPrimary)",
                                }}
                            >
                                {courseProgress?.completed_lessons || 0} of{" "}
                                {courseDetail?.total_lessons || 0}
                            </Typography>
                        </Box>
                    </Stack>}
                </Stack>
            </Toolbar>
        </AppBar>
    );
};

export default CourseHeader;
