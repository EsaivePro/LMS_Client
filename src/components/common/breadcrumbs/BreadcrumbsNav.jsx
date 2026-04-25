import { Box, Breadcrumbs, Typography, Link, Button, Chip, Divider, useTheme, useMediaQuery, Fade } from "@mui/material";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import HomeFilledIcon from "@mui/icons-material/HomeFilled";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormHeader } from "../../../contexts/FormHeaderContext";

export default function BreadcrumbsNav({ breadCurmbs = true }) {
    const location = useLocation();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { formHeader } = useFormHeader();

    const rawPathnames = location.pathname.split("/").filter((x) => x);
    const displayItems = rawPathnames
        .map((seg, idx) => ({ seg, idx }))
        .filter(({ seg }) => seg.toLowerCase() !== "manage");

    if (location.pathname === "/login" || !breadCurmbs) return null;

    const sharedBoxSx = {
        position: "fixed",
        top: 64,
        left: "var(--sidebar-offset, 0px)",
        right: 0,
        zIndex: 1000,
        transition: "left 0.3s ease",
        px: isMobile ? 2 : 2.5,
        py: 1,
        boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        bgcolor: "white",
        display: "flex",
        alignItems: "center",
    };

    /* ── Form header mode ── */
    if (formHeader) {
        const { displayTitle = "", submitLabel = "Save", editing = false, onToggleEdit, onCancel, onCopy, onSubmit } = formHeader;
        return (
            <Fade in timeout={200}>
                <Box sx={{ ...sharedBoxSx, justifyContent: "space-between", gap: 1.5 }}>
                    {/* Left: Back + Divider + Title + Editing chip */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0, flex: 1 }}>
                        <Button
                            variant="text"
                            onClick={onCancel}
                            startIcon={<ArrowBackIcon />}
                            sx={{
                                color: "text.secondary",
                                fontWeight: 500,
                                fontSize: { xs: 12, sm: 13 },
                                px: { xs: 0.75, sm: 1.25 },
                                whiteSpace: "nowrap",
                                flexShrink: 0,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                                "&:hover": { color: "var(--primary)", backgroundColor: "rgba(0,0,0,0.04)", transform: "translateX(-2px)" },
                                transition: "all 0.2s",
                            }}
                        >
                            Back
                        </Button>

                        <Divider orientation="vertical" flexItem />

                        <Typography
                            sx={{
                                fontWeight: 700,
                                fontSize: { xs: "0.88rem", sm: "1rem" },
                                color: "var(--dark)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                minWidth: 0,
                            }}
                        >
                            {displayTitle}
                        </Typography>

                        {editing && (
                            <Chip
                                label="Editing"
                                size="small"
                                sx={{
                                    fontSize: 10,
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    letterSpacing: 0.5,
                                    color: "var(--primary)",
                                    backgroundColor: "var(--primaryLight, #ede7f6)",
                                    border: "1px solid var(--primary)",
                                    flexShrink: 0,
                                    height: 20,
                                    "@keyframes fadeIn": {
                                        from: { opacity: 0, transform: "scale(0.85)" },
                                        to: { opacity: 1, transform: "scale(1)" },
                                    },
                                    animation: "fadeIn 0.2s ease",
                                }}
                            />
                        )}
                    </Box>

                    {/* Right: Action buttons */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.75, sm: 1 }, flexShrink: 0 }}>
                        {submitLabel !== "Create" && (
                            <>
                                <Button
                                    variant="outlined"
                                    onClick={onCopy}
                                    startIcon={<ContentCopyIcon fontSize="small" />}
                                    sx={{
                                        fontSize: { xs: 11, sm: 13 },
                                        fontWeight: 500,
                                        px: { xs: 1, sm: 1.75 },
                                        whiteSpace: "nowrap",
                                        borderColor: "divider",
                                        color: "text.secondary",
                                        display: { xs: "none", sm: "inline-flex" },
                                        "&:hover": { borderColor: "var(--primary)", color: "var(--primary)", backgroundColor: "var(--primaryLight, #ede7f6)" },
                                        transition: "all 0.2s",
                                    }}
                                >
                                    Copy
                                </Button>

                                <Button
                                    variant={editing ? "outlined" : "contained"}
                                    onClick={onToggleEdit}
                                    startIcon={editing ? <CancelIcon fontSize="small" /> : <EditIcon fontSize="small" />}
                                    color={editing ? "error" : "primary"}
                                    sx={{
                                        fontSize: { xs: 11, sm: 13 },
                                        fontWeight: 500,
                                        px: { xs: 1.25, sm: 1.75 },
                                        whiteSpace: "nowrap",
                                        transition: "all 0.2s",
                                        "&:hover": { transform: "translateY(-1px)", boxShadow: "0 4px 12px rgba(0,0,0,0.12)" },
                                    }}
                                >
                                    {editing ? "Cancel" : "Edit"}
                                </Button>
                            </>
                        )}

                        {(editing || submitLabel === "Create") && (
                            <Button
                                variant="contained"
                                onClick={onSubmit}
                                startIcon={<SaveIcon fontSize="small" />}
                                sx={{
                                    fontSize: { xs: 12, sm: 13 },
                                    fontWeight: 700,
                                    px: { xs: 1.5, sm: 2.25 },
                                    whiteSpace: "nowrap",
                                    background: "linear-gradient(135deg, var(--primary) 0%, var(--darkMedium, #1a3a6b) 100%)",
                                    boxShadow: "0 3px 10px rgba(0,0,0,0.18)",
                                    letterSpacing: 0.3,
                                    "@keyframes slideIn": {
                                        from: { opacity: 0, transform: "translateX(8px)" },
                                        to: { opacity: 1, transform: "translateX(0)" },
                                    },
                                    animation: "slideIn 0.22s ease",
                                    transition: "all 0.2s",
                                    "&:hover": { transform: "translateY(-2px)", boxShadow: "0 6px 18px rgba(0,0,0,0.22)" },
                                    "&:active": { transform: "translateY(0)", boxShadow: "0 2px 6px rgba(0,0,0,0.15)" },
                                }}
                            >
                                {submitLabel}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Fade>
        );
    }

    /* ── Normal breadcrumbs mode ── */
    return (
        <Fade in timeout={700}>
            <Box sx={{ ...sharedBoxSx, borderRadius: 2 }}>
                <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
                    <Link
                        underline="hover"
                        color="var(--primary)"
                        onClick={() => navigate("/")}
                        sx={{ display: "flex", alignItems: "center", fontWeight: 400, cursor: "pointer" }}
                    >
                        {/* <HomeFilledIcon fontSize="small" sx={{ mr: 0.5, mt: -0.4, verticalAlign: "middle" }} /> */}
                        Dashboard
                    </Link>
                    {displayItems.map(({ seg, idx }, index) => {
                        const to = "/" + rawPathnames.slice(0, idx + 1).join("/");
                        const isLast = index === displayItems.length - 1;
                        return isLast ? (
                            <Typography key={to} color="text.primary" sx={{ fontWeight: 600 }}>
                                {decodeURI(seg)}
                            </Typography>
                        ) : (
                            <Link key={to} underline="hover" color="inherit" onClick={() => navigate(to)} sx={{ cursor: "pointer" }}>
                                {decodeURI(seg)}
                            </Link>
                        );
                    })}
                </Breadcrumbs>
            </Box>
        </Fade>
    );
}
