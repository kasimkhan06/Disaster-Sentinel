import { useState, useEffect, useMemo, useRef } from "react";
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
import Map from "./Map";
import worldMapBackground from "/assets/Background Image/world-map-background.jpg";

function HomePage() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow = useMediaQuery("(max-width:1470px)");

  // State for recent disasters (will be fetched from API)
  const [recentDisasters, setRecentDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);

  // Calculate sliced disasters (5 per type) to be used in both the list and map
  const slicedDisasters = useMemo(() => {
    const disastersByType = recentDisasters.reduce((acc, disaster) => {
      if (!acc[disaster.eventtype]) {
        acc[disaster.eventtype] = [];
      }
      acc[disaster.eventtype].push(disaster);
      return acc;
    }, {});

    // Get top 5 disasters per type and flatten the array
    return Object.values(disastersByType).flatMap((disasters) =>
      disasters.slice(0, 5)
    );
  }, [recentDisasters]);

  // Fetch recent disasters from API
  useEffect(() => {
    const fetchRecentDisasters = async () => {
      try {
        // Replace with your actual API call
        const response = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/disasters/"
        );
        const data = await response.json();
        console.log("Fetched recent disasters:", data);
        setRecentDisasters(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching recent disasters:", error);
        setLoading(false);
      }
    };

    fetchRecentDisasters();
  }, []);

  const [highlightedDisaster, setHighlightedDisaster] = useState(null);

  // Add this near the top of your component, before the HomePage function
  const disasterTypeMap = {
    EQ: "Earthquake",
    FL: "Flood",
    WF: "Wildfire",
    TC: "Tropical Cyclone",
    VO: "Volcano",
    DR: "Drought",
    // Add other mappings as needed
  };

  const mapContainerRef = useRef(null);

  const handleDisasterSelect = (disaster) => {
    setSelectedDisaster(disaster);
    setHighlightedDisaster(disaster);

    // Scroll to map container
    if (mapContainerRef.current) {
      mapContainerRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }

    // Remove highlight after 3 seconds
    setTimeout(() => {
      setHighlightedDisaster(null);
    }, 10000);
  };

  // Get the 3 most recent disasters for the marquee
  const recentDisastersForMarquee = recentDisasters.slice(0, 3);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
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
        padding: 0,
        zIndex: 0, // Only needed if you have other elements with zIndex
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          mt: "100px",
          mb: 4,
          width: { sm: "90%", md: "85%", lg: "75%" },
          padding: 0,
          marginLeft: "auto", // Centers the container
          marginRight: "auto",
        }}
      >
        <Grid container spacing={1}>
          {/* Marquee for most recent disasters */}
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card
              sx={{
                borderRadius: 0,
                boxShadow: 0,
                border: "none",
                background: "transparent",
                width: "100%",
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
                {/* Scrolling content container */}
                <Box
                  sx={{
                    width: "100%",
                    overflow: "hidden",
                    position: "relative",
                    border: "none",
                  }}
                >
                  {/* Scrolling content using react-fast-marquee */}
                  <Marquee speed={50} gradient={false}>
                    {recentDisastersForMarquee.map((disaster, index) => (
                      <Box
                        key={disaster.id}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          // Add equal padding on both sides of each item
                          px: 3, // This creates equal space on both sides
                        }}
                      >
                        <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "6px", // Fixed width for the bullet container
                              mx: 1, // This creates equal space around the bullet
                            }}
                          >
                            •
                          </Box>
                        <Typography
                          variant="h6"
                          sx={{
                            fontWeight: "bold",
                            color: "rgba(45, 45, 68, 0.87)",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {disaster.title} - {disaster.pubDate}
                        </Typography>
                        {/* Only show bullet if not the last item */}
                        {/* {index < recentDisastersForMarquee.length - 1 && (
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: "6px", // Fixed width for the bullet container
                              mx: 1, // This creates equal space around the bullet
                            }}
                          >
                            •
                          </Box>
                        )} */}
                      </Box>
                      
                    ))}
                  </Marquee>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Map Section (75% width) */}
          <Grid
            size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
            sx={{
              mb: 2, // or whatever value you prefer
            }}
            ref={mapContainerRef}
          >
            <Card
              sx={{ borderRadius: 2, boxShadow: 3, height: "100%", padding: 1 }}
            >
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
                    <Map
                      disasters={slicedDisasters}
                      onMarkerClick={handleDisasterSelect}
                      selectedDisaster={selectedDisaster}
                      highlightedDisaster={highlightedDisaster}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Disasters Grid organized by disaster types */}
          <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
            <Card
              sx={{
                borderRadius: 2,
                boxShadow: 3,
                height: "100%",
              }}
            >
              <CardContent>
                {loading ? (
                  <Typography sx={{ color: "text.primary" }}>
                    Loading recent disasters...
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      display: "grid",
                      gap: "5px",
                      width: "100%",
                      alignItems: "stretch",
                      overflowX: "hidden",
                      gridTemplateColumns: {
                        xs: "1fr", // stack on small screens
                        sm: "repeat(auto-fit, minmax(200px, 1fr))",
                        md: "repeat(auto-fit, minmax(180px, 1fr))",
                        lg: "repeat(auto-fit, minmax(150px, 1fr))",
                      },
                    }}
                  >
                    {/* Group disasters by type */}
                    {Object.entries(
                      recentDisasters.reduce((acc, disaster) => {
                        if (!acc[disaster.eventtype]) {
                          acc[disaster.eventtype] = [];
                        }
                        acc[disaster.eventtype].push(disaster);
                        return acc;
                      }, {})
                    ).map(([type, disasters]) => (
                      <Card
                        key={type}
                        sx={{
                          height: "100%",
                          display: "flex",
                          flexDirection: "column",
                          border: "none",
                          borderRadius: 0,
                          boxShadow: "none",
                        }}
                      >
                        <CardContent
                          sx={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            p: 1,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: "bold",
                              mb: 2,
                              color: "rgba(84, 91, 100, 0.87)",
                              position: "relative",
                              zIndex: 1,
                              borderBottom: `2px solid rgba(190, 209, 233, 0.87)`,
                              pb: 1,
                              wordBreak: "break-word",
                              textTransform: "uppercase",
                              fontSize: {
                                xs: "0.6rem",
                                sm: "0.7rem",
                                md: isBelow ? "0.8rem" : "0.9rem",
                                lg: isBelow ? "0.8rem" : "0.9rem",
                              },
                            }}
                          >
                            {disasterTypeMap[type] || type}
                          </Typography>

                          <Box sx={{ flex: 1, overflow: "auto" }}>
                            <List dense sx={{ p: 0 }}>
                              {disasters.slice(0, 5).map((disaster) => (
                                <ListItem
                                  key={disaster.id}
                                  button
                                  onClick={() => handleDisasterSelect(disaster)}
                                  sx={{
                                    mb: 1,
                                    borderRadius: 0,
                                    "&:hover": {
                                      backgroundColor:
                                        theme.palette.action.hover,
                                    },
                                    alignItems: "flex-start",
                                    "&.MuiListItem-dense": {
                                      paddingLeft: "3px",
                                    },
                                    borderBottom:
                                      "0.5px solid rgb(235, 232, 232)",
                                    pb: 1,
                                  }}
                                >
                                  <ListItemText
                                    primary={
                                      <Typography
                                        sx={{
                                          whiteSpace: "normal",
                                          wordBreak: "break-word",
                                          color: "text.primary",
                                          fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.7rem",
                                            md: isBelow ? "0.8rem" : "0.85rem",
                                            lg: isBelow ? "0.8rem" : "0.85rem",
                                          },
                                          fontWeight: "700",
                                        }}
                                      >
                                        {disaster.title}
                                      </Typography>
                                    }
                                    secondary={
                                      <>
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          color="text.secondary"
                                          display="block"
                                          sx={{
                                            whiteSpace: "normal",
                                            fontSize: {
                                              xs: "0.55rem",
                                              sm: "0.6rem",
                                              md: isBelow
                                                ? "0.6rem"
                                                : "0.75rem",
                                              lg: isBelow
                                                ? "0.6rem"
                                                : "0.75rem",
                                            },
                                          }}
                                        >
                                          {disaster.pubDate}
                                        </Typography>
                                        <Typography
                                          component="span"
                                          variant="body2"
                                          color="text.secondary"
                                          sx={{
                                            whiteSpace: "normal",
                                            fontSize: {
                                              xs: "0.55rem",
                                              sm: "0.6rem",
                                              md: isBelow
                                                ? "0.7rem"
                                                : "0.75rem",
                                              lg: isBelow
                                                ? "0.7rem"
                                                : "0.75rem",
                                            },
                                          }}
                                        >
                                          {disaster.country}
                                        </Typography>
                                      </>
                                    }
                                    sx={{ my: 0 }}
                                  />
                                </ListItem>
                              ))}
                            </List>
                          </Box>
                        </CardContent>
                      </Card>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default HomePage;
