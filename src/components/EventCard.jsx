import {
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Modal,
  Box,
  IconButton,
  Pagination,
  Dialog,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CalendarToday, LocationOn, Videocam, People, Edit, Delete, Send } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "../../public/css/EventListing.css";
import axios from "axios";
import React, { useEffect, useState } from "react";

const DisplayTable = ({ open, handleClose, registeredUsers, showTable }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(registeredUsers.length / itemsPerPage);

  const handleChange = (event, value) => {
    setPage(value);
  };

  useEffect(() => {
    if (registeredUsers.length > 0) {
      setPage(1);
    }
  }, [registeredUsers]);
  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 600 },
          height: "auto",
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }} // Ensure close button is on top
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 2 }}>
          Registered Users
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sr No.</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registeredUsers
                .filter((user) => user.interested)
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((user, idx) => (
                  <TableRow key={idx} sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                    <TableCell>{(page - 1) * itemsPerPage + idx + 1}</TableCell>
                    <TableCell>{user.user.full_name || "N/A"}</TableCell>
                    <TableCell>{user.user.email || "N/A"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(registeredUsers.filter((user) => user.interested).length / itemsPerPage)}
          page={page}
          onChange={handleChange}
          sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}
        />
      </Box>
    </Modal>
  );
};

export default function EventCard({ event, refreshEvents }) {
  const navigate = useNavigate();
  const [attendeeCount, setAttendeeCount] = useState(0);
  const [registeredUsers, setRegisteredUsers] = useState([]);
  const [showTable, setShowTable] = useState(false);
  const [open, setOpen] = useState(false);
  const tableRef = React.useRef < HTMLDivElement | null > (null);

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
        setRegisteredUsers(data);
        const interestedUsersCount = data.filter((item) => item.interested === true).length;
        setAttendeeCount(interestedUsersCount);
      } catch (error) {
        console.error("Error fetching attendees count:", error);
        setAttendeeCount(0);
      }
    };

    getAttendeesCount();
  }, [event.id]);

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setShowTable(false);
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
          <Typography variant="body2" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <People fontSize="small" /> {attendeeCount}/{event.attendees || 0} Attendees
            {attendeeCount > 0 ? (
              <Button size="small" onClick={handleOpen}>View Attendees</Button>
            ) : (
              <Typography fontSize="small">No Attendees</Typography>
            )}
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
        <DisplayTable
          open={open}
          handleClose={handleClose}
          registeredUsers={registeredUsers}
          showTable={showTable}
        />
      </CardContent>
    </Card>
  );
}