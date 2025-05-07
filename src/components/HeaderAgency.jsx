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
import DrawerComp from "./DrawerComp";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";

const Header = ({ isLoggedIn, setIsLoggedIn }) => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);

  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [openAnnouncement, setOpenAnnouncement] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLogin(true);
    }
  }, []);

  // Services Menu Handlers
  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  // Announcement Submenu Handlers
  const handleOpenAnnouncementMenu = (e) => setAnchorElAnnouncement(e.currentTarget);
  const handleCloseAnnouncementMenu = () => setAnchorElAnnouncement(null);

  // Profile Menu Handlers
  const handleOpenProfileMenu = (e) => setAnchorElProfile(e.currentTarget);
  const handleCloseProfileMenu = () => setAnchorElProfile(null);

  const handleNavigation = (path) => {
    navigate(path);
    handleCloseMenu();
    handleCloseAnnouncementMenu();
    handleCloseProfileMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLogin(false);
    handleCloseProfileMenu();
    navigate("/login");
  };

  const handleAnnouncementClick = (e) => {
    e.stopPropagation();
    setOpenAnnouncement(!openAnnouncement);
  };

  return (
    <AppBar
      sx={{ bgcolor: "#fafafa", color: "black", boxShadow: "0px 1px 7px #bdbdbd" }}
      elevation={2}
    >
      <Toolbar>
        {/* Logo & Title */}
        <Box display="flex" alignItems="center">
          <img src={logo} alt="Logo" style={{ height: "70px" }} />
          <Typography
            sx={{ fontSize: "1.2rem", paddingLeft: "10px", fontFamily: "DM Serif Text, serif", cursor: "pointer" }}
            onClick={() => handleNavigation("/home")}
          >
            DISASTER SENTINEL
          </Typography>
        </Box>

        {/* Tabs or Drawer for Mobile */}
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
              <Tab label="Home" component={Link} to="/agency-dashboard" />
              <Tab label="Services" onClick={handleOpenMenu} />
            </Tabs>

            {/* Profile / Login Section - Always Rightmost */}
            <Box sx={{ marginLeft: "auto" }}>
              {user ? (
                <>
                  <Button onClick={handleOpenProfileMenu} sx={{ color: "black" }}>
                    <Avatar sx={{ bgcolor: "#3f51b5", marginRight: 1 }}>
                      {user.full_name ? user.full_name[0].toUpperCase() : "U"}
                    </Avatar>
                    {user.full_name}
                  </Button>

                  {/* Profile Dropdown */}
                  <Menu
                    anchorEl={anchorElProfile}
                    open={Boolean(anchorElProfile)}
                    onClose={handleCloseProfileMenu}
                    anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                    transformOrigin={{ vertical: "top", horizontal: "right" }}
                    sx={{
                      minWidth: "160px", // Adjust the minimum width of the menu to ensure enough space
                      marginTop: "10px", // Space between the menu and the "Services" tab
                    }}
                  >
                    <MenuItem onClick={() => handleNavigation(`/agency-profile/${user.user_id}`)}>Profile</MenuItem>
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
                  }}
                >
                  Login
                </Button>
              )}
            </Box>
          </>
        )}
      </Toolbar>

      <Menu
        id="menu"
        onClose={handleCloseMenu}
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        anchorOrigin={{
          vertical: "bottom", // Position the menu below the Services tab
          horizontal: "center", // Align it at the center horizontally
        }}
        transformOrigin={{
          vertical: "top", // Align the menu items to the top of the menu
          horizontal: "center", // Align the menu items to the center horizontally
        }}
        sx={{
          minWidth: "160px", // Adjust the minimum width of the menu to ensure enough space
          marginTop: "10px", // Space between the menu and the "Services" tab
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
    </AppBar>
  );
};

export default Header;