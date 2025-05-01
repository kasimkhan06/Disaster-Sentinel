import { useState, useEffect } from "react";
import {
  Typography,
  Box,
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
import worldMapBackground from "../../dashboard/user/images/world-map-background.jpg";

const FloodPrediction = () => {
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

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedLocation("All States");
    setSelectedRiverBasin("All River Basins");
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

      setSelectedLocation(currentLocationState);
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

  // Update filtered river basins when selected location changes
  useEffect(() => {
    if (selectedLocation !== "All States") {
      const basinsInState = [
        ...new Set(
          stations
            .filter((station) => station.state === selectedLocation)
            .map((station) => station.river_basin)
        ),
      ];
      setFilteredRiverBasins(basinsInState);

      if (
        selectedRiverBasin !== "All River Basins" &&
        !basinsInState.includes(selectedRiverBasin)
      ) {
        setSelectedRiverBasin("All River Basins");
      }
    } else {
      setFilteredRiverBasins(riverBasins);
    }
  }, [selectedLocation, stations, riverBasins]);

  // Update filtered states when selected river basin changes
  useEffect(() => {
    if (selectedRiverBasin !== "All River Basins") {
      const statesInBasin = [
        ...new Set(
          stations
            .filter((station) => station.river_basin === selectedRiverBasin)
            .map((station) => station.state)
        ),
      ];
      setFilteredStates(statesInBasin);

      if (
        selectedLocation !== "All States" &&
        !statesInBasin.includes(selectedLocation)
      ) {
        setSelectedLocation("All States");
      }
    } else {
      setFilteredStates(stateNames);
    }
  }, [selectedRiverBasin, stations, stateNames]);

  if (error) {
    return <Typography align="center">Error: {error.message}</Typography>;
  }

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        minHeight: "100vh",
        background: `
          linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
          url(${worldMapBackground})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        margin: 0,
        paddingX: 3,
        zIndex: 0,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          flexShrink: 0,
          width: "100%",
          px: 3,
        }}
      >
        <Typography
          align="center"
          sx={{
            pt: "17px",
            pb: "5px",
            mt: 8,
            mb: 1,
            fontSize: {
              xs: "1rem",
              sm: "1.2rem",
              md: isBelow ? "1.2rem" : "1.4rem",
              lg: isBelow ? "1.2rem" : "1.4rem",
            },
            fontWeight: "700",
            color: "rgba(0, 0, 0, 0.87)",
            position: "relative",
            zIndex: 1,
          }}
        >
          STATION INFORMATION
        </Typography>

        {/* Filter controls */}
        <Grid
          container
          spacing={1}
          sx={{
            mb: 0,
            width: {
              xs: "100%",
              sm: "90%",
              md: "83%",
              lg: isBelow ? "40%" : "45%",
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
                position: "relative",
              }}
            >
              <Autocomplete
                options={["All States", ...filteredStates]}
                value={selectedLocation}
                onChange={(event, newValue) => {
                  setSelectedLocation(newValue || "All States");
                  setNoStationsInLocation(false);
                }}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
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
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        "& fieldset": {
                          borderColor: "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: "transparent",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "transparent",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                        },
                        "&:focus": {
                          outline: "none",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "inherit",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.8rem",
                          md: isBelow ? "0.9rem" : "1rem",
                          lg: isBelow ? "0.9rem" : "1rem",
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
                position: "relative",
              }}
            >
              <Autocomplete
                options={["All River Basins", ...filteredRiverBasins]}
                value={selectedRiverBasin}
                onChange={(event, newValue) => {
                  setSelectedRiverBasin(newValue || "All River Basins");
                  setNoStationsInLocation(false);
                }}
                getOptionLabel={(option) => option}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    variant="outlined"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                        "& fieldset": {
                          borderColor: "transparent",
                        },
                        "&:hover fieldset": {
                          borderColor: "transparent",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                        },
                        "&.Mui-focused fieldset": {
                          borderColor: "transparent",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                        },
                      },
                      "& .MuiInputLabel-root": {
                        color: "inherit",
                      },
                      "& .MuiInputBase-input": {
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.8rem",
                          md: isBelow ? "0.9rem" : "1rem",
                          lg: isBelow ? "0.9rem" : "1rem",
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

          {/* Clear filters button */}
          <Grid
            size={{ xs: 12, sm: 12, md: 4, lg: 3 }}
            sx={{
              display: "flex",
              justifyContent: "center",
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
                "&:hover": {
                  backgroundColor: "transparent",
                },
                width: { xs: "50%", sm: "40%", md: "60%", lg: "100%" },
              }}
            >
              Clear Filters
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Map container */}
      <Box
        sx={{
          flex: 1,
          position: "relative",
          mx:3,
          marginX: "auto",
          mb: 4,
          overflow: "hidden",
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: "white",
          p: 1,
          width: "75%",
        }}
      >
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <Typography>Loading map data...</Typography>
          </Box>
        ) : (
          <FloodPredictionMap
            stations={filteredStations}
            selectedLocation={selectedLocation}
            currentLocationCoords={currentLocationCoords}
            focusOnCurrentLocation={focusOnCurrentLocation}
            onLocationFocused={() => setFocusOnCurrentLocation(false)}
            showNoStationsMessage={noStationsInLocation}
            currentLocationState={currentLocationState}
          />
        )}
      </Box>

      {/* Snackbar for no stations message */}
      <Snackbar
        open={noStationsInLocation}
        autoHideDuration={6000}
        onClose={() => setNoStationsInLocation(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setNoStationsInLocation(false)}
          severity="info"
          sx={{ width: "100%" }}
        >
          No monitoring stations found in your current location (
          {currentLocationState})
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FloodPrediction;