import React from "react";
import { Box, IconButton, Typography } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import THEME from "../../constants/theme";
import useCommon from "../../hooks/useCommon";

export default function Footer({ compView = false }) {
  const { viewFooter } = useCommon();
  if (!viewFooter && !compView) return null;

  const socialLinks = [
    { icon: <FacebookIcon fontSize="small" />, color: "#1877F2", label: "Facebook" },
    { icon: <InstagramIcon fontSize="small" />, color: "#E4405F", label: "Instagram" },
    { icon: <TwitterIcon fontSize="small" />, color: "#1DA1F2", label: "Twitter" },
    { icon: <LinkedInIcon fontSize="small" />, color: "#0077B5", label: "LinkedIn" },
  ];

  return (
    <Box
      component="footer"
      sx={{
        width: "100%",
        mt: { xs: compView ? 1.25 : "-100px", md: compView ? 1.25 : "-100px" },
        px: { xs: 2, md: 5 },
        py: 2,
        color: "var(--onPrimary)",
        background: "var(--dark)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexDirection: { xs: "column", sm: "row" },
          gap: 1.5,
          pt: 2,
          borderTop: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            color: "rgba(255, 255, 255, 0.72)",
            fontSize: 12,
            textAlign: { xs: "center", sm: "left" },
          }}
        >
          &copy; {new Date().getFullYear()} {THEME?.manifest?.name || "LMS Platform"} - All Rights Reserved.
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 1,
          }}
        >
          {socialLinks.map((item) => (
            <IconButton
              key={item.label}
              aria-label={item.label}
              size="small"
              sx={{
                width: 34,
                height: 34,
                color: "rgba(255, 255, 255, 0.78)",
                bgcolor: "rgba(255, 255, 255, 0.06)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                transition: "all 180ms ease",
                "&:hover": {
                  color: item.color,
                  bgcolor: "rgba(255, 255, 255, 0.12)",
                  borderColor: item.color,
                  transform: "translateY(-2px)",
                },
              }}
            >
              {item.icon}
            </IconButton>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
