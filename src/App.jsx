// import { Component } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import CurrentLocation from "./pages/disasters/user/CurrentLocation";
import Home from "./pages/dashboard/user/Home";
import DisasterInfo from "./pages/disasters/user/DisasterInfo";
import Header from "./components/Header";
import Login from "./pages/authentication/login";
import Register from "./pages/authentication/register";
import HeaderAgency from "./components/HeaderAgency";
import RegistrationForm from "./pages/dashboard/agency/RegistrationPage/RegistrationForm";
import AgencyDashboard from "./pages/dashboard/agency/agencyDashboard";
import MissingPerson from "./pages/dashboard/agency/Missing Person/MissingPerson";
import PersonInfo from "./pages/dashboard/agency/Missing Person/PersonInfo";
import AnnouncementPage from "./pages/dashboard/agency/Announcement/Announcement";
import FloodPrediction from "./pages/disasters/user/FloodPrediction";
import Agencies from "./pages/disasters/user/Agencies";
import Verification from "./pages/authentication/verification";
import DosDontsPage from "./pages/training/dosdonts";
import MissingPersonPortal from "./pages/missingperson/portal";
import StatusTracking from "./pages/missingperson/status";
import UpdateDetails from "./pages/authentication/updateDetails";

const App = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    // Check if user is logged in by retrieving from localStorage
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUserRole(parsedData.role);
    }
  }, []);

  return (
    <>
      {userRole === "agency" ? <HeaderAgency /> : <Header />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verification" element={<Verification />} />
        <Route path="/current-location" element={<CurrentLocation />} />
        <Route path="/disaster-details/:id" element={<DisasterInfo />} />
        <Route path="/dosdontspage" element={<DosDontsPage />} />
        <Route path="/MissingPersonPortal" element={<MissingPersonPortal />} />
        <Route path="/statustracking" element={<StatusTracking />} />
        <Route path="/flood-prediction" element={<FloodPrediction />} />
        <Route path="/agencies" element={<Agencies />} />
        <Route path="/registration-form" element={<RegistrationForm />} />
        <Route path="/agency-dashboard" element={<AgencyDashboard />} />
        <Route path="/missing-person" element={<MissingPerson />} />
        <Route path="/person-details/:id" element={<PersonInfo />} />
        <Route path="/announcement" element={<AnnouncementPage />} />
        <Route path="/update
        
        
        details" element={<UpdateDetails />} />
      </Routes>
    </>
  );
};

export default App;
