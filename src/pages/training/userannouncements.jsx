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
  useMediaQuery,
  Button,
  Snackbar,
  Alert
} from "@mui/material";
import EventCard from "../../components/EventCard.jsx";
import "../../../public/css/EventListing.css";

export default function UserAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState(null);
  const [sort, setSort] = useState("newest");
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const [registeringEventId, setRegisteringEventId] = useState(null);

  // Fetch user profile to get location
  const fetchUserProfile = async () => {
    try {
      // In a real app, you would get the user ID from authentication context
      const userId = localStorage.getItem('userId'); // Example - adjust based on your auth
      if (!userId) return;
      
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/users/${userId}/`
      );
      const data = await response.json();
      setUserLocation({
        state: data.state,
        city: data.city
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
    }
  };

  // Function to fetch announcements
  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/");
      const data = await response.json();
      const currentDate = new Date();
      
      // Filter out past events
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

  // Function to register for an event
  const handleRegister = async (eventId) => {
    setRegisteringEventId(eventId);
    try {
      // First get the current event to check capacity
      const eventResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`
      );
      const eventData = await eventResponse.json();
      
      // Check if event has capacity (assuming attendees_count and max_capacity fields)
      if (eventData.attendees_count >= eventData.max_capacity) {
        setSnackbar({ open: true, message: "This event is already full", severity: "warning" });
        return;
      }
      
      // Update the event to increment attendees_count
      const updateResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            attendees_count: eventData.attendees_count + 1
          })
        }
      );
      
      if (updateResponse.ok) {
        setSnackbar({ open: true, message: "Successfully registered for the event", severity: "success" });
        // Refresh the announcements to show updated count
        fetchAnnouncements();
      } else {
        throw new Error("Failed to register");
      }
    } catch (error) {
      console.error("Error registering for event:", error);
      setSnackbar({ open: true, message: "Failed to register for event", severity: "error" });
    } finally {
      setRegisteringEventId(null);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchUserProfile();
    fetchAnnouncements();
  }, []);

  const sortedAnnouncements = () => {
    if (!announcements) return [];

    let announcements_copy = [...announcements];

    // Sorting logic
    if (sort === "newest") {
      announcements_copy.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "oldest") {
      announcements_copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === "nameAZ") {
      announcements_copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameZA") {
      announcements_copy.sort((a, b) => b.name.localeCompare(a.name));
    }

    // Filter announcements based on location
    return announcements_copy.filter(announcement => {
      // Online events are visible to everyone
      if (announcement.location_type === "online") return true;
      
      // Offline events only if user location matches
      if (!userLocation || !userLocation.state) return false;
      
      return announcement.state === userLocation.state && 
             (!announcement.city || announcement.city === userLocation.city);
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <div className="background-image">
      <div className="container">
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Box sx={{ flexGrow: 1, justifyItems: "center", marginX: "auto" }}>
            <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "2rem" }, textAlign: "center" }}>
              Announcements
            </Typography>
          </Box>
        </div>
        <div className="controls" style={{ display: "flex", justifyContent: "flex-end", gap: "15px", marginBottom: "20px" }}>
          <Box
            sx={{
              paddingLeft: 3,
              mb: 3,
              textAlign: "left",
              boxShadow: "2px 2px 2px #E8F1F5",
              position: "relative",
              width: { xs: "200px", md: "150px" },
            }}
          >
            <InputLabel
              sx={{
                position: "absolute",
                top: -5,
                left: 16,
                backgroundColor: "background.paper",
                padding: "0 2px",
                fontSize: { xs: "0.55rem", sm: "0.6rem", md: "0.75rem" },
                color: "text.secondary",
                fontStyle: "italic",
              }}
            >
              Sort By
            </InputLabel>
            <FormControl fullWidth>
              <Select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  "& .MuiSelect-select": { padding: "9px 32px 4px 12px" },
                  fontSize: { xs: "0.7rem", sm: "0.8rem", md: "1rem" },
                }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="nameAZ">Name A-Z</MenuItem>
                <MenuItem value="nameZA">Name Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </div>

        {isLoading ? (
          <div className="loading-events" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <CircularProgress size={50} sx={{ color: "#4F646F", marginBottom: "10px" }} />
            <Typography>Loading announcements...</Typography>
          </div>
        ) : sortedAnnouncements().length === 0 ? (
          <div className="no-events" style={{ textAlign: "center", marginTop: "50px" }}>
            <Typography variant="h6">No announcements available at the moment.</Typography>
          </div>
        ) : (
          <Grid container spacing={3}>
            {sortedAnnouncements().map((announcement) => (
              <Grid item xs={12} sm={6} md={4} key={announcement.id}>
                <EventCard 
                  event={announcement}
                  hideActions // Prop to hide edit/delete buttons in EventCard
                  customActions={
                    <Box sx={{ mt: 2 }}>
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
                        >
                          {registeringEventId === announcement.id ? (
                            <CircularProgress size={24} />
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
      <div className="footer" style={{ marginTop: "20px", textAlign: "center", paddingBottom: "20px" }}>
        <Typography variant="body2" color="text.secondary">
          &copy; {new Date().getFullYear()} Disaster Sentinel. All rights reserved.
        </Typography>
      </div>
      
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
}