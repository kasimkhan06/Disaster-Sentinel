import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Typography, Box, Grid, TextField, Button, Avatar, } from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";
import EmailIcon from "@mui/icons-material/Email";
import LockIcon from "@mui/icons-material/Lock";

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

  const handleLogin = async () => {
    let newErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const response = await fetch('https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/login/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        const data = await response.json();
        
        // Log the entire response
        console.log('API Response:', {
          status: response.status,
          data: data
        });

        if (response.ok) {
          console.log('Login successful. User details:', {
            id: data.user_id,
            email: data.email,
            role: data.role,
            full_name: data.full_name
          });

          localStorage.setItem("user", JSON.stringify(data));

          if(data.role === "user"){
            navigate("/home");
          }
          else navigate("/agency-dashboard");

        } else {
          console.error('Login failed:', data.error || 'Unknown error');
          // Handle specific errors if needed
          if (data.error === 'User is not verified') {
            setErrors({...errors, form: 'Please verify your email before logging in'});
          } else if (data.error === 'Invalid credentials') {
            setErrors({...errors, form: 'Invalid email or password'});
          }
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({...errors, form: 'Network error. Please try again.'});
      }
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
        background: "linear-gradient(to bottom,rgb(100, 126, 139), rgb(210, 223, 248))",
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
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)",
        }}
      >
        <Box sx={{ textAlign: "center" }}>
          <Avatar sx={{ bgcolor: "#4F646F", margin: "auto", width: 50, height: 50 }}>
            <PersonIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" mt={2}>LOGIN</Typography>
        </Box>

        {errors.form && (
          <Typography color="error" align="center" mt={2}>
            {errors.form}
          </Typography>
        )}

        <Grid container spacing={2} mt={2} justifyContent={"center"}>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <EmailIcon sx={{mt:2, ml:5 , mr:1,color: "gray" }} />
            <TextField 
              label="Email" 
              variant="standard" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              error={!!errors.email} 
              helperText={errors.email} 
              size="small"
              sx = {{width: "70%"}}
              InputLabelProps={{ sx: { fontSize: "0.9rem" }, }}
            />
            </Box>
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <LockIcon sx={{ mt:2,ml:5 , mr:1,color: "gray" }} />
            <TextField
              label="Password"
              type="password"
              variant="standard"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={!!errors.password}
              helperText={errors.password}
              size="small"
              sx = {{width: "70%"}}
              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
            </Box>
          </Grid>
        </Grid>

        <Box textAlign="center" mt={4} >
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
            <Button variant="text" onClick={handleRegister}>Register</Button>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;