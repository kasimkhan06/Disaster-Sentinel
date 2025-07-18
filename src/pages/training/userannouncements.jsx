import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid,
  Button,
  Snackbar,
  Alert, // Make sure Alert is imported
  Card,
  CardContent,
  Chip,
  useMediaQuery,
  Autocomplete,
  TextField,
  InputAdornment,
} from "@mui/material";

import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";
import { useTheme } from "@mui/material/styles";
import {
  CalendarToday,
  LocationOn,
  Videocam,
  Send,
  Search as SearchIcon
} from "@mui/icons-material";
import userAnnouncementsBackground from "../../../public/assets/background_image/world-map-background.jpg";
import Footer from "../../components/Footer";

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
    setLoading(true);
    try {
      const success = await onRegister(event.id);
    } catch (error) {
      console.error(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleRegisterInternal - Error during registration for event ${event?.id}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnregisterInternal = async () => {
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
    setLoading(true);
    try {
      const success = await onUnregister(event.interest_record_id); // Pass the interest record ID
    } catch (error) {
      console.error(`[${EVENT_DISPLAY_CARD_COMPONENT_NAME}] handleUnregisterInternal - Error during unregistration for event ${event?.id}:`, error);
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
      return "/assets/Event Images/seminar1.webp";
    } else if (event.event_type === "Workshop") {
      return "/assets/Event Images/Workshops.jpg";
    } else {
      return "/assets/Event Images/webinar.jpg";
    }
  };

  const toCapitalizeCase = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
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
          <Typography variant="body2"
          // sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}
          >
            <CalendarToday fontSize="small" /> {event.date}
          </Typography>
          {event.location_type === "online" ? (
            <>
              <Typography variant="body2"
              // sx={{ display: 'flex', alignItems: 'center', my: 0.5 }}
              >
                <Videocam fontSize="small" /> Online ({event.platform})
                <br />
                <Send fontSize="small" /> {event.meeting_link}
              </Typography>
            </>
          ) : (
            <Typography variant="body2" >
              <LocationOn fontSize="small" />
              {toCapitalizeCase(event.venue_name)}{toCapitalizeCase(event.venue_name) && (event.district || event.state) ? ", " : ""}
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
                minWidth: '100px',
                transition: 'all 0.3s ease',
                textTransform: 'uppercase',
                py: 1.5,
                fontWeight: 500, // Match "Register" button
                color: theme.palette.error.main, // Use red for unregister
                // borderColor: theme.palette.error.main, // Add border for distinction if not filled
                // '&:hover': {
                //   // backgroundColor: theme.palette.error.light,
                //   // color: 'white',
                // },
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
                minWidth: '100px',
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
  const navigate = useNavigate();
  const theme = useTheme();
  const isBelow = useMediaQuery("(max-width:1470px)");
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [announcements, setAnnouncements] = useState([]);
  const [sort, setSort] = useState("");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const handleLoginRedirect = () => {
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
    navigate("/login");
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

      if (userDataFromStorage?.user_id) {
        const CUser = { id: userDataFromStorage.user_id };

        if (userDataFromStorage.state && userDataFromStorage.district) {
          CUser.state = userDataFromStorage.state;
          CUser.district = userDataFromStorage.district;
          setUserLocation({ state: userDataFromStorage.state, district: userDataFromStorage.district });
        } else if (userDataFromStorage.state) {
          CUser.state = userDataFromStorage.state;
          setUserLocation({ state: userDataFromStorage.state, district: null });
        } else {
          setUserLocation(null);
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
  };

  const handleRegister = async (eventId, isPreCheckFailure = false) => {
    if (!currentUser?.id) {
      setSnackbar({ open: true, message: "Please ensure you are logged in to register.", severity: "error" });
      return false;
    }

    try {
      const interestPayload = {
        user_id_input: currentUser.id,
        event_id_input: eventId,
        interested: true
      };
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

      const currentAttendees = announcements.find(announcement => announcement.id === eventId)?.attendees_count || 0; // Get current count from state for accurate update
      const updatePayload = { attendees_count: currentAttendees + 1 };
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

      if (response.status === 204) { // 204 No Content for successful DELETE
        console.log(`[${PAGE_COMPONENT_NAME}] handleUnregister - Successfully unregistered interest for record ID ${interestRecordId}.`);
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
      fetchAnnouncements();
      return false;
    }
  };

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const headers = {};

      // --- 1. Fetch all events ---
      const eventsResponse = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/",
        { headers }
      );
      if (!eventsResponse.ok) {
        const errorText = await eventsResponse.text();
        throw new Error(`Failed to fetch events: ${eventsResponse.status} - ${errorText.substring(0, 100)}`);
      }
      let eventsData = await eventsResponse.json();

      // --- 2. Filter events by date ---
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const originalCount = eventsData.length;
      eventsData = eventsData.filter(announcement => {
        if (!announcement.date) return false;
        const eventDate = new Date(announcement.date);
        return !isNaN(eventDate) && eventDate >= currentDate;
      });

      // --- 3. Determine user interest for each event by querying /api/event-interests/?user=<user_id> ---
      let userInterestedEventIds = new Set();
      let eventIdToInterestRecordIdMap = new Map(); // Store interest record ID
      if (currentUser?.id) {
        const userInterestsResponse = await fetch(
          `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/event-interests/?user=${currentUser.id}`,
          { headers: {} } // No Authorization header for this endpoint
        );
        if (userInterestsResponse.ok) {
          const userInterestsData = await userInterestsResponse.json();
          userInterestsData.forEach(interest => {
            if (interest.interested === true) {   // Only add if explicitly marked interested
              userInterestedEventIds.add(interest.event.id);
              eventIdToInterestRecordIdMap.set(interest.event.id, interest.id); // Store interest record ID
            }
          });
        } else {
          console.error(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - Failed to fetch user interests. Status: ${userInterestsResponse.status}`);
        }
      } else {
        console.log(`[${PAGE_COMPONENT_NAME}] fetchAnnouncements - No currentUser ID available, skipping fetching user interests.`);
      }

      // --- 4. Map interest status and interest_record_id onto events ---
      const finalEvents = eventsData.map(event => ({
        ...event,
        is_current_user_interested: userInterestedEventIds.has(event.id),
        // Add the interest_record_id if the user is interested in this event
        interest_record_id: userInterestedEventIds.has(event.id) ? eventIdToInterestRecordIdMap.get(event.id) : null
      }));

      setAnnouncements(finalEvents);
    } catch (error) {
      setSnackbar({ open: true, message: `Failed to load announcements: ${error.message}`, severity: "error" });
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    async function loadInitialData() {
      await loadCurrentUserData();
    }
    loadInitialData();
  }, []);

  useEffect(() => {
    if (currentUser !== undefined) {
      fetchAnnouncements();
    }
  }, [currentUser]);

  const sortedAndFilteredAnnouncements = () => {
    if (!announcements) {
      return [];
    }
    let announcementsCopy = [...announcements];

    // Apply search filter
    if (searchTerm) {
      announcementsCopy = announcementsCopy.filter((announcement) => {
        return announcement.name?.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    if (filter !== "all") {
      announcementsCopy = announcementsCopy.filter(announcement =>
        (filter === "online" && announcement.location_type?.toLowerCase() === "online") ||
        (filter === "offline" && announcement.location_type?.toLowerCase() !== "online")
      );
    }

    announcementsCopy = announcementsCopy.filter(announcement => {
      if (announcement.location_type?.toLowerCase() === "online") {
        return true;
      }

      // Filter offline events based on user location only if user is logged in and has location
      if (!currentUser || !userLocation?.state) {
        return false; // If not logged in or no user location, don't show offline events
      }

      const userState = userLocation.state.trim().toUpperCase();
      const userDistrict = userLocation.district?.trim().toUpperCase() || "";
      const eventState = announcement.state?.trim().toUpperCase();
      const eventDistrict = announcement.district?.trim().toUpperCase() || "";

      if (eventState !== userState) {
        return false;
      }

      if (!userDistrict) {
        if (!eventDistrict) {
          return true;
        } else {
          return false;
        }
      }

      if (userDistrict) {
        if (eventDistrict === userDistrict) {
          return true;
        } else {
          return false;
        }
      }

      return false;
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
          <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "bottom", horizontal: "center" }}>
            <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: '100%' }}>
              {snackbar.message}
            </Alert>
          </Snackbar>
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", pt: { xs: 1, sm: 2 } }}>
            <Typography sx={{
              textAlign: "center", mt: { xs: 9, sm: 7, md: 7, lg: 7 }, mb: 1, fontSize: {
                xs: "1.2rem",
                sm: "1.2rem",
                md: isBelow ? "1.2rem" : "1.4rem",
                lg: isBelow ? "1.2rem" : "1.4rem",
              }, fontWeight: "bold", textTransform: 'uppercase', color: "rgba(0, 0, 0, 0.87)"
            }}>
              ANNOUNCEMENTS
            </Typography>
          </Box>

          {/* New: Alert message for unauthenticated users regarding offline events */}
          {!currentUser && !isLoading && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                width: 'fit-content',
                maxWidth: '90%',
                mx: 'auto',
                display: 'flex', // Ensures content aligns horizontally
                alignItems: 'center', // Centers text and button vertically
                justifyContent: 'center', // Centers horizontally if content allows
                textAlign: 'center',
              }}
            >
              Please log in to view offline events relevant to your location, or browse all online events.
              <Button size="small" onClick={handleLoginRedirect}
                sx={{
                  ml: 0.5, p: 0,
                  // mt: { xs: 1, sm: 0 }, // Top margin for small screens, no margin for larger
                  // p: { xs: '4px 8px', sm: '6px 12px' }, // Adjust button padding
                  textTransform: 'none',
                  fontSize: { xs: '0.75rem', sm: '0.85rem' }, // Responsive font size
                  color: theme.palette.primary.main,
                  '&:hover': { backgroundColor: 'transparent', textDecoration: 'underline' },
                  // display: 'inline-flex', // Keep button inline
                  // flexShrink: 0, // Prevent button from shrinking
                }}
              >
                LOGIN
              </Button>
            </Alert>
          )}

          <Box className="controls" sx={{ mb: 3 }}>
            <Grid container spacing={2} alignItems="center" justifyContent="space-between" flexWrap="wrap">

              {/* Search Section */}
              <Grid item xs={12} sm={12} md={6} sx={{ display: "flex", justifyContent: { xs: "center", md: "flex-start" }, mt: 1, mb: { xs: 1, md: 0 } }}>
                <Box
                  sx={{
                    width: "100%", // Inherit width from Agencies' outer Box
                    maxWidth: 300, // Keep max-width constraint if desired
                  }}
                >
                  <Autocomplete
                    freeSolo // Added freeSolo to match Agencies' Autocomplete behavior
                    options={finalAnnouncements ? finalAnnouncements.map((announcement) => announcement.name.toUpperCase()) : []}
                    onInputChange={(e, value) => setSearchTerm(value)}
                    value={searchTerm}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        placeholder={"Search events..."}
                        variant="outlined"
                        fullWidth
                        InputLabelProps={{
                          shrink: false,
                          style: { display: "none" },
                        }}
                        // APPLY THE EXACT STYLES FROM AGENCIES' TEXTFIELD HERE
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "white", // White background
                            boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)", // Initial shadow
                            "& fieldset": {
                              borderColor: "transparent !important", // No visible border
                            },
                            "&:hover fieldset": {
                              borderColor: "transparent", // No visible border on hover
                              // boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)", // Hover shadow (Agency had it, but you removed in last edit)
                            },
                            "&.Mui-focused fieldset": {
                              borderColor: "transparent", // No visible border on focus
                              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)", // Focus shadow
                            },
                            "&.Mui-disabled fieldset": {
                              borderColor: "transparent !important", // No visible border when disabled
                            },
                            "& .MuiInputBase-input::placeholder": { // Placeholder text styling
                              opacity: 1,
                              color: theme.palette.text.secondary,
                            },
                            paddingY: "12px",
                          },
                          "& .MuiInputLabel-root": { // Label styling (if it were visible)
                            color: "inherit",
                          },
                          "& .MuiInputBase-input": { // Input text styling
                            fontSize: {
                              xs: "0.8rem",
                              sm: "0.8rem",
                              md: isBelow ? "0.9rem" : "1rem", // Responsive font size
                              lg: isBelow ? "0.9rem" : "1rem",
                            },
                            "&::placeholder": { // Redundant but harmless, ensures placeholder color
                              color: theme.palette.text.secondary,
                            },
                          },
                          width: "100%", // TextField takes full width of its parent Box
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
                    size="small" // Keep this as it affects size
                    // Apply Autocomplete-specific sx from Agencies for endAdornment position
                    sx={{
                      "& .MuiAutocomplete-endAdornment": {
                        right: "10px",
                      },
                    }}
                  // You might want to disable this if loading announcements
                  // disabled={isLoading}
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
                    <Select
                      displayEmpty
                      label="Filter By"
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em style={{ color: "gray" }}>Filter By</em>;
                        }
                        switch (selected) {
                          case "all":
                            return <em style={{ color: "gray" }}>Filter By</em>;
                          case "online":
                            return "Online Events";
                          case "offline":
                            return "Offline Events";
                          default:
                            return <em>Filter By</em>;
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiSelect-select": { padding: "10px 14px" },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                        color: filter ? "inherit" : "gray",
                      }}
                    >
                      <MenuItem value="all">All Events</MenuItem>
                      <MenuItem value="online">Online Events</MenuItem>
                      <MenuItem value="offline">Offline Events</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl
                    sx={{
                      minWidth: 140,
                      backgroundColor: "white",
                      boxShadow: "2px 2px 2px #E8F1F5",
                    }}
                  >
                    <Select
                      displayEmpty
                      label="Sort By"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      renderValue={(selected) => {
                        if (!selected) {
                          return <em>Sort By</em>;
                        }
                        switch (selected) {
                          case "newest":
                            return "Newest First";
                          case "oldest":
                            return "Oldest First";
                          case "nameAZ":
                            return "Name A-Z";
                          case "nameZA":
                            return "Name Z-A";
                          default:
                            return <em>Sort By</em>;
                        }
                      }}
                      sx={{
                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                        "& .MuiSelect-select": { padding: "10px 14px" },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                        color: sort ? "inherit" : "gray",
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

      <Box>
        {isMobile ? (
          <Box
            sx={{
              flex: 1,
              pb: 4,
              width: '100%',
              maxWidth: { xs: '95%', sm: '1200px', md: '900px', lg: '1100px' },
              marginX: 'auto',
              px: { xs: 0, sm: 3 }
            }}
          >
            {isLoading || currentUser === undefined ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 10, height: '300px' }}>
                <CircularProgress size={50} sx={{ mb: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="text.secondary">Loading announcements...</Typography>
              </Box>
            ) : finalAnnouncements.length === 0 ? (
              <Box sx={{ textAlign: "center", p: { xs: 2, sm: 3 }, backgroundColor: 'transparent', borderRadius: 0 }}>
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
              <Box sx={{ my: 2 }}>
                <Carousel
                  responsive={{
                    mobile: { breakpoint: { max: 600, min: 0 }, items: 1, slidesToSlide: 1 }
                  }}
                  ssr={true}
                  arrows={true}
                  infinite={finalAnnouncements.length > 1}
                  centerMode={false}
                  keyBoardControl={true}
                  containerClass="carousel-container"
                  itemClass="carousel-item-padding-40-px"
                >
                  {finalAnnouncements.map((announcement) => (
                    <Box
                      key={announcement.id}
                      sx={{ background: 'transparent', boxShadow: 'none', px: 0, py: 0 }}
                    >
                      <EventDisplayCard
                        event={announcement}
                        currentUser={currentUser}
                        onRegister={handleRegister}
                        onUnregister={handleUnregister}
                        onLoginRedirect={handleLoginRedirect}
                      />
                    </Box>
                  ))}
                </Carousel>
              </Box>
            )}
          </Box>
        ) : (
          <Box className="container" sx={{ flex: 1, pb: 4, width: '100%', maxWidth: { xs: '80%', sm: '1200px', md: '900px', lg: '1100px' }, marginX: 'auto', px: { xs: 0, sm: 3 } }}>
            {isLoading || currentUser === undefined ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pt: 10, height: '300px' }}>
                <CircularProgress size={50} sx={{ mb: 2, color: theme.palette.primary.main }} />
                <Typography variant="h6" color="text.secondary">Loading announcements...</Typography>
              </Box>
            ) : finalAnnouncements.length === 0 ? (
              <Box sx={{ textAlign: "center", p: { xs: 2, sm: 3 }, backgroundColor: 'transparent', borderRadius: 0 }}>
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
        )}
      </Box>
      <Footer />
    </Box>
  );
}