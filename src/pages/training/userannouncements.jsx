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
import { useNavigate } from "react-router-dom";

import "../../../public/css/EventListing.css"; // Ensure this path is correct
import Footer from "../../components/Footer"; // Ensure this path is correct
import useMediaQuery from "@mui/material/useMediaQuery";

// Define EventDisplayCard FIRST, as UserAnnouncementsPage uses it.
const EVENT_DISPLAY_CARD_COMPONENT_NAME = "EventDisplayCard";

function EventDisplayCard({ event, currentUser, onRegister, onUnregister, onLoginRedirect }) { // Added onUnregister prop
  const theme = useTheme();
  const initialIsRegistered = !!event.is_current_user_interested;
  const [isRegistered, setIsRegistered] = useState(initialIsRegistered);
  const [loading, setLoading] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    const newIsRegistered = !!event.is_current_user_interested;
    if (newIsRegistered !== isRegistered) {
      setIsRegistered(newIsRegistered);
    }
  }, [event.is_current_user_interested, event?.id, isRegistered]);

  const handleRegisterInternal = async () => {
    console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal called for event: ${event?.id}. CurrentUser exists: ${!!currentUser}, IsAlreadyRegistered: ${isRegistered}`);
    if (!currentUser) {
      console.warn(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - No current user (user_id not available). Displaying login prompt.`);
      setShowLoginPrompt(true);
      return;
    }
    if (isRegistered) {
      console.warn(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - User already registered for event ${event?.id}. Registration aborted.`);
      return;
    }

    setShowLoginPrompt(false);
    console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - Setting loading to true for event ${event?.id}`);
    setLoading(true);
    try {
      console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - Calling onRegister for event ${event?.id}`);
      const success = await onRegister(event.id);
      console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - onRegister returned ${success} for event ${event?.id}`);
    } catch (error) {
      console.error(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - Error during registration for event ${event?.id}:`, error);
    } finally {
      console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - Setting loading to false for event ${event?.id}`);
      setLoading(false);
    }
  };

  const handleUnregisterInternal = async () => {
    console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal called for event: ${event?.id}. CurrentUser exists: ${!!currentUser}, IsRegistered: ${isRegistered}`);
    if (!currentUser) { // Should not happen if button is only shown when registered
      console.warn(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - No current user. Unregistration aborted.`);
      onLoginRedirect();
      return;
    }
    if (!isRegistered || !event.interest_record_id) {
      console.warn(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - User not registered or missing interest_record_id for event ${event?.id}. Unregistration aborted.`);
      return;
    }

    setShowLoginPrompt(false);
    console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - Setting loading to true for event ${event?.id}`);
    setLoading(true);
    try {
      console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - Calling onUnregister for event ${event?.id} with interest_record_id ${event.interest_record_id}`);
      const success = await onUnregister(event.interest_record_id); // Pass the interest record ID
      console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - onUnregister returned ${success} for event ${event?.id}`);
    } catch (error) {
      console.error(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - Error during unregistration for event ${event?.id}:`, error);
    } finally {
      console.log(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - Setting loading to false for event ${event?.id}`);
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
      return "/assets/Event Images/seminar1.webp";
    } else if (event.event_type === "Workshop") {
      return "/assets/Event Images/Workshops-22.jpg";
    } else {
      return "/assets/Event Images/webinar.jpg";
    }
  };

  const toCapitalizeCase = (str) => {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  };

  const isEventFull = event.max_capacity > 0 && event.attendees_count >= event.max_capacity;

  return (
    <Card className="event-card">
      <img src={getImage()} alt={event.event_type || "Event"} className="event-img" />
      <CardContent className="event-content">
        <Typography variant="h6" className="event-title">
          {event.name.toUpperCase()}
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
              {toCapitalizeCase(event.venue_name)}{event.venue_name && (event.district || event.state) ? ", " : ""}
              {event.district}{event.district && event.state ? ", " : ""}
              {event.state}
            </Typography>
          )}
          {getTagsBadge()}
        </div>
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {isEventFull ? (
            <Typography color="text.secondary" variant="subtitle1" sx={{ fontWeight: 'bold' }}>
              Slots Filled
            </Typography>
          ) : isRegistered ? (
            <Button
              // "Unregister" Button Styling
              size="small"
              disabled={loading} // Only disable due to loading
              onClick={handleUnregisterInternal} // Call the new unregister handler
              sx={{
                minWidth: '150px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                py: 1.5,
                fontWeight: 500, // Match "Register" button
                color: theme.palette.error.main, // Use red for unregister
                borderColor: theme.palette.error.main, // Add border for distinction if not filled
                '&:hover': {
                  // backgroundColor: theme.palette.error.light,
                  // color: 'white',
                },
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Unregister"
              )}
            </Button>
          ) : (
            <Button
              size="small"
              disabled={loading}
              onClick={handleRegisterInternal}
              sx={{
                minWidth: '150px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                py: 1.5,
                fontWeight: 500,
                color: theme.palette.success.main,
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Register"
              )}
            </Button>
          )}
          {showLoginPrompt && ( // Display prompt only if showLoginPrompt is true
            <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
              Please login to register.
              <Button size="small" onClick={onLoginRedirect} sx={{ ml: 0.5, p: 0, textTransform: 'none', fontSize: '0.75rem', color: theme.palette.primary.main, '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' } }}>Login</Button>
            </Typography>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

const PAGE_COMPONENT_NAME = "UserAnnouncementsPage";

export default function UserAnnouncementsPage() {
  console.log(`[${PAGE_COMPONENT_NAME}] Rendering or re-rendering...`);
  const navigate = useNavigate();

  const [announcements, setAnnouncements] = useState([]);
  const [sort, setSort] = useState("newest");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });
  const isBelow = useMediaQuery("(max-width:1470px)");


  const theme = useTheme();

  console.log(`[${PAGE_COMPONENT_NAME}] Initial states on render: announcements#: ${announcements.length}, sort: ${sort}, filter: ${filter}, isLoading: ${isLoading}, userLocation:`, userLocation, "currentUser:", currentUser ? currentUser.id : 'null');

  // Function to handle redirection to login
  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
  };

  const loadCurrentUserData = async () => {
    console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Attempting to load user data.`);
    try {
      const userString = localStorage.getItem('user');
      console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - localStorage userString: ${userString ? 'found' : 'not found'}`);

      if (!userString) {
        console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - No user string found. Setting currentUser and userLocation to null.`);
        setCurrentUser(null);
        setUserLocation(null);
        return;
      }


      const userDataFromStorage = JSON.parse(userString);
      console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Parsed userDataFromStorage:`, userDataFromStorage);

      if (userDataFromStorage?.user_id) {
        const CUser = { id: userDataFromStorage.user_id };

        if (userDataFromStorage.state && userDataFromStorage.district) {
          CUser.state = userDataFromStorage.state;
          CUser.district = userDataFromStorage.district;
          setUserLocation({ state: userDataFromStorage.state, district: userDataFromStorage.district });
          console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Full user data with location found. Setting currentUser:`, CUser, "and userLocation:", { state: CUser.state, district: CUser.district });
        } else if (userDataFromStorage.state) {
          CUser.state = userDataFromStorage.state;
          setUserLocation({ state: userDataFromStorage.state, district: null });
          console.log(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - User data with state only found. Setting currentUser:`, CUser, "and userLocation:", { state: CUser.state, district: null });
        } else {
          setUserLocation(null);
          console.warn(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - User ID found, but no location data. User will only see online events. Data:`, userDataFromStorage);
        }
        setCurrentUser(CUser);

      } else {
        console.warn(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Parsed user data incomplete (missing user_id). Setting currentUser and userLocation to null. Data:`, userDataFromStorage);
        setCurrentUser(null);
        setUserLocation(null);
      }
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] loadCurrentUserData - Error processing user data from localStorage:`, error);
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
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - User not identified (currentUser ID is null/undefined). Showing snackbar.`);
      setSnackbar({ open: true, message: "Please ensure you are logged in to register.", severity: "error" });
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
        user_id_input: currentUser.id,
        event_id_input: eventId,
        interested: true
      };
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - 1. Marking interest. Payload:`, interestPayload);
      const interestResponse = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/event-interests/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(interestPayload)
        }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Interest API response status: ${interestResponse.status}`);
      if (!interestResponse.ok) {
        let errorData = {};
        try {
          errorData = await interestResponse.json();
        } catch (jsonError) {
          errorData = { detail: `Interest API failed with status ${interestResponse.status} and no parseable JSON response.` };
        }
        console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - Failed to register interest:`, errorData);
        throw new Error(errorData.detail || errorData.non_field_errors || `Failed to register interest. Status: ${interestResponse.status}`);
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
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload)
        }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] handleRegister - Update attendance API response status: ${updateResponse.status}`);
      if (!updateResponse.ok) {
        let errorData = {};
        try {
          errorData = await updateResponse.json();
        } catch (jsonError) {
          errorData = { detail: `Update attendance API failed with status ${updateResponse.status} and no parseable JSON response.` };
        }
        console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - Failed to update attendance:`, errorData);
        throw new Error(errorData.detail || `Failed to update attendance. Status: ${updateResponse.status}`);
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
      await fetchAnnouncements();
      return true;
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] handleRegister - General error during registration for event ${eventId}:`, error.message);
      setSnackbar({ open: true, message: error.message || "Registration failed. Please try again.", severity: "error" });
      fetchAnnouncements();
      return false;
    }
  };

  const handleUnregister = async (interestRecordId) => {
    console.log(`[${PAGE_COMPONENT_NAME}] handleUnregister called for interestRecordId: ${interestRecordId}`);

    if (!currentUser?.id) { // Should be covered by button disabled state
      setSnackbar({ open: true, message: "Please login to unregister.", severity: "error" });
      return false;
    }
    if (!interestRecordId) {
      console.error(`[${PAGE_COMPONENT_NAME}] handleUnregister - Missing interest record ID. Cannot unregister.`);
      setSnackbar({ open: true, message: "Error: Missing interest record ID. Cannot unregister.", severity: "error" });
      return false;
    }

    try {
      console.log(`[${PAGE_COMPONENT_NAME}] handleUnregister - Deleting interest record ${interestRecordId}.`);
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/event-interests/${interestRecordId}/`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            // No Authorization header as per AllowAny for this ViewSet 
          },
        }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] handleUnregister - Delete API response status: ${response.status}`);

      if (response.status === 204) { // 204 No Content for successful DELETE 
        console.log(`[${PAGE_COMPONENT_NAME}] handleUnregister - Interest record ${interestRecordId} deleted successfully.`);
        setSnackbar({ open: true, message: "Successfully unregistered from the event!", severity: "success" });
        await fetchAnnouncements(); // Re-fetch to update the UI
        return true;
      } else {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (jsonError) {
          errorData = { detail: `Unregister API failed with status ${response.status} and no parseable JSON response.` };
        }
        console.error(`[${PAGE_COMPONENT_NAME}] handleUnregister - Failed to delete interest:`, errorData);
        throw new Error(errorData.detail || `Failed to unregister. Status: ${response.status}`);
      }
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] handleUnregister - General error during unregistration:`, error.message);
      setSnackbar({ open: true, message: error.message || "Unregistration failed. Please try again.", severity: "error" });
      fetchAnnouncements(); // Re-fetch to ensure UI consistency
      return false;
    }
  };

  const fetchAnnouncements = async () => {
    console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Starting to fetch announcements. Current isLoading: ${isLoading}`);
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { "Authorization": `Token ${token}` } : {};
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Token for API call: ${token ? 'present' : 'absent'}. Headers:`, headers);

      const response = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/",
        { headers }
      );
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Events API response status: ${eventsResponse.status}`);
      if (!eventsResponse.ok) {
        console.error(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Failed to fetch events. Status: ${eventsResponse.status}`);
        const errorText = await eventsResponse.text();
        console.error(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Events Error response text:`, errorText);
        throw new Error(`Failed to fetch events: ${eventsResponse.status} - ${errorText.substring(0, 100)}`);
      }

      let data = await response.json();
      console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Raw data received (count: ${data.length}):`, data.slice(0, 1)); // Log first item for brevity
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
      setAnnouncements(finalEvents);
    } catch (error) {
      console.error(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Error:`, error);
      setSnackbar({ open: true, message: `Failed to load announcements: ${error.message}`, severity: "error" });
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
      console.log(`[${PAGE_COMPONENT_NAME}] useEffect[] - Initial data load sequence finished.`);
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    console.log(`[${PAGE_COMPONENT_NAME}] useEffect[currentUser?.id] - CurrentUser ID changed or component re-rendered. CurrentUser ID: ${currentUser?.id}`);
    // This effect might be too aggressive if fetchAnnouncements doesn't strictly depend on currentUser changing for its content
    // (e.g., if backend already uses token to determine 'is_current_user_interested').
    // For now, keeping it as it might be intended to refresh data if user logs in/out.
    if (currentUser !== undefined) { // Check if currentUser state has been initialized (is not the initial 'undefined' during setup)
      // No, this check for 'undefined' is not standard for useState. It will be null initially.
      // If you want to fetch only after first load and when currentUser.id specifically changes from one value to another (not from null to value):
      // You would need a ref to track previous currentUser.id if that's the precise logic.
      // For now, this will run if currentUser.id changes (e.g. null -> someId, or someId -> null)
      console.log(`[${PAGE_COMPONENT_NAME}] useEffect[currentUser?.id] - currentUser is defined (or null), proceeding to fetchAnnouncements.`);
      // fetchAnnouncements(); // Re-evaluate if this is needed or causes too many fetches.
      // loadInitialData already calls fetchAnnouncements.
      // This would be for cases where user logs in/out AFTER initial load.
    }
  }, [currentUser]);

  const sortedAndFilteredAnnouncements = () => {
    if (!announcements) {
      console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Announcements is null/undefined, returning [].`);
      return [];
    }
    let announcementsCopy = [...announcements];
    console.log(`[${PAGE_COMPONENT_NAME}] sortedAndFilteredAnnouncements - Current filter: '${filter}', sort: '${sort}'. UserLocation:`, userLocation);

    if (filter !== "all") {
      announcementsCopy = announcementsCopy.filter(ann =>
        (filter === "online" && ann.location_type?.toLowerCase() === "online") ||
        (filter === "offline" && ann.location_type?.toLowerCase() !== "online")
      );
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
    return announcementsCopy;
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === 'clickaway') {
      return;
    }
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
        <Box sx={{ maxWidth: '1000px', marginX: 'auto', px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 } }}>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: { xs: 1, sm: 2 } }}>
            <Typography
              align="center"
              sx={{
                mt: 5,
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
          </Box>
          <Box className="controls" sx={{ display: "flex", flexDirection: { xs: 'column', sm: 'row' }, justifyContent: "flex-start", alignItems: 'center', gap: 2, mb: 3 }}>
            <FormControl sx={{ minWidth: 150, width: { xs: "100%", sm: "auto" }, boxShadow: "2px 2px 2px #E8F1F5", position: "relative", backgroundColor: 'white' }}>
              <InputLabel htmlFor="filter-select-input" id="filter-select-label" sx={{ position: "absolute", top: -10, left: 8, padding: "0 4px", fontSize: "0.75rem", color: "text.secondary" }}>
                Filter By
              </InputLabel>
              <Select value={filter} onChange={(e) => { console.log(`[${PAGE_COMPONENT_NAME}] Filter changed to: ${e.target.value}`); setFilter(e.target.value); }}
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
              <Select value={sort} onChange={(e) => { console.log(`[${PAGE_COMPONENT_NAME}] Sort changed to: ${e.target.value}`); setSort(e.target.value); }}
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
        {isLoading || currentUser === undefined ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 10, height: '300px' }}>
            <CircularProgress size={50} sx={{ mb: 2, color: theme.palette.primary.main }} />
            <Typography variant="h6" color="text.secondary">Loading announcements...</Typography>
          </Box>
        ) : finalAnnouncements.length === 0 ? (
          <Box sx={{ textAlign: "center", p: { xs: 2, sm: 3 }, backgroundColor: 'transparent', borderRadius: 0 }}>
            {console.log(`[${PAGE_COMPONENT_NAME}] Render - No announcements to display.`)}
            <Typography variant="h6" component="p" gutterBottom sx={{ fontWeight: 500, color: '#333' }}>
              No announcements available at the moment.
            </Typography>
            <Typography variant="body1" color="#555" sx={{ mt: 1 }}>
              {!currentUser
                ? "Please log in to register for events or set your profile location to see relevant offline events, or check back later."
                : (!userLocation?.state
                  ? "Please update your profile to include your state and district to see relevant offline events."
                  : `No events currently match your location (State: ${userLocation.state}, District: ${userLocation.district || 'N/A'}) or selected filters. Please check back later.`
                )
              }
            </Typography>
          </Box>
        ) : (
          <Grid container spacing={3}>
            {finalAnnouncements.map((announcement) => {
              return (
                <Grid item xs={12} sm={6} md={4} key={announcement.id} sx={{ display: 'flex' }}>
                  <EventDisplayCard
                    event={announcement}
                    currentUser={currentUser}
                    onRegister={handleRegister}
                    onUnregister={handleUnregister} // Pass new unregister handler
                    onLoginRedirect={handleLoginRedirect}
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