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
} from "@mui/material";
import DrawerComp from "./DrawerComp";
import { Link, useNavigate } from "react-router-dom";
import logo from "./logo.png";

const Header = () => {
  const [value, setValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [anchorElProfile, setAnchorElProfile] = useState(null);
  
  const theme = useTheme();
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLogin(true);
    }
  }, []);

  const handleOpenMenu = (e) => setAnchorEl(e.currentTarget);
  const handleCloseMenu = () => setAnchorEl(null);

  const handleOpenProfileMenu = (e) => setAnchorElProfile(e.currentTarget);
  const handleCloseProfileMenu = () => setAnchorElProfile(null);

  const handleNavigation = (path) => {
    navigate(path);
    handleCloseMenu();
    handleCloseProfileMenu();
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLogin(false);
    handleCloseProfileMenu();
    navigate("/login");
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
              {user?.role === "agency" ? (
                <>
                  <Tab label="Home" component={Link} to="/agency-dashboard" />
                  <Tab label="Services" onClick={handleOpenMenu} />
                </>
              ) : (
                <>
                  <Tab label="Home" component={Link} to="/home" />
                  <Tab label="Services" onClick={handleOpenMenu} />
                </>
              )}
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
                    sx={{ marginTop: "10px" }}
                  >
                    <MenuItem onClick={() => handleNavigation("/profile")}>Profile</MenuItem>
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

      {/* Services Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        transformOrigin={{ vertical: "top", horizontal: "center" }}
        sx={{ marginTop: "10px" }}
      >
        {user?.role === "agency" ? (
          <>
            <MenuItem onClick={() => handleNavigation("/missing-person")}>Missing Person List</MenuItem>
            <MenuItem onClick={() => handleNavigation("/agency")}>{user.full_name} Details</MenuItem>
            <MenuItem onClick={() => handleNavigation("/current-location")}>Current Location</MenuItem>
            <MenuItem onClick={() => handleNavigation("/announcement")}>Announcement</MenuItem>
          </>
        ) : (
          <>
            <MenuItem onClick={() => handleNavigation("/report-missing")}>Report Missing Person</MenuItem>
            <MenuItem onClick={() => handleNavigation("/agency")}>Agency Information</MenuItem>
            <MenuItem onClick={() => handleNavigation("/current-location")}>Current Location</MenuItem>
          </>
        )}
      </Menu>
    </AppBar>
  );
};

export default Header;