import { useEffect, useState } from "react";
import {
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Box,
  Button,
  Snackbar,
  Alert,
  Card,
  CardContent,
  Chip
} from "@mui/material";
import {
  CalendarToday,
  LocationOn,
  Videocam,
  Send
} from "@mui/icons-material";

import "../../../public/css/EventListing.css";

// Internal component for displaying event cards
function EventDisplayCard({ event, customActions }) {
  const getTagsBadge = () => {
    if (!event.tags || event.tags.length === 0) return null;
    return (
      <div className="tags-container">
        {event.tags.map((tag, index) => (
          <Chip key={index} label={tag} size="small" className="event-tag" />
        ))}
      </div>
    );
  };

  const getImage = () => {
    if (event.event_type === "Seminar" || event.event_type === "Conference" || event.event_type === "Networking") {
      return "/assets/Event Images/seminar.jpg";
    } else if (event.event_type === "Workshop") {
      return "/assets/Event Images/workshop.jpg";
    } else {
      return "/assets/Event Images/onlineMeeting.webp";
    }
  };

  return (
    <Card className="event-card">
      <img src={getImage()} alt={event.event_type || "Event"} className="event-img" />
      <CardContent className="event-content">
        <Typography variant="h6" className="event-title">
          {event.name}
        </Typography>

        <div className="event-details">
          <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
            <CalendarToday fontSize="small" sx={{ mr: 0.5 }} /> {event.date}
          </Typography>
          {event.location_type === "online" ? (
            <>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
                <Videocam fontSize="small" sx={{ mr: 0.5 }} /> Online ({event.platform})
              </Typography>
              <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', my: 0.5, wordBreak: 'break-all' }}>
                <Send fontSize="small" sx={{ mr: 0.5 }} /> {event.meeting_link}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}>
              <LocationOn fontSize="small" sx={{ mr: 0.5 }} /> {event.venue_name}, {event.district}, {event.state}
            </Typography>
          )}
          {getTagsBadge()}
        </div>

        {customActions && (
          <div style={{ marginTop: 'auto' }}>
            {customActions}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function UserAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(null);
  const [sort, setSort] = useState("newest");
  const [locationFilter, setLocationFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [registeringEventId, setRegisteringEventId] = useState(null);

  const fetchUserRegistrations = async (userId) => {
    // Placeholder
  };

  const loadCurrentUserData = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        setCurrentUser(null);
        setUserLocation(null);
        return;
      }
      const userDataFromStorage = JSON.parse(userString);
      if (userDataFromStorage && userDataFromStorage.user_id && userDataFromStorage.state && userDataFromStorage.district) {
        const CUser = {
          id: userDataFromStorage.user_id,
          state: userDataFromStorage.state,
          district: userDataFromStorage.district,
        };
        setCurrentUser(CUser);
        setUserLocation({ state: CUser.state, district: CUser.district });
      } else {
        setCurrentUser(null);
        setUserLocation(null);
      }
    } catch (error) {
      setCurrentUser(null);
      setUserLocation(null);
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/");
      if (!response.ok) throw new Error(`Failed to fetch announcements: ${response.status}`);
      const data = await response.json();
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const validAnnouncements = data.filter(announcement =>
        announcement.date && new Date(announcement.date) >= currentDate
      );
      setAnnouncements(validAnnouncements);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setSnackbar({ open: true, message: "Failed to load announcements", severity: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (eventId) => {
    if (!currentUser || !currentUser.id) {
      setSnackbar({ open: true, message: "You must be logged in to register.", severity: "error" });
      return;
    }
    setRegisteringEventId(eventId);
    try {
      const eventResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`
      );
      if (!eventResponse.ok) throw new Error(`Failed to fetch event details: ${eventResponse.status}`);
      const eventData = await eventResponse.json();
      const currentAttendees = eventData.attendees_count || 0;
      const maxCapacity = eventData.max_capacity;
      if (typeof maxCapacity === 'number' && currentAttendees >= maxCapacity) {
        setSnackbar({ open: true, message: "This event is already full.", severity: "warning" });
        return;
      }
      const updateResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendees_count: currentAttendees + 1 })
        }
      );
      if (updateResponse.ok) {
        setSnackbar({ open: true, message: "Successfully registered for the event!", severity: "success" });
        fetchAnnouncements();
      } else {
        const errorData = await updateResponse.json().catch(() => ({ detail: "Failed to update registration count" }));
        throw new Error(errorData.detail || "Failed to update registration count");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      setSnackbar({ open: true, message: error.message || "Failed to register for event.", severity: "error" });
    } finally {
      setRegisteringEventId(null);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      await loadCurrentUserData();
      fetchAnnouncements();
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentUser && currentUser.id) {
      // fetchUserRegistrations(currentUser.id);
    }
  }, [currentUser]);

  const sortedAnnouncements = () => {
    if (!announcements) return [];
    let processedAnnouncements = [...announcements];

    if (statusFilter !== "all") {
      processedAnnouncements = processedAnnouncements.filter(event =>
        event.status && event.status.toLowerCase() === statusFilter.toLowerCase()
      );
    }
    if (locationFilter === "online") {
      processedAnnouncements = processedAnnouncements.filter(announcement =>
        announcement.location_type && announcement.location_type.toLowerCase() === "online"
      );
    } else if (locationFilter === "offline") {
      processedAnnouncements = processedAnnouncements.filter(announcement =>
        announcement.location_type && announcement.location_type.toLowerCase() === "offline"
      );
    }
    if (sort === "newest") {
      processedAnnouncements.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "oldest") {
      processedAnnouncements.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === "nameAZ") {
      processedAnnouncements.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameZA") {
      processedAnnouncements.sort((a, b) => b.name.localeCompare(a.name));
    }

    return processedAnnouncements.filter(announcement => {
      if (announcement.location_type && announcement.location_type.toLowerCase() === "online") return true;
      if (!userLocation || !userLocation.state || !userLocation.district) return false;
      if (!announcement.state) return false;
      const userState = userLocation.state.toUpperCase();
      const userDistrict = userLocation.district.toUpperCase();
      const eventState = announcement.state.toUpperCase();
      const eventDistrict = announcement.district ? announcement.district.trim().toUpperCase() : "";
      if (eventState !== userState) return false;
      if (eventDistrict !== "" && eventDistrict !== userDistrict) return false;
      return true;
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const outerFilterBoxStyle = {
    padding: '8px 16px',
    textAlign: "left",
    boxShadow: "2px 2px 2px #E8F1F5",
    position: "relative",
    minWidth: 170,
    flexGrow: 1,
    flexBasis: { xs: 'calc(100% - 16px)', sm: 180, md: 190 },
    backgroundColor: 'white',
    borderRadius: '4px',
  };

  const filterInputLabelStyle = {
    position: "absolute",
    top: -10,
    left: 24,
    backgroundColor: "background.paper",
    padding: "0 6px",
    fontSize: { xs: "0.65rem", sm: "0.7rem", md: "0.75rem" },
    color: "text.secondary",
    fontStyle: "italic",
    zIndex: 1
  };

  const filterSelectStyle = {
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiSelect-select": { 
      padding: "10px 26px 10px 12px",
      minHeight: 'auto !important',
    },
    fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
    position: 'relative',
    zIndex: 2,
    backgroundColor: 'transparent',
    width: '100%',
    marginTop: '4px',
  };

  return (
    <div className="background-image">
      <div className="container">
        <Box className="header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center", fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Announcements
          </Typography>
        </Box>

        <Box className="controls" sx={{ display: "flex", justifyContent: "flex-end", flexWrap: "wrap", gap: 2, mb: 3 }}>
          {/* Status Filter */}
          <Box sx={outerFilterBoxStyle}>
            <InputLabel htmlFor="status-filter-input" id="status-filter-label" sx={filterInputLabelStyle}>
              Status
            </InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="status-filter-label"
                id="status-filter-input"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                sx={filterSelectStyle}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="all">All Statuses</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="ongoing">Ongoing</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Event Type (Online/Offline) Filter */}
          <Box sx={outerFilterBoxStyle}>
            <InputLabel htmlFor="location-filter-input" id="location-filter-label" sx={filterInputLabelStyle}>
              Type
            </InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="location-filter-label"
                id="location-filter-input"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                sx={filterSelectStyle}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Sort By Filter */}
          <Box sx={outerFilterBoxStyle}>
            <InputLabel htmlFor="sort-select-input" id="sort-select-label" sx={filterInputLabelStyle}>
              Sort
            </InputLabel>
            <FormControl fullWidth>
              <Select
                labelId="sort-select-label"
                id="sort-select-input"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                sx={filterSelectStyle}
                MenuProps={{
                  PaperProps: {
                    style: {
                      maxHeight: 300,
                    },
                  },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="nameAZ">Name A-Z</MenuItem>
                <MenuItem value="nameZA">Name Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <CircularProgress size={50} sx={{ color: "#4F646F", mb: 2 }} />
            <Typography>Loading announcements...</Typography>
          </Box>
        ) : sortedAnnouncements().length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h6">No announcements available for the selected filters.</Typography>
            <Typography variant="body1" sx={{ mt: 1 }}>
              {statusFilter !== "all" || locationFilter !== "all" || (userLocation && (userLocation.state || userLocation.district))
                ? "Try adjusting your filters or check back later."
                : "Please ensure your profile location is set to see relevant offline events, or check back later."
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sortedAnnouncements().map((announcement) => {
              const currentAttendees = Number(announcement.attendees_count) || 0;
              const maxCapacity = Number(announcement.max_capacity);
              const isFull = typeof maxCapacity === 'number' && !isNaN(maxCapacity) && currentAttendees >= maxCapacity;

              return (
                <Grid item xs={12} sm={6} md={4} key={announcement.id}>
                  <EventDisplayCard
                    event={announcement}
                    customActions={
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        {isFull ? (
                          <Typography color="text.secondary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                            Slots Filled
                          </Typography>
                        ) : (
                          <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            disabled={registeringEventId === announcement.id}
                            onClick={() => handleRegister(announcement.id)}
                            sx={{ minWidth: '100px' }}
                          >
                            {registeringEventId === announcement.id ? (
                              <CircularProgress size={24} color="inherit" />
                            ) : (
                              "Register"
                            )}
                          </Button>
                        )}
                      </Box>
                    }
                  />
                </Grid>
              );
            })}
          </Grid>
        )}
      </div>
      <Box className="footer" sx={{ mt: 4, textAlign: "center", pb: 3 }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Disaster Sentinel. All rights reserved.
        </Typography>
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}