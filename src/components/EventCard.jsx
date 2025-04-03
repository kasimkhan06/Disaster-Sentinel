import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import { CalendarToday, LocationOn, Videocam, People, Edit, Delete, BarChart, Send, Create } from "@mui/icons-material";
import "../../public/css/EventListing.css";
import CreateEvent from "../pages/dashboard/agency/Announcement/CreateEvent"; 
import { useNavigate } from "react-router-dom";

export default function EventCard({ event }) {
  const getStatusBadge = () => {
    const statusVariants = {
      published: { label: "Published", color: "secondary" },
      draft: { label: "Draft", color: "default", variant: "outlined" },
    };

    return (
      <Chip
        label={statusVariants[event.status]?.label || "Unknown"}
        color={statusVariants[event.status]?.color || "default"}
        variant={statusVariants[event.status]?.variant || "filled"}
        size="small"
        style={{ marginBottom: "8px" }}
      />
    );
  };

  const navigate = useNavigate();

  const getTagsBadge = () => {
    const tags = event.tags.map((tag, index) => (
      <Chip key={index} label={tag} size="small" style={{ margin: "2px" }} /> 
    ));
    return <div style={{ display: "flex", flexWrap: "wrap" }}>{tags}</div>;
  };

  return (
    <Card className="event-card">
      <CardContent>
        <img src={event.img} alt="Event" className="event-img" />
        <Typography variant="h6">{event.name}</Typography>
        {getStatusBadge()}
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
              <LocationOn fontSize="small" /> {event.venueName}, {event.venueCity}
            </Typography>
          )}
          <Typography variant="body2">
            <People fontSize="small" /> {event.registeredAttendees} attendees
          </Typography>
          {getTagsBadge()}
        </div>
        <div className="event-actions">
        <Button
          variant="outlined"
          size="small"
          startIcon={<Edit />}
          onClick={() => navigate("/create-event", { state: { eventData: event } })}
        >
          Edit
        </Button>
          {event.status === "draft" ? (
            <Button variant="contained" size="small" startIcon={<Send />}>
              Publish
            </Button>
          ) : (
            <Button variant="outlined" size="small" startIcon={<Delete />}>
              Delete
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}