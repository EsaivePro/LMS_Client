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

    // Apply initial app scale (if defined in CSS or theme). This attempts
    // to use `zoom` on the root for Chromium/WebKit browsers; if `zoom`
    // isn't supported (e.g., Firefox) CSS fallback on `.app-scale` will
    // handle transform-based scaling.
    try {
        let computed = getComputedStyle(root).getPropertyValue('--app-scale')?.trim();
        let scale = computed || '1';
        // set CSS var (in case theme wants to override)
        root.style.setProperty('--app-scale', scale);

        // compute and set inverse scale for CSS use (1 / scale)
        const numeric = parseFloat(scale) || 1;
        const inv = 1 / numeric;
        root.style.setProperty('--app-scale-inv', String(inv));

        // apply zoom for browsers that support it (Chromium/WebKit)
        document.documentElement.style.zoom = String(numeric);

        // Observe future changes to the inline style on :root so if
        // --app-scale is updated dynamically we recompute the inverse
        // and reapply zoom. This handles runtime toggles from UI.
        let last = scale;
        const observer = new MutationObserver(() => {
            const updated = getComputedStyle(root).getPropertyValue('--app-scale')?.trim() || '1';
            if (updated !== last) {
                last = updated;
                const n = parseFloat(updated) || 1;
                root.style.setProperty('--app-scale-inv', String(1 / n));
                document.documentElement.style.zoom = String(n);
            }
        });
        observer.observe(root, { attributes: true, attributeFilter: ['style'] });
    } catch (e) {
        // ignore if anything fails (server side rendering or unsupported APIs)
    }
}

export default applyTheme;
