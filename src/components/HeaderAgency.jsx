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
  Avatar,
  Collapse,
  ListItemText,
} from "@mui/material";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { EventFormProvider } from "../hooks/useEventForm";
import DrawerCompAgency from "./DrawerCompAgency";
import { Link, useNavigate } from "react-router-dom";
import AccountCircle from "@mui/icons-material/AccountCircle";
import logo from "./logo.png";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  const [openAnnouncement, setOpenAnnouncement] = useState(false);
  const [anchorElAnnouncement, setAnchorElAnnouncement] = useState(null);

  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    window.addEventListener('storage', handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedData = JSON.parse(userData);
      setUser(parsedData);
      setIsLogin(true);
    }
  }, []);

  // Services Menu Handlers
  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
    setOpenAnnouncement(false);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
    setOpenAnnouncement(false);
  };

  // Announcement Submenu Handlers
  const handleOpenAnnouncementMenu = (e) => setAnchorElAnnouncement(e.currentTarget);
  const handleCloseAnnouncementMenu = () => setAnchorElAnnouncement(null);

  // Profile Menu Handlers
  const handleProfileMenuOpen = (e) => setAnchorElProfile(e.currentTarget);
  const handleProfileMenuClose = () => setAnchorElProfile(null);

  const handleNavigation = (path) => {
    navigate(path);
    setAnchorEl(null);
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
        handleProfileMenuClose();
        navigate("/home");
      } else {
        console.error("Logout failed:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleAnnouncementClick = (e) => {
    e.stopPropagation();
    setOpenAnnouncement(!openAnnouncement);
  };

  return (
    <>
      <AppBar
        sx={{
          bgcolor: "#fafafa",
          color: "black",
          boxShadow: "0px 1px 7px #bdbdbd"
        }}
        elevation={2}
      >
        <Toolbar>
          {/* Logo & Title */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: "70px" }} />
            <Typography
              sx={{
                fontSize: "1.2rem",
                paddingLeft: "10px",
                fontFamily: "DM Serif Text, serif",
                cursor: "pointer",
              }}
              onClick={() => handleNavigation("/agency-dashboard")}
            >
              DISASTER SENTINAL
            </Typography>
            {!isMatch && (
              <Tabs
                textColor="inherit"
                value={value}
                onChange={(e, value) => setValue(value)}
                TabIndicatorProps={{
                  sx: { backgroundColor: "#bdbdbd" },
                }}
                sx={{
                  ml: 4,
                  '& .MuiTab-root': {
                    minWidth: 'auto', // Allow tabs to size naturally
                    width: 'auto',   // Prevent forced width
                    padding: '6px 16px', // Consistent padding with account button
                    '&:focus': {
                      outline: 'none',
                    }
                  }
                }}
              >
                <Tab label="Home" component={Link} to="/agency-dashboard" />
                <Tab
                  label="Services"
                  aria-controls="services-menu"
                  onClick={handleOpenMenu}
                />
              </Tabs>
            )}
          </Box>

          {/* Tabs or Drawer for Mobile */}
          {isMatch ? (
            <DrawerCompAgency isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn}/>
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isLoggedIn ? (
                <>
                  <Button
                    id="account-button"
                    aria-controls="account-menu"
                    aria-haspopup="true"
                    onClick={handleProfileMenuOpen}
                    disableRipple
                    sx={{
                      color: "black",
                      textTransform: "none",
                      padding: "6px 16px",
                      gap: 1,
                      minWidth: 130,
                      width: "auto",
                      transition: 'none', // <-- Add this
                      '&:hover': {
                        backgroundColor: 'transparent',
                      },
                      '&:focus': {
                        outline: 'none',
                        transform: 'none',
                      },
                      '&:active': {
                        transform: 'none',
                      },
                      '&.Mui-focusVisible': {
                        boxShadow: 'none',
                        backgroundColor: 'transparent',
                      }
                    }}

                  >
                    <AccountCircle />
                    <Typography variant="body1">Account</Typography>
                  </Button>
                  <Menu
                    id="account-menu"
                    anchorEl={anchorElProfile}
                    open={Boolean(anchorElProfile)}
                    onClose={handleProfileMenuClose}
                    keepMounted
                    disableScrollLock
                    anchorOrigin={{
                      vertical: "bottom",
                      horizontal: "right",
                    }}
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    sx={{
                      minWidth: "200px",
                      marginTop: "15px",
                      "& .MuiMenu-paper": {
                        overflow: "visible",
                        transform: 'none !important',
                      },
                    }}
                  >
                    <MenuItem onClick={() => {
                      handleProfileMenuClose();
                      handleNavigation(`/agency-profile/${user.user_id}`);
                    }}>
                      Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  onClick={() => handleNavigation("/login")}
                  sx={{
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
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Menu
        id="services-menu"
        onClose={handleCloseMenu}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        keepMounted
        disableScrollLock
        anchorOrigin={{
          vertical: "bottom", // Position the menu below the Services tab
          horizontal: "center", // Align it at the center horizontally
        }}
        transformOrigin={{
          vertical: "top", // Align the menu items to the top of the menu
          horizontal: "center", // Align the menu items to the center horizontally
        }}
        sx={{
          minWidth: "200px",
          marginTop: "10px",
          "& .MuiMenu-paper": {
            overflow: "visible",
          },
        }}
      >
        <MenuItem
          onClick={() => handleNavigation("/missing-person")}
          sx={{ width: "100%", justifyContent: "center" }}
        >
          Missing Person List
        </MenuItem>
        <MenuItem onClick={handleAnnouncementClick}>
          <ListItemText primary="Announcement" />
          {openAnnouncement ? <ExpandLess /> : <ExpandMore />}
        </MenuItem>

        <Collapse in={openAnnouncement} timeout="auto" unmountOnExit>
          <Box sx={{ pl: 3, backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
            <MenuItem
              onClick={() => handleNavigation("/event-listing")}
              sx={{ width: "100%" }}
            >
              Event
            </MenuItem>
            <MenuItem
              onClick={() => handleNavigation("/create-event")}
              sx={{ width: "100%" }}
            >
              Create Event
            </MenuItem>
          </Box>
        </Collapse>
      </Menu>
    </>
  );
};

export default Header;