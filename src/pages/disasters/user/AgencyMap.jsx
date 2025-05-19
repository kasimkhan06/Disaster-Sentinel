import React, { useState, useRef, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import {
  TextField,
  IconButton,
  Box,
  Typography,
  Button,
  InputAdornment,
  CircularProgress,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Tooltip,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  MyLocation,
  Directions,
  Close,
  DirectionsCar,
  DirectionsWalk,
  DirectionsBike,
} from "@mui/icons-material";
import axios from "axios";
import { debounce } from "lodash";
import { margin, padding } from "@mui/system";

// Set default marker icon options
// delete L.Icon.Default.prototype._getIconUrl;
// L.Icon.Default.mergeOptions({
//   iconRetinaUrl: markerIcon2x,
//   iconUrl: markerIcon,
//   shadowUrl: markerShadow,
// });

// Custom icons
const agencyIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconRetinaUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const AgencyMap = ({ agency, isMobile }) => {
  const [userPosition, setUserPosition] = useState(null);
  const [inputAddress, setInputAddress] = useState("");
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState("driving-traffic");
  const [trafficDataAvailable, setTrafficDataAvailable] = useState(false);
  const mapRef = useRef();
  const [congestionLevels, setCongestionLevels] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Inside the component, after the state declarations
  const debouncedFetchSuggestions = useRef(
    debounce((query) => fetchSuggestions(query), 300)
  ).current;

  // Clean up the debounce function on unmount
  useEffect(() => {
    return () => {
      debouncedFetchSuggestions.cancel();
    };
  }, [debouncedFetchSuggestions]);

  // Replace with your Mapbox access token
  const MAPBOX_ACCESS_TOKEN =
    "pk.eyJ1Ijoic2FjaGlrYW1hdCIsImEiOiJjbWFhMDhjdmcxdW5yMndzZDNub3R0ZXpkIn0.6hFodsPt3ZRLfRGLIS_Htw";

  if (!agency || !agency.lat || !agency.lng) {
    return (
      <Typography>Location data not available for this agency.</Typography>
    );
  }

  const agencyPosition = [agency.lat, agency.lng];

  const calculateRoute = async (fromPosition, currentProfile = profile) => {
    if (!fromPosition || !agencyPosition) return;
    setLoading(true);
    setError(null); // Clear previous errors before new calculation

    try {
      const from = `${fromPosition[1]},${fromPosition[0]}`;
      const to = `${agencyPosition[1]},${agencyPosition[0]}`;

      console.log("Making request with:", {
        from,
        to,
        profile: currentProfile,
      });

      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/${currentProfile}/${from};${to}`,
        {
          params: {
            geometries: "geojson",
            access_token: MAPBOX_ACCESS_TOKEN,
            overview: "full",
            annotations:
              currentProfile === "driving-traffic" ? "congestion" : undefined,
          },
        }
      );

      console.log("API Response:", response.data);

      if (response.data?.routes?.length > 0) {
        const routeData = response.data.routes[0];
        const routeCoordinates = routeData.geometry.coordinates.map((coord) => [
          coord[1],
          coord[0],
        ]);

        setRoute(routeCoordinates);
        setDistance((routeData.distance / 1000).toFixed(2));
        setDuration(Math.round(routeData.duration / 60));

        if (currentProfile === "driving-traffic") {
          const congestion = routeData.legs?.[0]?.annotation?.congestion || [];
          const hasTrafficData = congestion.some(
            (level) =>
              level && ["low", "moderate", "heavy", "severe"].includes(level)
          );
          setTrafficDataAvailable(hasTrafficData);

          if (hasTrafficData) {
            const severityLevels = {
              severe: 4,
              heavy: 3,
              moderate: 2,
              low: 1,
            };
            let maxSeverity = "low";
            congestion.forEach((level) => {
              if (
                level &&
                severityLevels[level] > severityLevels[maxSeverity]
              ) {
                maxSeverity = level;
              }
            });
            setCongestionLevels(maxSeverity);
          } else {
            setCongestionLevels(null);
          }
        } else {
          setTrafficDataAvailable(false);
          setCongestionLevels(null);
        }
        if (mapRef.current) {
          mapRef.current.fitBounds(L.latLngBounds(routeCoordinates), {
            padding: [50, 50],
          });
        }
      } else {
        throw new Error("No route found in response");
      }
    } catch (err) {
      console.error("Routing error:", err);
      if (err.response?.data?.message?.includes("No route found")) {
        setError(
          "No route available within India for these locations. Please try different locations."
        );
      } else {
        setError(
          "Could not calculate route. Please try different locations within India."
        );
      }

      const newRoute = [fromPosition, agencyPosition];
      setRoute(newRoute);
      const R = 6371;
      const dLat = (agencyPosition[0] - fromPosition[0]) * (Math.PI / 180);
      const dLon = (agencyPosition[1] - fromPosition[1]) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(fromPosition[0] * (Math.PI / 180)) *
          Math.cos(agencyPosition[0] * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      setDistance((R * c).toFixed(2));
      setDuration(null);
      setTrafficDataAvailable(false);
      if (mapRef.current) {
        mapRef.current.fitBounds(L.latLngBounds(newRoute), {
          padding: [50, 50],
        });
      }
      setCongestionLevels({}); // Changed from null to {} to avoid issues with string methods if it's null
    } finally {
      setLoading(false);
    }
  };

  // useEffect to recalculate route when profile changes and userPosition is set
  useEffect(() => {
    if (userPosition && route) {
      // Check if a route already exists, implying a location has been searched
      calculateRoute(userPosition, profile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]); // Only re-run if profile changes. userPosition is accessed directly.

  const handleUseCurrentLocation = () => {
    setLoading(true);
    setError(null);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          setInputAddress(`${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
          calculateRoute([latitude, longitude]);
        },
        (err) => {
          setError(
            "Unable to retrieve your location. Please try again or enter an address."
          );
          setLoading(false);
          console.error("Geolocation error:", err);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  const isLocationInIndia = (coordinates) => {
    const indiaBounds = {
      minLat: 6.0,
      maxLat: 38.0,
      minLng: 68.0,
      maxLng: 98.0,
    };
    const [lat, lng] = coordinates;
    return (
      lat >= indiaBounds.minLat &&
      lat <= indiaBounds.maxLat &&
      lng >= indiaBounds.minLng &&
      lng <= indiaBounds.maxLng
    );
  };

  const handleSearchLocation = async () => {
    if (!inputAddress.trim()) return;
    setLoading(true);
    setError(null);

    try {
      let newPosition;
      const coordRegex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      if (coordRegex.test(inputAddress)) {
        const [lat, lng] = inputAddress.split(",").map(Number);
        newPosition = [lat, lng];
        if (!isLocationInIndia(newPosition)) {
          throw new Error("Location outside India");
        }
      } else {
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            inputAddress
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=IN`
        );
        if (
          response.data &&
          response.data.features &&
          response.data.features.length > 0
        ) {
          const [lng, lat] = response.data.features[0].center;
          newPosition = [lat, lng];
          const context = response.data.features[0].context;
          const isInIndia = context.some(
            (item) =>
              item.id &&
              item.id.startsWith("country.") &&
              item.short_code === "IN"
          );
          if (!isInIndia) {
            throw new Error("Location outside India");
          }
        } else {
          throw new Error("Location not found");
        }
      }
      setUserPosition(newPosition);
      calculateRoute(newPosition);
    } catch (err) {
      setLoading(false);
      if (err.message === "Location outside India") {
        setError("Please enter a location within India only.");
      } else {
        setError("Location not found. Please try a different address.");
      }
      console.error("Location search error:", err);
      // Clear previous route/distance/duration if search fails
      setRoute(null);
      setDistance(null);
      setDuration(null);
      setTrafficDataAvailable(false);
      setCongestionLevels([]);
    }
  };

  const fetchSuggestions = async (query) => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json`,
        {
          params: {
            access_token: MAPBOX_ACCESS_TOKEN,
            country: "IN",
            types: "address,place,locality,neighborhood",
            autocomplete: true,
            limit: 5,
          },
        }
      );
      if (response.data?.features) {
        setSuggestions(
          response.data.features.map((feature) => ({
            id: feature.id,
            name: feature.place_name,
            coordinates: feature.center,
          }))
        );
        setShowSuggestions(true);
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err);
      setSuggestions([]);
    }
  };

  const renderCongestionInfo = () => {
    if (
      profile !== "driving-traffic" ||
      !trafficDataAvailable ||
      !congestionLevels || // check if congestionLevels is null or empty array
      (Array.isArray(congestionLevels) && congestionLevels.length === 0) || // handle empty array case
      (typeof congestionLevels === "object" &&
        Object.keys(congestionLevels).length === 0 &&
        congestionLevels.constructor === Object) // handle empty object case if it was {}
    ) {
      return null;
    }

    const congestionMessages = {
      low: "Light traffic",
      moderate: "Moderate traffic",
      heavy: "Heavy traffic",
      severe: "Severe traffic",
    };

    // Ensure congestionLevels is a string key before accessing messages
    const messageKey =
      typeof congestionLevels === "string" ? congestionLevels : "";
    const message =
      congestionMessages[messageKey] || "Traffic data unavailable";

    return (
      <Typography variant="body2" sx={{ mt: 1 }}>
        Traffic condition:{" "}
        <Typography
          component="span"
          fontWeight="bold"
          sx={{ color: getCongestionColor(congestionLevels) }}
        >
          {message}
        </Typography>
      </Typography>
    );
  };

  const getCongestionColor = (level) => {
    switch (level) {
      case "low":
        return "#4CAF50"; // Green
      case "moderate":
        return "#FFC107"; // Amber
      case "heavy":
        return "#FF9800"; // Orange
      case "severe":
        return "#F44336"; // Red
      default:
        return "#9E9E9E"; // Grey
    }
  };

  const resetSearch = () => {
    setInputAddress("");
    setUserPosition(null);
    setRoute(null);
    setDistance(null);
    setDuration(null);
    setError(null);
    setTrafficDataAvailable(false);
    setCongestionLevels([]);
    if (mapRef.current) {
      mapRef.current.flyTo(agencyPosition, 13);
    }
  };

  const getProfileIcon = () => {
    const iconStyle = {
      fontSize: {
        xs: "0.8rem",
        sm: "0.9rem",
        md: "1.1rem",
      },
      alignSelf: "center",
      paddingBottom: "0.2rem",
    };
    switch (profile) {
      case "driving-traffic":
        return <DirectionsCar sx={iconStyle} />;
      case "walking":
        return <DirectionsWalk sx={iconStyle} />;
      case "cycling":
        return <DirectionsBike sx={iconStyle} />;
      default:
        return <DirectionsCar sx={iconStyle} />;
    }
  };

  const getRouteColor = () => {
    switch (profile) {
      case "walking":
        return "#4CAF50";
      case "cycling":
        return "#FF9800";
      case "driving-traffic":
        return trafficDataAvailable ? "#3F51B5" : "#9E9E9E";
      default:
        return "#3F51B5";
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%", backgroundColor: "white" }}>
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "400px",
          borderRadius: isMobile ? "0px" : "12px",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <MapContainer
          center={agencyPosition}
          zoom={13}
          style={{
            height: "100%",
            width: "100%",
            position: "absolute",
            zIndex: 1,
          }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={agencyPosition} icon={agencyIcon}>
            <Popup>
              <Typography variant="subtitle2">{agency.agency_name}</Typography>
              <Typography variant="body2">
                {agency.address}, {agency.district}, {agency.state}
              </Typography>
            </Popup>
          </Marker>
          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}
          {route && (
            <Polyline
              positions={route}
              color={getRouteColor()}
              weight={6}
              opacity={0.8}
            />
          )}
        </MapContainer>
        {!isMobile && (
          <Box
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              pointerEvents: "none",
              background: `
                linear-gradient(to top, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%),
                linear-gradient(to bottom, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%),
                linear-gradient(to left, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%),
                linear-gradient(to right, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 10%)
              `,
              zIndex: 2,
            }}
          />
        )}
      </Box>

      <Grid container spacing={0} alignItems="center">
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
          <Paper
            sx={{
              p: 2,
              mb: 0,
              border: "none",
              boxShadow: "none",
            }}
          >
            <Grid container spacing={2} alignItems="center">
              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ px: 2 }}>
                <Box sx={{ position: "relative" }}>
                  <TextField
                    fullWidth
                    label="Enter location"
                    variant="outlined"
                    value={inputAddress}
                    onChange={(e) => {
                      setInputAddress(e.target.value);
                      fetchSuggestions(e.target.value);
                      debouncedFetchSuggestions(e.target.value);
                      setError(null);
                    }}
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() =>
                      setTimeout(() => setShowSuggestions(false), 200)
                    }
                    onKeyDown={(e) =>
                      e.key === "Enter" && handleSearchLocation()
                    }
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end">
                            <Tooltip title="Use my current location">
                              <IconButton
                                onClick={handleUseCurrentLocation}
                                edge="end"
                                color="grey"
                              >
                                <MyLocation />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Clear search and route">
                              <IconButton
                                onClick={resetSearch}
                                color="inherit"
                                edge="end"
                              >
                                <Close />
                              </IconButton>
                            </Tooltip>
                          </InputAdornment>
                        ),
                      },
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
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.7rem",
                        md: "0.8rem",
                        lg: "0.9rem",
                      },
                    }}
                  />
                  {showSuggestions && suggestions.length > 0 && (
                    <Paper
                      elevation={3}
                      sx={{
                        position: "absolute",
                        zIndex: 1000, // Ensure suggestions are on top
                        width: "100%",
                        maxHeight: 200,
                        overflow: "auto",
                        mt: 1,
                      }}
                    >
                      {suggestions.map((suggestion) => (
                        <MenuItem
                          key={suggestion.id}
                          onClick={() => {
                            setInputAddress(suggestion.name);
                            const newPos = [
                              suggestion.coordinates[1],
                              suggestion.coordinates[0],
                            ];
                            setUserPosition(newPos);
                            setShowSuggestions(false);
                            calculateRoute(newPos);
                          }}
                          sx={{
                            py: 1,
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.7rem",
                              md: "0.8rem",
                              lg: "0.9rem",
                            },
                          }}
                        >
                          <Typography variant="body2">
                            {suggestion.name}
                          </Typography>
                        </MenuItem>
                      ))}
                    </Paper>
                  )}
                </Box>
              </Grid>
              <Grid size={{ xs: 6, sm: 10, md: 10, lg: 6 }} sx={{ pl: 2 }}>
                <FormControl fullWidth>
                  <Select
                    value={profile}
                    onChange={(e) => {
                      setProfile(e.target.value);
                      // No need to call calculateRoute here, useEffect will handle it
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "white",
                        borderBottom: "1px solid #ccc",
                        borderRadius: 0,
                        "& fieldset": {
                          border: "none",
                        },
                        "&:hover fieldset": {
                          border: "none",
                        },
                        "&.Mui-focused fieldset": {
                          border: "none",
                          borderBottom: "2px solid #1976d2",
                        },
                        "&.Mui-focused": {
                          outline: "none",
                        },
                      },
                      "& .MuiSelect-icon": {
                        color: "rgba(0, 0, 0, 0.54)",
                      },
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.7rem",
                        md: "0.8rem",
                        lg: "0.9rem",
                      },
                    }}
                  >
                    <MenuItem value="driving-traffic">Driving</MenuItem>
                    <MenuItem value="walking">Walking</MenuItem>
                    <MenuItem value="cycling">Cycling</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid size={{ xs: 6, sm: 10, md: 10, lg: 6 }} sx={{ pr: 2 }}>
                <Button
                  fullWidth
                  color="primary"
                  onClick={handleSearchLocation}
                  disabled={loading || !inputAddress.trim()}
                  startIcon={
                    loading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {getProfileIcon()}
                      </Box>
                    )
                  }
                  sx={{
                    textTransform: "uppercase",
                    fontSize: {
                      xs: "0.7rem",
                      sm: "0.7rem",
                      md: "0.8rem",
                      lg: "0.75rem",
                    },
                    "&:hover": {
                      backgroundColor: "transparent", // Keep consistent with other styles
                    },
                  }}
                >
                  {loading ? "Calculating..." : "Find Route"}
                </Button>
              </Grid>
              <Grid size={{ xs: 11, sm: 10, md: 10, lg: 12 }}>
                <Box sx={{ height: 0.5, mt: 1 }}>
                  {" "}
                  {/* Added margin top for spacing */}
                  {error &&
                    !distance && ( // Only show general error if no distance (i.e., route failed completely)
                      <Typography
                        color="error"
                        sx={{
                          mt: 0,
                          textAlign: "center",
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.7rem",
                            md: "0.8rem",
                            lg: "0.75rem",
                          },
                        }}
                      >
                        {error}
                      </Typography>
                    )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
          {distance && (
            <Paper
              sx={{
                py: 2, // Increased padding for better look
                px: 2,
                borderLeft: isMobile ? "none" : "1px solid #ccc",
                borderRadius: 0,
                boxShadow: "none",
                alignSelf: "flex-start",
                mb: isMobile ? 3 : 0,
                height: isMobile ? "auto" : "100%", // Ensure consistent height on desktop
              }}
            >
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="flex-start" // Align items to the top
              >
                <Box sx={{ marginX: 2, flexGrow: 1 }}>
                  {" "}
                  {/* Allow text to take space */}
                  <Typography
                    variant="body1"
                    sx={{
                      fontSize: { xs: "0.79rem", sm: "0.79rem", md: "0.88rem" },
                    }}
                  >
                    Distance to {agency.agency_name}:{" "}
                    <Typography component="span" fontWeight="bold">
                      {distance} km
                    </Typography>
                  </Typography>
                  {duration ? (
                    <Box>
                      <Typography
                        variant="body1"
                        sx={{
                          mt: 1,
                          fontSize: {
                            xs: "0.79rem",
                            sm: "0.79rem",
                            md: "0.88rem",
                          },
                        }}
                      >
                        Estimated travel time:{" "}
                        <Typography component="span" fontWeight="bold">
                          {duration >= 60
                            ? `${Math.floor(duration / 60)} hr ${
                                duration % 60
                              } min`
                            : `${duration} min`}
                        </Typography>
                      </Typography>
                      {profile === "driving-traffic" &&
                        !trafficDataAvailable && (
                          <Typography
                            variant="body2"
                            sx={{
                              mt: 1,
                              fontStyle: "italic",
                              color: "text.secondary",
                              display: "block",
                              fontSize: {
                                xs: "0.68rem",
                                sm: "0.68rem",
                                md: "0.7rem",
                                lg: "0.8rem",
                              },
                            }}
                          >
                            (Live traffic data not available for this route)
                          </Typography>
                        )}
                    </Box>
                  ) : (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      <Directions sx={{ verticalAlign: "middle", mr: 1 }} />
                      Straight-line distance{" "}
                      {error ? `(${error})` : "(no route found)"}
                    </Typography>
                  )}
                  {profile === "cycling" && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        mt: 1,
                        color: "warning.main",
                        fontStyle: "italic",
                      }}
                    >
                      Note: Cycling routes may include bike paths and trails
                    </Typography>
                  )}
                  {profile === "walking" && (
                    <Typography
                      variant="caption"
                      display="block"
                      sx={{
                        mt: 1,
                        color: "info.main",
                        fontStyle: "italic",
                      }}
                    >
                      Note: Walking routes prioritize pedestrian pathways
                    </Typography>
                  )}
                  {renderCongestionInfo()}
                </Box>
                <Tooltip title="Clear search and route">
                  <IconButton
                    onClick={resetSearch}
                    color="inherit"
                    sx={{
                      p: 0,
                      "&:hover": {
                        backgroundColor: "transparent", // No background on hover
                        // Optional: if you want to change the icon color on hover
                        "& .MuiSvgIcon-root": {
                          color: "inherit", // or specify a color like '#000'
                        },
                      },
                    }}
                  >
                    {/* Reduced padding */}
                    <Close />
                  </IconButton>
                </Tooltip>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgencyMap;
