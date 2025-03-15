// import { Component } from 'react'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import CurrentLocation from './pages/disasters/user/CurrentLocation'
import Home from './pages/dashboard/user/Home'
import DisasterInfo from './pages/disasters/user/DisasterInfo'
import Header from './components/Header';
import Login from './pages/authentication/login';
import Register from './pages/authentication/register';
import Verification from './pages/authentication/verification';
import NGODashboard from './pages/agency/Agency';
import RegistrationForm from './pages/dashboard/agency/RegistrationForm';
import AgencyDashboard from './pages/dashboard/agency/agencyDashboard';
import MissingPerson from './pages/dashboard/agency/Missing Person/MissingPerson';
import PersonInfo from './pages/dashboard/agency/Missing Person/PersonInfo';

const App = () => {
    // let component
    // switch (window.location.pathname) {
        
    //     case '/home':
    //         component = <Home />
    //         break
    //     case '/current-location':
    //         component = <CurrentLocation />
    //         break
    //     case '/disaster-details':
    //         component = <DisasterInfo />
    //         break
    // }
  return (
    <>
    <Header /> {/* Header is now wrapped within Router */}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verification" element={<Verification />} />
      <Route path="/current-location" element={<CurrentLocation />} />
      <Route path="/disaster-details/:id" element={<DisasterInfo />} />
      <Route path="/agency" element={<NGODashboard />} />
      <Route path="/RegistrationForm" element={<RegistrationForm />} />
      <Route path="/AgencyDashboard" element={<AgencyDashboard />} />
      <Route path="/MissingPerson" element={<MissingPerson />} />
      <Route path="/person-details/:id" element={<PersonInfo />} />
    </Routes>
    </>
  )
}

export default App
