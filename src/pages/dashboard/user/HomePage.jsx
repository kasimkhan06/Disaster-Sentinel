import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Marquee from "react-fast-marquee";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import WarningIcon from "@mui/icons-material/Warning";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import DisasterMap from "../../disasters/user/DisasterMap";
import worldMapBackground from "./images/world-map-background.jpg"; // Adjust path

function HomePage() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow = useMediaQuery("(max-width:1470px)");

  // State for recent disasters (will be fetched from API)
  const [recentDisasters, setRecentDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);

  // Fetch recent disasters from API
  useEffect(() => {
    const fetchRecentDisasters = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(
          "https://api.example.com/disasters/recent"
        );
        const data = await response.json();
        setRecentDisasters(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent disasters:", error);
        setLoading(false);
      }
    };

    fetchRecentDisasters();
  }, []);

  // Handle disaster selection (for both map markers and table rows)
  const handleDisasterSelect = (disaster) => {
    setSelectedDisaster(disaster);
    // Navigate to disaster details page
    // You would typically use navigate() from react-router here
    // navigate(`/disasters/${disaster.id}`);
  };

  // Mock data for demonstration (replace with actual API data)
  const mockDisasters = [
    {
      id: 1,
      title: "M7.7 in Myanmar - Copernicus EMS activation",
      date: "2023-11-15",
      location: "Myanmar",
      type: "Earthquake",
      magnitude: "7.7",
      coordinates: [21.9162, 95.956], // [lat, lng]
      details:
        "Earthquake with magnitude 7.7 in Myanmar. Copernicus EMS activated.",
    },
    {
      id: 2,
      title: "Floods and flash floods",
      date: "2023-11-10",
      location: "Philippines",
      type: "Flood",
      severity: "Severe",
      coordinates: [12.8797, 121.774], // [lat, lng]
      details: "Severe flooding reported in multiple regions.",
    },
    {
      id: 2,
      title: "Floods and flash floods",
      date: "2023-11-10",
      location: "Philippines",
      type: "Flood",
      severity: "Severe",
      coordinates: [12.8797, 121.774], // [lat, lng]
      details: "Severe flooding reported in multiple regions.",
    },
    {
      id: 2,
      title: "Floods and flash floods",
      date: "2023-11-10",
      location: "Philippines",
      type: "Flood",
      severity: "Severe",
      coordinates: [12.8797, 121.774], // [lat, lng]
      details: "Severe flooding reported in multiple regions.",
    },
    {
      id: 2,
      title: "Floods and flash floods",
      date: "2023-11-10",
      location: "Philippines",
      type: "Flood",
      severity: "Severe",
      coordinates: [12.8797, 121.774], // [lat, lng]
      details: "Severe flooding reported in multiple regions.",
    },
    {
      id: 2,
      title: "Floods and flash floods",
      date: "2023-11-10",
      location: "Philippines",
      type: "Flood",
      severity: "Severe",
      coordinates: [12.8797, 121.774], // [lat, lng]
      details: "Severe flooding reported in multiple regions.",
    },
    // Add more mock disasters as needed
  ];

  // Use mock data if API is not available
  useEffect(() => {
    if (recentDisasters.length === 0 && !loading) {
      setRecentDisasters(mockDisasters);
    }
  }, [loading, recentDisasters]);

  return (
    <Box
  sx={{
    position: "absolute", // Changed back from fixed to relative
    top: 0,
    left: 0,
    right: 0,
    minHeight: "100vh",
    backgroundImage: `url(${worldMapBackground})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed", // Keeps background fixed while scrolling
    backgroundRepeat: "repeat-y", // Repeats vertically when content exceeds viewport
    margin: 0,
    padding: 0,
    "&::before": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(255, 255, 255, 0.85)",
      zIndex: 0,
    },
  }}
>
<Container 
  maxWidth={false} 
  sx={{ 
    mt: "100px", 
    mb: 4, 
    width: "75%",
    padding: 0,
    marginLeft: "auto", // Centers the container
    marginRight: "auto",
  }}
>
        <Grid container spacing={1}>
          {/* Marquee for most recent disaster */}
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card
              sx={{
                borderRadius: 0,
                boxShadow: 0,
                border: "none",
                background: "transparent",
                width:"75%",
                margin: "0 auto",
              }}
            >
              <CardContent
                sx={{
                  py: 1,
                  backgroundColor: "transparent",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  "&.MuiCardContent-root": {
                    paddingBottom: "8px",
                  },
                  border: "none",
                  boxShadow: "none",
                }}
              >
                {/* Ribbon-style "LATEST" label */}
                <Box
                  sx={{
                    position: "relative",
                    height: "36px",
                    backgroundColor: "#93A6AD",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                    mr: 2,
                    // "&:before": {
                    //   content: '""',
                    //   position: "absolute",
                    //   left: "-10px",
                    //   bottom: 0,
                    //   width: 0,
                    //   height: 0,
                    //   borderRight: "10px solid #93A6AD",
                    //   borderTop: "18px solid transparent",
                    //   borderBottom: "18px solid transparent",
                    // },
                    "&:after": {
                      content: '""',
                      position: "absolute",
                      right: "-10px",
                      bottom: 0,
                      width: 0,
                      height: 0,
                      borderLeft: "10px solid #93A6AD ",
                      borderTop: "18px solid transparent",
                      borderBottom: "18px solid transparent",
                    },
                  }}
                >
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "rgb(255, 255, 255)",
                      position: "relative",
                      zIndex: 1,
                    }}
                  >
                    LATEST:
                  </Typography>
                </Box>

                {/* Scrolling content container */}
                <Box
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    border: "none",
                  }}
                >
                  {/* Scrolling content */}
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      color: "black",
                      display: "inline-block",
                      whiteSpace: "nowrap",
                      paddingLeft: "100%",
                      animation: "scroll 15s linear infinite",
                      "@keyframes scroll": {
                        "0%": { transform: "translateX(0)" },
                        "100%": { transform: "translateX(-100%)" },
                      },
                      border: "none",
                    }}
                  >
                    {recentDisasters.length > 0
                      ? `${recentDisasters[0].title} in ${recentDisasters[0].location} - ${recentDisasters[0].date}`
                      : "Loading latest disaster information..."}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Map Section (75% width) */}
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
              <CardContent
                sx={{
                  p: 0,
                  height: "100%",
                  "&.MuiCardContent-root": {
                    paddingBottom: "0px", // or whatever value you prefer
                  },
                }}
              >
                <Box sx={{ height: "500px", width: "100%" }}>
                  <DisasterMap
                    disasters={recentDisasters}
                    onMarkerClick={handleDisasterSelect}
                    selectedDisaster={selectedDisaster}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Disasters Table (25% width) */}
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card sx={{ borderRadius: 2, boxShadow: 3, height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <WarningIcon
                    sx={{ mr: 1, color: theme.palette.error.main }}
                  />
                  <Typography variant="h6" sx={{ fontWeight: "500" }}>
                    Recent Disasters
                  </Typography>
                </Box>

                {loading ? (
                  <Typography>Loading recent disasters...</Typography>
                ) : (
                  <TableContainer
                    component={Paper}
                    sx={{ maxHeight: "500px", overflow: "auto" }}
                  >
                    <Table size="small" stickyHeader>
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {recentDisasters.map((disaster) => (
                          <TableRow
                            key={disaster.id}
                            hover
                            onClick={() => handleDisasterSelect(disaster)}
                            sx={{
                              cursor: "pointer",
                              backgroundColor:
                                selectedDisaster?.id === disaster.id
                                  ? theme.palette.action.selected
                                  : "inherit",
                            }}
                          >
                            <TableCell>{disaster.title}</TableCell>
                            <TableCell>{disaster.location}</TableCell>
                            <TableCell>{disaster.type}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Source Attribution */}
          <Grid xs={12}>
            <Typography variant="caption" sx={{ fontStyle: "italic" }}>
              Source: Map of disaster within the past 6 days, European Union,
              2015. Map produced by F.C.RoC. The designation and the
              presentation of material on the map do not imply the expression of
              any opinion whatsoever on the part of the European Union
              concerning the legal status of any country, territory or area or
              of its authorities, or concerning the delimitation of its
              frontiers or boundaries.
            </Typography>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
