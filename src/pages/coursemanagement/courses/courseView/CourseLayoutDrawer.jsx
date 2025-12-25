import React, { useState } from "react";
import {
    Box,
    Drawer,
    CssBaseline,
    Toolbar,
    useMediaQuery,
} from "@mui/material";

import CourseHeader from "./components/CourseHeader";
import VideoView from "./components/VideoView";
import CourseTabView from "./components/CourseTabView";
import CurriculumView from "./components/CurriculumView";

const drawerWidth = 360;

export default function CourseLayoutDrawer({
    selectedLesson,
    signedUrl,
    loadingSignedUrl,
    user,
    goToPrev,
    goToNext,
    canGoPrev,
    canGoNext,
    getPrevLessonTitle,
    getNextLessonTitle,
    playerCardRef,
    isSmall,
    darkMode,
    value,
    handleChange,
    courseDetail,
    percent,
    completed,
    total,
    isFav,
    toggleFavorite,
    curriculumProps,
}) {

    const isMobile = useMediaQuery("(max-width: 900px)");
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);

    const drawerContent = (
        <Box sx={{ height: "100%", overflowY: "auto" }}>
            <Toolbar /> {/* Space under header */}
            <CurriculumView {...curriculumProps} />
        </Box>
    );

    return (
        <>
            <CssBaseline />

            {/* =====================================================
                  STATIC COURSE HEADER (below global navbar)
            ===================================================== */}
            <CourseHeader
                courseDetail={courseDetail}
                isFav={isFav}
                toggleFavorite={toggleFavorite}
                percent={percent}
                completed={completed}
                total={total}
                showMenuButton={isMobile}
                onMenuClick={handleDrawerToggle}
                drawerWidth={drawerWidth}
            />

            <Box sx={{ display: "flex", width: "100%" }}>

                {/* MAIN CONTENT LEFT SIDE */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        width: "100%",
                        p: 0,
                    }}
                >

                    <VideoView
                        selectedLesson={selectedLesson}
                        signedUrl={signedUrl}
                        loadingSignedUrl={loadingSignedUrl}
                        user={user}
                        goToPrev={goToPrev}
                        goToNext={goToNext}
                        canGoPrev={canGoPrev}
                        canGoNext={canGoNext}
                        getPrevLessonTitle={getPrevLessonTitle}
                        getNextLessonTitle={getNextLessonTitle}
                        playerCardRef={playerCardRef}
                        isSmall={isSmall}
                        darkMode={darkMode}
                    />

                    <CourseTabView
                        value={value}
                        handleChange={handleChange}
                        selectedLesson={selectedLesson}
                        darkMode={darkMode}
                    />
                </Box>

                {/* RIGHT DRAWER DESKTOP */}
                {!isMobile && (
                    <Drawer
                        variant="permanent"
                        anchor="right"
                        sx={{
                            width: drawerWidth,
                            flexShrink: 0,
                            "& .MuiDrawer-paper": {
                                width: drawerWidth,
                                boxSizing: "border-box",
                            },
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                )}

                {/* RIGHT DRAWER MOBILE */}
                {isMobile && (
                    <Drawer
                        variant="temporary"
                        anchor="right"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            "& .MuiDrawer-paper": {
                                width: drawerWidth,
                                boxSizing: "border-box",
                            },
                        }}
                    >
                        {drawerContent}
                    </Drawer>
                )}
            </Box>
        </>
    );
}
