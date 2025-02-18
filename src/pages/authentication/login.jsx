import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Typography, Box, Grid, TextField, Button, Avatar } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const Login = () => {
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

  const handleLogin = () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      console.log("Login Successful");
      // navigate("/dashboard");
    }
  };

  const handleRegister = () => {
    navigate("/register");
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
        background: "linear-gradient(to bottom, #4F646F, rgb(168, 178, 197))",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: 0,
        padding: 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: "70%", md: "50%" },
          backgroundColor: "#fff",
          padding: "40px",
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Avatar sx={{ bgcolor: "#4F646F", margin: "auto", width: 56, height: 56 }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" mt={2}>Login</Typography>
        </Box>

        <Grid container spacing={3} mt={3}>
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

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            size="medium"
            sx={{
              textTransform: "uppercase",
              width: "50%",
              backgroundColor: "#4F646F",
              padding: "8px 16px",
              fontSize: "14px",
            }}
            onClick={handleLogin}
          >
            Login
          </Button>
        </Box>

        <Box textAlign="center" mt={3}>
          <Typography variant="body2" color="black">
            Don’t have an account?
            <Button variant="text" onClick={handleRegister}>Register</Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;