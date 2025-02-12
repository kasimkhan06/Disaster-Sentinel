import React, { useState } from "react";
import {
  AppBar,
  Button,
  Box,
  Menu,
  MenuItem,
  Tab,
  Tabs,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import DrawerComp from "./DrawerComp";
import { Link, useNavigate } from "react-router-dom";

// const PAGES = ["Home", "About", "Contact Us"];
const Header = () => {
  const [value, setValue] = useState();
  // Initial value is undefined
  const theme = useTheme();
  console.log(theme);
  const isMatch = useMediaQuery(theme.breakpoints.down("md"));
  console.log(isMatch);

  const [anchorEl, setAnchorEl] = useState(null);
  //for dropdown
  const navigate = useNavigate();

  //function for dropdown
  const handleOpenMenu = (e) => {
    setAnchorEl(e.currentTarget);
    //button is the target
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleNavigation = (path) => {
    setAnchorEl(null); // Close the dropdown if open
    navigate(path); // Programmatically navigate to the desired route
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
          {/* Typography is used for the text in the app. It is used to style the text and make it more readable. */}
          <Typography sx={{ fontSize: "1.2rem", paddingLeft: "20px" }}>
            DISASTER SENTINAL
          </Typography>
          {isMatch ? (
            <>
              <DrawerComp />
              {/* you need to specify the open of the drawer  */}
            </>
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
                {/* Aria control is for opening the menu */}
              </Tabs>
              {/* <Button
                sx={{
                  marginLeft: "auto",
                  borderColor: "#bdbdbd",
                  backgroundColor: "#fafafa",
                  color: "black",
                }}
              >
                Login
              </Button> */}
              <Button
              onClick={() => handleNavigation("/login")}
                sx={{
                  marginLeft: "auto",
                  borderColor: "#bdbdbd",
                  color: "black",
                  backgroundColor: "#fafafa",
                }}
                // disableRipple
                // onClick={() => navigate("/signup")}
              >
                Login
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>
      {/* anchor means where is it going to be positioning. anchorEl passed here is from e.currentTarget */}
      <Menu
        id="menu"
        onClose={handleMenuClose}
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
          onClick={handleMenuClose}
          sx={{ width: "100%", justifyContent: "center" }}
        >
          Report Missing person
        </MenuItem>
        <MenuItem
          onClick={handleMenuClose}
          sx={{ width: "100%", justifyContent: "center" }}
        >
          Agency Information
        </MenuItem>
        <MenuItem
          onClick={() => handleNavigation("/current-location")}
          sx={{ width: "100%", justifyContent: "center" }}
        >
          Current Location
        </MenuItem>
      </Menu>
    </>
  );
};

export default Header;
