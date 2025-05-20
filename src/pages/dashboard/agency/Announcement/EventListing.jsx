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
  ListItemText,
  ListItemIcon,
  Checkbox,
  ListItem,
  List,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";

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
    <div className="background-image">
      <Typography
        align="center"
        sx={{
          mt: 12,
          p: 2,
          fontSize: {
            xs: "1.2rem",
            sm: "1.2rem",
            md: isBelow ? "1.2rem" : "1.4rem",
            lg: isBelow ? "1.2rem" : "1.4rem",
          },
          fontWeight: "bold",
          textTransform: "uppercase",
          color: "rgba(0, 0, 0, 0.87)",
          position: "relative",
          zIndex: 1,
        }}
      >
        ANNOUNCEMENTS
      </Typography>
      <div className="controls"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap",
          margin: "20px auto",
          maxWidth: "80%",
          padding: "0 20px",
          marginTop: -2
        }}
      >
        {/* Search Box */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-start",
            my: 1,
            backgroundColor: "rgba(255, 255, 255, 0.97)",
            borderRadius: "8px",
          }}
        >
          <Autocomplete
            options={events ? events.map((event) => event.name) : []}
            onInputChange={(e, value) => setSearchTerm(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Search Events"
                variant="outlined"
                sx={{
                  width: 300,
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)"
                  }
                }}
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <InputAdornment position="end">
                      <SearchIcon fontSize="medium" />
                    </InputAdornment>
                  )
                }}
              />
            )}
          />
        </Box>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {/* Sort Box */}
          <Box
            sx={{
              padding: "12px 15px",
              textAlign: "left",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.85)",
              position: "relative",
              borderRadius: "8px",
              minWidth: "150px",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)"
              }
            }}
          >
            <InputLabel
              sx={{
                position: "absolute",
                top: -5,
                left: 16,
                padding: "0 2px",
                fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.75rem" },
                color: "text.secondary",
                fontStyle: "italic"
              }}
            >
              Sort
            </InputLabel>
            <FormControl fullWidth>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": { padding: "9px 32px 4px 12px" },
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" }
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="nameAZ">Name A-Z</MenuItem>
                <MenuItem value="nameZA">Name Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Filter Box */}
          <Box
            sx={{
              padding: "12px 15px",
              textAlign: "left",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              backgroundColor: "rgba(255, 255, 255, 0.97)",
              position: "relative",
              borderRadius: "8px",
              minWidth: "150px",
              transition: "all 0.3s ease",
              "&:hover": {
                boxShadow: "0 6px 8px rgba(0, 0, 0, 0.15)"
              }
            }}
          >
            <InputLabel
              sx={{
                position: "absolute",
                top: -5,
                left: 16,
                padding: "0 2px",
                fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.75rem" },
                color: "text.secondary",
                fontStyle: "italic"
              }}
            >
              Filter
            </InputLabel>
            <FormControl fullWidth>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": { padding: "9px 32px 4px 12px" },
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" }
                }}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>
      </div>


      <div className="container">
        {isLoading ? (
          <div className="loading-events" style={{ textAlign: "center" }}>
            <CircularProgress size={50} sx={{ color: "#4F646F", mb: 2 }} />
            <Typography>Loading events...</Typography>
          </div>
        ) : filteredEvents().length === 0 ? (
          <div className="no-events" style={{ textAlign: "center" }}>
            <Typography variant="h6">No events found</Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents().map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
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
      </div>
      <Footer />
    </div>
  );
}