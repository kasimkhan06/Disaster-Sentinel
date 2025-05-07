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

const DrawerComp = ({ isLoggedIn, setIsLoggedIn }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();
  const [openMissingPerson, setOpenMissingPerson] = useState(false);

  // Toggle the sub-list under "Home"
  const handleESClick = () => {
    setHomeOpen(!homeOpen);
  };
  // const drawerWidth = `${longestItemLength * 10}px`;
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
      } else {
        console.error("Logout failed:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleMissingPersonClick = (e) => {
    e.stopPropagation();
    setOpenMissingPerson(!openMissingPerson);
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
                onClick={handleMissingPersonClick}
              >
                <ListItemText primary="Report Missing Person" />
                {openMissingPerson ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openMissingPerson} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 3, backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                  <MenuItem
                    onClick={() => {setOpenDrawer(false), setOpenMissingPerson(false), navigate("/missingpersonportal")}}
                    sx={{ width: "100%" }}
                  >
                    Report
                  </MenuItem>
                  <MenuItem
                    onClick={() => { setOpenDrawer(false), setOpenMissingPerson(false), navigate("/statustracking")}}
                    sx={{ width: "100%" }}
                  >
                    Check Status
                  </MenuItem>
                </Box>
              </Collapse>

              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => setOpenDrawer(false)}
              >
                <ListItemText primary="Agency Information" />
              </ListItemButton>

              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => {
                  setOpenDrawer(false), navigate("/current-location");
                }}
              >
                <ListItemText primary="Current Location" />
              </ListItemButton>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => {
                  setOpenDrawer(false), navigate("/flood-prediction");
                }}
              >
                <ListItemText primary="Flood Prediction" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Other List Items */}
          {isLoggedIn ? (
            <>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate("/edit-profile");
                }}
              >
                <ListItemText primary="Edit Profile" />
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

export default DrawerComp;
