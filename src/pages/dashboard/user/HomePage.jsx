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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Marquee from "react-fast-marquee";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import WarningIcon from "@mui/icons-material/Warning";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DisasterMap from "../../disasters/user/DisasterMap";
import Map from "./Map";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import Footer from "../../../components/Footer";

function HomePage() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const isBelow = useMediaQuery("(max-width:1470px)");

  // State for recent disasters (will be fetched from API)
  const [recentDisasters, setRecentDisasters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDisaster, setSelectedDisaster] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

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

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  // Get the 3 most recent disasters for the marquee
  const recentDisastersForMarquee = recentDisasters.slice(0, 3);

  // Group disasters by type
  const disastersByType = recentDisasters.reduce((acc, disaster) => {
    if (!acc[disaster.eventtype]) {
      acc[disaster.eventtype] = [];
    }
    acc[disaster.eventtype].push(disaster);
    return acc;
  }, {});

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
        zIndex: 0,
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          mt: isMobileOrTablet ? "70px" : "100px",
          mb: 4,
          width: { sm: "90%", md: "85%", lg: "75%" },
          padding: 0,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
        <Grid container spacing={1}>
          {/* Marquee for most recent disasters - Positioned absolutely on mobile */}
          <Grid
            size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
            sx={{
              position: isMobileOrTablet ? "relative" : "static",
              zIndex: isMobileOrTablet ? 2 : "auto",
              mb: isMobileOrTablet ? -5 : 0,
              mt: isMobileOrTablet ? "20px" : 0,
            }}
          >
            <Card
              sx={{
                borderRadius: 0,
                boxShadow: 0, // No shadow only on mobile
                border: "none",
                // background: isMobileOrTablet
                //   ? "transparent"
                //   : "rgba(255, 255, 255, 0.9)",
                background: "transparent",

                width: "100%",
                margin: "0 auto",
              }}
            >
              <CardContent
                sx={{
                  py: 1,
                  backgroundColor: isMobileOrTablet
                    ? "rgba(255, 255, 255, 0.7)"
                    : "transparent",
                  display: "flex",
                  alignItems: "center",
                  overflow: "hidden",
                  "&.MuiCardContent-root": {
                    paddingBottom: "8px",
                  },
                  border: "none",
                  boxShadow: "none",
                  borderRadius: isMobileOrTablet ? "4px" : 0,
                  mx: isMobileOrTablet ? 2 : 0,
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
                          px: 3,
                        }}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: "6px",
                            mx: 1,
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
                            fontSize: isMobileOrTablet ? "0.9rem" : "inherit",
                          }}
                        >
                          {disaster.title} - {disaster.pubDate}
                        </Typography>
                      </Box>
                    ))}
                  </Marquee>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          {/* Map Section */}
          <Grid
            size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
            sx={{
              mb: 2,
              height: isMobileOrTablet ? "400px" : "500px",
              mt: isMobileOrTablet ? "-30px" : 0, // Only negative margin on mobile
              position: "relative",
              zIndex: 1,
            }}
            ref={mapContainerRef}
          >
            <Card
              sx={{
                borderRadius: isMobileOrTablet ? 0 : 2,
                boxShadow: isMobileOrTablet? 0 : 3,
                height: "100%",
                padding: isMobileOrTablet ? 0 : 1,
                overflow: "hidden",
              }}
            >
              <CardContent
                sx={{
                  p: 0,
                  height: "100%",
                  "&.MuiCardContent-root": {
                    paddingBottom: "0px",
                  },
                }}
              >
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    position: "relative",
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
                    <Map
                      disasters={slicedDisasters}
                      onMarkerClick={handleDisasterSelect}
                      selectedDisaster={selectedDisaster}
                      highlightedDisaster={highlightedDisaster}
                      isMobile={isMobileOrTablet}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Disasters Grid - Mobile Accordion View */}
          {isMobileOrTablet ? (
            <Grid item xs={12} sx={{ background: "transparent", px: 1 }}>
              <Card
                sx={{
                  border: "none",
                  borderRadius: 0,
                  boxShadow: "none",
                  height: "100%",
                  background: "transparent",
                }}
              >
                <CardContent sx={{ border: "none" }}>
                  {loading ? (
                    <Typography sx={{ color: "text.primary" }}>
                      Loading recent disasters...
                    </Typography>
                  ) : (
                    <Box sx={{ width: "100%" }}>
                      {Object.entries(disastersByType).map(
                        ([type, disasters]) => (
                          <Accordion
                            key={type}
                            expanded={expandedAccordion === type}
                            onChange={handleAccordionChange(type)}
                            sx={{
                              mb: 1,
                              boxShadow: "none",
                              backgroundColor: "rgba(255, 255, 255, 0.67)",
                              transition: "none",
                              "&.Mui-expanded": {
                                margin: "0",
                                minHeight: "48px",
                              },
                              "&:before": {
                                display: "none",
                              },
                            }}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                backgroundColor: "rgb(255, 255, 255)",
                                minHeight: "48px !important",
                                "&.Mui-expanded": {
                                  minHeight: "48px !important",
                                },
                                "& .MuiAccordionSummary-content": {
                                  margin: "12px 0",
                                  "&.Mui-expanded": {
                                    margin: "12px 0",
                                  },
                                },
                              }}
                            >
                              <Typography
                                sx={{
                                  fontWeight: "bold",
                                  color: "rgba(84, 91, 100, 0.87)",
                                  textTransform: "uppercase",
                                  fontSize: "0.85rem",
                                }}
                              >
                                {disasterTypeMap[type] || type}
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{
                                p: 0,
                                backgroundColor: "rgb(255, 255, 255)",
                              }}
                            >
                              <Box
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "repeat(2, 1fr)",
                                  gap: 0,
                                  p: 1,
                                }}
                              >
                                {disasters
                                  .slice(0, 4)
                                  .map((disaster, index) => (
                                    <ListItem
                                      key={disaster.id}
                                      button
                                      onClick={() =>
                                        handleDisasterSelect(disaster)
                                      }
                                      sx={{
                                        mb: 1,
                                        "&:hover": {
                                          backgroundColor:
                                            theme.palette.action.hover,
                                        },
                                        alignItems: "flex-start",
                                        flexDirection: "column",
                                        borderRight:
                                          index === 0 || index === 2
                                            ? "0.5px solid rgb(235, 232, 232)"
                                            : "none",
                                        p: 1,
                                        pl: 2,
                                        height: "100%",
                                        minHeight: "80px",
                                      }}
                                    >
                                      <ListItemText
                                        primary={
                                          <Typography
                                            sx={{
                                              whiteSpace: "normal",
                                              wordBreak: "break-word",
                                              color: "text.primary",
                                              fontSize: "0.85rem",
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
                                                fontSize: "0.75rem",
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
                                                fontSize: "0.75rem",
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
                              </Box>
                            </AccordionDetails>
                          </Accordion>
                        )
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ) : (
            // Desktop Table View
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
                          xs: "1fr",
                          sm: "repeat(auto-fit, minmax(200px, 1fr))",
                          md: "repeat(auto-fit, minmax(180px, 1fr))",
                          lg: "repeat(auto-fit, minmax(150px, 1fr))",
                        },
                      }}
                    >
                      {Object.entries(disastersByType).map(
                        ([type, disasters]) => (
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
                                      onClick={() =>
                                        handleDisasterSelect(disaster)
                                      }
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
                                                md: isBelow
                                                  ? "0.8rem"
                                                  : "0.85rem",
                                                lg: isBelow
                                                  ? "0.8rem"
                                                  : "0.85rem",
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
                        )
                      )}
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Container>
      <Footer />
    </Box>
  );
}

export default HomePage;
