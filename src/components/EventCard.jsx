import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import { CalendarToday, LocationOn, Videocam, People, Edit, Delete, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "../../public/css/EventListing.css";
import axios from "axios";
import refreshEvents  from "../pages/dashboard/agency/Announcement/EventListing";

export default function EventCard({ event, refreshEvents }) {
  const navigate = useNavigate();

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
      return "/assets/Event Images/seminar.jpg";
    } else if (event.event_type === "Workshop") {
      return "/assets/Event Images/workshop.jpg";
    } else {
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
          <Typography variant="body2">
            <CalendarToday fontSize="small" /> {event.date}
          </Typography>
          {event.locationType === "online" ? (
            <Typography variant="body2">
              <Videocam fontSize="small" /> Online ({event.platform})
            </Typography>
          ) : (
            <Typography variant="body2">
              <LocationOn fontSize="small" /> {event.venue_name || "Unknown"}, {event.city || "Unknown"}
            </Typography>
          )}
          <Typography variant="body2">
            <People fontSize="small" /> {event.attendees || 0} Attendees
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