import { useState } from "react";
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
import EventCard from "../../../../components/EventCard";
import "../../../../../public/css/EventListing.css";

const dummyEvents = [
  { id: 1, img: "/assets/event.jpg", name: "Event A", date: "2025-04-10", status: "published", locationType: "online", platform: "Zoom", registeredAttendees: 50, tags: ["Earthquake Preparedness", "Climate Resilience", "Emergency Response"] },   
  { id: 2, img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", name: "Event B", date: "2025-03-15", status: "published", locationType: "offline", venueName: "Convention Center", venueCity: "NYC", registeredAttendees: 100, tags: ["Earthquake Preparedness", "Climate Resilience", "Emergency Response"] },
  { id: 3, img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1112&q=80", name: "Event C", date: "2025-05-05", status: "draft", locationType: "online", platform: "Google Meet", registeredAttendees: 20, tags: ["Earthquake Preparedness", "Climate Resilience", "Emergency Response"] },
  { id: 4, img: "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", name: "Event D", date: "2025-02-20", status: "draft", locationType: "offline", venueName: "City Hall", venueCity: "Los Angeles", registeredAttendees: 75, tags: ["Earthquake Preparedness", "Climate Resilience", "Emergency Response"] },
  { id: 5, img: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", name: "Event E", date: "2025-01-30", status: "published", locationType: "online", platform: "Zoom", registeredAttendees: 150, tags: ["Earthquake Preparedness", "Climate Resilience", "Emergency Response"] },
];

export default function EventListing() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const isLoading = false;
  const isBelow = useMediaQuery("(max-width:1470px)");
  const filteredEvents = () => {
    let events = [...dummyEvents];

    if (filter !== "all") {
      events = events.filter((event) => event.status === filter);
    }

    if (sort === "newest") {
      events.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else if (sort === "oldest") {
      events.sort((a, b) => new Date(a.date) - new Date(b.date));
    } else if (sort === "nameAZ") {
      events.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sort === "nameZA") {
      events.sort((a, b) => b.name.localeCompare(a.name));
    }

    return events;
  };

  return (
    <div className="container" style={{ padding: "20px", marginTop: "65px" }}>
      <div className="header" 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center", 
          marginBottom: "20px" 
        }}
      >
        <Box sx={{ flexGrow: 1, justifyItems: "center", marginX: "auto" }}>
          <Typography variant="h4" sx={{ fontSize: { xs: "1.5rem", md: "2rem" } }}>Announcements</Typography>
        </Box>

        <div className="controls" style={{ display: "flex", gap: "15px" }}>
          {/* Filter Box */}
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
              Filter
            </InputLabel>
            <FormControl fullWidth>
              <Select
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
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
                <MenuItem value="all">All Events</MenuItem>
                <MenuItem value="upcoming">Upcoming</MenuItem>
                <MenuItem value="past">Past</MenuItem>
                <MenuItem value="draft">Drafts</MenuItem>
              </Select>
            </FormControl>
          </Box>

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
      </div>

      {isLoading ? (
        <div className="loading">
          <CircularProgress />
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
                <EventCard event={event} />
                </Grid>
            ))}
        </Grid>
      )}
    </div>
  );
}