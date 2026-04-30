export const THEME = {
    colors: {
        /* Brand Core */
        primary: "#4F46E5",          // Deep Indigo
        primaryHover: "#4338CA",
        primaryMedium: "#6366F1",
        primaryLight: "#EEF2FF",

        secondary: "#38BDF8",        // Sky Blue
        secondaryLight: "#E0F2FE",

        accent: "#10B981",           // Emerald CTA
        accentLight: "#DCFCE7",

        /* Backgrounds */
        background: "#F8FAFC",       // Soft Gray
        surface: "#FFFFFF",
        surface2: "#F1F5F9",
        surface3: "#E2E8F0",
        surface4: "#CBD5E1",

        /* Sidebar / Dark */
        dark: "#111827",             // Sidebar dark slate
        darkMedium: "#1E293B",
        darkLight: "#334155",

        /* Text */
        textPrimary: "#0F172A",      // Slate
        textSecondary: "#64748B",
        textMuted: "#94A3B8",

        onPrimary: "#FFFFFF",
        onSurface: "#0F172A",

        /* Status */
        success: "#10B981",
        warning: "#F59E0B",
        danger: "#EF4444",
        info: "#38BDF8",

        /* Utility */
        border: "#E2E8F0",
        lightgrey: "#F8FAFC",

        /* Dashboard Card Palette */
        card1: "#DBEAFE", // Courses Blue
        card2: "#DCFCE7", // Progress Green
        card3: "#EDE9FE", // Analytics Purple
        card4: "#FEF3C7", // Assignments Amber
        card5: "#D1FAE5",
        card6: "#E0F2FE",
        card7: "#F1F5F9",
        card8: "#F5F3FF",
        card9: "#CCFBF1",
        card10: "#FCE7F3",
        card11: "#F0FDF4",
        card12: "#EFF6FF",
        card13: "#FFF7ED",
        card14: "#ECFEFF",
        card15: "#EEF2FF",
        card16: "#F8FAFC",
        card17: "#E6FFFA",
        card18: "#F3E8FF",
        card19: "#E0F7FF",
        card20: "#F0FDF4",

        /* Gradients */
        heroGradient:
            "linear-gradient(135deg, #4F46E5 0%, #38BDF8 100%)",

        premiumGradient:
            "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
    },

    shadows: {
        sm: "0 2px 8px rgba(15,23,42,0.05)",
        md: "0 6px 20px rgba(15,23,42,0.08)",
        lg: "0 12px 30px rgba(15,23,42,0.12)",
    },

    radius: {
        sm: "8px",
        md: "12px",
        lg: "16px",
        xl: "24px",
    },

    manifest: {
        name: "Esai",
        short_name: "esai",
        description: "Premium Learning and CRM Platform with Esai",
        theme_color: "#4F46E5",
        background_color: "#F8FAFC",

        icons: [
            {
                src: "logo/lms.png",
                sizes: "192x192",
                type: "image/png",
            },
            {
                src: "logo/lms.png",
                sizes: "512x512",
                type: "image/png",
            },
        ],

        width: "50",

        contact: {
            email: "support@esailms.com",
            phone: "+91 7530078007",
            location: "Chennai, India",
        },
    },
};

export default THEME;