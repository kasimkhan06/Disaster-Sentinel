import { useState, useEffect } from "react";
import {
  AppBar,
  Button,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
  Box,
} from "@mui/material";
import DrawerComp from "./DrawerComp";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "./logo.png";

const Header = () => {
  const [value, setValue] = useState(0);
  const [userRole, setUserRole] = useState(null); 
  const [anchorEl, setAnchorEl] = useState(null);
  
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  // Fetch user role from backend (assuming JWT or session storage)
  useEffect(() => {
    const fetchUserRole = async () => {
      try {
        const response = await axios.get("https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/signup/", {
          withCredentials: true, 
        });
        setUserRole(response.data.role); 
      } catch (error) {
        console.error("Error fetching user role:", error);
      }
    };

    fetchUserRole();
  }, []);

  // Dropdown handlers
  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNavigation = (path) => {
    setAnchorEl(null);
    navigate(path);
  };

  return (
    <>
      <AppBar
        sx={{ bgcolor: "#fafafa", color: "black", boxShadow: "0px 1px 7px #bdbdbd" }}
        elevation={2}
      >
        <Toolbar>
          {/* Logo & Title */}
          <Box display="flex" alignItems="center">
            <img src={logo} alt="Logo" style={{ height: "70px" }} />
            <Typography
              sx={{ fontSize: "1.2rem", paddingLeft: "10px", fontFamily: "DM Serif Text, serif" }}
              onClick={() => handleNavigation("/home")}
            >
              DISASTER SENTINEL
            </Typography>
          </Box>

          {isMatch ? (
            <DrawerComp />
          ) : (
            <>
              <Tabs
                textColor="inherit"
                value={value}
                onChange={(e, value) => setValue(value)}
                TabIndicatorProps={{ sx: { backgroundColor: "#bdbdbd" } }}
              >
                {/* Render menu based on role */}
                {userRole === "agency" ? (
                  <>
                    <Tab label="Agency Dashboard" component={Link} to="/agency-dashboard" />
                    <Tab label="Services" aria-controls="menu" onClick={handleOpenMenu} />
                  </>
                ) : (
                  <>
                    <Tab label="Home" component={Link} to="/home" />
                    <Tab label="Services" aria-controls="menu" onClick={handleOpenMenu} />
                  </>
                )}
              </Tabs>

              {/* Login Button */}
              <Button
                onClick={() => handleNavigation("/login")}
                sx={{
                  marginLeft: "auto",
                  borderColor: "#bdbdbd",
                  color: "black",
                  backgroundColor: "#fafafa",
                }}
              >
                Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Dropdown Menu */}
      <Menu
        id="menu"
        onClose={handleMenuClose}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ minWidth: "160px", marginTop: "10px" }}
      >
        {userRole === "agency" ? (
          <>
            <MenuItem onClick={() => handleNavigation("/missing-person")}>Missing Person</MenuItem>
            <MenuItem onClick={() => handleNavigation("/agency")}>Agency Information</MenuItem>
            <MenuItem onClick={() => handleNavigation("/current-location")}>Current Location</MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => handleNavigation("/report-missing")}>Report Missing Person</MenuItem>
            <MenuItem onClick={() => handleNavigation("/agency")}>Agency Information</MenuItem>
            <MenuItem onClick={() => handleNavigation("/current-location")}>Current Location</MenuItem>0
          </>
        )}
      </Menu>
    </>
  );
};

export default Header;