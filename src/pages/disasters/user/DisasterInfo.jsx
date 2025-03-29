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
import { FaSkull } from "react-icons/fa";
import useDisasterSummary from "../../../hooks/useDisasterSummary";
import fetchDisasterImages from "../../../hooks/fetchDisasterImages";
import axios from "axios";
import DisasterMap from "./DisasterMap";

const DisasterInfo = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [scrollPosition, setScrollPosition] = useState(0); //scrollPosition state: We store the current scroll position when the "Read Article" button is clicked.
  const readArticleRef = useRef(null); //readArticleRef reference: This ref is attached to the "Read Article" button so we can track its position.
  let loadingSummary = true;
  let loadingImages = true;

  // State for images from SerpAPI

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
        console.log(filtered[0]);
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
  console.log("After summary: " + summaryLoading);

  const {
    images,
    loadingImages: fetchedImagesLoading,
    error: imagesError,
  } = fetchDisasterImages(disaster);

  loadingImages = fetchedImagesLoading;
  console.log("After images: " + loadingImages);
  console.log("Fetched Images: " + images);
  console.log("Fetched Images2: " + JSON.stringify(images, null, 2));
  // images = JSON.stringify(images, null, 2);

  //handleReadArticleClick function: Captures the current scroll position and expands the article.
  const handleReadArticleClick = () => {
    setScrollPosition(window.scrollY); // Capture the current scroll position
    setExpanded(true);
  };

  // handleReadLessClick function: Scrolls back to the original position when the "Read Less" button is clicked.
  const handleReadLessClick = () => {
    window.scrollTo(0, scrollPosition); // Scroll back to the captured position
    setExpanded(false);
  };

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }
  return (
    <Box sx={{ p: 2 }}>
      <Typography
        align="left"
        sx={{
          mt: 10,
          ml: { xs: 2, sm: 4, md: 4 },
          fontSize: { xs: "1.5rem", sm: "1.7rem", md: "1.8rem" },
          fontWeight: "bold",
          textTransform: "uppercase",
        }}
      >
        {disaster.title}
      </Typography>
      <Typography
        align="left"
        sx={{
          mt: 1,
          ml: { xs: 2, sm: 4, md: 5 },
          fontSize: { xs: "0.7rem", sm: "0.7rem", md: "1rem" },
          fontWeight: "400",
        }}
      >
        {disaster.disaster_type}
      </Typography>

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
              height: "100%",
              boxShadow: "none",
              border: "none",
            }}
          >
            <CardContent sx={{ p: { xs: "8px", sm: "8px", md: "16px" } }}>
              {[
                // Array of details with icons
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
                    "Rs " + Number(disaster.loss_inr).toLocaleString("en-IN"),
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
                      {item.label === "Date" ? `${disaster.month}, ${item.value}` : item.value}
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
              position: "relative", // Ensure the Box is a positioning context
            }}
          >
            <DisasterMap disaster={disaster} />
          </Box>
        </Grid>
      </Grid>

      {/* Article Section */}
      <Box sx={{ borderBottom: "2px solid #eee", mx: { xs: "17px", sm: "17px", md: "32px" }, mt:5  }}>
        <Typography
          // variant="h5"
          sx={{
            mb: 1,
            ml: 3,
            fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
            fontWeight: 500,
            textAlign: "left",
            
          }}
        >
          Summary
        </Typography>
      </Box>
      <Box
        sx={{
          mt: 1,
          p: { xs: "17px", sm: "17px", md: "32px" },
          position: "relative",
          borderTop: "none", // Open from the top
          borderLeft: "1px solid transparent",
          borderRight: "1px solid transparent",
          borderBottom: "1px solid transparent",
          boxShadow: "2px 2px 5px #E8F1F5, -2px 2px 5px #E8F1F5", // Shadows on left, right, and bottom only
          borderRadius: "0 0 10px 10px",
          overflow: "hidden",
          textAlign: "center",
        }}
      >
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            maxHeight: expanded
              ? "none"
              : { xs: "8.7rem", sm: "8.7rem", md: "6.6rem" }, // Collapsed height
            transition: "max-height 1s ease-in-out",
            textAlign: "justify",
            "&::after": !expanded
              ? {
                  content: '""',
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  height: "60px", // Increased fade height for smoother transition
                  background: "linear-gradient(rgba(255,255,255,0), white)",
                }
              : {},
          }}
        >
          <Typography
            component="div" // Change from the default <p> to a <div>
            sx={{
              fontSize: {
                xs: "0.7rem",
                sm: "0.7rem",
                md: "0.8rem",
                lg: "0.9rem",
              },
            }}
          >
            {loadingSummary ? (
              "Loading summary..."
            ) : (
              <ReactMarkdown>{summary}</ReactMarkdown>
            )}
          </Typography>
        </Box>

        {!expanded && (
          <Box
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%) translateY(-50%)", // Moves the button up to overlap
              bottom: "-10px",
              zIndex: 10, // Ensures the button appears above the fade
            }}
            ref={readArticleRef}
          >
            <Button
              variant="contained"
              onClick={handleReadArticleClick}
              sx={{
                marginTop: "10px",
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
                // fontWeight: "bold",
              }}
            >
              Read more
            </Button>
          </Box>
        )}
        {expanded && (
          <Box
            sx={{
              mt: 2,
              position: "relative",
              // left: "50%",
              // transform: "translateX(-50%) translateY(-50%)", // Moves the button up to overlap
              // bottom: "0px",
              // Ensures the button appears above the fade
            }}
          >
            <Button
              variant="contained"
              onClick={handleReadLessClick}
              sx={{
                backgroundColor: "#fff",
                color: "#000",
                // boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                borderRadius: "20px",
                // fontWeight: "bold",
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
      </Box>

      {/* Images Section */}
      <Box sx={{ mt: 3, p: { xs: "17px", sm: "17px", md: "32px" } }}>
      <Box sx={{ borderBottom: "2px solid #eee", mb:4  }}>
        <Typography
          // variant="h5"
          sx={{
            mb: 1,
            ml: 3,
            fontSize: { xs: "1rem", sm: "1rem", md: "1.3rem" },
            fontWeight: 500,
            textAlign: "left",
          }}
        >
          Images
        </Typography>
      </Box>
        {loadingImages ? (
          <Typography align="center" sx={{ fontStyle: "italic",}}>
            Loading images...
          </Typography>
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
    </Box>
  );
};

export default DisasterInfo;
