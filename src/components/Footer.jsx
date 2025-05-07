import React from 'react';
import { Box, Container, Link, Typography } from '@mui/material';
import { Facebook, Twitter, Instagram, LinkedIn } from '@mui/icons-material';
import Grid from "@mui/material/Grid2";

const Footer = () => {
    console.log("Footer is rendering!");
  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'transparent',
        color: 'black',
        py: 6,
        mt: 'auto',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={1} sx={{ width: '60%',margin: '0 auto' }}>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 4 }} sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Flood Prediction System
            </Typography>
            <Typography variant="body2">
              An advanced flood prediction platform leveraging machine learning to enhance disaster preparedness and response.
            </Typography>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 4 }}  sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box>
              <Link href="/" color="inherit" underline="hover" display="block" mb={1}>
                Home
              </Link>
              <Link href="/flood-prediction" color="inherit" underline="hover" display="block" mb={1}>
                Flood Prediction
              </Link>
              <Link href="/current-location" color="inherit" underline="hover" display="block" mb={1}>
                Current Location
              </Link>
              <Link href="/dosdontspage" color="inherit" underline="hover" display="block" mb={1}>
                Safety Tips
              </Link>
            </Box>
          </Grid>
          <Grid size={{ xs: 6, sm: 6, md: 4, lg: 4 }} sx={{ textAlign: 'center' }} >
            <Typography variant="h6" gutterBottom>
              Connect With Us
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
              <Link href="#" color="inherit">
                <Facebook />
              </Link>
              <Link href="#" color="inherit">
                <Twitter />
              </Link>
              <Link href="#" color="inherit">
                <Instagram />
              </Link>
              <Link href="#" color="inherit">
                <LinkedIn />
              </Link>
            </Box>
            <Typography variant="body2" mt={2}>
              Email: contact@floodpredict.com
            </Typography>
            <Typography variant="body2">
              Phone: +1 234 567 8901
            </Typography>
          </Grid>
        </Grid>
        <Box mt={3} pt={1} borderTop="1px solid rgba(255, 255, 255, 0.1)">
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} Flood Prediction System. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;