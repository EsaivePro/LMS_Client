import React from "react";
import {
  Box,
  Typography,
  Grid,
  IconButton,
  Stack
} from "@mui/material";

import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import TwitterIcon from "@mui/icons-material/Twitter";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { useSelector } from "react-redux";

export default function Footer() {
  const viewFooter = useSelector((s) => s.ui.viewFooter) || true;
  return (
    <div> {viewFooter &&
      <Box
        component="footer"
        sx={{
          background: "#f2f4f7", // light gray
          color: "black",
          marginTop: "-35px",
          pt: 6,
          pb: 3,
          px: { xs: 3, md: 10 },
          width: "100%",
        }}
      >
        <Grid
          container
          spacing={4}
          alignItems="flex-start"
          justifyContent="space-between"
        >

          {/* LEFT SIDE — PLATFORM CAPABILITIES */}
          <Grid item xs={12} md={7}>
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "var(--primaryColor)" }}>
              Platform Capabilities
            </Typography>

            <Grid container spacing={2}>
              {/* Column 1 */}
              <Grid item xs={12} sm={4}>
                <Stack spacing={1.5}>
                  <FooterFeature text="Course Management" />
                  <FooterFeature text="Topic Organization" />
                </Stack>
              </Grid>

              {/* Column 2 */}
              <Grid item xs={12} sm={4}>
                <Stack spacing={1.5}>
                  <FooterFeature text="Examination Automation" />
                  <FooterFeature text="Result Generation" />
                </Stack>
              </Grid>

              {/* Column 3 */}
              <Grid item xs={12} sm={4}>
                <Stack spacing={1.5}>
                  <FooterFeature text="Student Progress Tracking" />
                  <FooterFeature text="Secure Role-based Access" />
                </Stack>
              </Grid>
            </Grid>
          </Grid>

          {/* RIGHT SIDE — CONTACT INFO (RIGHT ALIGNED PERFECTLY) */}
          <Grid
            item
            xs={12}
            md={4}
            sx={{
              textAlign: { xs: "center", md: "right" },
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 700, mb: 2, color: "var(--primaryColor)" }}>
              Contact Us
            </Typography>

            <Typography>Email: support@esai.com</Typography>
            <Typography>Phone: +91 75300 78007</Typography>
            <Typography>Chennai, India</Typography>

            {/* SOCIAL ICONS RIGHT-ALIGNED */}
            <Box
              sx={{
                display: "flex",
                gap: 1.7,
                mt: 3,
                justifyContent: { xs: "center", md: "flex-end" },
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
                    transition: "all 0.3s ease",
                    "&:hover": {
                      transform: "scale(1.25)",
                      color: item.color,
                      filter: "drop-shadow(0 0 6px rgba(0,0,0,0.4))",
                    },
                  }}
                >
                  {item.icon}
                </IconButton>
              ))}
            </Box>
          </Grid>
        </Grid>

        {/* COPYRIGHT */}
        <Box
          sx={{
            borderTop: "1px solid rgba(0,0,0,0.2)",
            textAlign: "center",
            mt: 4,
            pt: 2,
          }}
        >
          <Typography variant="body2" sx={{ opacity: 0.7, color: "var(--primaryColor)" }}>
            © {new Date().getFullYear()} LMS Platform — All Rights Reserved.
          </Typography>
        </Box>
      </Box>
    }</div>
  );
}

function FooterFeature({ text }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <CheckCircleIcon sx={{ fontSize: 18, color: "var(--primaryColor)", opacity: 0.7 }} />
      <Typography sx={{ opacity: 0.9 }}>{text}</Typography>
    </Box>
  );
}
