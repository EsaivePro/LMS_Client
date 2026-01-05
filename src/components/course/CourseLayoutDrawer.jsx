import React, { useState } from "react";
import {
    Box,
    Drawer,
    CssBaseline,
    Toolbar,
    useMediaQuery,
} from "@mui/material";

import CourseHeader from "./view/CourseHeader";
import VideoView from "./view/VideoView";
import CourseTabView from "./view/CourseTabView";
import CurriculumView from "./view/CurriculumView";
import Footer from "../layout/Footer";

const drawerWidth = 360;

export default function CourseLayoutDrawer({
    selectedLesson,
    courseProgress,
    selectedLessonProgress,
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
        <Box sx={{ height: "100%", overflowY: "auto", mt: isMobile ? 0 : 8 }}>
            <CurriculumView {...curriculumProps} courseProgress={courseProgress} />
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
                courseProgress={courseProgress}
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
                    {!isMobile && <Box sx={{ pt: 4 }}>
                        <Footer compView={true} />
                    </Box>}
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
            </Box>
            {/* RIGHT DRAWER MOBILE */}
            {isMobile && (
                <Box sx={{ minHeight: "60vh" }}>
                    {drawerContent}
                </Box>
            )}
            {isMobile && <Box sx={{ pt: 4 }}>
                <Footer compView={true} />
            </Box>}
        </>
    );
}
