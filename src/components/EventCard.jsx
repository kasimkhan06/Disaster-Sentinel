import { Card, CardContent, Typography, Button, Chip } from "@mui/material";
import { CalendarToday, LocationOn, Videocam, People, Edit, ContentCopy, BarChart, Send } from "@mui/icons-material";
import "../../public/css/EventListing.css";

export default function EventCard({ event }) {
  const getStatusBadge = () => {
    const statusVariants = {
      published: { label: "Published", color: "secondary" },
      upcoming: { label: "Upcoming", color: "warning" },
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
        </div>
        <div className="event-actions">
          <Button variant="outlined" size="small" startIcon={<Edit />}>
            Edit
          </Button>
          {event.status === "draft" ? (
            <Button variant="contained" size="small" startIcon={<Send />}>
              Publish
            </Button>
          ) : (
            <Button variant="outlined" size="small" startIcon={<ContentCopy />}>
              Duplicate
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}