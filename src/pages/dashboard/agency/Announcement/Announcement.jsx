// React
import { useState } from "react";

// Contexts / Providers
import { EventFormProvider } from "../../../../hooks/useEventForm";

// MUI
import {
  Box,
  Card,
} from "@mui/material";

// Components
import EventForm from "./CreateEvent";
import EventListing from "./EventListing";

// Styles & Assets
import "../../../../../public/css/Announcement.css";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

export default function AnnouncementPage() {
  const [selectedTab, setSelectedTab] = useState(0);

  const tabs = ["Event", "Create Event"];

  return (
    <Box 
      sx={{
        position: "absolute",
        width: "100%", 
        top: 0,
        left: 0,
        right: 0,
        minHeight: "100vh",
        background: ` linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        margin: 0,
        padding: 0,
        zIndex: 0, // Only needed if you have other elements with zIndex
      }}
    >
       <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
        <EventListing />
      </Card>
    </Box>
  );
}