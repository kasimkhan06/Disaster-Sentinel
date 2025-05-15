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

import "../../../public/css/EventListing.css"; // Ensure this path is correct

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
      return "/assets/Event Images/seminar.jpg"; // Ensure these paths are correct
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
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [registeringEventId, setRegisteringEventId] = useState(null);

  const fetchUserRegistrations = async (userId) => {
    console.log("[UserAnnouncementsPage] Attempting to fetch registrations for user ID:", userId);
    try {
        // Replace with actual API call: e.g., const response = await fetch(`/api/users/${userId}/registered-events/`);
        console.log("[UserAnnouncementsPage] fetchUserRegistrations needs a real API endpoint to get events user is registered for.");
        // Example: setRegisteredEventIds(new Set([1, 3])); // For testing
    } catch (error) {
        console.error("[UserAnnouncementsPage] Error fetching user registrations:", error);
        setSnackbar({ open: true, message: "Could not load your registration status for events.", severity: "warning" });
    }
  };

  const loadCurrentUserData = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) {
        console.warn("[UserAnnouncementsPage] User data string not found in localStorage. User-specific features will be limited.");
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
        console.log("[UserAnnouncementsPage] User data loaded from localStorage:", CUser);
        setCurrentUser(CUser);
        setUserLocation({ state: CUser.state, district: CUser.district });
        // fetchUserRegistrations(CUser.id); // Call when API is ready
      } else {
        console.warn("[UserAnnouncementsPage] Parsed user data from localStorage is missing user_id, state, or district.", userDataFromStorage);
        setCurrentUser(null);
        setUserLocation(null);
      }
    } catch (error) {
      console.error("[UserAnnouncementsPage] Error processing user data from localStorage:", error);
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

      const validAnnouncements = data.filter(announcement => {
        return announcement.date && new Date(announcement.date) >= currentDate;
      });
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
      console.log("Event data fetched:", eventData);

      const currentAttendees = eventData.attendees || 0;
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
      
      // If user-specific registration is implemented on backend:
      // const userSpecificRegResponse = await fetch('/api/register-user-for-event', { ... });

      if (updateResponse.ok) { // && userSpecificRegResponse.ok)
        setSnackbar({ open: true, message: "Successfully registered for the event!", severity: "success" });
        fetchAnnouncements();
        // setRegisteredEventIds(prev => new Set(prev).add(eventId)); // Update UI if tracking registrations
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
      // fetchUserRegistrations(currentUser.id); // UNCOMMENT AND IMPLEMENT when your API is ready
    }
  }, [currentUser]);


  const sortedAnnouncements = () => {
    if (!announcements) return [];
    let announcements_copy = [...announcements];

    if (sort === "newest") {
      announcements_copy.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "oldest") {
      announcements_copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === "nameAZ") {
      announcements_copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameZA") {
      announcements_copy.sort((a, b) => b.name.localeCompare(a.name));
    }

    return announcements_copy.filter(announcement => {
      if (announcement.location_type && announcement.location_type.toLowerCase() === "online") {
        return true;
      }
      if (!userLocation || !userLocation.state || !userLocation.district) {
        return false;
      }
      if (!announcement.state) {
        return false;
      }
      const userState = userLocation.state.toUpperCase();
      const userDistrict = userLocation.district.toUpperCase();
      const eventState = announcement.state.toUpperCase();
      const eventDistrict = announcement.district ? announcement.district.trim().toUpperCase() : "";

      if (eventState !== userState) {
        return false;
      }
      if (eventDistrict !== "") { 
        if (eventDistrict !== userDistrict) {
          return false;
        }
      }
      return true;
    });
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="background-image">
      <div className="container">
        <Box className="header" sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
          <Typography variant="h4" sx={{ flexGrow: 1, textAlign: "center", fontSize: { xs: "1.5rem", md: "2rem" } }}>
            Announcements
          </Typography>
        </Box>
        <Box className="controls" sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mb: 3 }}>
          {/* ACCESSIBILITY FIXES APPLIED HERE */}
          <FormControl sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" }, boxShadow: "2px 2px 2px #E8F1F5", position: "relative" }}>
            <InputLabel
              htmlFor="sort-select-input" // Points to Select's id
              id="sort-select-label"    // Id for this label
              sx={{
                position: "absolute", top: -10, left: 8,
                backgroundColor: "white",
                padding: "0 4px", fontSize: "0.75rem", color: "text.secondary"
              }}
            >
              Sort By
            </InputLabel>
            <Select
              labelId="sort-select-label" // Refers to InputLabel's id
              id="sort-select-input"     // Unique id for the Select
              name="sortCriteria"          // Name for the Select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                "& .MuiSelect-select": { padding: "10px 14px" },
                fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
              }}
            >
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="nameAZ">Name A-Z</MenuItem>
              <MenuItem value="nameZA">Name Z-A</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <CircularProgress size={50} sx={{ color: "#4F646F", mb: 2 }} />
            <Typography>Loading announcements...</Typography>
          </Box>
        ) : sortedAnnouncements().length === 0 ? (
          <Box sx={{ textAlign: "center", mt: 5 }}>
            <Typography variant="h6">No announcements available at the moment.</Typography>
            <Typography variant="body1" sx={{mt: 1}}>
              { !userLocation || !userLocation.state || !userLocation.district
                ? "Please ensure your profile location (state and district) is set to see relevant offline events, or check back later."
                : `No events currently match your location (State: ${userLocation.state}, District: ${userLocation.district}) or selected filters. Please check back later.`
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sortedAnnouncements().map((announcement) => {
              const currentAttendees = Number(announcement.attendees_count) || 0;
              const maxCapacity = Number(announcement.max_capacity);
              const isFull = typeof maxCapacity === 'number' && !isNaN(maxCapacity) && currentAttendees >= maxCapacity;
              
              // const isAlreadyRegistered = currentUser && registeredEventIds.has(announcement.id); // UNCOMMENT WHEN READY

              return (
                <Grid item xs={12} sm={6} md={4} key={announcement.id}>
                  <EventDisplayCard
                    event={announcement}
                    customActions={
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        {/*
                        // UNCOMMENT AND USE THIS BLOCK WHEN isAlreadyRegistered IS IMPLEMENTED
                        isAlreadyRegistered ? (
                          <>
                            <Button variant="contained" size="small" disabled sx={{ minWidth: '100px', backgroundColor: 'success.main', color: 'white', '&:disabled': { backgroundColor: 'success.light', color: 'rgba(0, 0, 0, 0.7)'} }}>
                              Registered
                            </Button>
                            <Typography variant="caption" display="block" sx={{ mt: 1, color: 'success.main' }}>
                              You have already registered for this event.
                            </Typography>
                          </>
                        ) : */
                        isFull ? (
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