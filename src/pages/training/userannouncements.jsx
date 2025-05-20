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
import { useTheme } from "@mui/material/styles";
import {
  CalendarToday,
  LocationOn,
  Videocam,
  Send,
  CheckCircle,
  CheckCircleOutline
} from "@mui/icons-material";
import userAnnouncementsBackground from "../../../public/assets/background_image/world-map-background.jpg";
import "../../../public/css/EventListing.css";
import Footer from "../../components/Footer";

function EventDisplayCard({ event, currentUser, onRegister }) {
  const [isRegistered, setIsRegistered] = useState(event.is_current_user_interested || false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (isRegistered) return;
    
    setLoading(true);
    try {
      await onRegister(event.id);
      setIsRegistered(true);
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

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
      <img src={getImage()} alt={event.event_type || "Event"} className="event-img"/>
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
              <LocationOn fontSize="small" sx={{ mr: 0.5 }} />
              {event.venue_name}{event.venue_name && (event.district || event.state) ? ", " : ""}
              {event.district}{event.district && event.state ? ", " : ""}
              {event.state}
            </Typography>
          )}
          {getTagsBadge()}
        </div>
        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
          {event.max_capacity > 0 && event.attendees_count >= event.max_capacity ? (
            <Button
              variant="contained"
              color="secondary"
              size="small"
              disabled
              sx={{ minWidth: '150px' }}
            >
              Event Full
            </Button>
          ) : (
            <Button
              variant={isRegistered ? "contained" : "outlined"}
              color={isRegistered ? "success" : "primary"}
              size="small"
              disabled={loading || isRegistered || !currentUser}
              onClick={handleRegister}
              startIcon={isRegistered ? <CheckCircle /> : <CheckCircleOutline />}
              sx={{ minWidth: '150px' }}
            >
              {loading ? (
                <CircularProgress size={20} />
              ) : isRegistered ? (
                "Registered"
              ) : (
                "Register"
              )}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default function UserAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState([]);
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const theme = useTheme();

  const loadCurrentUserData = async () => {
    try {
      const userString = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      if (!userString || !token) {
        setCurrentUser(null);
        setUserLocation(null);
        return;
      }
      
      const userDataFromStorage = JSON.parse(userString);
      if (userDataFromStorage?.user_id && userDataFromStorage?.state && userDataFromStorage?.district) {
        const CUser = {
          id: userDataFromStorage.user_id,
          state: userDataFromStorage.state,
          district: userDataFromStorage.district
        };
        setCurrentUser(CUser);
        setUserLocation({ state: CUser.state, district: CUser.district });
      } else {
        setCurrentUser(null);
        setUserLocation(null);
      }
    } catch (error) {
      console.error("[UserAnnouncementsPage] Error processing user data:", error);
      setCurrentUser(null);
      setUserLocation(null);
    }
  };

  const handleRegister = async (eventId) => {
    if (!currentUser?.id) {
      setSnackbar({ open: true, message: "Please login to register.", severity: "error" });
      return false;
    }

    try {
      const token = localStorage.getItem('token');
      
      // 1. Mark interest in the event
      const interestResponse = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency/event-interests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          },
          body: JSON.stringify({
            user_id: currentUser.id,
            event_id: eventId,
            interested: true
          })
        }
      );

      if (!interestResponse.ok) {
        throw new Error("Failed to register interest");
      }

      // 2. Update attendance count
      const eventResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`
      );
      
      if (!eventResponse.ok) {
        throw new Error("Failed to fetch event details");
      }
      
      const eventData = await eventResponse.json();
      const currentAttendees = Number(eventData.attendees_count) || 0;
      const maxCapacity = Number(eventData.max_capacity);

      if (maxCapacity > 0 && currentAttendees >= maxCapacity) {
        setSnackbar({ open: true, message: "This event is full.", severity: "warning" });
        return false;
      }

      const updateResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Token ${token}`
          },
          body: JSON.stringify({
            attendees_count: currentAttendees + 1
          })
        }
      );

      if (!updateResponse.ok) {
        throw new Error("Failed to update attendance");
      }

      // Update local state
      setAnnouncements(prev => prev.map(event => 
        event.id === eventId 
          ? { 
              ...event, 
              is_current_user_interested: true,
              attendees_count: currentAttendees + 1 
            } 
          : event
      ));

      setSnackbar({
        open: true,
        message: "Successfully registered for the event!",
        severity: "success"
      });
      
      return true;
    } catch (error) {
      setSnackbar({
        open: true,
        message: error.message || "Registration failed",
        severity: "error"
      });
      throw error;
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { "Authorization": `Token ${token}` } : {};
      
      const response = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/",
        { headers }
      );
      
      if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
      
      let data = await response.json();
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      // Filter valid announcements
      data = data.filter(announcement => {
        if (!announcement.date) return false;
        const eventDate = new Date(announcement.date);
        return !isNaN(eventDate) && eventDate >= currentDate;
      });

      setAnnouncements(data);
    } catch (error) {
      console.error("Error fetching announcements:", error);
      setSnackbar({ open: true, message: "Failed to load announcements.", severity: "error" });
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      await loadCurrentUserData();
      await fetchAnnouncements();
    }
    loadInitialData();
  }, []);

  const sortedAndFilteredAnnouncements = () => {
    if (!announcements) return [];
    let announcementsCopy = [...announcements];
    
    if (filter !== "all") {
      announcementsCopy = announcementsCopy.filter(ann =>
        (filter === "online" && ann.location_type?.toLowerCase() === "online") ||
        (filter === "offline" && ann.location_type?.toLowerCase() !== "online")
      );
    }
    
    announcementsCopy = announcementsCopy.filter(ann => {
      if (ann.location_type?.toLowerCase() === "online") return true;
      if (!userLocation?.state || !userLocation?.district) return true;
      if (!ann.state) return false;
      
      const userState = userLocation.state.trim().toUpperCase();
      const userDistrict = userLocation.district.trim().toUpperCase();
      const eventState = ann.state.trim().toUpperCase();
      const eventDistrict = ann.district ? ann.district.trim().toUpperCase() : "";
      
      if (eventState !== userState) return false;
      return !eventDistrict || eventDistrict === userDistrict;
    });
    
    const sortFn = {
      newest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
      nameAZ: (a, b) => a.name.localeCompare(b.name),
      nameZA: (a, b) => b.name.localeCompare(a.name),
    };
    
    announcementsCopy.sort(sortFn[sort] || sortFn.newest);
    return announcementsCopy;
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  const finalAnnouncements = sortedAndFilteredAnnouncements();

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
        <Box sx={{
          maxWidth: '1000px',
          marginX: 'auto',
          px: { xs: 2, sm: 3 },
          pt: { xs: 2, sm: 3 },
        }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: {xs: 1, sm: 2} }}>
            <Typography sx={{ textAlign: "center", mt: 7, mb: 3, fontSize: { xs: "1.2rem", md: "1.2rem" }, fontWeight: "bold", textTransform: 'uppercase', color: "rgba(0, 0, 0, 0.87)"}}>
              Announcements
            </Typography>
          </Box>

          <Box className="controls" sx={{ display: "flex", flexDirection: {xs: 'column', sm: 'row'}, justifyContent: "flex-start", alignItems:'center', gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" }, boxShadow: "2px 2px 2px #E8F1F5", position: "relative", backgroundColor: 'white' }}>
              <InputLabel htmlFor="filter-select-input" id="filter-select-label" sx={{ position: "absolute", top: -10, left: 8, padding: "0 4px", fontSize: "0.75rem", color: "text.secondary" }}>
                Filter By
              </InputLabel>
              <Select labelId="filter-select-label" id="filter-select-input" value={filter} onChange={(e) => setFilter(e.target.value)}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, "& .MuiSelect-select": { padding: "10px 14px" }, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" }, }}
              >
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="online">Online</MenuItem>
                <MenuItem value="offline">Offline</MenuItem>
              </Select>
            </FormControl>
            <FormControl sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" }, boxShadow: "2px 2px 2px #E8F1F5", position: "relative", backgroundColor: 'white' }}>
              <InputLabel htmlFor="sort-select-input" id="sort-select-label" sx={{ position: "absolute", top: -10, left: 8, padding: "0 4px", fontSize: "0.75rem", color: "text.secondary" }}>
                Sort By
              </InputLabel>
              <Select labelId="sort-select-label" id="sort-select-input" value={sort} onChange={(e) => setSort(e.target.value)}
                sx={{ "& .MuiOutlinedInput-notchedOutline": { border: "none" }, "& .MuiSelect-select": { padding: "10px 14px" }, fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" }, }}
              >
                <MenuItem value="newest">Newest First</MenuItem>
                <MenuItem value="oldest">Oldest First</MenuItem>
                <MenuItem value="nameAZ">Name A-Z</MenuItem>
                <MenuItem value="nameZA">Name Z-A</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Box>

      <Box
        className="container"
        sx={{
          flex: 1,
          pb: 4,
          width: '100%',
        }}
      >
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 10, height: '300px' }}>
            <CircularProgress size={50} sx={{ mb: 2, color: theme.palette.primary.main }} />
            <Typography variant="h6" color="text.secondary">Loading announcements...</Typography>
          </Box>
        ) : finalAnnouncements.length === 0 ? (
          <Box sx={{ textAlign: "center", p: {xs: 2, sm: 3}, backgroundColor: 'transparent', borderRadius: 0 }}>
            <Typography variant="h6" component="p" gutterBottom sx={{ fontWeight: 500, color: '#333' }}>
              No announcements available at the moment.
            </Typography>
            <Typography variant="body1" color="#555" sx={{ mt: 1 }}>
              {!userLocation?.state || !userLocation?.district
                ? "Please ensure your profile location is set to see relevant offline events, or check back later."
                : `No events currently match your location (State: ${userLocation.state}, District: ${userLocation.district}) or selected filters. Please check back later.`
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {finalAnnouncements.map((announcement) => (
              <Grid item xs={12} sm={6} md={4} key={announcement.id} sx={{ display: 'flex' }}>
                <EventDisplayCard
                  event={announcement}
                  currentUser={currentUser}
                  onRegister={handleRegister}
                />
              </Grid>
            ))}
          </Grid>
        )}
      </Box>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Footer />
    </Box>
  );
}