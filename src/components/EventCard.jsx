import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import { CalendarToday, LocationOn, Videocam, People, Edit, Delete, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "../../public/css/EventListing.css";
import axios from "axios";
import React, { useEffect, useState } from "react";

export default function EventCard({ event, refreshEvents }) {
  const navigate = useNavigate();
  const [attendeeCount, setAttendeeCount] = useState(0);

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

  useEffect(() => {
    const getAttendeesCount = async () => {
      try {
        const response = await fetch(
          `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/event-interests/?event=${event.id}`
        );

        if (response.status === 404) {
          setAttendeeCount(0); // No interests found
          return;
        }

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Attendees data:", data);
        const interestedUsersCount = data.filter((item) => item.interested === true).length;
        setAttendeeCount(interestedUsersCount);
      } catch (error) {
        console.error("Error fetching attendees count:", error);
        setAttendeeCount(0);
      }
    };

    getAttendeesCount();
  }, [event.id]);

  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this event?");
    if (!confirmDelete) return;

    try {
      await axios.delete(`https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${event.id}/`);
      alert("Event deleted successfully!");
      refreshEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete the event. Please try again.");
    }
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

  return (
    <Card className="event-card">
      <img src={getImage()} alt={event.event_type || "Event"} className="event-img" />
      <CardContent className="event-content">
        <Typography variant="h6" className="event-title">
          {event.name.toUpperCase()}
        </Typography>

        <div className="event-details">
          <Typography variant="body2">
            <CalendarToday fontSize="small" /> {event.date}
          </Typography>
          {event.location_type === "online" ? (
            <Typography variant="body2">
              <Videocam fontSize="small" /> Online ({event.platform})
              <br />
              <Send fontSize="small" /> {event.meeting_link}
            </Typography>
          ) : (
            <Typography variant="body2">
              <LocationOn fontSize="small" /> {toCapitalizeCase(event.venue_name)}, {event.district}, {event.state}
            </Typography>
          )}
          <Typography variant="body2">
            <People fontSize="small" /> {attendeeCount}/{event.attendees || 0} Attendees
          </Typography>
          {getTagsBadge()}
        </div>

        <div className="event-actions">
          <Button
            variant="outlined"
            size="small"
            startIcon={<Edit />}
            className="edit-btn"
            onClick={() => navigate("/create-event", { state: { eventData: event } })}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            size="small"
            startIcon={<Delete />}
            className="delete-btn"
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}