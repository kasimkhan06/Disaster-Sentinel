import React, { useState, useEffect } from "react";
import {
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Menu,
  MenuItem,
  Box,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";

const DrawerCompAgency = ({ isLoggedIn, setIsLoggedIn }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [openAnnouncement, setOpenAnnouncement] = useState(false);
  const [userID, setUserID] = useState(null);
  

  // Toggle the sub-list under "Home"
  const handleESClick = () => {
    setHomeOpen(!homeOpen);
  };
  // const drawerWidth = `${longestItemLength * 10}px`;
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      setIsLoggedIn(!!user);
      if (user) {
        const parsedData = JSON.parse(user);
        setUserID(parsedData.user_id);
      } else {
        setUserID(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    handleStorageChange();

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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
        navigate("/home");
         window.location.reload();
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
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            width: "250px", // Set width to 30%
          },
        }}
      >
        <List>
          {/* Home with Expand/Collapse */}
          <ListItemButton onClick={handleESClick}>
            <ListItemText primary="Services" />
            {homeOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          {/* Sub-list under Home */}
          <Collapse in={homeOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => {
                  setOpenDrawer(false), navigate("/missing-person");
                }}
              >
                <ListItemText primary="Missing Person" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                onClick={handleAnnouncementClick}
              >
                <ListItemText primary="Announcement" />
                {openAnnouncement ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openAnnouncement} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 3, backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                  <MenuItem
                    onClick={() => {setOpenDrawer(false), setOpenAnnouncement(false), navigate("/event-listing")}}
                    sx={{ width: "100%" }}
                  >
                    Event
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setOpenDrawer(false), setOpenAnnouncement(false), navigate("/create-event")}}
                    sx={{ width: "100%" }}
                  >
                    Create Event
                  </MenuItem>
                </Box>
              </Collapse>
            </List>
          </Collapse>

          {/* Other List Items */}
          {isLoggedIn ? (
            <>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate(`/agency-profile/${userID}`);
                }}
              >
                <ListItemText primary="Profile" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), handleLogout();
                }}
              >
                <ListItemText primary="Logout" />
              </ListItemButton>
            </>
          ) : (
            <ListItemButton
              onClick={() => {
                setOpenDrawer(false), navigate("/login");
              }}
            >
              <ListItemText primary="Login" />
            </ListItemButton>
          )}
        </List>
      </Drawer>

      <IconButton
        sx={{ color: "black", marginLeft: "auto" }}
        onClick={() => setOpenDrawer(!openDrawer)}
      >
        <MenuIcon />
      </IconButton>
    </>
  );
};

export default DrawerCompAgency;