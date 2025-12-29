import React from "react";
import { Box, Card, CircularProgress } from "@mui/material";
import SecureVideoPlayer from "../../common/video/SecureVideoPlayer";
import SecurePDFViewer from "../../common/pdf/SecurePDFViewer";

const VideoView = ({
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
    darkMode
}) => {
    return (
        <Card
            ref={playerCardRef}
            sx={{
                borderRadius: 0,
                boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
                width: "100%",
                overflow: "hidden",
                background: darkMode ? "#071028" : "white"
            }}
        >
            <Box
                sx={{
                    width: "100%",
                    height: isSmall ? 160 : 450,
                    background: "#000",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center"
                }}
            >
                {selectedLesson?.type === "Video" && (
                    <>
                        {loadingSignedUrl ? (
                            <CircularProgress />
                        ) : (
                            <SecureVideoPlayer
                                signedUrl={signedUrl || selectedLesson.video_url}
                                selectedLesson={selectedLesson}
                                user={user}
                                onPrevious={goToPrev}
                                onNext={goToNext}
                                previousDisabled={canGoPrev()}
                                nextDisabled={canGoNext()}
                                prevTitle={getPrevLessonTitle()}
                                nextTitle={getNextLessonTitle()}
                            />
                        )}
                    </>
                )}

                {selectedLesson?.type === "PDF" && (
                    <SecurePDFViewer keyPath={selectedLesson.video_url} user={user} />
                )}
            </Box>
        </Card>
    );
};

export default VideoView;
