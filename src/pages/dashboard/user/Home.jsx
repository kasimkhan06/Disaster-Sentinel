import React, { useState } from "react";
import { Typography, Box, Card, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid2"; // Use standard Grid instead of Grid2
import { DataGrid } from "@mui/x-data-grid"; // To create a table with Material-UI
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Home = () => {
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Data for the table
  const rows = [
    {
      id: 1,
      disaster: "Flood",
      location: "City A",
      monthYear: "Jan 2023",
      lat: 40.7128,
      lon: -74.006,
    },
    {
      id: 2,
      disaster: "Earthquake",
      location: "City B",
      monthYear: "Feb 2023",
      lat: 34.0522,
      lon: -118.2437,
    },
    {
      id: 3,
      disaster: "Wildfire",
      location: "City C",
      monthYear: "Sep 2023",
      lat: 51.5074,
      lon: -0.1278,
    },
  ];

  const columns = [
    { field: "disaster", headerName: "Disaster", width: 150 },
    { field: "location", headerName: "Location", width: 150 },
    { field: "monthYear", headerName: "Month/Year", width: 150 },
  ];

  // Handle row click to set the selected location
  const handleRowClick = (params) => {
    setSelectedLocation({
      lat: params.row.lat,
      lon: params.row.lon,
    });
  };

  return (
    <Box sx={{ p: 2 }}>
      {/* Title */}
      <Typography
        align="left"
        sx={{
          mt: 10,
          ml: { xs: 2, sm: 4, md: 4 },
          fontSize: { xs: "1.5rem", sm: "1.7rem", md: "1.8rem" },
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        Disaster Information Home
      </Typography>

      {/* Grid Layout */}
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Table Section */}
        <Grid item xs={12} sm={6} md={6} lg={6}>
          <Card
            sx={{
              p: { xs: "8px", sm: "8px", md: "16px" },
              height: "100%",
              boxShadow: "none",
              border: "none",
            }}
          >
            <CardContent sx={{ p: { xs: "8px", sm: "8px", md: "16px" } }}>
              <Typography variant="h5" sx={{ mb: 2 }}>
                Disaster Data Table
              </Typography>
              <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  hideFooter
                  onRowClick={handleRowClick}
                  sx={{
                    "& .MuiDataGrid-row.Mui-selected": {
                      outline: "none", // Remove the outline on row selection
                      boxShadow: "none", // Remove any box-shadow on row selection
                    },
                    "& .MuiDataGrid-cell:focus": {
                      outline: "none", // Remove outline from individual cell focus
                    },
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </Grid>

        {/* Map Section */}
      </Grid>

      {/* Additional Sections or Content */}
    </Box>
  );
};

export default Home;
