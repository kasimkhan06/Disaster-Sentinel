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
  CheckCircle
} from "@mui/icons-material";
import userAnnouncementsBackground from "../../../public/assets/background_image/world-map-background.jpg";
import "../../../public/css/EventListing.css"; // Ensure this path is correct
import Footer from "../../components/Footer"; // Ensure this path is correct

const COMPONENT_NAME = "EventDisplayCard";

function EventDisplayCard({ event, currentUser, onRegister }) {
  console.log(`[${COMPONENT_NAME}] Rendering with event:`, event?.id, "currentUser:", currentUser ? currentUser.id : 'null');
  const theme = useTheme();
  const initialIsRegistered = event.is_current_user_interested || false;
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);

  console.log(`[${COMPONENT_NAME}] Initial states - eventId: ${event?.id}, isRegistered: ${isRegistered} (from prop: ${initialIsRegistered}), loading: ${loading}`);

  useEffect(() => {
    const newIsRegistered = event.is_current_user_interested || false;
    console.log(`[${COMPONENT_NAME}] useEffect[event.is_current_user_interested] - eventId: ${event?.id}, Prop changed to: ${newIsRegistered}, Current state: ${isRegistered}`);
    if (newIsRegistered !== isRegistered) {
      console.log(`[${COMPONENT_NAME}] useEffect - Updating isRegistered for event ${event?.id} from ${isRegistered} to ${newIsRegistered}`);
      setIsRegistered(newIsRegistered);
    }
  }, [event.is_current_user_interested, event?.id]); // Added event.id for more specific logging context

  const handleRegisterInternal = async () => {
    console.log(`[${COMPONENT_NAME}] handleRegisterInternal called for event: ${event?.id}. CurrentUser exists: ${!!currentUser}, IsAlreadyRegistered: ${isRegistered}`);
    if (!currentUser) {
      console.warn(`[${COMPONENT_NAME}] handleRegisterInternal - No current user. Registration aborted for event ${event?.id}.`);
      // onRegister might handle showing a "please login" snackbar
      onRegister(event.id, true); // Pass a flag to indicate it's a pre-check failure due to no user
      return;
    }
    if (isRegistered) {
      console.warn(`[${COMPONENT_NAME}] handleRegisterInternal - User already registered for event ${event?.id}. Registration aborted.`);
      return;
    }

    console.log(`[${COMPONENT_NAME}] handleRegisterInternal - Setting loading to true for event ${event?.id}`);
    setLoading(true);
    try {
      console.log(`[${COMPONENT_NAME}] handleRegisterInternal - Calling onRegister for event ${event?.id}`);
      const success = await onRegister(event.id);
      console.log(`[${COMPONENT_NAME}] handleRegisterInternal - onRegister returned ${success} for event ${event?.id}`);
      // DO NOT set setIsRegistered(true) here; rely on prop update via useEffect
    } catch (error) {
      console.error(`[${COMPONENT_NAME}] handleRegisterInternal - Error during registration for event ${event?.id}:`, error);
    } finally {
      console.log(`[${COMPONENT_NAME}] handleRegisterInternal - Setting loading to false for event ${event?.id}`);
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

  const isEventFull = event.max_capacity > 0 && event.attendees_count >= event.max_capacity;
  console.log(`[${COMPONENT_NAME}] Button conditions for event ${event?.id} - isEventFull: ${isEventFull}, isRegistered: ${isRegistered}, loading: ${loading}, !!currentUser: ${!!currentUser}`);

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
          {isEventFull ? (
            <Typography color="text.secondary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Slots Filled
            </Typography>
          ) : isRegistered ? (
            <Button
              variant="contained"
              size="small"
              disabled
              startIcon={<CheckCircle />}
              sx={{
                minWidth: '150px',
                backgroundColor: theme.palette.success.main,
                color: 'white',
                '&.Mui-disabled': {
                  backgroundColor: theme.palette.success.light,
                  color: 'rgba(255, 255, 255, 0.8)',
                },
              }}
            >
              Registered
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              size="small"
              disabled={loading || !currentUser} // THIS IS THE KEY LINE FOR THE DISABLED STATE
              onClick={handleRegisterInternal}
              sx={{
                minWidth: '150px',
                transition: 'all 0.3s ease',
                textTransform: 'none', // Added to ensure text is not capitalized by default MUI button styles if that's an issue
                '&:hover': {
                  backgroundColor: (loading || !currentUser) ? undefined : theme.palette.primary.light,
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Register" // The text is "Register". If it shows "REGISTER", check CSS `text-transform`.
              )}
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

const PAGE_COMPONENT_NAME = "UserAnnouncementsPage";

export default function UserAnnouncementsPage() {
  console.log(`[${PAGE_COMPONENT_NAME}] Rendering or re-rendering...`);

  const [announcements, setAnnouncements] = useState([]);
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(null); // Initially null
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const theme = useTheme();

  console.log(`[${PAGE_COMPONENT_NAME}] Initial states: announcements#: ${announcements.length}, sort: ${sort}, filter: ${filter}, isLoading: ${isLoading}, userLocation:`, userLocation, "currentUser:", currentUser ? currentUser.id : 'null');

  const loadCurrentUserData = async () => {
    console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Attempting to load user data.`);
    try {
      const userString = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - localStorage userString:`, userString ? 'found' : 'not found', "token:", token ? 'found' : 'not found');

      if (!userString || !token) {
        console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - No user string or token. Setting currentUser and userLocation to null.`);
        setCurrentUser(null);
        setUserLocation(null);
        return;
      }
      
      const userDataFromStorage = JSON.parse(userString);
      console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Parsed userDataFromStorage:`, userDataFromStorage);

      if (userDataFromStorage?.user_id && userDataFromStorage?.state && userDataFromStorage?.district) {
        const CUser = {
          id: userDataFromStorage.user_id,
          state: userDataFromStorage.state,
          district: userDataFromStorage.district
        };
        console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Valid user data found. Setting currentUser:`, CUser, "and userLocation.");
        setCurrentUser(CUser);
        setUserLocation({ state: CUser.state, district: CUser.district });
      } else {
        console.warn(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Parsed user data incomplete. Setting currentUser and userLocation to null.`);
        setCurrentUser(null);
        setUserLocation(null);
      }
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Error processing user data:`, error);
      setCurrentUser(null);
      setUserLocation(null);
    }
    console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Finished.`);
  };

  const handleRegister = async (eventId, isPreCheckFailure = false) => {
    console.log(`[${PAGE_COMPONENT_NAME}] handleRegister called for eventId: ${eventId}, isPreCheckFailure: ${isPreCheckFailure}`);

    if (isPreCheckFailure && !currentUser?.id) {
        console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Pre-check failed: User not logged in. Showing snackbar.`);
        setSnackbar({ open: true, message: "Please login to register.", severity: "error" });
        return false;
    }

    if (!currentUser?.id) {
      console.warn(`[${PAGE_COMPONENT_NAME}] handleRegister - No currentUser ID. Aborting.`);
      setSnackbar({ open: true, message: "Please login to register.", severity: "error" });
      return false;
    }

    const token = localStorage.getItem('token');
    console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Token: ${token ? 'found' : 'not found'}`);
    if (!token) {
        console.warn(`[${PAGE_COMPONENT_NAME}] handleRegister - No token. Aborting.`);
        setSnackbar({ open: true, message: "Authentication token not found. Please login again.", severity: "error" });
        return false;
    }

    console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Proceeding with registration for event ${eventId}`);
    try {
      const interestPayload = {
        user_id: currentUser.id,
        event_id: eventId,
        interested: true
      };
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - 1. Marking interest. Payload:`, interestPayload);
      const interestResponse = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency/event-interests/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Token ${token}` },
          body: JSON.stringify(interestPayload)
        }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Interest API response status: ${interestResponse.status}`);
      if (!interestResponse.ok) {
        const errorData = await interestResponse.json().catch(() => ({ detail: `Interest API failed with status ${interestResponse.status}` }));
        console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - Failed to register interest:`, errorData.detail);
        throw new Error(errorData.detail || "Failed to register interest");
      }
      const interestData = await interestResponse.json();
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Interest marked successfully:`, interestData);

      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - 2. Fetching event details for capacity check for event ${eventId}`);
      const eventDetailsResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`,
        { headers: { "Authorization": `Token ${token}` } }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Event details API response status: ${eventDetailsResponse.status}`);
      if (!eventDetailsResponse.ok) {
        console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - Failed to fetch event details for capacity check.`);
        throw new Error("Failed to fetch event details for capacity check");
      }
      const eventData = await eventDetailsResponse.json();
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Event details fetched:`, eventData);
      const currentAttendees = Number(eventData.attendees_count) || 0;
      const maxCapacity = Number(eventData.max_capacity);
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Event ${eventId}: currentAttendees: ${currentAttendees}, maxCapacity: ${maxCapacity}`);

      if (maxCapacity > 0 && currentAttendees >= maxCapacity && !eventData.is_current_user_interested) {
        console.warn(`[${PAGE_COMPONENT_NAME}] handleRegister - Event ${eventId} became full.`);
        setSnackbar({ open: true, message: "This event became full just now.", severity: "warning" });
        fetchAnnouncements(); // Refetch to get the absolute latest state
        return false;
      }
      
      const newAttendeesCount = currentAttendees + 1; // Assuming successful registration means one more attendee
      const updatePayload = { attendees_count: newAttendeesCount };
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - 3. Updating attendance count for event ${eventId}. Payload:`, updatePayload);
      const updateResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${eventId}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json", "Authorization": `Token ${token}` },
          body: JSON.stringify(updatePayload)
        }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Update attendance API response status: ${updateResponse.status}`);
      if (!updateResponse.ok) {
        const errorData = await updateResponse.json().catch(() => ({ detail: `Update attendance API failed with status ${updateResponse.status}` }));
        console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - Failed to update attendance:`, errorData.detail);
        throw new Error(errorData.detail || "Failed to update attendance");
      }
      const updatedEventData = await updateResponse.json();
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Attendance updated successfully:`, updatedEventData);

      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Updating local announcements state for event ${eventId}`);
      setAnnouncements(prevAnnouncements => {
        const newAnnouncements = prevAnnouncements.map(event => 
          event.id === eventId 
            ? { ...event, is_current_user_interested: true, attendees_count: updatedEventData.attendees_count } 
            : event
        );
        console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - setAnnouncements complete. New count: ${newAnnouncements.length}`);
        return newAnnouncements;
      });

      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Registration successful for event ${eventId}. Showing success snackbar.`);
      setSnackbar({ open: true, message: "Successfully registered for the event!", severity: "success" });
      return true;
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - General error during registration for event ${eventId}:`, error.message);
      setSnackbar({ open: true, message: error.message || "Registration failed. Please try again.", severity: "error" });
      fetchAnnouncements(); // Ensure UI consistency after an error
      return false;
    }
  };

  const fetchAnnouncements = async () => {
    console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Starting to fetch announcements. Current isLoading: ${isLoading}`);
    setIsLoading(true);
    console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - setIsLoading(true)`);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { "Authorization": `Token ${token}` } : {};
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Token for API call: ${token ? 'present' : 'absent'}. Headers:`, headers);
      
      const response = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/",
        { headers }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - API response status: ${response.status}`);
      if (!response.ok) {
        console.error(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Failed to fetch. Status: ${response.status}`);
        throw new Error(`Failed to fetch: ${response.status}`);
      }
      
      let data = await response.json();
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Raw data received (count: ${data.length}):`, data.slice(0,1)); // Log first item for brevity
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Filtering announcements by date (>= ${currentDate.toISOString()}).`);
      const originalCount = data.length;
      data = data.filter(announcement => {
        if (!announcement.date) {
          console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Filtering out event ${announcement.id} due to missing date.`);
          return false;
        }
        const eventDate = new Date(announcement.date);
        const isValidDate = !isNaN(eventDate) && eventDate >= currentDate;
        if (!isValidDate) {
            console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Filtering out event ${announcement.id} (date: ${announcement.date}) as it's past or invalid.`);
        }
        return isValidDate;
      });
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Filtered announcements. Count changed from ${originalCount} to ${data.length}.`);

      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Setting announcements state.`);
      setAnnouncements(data);
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Error:`, error);
      setSnackbar({ open: true, message: "Failed to load announcements.", severity: "error" });
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - setIsLoading(false). Finished fetching.`);
    }
  };

  useEffect(() => {
    console.log(`[${PAGE_COMPONENT_NAME}] useEffect[] - Initial data load sequence starting.`);
    async function loadInitialData() {
      console.log(`[${PAGE_COMPONENT_NAME}] useEffect[] - Calling loadCurrentUserData.`);
      await loadCurrentUserData();
      console.log(`[${PAGE_COMPONENT_NAME}] useEffect[] - Calling fetchAnnouncements.`);
      await fetchAnnouncements();
      console.log(`[${PAGE_COMPONENT_NAME}] useEffect[] - Initial data load sequence finished.`);
    }
    loadInitialData();
  }, []); // Runs on component mount

  useEffect(() => {
    console.log(`[${PAGE_COMPONENT_NAME}] useEffect[currentUser?.id] - CurrentUser ID changed or component re-rendered. CurrentUser ID: ${currentUser?.id}`);
    // This effect might be too aggressive if fetchAnnouncements doesn't strictly depend on currentUser changing for its content
    // (e.g., if backend already uses token to determine 'is_current_user_interested').
    // For now, keeping it as it might be intended to refresh data if user logs in/out.
    if(currentUser !== undefined){ // Check if currentUser state has been initialized (is not the initial 'undefined' during setup)
        // No, this check for 'undefined' is not standard for useState. It will be null initially.
        // If you want to fetch only after first load and when currentUser.id specifically changes from one value to another (not from null to value):
        // You would need a ref to track previous currentUser.id if that's the precise logic.
        // For now, this will run if currentUser.id changes (e.g. null -> someId, or someId -> null)
        console.log(`[${PAGE_COMPONENT_NAME}] useEffect[currentUser?.id] - currentUser is defined (or null), proceeding to fetchAnnouncements.`);
        // fetchAnnouncements(); // Re-evaluate if this is needed or causes too many fetches.
                               // loadInitialData already calls fetchAnnouncements.
                               // This would be for cases where user logs in/out AFTER initial load.
    }
  }, [currentUser?.id]);

  const sortedAndFilteredAnnouncements = () => {
    console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Starting sort and filter. Initial count: ${announcements?.length}`);
    if (!announcements) {
        console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Announcements is null/undefined, returning [].`);
        return [];
    }
    let announcementsCopy = [...announcements];
    console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Current filter: '${filter}', sort: '${sort}'. UserLocation:`, userLocation);
    
    if (filter !== "all") {
      const countBeforeFilter = announcementsCopy.length;
      announcementsCopy = announcementsCopy.filter(ann =>
        (filter === "online" && ann.location_type?.toLowerCase() === "online") ||
        (filter === "offline" && ann.location_type?.toLowerCase() !== "online")
      );
      console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - After type filter ('${filter}'): count changed from ${countBeforeFilter} to ${announcementsCopy.length}`);
    }
    
    const countBeforeLocationFilter = announcementsCopy.length;
    announcementsCopy = announcementsCopy.filter(ann => {
      if (ann.location_type?.toLowerCase() === "online") return true;
      if (userLocation?.state && userLocation?.district) {
          if (!ann.state) {
            console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Filtering out offline event ${ann.id} (no state) for user in ${userLocation.state}/${userLocation.district}`);
            return false;
          }
          const userState = userLocation.state.trim().toUpperCase();
          const userDistrict = userLocation.district.trim().toUpperCase();
          const eventState = ann.state.trim().toUpperCase();
          const eventDistrict = ann.district ? ann.district.trim().toUpperCase() : "";

          if (eventState !== userState) {
            console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Filtering out offline event ${ann.id} (state: ${eventState}) for user in state ${userState}`);
            return false;
          }
          if (eventDistrict && eventDistrict !== userDistrict) {
            console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Filtering out offline event ${ann.id} (district: ${eventDistrict}) for user in district ${userDistrict}`);
            return false;
          }
          return true; // Match
      }
      // If user location is not set, show all offline events that passed the 'offline' filter.
      // To hide them if user location is not set, add: if (!userLocation?.state || !userLocation?.district) return false;
      console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Event ${ann.id} (offline) kept because userLocation not fully set or matches.`);
      return true;
    });
    console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - After location filter: count changed from ${countBeforeLocationFilter} to ${announcementsCopy.length}`);
    
    const sortFn = {
      newest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
      nameAZ: (a, b) => a.name.localeCompare(b.name),
      nameZA: (a, b) => b.name.localeCompare(a.name),
    };
    
    announcementsCopy.sort(sortFn[sort] || sortFn.newest);
    console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - After sort ('${sort}'). Final count: ${announcementsCopy.length}`);
    return announcementsCopy;
  };

  const handleCloseSnackbar = (_, reason) => {
    console.log(`[${PAGE_COMPONENT_NAME}] handleCloseSnackbar called. Reason: ${reason}`);
    if (reason === 'clickaway') {
      console.log(`[${PAGE_COMPONENT_NAME}] handleCloseSnackbar - Clickaway, not closing.`);
      return;
    }
    console.log(`[${PAGE_COMPONENT_NAME}] handleCloseSnackbar - Closing snackbar.`);
    setSnackbar({ ...snackbar, open: false });
  };

  const finalAnnouncements = sortedAndFilteredAnnouncements();
  console.log(`[${PAGE_COMPONENT_NAME}] Render - finalAnnouncements count: ${finalAnnouncements.length}, isLoading: ${isLoading}`);

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
              <Select value={filter} onChange={(e) => { console.log(`[${PAGE_COMPONENT_NAME}] Filter changed to: ${e.target.value}`); setFilter(e.target.value);}}
                labelId="filter-select-label" id="filter-select-input"
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
              <Select value={sort} onChange={(e) => { console.log(`[${PAGE_COMPONENT_NAME}] Sort changed to: ${e.target.value}`); setSort(e.target.value);}}
                labelId="sort-select-label" id="sort-select-input"
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

      <Box className="container" sx={{ flex: 1, pb: 4, width: '100%', maxWidth: '1000px', marginX: 'auto', px: { xs: 2, sm: 3 } }}>
        {isLoading ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 10, height: '300px' }}>
            {console.log(`[${PAGE_COMPONENT_NAME}] Render - Showing loading spinner.`)}
            <CircularProgress size={50} sx={{ mb: 2, color: theme.palette.primary.main }} />
            <Typography variant="h6" color="text.secondary">Loading announcements...</Typography>
          </Box>
        ) : finalAnnouncements.length === 0 ? (
          <Box sx={{ textAlign: "center", p: {xs: 2, sm: 3}, backgroundColor: 'transparent', borderRadius: 0 }}>
            {console.log(`[${PAGE_COMPONENT_NAME}] Render - No announcements to display.`)}
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
            {console.log(`[${PAGE_COMPONENT_NAME}] Render - Mapping ${finalAnnouncements.length} announcements to EventDisplayCard.`)}
            {finalAnnouncements.map((announcement) => {
              console.log(`[${PAGE_COMPONENT_NAME}] Render - Mapping event ID: ${announcement.id}`);
              return (
                <Grid item xs={12} sm={6} md={4} key={announcement.id} sx={{ display: 'flex' }}>
                  <EventDisplayCard
                    event={announcement}
                    currentUser={currentUser}
                    onRegister={handleRegister}
                  />
                </Grid>
              );
            })}
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