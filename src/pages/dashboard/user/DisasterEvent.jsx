import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Chip,
  Link,
  Button,
  Alert,
  Divider,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  CalendarToday,
  LocationOn,
  Warning,
  Info,
  NewReleases,
  Public,
  People,
} from "@mui/icons-material";
import axios from "axios";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import DisasterMap from "./DisasterMap";

const DisasterEvent = () => {
  const { eventId } = useParams();
  const { eventType } = useParams(); // Get eventType from URL parameters
  const [eventData, setEventData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        console.log("Fetching event data for ID:", eventId);
        console.log("eventType:", eventType);
        const gdacsUrl = `https://www.gdacs.org/report.aspx?eventid=${eventId}%26eventtype=${eventType}`;
        // const encodedUrl = encodeURIComponent(gdacsUrl);
        const response = await axios.get(
          `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/gdacs/scrape/?url=${gdacsUrl}`
        );

        if (response.data.error) {
          throw new Error(response.data.error);
        }

        setEventData(response.data);
        console.log("Event Data:", response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event details:", err);
        setError(err.message);
        setLoading(false);
      }
    };

    // Get eventType from location state if available
    // const eventType = location.state?.eventType || 'EQ'; // Default to 'EQ' (Earthquake) if not provided
    fetchEventData();
  }, [eventId, eventType]);

  const getAlertColor = (alertLevel) => {
    switch (alertLevel?.toLowerCase()) {
      case "red":
        return "error";
      case "orange":
        return "warning";
      case "green":
        return "success";
      default:
        return "info";
    }
  };

  const parseCoordinates = (latLon) => {
    if (!latLon) return null;
    const parts = latLon.split(",").map((part) => part.trim());
    if (parts.length !== 2) return null;

    const lat = parseFloat(parts[0].split(" ")[0]);
    const lon = parseFloat(parts[1].split(" ")[0]);

    if (isNaN(lat)) return null;
    if (isNaN(lon)) return null;

    return { lat, lon };
  };

  const renderSummaryItem = (label, value, icon) => {
    if (!value) return null;

    return (
      <Grid item xs={12} sm={6} md={4} sx={{ padding: 1 }}>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          {icon}
          <Typography sx={{ marginLeft: 1, fontWeight: 500 }}>
            {label}:
          </Typography>
          <Typography sx={{ marginLeft: 1 }}>{value}</Typography>
        </Box>
      </Grid>
    );
  };

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        minHeight: "100vh",
        overflowY: "scroll",
        width: "100vw",
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
      <Box sx={{ p: 2 }}>
        {loading ? (
          <>
            <Skeleton
              variant="text"
              width="60%"
              height={60}
              sx={{
                mx: "auto",
                mt: 10,
                bgcolor: "transparent",
              }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={30}
              sx={{
                mx: "auto",
                mt: 1,
                bgcolor: "transparent",
              }}
            />
          </>
        ) : error ? (
          <Alert severity="error" sx={{ mt: 10, mx: "auto", maxWidth: "80%" }}>
            Error loading event data: {error}
          </Alert>
        ) : (
          <>
            <Typography
              align="center"
              sx={{
                mt: 10,
                fontSize: {
                  xs: "1.3rem",
                  sm: "1.3rem",
                  md: "1.4rem",
                  lg: "1.45rem",
                  xl: "1.45rem",
                },
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {eventData?.event_summary?.["Event Type"] || "Disaster Event"}
            </Typography>
            {eventData?.event_summary?.["Alert Level"] && (
              <Box sx={{ display: "flex", justifyContent: "center", mt: 1 }}>
                <Chip
                  label={`Alert Level: ${eventData.event_summary["Alert Level"]}`}
                  color={getAlertColor(eventData.event_summary["Alert Level"])}
                  icon={<Warning />}
                  sx={{ textTransform: "capitalize" }}
                />
              </Box>
            )}
          </>
        )}
      </Box>

      <Grid
        container
        spacing={2}
        sx={{ m: 0, width: "75%", marginX: "auto", marginTop: 1 }}
      >
        {/* First Grid - Event Summary */}
        <Grid
          size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            px: 2,
            pt: 0,
            pb: 0,
            mx: 3,
          }}
        >
          {loading ? (
            <>
              <Skeleton variant="rectangular" width="100%" height={400} />
              <Box sx={{ mt: 2 }}>
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Skeleton
                    key={item}
                    variant="text"
                    width="100%"
                    height={40}
                  />
                ))}
              </Box>
            </>
          ) : (
            <>
              <Grid container spacing={2} sx={{ mt: 0 }}>
                {/* Event Summary Section */}
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      p:2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Event Summary
                  </Typography>

                  <Grid container spacing={1}>
                    {renderSummaryItem(
                      "Event Date",
                      eventData?.event_summary?.["Event Date"],
                      <CalendarToday sx={{ color: "#AEC6CF" }} />
                    )}

                    {renderSummaryItem(
                      "Event Date",
                      eventData?.event_summary?.["Event Time"],
                      <CalendarToday sx={{ color: "#AEC6CF" }} />
                    )}

                    {renderSummaryItem(
                      "Location",
                      eventData?.event_summary?.["Lat/Lon"],
                      <LocationOn sx={{ color: "#cd1c18" }} />
                    )}

                    {renderSummaryItem(
                      "Country",
                      eventData?.event_summary?.["Country"],
                      <Public sx={{ color: "#4CAF50" }} />
                    )}

                    {renderSummaryItem(
                      "Magnitude",
                      eventData?.event_summary?.["Magnitude (Mw)"],
                      <NewReleases sx={{ color: "#FF5722" }} />
                    )}

                    {renderSummaryItem(
                      "Depth",
                      eventData?.event_summary?.["Depth"],
                      <Info sx={{ color: "#795548" }} />
                    )}

                    {renderSummaryItem(
                      "Alert Score",
                      eventData?.event_summary?.["Alert Score"],
                      <Warning sx={{ color: "#FFC107" }} />
                    )}

                    {renderSummaryItem(
                      "Nearest Place",
                      eventData?.event_summary?.["Nearest populated place"],
                      <LocationOn sx={{ color: "#2196F3" }} />
                    )}

                    {renderSummaryItem(
                      "Population Affected",
                      eventData?.event_summary?.["Population"],
                      <People sx={{ color: "#9C27B0" }} />
                    )}

                    {renderSummaryItem(
                      "Glide Number",
                      eventData?.event_summary?.["Glide Number"],
                      <Info sx={{ color: "#607D8B" }} />
                    )}

                    {renderSummaryItem(
                      "Distance",
                      eventData?.event_summary?.["Distance"],
                      <Info sx={{ color: "#607D8B" }} />
                    )}

                    {renderSummaryItem(
                      "Nearest populated place",
                      eventData?.event_summary?.["Nearest populated place"],
                      <Info sx={{ color: "#607D8B" }} />
                    )}
                  </Grid>
                </Grid>

                {/* Map Section */}
                <Grid
                  container
                  justifyContent="center"
                  size={{ xs: 11, sm: 10, md: 10, lg: 6 }}
                  sx={{ pr: { xs: 2, md: 2 }, py: 2 }}
                >
                  {eventData?.event_summary?.["Lat/Lon"] && (
                    <>
                      <Box
                        sx={{
                          width: "100%",
                          height: "400px",
                          borderRadius: "12px",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        <DisasterMap
                          coordinates={parseCoordinates(
                            eventData.event_summary["Lat/Lon"]
                          )}
                          eventType={eventData.event_summary["Event Type"]}
                        />
                      </Box>
                    </>
                  )}
                </Grid>
              </Grid>
            </>
          )}
        </Grid>

        {/* Second Grid - Latest Headlines and News Updates */}
        <Grid
          xs={12}
          sm={12}
          md={6}
          lg={12}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 3,
            padding: 2,
            mx: 3,
            mb: 4,
          }}
        >
          {loading ? (
            <>
              <Skeleton variant="text" width="30%" height={40} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 1 }} />
              <Skeleton variant="text" width="30%" height={40} sx={{ mt: 3 }} />
              <Skeleton variant="rectangular" height={200} sx={{ mt: 1 }} />
            </>
          ) : (
            <>
              {/* Latest Headlines Section */}
              {eventData?.latest_headlines?.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <NewReleases sx={{ mr: 1 }} /> Latest Headlines
                  </Typography>

                  <Grid container spacing={2}>
                    {eventData.latest_headlines
                      .filter((item) => !item.error_scraping_headlines)
                      .map((headline, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Typography variant="subtitle1" gutterBottom>
                                {headline.title}
                              </Typography>
                              {headline.link && (
                                <Link
                                  href={headline.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  sx={{ mb: 1, display: "inline-block" }}
                                >
                                  Read more
                                </Link>
                              )}
                              <Typography variant="body2">
                                {headline.summary}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>

                  <Divider sx={{ my: 3 }} />
                </>
              )}

              {/* Database News Updates Section */}
              {eventData?.db_news_updates?.length > 0 && (
                <>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Info sx={{ mr: 1 }} /> Database News Updates
                  </Typography>

                  <Grid container spacing={2}>
                    {eventData.db_news_updates
                      .filter((item) => !item.error_scraping_db_news)
                      .map((update, index) => (
                        <Grid item xs={12} key={index}>
                          <Card variant="outlined">
                            <CardContent>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                }}
                              >
                                <Typography variant="subtitle1">
                                  {update.title}
                                </Typography>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {update.date}
                                </Typography>
                              </Box>

                              <Box sx={{ mt: 1 }}>
                                {update.details.map((detail, i) => (
                                  <Typography
                                    key={i}
                                    variant="body2"
                                    sx={{ mb: 1 }}
                                  >
                                    • {detail}
                                  </Typography>
                                ))}
                              </Box>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                  </Grid>
                </>
              )}

              {/* Show message if no content available */}
              {!eventData?.latest_headlines?.length &&
                !eventData?.db_news_updates?.length && (
                  <Typography align="center" sx={{ py: 4 }}>
                    No additional information available for this event
                  </Typography>
                )}
            </>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default DisasterEvent;
