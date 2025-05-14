// import { Component } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import CurrentLocation from "./pages/disasters/user/CurrentLocation";
import HomePage from "./pages/dashboard/user/HomePage";
import DisasterEvent from "./pages/dashboard/user/DisasterEvent";
import DisasterInfo from "./pages/disasters/user/DisasterInfo";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/authentication/login";
import Register from "./pages/authentication/register";
import HeaderAgency from "./components/HeaderAgency";
import NewRegistration from "./pages/dashboard/agency/RegistrationPage/NewRegistration";
import AgencyDashboard from "./pages/dashboard/AgencyDashboard";
import MissingPerson from "./pages/dashboard/agency/Missing Person/MissingPerson";
import PersonInfo from "./pages/dashboard/agency/Missing Person/PersonInfo";
import AnnouncementPage from "./pages/dashboard/agency/Announcement/Announcement";
import EventListing from "./pages/dashboard/agency/Announcement/EventListing";
import EventForm from "./pages/dashboard/agency/Announcement/CreateEvent";
import { EventFormProvider } from "./hooks/useEventForm";
import FloodPrediction from "./pages/disasters/user/FloodPrediction";
import Agencies from "./pages/disasters/user/Agencies";
import AgencyProfile from "./pages/disasters/user/AgencyProfile";
import Verification from "./pages/authentication/verification";
import DosDontsPage from "./pages/training/dosdonts";
import MissingPersonPortal from "./pages/missingperson/portal";
import StatusTracking from "./pages/missingperson/status";
import UpdateDetails from "./pages/authentication/updateDetails";
import Profile from "./pages/dashboard/agency/Profile/Profile";
import { Box } from "@mui/material";

const App = () => {
  const [userRole, setUserRole] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in by retrieving from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <>
      {userRole === "agency" ? <HeaderAgency isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/> : <Header isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />}


      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/current-location" element={<CurrentLocation />} />
        <Route path="/disaster-details/:id" element={<DisasterInfo />} />
        <Route path="/dosdontspage" element={<DosDontsPage />} />
        <Route path="/MissingPersonPortal" element={<MissingPersonPortal />} />
        <Route path="/statustracking" element={<StatusTracking />} />
        <Route path="/flood-prediction" element={<FloodPrediction />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/agency/:id" element={<AgencyProfile />} />
        <Route path="/disaster/:eventId/:eventType?" element={<DisasterEvent />} />
        <Route path="/registration-form" element={<NewRegistration />} />
        <Route path="/agency-dashboard" element={<AgencyDashboard />} />
        <Route path="/missing-person" element={<MissingPerson />} />
        <Route path="/person-details/:id" element={<PersonInfo />} />
        <Route path="/announcement" element={<AnnouncementPage />} />
        <Route path="/updatedetails" element={<UpdateDetails />} />
        <Route path="/event-listing" element={<EventListing />} />
        <Route path="/create-event" 
        element={
        <EventFormProvider>
          <EventForm />
        </EventFormProvider>
        } />
        <Route path="/agency-profile/:id" element={<Profile />} />
      </Routes>
    </>
  );
};

export default App;
