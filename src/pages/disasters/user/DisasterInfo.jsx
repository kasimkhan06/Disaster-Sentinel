import React from "react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Typography, Box, Card, CardMedia, CardContent } from "@mui/material";
import Grid from "@mui/material/Grid2";

const DisasterInfo = () => {
  const { id } = useParams();
  const [disaster, setDisaster] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(
      `https://disaster-sentinel-64565e2d120b.herokuapp.com/api/past-disasters/`
    )
      .then((response) => response.json())
      .then((data) => {
        console.log(data);
        setDisaster(data.results);
        const filtered = data.results.filter((d) => d.id === Number(id));
        setDisaster(filtered[0] || null);
        console.log(filtered[0]);
        setLoading(false);
      })
      .catch((error) =>
        console.error("Error fetching disaster details:", error)
      );
  }, [id]);

  if (loading) {
    return <Typography align="center">Loading...</Typography>;
  }
  return (
    <Box sx={{ p: 2 }}>
      {/* Title of the Disaster */}
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
        {disaster.Title}
      </Typography>
      <Typography
        align="left"
        sx={{
          mt: 3,
          ml: { xs: 2, sm: 4, md: 4 },
          fontSize: { xs: "1rem", sm: "1rem", md: "1rem" },
        }}
      >
        Details:
      </Typography>

      {/* Grid Section */}
      <Grid container spacing={4} sx={{ mt: 0 }} align="left">
        {/* Information Fields */}
        <Grid size={{ xs: 11, sm: 6, md: 6, lg: 6 }}>
          <Card
            sx={{
              p: { xs: "8px", sm: "8px", md: "16px" },
              height: "100%",
              boxShadow: "none",
              border: "none",
            }}
          >
            <CardContent sx={{ p: { xs: "8px", sm: "8px", md: "16px" } }}>
              <Grid
                container
                spacing={4}
                sx={{
                  // mt: 0,
                  justifyContent: "center", // Centers grid horizontally
                  display: "flex",
                  // maxWidth: { xs: "100%", sm: "80%", md: "80%" }, // Adjust width dynamically
                  // margin: "auto", // Centers the grid in the container
                }}
              >
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 1,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        marginRight: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      }}
                    >
                      Date:
                    </Typography>
                    <Typography variant="body1">
                      {disaster.Disaster_Year}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 1,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        marginRight: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      }}
                    >
                      Location:
                    </Typography>
                    <Typography variant="body1">
                      {disaster.Location}, {disaster.State}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 1,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        marginRight: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      }}
                    >
                      Total Affected:
                    </Typography>
                    <Typography variant="body1">
                      {disaster.Total_Affected}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 1,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        marginRight: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      }}
                    >
                      Total Deaths:
                    </Typography>
                    <Typography variant="body1">
                      {disaster.Total_Deaths}
                    </Typography>
                  </Box>
                </Grid>

                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 1,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        marginRight: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      }}
                    >
                      Total injured:
                    </Typography>
                    <Typography variant="body1">
                      {disaster.Total_Injured}
                    </Typography>
                  </Box>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 1,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Typography
                      sx={{
                        marginRight: 2,
                        fontSize: "1.1rem",
                        fontWeight: 500,
                      }}
                    >
                      Economic loss:
                    </Typography>
                    <Typography variant="body1">
                      {disaster.Economic_Loss_INR}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Map or Statistics Section */}
        <Grid size={{ xs: 11, sm: 6, md: 6, lg: 6 }}>
          <Card
            sx={{
              p: { xs: "8px", sm: "8px", md: "16px" },
              height: "100%",
            }}
          >
            <CardMedia
              component="img"
              height="300"
              image="https://via.placeholder.com/600x300"
              alt="Map or Statistics"
            />
          </Card>
        </Grid>
      </Grid>

      {/* Article Section */}
      <Box sx={{ mt: 5, p: { xs: "17px", sm: "17px", md: "32px" } }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontSize: { xs: "1.5rem", sm: "1.7rem", md: "1.5rem" },
            fontWeight: 500,
          }}
        >
          Article
        </Typography>
        <Typography variant="body1" paragraph>
          This section contains a detailed article about the disaster, including
          its causes, impact, and response efforts. Provide thorough insights
          for the readers to understand the context and severity of the
          situation.
        </Typography>
      </Box>

      {/* Images Section */}
      <Box sx={{ mt: 5, p: { xs: "17px", sm: "17px", md: "32px" } }}>
        <Typography
          variant="h5"
          sx={{
            mb: 2,
            fontSize: { xs: "1.5rem", sm: "1.7rem", md: "1.5rem" },
            fontWeight: 500,
          }}
        >
          Images
        </Typography>
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/400x200"
                alt="Image 1"
              />
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/400x200"
                alt="Image 2"
              />
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/400x200"
                alt="Image 3"
              />
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/400x200"
                alt="Image 3"
              />
            </Card>
          </Grid>
          <Grid size={{ xs: 6, sm: 3, md: 3, lg: 2 }}>
            <Card>
              <CardMedia
                component="img"
                height="200"
                image="https://via.placeholder.com/400x200"
                alt="Image 3"
              />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default DisasterInfo;
