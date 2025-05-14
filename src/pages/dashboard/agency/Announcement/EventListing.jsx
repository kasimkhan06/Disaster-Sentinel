// React
import { useEffect, useState } from "react";

// React Router
import { useParams } from "react-router-dom";

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
} from "@mui/material";

// Custom Components
import EventCard from "../../../../components/EventCard";

// Styles & Assets
import "../../../../../public/css/EventListing.css";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

export default function EventListing() {
  const [events, setEvents] = useState(null);
  const { id } = useParams();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const isBelow = useMediaQuery("(max-width:1470px)");
  const [isLoading, setIsLoading] = useState(false);
  const [deletedEvents, setDeletedEvents] = useState([]);

  // Function to fetch events (used initially and for refreshing)
  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/");
      const data = await response.json();
      const currentDate = new Date();
  
      // Filter expired and delete them
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
            setDeletedEvents(prev => [...prev, event]);
            setTimeout(() => {
              setDeletedEvents(prev => prev.filter(e => e.id !== event.id));
            }, 100000);
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

  // Fetch events when the component mounts
  useEffect(() => {
    fetchEvents();
  }, []);

  // Function to refresh events (passed to EventCard)
  const refreshEvents = () => {
    fetchEvents(); 
  };

  const filteredEvents = () => {
    if (!events) return [];

    let events_copy = [...events];

    if (filter !== "all") {
      events_copy = events_copy.filter((event) => event.status === filter);
    }

    if (sort === "newest") {
      events_copy.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "oldest") {
      events_copy.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === "nameAZ") {
      events_copy.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameZA") {
      events_copy.sort((a, b) => b.name.localeCompare(a.name));
    }

    return events_copy;
  };

  return (
    <div className="background-image">
      <div className="container" >
        <div className="header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <Box sx={{ flexGrow: 1, justifyItems: "center", marginX: "auto" }}>
            <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>Announcements</Typography>
          </Box>
        </div>
        <div className="controls" style={{ display: "flex", gap: "15px" }}>
          {/* Sort Box */}
          <Box
            sx={{
              paddingLeft: 3,
              mb: 3,
              textAlign: "left",
              boxShadow: "2px 2px 2px #E8F1F5",
              position: "relative", 
              width: { xs: "300px", md: "150px" },
              marginX: "auto",
            }}
          >
            <InputLabel
              sx={{
                position: "absolute", 
                top: -5, 
                left: 16, 
                backgroundColor: "background.paper", 
                padding: "0 2px", 
                fontSize: {
                  xs: "0.55rem",
                  sm: "0.6rem",
                  md: "0.75rem",
                },
                color: "text.secondary", 
                fontStyle: "italic",
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
                  fontSize: {
                    xs: "0.7rem",
                    sm: "0.8rem",
                    md: "1rem",
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
        </div>

        {isLoading ? (
          <div className="loading-events" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh" }}>
            <CircularProgress size={50} sx={{ color: "#4F646F", marginBottom: "10px" }} />
            <Typography>Loading events...</Typography>
          </div>
        ) : filteredEvents().length === 0 ? (
          <div className="no-events">
            <Typography variant="h6">No events found</Typography>
            <Button variant="contained" color="primary">Create Your First Event</Button>
          </div>
        ) : (
          <Grid container spacing={3}>
            {filteredEvents().map((event) => (
              <Grid item xs={12} sm={6} md={4} key={event.id}>
                <EventCard 
                event={event} 
                refreshEvents={refreshEvents} 
              /> 
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
            {deletedEvents.map(event => (
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
    </div>
  );
}