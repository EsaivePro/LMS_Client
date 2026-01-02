import React from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton
} from "@mui/material";
import THEME from "../../constants/theme";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSelector } from "react-redux";
import useCommon from "../../hooks/useCommon";

export default function Footer({ compView = false }) {
  const { viewFooter } = useCommon();
  if (!viewFooter && !compView) return null;
  return (
    <Box
      component="footer"
      sx={{
        background: "var(--surface)",
        marginTop: { xs: "-48px", md: "-48px" },
        pt: { xs: 4, md: 6 },
        pb: 3,
        px: { xs: 3, md: 10 },
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, justifyContent: "space-between", gap: 4, alignItems: { xs: 'center', md: 'flex-start' } }}>

        <Box sx={{ width: { xs: '100%', md: 'auto' } }}>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "var(--primary)",
              textAlign: "center",
            }}
          >
            Platform Capabilities
          </Typography>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)" },
              gap: 1.5,
              alignItems: "center",
            }}
          >
            {[
              "Course Management",
              "Secure Role-based Access",
              "Student Progress Tracking",
              "Result Generation",
            ].map((item, i) => (
              <Box key={i} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" } }}>
                <FooterFeature text={item} />
              </Box>
            ))}
          </Box>
        </Box>
        <Box>
          <Box
            sx={{
              textAlign: { xs: 'center', md: 'left' },
              width: "100%",
              maxWidth: 360, // keeps it visually centered
              mx: { xs: 'auto', md: 0 },
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "var(--primary)",
              }}
            >
              Contact Us
            </Typography>

            <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
              Email: support@esai.com
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
              Phone: +91 75300 78007
            </Typography>
            <Typography sx={{ fontSize: 14, lineHeight: 1.6 }}>
              Chennai, India
            </Typography>
          </Box>
        </Box>
        <Box sx={{ width: { xs: '100%', md: 'auto' }, textAlign: { xs: 'center', md: 'left' } }}>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: 'center', gap: 1, justifyContent: { xs: 'center', md: 'flex-start' } }}>
            <img src={THEME?.manifest?.icons?.[0]?.src ? `/${THEME.manifest.icons[0].src}` : '/logo/EsaiLogo.png'} alt={THEME?.manifest?.name || 'LMS'} width={42} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: 'var(--primary)', textTransform: 'uppercase' }}>
              {THEME?.manifest?.short_name ? THEME.manifest.short_name.toUpperCase() : 'LMS'}
            </Typography>
          </Box>
          <Typography variant="h7" sx={{ fontWeight: 400, color: 'var(--primaryLight)' }}>
            {THEME?.manifest?.description ? THEME.manifest.description : 'LMS'}
          </Typography>
          {/* SOCIAL ICONS */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center", // ✅ page center
              gap: 2,
              mt: 3,
            }}
          >
            {[
              { icon: <FacebookIcon />, color: "#1877F2" },
              { icon: <InstagramIcon />, color: "#E4405F" },
              { icon: <TwitterIcon />, color: "#1DA1F2" },
              { icon: <LinkedInIcon />, color: "#0077B5" },
            ].map((item, i) => (
              <IconButton
                key={i}
                sx={{
                  color: "var(--primary)",
                  "&:hover": {
                    transform: "scale(1.2)",
                    color: item.color,
                  },
                }}
              >
                {item.icon}
              </IconButton>
            ))}
          </Box>
        </Box>
      </Box>

      {/* ================= COPYRIGHT ================= */}
      <Box
        sx={{
          borderTop: "1px solid rgba(0,0,0,0.2)",
          mt: 4,
          pt: 2,
          textAlign: "center",
        }}
      >
        <Typography
          variant="body2"
          sx={{
            fontSize: 12,
            opacity: 0.7,
            color: "var(--primary)",
          }}
        >
          © {new Date().getFullYear()} {THEME?.manifest?.name || 'LMS Platform'} — All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}

/* ================= FOOTER FEATURE ================= */
function FooterFeature({ text }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: { xs: "center", md: "flex-start" },
        gap: 1.2,
        width: "100%",
      }}
    >
      <CheckCircleIcon
        sx={{
          fontSize: 18,
          color: "var(--primary)",
          opacity: 0.7,
          flexShrink: 0,
        }}
      />
      <Typography sx={{ fontSize: 14, lineHeight: 1.4 }}>
        {text}
      </Typography>
    </Box>
  );
}
