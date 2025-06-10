import { useEffect, useState } from "react";
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
  Avatar,
} from "@mui/material";
import DrawerComp from "./DrawerComp";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import AccountCircle from "@mui/icons-material/AccountCircle";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [value, setValue] = useState(0);
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));

  const [anchorEl, setAnchorEl] = useState(null);
  const [accountAnchorEl, setAccountAnchorEl] = useState(null);
  const [openMissingPerson, setOpenMissingPerson] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
    setOpenMissingPerson(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setOpenMissingPerson(false);
  };

  const handleAccountMenuOpen = (event) => {
    setAccountAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAccountAnchorEl(null);
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
        handleAccountMenuClose();
        // navigate("/home");
        window.location.reload();
      } else {
        console.error("Logout failed:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLogin = () => {
    handleNavigation("/login");
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
  }

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
          {/* Left-aligned content */}
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <img src={logo} alt="Logo" style={{ height: "70px" }} />
            <Typography
              sx={{
                fontSize: "1.2rem",
                paddingLeft: "10px",
                fontFamily: "DM Serif Text, serif",
                cursor: "pointer",
              }}
              onClick={() => handleNavigation("/home")}
            >
              DISASTER SENTINEL
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
                <Tab label="Home" component={Link} to="/home" />
                <Tab
                  label="Services"
                  aria-controls="services-menu"
                  onClick={handleOpenMenu}
                />
              </Tabs>
            )}
          </Box>

          {/* Right-aligned content */}
          {isMatch ? (
            <DrawerComp isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
          ) : (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isLoggedIn ? (
                <>
                  <Button
                    id="account-button"
                    aria-controls="account-menu"
                    aria-haspopup="true"
                    onClick={handleAccountMenuOpen}
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
                    anchorEl={accountAnchorEl}
                    open={Boolean(accountAnchorEl)}
                    onClose={handleAccountMenuClose}
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
                      handleAccountMenuClose();
                      handleNavigation("/updatedetails")
                    }}>
                      Edit Profile
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>Logout</MenuItem>
                  </Menu>
                </>
              ) : (
                <Button
                  onClick={() => handleLogin() }
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

      {/* Main Services Menu */}
      <Menu
        id="services-menu"
        onClose={handleMenuClose}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        keepMounted
        disableScrollLock
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
              onClick={() => handleNavigation("/statustracking")}
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
          onClick={() => handleNavigation("/announcements")}
          sx={{ width: "100%" }}
        >
          Announcements
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
          Station Information
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
