import React, { useState, useEffect } from "react";
import { Box, Container, Link, Typography, List, ListItem, ListItemText } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import { useLocation, useNavigate } from "react-router-dom";

const Footer = () => {
  console.log("Footer is rendering!");
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);
  const [userID, setUserID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by retrieving from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
      setUserID(parsedData.user_id);
      setIsLoggedIn(true);
    }
  }, []);

  const publicLinks = [
    {
      path: "/current-location",
      label: "Location Information",
      alternateLabel: "Home",
      alternatePath: "/"
    },
    {
      path: "/missingpersonportal",
      label: "Report Missing Person",
      alternateLabel: "Home",
      alternatePath: "/"
    },
    {
      path: "/agencies",
      label: "Agency Information",
      alternateLabel: "Home",
      alternatePath: "/"
    },
    {
      path: "/announcements",
      label: "Announcements",
      alternateLabel: "Home",
      alternatePath: "/"
    }
  ];

  const agencyLinks = [
    {
      path: `/agency-profile/${userID}`,
      label: "Profile",
      alternateLabel: "Home",
      alternatePath: "/agency-dashboard"
    },
    {
      path: "/missing-person",
      label: "Missing Person Info",
      alternateLabel: "Home",
      alternatePath: "/agency-dashboard"
    },
    {
      path: "/event-listing",
      label: "Announcement",
      alternateLabel: "Home",
      alternatePath: "/agency-dashboard"
    }
  ];

  const links = isLoggedIn && userRole === "agency" ? agencyLinks : publicLinks;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "transparent",
        color: "black",
        py: { sm: 3, xs: 3, md: 4 },
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container
          spacing={{ xs: 2, md: 15 }}
          sx={{
            width: { xs: "100%", md: "75%" },
            margin: "0 auto",
            justifyContent: { xs: "center", md: "center" },
            textAlign: { xs: "center", md: "center" }
          }}>
          <Grid
            item
            xs={12}
            md={12}
            sx={{
              textAlign: "center",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}
          >
            <Box display="flex"
              flexDirection="row"
              justifyContent="center"
              alignItems="center"
              mb={2}
              sx={{
                fontSize: { xs: "0.8rem", md: "1rem" },
                gap: { xs: 1, md: 2 },
              }}>
              {links.map((link) => (
                <Link
                  key={link.path}
                  component="button" // Treat as button to prevent href behavior
                  color="inherit"
                  underline="hover"
                  display="block"
                  textAlign="center"
                  onClick={() => handleNavigation(currentPath === link.path ? link.alternatePath : link.path)}
                  sx={{
                    px: { xs: 1, sm: 1, md: 2 },
                    cursor: "pointer",
                    background: "none",
                    border: "none",
                    font: "inherit"
                  }}
                >
                  {currentPath === link.path ? link.alternateLabel : link.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Box mt={0} pt={1} borderTop="1px solid rgba(255, 255, 255, 0.1)">
          <Typography variant="body2" align="center" fontSize={{ xs: "0.8rem", sm: "0.8rem", md: "1rem" }}>
            © {new Date().getFullYear()} Flood Prediction System. All rights
            reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;