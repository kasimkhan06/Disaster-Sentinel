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
  Collapse,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import DrawerComp from "./DrawerComp";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";

const Header = () => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [openMissingPerson, setOpenMissingPerson] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);
  }, []);

  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
    setOpenMissingPerson(false); // Reset submenu state when opening main menu
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMissingPerson(false);
  };

  const handleMissingPersonClick = (e) => {
    e.stopPropagation();
    setOpenMissingPerson(!openMissingPerson);
  };

  const handleNavigation = (path) => {
    setAnchorEl(null);
    navigate(path);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/logout/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await response.json();
      console.log("Logout response:", data);

      if (response.ok) {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        navigate("/home");
      } else {
        console.error("Logout failed:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <AppBar
        sx={{
          bgcolor: "#fafafa",
          color: "black",
          boxShadow: "0px 1px 7px #bdbdbd",
        }}
        elevation={2}
      >
        <Toolbar>
          <Box display="flex" alignItems="center">
            <img src={logo} alt="Logo" style={{ height: "70px" }} />
            <Typography
              sx={{
                fontSize: "1.2rem",
                paddingLeft: "10px",
                fontFamily: "DM Serif Text, serif",
              }}
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
                TabIndicatorProps={{
                  sx: { backgroundColor: "#bdbdbd" },
                }}
              >
                <Tab label="Home" component={Link} to="/home" />
                <Tab
                  label="Services"
                  aria-controls="menu"
                  onClick={handleOpenMenu}
                />
              </Tabs>
              {isLoggedIn ? (
                <Button
                  onClick={handleLogout}
                  sx={{
                    marginLeft: "auto",
                    borderColor: "#bdbdbd",
                    color: "black",
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  Logout
                </Button>
              ) : (
                <Button
                  onClick={() => handleNavigation("/login")}
                  sx={{
                    marginLeft: "auto",
                    borderColor: "#bdbdbd",
                    color: "black",
                    backgroundColor: "#fafafa",
                    "&:hover": {
                      backgroundColor: "#e0e0e0",
                    },
                  }}
                >
                  Login
                </Button>
              )}
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Main Services Menu */}
      <Menu
        id="menu"
        onClose={handleMenuClose}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        sx={{
          minWidth: "200px",
          marginTop: "10px",
          "& .MuiMenu-paper": {
            overflow: "visible",
          },
        }}
      >
        <MenuItem onClick={handleMissingPersonClick}>
          <ListItemText primary="Report Missing Person" />
          {openMissingPerson ? <ExpandLess /> : <ExpandMore />}
        </MenuItem>

        <Collapse in={openMissingPerson} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 3, backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
            <MenuItem
              onClick={() => handleNavigation("/missingpersonportal")}
              sx={{ width: "100%" }}
            >
              Report
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation("/status-tracking")}
              sx={{ width: "100%" }}
            >
              Check Status
            </MenuItem>
          </Box>
        </Collapse>

        <MenuItem
          onClick={() => handleNavigation("/agencies")}
          sx={{ width: "100%" }}
        >
          Agency Information
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigation("/current-location")}
          sx={{ width: "100%" }}
        >
          Current Location
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigation("/flood-prediction")}
          sx={{ width: "100%" }}
        >
          Flood Prediction
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
