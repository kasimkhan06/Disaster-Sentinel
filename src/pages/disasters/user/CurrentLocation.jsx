import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  Button,
  Box,
  Typography,
  CardActionArea,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import DisasterMap from "./DisasterMap";
import CurrentLocationMap from "./CurrentLocationMap";
import TimelineIcon from "@mui/icons-material/Timeline";
import MapIcon from "@mui/icons-material/Map";
import WarningIcon from "@mui/icons-material/Warning";
import { PiX } from "react-icons/pi";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

function CurrentLocation() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow = useMediaQuery("(max-width:1470px)");
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
  const [filters, setFilters] = useState({
    year: "",
    disasterType: "",
  });
  const [allDisasters, setAllDisasters] = useState([]); // Store all disasters initially
  // Using the custom hook
  const {
    disasters,
    locations,
    filteredDisasters,
    loading,
    loadingOptions,
    loadingWeather,
  } = useDisasterData(selectedLocation, setWeather);

  const [locallyFilteredDisasters, setLocallyFilteredDisasters] =
    useState(filteredDisasters);
  const applyFilters = () => {
    let filtered = allDisasters;

    if (filters.year) {
      filtered = filtered.filter((disaster) => disaster.year === filters.year);
    }

    if (filters.disasterType) {
      filtered = filtered.filter(
        (disaster) => disaster.disaster_type === filters.disasterType
      );
    }

    setLocallyFilteredDisasters(filtered); // Update the locally filtered disasters
  };
  const clearFilters = () => {
    setFilters({ year: "", disasterType: "" });
    setLocallyFilteredDisasters(allDisasters); // Reset to all disasters
  };

  useEffect(() => {
    if (selectedLocation) {
      setAllDisasters(filteredDisasters); // Store all disasters
      setLocallyFilteredDisasters(filteredDisasters); // Update locally filtered disasters
    }
  }, [selectedLocation, filteredDisasters]);
  // Process data for the bar chart
  const disasterStats = {};
  const allDisasterTypes = new Set(); // To store all unique disaster types

  // Step 1: Populate disasterStats and collect all disaster types
  filteredDisasters.forEach((disaster) => {
    if (!disasterStats[disaster.year]) {
      disasterStats[disaster.year] = {};
    }
    if (!disasterStats[disaster.year][disaster.disaster_type]) {
      disasterStats[disaster.year][disaster.disaster_type] = 0;
    }
    disasterStats[disaster.year][disaster.disaster_type] += 1;

    // Add the disaster type to the set
    allDisasterTypes.add(disaster.disaster_type);
  });

  // Step 2: Ensure every year has all disaster types, even if the count is 0
  const chartData = Object.keys(disasterStats).map((year) => {
    const yearData = { year };

    // Initialize all disaster types for this year
    allDisasterTypes.forEach((type) => {
      yearData[type] = disasterStats[year][type] || 0; // Use 0 if the disaster type doesn't exist for this year
    });

    return yearData;
  });

  const [selectedDisasterType, setSelectedDisasterType] = useState("all");

  const filteredChartData =
    selectedDisasterType === "all"
      ? chartData
      : chartData.map((entry) => ({
        year: entry.year,
        [selectedDisasterType]: entry[selectedDisasterType],
      }));

  console.log("chartData:", chartData);
  console.log("disasterStats:", disasterStats);
  console.log("All Disaster Types:", allDisasterTypes);

  const cards = locallyFilteredDisasters.map((disaster, index) => (
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
          height: { xs: 150, md: 200 }, // Fixed height
          display: "flex",
          flexDirection: "column",
          // justifyContent: 'center', // Centers content
          alignItems: "center", // Centers horizontally
        }}
      >
        <CardActionArea>
          <CardContent>
            <Typography
              sx={{
                fontSize: {
                  xs: "1.1rem",
                  sm: "1.1rem",
                  md: isBelow ? "1.1rem" : "1.3rem",
                  lg: isBelow ? "1.1rem" : "1.3rem",
                },
                fontWeight: "500",
              }}
            >
              {disaster.title}
            </Typography>
            <Typography
              sx={{ color: "text.secondary", fontSize: { xs: 13, md: 14 } }}
            >
              {" "}
              {disaster.year}
            </Typography>
            <Typography
              sx={{
                color: "text.secondary",
                mb: 1.5,
                fontSize: { xs: 13, md: 14 },
              }}
            >
              Location: {disaster.location}, {disaster.state}
            </Typography>
          </CardContent>
        </CardActionArea>
      </Card>
    </div>
  ));

  const [hasSelectedLocation, setHasSelectedLocation] = useState(false);
  useEffect(() => {
    setHasSelectedLocation(!!selectedLocation);
  }, [selectedLocation]);
  return (
    <>
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
        <Container maxWidth={false} sx={{ width: "100%" }}>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: "100px" }}>
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
                        // width: "400px", // Set width to half
                      },
                    },
                  }}
                  sx={{
                    borderBottom: "2px solid #eee",
                    "& .MuiOutlinedInput-root": {
                      backgroundColor: "white",
                      boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
                      "& fieldset": {
                        borderColor: "transparent", // Remove border before focus
                      },
                      "&:hover fieldset": {
                        borderColor: "transparent", // Remove border on hover
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                      "&.Mui-focused fieldset": {
                        borderColor: "transparent", // Remove border on focus
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
                      },
                      "&:focus": {
                        outline: "none", // Remove black outline
                      },
                    },
                    "& .MuiInputLabel-root": {
                      color: "inherit",
                    },
                    "& .MuiInputBase-input": {
                      fontSize: {
                        xs: "0.7rem",
                        sm: "0.8rem",
                        md: isBelow ? "0.9rem" : "1rem",
                        lg: isBelow ? "0.9rem" : "1rem",
                      },
                    },
                    "&::placeholder": {
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1rem",
                        md: isBelow ? "1.1rem" : "1.2rem",
                        lg: isBelow ? "1.1rem" : "1.2rem",
                      },
                    },
                    width: { xs: "300px", md: "400px" },

                  }}
                />
              )}

            />
          </div>
          {selectedLocation ? (
            <>
              <Box sx={{ borderRadius: 2, boxShadow: 3, height: "100%", backgroundColor: "white", mb: 1 }}>
                <Grid container spacing={1} sx={{ m: 0, width: "100", marginTop: 2, paddingTop: 1 }}>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3 }} >
                    <div
                      style={{
                        margin: "10px",
                        // backgroundColor: "#f7fcff",
                        padding: "0px",
                      }}
                    >
                      <Typography
                        align="center"
                        sx={{
                          mt: 2,
                          mb: 4,
                          fontSize: {
                            xs: "1rem",
                            sm: "1.2rem",
                            md: isBelow ? "1.2rem" : "1.4rem",
                            lg: isBelow ? "1.2rem" : "1.4rem",
                          },
                          fontWeight: "500",
                        }}
                      >
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
                              maxWidth: { xs: "100%", sm: "80%", md: "100%" }, // Adjust width dynamically
                              // maxWidth: "100%",
                              margin: "auto", // Centers the grid in the container
                            }}
                          >
                            {[
                              {
                                label: "Temperature",
                                value: `${weather.temperature_2m}°C`,
                                icon: (
                                  <ThermostatIcon
                                    fontSize="medium"
                                    sx={{ color: "#ffea99" }}
                                  />
                                ),
                              },
                              {
                                label: "Humidity",
                                value: `${weather.relative_humidity_2m}%`,
                                icon: (
                                  <OpacityIcon
                                    fontSize="medium"
                                    sx={{ color: "#77b1d4" }}
                                  />
                                ),
                              },
                              {
                                label: "Rainfall",
                                value: `${weather.precipitation} mm`,
                                icon: (
                                  <WaterDropIcon
                                    fontSize="medium"
                                    sx={{ color: "#366899" }}
                                  />
                                ),
                              },
                              {
                                label: "Wind Speed",
                                value: `${weather.wind_speed_10m} m/s`,
                                icon: (
                                  <AirIcon
                                    fontSize="medium"
                                    sx={{ color: "#B4C3D2" }}
                                  />
                                ),
                              },
                            ].map((item, index) => (
                              <Grid
                                key={index}
                                size={{
                                  xs: 6,
                                  sm: 6,
                                  md: isBelow ? 12 : 6,
                                  lg: isBelow ? 12 : 6,
                                }}
                              >
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
                                      sx={{
                                        fontSize: {
                                          xs: "0.7rem",
                                          sm: "0.8rem",
                                          md: isBelow ? "0.9rem" : "1rem",
                                          lg: isBelow ? "0.9rem" : "1rem",
                                        },
                                        opacity: 0.7,
                                      }}
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
                          <Typography
                            align="center"
                            sx={{
                              fontSize: {
                                xs: "0.7rem",
                                sm: "0.8rem",
                                md: isBelow ? "0.9rem" : "1rem",
                                lg: isBelow ? "0.9rem" : "1rem",
                              },
                            }}
                          >
                            Loading...
                          </Typography>
                        )
                      ) : (
                        <Typography
                          align="center"
                          sx={{
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.8rem",
                              md: isBelow ? "0.9rem" : "1rem",
                              lg: isBelow ? "0.9rem" : "1rem",
                            },
                          }}
                        >
                          Enter a location to view weather conditions.
                        </Typography>
                      )}
                    </div>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 12, md: 6, lg: 4 }}>
                    <div
                      style={{
                        margin: "10px",
                        // paddingLeft: {xs: "0px", md: "0px", lg: "10px"},
                        // paddingRight: {xs: "10px", md: "10px", lg: "0px"},
                      }}
                    >
                      <Typography
                        align="center"
                        sx={{
                          fontSize: {
                            xs: "1rem",
                            sm: "1.2rem",
                            md: isBelow ? "1.2rem" : "1.4rem",
                            lg: isBelow ? "1.2rem" : "1.4rem",
                          },
                          fontWeight: "500",
                          mt: 2,
                          mb: 4,
                          paddingLeft: { xs: "0px", md: "0px", lg: "10px" },
                          paddingRight: { xs: "0px", md: "0px", lg: "10px" },
                        }}
                      >
                        Disaster Trends Over the Years
                      </Typography>

                      {/* Dropdown for disaster types */}
                      <Box
                        sx={{
                          paddingLeft: 3,
                          // paddingRight: { xs: 3, md: 3, lg: 0 },
                          mb: 3,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative", // To position the label correctly
                          width: { xs: "300px", md: "350px" },
                          marginX: "auto",
                        }}
                      >
                        <InputLabel
                          id="disaster-type-select-label"
                          sx={{
                            position: "absolute", // Position the label absolutely
                            top: -5, // Adjust the vertical position
                            left: 16, // Adjust the horizontal position
                            backgroundColor: "background.paper", // Match the background color
                            padding: "0 2px", // Add padding to avoid overlap
                            // fontSize: "0.75rem", // Match the label size
                            fontSize: {
                              xs: "0.55rem",
                              sm: "0.6rem",
                              md: isBelow ? "0.6rem" : "0.75rem",
                              lg: isBelow ? "0.6rem" : "0.75rem",
                            },
                            color: "text.secondary", // Match the label color
                            fontStyle: "italic", // Italicize the label
                          }}
                        >
                          Select Disaster Type
                        </InputLabel>
                        <FormControl fullWidth>
                          <Select
                            labelId="disaster-type-select-label"
                            id="disaster-type-select"
                            value={selectedDisasterType}
                            onChange={(e) =>
                              setSelectedDisasterType(e.target.value)
                            }
                            sx={{
                              "& .MuiOutlinedInput-notchedOutline": {
                                border: "none", // Remove the outline
                              },
                              "& .MuiSelect-select": {
                                padding: "9px 32px 4px 12px", // Reduce padding here
                              },
                              fontSize: {
                                xs: "0.7rem",
                                sm: "0.8rem",
                                md: isBelow ? "0.9rem" : "1rem",
                                lg: isBelow ? "0.9rem" : "1rem",
                              },
                            }}
                          >
                            <MenuItem value="all">All Disasters</MenuItem>
                            {[...allDisasterTypes].map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Box>
                      {/* Render the chart */}
                      {filteredChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={filteredChartData}>
                            <XAxis dataKey="year" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            {selectedDisasterType === "all" ? (
                              [...allDisasterTypes].map((disasterType, index) => {
                                // Define a fixed set of colors for consistency
                                const colors = [
                                  "#8884d8",
                                  "#82ca9d",
                                  "#ffc658",
                                  "#ff7300",
                                  "#a4de6c",
                                  "#d0ed57",
                                ];
                                const color = colors[index % colors.length]; // Cycle through colors if there are more disaster types than colors
                                return (
                                  <Line
                                    key={disasterType}
                                    type="monotone"
                                    dataKey={disasterType}
                                    stroke={color}
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                );
                              })
                            ) : (
                              <Line
                                type="monotone"
                                dataKey={selectedDisasterType}
                                stroke="#8884d8"
                                strokeWidth={2}
                                dot={false}
                              />
                            )}
                          </LineChart>
                        </ResponsiveContainer>
                      ) : (
                        <Typography
                          align="center"
                          sx={{
                            fontSize: {
                              xs: "0.7rem",
                              sm: "0.8rem",
                              md: isBelow ? "0.9rem" : "1rem",
                              lg: isBelow ? "0.9rem" : "1rem",
                            },
                          }}
                        >
                          No disaster data available.
                        </Typography>
                      )}
                    </div>
                  </Grid>
                  <Grid
                    container
                    justifyContent="center"
                    size={{ xs: 11, sm: 10, md: 10, lg: 5 }}
                    sx={{
                      pr: { xs: 0, md: 3 },
                      pb: 3,
                      pt: 3,
                      pl: { xs: 0, md: 1 },

                    }}
                    marginX="auto"
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
                      <CurrentLocationMap filteredDisasters={filteredDisasters} />
                    </Box>
                  </Grid>
                </Grid>
              </Box>

              <Box sx={{ borderRadius: 2, boxShadow: 3, height: "100%", backgroundColor: "white", mb: 4 }}>
                <div
                  style={{
                    margin: "10px",
                    // backgroundColor: "white",
                    padding: "0px",
                    borderRadius: 2, boxShadow: 3, height: "100%"
                  }}
                >
                  <Typography
                    align="center"
                    sx={{
                      mt: 1,
                      mb: 0,
                      pt: 2,
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                        md: isBelow ? "1.2rem" : "1.4rem",
                        lg: isBelow ? "1.2rem" : "1.4rem",
                      },
                      fontWeight: "500",
                    }}
                  >
                    Disasters
                  </Typography>
                  <Typography
                    align="center"
                    sx={{
                      pt: 2,
                      mb: { xs: 1, md: 2 },
                      fontSize: {
                        xs: "0.9rem",
                        sm: "1rem",
                        md: isBelow ? "1.1rem" : "1.2rem",
                        lg: isBelow ? "1.1rem" : "1.2rem",
                      },
                      fontStyle: "italic",
                    }}
                  >
                    ---- {selectedLocation} ----
                  </Typography>

                  <Grid
                    container
                    spacing={1}
                    sx={{
                      mb: { xs: 1, md: 2 },
                      width: {
                        xs: "100%",
                        sm: "90%",
                        md: "83%",
                        lg: isBelow ? "70%" : "60%",
                      },
                      marginX: "auto",
                    }}
                  >
                    {/* <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  justifyContent: "center",
                  mb: 4,
                }}
              > */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 4, lg: 4 }}
                      sx={{
                        display: "flex",
                        justifyContent: "right", // Centers the Box horizontally
                        alignItems: "stretch", // Centers vertically (optional)
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: "100%", sm: "75%", md: "90%" },
                          padding: 0,
                          paddingLeft: { xs: 1, md: 2 },
                          mb: 2,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative", // To position the label correctly
                        }}
                      >
                        {/* Filter by Year */}
                        <Autocomplete
                          options={[
                            ...new Set(
                              allDisasters.map((disaster) => disaster.year)
                            ),
                          ]}
                          value={filters.year}
                          onChange={(event, newValue) =>
                            setFilters({ ...filters, year: newValue })
                          }
                          getOptionLabel={(option) => option.toString()} // Ensure the option is a string
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Year"
                              variant="outlined"
                              sx={{
                                "& .MuiInputBase-root": {
                                  padding: "4px 8px", // Reduced padding
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none", // Remove the outline
                                },
                                "& .MuiInputLabel-root": {
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: isBelow ? "1rem" : "1.1rem",
                                    lg: isBelow ? "1rem" : "1.1rem",
                                  }, // Reduced font size
                                },
                                width: "100%",
                              }}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-endAdornment": {
                              right: "10px", // Ensures the arrow is 10px from the right of the box
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    {/* Filter by Disaster Type */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 4, lg: 4 }}
                      sx={{
                        display: "flex",
                        justifyContent: "left", // Centers the Box horizontally
                        alignItems: "stretch", // Centers vertically (optional)
                      }}
                    >
                      <Box
                        sx={{
                          width: { xs: "100%", sm: "75%", md: "90%" },
                          padding: 0,
                          paddingLeft: { xs: 1, md: 2 },
                          mb: 2,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative", // To position the label correctly
                        }}
                      >
                        <Autocomplete
                          options={[
                            ...new Set(
                              allDisasters.map((disaster) => disaster.disaster_type)
                            ),
                          ]}
                          value={filters.disasterType}
                          onChange={(event, newValue) =>
                            setFilters({ ...filters, disasterType: newValue })
                          }
                          getOptionLabel={(option) => option} // Ensure the option is a string
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Disaster Type"
                              variant="outlined"
                              sx={{
                                "& .MuiInputBase-root": {
                                  padding: "4px 8px", // Reduced padding
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none", // Remove the outline
                                },
                                "& .MuiInputLabel-root": {
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: isBelow ? "1rem" : "1.1rem",
                                    lg: isBelow ? "1rem" : "1.1rem",
                                  }, // Reduced font size
                                },
                                width: "100%",
                              }}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-endAdornment": {
                              right: "10px", // Ensures the arrow is 10px from the right of the box
                            },
                          }}
                        />
                      </Box>
                    </Grid>
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
                      sx={{
                        display: "flex",
                        justifyContent: "right", // Centers the Box horizontally
                        alignItems: "stretch", // Centers vertically (optional)
                      }}
                    >
                      <Button
                        // variant="contained"
                        onClick={applyFilters}
                        disableRipple
                        sx={{
                          height: { md: 62 }, // Match the height of the Autocomplete boxes
                          // padding: "8px 16px", // Adjust padding
                          paddingY: "9px",
                          // pr: { xs: 1, md: 0 },
                          // pl: 1,
                          // marginX: "auto",
                          mb: 2,
                          display: "flex",
                          alignItems: "center",
                          backgroundColor: "white", // Maintain the original background
                          "&:hover": {
                            backgroundColor: "white", // Prevent color change on hover
                          },
                        }}
                      >
                        Apply Filters
                      </Button>
                    </Grid>
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
                      sx={{
                        display: "flex",
                        justifyContent: "left", // Centers the Box horizontally
                        alignItems: "stretch", // Centers vertically (optional)
                      }}
                    >
                      <Button
                        onClick={(e) => {
                          e.preventDefault(); // Prevent default behavior
                          clearFilters();
                        }}
                        disableRipple
                        sx={{
                          height: { md: 62 },
                          paddingY: "9px",
                          display: "flex",
                          mb: 2,
                          alignItems: "center",
                          backgroundColor: "white",
                          "&:hover": {
                            backgroundColor: "white",
                          },
                        }}
                      >
                        Clear Filters
                      </Button>
                    </Grid>
                  </Grid>
                  {/* </Box> */}

                  {/* Total Disasters Counter */}
                  <Typography
                    align="center"
                    sx={{
                      fontSize: {
                        xs: "1rem",
                        sm: "1rem",
                        md: isBelow ? "1rem" : "1.2rem",
                        lg: isBelow ? "1rem" : "1.2rem",
                      },
                      mb: 1,
                    }}
                  >
                    Total Disasters: {locallyFilteredDisasters.length}
                  </Typography>

                  {loading ? (
                    <Typography align="center" sx={{ fontSize: "1.5rem", mt: 4 }}>
                      Loading...
                    </Typography>
                  ) : locallyFilteredDisasters.length > 0 ? (
                    isMobileOrTablet ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          height: "400px",
                          overflowY: "auto",
                          paddingBottom: 15,
                        }}
                      >
                        {cards}
                      </div>
                    ) : locallyFilteredDisasters.length >= 4 ? (
                      <div
                        style={{
                          width: "80%",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          paddingBottom: 17,
                        }}
                      >
                        <Carousel
                          responsive={{
                            desktop: {
                              breakpoint: { max: 3000, min: 1024 },
                              items: 4,
                            },
                          }}
                        >
                          {cards}
                        </Carousel>
                      </div>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          gap: "10px",
                          justifyContent:
                            locallyFilteredDisasters.length < 4
                              ? "center"
                              : "flex-start",
                          width: "100%",
                          paddingBottom: 17,
                        }}
                      >
                        {cards}
                      </div>
                    )
                  ) : (
                    <Typography align="center" sx={{ fontSize: "1.2rem", mt: 4, paddingBottom: 17, }}>
                      No disaster information available.
                    </Typography>
                  )}
                </div>
              </Box>
              {/* </Box> */}

            </>
          ) : (
            // <Typography align="center" sx={{ mt: 4 }}>
            //   Please enter a location to view the content.
            // </Typography>
            <Box
              sx={{
                width: "50%",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                mt: 4,
                p: 3,
                // backgroundColor: "#E8F1F5", // Light background color
                borderRadius: 2,
                // boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)", // Subtle shadow
                // boxShadow: 3,
                animation: "fadeIn 1s ease-in-out", // Fade-in animation
                "@keyframes fadeIn": {
                  "0%": { opacity: 0, transform: "translateY(-10px)" },
                  "100%": { opacity: 1, transform: "translateY(0)" },
                },
              }}
            >
              <Typography
                align="center"
                sx={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  color: "#2c3e50", // Darker text color
                  mb: 2,
                }}
              >
                Explore Any Given Location!
              </Typography>
              <Typography
                align="center"
                sx={{
                  fontSize: "1.2rem",
                  color: "#34495e", // Slightly lighter text color
                  fontStyle: "italic",
                }}
              >
                Enter a location to unlock detailed insights:
              </Typography>
              <Box
                sx={{
                  mt: 2,
                  textAlign: "center",
                  "& ul": {
                    listStyleType: "none",
                    padding: 0,
                    margin: 0,
                  },
                  "& li": {
                    fontSize: "1rem",
                    color: "#7f8c8d", // Lighter text color for list items
                    mb: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  },
                }}
              >
                <ul>
                  <li>
                    <ThermostatIcon fontSize="small" sx={{ color: "#ffea99" }} />
                    Current Weather Conditions
                  </li>
                  <li>
                    <TimelineIcon fontSize="small" sx={{ color: "#82ca9d" }} />
                    Disaster Trends Over the Years
                  </li>
                  <li>
                    <WarningIcon fontSize="small" sx={{ color: "#ff7300" }} />
                    Historical Disasters in the Area
                  </li>
                  {/* <li>
                  <MapIcon fontSize="small" sx={{ color: "#366899" }} />
                  Interactive Map for Easy Access
                </li> */}
                </ul>
              </Box>
              <Typography
                align="center"
                sx={{
                  fontSize: "1rem",
                  color: "#7f8c8d", // Lighter text color for subtext
                  mt: 2,
                }}
              >
                Discover everything you need to know about your chosen location!
              </Typography>
              {/* Disclaimer */}
              <Typography
                align="center"
                sx={{
                  fontSize: "0.8rem",
                  color: "#95a5a6", // Even lighter text color for disclaimer
                  mt: 2,
                  fontStyle: "italic",
                }}
              >
                * This tool provides insights for any given state in India.
              </Typography>
            </Box>
          )}

          {/* Let us assume that our screen is divided into 12 columns.

The xs part takes up when screen is extra small, Similarly small, medium and large classes as well, based on their respective screen size definition in CSS. */}
        </Container>
      </Box>
    </>
  );
}

export default CurrentLocation;
