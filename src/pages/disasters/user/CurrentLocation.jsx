import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  CardActionArea,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Container from "@mui/material/Container";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import SearchIcon from "@mui/icons-material/Search";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { Link, useNavigate } from "react-router-dom";
import useDisasterData from "../../../hooks/useDisasterData";

function CurrentLocation() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const responsive = {
    superLargeDesktop: {
      // the naming can be any, depends on you.
      breakpoint: { max: 4000, min: 3000 },
      items: 5,
    },
    desktop: {
      breakpoint: { max: 3000, min: 1024 },
      items: 4,
    },
    tablet: {
      breakpoint: { max: 1024, min: 464 },
      items: 3,
    },
    mobile: {
      breakpoint: { max: 464, min: 0 },
      items: 2,
    },
  };
  const navigate = useNavigate();
  const [selectedLocation, setSelectedLocation] = useState("");
  const [weather, setWeather] = useState(null);
  // Using the custom hook
  const {
    disasters,
    locations,
    filteredDisasters,
    loading,
    loadingOptions,
    loadingWeather,
  } = useDisasterData(selectedLocation, setWeather);

  const cards = filteredDisasters.map((disaster, index) => (
    <div style={{ margin: "10px" }} key={index}>
      <Card
        onClick={() => navigate(`/disaster-details/${disaster.id}`)}
        sx={{
          borderRadius: 2,
          backgroundColor: "#fafafa", // Light pastel yellow
          boxShadow: 2,
          "&:hover": {
            boxShadow: 4,
            transform: "scale(1.0)",
          },
          width: "100%", // Ensures responsiveness
          height: 200, // Fixed height
          display: "flex",
          flexDirection: "column",
          // justifyContent: 'center', // Centers content
          alignItems: "center", // Centers horizontally
        }}
      >
        <CardActionArea>
          <CardContent>
            <Typography variant="h6" component="div">
              {disaster.Title}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {" "}
              {disaster.Disaster_Year}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 1.5, fontSize: 14 }}>
              Location: {disaster.Location}, {disaster.State}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  ));

  return (
    <>
      <Container maxWidth="lg">
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "100px",
          }}
        >
          <Autocomplete
            freeSolo
            id="location-input"
            disableClearable
            options={loadingOptions ? ["Loading..."] : locations}
            onChange={(event, newValue) => setSelectedLocation(newValue || "")}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder="Enter Location"
                slotProps={{
                  input: {
                    ...params.InputProps,
                    type: "search",
                    style: {
                      width: "400px", // Set width to half
                    },
                  },
                }}
                sx={{
                  borderBottom: "2px solid #eee",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "& fieldset": {
                      borderColor: "transparent", // Remove border before focus
                    },
                    "&:hover fieldset": {
                      borderColor: "transparent", // Remove border on hover
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "transparent", // Remove border on focus
                    },
                    "&:focus": {
                      outline: "none", // Remove black outline
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "inherit",
                  },
                }}
              />
            )}
          />
        </div>

        <div
          style={{
            margin: "10px",
            // backgroundColor: "#f7fcff",
            padding: "10px",
          }}
        >
          <Typography align="center" sx={{ mt: 5, mb: 5, fontSize: "1.5rem" }}>
            Current Weather Conditions
          </Typography>
          {!loadingWeather ? (
            weather && Object.keys(weather).length > 0 ? (
              <Grid
                container
                spacing={2}
                sx={{
                  mt: 2,
                  justifyContent: "center", // Centers grid horizontally
                  display: "flex",
                  maxWidth: { xs: "100%", sm: "80%", md: "60%" }, // Adjust width dynamically
                  margin: "auto", // Centers the grid in the container
                }}
              >
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 2,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Typography>
                    Temperature: {weather.temperature_2m}°C
                  </Typography>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 2,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Typography>
                    Humidity: {weather.relative_humidity_2m}%
                  </Typography>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 2,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Typography>Rainfall: {weather.precipitation} mm</Typography>
                </Grid>
                <Grid
                  size={{ xs: 11, sm: 6, md: 4, lg: 6 }}
                  sx={{
                    padding: 2,
                    borderBottom: "2px solid #eee",
                    textAlign: "center",
                  }}
                >
                  <Typography>
                    Wind Speed: {weather.wind_speed_10m} m/s
                  </Typography>
                </Grid>
              </Grid>
            ) : (
              <Typography align="center">Loading...</Typography>
            )
          ) : (
            <Typography align="center">
              Enter a location to view weather conditions.
            </Typography>
          )}
        </div>

        <div
          style={{
            margin: "10px",
            // backgroundColor: "#f7fcff",
            padding: "10px",
          }}
        >
          {selectedLocation ? (
            <Typography
              align="center"
              sx={{ mt: 5, mb: 5, fontSize: "1.5rem" }}
            >
              Past Disasters in {selectedLocation}
            </Typography>
          ) : (
            <Typography
              align="center"
              sx={{ mt: 5, mb: 5, fontSize: "1.5rem" }}
            >
              Past Disasters
            </Typography>
          )}

          {selectedLocation ? (
            loading ? (
              <Typography align="center" sx={{ fontSize: "1.5rem", mt: 4 }}>
                Loading...
              </Typography>
            ) : filteredDisasters.length > 0 ? (
              isMobileOrTablet ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: "400px",
                    overflowY: "auto",
                  }}
                >
                  {cards}
                </div>
              ) : (
                <Carousel
                  responsive={{
                    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
                  }}
                >
                  {cards}
                </Carousel>
              )
            ) : (
              <Typography align="center" sx={{ fontSize: "1.2rem", mt: 4 }}>
                No disaster information available for this location
              </Typography>
            )
          ) : (
            <Typography align="center" sx={{ mt: 4 }}>
              Please enter a location to view disaster information
            </Typography>
          )}
        </div>

        {/* Let us assume that our screen is divided into 12 columns.

The xs part takes up when screen is extra small, Similarly small, medium and large classes as well, based on their respective screen size definition in CSS. */}
      </Container>
    </>
  );
}

export default CurrentLocation;
