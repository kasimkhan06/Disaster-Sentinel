// import { Component } from 'react'
import CurrentLocation from './pages/disasters/user/CurrentLocation'
import Home from './pages/dashboard/user/Home'
import DisasterInfo from './pages/disasters/user/DisasterInfo'
import { Routes, Route } from "react-router-dom";
import Header from './components/Header';
import Login from './pages/authentication/login';
import Register from './pages/authentication/register';
import Verification from './pages/authentication/verification';

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
    </Routes>
    </>
  )
}

export default App
