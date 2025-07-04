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
   const [userPermissions, setUserPermissions] = useState([]);
  const [ openVolunteerServices, setOpenVolunteerServices ] = useState(false);

  // Toggle the sub-list under "Home"
  const handleESClick = () => {
    setOpenVolunteerServices(!openVolunteerServices);
  };
  // const drawerWidth = `${longestItemLength * 10}px`;
  useEffect(() => {
    const handleStorageChange = () => {
      const user = localStorage.getItem("user");
      if (user) {
        const parsedUser = JSON.parse(user);
        console.log("User permissions", parsedUser.permissions);
        const permissions = parsedUser.permissions || [];
        setUserPermissions(permissions);
      }
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
        localStorage.removeItem("agencyState");
        localStorage.removeItem("redirectAfterLogin");
        setIsLoggedIn(false);
        // handleAccountMenuClose();
        navigate("/home");
        window.location.reload();
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
  const handleNavigation = (path) => {
    setAnchorEl(null);
    navigate(path);
  };
  const handleLogin = () => {
    handleNavigation("/login");
    localStorage.setItem("redirectAfterLogin", window.location.pathname);
  };

  const hasPermissions = userPermissions.length > 0;
  const canMakeAnnouncements = userPermissions.some(
    (perm) => perm.can_make_announcements
  );
  const canEditAnnouncements = userPermissions.some(
    (perm) => perm.can_edit_announcements
  );
  const canEditMissing = userPermissions.some((perm) => perm.can_edit_missing);
  const canViewMissing = userPermissions.some((perm) => perm.can_view_missing);

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
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate("/agencies");
                }}
              >
                <ListItemText primary="Agency Information" />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate("/announcements");
                }}
              >
                <ListItemText primary="Announcements" />
              </ListItemButton>

              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate("/current-location");
                }}
              >
                <ListItemText primary="Location Information" />
              </ListItemButton>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate("/flood-prediction");
                }}
              >
                <ListItemText primary="Station Information" />
              </ListItemButton>

                              <ListItemButton onClick={handleMissingPersonClick}>
                <ListItemText primary="Report Missing Person" />
                {openMissingPerson ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              <Collapse in={openMissingPerson} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 3, backgroundColor: "rgba(0, 0, 0, 0.04)" }}>
                  <MenuItem
                    onClick={() => {
                      setOpenDrawer(false),
                        setOpenMissingPerson(false),
                        navigate("/missingpersonportal");
                    }}
                    sx={{ width: "100%" }}
                  >
                    Report
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setOpenDrawer(false),
                        setOpenMissingPerson(false),
                        navigate("/statustracking");
                    }}
                    sx={{ width: "100%" }}
                  >
                    Check Status
                  </MenuItem>
                </Box>
              </Collapse>
              
          {hasPermissions && (
            <>
              <ListItemButton onClick={handleESClick}>
                <ListItemText primary="Volunteer Services" />
                {openVolunteerServices ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>

              {/* Sub-list under Home */}
              <Collapse in={openVolunteerServices} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {canMakeAnnouncements && (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => {
                      setOpenDrawer(false), navigate("/create-event");
                    }}
                  >
                    <ListItemText primary="Create Announcement" />
                  </ListItemButton>
                  )}
                  {canEditAnnouncements && (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => {
                      setOpenDrawer(false), navigate("/event-listing");
                    }}
                  >
                    <ListItemText primary="Edit Announcements" />
                  </ListItemButton>
                  )}
                  {canViewMissing && (
                  canEditMissing ? (
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => {
                      setOpenDrawer(false), navigate("/missing-person");
                    }}
                  >
                    <ListItemText primary="View and edit Missing Persons" />
                  </ListItemButton>
                  ):(
                  <ListItemButton
                    sx={{ pl: 4 }}
                    onClick={() => {
                      setOpenDrawer(false), navigate("/missing-person");
                    }}
                  >
                    <ListItemText primary="View Missing Persons" />
                  </ListItemButton>
                  ))}
                </List>
              </Collapse>
            </>
          )}

          {/* Other List Items */}
          {isLoggedIn ? (
            <>
              <ListItemButton
                onClick={() => {
                  setOpenDrawer(false), navigate("/updatedetails");
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
                setOpenDrawer(false), handleLogin();
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
