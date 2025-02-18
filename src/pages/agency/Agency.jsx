import React from "react";
import { Card, CardContent, CardActions, CardHeader, Typography, Button, TextField, Container, Grid, MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";

const ngoData = [
  {
    name: "Disaster Relief Foundation",
    location: "Mumbai, Maharashtra",
    contact: "+91 9876543210",
    website: "https://drf.org",
  },
  {
    name: "Helping Hands NGO",
    location: "Delhi, India",
    contact: "+91 8765432109",
    website: "https://helpinghands.org",
  },
];

export default function NGODashboard() {
  return (
    <Container sx={{ py: 4, minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <Card sx={{ p: 2, mt: 6, backgroundColor: "#1976d2", color: "white", display: "flex", justifyContent: "space-between", alignItems: "center", borderRadius: 2 }}>
        <Typography variant="h5" fontWeight="bold" sx={{textAlign: "center", flexGrow: 1}}>AGENCY</Typography>
      </Card>

      {/* Search and Filter Bar */}
      <Grid container spacing={2} sx={{ mt: 4, alignItems: "center" }}>
        <Grid item xs={6}>
          <TextField fullWidth variant="outlined" placeholder="Search NGOs by location..." />
        </Grid>
        <Grid item xs={1}>
          <Button variant="contained" color="primary" sx={{ width: "100%", height: "100%" }}><SearchIcon /></Button>
        </Grid>
        <Grid item xs={4} sx={{ display: "flex", justifyContent: "flex-center", ml: 12, alignItems: "center" }}>
          <FormControl sx={{ width: "50%" }} variant="outlined">
        <InputLabel>Filter by Type</InputLabel>
        <Select variant="outlined" defaultValue="all">
          <MenuItem value="all">All</MenuItem>
          <MenuItem value="flood">Flood Relief</MenuItem>
          <MenuItem value="earthquake">Earthquake Relief</MenuItem>
          <MenuItem value="fire">Fire Disaster Relief</MenuItem>
        </Select>
          </FormControl>
        </Grid>
      </Grid>

        {/* NGO List */}
      <Grid container spacing={3} sx={{ mt: 4 }}>
        {ngoData.map((ngo, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
              <CardContent>
                <Typography variant="h6" fontWeight="bold">{ngo.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ display: "flex", alignItems: "center", mt: 1 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "red", mr: 0.5 }} /> {ngo.location}
                </Typography>
                <Typography variant="body2" sx={{ mt: 1 }}>📞 {ngo.contact}</Typography>
              </CardContent>
              <CardActions>
                <Button size="small" color="primary" href={ngo.website} target="_blank">Visit Website</Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}