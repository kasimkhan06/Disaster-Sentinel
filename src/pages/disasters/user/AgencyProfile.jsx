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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import {
  Phone,
  Language,
  CalendarToday,
  LocationOn,
  People,
} from "@mui/icons-material";
import axios from "axios";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import AgencyMap from "./AgencyMap"; 
// import { env } from 'process';

const AgencyProfile = () => {
  const { id } = useParams();
  const [agency, setAgency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [images, setImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const fetchAgencyData = async () => {
      try {
        const response = await axios.get(
          `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${id}/`
        );
        setAgency(response.data);
        console.log("Agency Data:", response.data);
        // Process images if available
        if (response.data.images && Array.isArray(response.data.images)) {
          // Convert relative image paths to absolute URLs
          const processedImages = response.data.images.map((imgObj) => {
            // Check if the image path already starts with http or https
            console.log("Original image path:", imgObj.image);
            console.log(
              "Constructed URL:",
              `https://res.cloudinary.com/doxgltggk/${imgObj.image}`
            );
            if (imgObj.image.startsWith("http")) {
              return {
                ...imgObj,
                url: imgObj.image,
              };
            }
            // Otherwise construct the URL properly
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
        ) : (
          <>
            <Typography
              align="center"
              sx={{
                mt: 10,
                ml: { xs: 2, sm: 4, md: 4 },
                fontSize: { xs: "1.5rem", sm: "1.7rem", md: "1.8rem" },
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
                ml: { xs: 2, sm: 4, md: 5 },
                fontSize: { xs: "0.7rem", sm: "0.7rem", md: "1rem" },
                fontWeight: "400",
              }}
            >
              <Chip
                label={agency.agency_type}
                color="primary"
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
            </Typography>
          </>
        )}
      </Box>

      <Grid
        container
        spacing={1}
        sx={{ m: 0, width: "75%", marginX: "auto", marginTop: 1 }}
      >
        {/* First Grid - Agency Info */}
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
            <>
              <Grid
                container
                justifyContent="center"
                spacing={0}
                sx={{ mt: 0 }}
                align="left"
              >
                {/* Information Fields */}
                <Grid size={{ xs: 11, sm: 12, md: 10, lg: 5 }}>
                    {/* Banner Image - Only show if there are images */}
              {images.length > 0 && (
                <Box
                  sx={{
                    width: "100%",
                    // height: { xs: 200, sm: 250, md: 300 },
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
                      objectFit:"contain"
                    }}
                  />
                </Box>
              )}
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
                        },
                        agency.contact2 && {
                          label: "Secondary Contact",
                          value: agency.contact2,
                          icon: <Phone sx={{ color: "#4CAF50" }} />,
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

                {/* Map Section - Only show if lat/lng exists */}
                {agency.lat && agency.lng && (
  <Grid
    container
    justifyContent="center"
    size={{ xs: 11, sm: 10, md: 10, lg: 7 }}
    sx={{ pr: { xs: 2, md: 7 }, mt: 2 }}
  >
    <Box sx={{ width: '100%' }}>
      <Typography
        variant="h6"
        sx={{
          mb: 1,
          textAlign: 'center',
          fontWeight: 500,
          fontSize: '1.1rem'
        }}
      >
        Location
      </Typography>
      <AgencyMap agency={agency} />
    </Box>
  </Grid>
)}
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
          >
            <Typography
              sx={{
                mb: 1,
                fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              About Us
            </Typography>
          </Box>
          <Box
            sx={{
              mt: 0,
              p: { xs: "17px", sm: "17px", md: "32px" },
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
<Box sx={{ mt: 4, mb: 2 }}>
  <Box sx={{ borderBottom: "2px solid #eee", mb: 3, mx: { xs: "17px", sm: "17px", md: "32px" } }}>
    <Typography
      sx={{
        mb: 1,
        fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
        fontWeight: 500,
        textAlign: "center",
      }}
    >
      Gallery
    </Typography>
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
          p: 1,
        }}
      >
        {images.slice(1).map((imgObj, index) => (
          <Card key={imgObj.id || index} sx={{ height: '100%' }}>
            <CardMedia
              component="img"
              height="200"
              image={imgObj.url}
              alt={`Agency image ${index + 2}`}
              sx={{
                width: "100%",
                height: "200px",
                objectFit: "cover",
                '&:hover': {
                  transform: 'scale(1.03)',
                  transition: 'transform 0.3s ease-in-out'
                }
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
      <Typography variant="caption" sx={{ display: 'block', textAlign: 'center', mt: 1, color: 'text.secondary' }}>
        Showing {images.length - 1} image{images.length - 1 !== 1 ? 's' : ''}
      </Typography>
    </>
  ) : (
    <Typography align="center">No additional images available</Typography>
  )}
</Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AgencyProfile;