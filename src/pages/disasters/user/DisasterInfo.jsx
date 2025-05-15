import React from "react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import {
  Typography,
  Box,
  Card,
  CardMedia,
  CardContent,
  Button,
  Skeleton,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  CalendarToday,
  LocationOn,
  People,
  Favorite,
  LocalHospital,
  MonetizationOn,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import { FaSkull } from "react-icons/fa";
import useDisasterSummary from "../../../hooks/useDisasterSummary";
import fetchDisasterImages from "../../../hooks/fetchDisasterImages";
import axios from "axios";
import DisasterMap from "./DisasterMap";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import Footer from "../../../components/Footer";

const DisasterInfo = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [summaryTitle, setSummaryTitle] = useState("");
  const [filteredSummary, setFilteredSummary] = useState("");
  const readArticleRef = useRef(null);
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  let loadingSummary = true;
  let loadingImages = true;
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow = useMediaQuery("(max-width:1470px)");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    fetch(
      `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/past-disasters/?ordering=-year`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDisaster(data);
        const filtered = data.filter((d) => d.id === Number(id));
        setDisaster(filtered[0] || null);
        console.log(
          "Filtered disaster: " + JSON.stringify(filtered[0], null, 2)
        );
        setLoading(false);
      })
      .catch((error) =>
        console.error("Error fetching disaster details:", error)
      );
  }, [id]);

  const {
    summary,
    loading: summaryLoading,
    error: summaryError,
  } = useDisasterSummary(disaster);
  loadingSummary = summaryLoading;

  useEffect(() => {
    if (summary) {
      const lines = summary.split("\n");

      // Set the second line as title (index 1)
      if (lines.length > 1) {
        const cleanTitle = lines[2].replace(/^#+\s*/, "").trim();
        setSummaryTitle(cleanTitle);
      } else {
        setSummaryTitle("Summary"); // Fallback if there's no second line
      }

      // Remove first two lines from the displayed summary
      const filteredSummary = lines.length > 2 ? lines.slice(3).join("\n") : ""; // If there are <= 2 lines, show empty content
      setFilteredSummary(filteredSummary);
    }
  }, [summary]);

  const {
    images,
    loadingImages: fetchedImagesLoading,
    error: imagesError,
  } = fetchDisasterImages(disaster);

  loadingImages = fetchedImagesLoading;

  const handleReadArticleClick = () => {
    setScrollPosition(window.scrollY);
    setExpanded(true);
  };

  const handleReadLessClick = () => {
    window.scrollTo(0, scrollPosition);
    setExpanded(false);
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
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
      <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minHeight: "100vh",
                }}
              >
                <Container
                  maxWidth={false}
                  sx={{
                    width: "100%",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
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
        ) : (
          <>
            <Typography
              align="center"
              sx={{
                mt: 10,
                fontSize: {
                  xs: "1.2rem",
                  sm: "1.2rem",
                  md: isBelow ? "1.2rem" : "1.4rem",
                  lg: isBelow ? "1.2rem" : "1.4rem",
                },
                fontWeight: "bold",
                textTransform: "uppercase",
              }}
            >
              {disaster.title}
            </Typography>
            <Typography
              align="center"
              sx={{
                mt: 1,
                fontSize: { xs: "0.75rem", sm: "0.75rem", md: "0.9rem" },
                fontWeight: "400",
                fontStyle: "italic",
              }}
            >
              {disaster.disaster_type}
            </Typography>
          </>
        )}
      </Box>
      {isMobileOrTablet ? (
        <Grid
          container
          spacing={0}
          sx={{
            m: 0,
            width: { xs: "100%", sm: "100%", md: "75%" },
            marginX: "auto",
            marginTop: 0.5,
            marginBottom: 2,
            pb:2,
          }}
        >
          {/* First Grid - Disaster Info */}
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
            sx={{
              backgroundColor: "#fff",
              padding: { xs: 0, sm: 0, md: 2 },
              mx: { xs: 0, sm: 0, md: 3 },
              width: { xs: "100%", sm: "100%", md: "75%" },
              // paddingTop: { xs: 1, sm: 0, md: 0 },
              // paddingBottom: { xs: 1, sm: 0, md: 0 },
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
              <Grid
                container
                justifyContent="center"
                spacing={0}
                sx={{ mt: 0 }}
                align="left"
                padding={0}
              >
                {/* Information Fields */}
                <Grid size={{ xs: 12, sm: 12, md: 10, lg: 5 }}>
                  <Card
                    sx={{
                      px: { xs: "8px", sm: "8px", md: "16px" },
                      pt: 1,
                      pb: 3,
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    <CardContent
                      sx={{ p: { xs: "8px", sm: "8px", md: "16px" } }}
                    >
                      {[
                        {
                          label: "Date",
                          value: disaster.year,
                          icon: <CalendarToday sx={{ color: "#AEC6CF" }} />,
                        },
                        {
                          label: "Location",
                          value: `${disaster.location}, ${disaster.state}`,
                          icon: <LocationOn sx={{ color: "#cd1c18" }} />,
                        },
                        {
                          label: "Total Affected",
                          value: disaster.total_affected,
                          icon: <People sx={{ color: "#d3d3d3" }} />,
                        },
                        {
                          label: "Total Deaths",
                          value: disaster.total_deaths,
                          icon: <FaSkull size={24} color="grey" />,
                        },
                        {
                          label: "Total Injured",
                          value: disaster.total_injured,
                          icon: <LocalHospital sx={{ color: "#950606" }} />,
                        },
                        {
                          label: "Economic Loss",
                          value:
                            "Rs " +
                            Number(disaster.loss_inr).toLocaleString("en-IN"),
                          icon: <MonetizationOn sx={{ color: "#f1c338" }} />,
                        },
                      ].map((item, index) => (
                        <Grid
                          key={index}
                          size={{ xs: 12, sm: 6, md: 8, lg: 10 }}
                          sx={{
                            padding: 1,
                            borderBottom: "2px solid #eee",
                            textAlign: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {item.icon}
                            <Typography
                              sx={{
                                marginLeft: 1,
                                fontSize: {xs: "0.79rem", sm: "0.79rem", md: "0.88rem"} ,
                                fontWeight: "bold",
                              }}
                            >
                              {item.label}:
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                marginLeft: 1,
                                fontSize: {xs: "0.79rem", sm: "0.79rem", md: "0.88rem"},
                              }}
                            >
                              {item.label === "Date"
                                ? `${
                                    monthNames[disaster.month - 1] ||
                                    disaster.month
                                  }, ${item.value}`
                                : item.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </CardContent>
                    <Typography
                      variant="caption"
                      align="left"
                      sx={{
                        display: "block",
                        mt: 0,
                        ml: { xs: 4, sm: 2, md: 2, lg: 5 },
                        fontStyle: "italic",
                        color: "gray",
                      }}
                    >
                      * The values are estimated.
                    </Typography>
                  </Card>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
            sx={{ mx: { xs: 0, sm: 0, md: 3 } }}
          >
            <Accordion
            key="summary"
              defaultExpanded={false}
              onChange={(event, expanded) => handleAccordionChange("summary", expanded)}
              sx={{
                mb: 0,
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
                // width: "100%",
                justifyContent: "center",
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
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "rgba(84, 91, 100, 0.87)",
                    fontSize: "0.85rem",
                    alignContent: "center",
                    marginX: "auto",
                  }}
                >
                  READ SUMMARY
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: 0,
                  width: "100%",
                  backgroundColor: "rgb(255, 255, 255)",
                }}
              >
                <Box
                  sx={{
                    borderBottom: "2px solid #eee",
                    mx: { xs: "17px", sm: "17px", md: "32px" },
                    // mt: 2,
                  }}
                >
                  <Typography
                    sx={{
                      mb: 0,
                      fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
                      fontWeight: 500,
                      textAlign: "center",
                      padding: 0,
                    }}
                  >
                    <ReactMarkdown>{summaryTitle}</ReactMarkdown>
                  </Typography>
                </Box>
                <Box
                  sx={{
                    mt: 0,
                    px: { xs: "17px", sm: "17px", md: "32px" },
                    py: 2,
                    position: "relative",
                    borderTop: "none",
                    borderBottom: "1px solid transparent",
                    overflow: "hidden",
                    textAlign: "center",
                  }}
                >
                  {loadingSummary ? (
                    <>
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" width="60%" />
                    </>
                  ) : (
                    <>
                      <Box
                        sx={{
                          position: "relative",
                          overflow: "hidden",
                          height: "100%",
                          textAlign: "justify",
                        }}
                      >
                        <Typography
                          component="div"
                          sx={{
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.7rem",
                              md: "0.8rem",
                              lg: "0.9rem",
                            },
                          }}
                        >
                          <ReactMarkdown>{filteredSummary}</ReactMarkdown>
                        </Typography>
                      </Box>
                    </>
                  )}
                </Box>
                {/* </Grid> */}
              </AccordionDetails>
            </Accordion>
          </Grid>
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
            sx={{ mx: { xs: 0, sm: 0, md: 3 } }}
          >
            <Accordion
            key="images"
              defaultExpanded={false}
              onChange={(event, expanded) => handleAccordionChange("images", expanded)}
              sx={{
                mb: 1,
                boxShadow: "none",
                // backgroundColor: "rgba(255, 255, 255, 0.67)",
                transition: "none",
                "&.Mui-expanded": {
                  margin: "0",
                  minHeight: "48px",
                },
                "&:before": {
                  display: "none",
                },
                // width: "100%",
                justifyContent: "center",
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
                  justifyContent: "center",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: "bold",
                    color: "rgba(84, 91, 100, 0.87)",
                    fontSize: "0.85rem",
                    alignContent: "center",
                    marginX: "auto",
                  }}
                >
                  IMAGES
                </Typography>
              </AccordionSummary>
              <AccordionDetails
                sx={{
                  p: 0,
                  width: "100%",
                  backgroundColor: "rgb(255, 255, 255)",
                }}
              >
                <Box sx={{ mt: 3, mb: 2 }}>
              <Box
                sx={{
                  // borderBottom: "2px solid #eee",
                  mb: 3,
                  mx: { xs: "17px", sm: "17px", md: "32px" },
                }}
              >
                {/* <Typography
                sx={{
                  mb: 1,
                  fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Images
              </Typography> */}
              </Box>
              {loadingImages ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                      lg: "repeat(5, 1fr)",
                    },
                    gap: 2,
                    p: 1,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={200} />
                  ))}
                </Box>
              ) : images && images.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                      lg: "repeat(5, 1fr)",
                    },
                    gap: 2,
                    p: 1,
                  }}
                >
                  {images.map((img, index) => (
                    <Card key={index}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={img}
                        alt={`Disaster image ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography align="center">No images found</Typography>
              )}
              {imagesError && (
                <Typography color="error" align="center">
                  {imagesError}
                </Typography>
              )}
            </Box>
                {/* </Grid> */}
              </AccordionDetails>
            </Accordion>
          </Grid>
        </Grid>
      ) : (
        <Grid
          container
          spacing={1}
          sx={{
            m: 0,
            width: { xs: "100%", sm: "100%", md: "75%" },
            marginX: "auto",
            marginTop: 0.5,
          }}
        >
          {/* First Grid - Disaster Info */}
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: 3,
              padding: 2,
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
              <Grid
                container
                justifyContent="center"
                spacing={0}
                sx={{ mt: 0 }}
                align="left"
              >
                {/* Information Fields */}
                <Grid size={{ xs: 11, sm: 12, md: 10, lg: 5 }}>
                  <Card
                    sx={{
                      p: { xs: "8px", sm: "8px", md: "16px" },
                      boxShadow: "none",
                      border: "none",
                    }}
                  >
                    <CardContent
                      sx={{ p: { xs: "8px", sm: "8px", md: "16px" } }}
                    >
                      {[
                        {
                          label: "Date",
                          value: disaster.year,
                          icon: <CalendarToday sx={{ color: "#AEC6CF" }} />,
                        },
                        {
                          label: "Location",
                          value: `${disaster.location}, ${disaster.state}`,
                          icon: <LocationOn sx={{ color: "#cd1c18" }} />,
                        },
                        {
                          label: "Total Affected",
                          value: disaster.total_affected,
                          icon: <People sx={{ color: "#d3d3d3" }} />,
                        },
                        {
                          label: "Total Deaths",
                          value: disaster.total_deaths,
                          icon: <FaSkull size={24} color="#000" />,
                        },
                        {
                          label: "Total Injured",
                          value: disaster.total_injured,
                          icon: <LocalHospital sx={{ color: "#950606" }} />,
                        },
                        {
                          label: "Economic Loss",
                          value:
                            "Rs " +
                            Number(disaster.loss_inr).toLocaleString("en-IN"),
                          icon: <MonetizationOn sx={{ color: "#f1c338" }} />,
                        },
                      ].map((item, index) => (
                        <Grid
                          key={index}
                          size={{ xs: 11, sm: 6, md: 8, lg: 10 }}
                          sx={{
                            padding: 1,
                            borderBottom: "2px solid #eee",
                            textAlign: "center",
                          }}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            {item.icon}
                            <Typography
                              sx={{
                                marginLeft: 1,
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.7rem",
                                  md: "0.8rem",
                                  lg: "1rem",
                                },
                                fontWeight: 500,
                              }}
                            >
                              {item.label}:
                            </Typography>
                            <Typography
                              variant="body1"
                              sx={{
                                marginLeft: 1,
                                fontSize: {
                                  xs: "0.7rem",
                                  sm: "0.7rem",
                                  md: "0.8rem",
                                  lg: "1rem",
                                },
                              }}
                            >
                              {item.label === "Date"
                                ? `${
                                    monthNames[disaster.month - 1] ||
                                    disaster.month
                                  }, ${item.value}`
                                : item.value}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </CardContent>
                    <Typography
                      variant="caption"
                      align="left"
                      sx={{
                        display: "block",
                        mt: 0,
                        ml: { xs: 4, sm: 2, md: 2, lg: 5 },
                        fontStyle: "italic",
                        color: "gray",
                      }}
                    >
                      * The values are estimated.
                    </Typography>
                  </Card>
                </Grid>

                {/* Map Section */}
                <Grid
                  container
                  justifyContent="center"
                  size={{ xs: 11, sm: 10, md: 10, lg: 7 }}
                  sx={{ pr: { xs: 2, md: 7 } }}
                >
                  <Box
                    sx={{
                      width: "100%",
                      height: "400px",
                      borderRadius: "12px",
                      overflow: "hidden",
                      position: "relative",
                    }}
                  >
                    <DisasterMap disaster={disaster} />
                  </Box>
                </Grid>
              </Grid>
            )}
          </Grid>

          {/* Second Grid - Summary */}
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: 3,
              padding: 2,
              mx: 3,
              mb: 4,
            }}
          >
            <Box
              sx={{
                borderBottom: "2px solid #eee",
                mx: { xs: "17px", sm: "17px", md: "32px" },
                mt: 2,
              }}
            >
              <Typography
                sx={{
                  mb: 0,
                  fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
                  fontWeight: 500,
                  textAlign: "center",
                  padding: 0,
                }}
              >
                <ReactMarkdown>{summaryTitle}</ReactMarkdown>
              </Typography>
            </Box>
            <Box
              sx={{
                mt: 0,
                px: { xs: "17px", sm: "17px", md: "32px" },
                py: 2,
                position: "relative",
                borderTop: "none",
                borderBottom: "1px solid transparent",
                overflow: "hidden",
                textAlign: "center",
              }}
            >
              {loadingSummary ? (
                <>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </>
              ) : (
                <>
                  <Box
                    sx={{
                      position: "relative",
                      overflow: "hidden",
                      maxHeight: expanded
                        ? "none"
                        : { xs: "8.7rem", sm: "8.7rem", md: "6.6rem" },
                      transition: "max-height 1s ease-in-out",
                      textAlign: "justify",
                      "&::after": !expanded
                        ? {
                            content: '""',
                            position: "absolute",
                            bottom: 0,
                            left: 0,
                            width: "100%",
                            height: "60px",
                            background:
                              "linear-gradient(rgba(255,255,255,0), white)",
                          }
                        : {},
                    }}
                  >
                    <Typography
                      component="div"
                      sx={{
                        fontSize: {
                          xs: "0.7rem",
                          sm: "0.7rem",
                          md: "0.8rem",
                          lg: "0.9rem",
                        },
                      }}
                    >
                      <ReactMarkdown>{filteredSummary}</ReactMarkdown>
                    </Typography>
                  </Box>

                  {!expanded && (
                    <Box
                      sx={{
                        position: "absolute",
                        left: "50%",
                        transform: "translateX(-50%) translateY(-50%)",
                        bottom: "-10px",
                        zIndex: 10,
                      }}
                      ref={readArticleRef}
                    >
                      <Button
                        variant="contained"
                        onClick={handleReadArticleClick}
                        sx={{
                          marginTop: "20px",
                          backgroundColor: "#fff",
                          color: "#000",
                          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                          borderRadius: "20px",
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.7rem",
                            md: "0.8rem",
                            lg: "0.9rem",
                          },
                        }}
                      >
                        Read more
                      </Button>
                    </Box>
                  )}
                  {expanded && (
                    <Box
                      sx={{
                        position: "relative",
                      }}
                    >
                      <Button
                        variant="contained"
                        onClick={handleReadLessClick}
                        sx={{
                          backgroundColor: "#fff",
                          color: "#000",
                          borderRadius: "20px",
                          fontSize: {
                            xs: "0.7rem",
                            sm: "0.7rem",
                            md: "0.8rem",
                            lg: "0.9rem",
                          },
                        }}
                      >
                        Read less
                      </Button>
                    </Box>
                  )}
                </>
              )}
            </Box>

            {/* Images Section */}
            <Box sx={{ mt: 3, mb: 2 }}>
              <Box
                sx={{
                  borderBottom: "2px solid #eee",
                  mb: 3,
                  mx: { xs: "17px", sm: "17px", md: "32px" },
                }}
              >
                {/* <Typography
                sx={{
                  mb: 1,
                  fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
                  fontWeight: 500,
                  textAlign: "center",
                }}
              >
                Images
              </Typography> */}
              </Box>
              {loadingImages ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                      lg: "repeat(5, 1fr)",
                    },
                    gap: 2,
                    p: 1,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={200} />
                  ))}
                </Box>
              ) : images && images.length > 0 ? (
                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "repeat(2, 1fr)",
                      sm: "repeat(3, 1fr)",
                      md: "repeat(4, 1fr)",
                      lg: "repeat(5, 1fr)",
                    },
                    gap: 2,
                    p: 1,
                  }}
                >
                  {images.map((img, index) => (
                    <Card key={index}>
                      <CardMedia
                        component="img"
                        height="200"
                        image={img}
                        alt={`Disaster image ${index + 1}`}
                        sx={{
                          width: "100%",
                          height: "200px",
                          objectFit: "cover",
                        }}
                      />
                    </Card>
                  ))}
                </Box>
              ) : (
                <Typography align="center">No images found</Typography>
              )}
              {imagesError && (
                <Typography color="error" align="center">
                  {imagesError}
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      )}
       <Footer />
       </Container>
       </Box>
    </Box>
  );
};

export default DisasterInfo;
