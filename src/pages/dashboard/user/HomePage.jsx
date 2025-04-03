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
  Autocomplete
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

function HomePage() {
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
  const isBelow = useMediaQuery("(max-width:1470px)");
  const selectedLocation = useState(null);
  const [weather, setWeather] = useState(null);

  // Pagination state
  const [pastDisastersPage, setPastDisastersPage] = useState(0);
  const [pastDisastersRowsPerPage, setPastDisastersRowsPerPage] = useState(5);
  const [recentDisastersPage, setRecentDisastersPage] = useState(0);
  const [recentDisastersRowsPerPage, setRecentDisastersRowsPerPage] =
    useState(5);

  // Filter state
  const [yearFilter, setYearFilter] = useState("");
  const [locationFilter, setLocationFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [disasterTypeFilter, setDisasterTypeFilter] = useState("");

  
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
  const filteredPastDisasters = pastDisasters.filter(disaster => {
    const matchesYear = yearFilter ? disaster.year.toString() === yearFilter : true;
    const matchesLocation = locationFilter ? disaster.state === locationFilter : true;
    const matchesDisasterType = disasterTypeFilter ? disaster.type === disasterTypeFilter : true;
    const matchesSearch = searchTerm ? 
      disaster.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      disaster.location.toLowerCase().includes(searchTerm.toLowerCase()) : true;
    
    return matchesYear && matchesLocation && matchesDisasterType && matchesSearch;
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
      <Grid container spacing={2} sx={{ width: "100%" }}>
        {/* Left Column */}
        <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
          <Grid container spacing={2}>
            {/* Welcome Section */}
            <Grid size={{ xs: 12, sm: 12, md: 4, lg: 4 }}>
              <Card
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  backgroundColor: "#E8F1F5",
                  boxShadow: "2px 2px 2px #93A6AD",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h5"
                    sx={{
                      fontWeight: "600",
                      mb: 2,
                      color: theme.palette.primary.dark,
                    }}
                  >
                    Welcome User
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
                  borderRadius: 2,
                  backgroundColor: "#E8F1F5",
                  boxShadow: "2px 2px 2px #93A6AD",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <WarningIcon
                      sx={{ mr: 1, color: theme.palette.error.main }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "600",
                        color: theme.palette.primary.dark,
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
                      rowsPerPageOptions={[5, 10]}
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
                  borderRadius: 2,
                  backgroundColor: "#E8F1F5",
                  boxShadow: "2px 2px 2px #93A6AD",
                }}
              >
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <HistoryIcon
                      sx={{ mr: 1, color: theme.palette.warning.main }}
                    />
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: "600",
                        color: theme.palette.primary.dark,
                      }}
                    >
                      Past Disasters (Last 5 Years)
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
                              pastDisasters.map((disaster) => disaster.type)
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
                      <Grid item xs={12} md={6}>
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
                            rowsPerPageOptions={[5, 10]}
                            component="div"
                            count={filteredPastDisasters.length}
                            rowsPerPage={pastDisastersRowsPerPage}
                            page={pastDisastersPage}
                            onPageChange={handlePastDisastersPageChange}
                            onRowsPerPageChange={
                              handlePastDisastersRowsPerPageChange
                            }
                          />
                        </TableContainer>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box
                          sx={{
                            height: "300px",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <CurrentLocationMap disasters={filteredPastDisasters} />
                        </Box>
                      </Grid>
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>

            {/* Quick Access Section */}
            <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
              <Card
                sx={{
                  borderRadius: 2,
                  backgroundColor: "#E8F1F5",
                  boxShadow: "2px 2px 2px #93A6AD",
                }}
              >
                <CardContent>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "600",
                      mb: 2,
                      color: theme.palette.primary.dark,
                    }}
                  >
                    Quick Access
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component={Link}
                        to="/report-missing"
                        variant="contained"
                        fullWidth
                        startIcon={<PersonSearchIcon />}
                        sx={{
                          py: 2,
                          mb: 1,
                          backgroundColor: theme.palette.secondary.main,
                          "&:hover": {
                            backgroundColor: theme.palette.secondary.dark,
                          },
                        }}
                      >
                        Report Missing Person
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component={Link}
                        to="/check-status"
                        variant="contained"
                        fullWidth
                        startIcon={<DescriptionIcon />}
                        sx={{
                          py: 2,
                          mb: 1,
                          backgroundColor: theme.palette.info.main,
                          "&:hover": {
                            backgroundColor: theme.palette.info.dark,
                          },
                        }}
                      >
                        Check Status
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component={Link}
                        to="/agency-details"
                        variant="contained"
                        fullWidth
                        startIcon={<ContactEmergencyIcon />}
                        sx={{
                          py: 2,
                          backgroundColor: theme.palette.success.main,
                          "&:hover": {
                            backgroundColor: theme.palette.success.dark,
                          },
                        }}
                      >
                        Agency Details
                      </Button>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Button
                        component={Link}
                        to="/disaster-history"
                        variant="contained"
                        fullWidth
                        startIcon={<WarningIcon />}
                        sx={{
                          py: 2,
                          backgroundColor: theme.palette.warning.main,
                          "&:hover": {
                            backgroundColor: theme.palette.warning.dark,
                          },
                        }}
                      >
                        Disaster History
                      </Button>
                    </Grid>
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
