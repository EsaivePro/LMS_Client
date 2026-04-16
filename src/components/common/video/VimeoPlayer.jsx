import React from "react";

/**
 * VimeoPlayer component renders a Vimeo video player using the Vimeo embed iframe.
 * @param {string} videoId - The Vimeo video ID to embed.
 * @param {string} [title] - Optional title for the video.
 * @param {string} [className] - Optional className for styling.
 * @param {object} [style] - Optional style object for the iframe.
 */
const VimeoPlayer = ({ videoId, title = "Vimeo Video", className = "", style = {} }) => {
    if (!videoId) return null;
    const src = `https://player.vimeo.com/video/${videoId}?h=0&title=0&byline=0&portrait=0`;
    return (
        <div className={className} style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", ...style }}>
            <iframe
                src={src}
                title={title}
                frameBorder="0"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
            />
        </div>
    );
};

export default VimeoPlayer;
