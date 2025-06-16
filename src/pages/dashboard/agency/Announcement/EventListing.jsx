// React
import { useEffect, useState } from "react";

// React Router
import { useParams, useNavigate } from "react-router-dom";

// MUI Components
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Button,
  Grid,
  Box,
  useMediaQuery,
  ListItemText as MUIListItemText,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";

// MUI Theme
import { useTheme } from "@mui/material/styles";

// MUI Icons
import { Search as SearchIcon } from "@mui/icons-material";

// React Router
import { useLocation } from "react-router-dom";
import { useSearchParams } from "react-router-dom";

// Custom Components
import EventCard from "../../../../components/EventCard";
import Footer from "../../../../components/Footer";

// Styles & Assets
import "../../../../../public/css/EventListing.css";
import userAnnouncementsBackground from "/assets/background_image/world-map-background.jpg";


export default function EventListing() {
  const [events, setEvents] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const isBelow = useMediaQuery("(max-width:1470px)");
  const [isLoading, setIsLoading] = useState(false);
  const [deletedEvents, setDeletedEvents] = useState([]);
  const [userID, setUserID] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const theme = useTheme();
  const location = useLocation();

  // Check login status
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const parsedData = JSON.parse(user);
      setUserID(parsedData.user_id);
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      navigate("/login");
    }
  }, [navigate]);

  // Fetch events when the component mounts
  useEffect(() => {
    if (isLoggedIn) {
      fetchEvents();
    }
  }, [isLoggedIn]);

  // Function to fetch events (used initially and for refreshing)
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/");
      const data = await response.json();
      const currentDate = new Date();
      console.log("Fetched events:", data);

      const validEvents = [];
      for (const event of data) {
        const eventDate = new Date(event.date);
        if (eventDate >= currentDate) {
          validEvents.push(event);
        } else {
          try {
            await fetch(`https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${event.id}/`, {
              method: "DELETE",
            });
            setDeletedEvents((prev) => [...prev, event]);
            setTimeout(() => {
              setDeletedEvents((prev) => prev.filter((e) => e.id !== event.id));
            }, 10000);
          } catch (deleteError) {
            console.error(`Failed to delete expired event: ${event.name}`, deleteError);
          }
        }
      }

      setEvents(validEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = () => {
    if (!events) return [];

    let eventsCopy = [...events];

    // Apply search filter
    if (searchTerm) {
      eventsCopy = eventsCopy.filter((event) => {
        return event.name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Apply filter
    if (filter !== "all") {
      eventsCopy = eventsCopy.filter((event) => {
        return event.location_type === filter;
      });
    }

    // Apply sorting
    eventsCopy.sort((a, b) => {
      if (sort === "newest") {
        return new Date(b.date) - new Date(a.date);
      } else if (sort === "oldest") {
        return new Date(a.date) - new Date(b.date);
      } else if (sort === "nameAZ") {
        return a.name?.localeCompare(b.name);
      } else if (sort === "nameZA") {
        return b.name?.localeCompare(a.name);
      }
      return 0;
    });

    return eventsCopy;
  };

  // Render login message if not logged in
  if (!isLoggedIn) {
    return (
      <Box sx={{ textAlign: "center", mt: 5 }}>
        <Typography variant="h5" sx={{ mb: 2, color: "gray" }}>
          Please login to view the announcements.
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/login")}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${userAnnouncementsBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        margin: 0,
        zIndex: 0,
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        overflowY: "auto",
      }}
    >
      <Box>
        <Box sx={{ maxWidth: '1000px', marginX: 'auto', px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: { xs: 1, sm: 2 } }}>
            <Typography
              align="center"
              sx={{
                mt: { xs: 8, sm: 5, md: 5, lg: 5 },
                p: 2,
                fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.4rem", lg: "1.5rem" },
                fontWeight: "bold",
                textTransform: "uppercase",
                color: "rgba(0, 0, 0, 0.87)",
                zIndex: 1,
              }}
            >
              ANNOUNCEMENTS
            </Typography>
          </Box>
          <Box className="controls" sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">

              {/* Search Section */}
              <Grid item xs={12} sm={12} md={6} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mb: { xs: 1, md: 0 } }}>
                <Box sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.97)",
                  borderRadius: "8px",
                  width: "100%",
                  maxWidth: 300,
                }}>
                  <Autocomplete
                    options={events ? events.map((event) => event.name) : []}
                    onInputChange={(e, value) => setSearchTerm(value)}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Search Events"
                        variant="outlined"
                        fullWidth
                        sx={{
                          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                          "&:hover": {
                            boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)",
                          },
                        }}
                        InputProps={{
                          ...params.InputProps,
                          endAdornment: (
                            <InputAdornment position="end">
                              <SearchIcon fontSize="medium" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    )}
                    size="small"
                  />
                </Box>
              </Grid>

              {/* Filters Section */}
              <Grid item xs={12} sm={12} md={6}>
                <Box sx={{
                  display: "flex",
                  justifyContent: { xs: "center", md: "flex-end" },
                  flexWrap: "wrap",
                  gap: 2,
                  mt: { xs: 2, md: 2 },
                }}>
                  {/* Filter Dropdown */}
                  <FormControl
                    sx={{
                      minWidth: 140,
                      backgroundColor: "white",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <InputLabel
                      id="filter-select-label"
                      sx={{
                        position: "absolute",
                        top: -10,
                        left: 8,
                        fontSize: "0.75rem",
                        padding: "0 4px",
                        backgroundColor: "white",
                      }}
                    >
                      Filter By
                    </InputLabel>
                    <Select
                      labelId="filter-select-label"
                      id="filter-select-input"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiSelect-select": { padding: "10px 14px" },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      }}
                    >
                      <MenuItem value="all">All Events</MenuItem>
                      <MenuItem value="online">Online</MenuItem>
                      <MenuItem value="offline">Offline</MenuItem>
                    </Select>
                  </FormControl>

                  {/* Sort Dropdown */}
                  <FormControl
                    sx={{
                      minWidth: 140,
                      backgroundColor: "white",
                      boxShadow: "2px 2px 2px #E8F1F5",
                      position: "relative",
                    }}
                  >
                    <InputLabel
                      id="sort-select-label"
                      sx={{
                        position: "absolute",
                        top: -10,
                        left: 8,
                        fontSize: "0.75rem",
                        padding: "0 4px",
                        backgroundColor: "white",
                      }}
                    >
                      Sort By
                    </InputLabel>
                    <Select
                      labelId="sort-select-label"
                      id="sort-select-input"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiSelect-select": { padding: "10px 14px" },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      }}
                    >
                      <MenuItem value="newest">Newest First</MenuItem>
                      <MenuItem value="oldest">Oldest First</MenuItem>
                      <MenuItem value="nameAZ">Name A-Z</MenuItem>
                      <MenuItem value="nameZA">Name Z-A</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Box>

      <Box className="container" sx={{ flex: 1, pb: 4, width: '100%', maxWidth: { xs: '80%', sm: '1200px', md: '900px', lg: '1100px' }, marginX: 'auto', px: { xs: 0, sm: 3 } }}>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 10, height: '300px' }}>
            <CircularProgress size={50} sx={{ mb: 2, color: theme.palette.primary.main }} />
            <Typography variant="h6" color="text.secondary">Loading announcements...</Typography>
          </Box>
        ) : filteredEvents().length === 0 ? (
          <Box sx={{ textAlign: "center", p: { xs: 2, sm: 3 }, backgroundColor: 'transparent', borderRadius: 0 }}>
            <Typography variant="h6" component="p" gutterBottom sx={{ fontWeight: 500, color: '#333' }}>
              No announcements available at the moment.
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents().map((event) => (
              <Grid item xs={12} sm={6} md={6} lg={4} key={event.id}>
                <EventCard event={event} refreshEvents={fetchEvents} />
              </Grid>
            ))}
          </Grid>

        )}

        {deletedEvents.length > 0 && (
          <div className="deleted-events-sidebar" style={{
            position: "fixed",
            right: 0,
            top: 80,
            width: "250px",
            background: "#fce4ec",
            borderLeft: "2px solid #f06292",
            padding: "10px",
            zIndex: 999,
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
          }}>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
              Deleted Event
            </Typography>
            {deletedEvents.map((event) => (
              <Box key={event.id} sx={{ mb: 1 }}>
                <Typography variant="body2">{event.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(event.date).toLocaleString()}
                </Typography>
              </Box>
            ))}
          </div>
        )}
      </Box>
      <Footer />
    </Box>
  );
}