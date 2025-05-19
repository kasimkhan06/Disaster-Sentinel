import React from "react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  TextField,
  CircularProgress,
  Dialog,
  useMediaQuery,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import { useTheme } from "@mui/material/styles";
import {
  Phone,
  Language,
  CalendarToday,
  LocationOn,
  People,
  ExpandMore,
} from "@mui/icons-material";
import axios from "axios";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import AgencyMap from "./AgencyMap";

const AgencyProfile = () => {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);
  const [volunteer, setVolunteer] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [volunteerMessage, setVolunteerMessage] = useState("");
  const [submitError, setSubmitError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userID, setUserID] = useState(null);
  const isBelow = useMediaQuery("(max-width:1470px)");
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const [expandedAccordion, setExpandedAccordion] = useState("info");
  const navigate = useNavigate();
  const [isNotLoggedin, setIsNotLoggedIn] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      console.log("User Data in agency profile:", parsedData);
      setUserID(parsedData.user_id);
    }
  }, []);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const response = await axios.get(
          `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${id}/`
        );
        setAgency(response.data);
        if (response.data.images && Array.isArray(response.data.images)) {
          const processedImages = response.data.images.map((imgObj) => {
            if (imgObj.image.startsWith("http")) {
              return {
                ...imgObj,
                url: imgObj.image,
              };
            }
            return {
              ...imgObj,
              url: `https://res.cloudinary.com/doxgltggk/${imgObj.image}`,
            };
          });
          setImages(processedImages);
        }
        setLoading(false);
        setLoadingImages(false);
      } catch (error) {
        console.error("Error fetching agency details:", error);
        setLoading(false);
        setLoadingImages(false);
      }
    };

    fetchAgencyData();
  }, [id]);

  const handleVolunteerClick = () => {
    console.log("isNotLoggedIn:" + isNotLoggedin);
    if (!userID) {
      // Store the current path in localStorage before navigating to login
      localStorage.setItem("redirectAfterLogin", window.location.pathname);
      setIsNotLoggedIn(true);
      return;
    }
    setVolunteer(true);
  };

  const handleCloseVolunteer = () => {
    setVolunteer(false);
    setVolunteerMessage("");
    setSubmitError(null);
    setSubmitSuccess(false);
  };

  const handleVolunteerSubmit = async () => {
    if (!volunteerMessage.trim()) {
      setSubmitError("Please enter a message");
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/volunteer-interests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            volunteer_id: userID,
            agency_id: agency.user_id,
            message: volunteerMessage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Already submitted a request.");
      }

      setSubmitSuccess(true);
      setVolunteerMessage("");
      setVolunteer(false);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpandedAccordion(isExpanded ? panel : null);
  };

  // Mobile view components
  const MobileAgencyInfo = () => (
    <Accordion
      key="info-accordion"
      expanded={expandedAccordion === "info"}
      onChange={handleAccordionChange("info")}
      sx={{
        mb: 0,
        boxShadow: "none",
        backgroundColor: "rgba(255, 255, 255, 0.67)",
        transition: "none",
        // transition: "none",
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
        expandIcon={<ExpandMore />}
        sx={{
          backgroundColor: "rgb(255, 255, 255)",
          minHeight: "48px !important",
          "&.Mui-expanded": {
            margin: "0",
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
          Agency Information
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, backgroundColor: "rgb(255, 255, 255)" }}>
        <CardContent sx={{ p: 1 }}>
          {images.length > 0 && (
            <Box
              sx={{ width: "100%", mb: 2, borderRadius: 2, overflow: "hidden" }}
            >
              <CardMedia
                component="img"
                image={images[0].url}
                alt="Agency banner"
                sx={{ width: "100%", height: "auto", objectFit: "contain" }}
              />
            </Box>
          )}
          {[
            {
              label: "Established",
              value: new Date(
                agency.date_of_establishment
              ).toLocaleDateString(),
              icon: <CalendarToday sx={{ color: "#AEC6CF" }} />,
            },
            {
              label: "Primary Contact",
              value: agency.contact1,
              icon: <Phone sx={{ color: "#4CAF50" }} />,
              isPhone: true,
            },
            agency.contact2 && {
              label: "Secondary Contact",
              value: agency.contact2,
              icon: <Phone sx={{ color: "#4CAF50" }} />,
              isPhone: true,
            },
            agency.website && {
              label: "Website",
              value: agency.website,
              icon: <Language sx={{ color: "#2196F3" }} />,
              isLink: true,
            },
            {
              label: "Address",
              value: `${agency.address}, ${agency.district}, ${agency.state}`,
              icon: <LocationOn sx={{ color: "#cd1c18" }} />,
            },
            agency.volunteers && {
              label: "Volunteers",
              value: agency.volunteers,
              icon: <People sx={{ color: "#d3d3d3" }} />,
            },
          ]
            .filter(Boolean)
            .map((item, index) => (
              <Box
                key={index}
                sx={{
                  padding: 1,
                  borderBottom: "1px solid #eee",
                  textAlign: "left",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center" }}>
                  {item.icon}
                  <Typography
                    sx={{ marginLeft: 1, fontSize: "0.79rem", fontWeight: 500 }}
                  >
                    {item.label}:
                  </Typography>
                  {item.isLink ? (
                    <Link
                      href={
                        item.value.startsWith("http")
                          ? item.value
                          : `https://${item.value}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      sx={{
                        marginLeft: 1,
                        fontSize: "0.79rem",
                        color: "#2196F3",
                      }}
                    >
                      {item.value.replace(/^https?:\/\//, "")}
                    </Link>
                  ) : item.isPhone ? (
                    <Typography
                      variant="body1"
                      onClick={() => {
                        const isMobile = /Mobi|Android/i.test(
                          navigator.userAgent
                        );
                        if (
                          window.confirm(`Do you want to call ${item.value}?`)
                        ) {
                          if (isMobile) {
                            window.location.href = `tel:${item.value}`;
                          } else {
                            alert(
                              `Please use your phone to call ${item.value}`
                            );
                          }
                        }
                      }}
                      sx={{
                        marginLeft: 1,
                        fontSize: "0.79rem",
                        color: "#4CAF50",
                        cursor: "pointer",
                      }}
                    >
                      {item.value}
                    </Typography>
                  ) : (
                    <Typography sx={{ marginLeft: 1, fontSize: "0.79rem" }}>
                      {item.value}
                    </Typography>
                  )}
                </Box>
              </Box>
            ))}
          {/* Volunteer Button */}
          <Button
            fullWidth
            onClick={handleVolunteerClick}
            sx={{
              mt: 2,
              textTransform: "uppercase",
              fontSize: "0.8rem",
              fontWeight: 500,
              py: 1.5,
            }}
          >
            WANT TO BE A VOLUNTEER?
          </Button>

          {isNotLoggedin && (
            <Card
              sx={{
                mt: 1,
                px: { xs: 3, sm: 3, md: 2 },
                borderRadius: 0,
                boxShadow: 0,
              }}
            >
              <Typography
                sx={{ fontSize: "0.8rem", textAlign: "center", mb: 1 }}
              >
                Please login to continue:
              </Typography>
              <Button
                onClick={() => navigate("/login")}
                sx={{
                  color: "black",
                  "&:hover": {
                    backgroundColor: "transparent",
                    textDecoration: "underline",
                  },
                  width: "100%",
                }}
              >
                Login
              </Button>
            </Card>
          )}
          {/* Volunteer Dialog */}
          {volunteer && !submitSuccess && (
            <Card
              sx={{
                mt: 2,
                px: { xs: 3, sm: 3, md: 2 },
                borderRadius: 0,
                boxShadow: 0,
              }}
            >
              <Typography
                sx={{ fontSize: "0.8rem", textAlign: "center", mb: 1 }}
              >
                Please write a message to the agency:
              </Typography>
              <TextField
                id="volunteer-message"
                label="Your Message"
                type="text"
                fullWidth
                multiline
                rows={isMobileOrTablet ? 2 : 3}
                value={volunteerMessage}
                onChange={(e) => setVolunteerMessage(e.target.value)}
                error={!!submitError}
                helperText={submitError}
                sx={{ mb: 2 }}
                inputProps={{
                  // This helps maintain focus
                  onFocus: (e) => e.target.focus(),
                }}
              />
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  onClick={handleCloseVolunteer}
                  color="secondary"
                  sx={{ fontSize: "0.8rem" }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleVolunteerSubmit}
                  color="primary"
                  disabled={isSubmitting}
                  sx={{ fontSize: "0.8rem" }}
                >
                  {isSubmitting ? (
                    <>
                      <CircularProgress size={20} />
                      <Typography sx={{ ml: 1 }}>Submitting...</Typography>
                    </>
                  ) : (
                    "Submit"
                  )}
                </Button>
              </Box>
            </Card>
          )}
          {submitSuccess && !volunteer && (
            <Typography align="center" sx={{ mt: 2 }}>
              Thank you for your request.
            </Typography>
          )}
        </CardContent>
      </AccordionDetails>
    </Accordion>
  );

  const MobileDescription = () => (
    <Accordion
      expanded={expandedAccordion === "description"}
      onChange={handleAccordionChange("description")}
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
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
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
          About Us
        </Typography>
      </AccordionSummary>
      <AccordionDetails
        sx={{ px: 2, pt: 0, pb: 2, backgroundColor: "rgb(255, 255, 255)" }}
      >
        <Typography
          component="div"
          sx={{ fontSize: "0.78rem", textAlign: "justify" }}
        >
          <ReactMarkdown>{agency.description}</ReactMarkdown>
        </Typography>
      </AccordionDetails>
    </Accordion>
  );

  const MobileMapSection = () => (
    <Accordion
      expanded={expandedAccordion === "map"}
      onChange={handleAccordionChange("map")}
      sx={{
        mb: 0,
        boxShadow: "none",
        backgroundColor: "rgba(255, 255, 255, 0.67)",
        transition: "none",
        "&.Mui-expanded": {
          margin: "0",
          // minHeight: "48px",
        },
        "&:before": {
          display: "none",
        },
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
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
          Find Route
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 0, backgroundColor: "rgb(255, 255, 255)" }}>
        {agency.lat && agency.lng && (
          <Box sx={{ width: "100%" }}>
            <AgencyMap agency={agency} isMobile={isMobileOrTablet} />
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );

  const MobileGallery = () => (
    <Accordion
      expanded={expandedAccordion === "gallery"}
      onChange={handleAccordionChange("gallery")}
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
      }}
    >
      <AccordionSummary
        expandIcon={<ExpandMore />}
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
          Gallery
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ p: 1, backgroundColor: "rgb(255, 255, 255)" }}>
        {loadingImages ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
            }}
          >
            {[1, 2, 3, 4].map((item) => (
              <Skeleton key={item} variant="rectangular" height={120} />
            ))}
          </Box>
        ) : images.length > 1 ? (
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 1,
            }}
          >
            {images.slice(1).map((imgObj, index) => (
              <Card key={imgObj.id || index}>
                <CardMedia
                  component="img"
                  height="120"
                  image={imgObj.url}
                  alt={`Agency image ${index + 2}`}
                  sx={{ width: "100%", height: "120px", objectFit: "cover" }}
                />
                {imgObj.caption && (
                  <CardContent sx={{ p: 0.5 }}>
                    <Typography variant="caption">{imgObj.caption}</Typography>
                  </CardContent>
                )}
              </Card>
            ))}
          </Box>
        ) : (
          <Typography align="center">No additional images available</Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );

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
              sx={{ mx: "auto", mt: 10 }}
            />
            <Skeleton
              variant="text"
              width="40%"
              height={30}
              sx={{ mx: "auto", mt: 1 }}
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
              {agency.agency_name}
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
              {agency.agency_type}
            </Typography>
          </>
        )}
      </Box>

      {isMobileOrTablet ? (
        <Grid
          container
          spacing={1}
          sx={{
            m: 2,
            width: { xs: "100%", sm: "100%", md: "75%" },
            marginX: "auto",
            marginTop: 1,
          }}
        >
          {loading ? (
            <Box>
              <Skeleton variant="rectangular" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={40} sx={{ mb: 1 }} />
            </Box>
          ) : (
            <>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 12 }} sx={{ mx: 2 }}>
                {" "}
                <MobileAgencyInfo />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 12 }} sx={{ mx: 2 }}>
                {" "}
                <MobileDescription />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 12 }} sx={{ mx: 2 }}>
                {" "}
                <MobileMapSection />
              </Grid>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 12 }} sx={{ mx: 2 }}>
                {" "}
                <MobileGallery />
              </Grid>
            </>
          )}
        </Grid>
      ) : (
        <Grid
          container
          spacing={1}
          sx={{
            m: 0,
            width: { xs: "100%", sm: "100%", md: "75%" },
            marginX: "auto",
            marginTop: 1,
          }}
        >
          {/* Desktop view remains the same */}
          <Grid
            size={{ xs: 12, sm: 12, md: 6, lg: 12 }}
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              boxShadow: 3,
              px: 2,
              pt: 2,
              pb: 0,
              mx: 3,
            }}
            minHeight={660}
            height="100%"
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
                <Grid
                  container
                  justifyContent="center"
                  spacing={0}
                  sx={{ mt: 0 }}
                  align="left"
                  paddingBottom={2}
                >
                  <Grid size={{ xs: 11, sm: 12, md: 10, lg: 5 }}>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={0}
                      sx={{ mt: 0 }}
                      align="left"
                      paddingBottom={0}
                    >
                      <Grid size={{ xs: 11, sm: 12, md: 10, lg: 12 }}>
                        {images.length > 0 && (
                          <Box
                            sx={{
                              width: "100%",
                              mb: 0,
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <CardMedia
                              component="img"
                              image={images[0].url}
                              alt="Agency banner"
                              sx={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain",
                              }}
                            />
                          </Box>
                        )}
                        <Card
                          sx={{
                            px: { xs: "8px", sm: "8px", md: "16px" },
                            pt: 1,
                            pb: 0,
                            boxShadow: "none",
                            border: "none",
                          }}
                        >
                          <CardContent
                            sx={{ p: { xs: "8px", sm: "8px", md: "16px" } }}
                          >
                            {[
                              {
                                label: "Established",
                                value: new Date(
                                  agency.date_of_establishment
                                ).toLocaleDateString(),
                                icon: (
                                  <CalendarToday sx={{ color: "#AEC6CF" }} />
                                ),
                              },
                              {
                                label: "Primary Contact",
                                value: agency.contact1,
                                icon: <Phone sx={{ color: "#4CAF50" }} />,
                                isPhone: true,
                              },
                              agency.contact2 && {
                                label: "Secondary Contact",
                                value: agency.contact2,
                                icon: <Phone sx={{ color: "#4CAF50" }} />,
                                isPhone: true,
                              },
                              agency.website && {
                                label: "Website",
                                value: agency.website,
                                icon: <Language sx={{ color: "#2196F3" }} />,
                                isLink: true,
                              },
                              {
                                label: "Address",
                                value: `${agency.address}, ${agency.district}, ${agency.state}`,
                                icon: <LocationOn sx={{ color: "#cd1c18" }} />,
                              },
                              agency.volunteers && {
                                label: "Volunteers",
                                value: agency.volunteers,
                                icon: <People sx={{ color: "#d3d3d3" }} />,
                              },
                            ]
                              .filter(Boolean)
                              .map((item, index) => (
                                <Grid
                                  key={index}
                                  size={{ xs: 11, sm: 6, md: 8, lg: 10 }}
                                  sx={{
                                    padding: 1,
                                    borderBottom: "2px solid #eee",
                                    textAlign: "center",
                                  }}
                                >
                                  <Box
                                    sx={{
                                      display: "flex",
                                      alignItems: "center",
                                    }}
                                  >
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
                                    {item.isLink ? (
                                      <Link
                                        href={
                                          item.value.startsWith("http")
                                            ? item.value
                                            : `https://${item.value}`
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{
                                          marginLeft: 1,
                                          fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.7rem",
                                            md: "0.8rem",
                                            lg: "1rem",
                                          },
                                          color: "#2196F3",
                                          textDecoration: "none",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        {item.value.replace(/^https?:\/\//, "")}
                                      </Link>
                                    ) : item.isPhone ? (
                                      <Typography
                                        variant="body1"
                                        onClick={() => {
                                          const isMobile = /Mobi|Android/i.test(
                                            navigator.userAgent
                                          );
                                          if (
                                            window.confirm(
                                              `Do you want to call ${item.value}?`
                                            )
                                          ) {
                                            if (isMobile) {
                                              window.location.href = `tel:${item.value}`;
                                            } else {
                                              alert(
                                                `Please use your phone to call ${item.value}`
                                              );
                                            }
                                          }
                                        }}
                                        sx={{
                                          marginLeft: 1,
                                          fontSize: {
                                            xs: "0.7rem",
                                            sm: "0.7rem",
                                            md: "0.8rem",
                                            lg: "1rem",
                                          },
                                          color: "#4CAF50",
                                          cursor: "pointer",
                                          "&:hover": {
                                            textDecoration: "underline",
                                          },
                                        }}
                                      >
                                        {item.value}
                                      </Typography>
                                    ) : (
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
                                        {item.value}
                                      </Typography>
                                    )}
                                  </Box>
                                </Grid>
                              ))}
                          </CardContent>
                        </Card>
                      </Grid>
                      <Grid
                        size={{ xs: 11, sm: 10, md: 10, lg: 12 }}
                        sx={{ px: { xs: 2, md: 1 }, mt: 0 }}
                      >
                        <Button
                          fullWidth
                          color="primary"
                          onClick={handleVolunteerClick}
                          disableRipple
                          sx={{
                            "&:hover": {
                              backgroundColor: "transparent",
                            },
                            textTransform: "uppercase",
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.8rem",
                              md: "0.9rem",
                              xl: "1rem",
                            },
                            fontWeight: 500,
                            padding: 1,
                          }}
                        >
                          WANT TO BE A VOLUNTEER?
                        </Button>
                      </Grid>
                      <Grid size={{ xs: 11, sm: 10, md: 10, lg: 12 }}>
                        <Box sx={{ width: "100%" }}>
                          {isNotLoggedin && (
                            <Card
                              sx={{
                                mt: 1,
                                px: { xs: 3, sm: 3, md: 2 },
                                borderRadius: 0,
                                boxShadow: 0,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.8rem",
                                  textAlign: "center",
                                  mb: 1,
                                }}
                              >
                                Please login to continue:
                              </Typography>
                              <Button
                                onClick={() => navigate("/login")}
                                sx={{
                                  color: "black",
                                  "&:hover": {
                                    backgroundColor: "transparent",
                                    textDecoration:"underline",
                                  },
                                  width: "100%",
                                }}
                              >
                                Login
                              </Button>
                            </Card>
                          )}
                          {volunteer && !submitSuccess && (
                            <Grid
                              container
                              justifyContent="center"
                              spacing={0}
                              sx={{ mt: 1 }}
                              align="left"
                              paddingBottom={2}
                            >
                              <Grid size={{ xs: 11, sm: 12, md: 10, lg: 12 }}>
                                <Typography
                                  sx={{
                                    fontSize: {
                                      xs: "0.7rem",
                                      sm: "0.7rem",
                                      md: "0.8rem",
                                      lg: "0.9rem",
                                    },
                                    textAlign: "center",
                                  }}
                                >
                                  Please write a message to the agency:
                                </Typography>
                              </Grid>
                              <Grid
                                size={{ xs: 11, sm: 12, md: 10, lg: 12 }}
                                sx={{ width: "80%", mx: 4 }}
                              >
                                <TextField
                                  id="volunteer-message"
                                  label="Your Message"
                                  type="text"
                                  fullWidth
                                  multiline
                                  rows={2}
                                  value={volunteerMessage}
                                  onChange={(e) =>
                                    setVolunteerMessage(e.target.value)
                                  }
                                  error={!!submitError}
                                  helperText={submitError}
                                />
                              </Grid>
                              <Grid
                                size={{ xs: 11, sm: 12, md: 10, lg: 12 }}
                                sx={{
                                  alignItems: "center",
                                  display: "flex",
                                  justifyContent: "center",
                                }}
                              >
                                {submitSuccess ? (
                                  <Button
                                    onClick={handleCloseVolunteer}
                                    color="primary"
                                  >
                                    Close
                                  </Button>
                                ) : (
                                  <>
                                    <Button
                                      onClick={handleCloseVolunteer}
                                      color="secondary"
                                      sx={{
                                        "&:hover": {
                                          backgroundColor: "transparent",
                                        },
                                        textTransform: "uppercase",
                                        fontSize: {
                                          xs: "0.6rem",
                                          sm: "0.6rem",
                                          md: "0.7rem",
                                          lg: "0.8rem",
                                        },
                                      }}
                                    >
                                      Cancel
                                    </Button>
                                    <Button
                                      onClick={handleVolunteerSubmit}
                                      color="primary"
                                      disabled={isSubmitting}
                                      sx={{
                                        "&:hover": {
                                          backgroundColor: "transparent",
                                        },
                                        textTransform: "uppercase",
                                        fontSize: {
                                          xs: "0.6rem",
                                          sm: "0.6rem",
                                          md: "0.7rem",
                                          lg: "0.8rem",
                                        },
                                      }}
                                    >
                                      {isSubmitting ? (
                                        <>
                                          <CircularProgress size={24} />
                                          <Typography sx={{ ml: 1 }}>
                                            Submitting...
                                          </Typography>
                                        </>
                                      ) : (
                                        "Submit"
                                      )}
                                    </Button>
                                  </>
                                )}
                              </Grid>
                            </Grid>
                          )}
                          {submitSuccess && !volunteer && (
                            <Typography>
                              {" "}
                              Thank you for your request.
                            </Typography>
                          )}
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid size={{ xs: 11, sm: 12, md: 10, lg: 7 }}>
                    <Grid
                      container
                      justifyContent="center"
                      spacing={0}
                      sx={{ mt: 0 }}
                      align="left"
                      paddingBottom={2}
                    >
                      {agency.lat && agency.lng && (
                        <Grid
                          justifyContent="center"
                          size={{ xs: 11, sm: 10, md: 10, lg: 12 }}
                          sx={{ px: { xs: 2, md: 5 }, mt: 0 }}
                        >
                          <Box sx={{ width: "100%" }}>
                            <AgencyMap agency={agency} />
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Grid>
                </Grid>
              </>
            )}
          </Grid>

          {/* Second Grid - Description */}
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
            ></Box>
            <Box
              sx={{
                mt: 0,
                px: { xs: "17px", sm: "17px", md: "32px" },
                py: 1,
                textAlign: "justify",
              }}
            >
              {loading ? (
                <>
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" />
                  <Skeleton variant="text" width="60%" />
                </>
              ) : (
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
                  <ReactMarkdown>{agency.description}</ReactMarkdown>
                </Typography>
              )}
            </Box>

            {/* Images Section */}
            <Box sx={{ mt: 2, mb: 2 }}>
              <Box
                sx={{
                  borderBottom: "2px solid #eee",
                  mb: 3,
                  mx: { xs: "17px", sm: "17px", md: "32px" },
                }}
              ></Box>
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
                    px: { xs: "17px", sm: "17px", md: "32px" },
                    py: 1,
                  }}
                >
                  {[1, 2, 3, 4, 5].map((item) => (
                    <Skeleton key={item} variant="rectangular" height={200} />
                  ))}
                </Box>
              ) : images.length > 1 ? (
                <>
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
                      px: { xs: "17px", sm: "17px", md: "32px" },
                      py: 1,
                    }}
                  >
                    {images.slice(1).map((imgObj, index) => (
                      <Card key={imgObj.id || index} sx={{ height: "100%" }}>
                        <CardMedia
                          component="img"
                          height="200"
                          image={imgObj.url}
                          alt={`Agency image ${index + 2}`}
                          sx={{
                            width: "100%",
                            height: "200px",
                            objectFit: "cover",
                            "&:hover": {
                              transform: "scale(1.03)",
                              transition: "transform 0.3s ease-in-out",
                            },
                          }}
                        />
                        {imgObj.caption && (
                          <CardContent sx={{ p: 1 }}>
                            <Typography variant="caption">
                              {imgObj.caption}
                            </Typography>
                          </CardContent>
                        )}
                      </Card>
                    ))}
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      textAlign: "center",
                      mt: 1,
                      color: "text.secondary",
                    }}
                  >
                    Showing {images.length - 1} image
                    {images.length - 1 !== 1 ? "s" : ""}
                  </Typography>
                </>
              ) : (
                <Typography align="center">
                  No additional images available
                </Typography>
              )}
            </Box>
          </Grid>
        </Grid>
      )}  
    </Box>
  );
};

export default AgencyProfile;