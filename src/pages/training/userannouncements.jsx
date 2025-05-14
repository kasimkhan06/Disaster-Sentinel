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
  // Edit, // Removed as no longer needed
  // Delete // Removed as no longer needed
} from "@mui/icons-material";
// import { useNavigate } from "react-router-dom"; // Not used
// import axios from "axios"; // Not used

// Assuming this CSS file contains the styles you provided for .event-card, .tags-container etc.
import "../../../public/css/EventListing.css";

// Internal component for displaying event cards
// hideActions prop removed as Edit/Delete buttons are completely removed
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
      // Default image or for other types like "Online Meeting"
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

        {/* Edit and Delete buttons and their container (event-actions) have been completely removed */}

        {customActions && (
          <div style={{ marginTop: 'auto' }}> {/* Pushes custom actions to the bottom */}
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
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [registeringEventId, setRegisteringEventId] = useState(null);

  const fetchUserProfile = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.warn("User ID not found for fetching profile.");
        setUserLocation(null);
        return;
      }
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/users/${userId}/`
      );
      if (!response.ok) throw new Error(`Failed to fetch user profile: ${response.status}`);
      const data = await response.json();
      setUserLocation({
        state: data.state,
        city: data.city
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
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
        const announcementDate = new Date(announcement.date);
        return announcementDate >= currentDate;
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
    setRegisteringEventId(eventId);
    try {
      const eventResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`
      );
      if (!eventResponse.ok) throw new Error(`Failed to fetch event details: ${eventResponse.status}`);
      const eventData = await eventResponse.json();

      if (eventData.attendees_count >= eventData.max_capacity) {
        setSnackbar({ open: true, message: "This event is already full", severity: "warning" });
        return;
      }

      const updateResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ attendees_count: eventData.attendees_count + 1 })
        }
      );

      if (updateResponse.ok) {
        setSnackbar({ open: true, message: "Successfully registered for the event", severity: "success" });
        fetchAnnouncements();
      } else {
        const errorData = await updateResponse.json().catch(() => ({ detail: "Failed to register" }));
        throw new Error(errorData.detail || "Failed to register");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      setSnackbar({ open: true, message: error.message || "Failed to register for event", severity: "error" });
    } finally {
      setRegisteringEventId(null);
    }
  };

  useEffect(() => {
    fetchUserProfile();
    fetchAnnouncements();
  }, []);

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
      if (announcement.location_type === "online") return true;
      if (!userLocation || !userLocation.state) {
        return false;
      }
      return announcement.state === userLocation.state &&
             (!announcement.city || announcement.city === "" || announcement.city === userLocation.city);
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
          <FormControl sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" }, boxShadow: "2px 2px 2px #E8F1F5", position: "relative" }}>
            <InputLabel
                id="sort-by-label"
                sx={{
                    position: "absolute", top: -10, left: 8,
                    backgroundColor: "white",
                    padding: "0 4px", fontSize: "0.75rem", color: "text.secondary"
                }}
            >
                Sort By
            </InputLabel>
            <Select
              labelId="sort-by-label"
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
            <Typography variant="body1" sx={{mt: 1}}>Please check back later or adjust your location settings if applicable.</Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {sortedAnnouncements().map((announcement) => (
              <Grid item xs={12} sm={6} md={4} key={announcement.id}>
                <EventDisplayCard
                  event={announcement}
                  // hideActions prop removed as it's no longer used by EventDisplayCard
                  customActions={
                    <Box sx={{ mt: 2, textAlign: 'center' }}>
                      {announcement.attendees_count >= announcement.max_capacity ? (
                        <Typography color="error" variant="body2">
                          Event slots filled
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
                      <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        {announcement.attendees_count}/{announcement.max_capacity} slots filled
                      </Typography>
                    </Box>
                  }
                />
              </Grid>
            ))}
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