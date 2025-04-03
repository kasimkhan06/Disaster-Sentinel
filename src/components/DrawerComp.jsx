import React, { useState } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandLess from "@mui/icons-material/ExpandLess";
import ExpandMore from "@mui/icons-material/ExpandMore";
import { Link, useNavigate } from "react-router-dom";

const DrawerComp = () => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const [homeOpen, setHomeOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  // Toggle the sub-list under "Home"
  const handleESClick = () => {
    setHomeOpen(!homeOpen);
  };
  // const drawerWidth = `${longestItemLength * 10}px`;

  return (
    <>
      <Drawer
        open={openDrawer}
        onClose={() => setOpenDrawer(false)}
        PaperProps={{
          sx: {
            width: "230px", // Set width to 30%
          },
        }}
      >
        <List>
          {/* Home with Expand/Collapse */}
          <ListItemButton onClick={handleESClick}>
            <ListItemText primary="Emergency Services" />
            {homeOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>

          {/* Sub-list under Home */}
          <Collapse in={homeOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItemButton
                sx={{ pl: 4 }}
                onClick={() => {
                  setOpenDrawer(false), navigate("/MissingPersonPortal");
                }}
              >
                <ListItemText primary="Report Missing Person" />
              </ListItemButton>

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
            </List>
          </Collapse>

          {/* Other List Items */}

          <ListItemButton onClick={() => {setOpenDrawer(false), navigate("/flood-prediction")}}>
            <ListItemText primary="Flood Prediction" />
          </ListItemButton>
          <ListItemButton onClick={() => {setOpenDrawer(false), navigate("/login")}}>
            <ListItemText primary="Login" />
          </ListItemButton>

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
