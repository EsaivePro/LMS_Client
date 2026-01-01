import THEME from "../constants/theme";

function applyTheme() {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const colors = THEME.colors || {};

    Object.keys(colors).forEach((key) => {
        const cssVarName = `--${key}`;
        root.style.setProperty(cssVarName, colors[key]);
    });

    // backward compatibility: set --primary variable used across project
    if (colors.primary) root.style.setProperty("--primary", colors.primary);
    if (colors.secondary) root.style.setProperty("--secondary", colors.secondary);
    if (colors.accent) root.style.setProperty("--accent", colors.accent);
}

export default applyTheme;
