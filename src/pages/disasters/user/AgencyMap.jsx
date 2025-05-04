import React, { useState, useRef } from "react";
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

// Set default marker icon options
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Custom icons
const agencyIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const userIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const AgencyMap = ({ agency }) => {
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

  // Replace with your Mapbox access token
  const MAPBOX_ACCESS_TOKEN = "pk.eyJ1Ijoic2FjaGlrYW1hdCIsImEiOiJjbWFhMDhjdmcxdW5yMndzZDNub3R0ZXpkIn0.6hFodsPt3ZRLfRGLIS_Htw";

  if (!agency || !agency.lat || !agency.lng) {
    return (
      <Typography>Location data not available for this agency.</Typography>
    );
  }

  const agencyPosition = [agency.lat, agency.lng];

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

  const handleSearchLocation = async () => {
    if (!inputAddress.trim()) return;

    setLoading(true);
    setError(null);

    try {
      let newPosition;

      // Check if input is coordinates
      const coordRegex =
        /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
      if (coordRegex.test(inputAddress)) {
        const [lat, lng] = inputAddress.split(",").map(Number);
        newPosition = [lat, lng];
      } else {
        // Geocode the address using Mapbox
        const response = await axios.get(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
            inputAddress
          )}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
        );

        if (
          response.data &&
          response.data.features &&
          response.data.features.length > 0
        ) {
          const [lng, lat] = response.data.features[0].center;
          newPosition = [lat, lng];
        } else {
          throw new Error("Location not found");
        }
      }

      setUserPosition(newPosition);
      calculateRoute(newPosition);
    } catch (err) {
      setError("Location not found. Please try a different address.");
      console.error("Location search error:", err);
      setLoading(false);
    }
  };

  const calculateRoute = async (fromPosition) => {
    if (!fromPosition || !agencyPosition) return;
  
    try {
      // Note: Mapbox expects coordinates in [lng, lat] order
      const from = `${fromPosition[1]},${fromPosition[0]}`;
      const to = `${agencyPosition[1]},${agencyPosition[0]}`;
      
      console.log("Making request with:", { from, to, profile }); // Debug log
  
      const response = await axios.get(
        `https://api.mapbox.com/directions/v5/mapbox/${profile}/${from};${to}`,
        {
          params: {
            geometries: 'geojson',
            access_token: MAPBOX_ACCESS_TOKEN,
            overview: 'full',
            annotations: profile === "driving-traffic" ? 'congestion' : undefined
          }
        }
      );
  
      console.log("API Response:", response.data); // Debug log
  
      if (response.data?.routes?.length > 0) {
        const routeData = response.data.routes[0];
        const routeCoordinates = routeData.geometry.coordinates.map(coord => [coord[1], coord[0]]);
        
        setRoute(routeCoordinates);
        setDistance((routeData.distance / 1000).toFixed(2));
        setDuration(Math.round(routeData.duration / 60));
  
        if (profile === "driving-traffic") {
          const congestion = routeData.legs?.[0]?.annotation?.congestion || [];
          const hasTrafficData = congestion.some(
            level => level && ["low", "moderate", "heavy", "severe"].includes(level)
          );
          setTrafficDataAvailable(hasTrafficData);
          
          // Determine overall traffic condition
          if (hasTrafficData) {
            const severityLevels = {
              severe: 4,
              heavy: 3,
              moderate: 2,
              low: 1
            };
            
            // Find the highest severity level present
            let maxSeverity = 'low';
            congestion.forEach(level => {
              if (level && severityLevels[level] > severityLevels[maxSeverity]) {
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
          mapRef.current.fitBounds(L.latLngBounds(routeCoordinates), { padding: [50, 50] });
        }
      } else {
        throw new Error("No route found in response");
      }
    } catch (err) {
      console.error("Routing error:", err);
      setError("Could not calculate route. Please try different locations.");
  
      // Fallback to straight line
      const newRoute = [fromPosition, agencyPosition];
      setRoute(newRoute);
      
      // Haversine formula for straight-line distance
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
        mapRef.current.fitBounds(L.latLngBounds(newRoute), { padding: [50, 50] });
      }
      setCongestionLevels({});
    } finally {
      setLoading(false);
    }
  };
  const renderCongestionInfo = () => {
    if (profile !== "driving-traffic" || !trafficDataAvailable || !congestionLevels) {
      return null;
    }
  
    const congestionMessages = {
      low: "Light traffic",
      moderate: "Moderate traffic",
      heavy: "Heavy traffic",
      severe: "Severe traffic"
    };
  
    return (
      <Typography variant="body2" sx={{ mt: 1 }}>
        Traffic condition:{" "}
        <Typography component="span" fontWeight="bold" sx={{ color: getCongestionColor(congestionLevels) }}>
          {congestionMessages[congestionLevels]}
        </Typography>
      </Typography>
    );
  };
  
  const getCongestionColor = (level) => {
    switch (level) {
      case 'low': return '#4CAF50'; // Green
      case 'moderate': return '#FFC107'; // Amber
      case 'heavy': return '#FF9800'; // Orange
      case 'severe': return '#F44336'; // Red
      default: return '#9E9E9E'; // Grey
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
    switch (profile) {
      case "driving-traffic":
        return <DirectionsCar />;
      case "walking":
        return <DirectionsWalk />;
      case "cycling":
        return <DirectionsBike />;
      default:
        return <DirectionsCar />;
    }
  };

  const getRouteColor = () => {
    switch (profile) {
      case "walking":
        return "#4CAF50"; // Green
      case "cycling":
        return "#FF9800"; // Orange
      case "driving-traffic":
        return trafficDataAvailable ? "#3F51B5" : "#9E9E9E"; // Blue or Gray
      default:
        return "#3F51B5"; // Default blue
    }
  };

  return (
    <Box sx={{ width: "100%", height: "100%" }}>
      {/* Map Container */}
      <Box
        sx={{
          position: "relative",
          width: "100%",
          height: "400px",
          borderRadius: "12px",
          overflow: "hidden",
          mb: 2,
        }}
      >
        <MapContainer
          center={agencyPosition}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          ref={mapRef}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Agency Marker - Always visible */}
          <Marker position={agencyPosition} icon={agencyIcon}>
            <Popup>
              <Typography variant="subtitle2">{agency.agency_name}</Typography>
              <Typography variant="body2">
                {agency.address}, {agency.district}, {agency.state}
              </Typography>
            </Popup>
          </Marker>

          {/* User Location Marker - Only shown after search */}
          {userPosition && (
            <Marker position={userPosition} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
          )}

          {/* Route between points - Only shown after search */}
          {route && (
            <Polyline
              positions={route}
              color={getRouteColor()}
              weight={6}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </Box>

      {/* Location Search Controls */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          borderRadius: 2,
          backgroundColor: "background.paper",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Enter your location or coordinates"
              variant="outlined"
              value={inputAddress}
              onChange={(e) => setInputAddress(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSearchLocation()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleUseCurrentLocation}
                      edge="end"
                      color="primary"
                    >
                      <MyLocation />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth>
              <InputLabel>Travel Mode</InputLabel>
              <Select
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
                label="Travel Mode"
              >
                <MenuItem value="driving-traffic">Driving</MenuItem>
                <MenuItem value="walking">Walking</MenuItem>
                <MenuItem value="cycling">Cycling</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button
              fullWidth
              variant="contained"
              color="primary"
              onClick={handleSearchLocation}
              disabled={loading || !inputAddress.trim()}
              startIcon={
                loading ? <CircularProgress size={20} /> : getProfileIcon()
              }
            >
              {loading ? "Calculating..." : "Find Route"}
            </Button>
          </Grid>
        </Grid>

        {error && (
          <Typography color="error" sx={{ mt: 1 }}>
            {error}
          </Typography>
        )}
      </Paper>

      {/* Route Information - Only shown when route is calculated */}
      {distance && (
  <Paper
    elevation={2}
    sx={{
      p: 2,
      mb: 2,
      borderRadius: 2,
      backgroundColor: "primary.light",
      color: "primary.contrastText",
    }}
  >
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="flex-start"
    >
      <Box>
              <Typography variant="body1">
                Distance to {agency.agency_name}:{" "}
                <Typography component="span" fontWeight="bold">
                  {distance} km
                </Typography>
              </Typography>
              {duration ? (
                <Typography variant="body1" sx={{ mt: 1 }}>
                  Estimated travel time:{" "}
                  <Typography component="span" fontWeight="bold">
                    {duration} minutes
                  </Typography>
                  {profile === "driving-traffic" && !trafficDataAvailable && (
                    <Typography
                      component="span"
                      sx={{
                        ml: 2,
                        fontStyle: "italic",
                        fontSize: "0.9rem",
                      }}
                    >
                      (Live traffic data not available for this route)
                    </Typography>
                  )}
                </Typography>
              ) : (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  <Directions sx={{ verticalAlign: "middle", mr: 1 }} />
                  Straight-line distance (no route found)
                </Typography>
              )}
              {profile === "cycling" && (
                <Typography variant="caption" display="block" sx={{ 
                  mt: 1,
                  color: 'warning.main',
                  fontStyle: 'italic'
                }}>
                  Note: Cycling routes may include bike paths and trails
                </Typography>
              )}
              {profile === "walking" && (
                <Typography variant="caption" display="block" sx={{ 
                  mt: 1,
                  color: 'info.main',
                  fontStyle: 'italic'
                }}>
                  Note: Walking routes prioritize pedestrian pathways
                </Typography>
              )}
               {renderCongestionInfo()}
            </Box>
            <IconButton onClick={resetSearch} color="inherit">
              <Close />
            </IconButton>
          </Box>
        </Paper>
      )}
    </Box>
  );
};

export default AgencyMap;