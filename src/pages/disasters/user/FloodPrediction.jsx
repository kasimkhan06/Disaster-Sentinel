import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  MenuItem,
  Select,
  Button,
  TextField,
  Autocomplete,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import useMediaQuery from "@mui/material/useMediaQuery";
import fetchStationData from "../../../hooks/fetchStationData";
import FloodPredictionMap from "./FloodPredictionMap";
import MyLocationIcon from "@mui/icons-material/MyLocation";

const FloodPrediction = () => {
  const [tempSelectedLocation, setTempSelectedLocation] = useState("All States");
  const [tempSelectedRiverBasin, setTempSelectedRiverBasin] = 
    useState("All River Basins");
  const [selectedLocation, setSelectedLocation] = useState("All States");
  const [selectedRiverBasin, setSelectedRiverBasin] = 
    useState("All River Basins");
  const [filteredStations, setFilteredStations] = useState([]);
  const { stations, loading, error, stateNames, riverBasins } = 
    fetchStationData();
  const isBelow = useMediaQuery("(max-width:1470px)");
  const [currentLocationState, setCurrentLocationState] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [currentLocationCoords, setCurrentLocationCoords] = useState(null);
  const [focusOnCurrentLocation, setFocusOnCurrentLocation] = useState(false);
  const [noStationsInLocation, setNoStationsInLocation] = useState(false);

  // State to hold filtered options
  const [filteredRiverBasins, setFilteredRiverBasins] = useState(riverBasins);
  const [filteredStates, setFilteredStates] = useState(stateNames);

  // Get current location on component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${position.coords.latitude}&lon=${position.coords.longitude}&addressdetails=1`
            );
            const data = await response.json();
            const state = data.address?.state || data.address?.county;

            if (state) {
              setCurrentLocationState(state);
              setCurrentLocationCoords({
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              });
            }
          } catch (err) {
            setLocationError("Error fetching location data");
            console.error("Geocoding error:", err);
          }
        },
        (error) => {
          setLocationError("Unable to retrieve your location");
          console.error("Geolocation error:", error);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
    }
  }, []);

  // Apply filters when Apply button is clicked
  const handleApplyFilters = () => {
    setSelectedLocation(tempSelectedLocation);
    setSelectedRiverBasin(tempSelectedRiverBasin);
    setNoStationsInLocation(false);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setTempSelectedLocation("All States");
    setTempSelectedRiverBasin("All River Basins");
    setSelectedLocation("All States");
    setSelectedRiverBasin("All River Basins");
    setFilteredRiverBasins(riverBasins);
    setFilteredStates(stateNames);
    setNoStationsInLocation(false);
  };

  // Use current location as filter
  const handleUseCurrentLocation = () => {
    if (currentLocationState && currentLocationCoords) {
      // Check if there are stations in the current state
      const stationsInState = stations.filter(
        (station) => station.state === currentLocationState
      );
      
      if (stationsInState.length === 0) {
        setNoStationsInLocation(true);
      } else {
        setNoStationsInLocation(false);
      }

      setTempSelectedLocation(currentLocationState);
      setSelectedLocation(currentLocationState);
      setTempSelectedRiverBasin("All River Basins");
      setSelectedRiverBasin("All River Basins");
      setFocusOnCurrentLocation(true);
    } else if (locationError) {
      alert(locationError);
    } else {
      alert("Determining your location... Please try again in a moment.");
    }
  };

  // Filter stations based on selected filters
  useEffect(() => {
    let filtered = stations;

    if (selectedLocation !== "All States") {
      filtered = filtered.filter(
        (station) => station.state === selectedLocation
      );
    }

    if (selectedRiverBasin !== "All River Basins") {
      filtered = filtered.filter(
        (station) => station.river_basin === selectedRiverBasin
      );
    }

    setFilteredStations(filtered);
  }, [selectedLocation, selectedRiverBasin, stations]);

  // Update filtered river basins when temp selected location changes
  useEffect(() => {
    if (tempSelectedLocation !== "All States") {
      const basinsInState = [
        ...new Set(
          stations
            .filter((station) => station.state === tempSelectedLocation)
            .map((station) => station.river_basin)
        ),
      ];
      setFilteredRiverBasins(basinsInState);

      if (
        tempSelectedRiverBasin !== "All River Basins" &&
        !basinsInState.includes(tempSelectedRiverBasin)
      ) {
        setTempSelectedRiverBasin("All River Basins");
      }
    } else {
      setFilteredRiverBasins(riverBasins);
    }
  }, [tempSelectedLocation, stations, riverBasins]);

  // Update filtered states when temp selected river basin changes
  useEffect(() => {
    if (tempSelectedRiverBasin !== "All River Basins") {
      const statesInBasin = [
        ...new Set(
          stations
            .filter((station) => station.river_basin === tempSelectedRiverBasin)
            .map((station) => station.state)
        ),
      ];
      setFilteredStates(statesInBasin);

      if (
        tempSelectedLocation !== "All States" &&
        !statesInBasin.includes(tempSelectedLocation)
      ) {
        setTempSelectedLocation("All States");
      }
    } else {
      setFilteredStates(stateNames);
    }
  }, [tempSelectedRiverBasin, stations, stateNames]);

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }

  if (error) {
    return <Typography align="center">Error: {error.message}</Typography>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <Typography
        align="center"
        sx={{
          padding: "16px 0",
          mt: 8,
          mb: 0,
          fontSize: {
            xs: "1rem",
            sm: "1.2rem",
            md: isBelow ? "1.2rem" : "1.4rem",
            lg: isBelow ? "1.2rem" : "1.4rem",
          },
          fontWeight: "500",
        }}
      >
        Flood Prediction
      </Typography>

      {/* Filter controls */}
      <Grid
        container
        spacing={1}
        sx={{
          mb: { xs: 1, md: 2 },
          width: {
            xs: "100%",
            sm: "90%",
            md: "83%",
            lg: isBelow ? "70%" : "60%",
          },
          marginX: "auto",
        }}
      >
        {/* State filter */}
        <Grid
          size={{ xs: 6, sm: 6, md: 4, lg: 4 }}
          sx={{
            display: "flex",
            justifyContent: "right",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "75%", md: "90%" },
              paddingLeft: { xs: 1, md: 2 },
              mb: 2,
              textAlign: "left",
              boxShadow: "2px 2px 2px #E8F1F5",
              position: "relative",
            }}
          >
            <Autocomplete
              options={["All States", ...filteredStates]}
              value={tempSelectedLocation}
              onChange={(event, newValue) => {
                setTempSelectedLocation(newValue || "All States");
                setNoStationsInLocation(false);
              }}
              getOptionLabel={(option) => option}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  variant="outlined"
                  InputProps={{
                    ...params.InputProps,
                    endAdornment: (
                      <>
                        <Tooltip title="Use my current location">
                          <IconButton
                            onClick={handleUseCurrentLocation}
                            size="small"
                            sx={{ mr: -1 }}
                          >
                            <MyLocationIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {params.InputProps.endAdornment}
                      </>
                    ),
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "4px 8px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.9rem",
                        md: isBelow ? "1rem" : "1.1rem",
                        lg: isBelow ? "1rem" : "1.1rem",
                      },
                    },
                    "&.Mui-focused": {
                      color: "inherit",
                    },
                    width: "100%",
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-endAdornment": {
                  right: "10px",
                },
              }}
            />
          </Box>
        </Grid>

        {/* River basin filter */}
        <Grid
          size={{ xs: 6, sm: 6, md: 4, lg: 4 }}
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: { xs: "100%", sm: "75%", md: "90%" },
              padding: 0,
              paddingLeft: { xs: 1, md: 2 },
              mb: 2,
              textAlign: "left",
              boxShadow: "2px 2px 2px #E8F1F5",
              position: "relative",
            }}
          >
            <Autocomplete
              options={["All River Basins", ...filteredRiverBasins]}
              value={tempSelectedRiverBasin}
              onChange={(event, newValue) => {
                setTempSelectedRiverBasin(newValue || "All River Basins");
                setNoStationsInLocation(false);
              }}
              getOptionLabel={(option) => option}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="River Basin"
                  variant="outlined"
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "4px 8px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.9rem",
                        md: isBelow ? "1rem" : "1.1rem",
                        lg: isBelow ? "1rem" : "1.1rem",
                      },
                    },
                    width: "100%",
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-endAdornment": {
                  right: "10px",
                },
              }}
            />
          </Box>
        </Grid>

        {/* Apply filters button */}
        <Grid
          size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
          sx={{
            display: "flex",
            justifyContent: "right",
            alignItems: "stretch",
          }}
        >
          <Button
            onClick={handleApplyFilters}
            disableRipple
            sx={{
              height: { md: 62 },
              paddingY: "9px",
              mb: 2,
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            Apply Filters
          </Button>
        </Grid>

        {/* Clear filters button */}
        <Grid
          size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
          sx={{
            display: "flex",
            justifyContent: "left",
            alignItems: "stretch",
          }}
        >
          <Button
            onClick={handleClearFilters}
            disableRipple
            sx={{
              height: { md: 62 },
              paddingY: "9px",
              mb: 2,
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {/* Map container */}
      <Box
        sx={{
          flex: 1,
          width: "100%",
          height: "calc(100vh - 200px)",
          borderRadius: "12px",
          overflow: "hidden",
          position: "relative",
        }}
      >
        <FloodPredictionMap
          stations={filteredStations}
          selectedLocation={selectedLocation}
          currentLocationCoords={currentLocationCoords}
          focusOnCurrentLocation={focusOnCurrentLocation}
          onLocationFocused={() => setFocusOnCurrentLocation(false)}
          showNoStationsMessage={noStationsInLocation}
          currentLocationState={currentLocationState}
        />
      </Box>

      {/* Snackbar for no stations message */}
      <Snackbar
        open={noStationsInLocation}
        autoHideDuration={6000}
        onClose={() => setNoStationsInLocation(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setNoStationsInLocation(false)} 
          severity="info"
          sx={{ width: '100%' }}
        >
          No monitoring stations found in your current location ({currentLocationState})
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FloodPrediction;