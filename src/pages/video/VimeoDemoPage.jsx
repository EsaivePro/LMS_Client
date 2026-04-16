import React from "react";
import { Box, Typography } from "@mui/material";
import { VimeoPlayer } from "../../components/common/video";

/**
 * Standalone page for displaying a Vimeo video player.
 * Example Vimeo ID: 1183066574
 */
const VimeoDemoPage = () => {
    return (
        <Box sx={{ maxWidth: 800, mx: "auto", mt: 6, mb: 4 }}>
            <Typography variant="h4" fontWeight={700} gutterBottom>
                Vimeo Video Player Demo
            </Typography>
            <VimeoPlayer
                videoId="1183066574"
                title="Sample Vimeo Video"
                embedOptions={{
                    // Controls
                    // controls: 1, // Show controls
                    // autopause: 1,
                    // autoplay: 0,
                    // loop: 0,
                    // muted: 0,
                    // playsinline: 1,
                    // // Hide UI elements
                    // title: 0, // Hide title
                    // byline: 0, // Hide byline
                    // portrait: 0, // Hide profile picture
                    // // Appearance
                    // color: '00adef', // Accent color
                    // background: '000000', // Background color
                    // // Engagement
                    // like: 0,
                    // watchlater: 0,
                    // share: 0,
                    // embed: 0,
                    // // Details
                    // quality: 'auto',
                    // speed: 1,
                    // dnt: 1, // Do not track
                    // // Advanced (not all may be available on Starter)
                    // chromecast: 1,
                    // airplay: 1,
                    // pip: 1, // Picture-in-picture
                    // fullscreen: 1,
                    // vimeo_logo: 0, // Hide Vimeo logo (may require higher plan)
                    // Skipping forward (not directly supported, but can be set in player settings)
                }}
            />
        </Box>
    );
};

export default VimeoDemoPage;
