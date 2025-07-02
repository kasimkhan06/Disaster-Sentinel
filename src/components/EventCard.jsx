import React, { useRef, useState, useEffect, forwardRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import { useTheme } from "@mui/material/styles";

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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { CalendarToday, LocationOn, Videocam, People, Edit, Delete, Send } from "@mui/icons-material";
import "../../public/css/EventListing.css";
import { Grid } from "@mui/system";

const ComponentToPrint = forwardRef(({ users, event }, ref) => {

  const toCapitalizeCase = (str) => {
    if (!str) return "";
    return str
      .split(" ")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  return (
    <div id="printable" ref={ref}>
      <style type="text/css" media="print">
        {`
          @page {
            size: A4 landscape;
            margin: 1cm;
          }

          .mui-table th, .mui-table td {
            border: 1px solid #ccc;
            padding: 4px;
            font-size: 12px;
          }

          .mui-table th {
            background-color: #f5f5f5;
          }

          .user-header {
            font-weight: bold;
            padding-bottom: 4px;
          }
        `}
      </style>

      <Typography
        variant="h6"
        gutterBottom
        style={{
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "18px",
          marginBottom: "16px",
          borderBottom: "2px solid #000",
          paddingBottom: "4px",
        }}
      >
        Attendees List
      </Typography>

      <div style={{ marginBottom: "20px", padding: "10px" }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="subtitle1" gutterBottom style={{ fontSize: "14px", fontWeight: "bold" }}>
              Event: <span style={{ fontWeight: "normal" }}>{event.name.toUpperCase()}</span>
            </Typography>
            <Typography variant="subtitle2" gutterBottom style={{ fontSize: "13px" }}>
              Date: {event.date} | Time: {event.start_time}
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="subtitle2" gutterBottom style={{ fontSize: "13px" }}>
              Attendees: <strong>{users.filter((user) => user.interested).length}</strong>
            </Typography>
            <Typography variant="subtitle2" gutterBottom style={{ fontSize: "13px" }}>
              Event Type: <strong>{event.event_type}</strong>
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} lg={6}>
            <Typography variant="subtitle2" gutterBottom style={{ fontSize: "13px" }}>
              Location:{" "}
              <strong>
                {event.location_type === "online"
                  ? `Online (${event.platform})`
                  : `${toCapitalizeCase(event.venue_name)}, ${event.district}, ${event.state}`}
              </strong>
            </Typography>
          </Grid>
        </Grid>
      </div>

      <TableContainer component={Paper}>
        <Table size="small" className="mui-table">
          <TableHead>
            <TableRow>
              <TableCell>Sr No.</TableCell>
              <TableCell>Name</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users?.filter?.((user) => user.interested)?.map((user, idx) => (
              <TableRow key={idx}>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{user.user?.full_name || "N/A"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
});

const DisplayTable = ({ open, handleClose, registeredUsers, event }) => {
  const [page, setPage] = useState(1);
  const itemsPerPage = 5;
  const componentRef = useRef();

  useEffect(() => {
    if (registeredUsers.length > 0) setPage(1);
  }, [registeredUsers]);

  const handleChange = (event, value) => setPage(value);

  function addScript(url) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[src="${url}"]`);
      if (existing) return resolve();

      const script = document.createElement('script');
      script.type = 'application/javascript';
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  const handlePrint = async () => {
    await addScript('https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js');

    const element = document.getElementById('printable');
    if (!element) {
      console.error("No printable content found");
      return;
    }

    const opt = {
      margin: 0.5,
      filename: "registered_users.pdf",
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(element).save();
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: 600 },
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
          sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }}
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" sx={{ textAlign: "center", mb: 2 }}>
          Attendees List
        </Typography>

        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Sr No.</TableCell>
                <TableCell>Name</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {registeredUsers
                .filter((user) => user.interested)
                .slice((page - 1) * itemsPerPage, page * itemsPerPage)
                .map((user, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{(page - 1) * itemsPerPage + idx + 1}</TableCell>
                    <TableCell>{user.user?.full_name || "N/A"}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>

        <Pagination
          count={Math.ceil(
            registeredUsers.filter((user) => user.interested).length / itemsPerPage
          )}
          page={page}
          onChange={handleChange}
          sx={{ mt: 2, display: "flex", justifyContent: "center" }}
        />

        {/* Print Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handlePrint}
          sx={{ mt: 2, display: "block", marginLeft: "auto", marginRight: "auto" }}
        >
          Download as PDF
        </Button>

        {/* Hidden component for printing */}
        <div style={{ display: "none" }}>
          <ComponentToPrint ref={componentRef} users={registeredUsers} event={event} />
        </div>
      </Box>
    </Modal>
  );
};

export default function EventCard({ event, refreshEvents }) {
  const navigate = useNavigate();
  const theme = useTheme();

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
            size="small"
            sx={{
              minWidth: '100px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              py: 1.5,
              fontWeight: 500,
              color: theme.palette.success.main,
            }}
            startIcon={<Edit />}
            onClick={() => navigate("/create-event", { state: { eventData: event } })}
          >
            Edit
          </Button>
          <Button
            sx={{
              minWidth: '100px',
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              py: 1.5,
              fontWeight: 500, 
              color: theme.palette.error.main,
            }}
            size="small"
            startIcon={<Delete />}
            onClick={handleDelete}
          >
            Delete
          </Button>
        </div>
        <DisplayTable
          open={open}
          handleClose={handleClose}
          registeredUsers={registeredUsers}
          event={event}
          showTable={showTable}
        />
      </CardContent>
    </Card>
  );
}