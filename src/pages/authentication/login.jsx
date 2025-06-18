import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";
import Footer from "../../components/Footer";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const Login = ({ setIsLoggedIn }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleLogin = async () => {
    let newErrors = {};

    // Basic validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(formData.email)) {
      // Added robust email format validation here
      newErrors.form = "Invalid email or password"; // Set form-level error for consistency
    }

    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    }

    setErrors(newErrors);

    // Proceed only if client-side validation passes
    if (Object.keys(newErrors).length === 0) {
      try {
        // Make the API call
        const response = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/login/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              password: formData.password,
            }),
          }
        );

        const data = await response.json();
        console.log("API Response:", { status: response.status, data });

        if (response.ok) {
          // Log the received user details AND permissions
          setIsLoggedIn(true);
          console.log("Login successful. User details:", {
            id: data.user_id,
            email: data.email,
            role: data.role,
            full_name: data.full_name,
            state: data.state,
            district: data.district,
            permissions: data.permissions, // <<< Log the permissions array
          });

          localStorage.setItem("user", JSON.stringify(data));
          const redirectPath = localStorage.getItem("redirectAfterLogin");
          localStorage.removeItem("redirectAfterLogin");
          if (data.role === "user") {
            window.location.assign(redirectPath || "/home");
            // navigate(redirectPath ||"/home");
          } else {
            try {
              const agencyResponse = await fetch(
                `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${data.user_id}`
              );
              const agencyData = await agencyResponse.json();
              console.log("Agency details:", agencyData);

              if (
                agencyResponse.ok &&
                agencyData &&
                Object.keys(agencyData).length > 0
              ) {
                console.log(
                  "Agency data found, navigating to agency dashboard."
                );
                // navigate("/agency-dashboard");
                window.location.assign(redirectPath || "/agency-dashboard");

              } else {
                console.error(
                  "Agency details not found for user ID:",
                  data.user_id
                );
                // navigate("/registration-form");
                window.location.assign("/registration-form");
              }
            } catch (error) {
              console.error("Error fetching agency details:", error);
              setErrors({
                ...errors,
                form: "Failed to retrieve agency information. Please try again.",
              });
            }
          }
        } else {
          console.error(
            "Login failed:",
            data.error || `HTTP error! status: ${response.status}`
          );
          let errorMessage = "Login failed. Please try again.";
          if (data.error === "User is not verified") {
            errorMessage = "Please verify your email before logging in";
          } else if (data.error === "Invalid credentials") {
            errorMessage = "Invalid email or password"; // This is the crucial part you wanted to maintain
          }
          setErrors({ ...errors, form: errorMessage });
        }
      } catch (error) {
        console.error("Login error:", error);
        setErrors({
          ...errors,
          form: "Network error or issue processing response. Please try again.",
        });
      }
    }
  };

  const handleRegister = () => {
    navigate("/register");
  };

  const handleVeri = () => {
    navigate("/verification");
  };

  useEffect(() => {
    const originalMargin = document.body.style.margin;
    document.body.style.margin = "0";
    return () => {
      document.body.style.margin = originalMargin;
    };
  }, []);

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        minHeight: "100vh",
        background: `
          linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
          url(${worldMapBackground})
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        margin: 0,
        padding: 0,
        zIndex: 0, // Only needed if you have other elements with zIndex
      }}
    >
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 0,
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            width: { xs: "90%", sm: "60%", md: "35%" },
            backgroundColor: "#fff",
            paddingTop: "25px",
            paddingBottom: "25px",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <Avatar
              sx={{ bgcolor: "#4F646F", margin: "auto", width: 50, height: 50 }}
            >
              <PersonIcon />
            </Avatar>
            <Typography variant="h6" fontWeight="bold" mt={2}>
              LOGIN
            </Typography>
          </Box>

          {errors.form && (
            <Typography color="error" align="center" mt={2}>
              {errors.form}
            </Typography>
          )}

          <Grid container spacing={2} mt={2} justifyContent={"center"}>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <EmailIcon sx={{ mt: 2, ml: 5, mr: 1, color: "gray" }} />
                <TextField
                  label="Email"
                  variant="standard"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={!!errors.email || (!!errors.form && errors.form.includes("email"))} // Indicate error for field or form
                  helperText={errors.email} // Only show specific field error
                  size="small"
                  sx={{ width: "70%" }}
                  InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                />
              </Box>
            </Grid>
            <Grid
              item
              xs={12}
              sx={{ display: "flex", justifyContent: "center" }}
            >
              <Box
                sx={{ display: "flex", alignItems: "center", width: "100%" }}
              >
                <LockIcon sx={{ mt: 2, ml: 5, mr: 1, color: "gray" }} />
                <TextField
                  label="Password"
                  type="password"
                  variant="standard"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  error={!!errors.password || (!!errors.form && errors.form.includes("password"))} // Indicate error for field or form
                  helperText={errors.password} // Only show specific field error
                  size="small"
                  sx={{ width: "70%" }}
                  InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                />
              </Box>
            </Grid>
          </Grid>

          <Box textAlign="center" mt={4}>
            <Button
              variant="contained"
              size="medium"
              sx={{
                textTransform: "uppercase",
                width: "15%",
                backgroundColor: "#4F646F",
                padding: "8px",
                fontSize: "12px",
              }}
              onClick={handleLogin}
            >
              Login
            </Button>
          </Box>

          <Box textAlign="center" mt={3}>
            <Typography variant="body2" color="textSecondary">
              Dont have an account?
              <Button variant="text" onClick={handleRegister}>
                Register
              </Button>
              <Button variant="text" onClick={handleVeri}>
                Veri
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
      <Footer />
    </Box>
  );
};

export default Login;