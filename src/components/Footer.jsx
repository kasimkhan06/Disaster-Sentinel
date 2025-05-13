import React from "react";
import { Box, Container, Link, Typography, List, ListItem, ListItemText } from "@mui/material";
import { Facebook, Twitter, Instagram, LinkedIn } from "@mui/icons-material";
import Grid from "@mui/material/Grid2";
import { useLocation } from "react-router-dom";

const Footer = () => {
  console.log("Footer is rendering!");
  const location = useLocation();
  const currentPath = location.pathname;
  const links = [
    { 
      path: "/current-location", 
      label: "Location Information",
      alternateLabel: "Home",
      alternatePath: "/"
    },
    { 
      path: "/missingPersonPortal", 
      label: "Report Missing Person",
      alternateLabel: "Home",
      alternatePath: "/"
    },
    { 
      path: "/agencies", 
      label: "Agency Information",
      alternateLabel: "Home",
      alternatePath: "/"
    }
  ];

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: "transparent",
        color: "black", 
        py: {sm: 3, xs: 3, md: 4},
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={{ xs: 2, md: 15 }} sx={{ width: {xs:"100%", md:"75%"}, margin: "0 auto" }}>
          <Grid
            size={{ xs: 12, sm: 12, md: 4, lg: 12 }}
            sx={{ textAlign: "center" }}
          >
            <Box display="flex" flexDirection={"row"} justifyContent="center" mb={2} sx={{ fontSize: {xs: "0.8rem", sm: "0.8rem", md: "1rem"},}}>
            {links.map((link) => (
                <Link
                  key={link.path}
                  href={currentPath == link.path ? link.alternatePath : link.path}
                  color="inherit"
                  underline="hover"
                  display="block"
                  sx={{
                    px: { xs: 1, sm: 1, md: 2 }
                  }}
                >
                  {currentPath === link.path ? link.alternateLabel : link.label}
                </Link>
              ))}
            </Box>
          </Grid>
        </Grid>
        <Box mt={0} pt={1} borderTop="1px solid rgba(255, 255, 255, 0.1)">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Flood Prediction System. All rights
            reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;
