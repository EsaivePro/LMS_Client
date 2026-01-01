import React from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSelector } from "react-redux";

export default function Footer() {
  const viewFooter = useSelector((s) => s.ui.viewFooter) ?? true;
  if (!viewFooter) return null;

  return (
    <Box
      component="footer"
      sx={{
        background: "#f2f4f7",
        marginTop: { xs: "-48px", md: "-35px" },
        pt: { xs: 4, md: 6 },
        pb: 3,
        px: { xs: 3, md: 10 },
        width: "100%",
      }}
    >
      <Grid container spacing={4}>
        {/* ================= PLATFORM CAPABILITIES ================= */}
        <Grid
          item
          xs={12}
          md={7}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "center", md: "flex-start" },
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 700,
              mb: 2,
              color: "var(--primaryColor)",
              textAlign: "center",
            }}
          >
            Platform Capabilities
          </Typography>

          <Grid container spacing={1.5} >
            {[
              "Course Management",
              // "Examination Automation",
              "Secure Role-based Access",
              "Student Progress Tracking",
              "Result Generation",
            ].map((item, i) => (
              <Grid
                key={i}
                item
                xs={12}
                sm={6}
                sx={{ display: "flex", justifyContent: "center" }}
              >
                <FooterFeature text={item} />
              </Grid>
            ))}
          </Grid>
        </Grid>

        {/* ================= CONTACT US ================= */}
        <Grid
          item
          xs={12}
          md={4}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", md: "flex-end" }, // ✅ real centering
            width: "100%",
          }}
        >
          {/* INNER WRAPPER – THIS FIXES IT */}
          <Box
            sx={{
              textAlign: "center",
              width: "100%",
              maxWidth: 360, // keeps it visually centered
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                mb: 2,
                color: "var(--primaryColor)",
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
                    color: "var(--primaryColor)",
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
        </Grid>
      </Grid>

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
            color: "var(--primaryColor)",
          }}
        >
          © {new Date().getFullYear()} LMS Platform — All Rights Reserved.
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
        justifyContent: "center",
        gap: 1.2,
        width: "100%",
      }}
    >
      <CheckCircleIcon
        sx={{
          fontSize: 18,
          color: "var(--primaryColor)",
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
