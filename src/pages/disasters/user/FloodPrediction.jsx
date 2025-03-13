import { useState, useEffect } from "react";
import { Typography, Box } from "@mui/material";
import useMediaQuery from "@mui/material/useMediaQuery";
import fetchStationData from "../../../hooks/fetchStationData";
import FloodPredictionMap from "./FloodPredictionMap";

const FloodPrediction = () => {
  const selectedLocation = "New South Wales";
  const { stations, loading, error } = fetchStationData(selectedLocation);
  const isBelow = useMediaQuery("(max-width:1470px)");

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }

  if (error) {
    return <Typography align="center">Error: {error.message}</Typography>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      {/* Text above the map */}
      <Typography  align="center" sx={{ padding: "16px 0",
        mt: 8,
        mb: 0,
        fontSize: {
          xs: "1rem",
          sm: "1.2rem",
          md: isBelow ? "1.2rem" : "1.4rem",
          lg: isBelow ? "1.2rem" : "1.4rem",
        },
        fontWeight: "500",
       }}>
        Flood Prediction
      </Typography>

      {/* Map container */}
      <Box
        sx={{
          flex: 1, // Takes up remaining space
          width: "100%",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative", // Ensure the Box is a positioning context
        }}
      >
        <FloodPredictionMap stations={stations} />
      </Box>
    </div>
  );
};

export default FloodPrediction;