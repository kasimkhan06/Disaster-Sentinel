import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Typography, Box, Grid, TextField, Button, Avatar,} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const Login = () => {
  const navigate = useNavigate();

  // Store input values
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Store validation errors
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" }); // Clear field-specific errors when typing
  };

  // Validate form on submit
  const handleLogin = () => {
    let newErrors = {};

    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Login Successful");
      // navigate("/dashboard"); // Redirect to dashboard
    }
  };

  // Redirect to registration page
  const handleRegister = () => {
    navigate("/register"); 
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to left,rgba(227, 208, 248, 0.78),rgb(168, 178, 197))",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: { xs: "100%", sm: "85%", md: "70%" },
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Box sx={{ width: "80%", textAlign: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 3 }}>
            <Avatar sx={{ bgcolor: "#4F646F", marginRight: 2, width: 56, height: 56 }}>{/* #B7ADCF */}
              <PersonIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">Login</Typography>
          </Box>

          <Grid container spacing={2} justifyContent="center">
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Email" 
                variant="standard" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                error={!!errors.email} 
                helperText={errors.email} 
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                variant="standard"
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
                helperText={errors.password}
              />
            </Grid>
          </Grid>

          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              size="large"
              sx={{ textTransform: "uppercase", width: "100%", backgroundColor: "#4F646F" }}
              onClick={handleLogin}
            >Login
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="black">
              Don’t have an account? 
              <Button variant="text" onClick={handleRegister}>Register</Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
