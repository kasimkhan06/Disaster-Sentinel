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
} from "@mui/material";
import EventCard from "../../../../components/EventCard";
import "../../../../../public/css/EventListing.css";

const dummyEvents = [
  { id: 1, img: "/assets/event.jpg", name: "Event A", date: "2025-04-10", status: "upcoming", locationType: "online", platform: "Zoom", registeredAttendees: 50 },   
  { id: 2, img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80", name: "Event B", date: "2025-03-15", status: "published", locationType: "offline", venueName: "Convention Center", venueCity: "NYC", registeredAttendees: 100 },
  { id: 3, img: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?ixlib=rb-4.0.3&auto=format&fit=crop&w=1112&q=80", name: "Event C", date: "2025-05-05", status: "draft", locationType: "online", platform: "Google Meet", registeredAttendees: 20 },
];

export default function EventListing() {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("newest");
  const isLoading = false;

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
    <div className="container">
      <div className="header">
        <Typography variant="h4">Announcements</Typography>
        <div className="controls">
          <FormControl>
            <InputLabel>Filter</InputLabel>
            <Select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <MenuItem value="all">All Events</MenuItem>
              <MenuItem value="upcoming">Upcoming</MenuItem>
              <MenuItem value="past">Past</MenuItem>
              <MenuItem value="draft">Drafts</MenuItem>
            </Select>
          </FormControl>
          <FormControl>
            <InputLabel>Sort</InputLabel>
            <Select value={sort} onChange={(e) => setSort(e.target.value)}>
              <MenuItem value="newest">Newest First</MenuItem>
              <MenuItem value="oldest">Oldest First</MenuItem>
              <MenuItem value="nameAZ">Name A-Z</MenuItem>
              <MenuItem value="nameZA">Name Z-A</MenuItem>
            </Select>
          </FormControl>
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
                <Grid item xs={12} sm={6} md={6} key={event.id}>
                <EventCard event={event} />
                </Grid>
            ))}
        </Grid>
      )}
    </div>
  );
}