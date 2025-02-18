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
// import { useDisasterData } from '../../../hooks/useDisasterData';
import ThermostatIcon from "@mui/icons-material/Thermostat";
import OpacityIcon from "@mui/icons-material/Opacity";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import AirIcon from "@mui/icons-material/Air";

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
          backgroundColor: "#E8F1F5", // Light pastel yellow
          // backgroundColor: "#fafafa", // Light pastel yellow
          boxShadow: "2px 2px 2px #93A6AD",
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
              {disaster.title}
            </Typography>
            <Typography sx={{ color: "text.secondary", fontSize: 14 }}>
              {" "}
              {disaster.year}
            </Typography>
            <Typography sx={{ color: "text.secondary", mb: 1.5, fontSize: 14 }}>
              Location: {disaster.location}, {disaster.state}
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
          <Typography align="center" sx={{ mt: 5, mb: 5, fontSize: "1.7rem" }}>
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
                {[
                  {
                    label: "Temperature",
                    value: `${weather.temperature_2m}°C`,
                    icon: <ThermostatIcon fontSize="medium" sx={{ color: "#ffea99" }} />,
                  },
                  {
                    label: "Humidity",
                    value: `${weather.relative_humidity_2m}%`,
                    icon: <OpacityIcon fontSize="medium" sx={{ color: "#77b1d4" }} />,
                  },
                  {
                    label: "Rainfall",
                    value: `${weather.precipitation} mm`,
                    icon: <WaterDropIcon fontSize="medium" sx={{ color: "#366899" }} />,
                  },
                  {
                    label: "Wind Speed",
                    value: `${weather.wind_speed_10m} m/s`,
                    icon: <AirIcon fontSize="medium" sx={{ color: "#B4C3D2" }} />,
                  },
                ].map((item, index) => (
                  <Grid key={index} size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                    <Box
                      sx={{
                        padding: 1,
                        paddingLeft: 3,
                        // border: "1px solid #ccc",
                        // borderRadius: 2,
                        textAlign: "left",
                        // backgroundColor: "#E8F1F5",
                        // backgroundColor: "#fbfcfc",
                        // boxShadow: "2px 2px 2px #C4D8E2", // Updated boxShadow color
                        boxShadow: "2px 2px 2px #E8F1F5", // Updated boxShadow color
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "left",
                          gap: 1,
                        }}
                      >
                        {item.icon}
                        <Typography
                          variant="caption"
                          sx={{ fontSize: 14, opacity: 0.7 }}
                        >
                          {item.label}
                        </Typography>
                      </Box>
                      <Typography
                        sx={{
                          fontSize: { xs: 14, sm: 14, md: 16, lg: 22 },
                          fontWeight: "500",
                          mt: 1,
                          // pl: 2,
                        }}
                      >
                        {item.value}
                      </Typography>
                    </Box>
                  </Grid>
                ))}
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
            <>
              <Typography
                align="center"
                sx={{ mt: 5, mb: 0, fontSize: "1.7rem" }}
              >
                Disasters
              </Typography>
              <Typography
                align="center"
                sx={{ mt: 2, mb: 5, fontSize: "1.2rem", fontStyle: "italic" }}
              >
                ---- {selectedLocation} ----
              </Typography>
            </>
          ) : (
            <Typography
              align="center"
              sx={{ mt: 5, mb: 5, fontSize: "1.7rem" }}
            >
              Disasters
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
                    // alignItems: filteredDisasters.length < 4 ? "center" : "flex-start",
                  }}
                >
                  {cards}
                </div>
              ) : filteredDisasters.length >= 4 ? (
                <Carousel
                  responsive={{
                    desktop: { breakpoint: { max: 3000, min: 1024 }, items: 4 },
                  }}
                >
                  {cards}
                </Carousel>
              ) : (
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    justifyContent:
                      filteredDisasters.length < 4 ? "center" : "flex-start", // Center cards if less than 4
                    width: "100%",
                  }}
                >
                  {cards}
                </div>
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
