export const THEME = {
    colors: {
        primary: "#8F00FF", //"#aa2c44", // #ff9800 
        primaryMedium: "#9000ff49",
        primaryLight: "rgba(162, 122, 255, 0.09)", // rgba(255, 152, 0, 0.04)

        dark: "#212121",
        darkMedium: "#434242ff", //"#c33f57ff",
        darkLight: "#666666ff", //"#c33f57ff",

        // primaryDark: "#1565C0",
        // primaryLight: "#434242ff", //"#c33f57ff",
        secondary: "#9ACD32",
        background: "#ffffff",
        surface: "#fbfbfbff",
        surface2: "rgb(249, 249, 249)",
        surface3: "#f0f2f5",
        surface4: "#f0f2f5",
        lightgrey: "#f5f5f5ff",
        textPrimary: "#212121",
        textSecondary: "#616161",
        onPrimary: "#ffffff",
        onSurface: "#212121",
        accent: "#9ACD32",
        danger: "#E53935",
        // Card palette (light pastel colors for cards) - card1 .. card20
        card1: "#83acffff",
        card2: "#fe808dff",
        card3: "#a27affff",
        card4: "#face75ff",
        card5: "#7dffc5ff",
        card6: "#cfe9ffff",
        card7: "#ffd6e6ff",
        card8: "#f7d8baff",
        card9: "#e6d7ffff",
        card10: "#fff3b0ff",
        card11: "#d6f5e0ff",
        card12: "#e9e0ffff",
        card13: "#ffdfd0ff",
        card14: "#d0f0ffff",
        card15: "#f0e6ffff",
        card16: "#ffe8ccff",
        card17: "#e0fff4ff",
        card18: "#fbe7ffff",
        card19: "#e8f6ffff",
        card20: "#f6fff0ff",
    },
    manifest: {
        name: "Esai",
        short_name: "esai",
        description: "Learning platform with Esai.",
        theme_color: "#aa2c44",
        background_color: "#ffffff",
        icons: [
            { src: "logo/Esai-new-logo.png", sizes: "192x192", type: "image/png" },
            { src: "logo/Esai-new-logo.png", sizes: "512x512", type: "image/png" }
        ],
        contact: {
            email: "support@esailms.com",
            phone: "+91 7530078007",
            location: "Chennai, India",
        },
    },
};

export default THEME;
