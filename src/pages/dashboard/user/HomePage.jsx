import { useState, useEffect } from "react";
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
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { Link } from "react-router-dom";
import useDisasterData from "../../../hooks/useDisasterData";
import DisasterMap from "../../disasters/user/DisasterMap";
import CurrentLocationMap from "../../disasters/user/CurrentLocationMap";
import WarningIcon from "@mui/icons-material/Warning";
import DescriptionIcon from "@mui/icons-material/Description";
import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import ContactEmergencyIcon from "@mui/icons-material/ContactEmergency";
import NewspaperIcon from "@mui/icons-material/Newspaper";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import useDisasterDataHome from "../../../hooks/useDisasterDataHome";
import LocationOnIcon from "@mui/icons-material/LocationOn";

function HomePage() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow = useMediaQuery("(max-width:1470px)");
  const selectedLocation = useState(null);
  const [weather, setWeather] = useState(null);

  // Pagination state
  const [pastDisastersPage, setPastDisastersPage] = useState(0);
  const [pastDisastersRowsPerPage, setPastDisastersRowsPerPage] = useState(8);
  const [recentDisastersPage, setRecentDisastersPage] = useState(0);
  const [recentDisastersRowsPerPage, setRecentDisastersRowsPerPage] =
    useState(5);

  // Filter state
  const [yearFilter, setYearFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("");

  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        console.log("User: "+parsedUser);
        setIsLogin(true);
        // {user.full_name ? user.full_name[0].toUpperCase() : "U"}
      }
    }, []);


  // State for recent disasters (static data)
  const [recentDisasters] = useState([
    {
      id: 1,
      title: "Flood in Assam",
      year: 2023,
      location: "Dhemaji",
      state: "Assam",
      type: "Flood",
    },
    {
      id: 2,
      title: "Cyclone Biparjoy",
      year: 2023,
      location: "Kutch",
      state: "Gujarat",
      type: "Cyclone",
    },
    {
      id: 3,
      title: "Landslide in Himachal",
      year: 2023,
      location: "Shimla",
      state: "Himachal Pradesh",
      type: "Landslide",
    },
  ]);

  // State for news (static data)
  const [news] = useState([
    {
      id: 1,
      title: "New early warning system implemented",
      date: "May 15, 2023",
      summary: "Government launches new disaster alert system",
    },
    {
      id: 2,
      title: "Disaster relief funds increased",
      date: "April 28, 2023",
      summary: "Budget allocation for disaster management raised by 20%",
    },
    {
      id: 3,
      title: "Community preparedness program",
      date: "March 10, 2023",
      summary: "Training sessions conducted in vulnerable areas",
    },
  ]);

  // Filter disasters from last 5 years
  const { disasters, locations, loading, loadingOptions, pastDisasters } =
    useDisasterDataHome(selectedLocation, setWeather);

  // Get unique years for filter dropdown
  const uniqueYears = [
    ...new Set(pastDisasters.map((disaster) => disaster.year)),
  ].sort((a, b) => b - a);
  // Get unique locations for filter dropdown
  const uniqueLocations = [
    ...new Set(pastDisasters.map((disaster) => disaster.state)),
  ].sort();

  // Filtered disasters based on filters
  const filteredPastDisasters = pastDisasters.filter((disaster) => {
    const matchesYear = yearFilter
      ? disaster.year.toString() === yearFilter
      : true;
    const matchesLocation = locationFilter
      ? disaster.state === locationFilter
      : true;
    const matchesDisasterType = disasterTypeFilter
      ? disaster.disaster_type === disasterTypeFilter
      : true;
    const matchesSearch = searchTerm
      ? disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        disaster.location.toLowerCase().includes(searchTerm.toLowerCase())
      : true;

    return (
      matchesYear && matchesLocation && matchesDisasterType && matchesSearch
    );
  });

  // Filtered recent disasters (just showing how you could implement search for this table too)
  const filteredRecentDisasters = recentDisasters.filter((disaster) => {
    return searchTerm
      ? disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          disaster.location.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
  });

  // Pagination handlers
  const handlePastDisastersPageChange = (event, newPage) => {
    setPastDisastersPage(newPage);
  };

  const handlePastDisastersRowsPerPageChange = (event) => {
    setPastDisastersRowsPerPage(parseInt(event.target.value, 10));
    setPastDisastersPage(0);
  };

  const handleRecentDisastersPageChange = (event, newPage) => {
    setRecentDisastersPage(newPage);
  };

  const handleRecentDisastersRowsPerPageChange = (event) => {
    setRecentDisastersRowsPerPage(parseInt(event.target.value, 10));
    setRecentDisastersPage(0);
  };

  const clearFilters = () => {
    setYearFilter("");
    setLocationFilter("");
    setDisasterTypeFilter("");
    setSearchTerm("");
  };

  return (
    <Container maxWidth={false} sx={{ mt: "100px" }}>
      <Grid container spacing={0} sx={{ width: "100%" }}>
        {/* Left Column */}
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Grid container spacing={2}>
            {/* Welcome Section */}
            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  // backgroundColor: "#E8F1F5",
                  boxShadow: "2px 2px 2px rgb(239, 242, 243)",
                }}
              >
                <CardContent>
                  <Typography
                    // align="center"
                    sx={{
                      fontSize: {
                        xs: "1rem",
                        sm: "1.2rem",
                        md: isBelow ? "1.2rem" : "1.4rem",
                        lg: isBelow ? "1.2rem" : "1.4rem",
                      },
                      fontWeight: "500",
                      mt: 2,
                      mb: 2,
                      paddingLeft: { xs: "0px", md: "0px", lg: "5x" },
                      paddingRight: { xs: "0px", md: "0px", lg: "10px" },
                    }}
                  >
                    Welcome 
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 2 }}>
                    This platform provides comprehensive disaster management
                    information and tools. Access real-time data, historical
                    trends, and essential resources to prepare for and respond
                    to natural disasters effectively.
                  </Typography>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    Stay informed, stay safe.
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Recent Disasters Section */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 8 }}>
              <Card
                sx={{
                  // borderRadius: 2,
                  // backgroundColor: "#E8F1F5",
                  // boxShadow: "2px 2px 2px rgb(239, 242, 243)",
                  // boxShadow: "2px 2px 2px #93A6AD",
                  boxShadow:"none"
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 0 }}>
                    <WarningIcon
                      sx={{ mr: 1, color: theme.palette.error.main }}
                    />
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
                        mb: 2,
                        paddingLeft: { xs: "0px", md: "0px", lg: "10px" },
                        paddingRight: { xs: "0px", md: "0px", lg: "10px" },
                      }}
                    >
                      Recent Disasters
                    </Typography>
                  </Box>
                  <TableContainer component={Paper}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Title</TableCell>
                          <TableCell>Year</TableCell>
                          <TableCell>Location</TableCell>
                          <TableCell>Type</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredRecentDisasters
                          .slice(
                            recentDisastersPage * recentDisastersRowsPerPage,
                            recentDisastersPage * recentDisastersRowsPerPage +
                              recentDisastersRowsPerPage
                          )
                          .map((disaster) => (
                            <TableRow key={disaster.id}>
                              <TableCell>{disaster.title}</TableCell>
                              <TableCell>{disaster.year}</TableCell>
                              <TableCell>
                                {disaster.location}, {disaster.state}
                              </TableCell>
                              <TableCell>{disaster.type}</TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                    <TablePagination
                      // rowsPerPageOptions={[5, 10]}
                      rowsPerPageOptions={[8]}
                      component="div"
                      count={filteredRecentDisasters.length}
                      rowsPerPage={recentDisastersRowsPerPage}
                      page={recentDisastersPage}
                      onPageChange={handleRecentDisastersPageChange}
                      onRowsPerPageChange={
                        handleRecentDisastersRowsPerPageChange
                      }
                    />
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>

        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Grid container spacing={2}>
            {/* Past Disasters Section */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 9 }}>
              <Card
                sx={{
                  mb: 3,
                  mt:0,
                  borderRadius: 2,
                  // backgroundColor: "#E8F1F5",
                  // boxShadow: "2px 2px 2px rgb(239, 242, 243)",
                  boxShadow:"none"
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <HistoryIcon
                      sx={{ mr: 1, color: theme.palette.warning.main }}
                    />
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
                        mb: 2,
                        paddingLeft: { xs: "0px", md: "0px", lg: "10px" },
                        paddingRight: { xs: "0px", md: "0px", lg: "10px" },
                      }}
                    >
                      Past Disasters (Past 3 years)
                    </Typography>
                  </Box>

                  {/* Filter Controls */}
                  <Grid
                    container
                    spacing={1}
                    sx={{
                      mb: { xs: 1, md: 2 },
                      width: "100%",
                      marginX: "auto",
                    }}
                  >
                    {/* Search */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 3 }}
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "stretch",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          padding: 0,
                          mb: 2,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative",
                        }}
                      >
                        <TextField
                          fullWidth
                          size="small"
                          label="Search"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon />
                                </InputAdornment>
                              ),
                              endAdornment: searchTerm && (
                                <IconButton
                                  size="small"
                                  onClick={() => setSearchTerm("")}
                                >
                                  <ClearIcon fontSize="small" />
                                </IconButton>
                              ),
                            },
                          }}
                          sx={{
                            "& .MuiInputBase-root": {
                              padding: "4px 8px",
                            },
                            "& .MuiOutlinedInput-notchedOutline": {
                              border: "none",
                            },
                            "& .MuiInputLabel-root": {
                              fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                                md: isBelow ? "1rem" : "1.1rem",
                                lg: isBelow ? "1rem" : "1.1rem",
                              },
                            },
                            width: "100%",
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Filter by Year */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "stretch",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          padding: 0,
                          mb: 2,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative",
                        }}
                      >
                        <Autocomplete
                          options={uniqueYears}
                          value={yearFilter}
                          onChange={(event, newValue) =>
                            setYearFilter(newValue)
                          }
                          getOptionLabel={(option) => option.toString()}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Year"
                              variant="outlined"
                              sx={{
                                "& .MuiInputBase-root": {
                                  padding: "4px 8px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiInputLabel-root": {
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: isBelow ? "1rem" : "1.1rem",
                                    lg: isBelow ? "1rem" : "1.1rem",
                                  },
                                },
                                width: "100%",
                              }}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-endAdornment": {
                              right: "10px",
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Filter by Location */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
                      sx={{
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "stretch",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          padding: 0,
                          mb: 2,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative",
                        }}
                      >
                        <Autocomplete
                          options={uniqueLocations}
                          value={locationFilter}
                          onChange={(event, newValue) =>
                            setLocationFilter(newValue)
                          }
                          getOptionLabel={(option) => option}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Location"
                              variant="outlined"
                              sx={{
                                "& .MuiInputBase-root": {
                                  padding: "4px 8px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiInputLabel-root": {
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: isBelow ? "1rem" : "1.1rem",
                                    lg: isBelow ? "1rem" : "1.1rem",
                                  },
                                },
                                width: "100%",
                              }}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-endAdornment": {
                              right: "10px",
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Filter by Disaster Type */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
                      sx={{
                        display: "flex",
                        justifyContent: "right",
                        alignItems: "stretch",
                      }}
                    >
                      <Box
                        sx={{
                          width: "100%",
                          padding: 0,
                          mb: 2,
                          textAlign: "left",
                          boxShadow: "2px 2px 2px #E8F1F5",
                          position: "relative",
                        }}
                      >
                        <Autocomplete
                          options={[
                            ...new Set(
                              pastDisasters.map(
                                (disaster) => disaster.disaster_type
                              )
                            ),
                          ]}
                          value={disasterTypeFilter}
                          onChange={(event, newValue) =>
                            setDisasterTypeFilter(newValue)
                          }
                          getOptionLabel={(option) => option}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Disaster Type"
                              variant="outlined"
                              sx={{
                                "& .MuiInputBase-root": {
                                  padding: "4px 8px",
                                },
                                "& .MuiOutlinedInput-notchedOutline": {
                                  border: "none",
                                },
                                "& .MuiInputLabel-root": {
                                  fontSize: {
                                    xs: "0.8rem",
                                    sm: "0.9rem",
                                    md: isBelow ? "1rem" : "1.1rem",
                                    lg: isBelow ? "1rem" : "1.1rem",
                                  },
                                },
                                width: "100%",
                              }}
                            />
                          )}
                          sx={{
                            "& .MuiAutocomplete-endAdornment": {
                              right: "10px",
                            },
                          }}
                        />
                      </Box>
                    </Grid>

                    {/* Clear Filters Button */}
                    <Grid
                      size={{ xs: 6, sm: 6, md: 2, lg: 2 }}
                      sx={{
                        display: "flex",
                        justifyContent: "left",
                        alignItems: "stretch",
                      }}
                    >
                      <Button
                        onClick={clearFilters}
                        disableRipple
                        sx={{
                          height: { md: 56 },
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

                  {loading ? (
                    <Typography>Loading past disasters...</Typography>
                  ) : (
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 6, sm: 6, md: 2, lg: 6 }}>
                        <TableContainer component={Paper}>
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Year</TableCell>
                                <TableCell>Location</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredPastDisasters
                                .slice(
                                  pastDisastersPage * pastDisastersRowsPerPage,
                                  pastDisastersPage * pastDisastersRowsPerPage +
                                    pastDisastersRowsPerPage
                                )
                                .map((disaster) => (
                                  <TableRow key={disaster.id}>
                                    <TableCell>{disaster.title}</TableCell>
                                    <TableCell>{disaster.year}</TableCell>
                                    <TableCell>
                                      {disaster.location}, {disaster.state}
                                    </TableCell>
                                  </TableRow>
                                ))}
                            </TableBody>
                          </Table>
                          <TablePagination
                            rowsPerPageOptions={[8]}
                            component="div"
                            count={filteredPastDisasters.length}
                            rowsPerPage={pastDisastersRowsPerPage}
                            page={pastDisastersPage}
                            onPageChange={handlePastDisastersPageChange}
                            onRowsPerPageChange={
                              handlePastDisastersRowsPerPageChange
                            }
                          />

                          {/* Add the message and navigation options */}
                          <Box
                            sx={{
                              p: 2,
                              textAlign: "center",
                              // backgroundColor: "#f5f5f5",
                              borderTop: "1px solid #e0e0e0",
                            }}
                          >
                            <Typography
                              variant="body1"
                              sx={{ mb: 2, fontStyle: "italic" }}
                            >
                              Want to see more historical disaster data?
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "center",
                                gap: 2,
                              }}
                            >
                              <Button
                                variant="outlined"
                                color="primary"
                                component={Link}
                                to="/current-location"
                                startIcon={<LocationOnIcon />}
                              >
                                View for any location
                              </Button>
                            </Box>
                          </Box>
                        </TableContainer>
                      </Grid>
                      <Grid size={{ xs: 6, sm: 6, md: 6, lg: 6 }}>
                        <Box
                          sx={{
                            height: "500px",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <CurrentLocationMap
                            filteredDisasters={filteredPastDisasters}
                          />
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Access Section */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 3 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  boxShadow: "2px 2px 2px rgb(239, 242, 243)",
                  // backgroundColor: "#E8F1F5", // Light background for the card
                }}
              >
                <CardContent>
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
                      mt: 1,
                      mb: 2,
                    }}
                  >
                    Quick Access
                  </Typography>
                  <Grid container spacing={1}>
                    {[
                      {
                        label: "Report Missing Person",
                        to: "/MissingPersonPortal",
                        icon: (
                          <PersonSearchIcon
                            sx={{ color: theme.palette.secondary.main }}
                          />
                        ),
                        color: "secondary",
                      },
                      {
                        label: "Check Status",
                        to: "/status-tracking",
                        icon: (
                          <DescriptionIcon
                            sx={{ color: theme.palette.info.main }}
                          />
                        ),
                        color: "info",
                      },
                      {
                        label: "Agency Details",
                        to: "/agencies",
                        icon: (
                          <ContactEmergencyIcon
                            sx={{ color: theme.palette.success.main }}
                          />
                        ),
                        color: "success",
                      },
                      {
                        label: "Disaster History",
                        to: "/current-location",
                        icon: (
                          <WarningIcon
                            sx={{ color: theme.palette.warning.main }}
                          />
                        ),
                        color: "warning",
                      },
                    ].map((button, index) => (
                      <Grid
                      size={{ xs: 6, sm: 6, md: 12, lg: 12 }}
                        key={index}
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "stretch",
                        }}
                      >
                        <Box
                          sx={{
                            width: { xs: "100%", sm: "85%", md: "90%" },
                            mb: 1,
                            boxShadow: "2px 2px 2px rgba(0,0,0,0.1)",
                            backgroundColor: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <Button
                            component={Link}
                            to={button.to}
                            fullWidth
                            startIcon={button.icon}
                            sx={{
                              py: 1.5,
                              backgroundColor: "white",
                              color: theme.palette.text.primary,
                              fontWeight: "400",
                              "& .MuiButton-startIcon": {
                                marginRight: "12px",
                                marginLeft: "8px",
                              },
                              "&:hover": {
                                backgroundColor: "#f5f5f5",
                              },
                              justifyContent: "flex-start",
                              textTransform: "none",
                              fontSize: {
                                xs: "0.8rem",
                                sm: "0.9rem",
                                md: isBelow ? "0.95rem" : "1rem",
                                lg: isBelow ? "0.95rem" : "1rem",
                              },
                              paddingLeft: 2,
                              borderRadius: "4px",
                            }}
                          >
                            {button.label}
                          </Button>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Container>
  );
}

export default HomePage;
