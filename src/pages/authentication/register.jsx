import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Typography,Box,Grid,TextField,RadioGroup,FormControlLabel,Radio,Button,Avatar,} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";

const Register = () => {
  const navigate = useNavigate();

  // Store form values
  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    email: "",
    password: "",
    role: "",
    agencyNumber: ""
  });

  // Store validation errors
  const [errors, setErrors] = useState({});

  // Handle form field changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));
  };

  // Form validation
  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact No. is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.password.trim()) newErrors.password = "Password is required";
    if (!formData.role) newErrors.role = "Role selection is required";
    if (formData.role === "agency" && !formData.agencyNumber.trim()) {
      newErrors.agencyNumber = "Agency Number is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSignUp = () => {
    if (validateForm()) {
      navigate("/verification"); // Redirect if validation passes
    }
  };

  // Redirect to login page
  const loginRedirect = () => {
    navigate("/login");
  };
  useEffect(() => {
    const originalMargin = document.body.style.margin;
    document.body.style.margin = "0";

    return () => {
      document.body.style.margin = originalMargin; // Restore original margin when unmounting
    };
  }, []);
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
            <Avatar sx={{ bgcolor: "#4F646F", marginRight: 2, width: 56, height: 56 }}>
              <PersonAddAltIcon />
            </Avatar>
            <Typography variant="h5" fontWeight="bold">Create Account</Typography>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Full Name" variant="standard" name="fullName" value={formData.fullName} onChange={handleChange} error={!!errors.fullName} helperText={errors.fullName}/>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Contact No." variant="standard"name="contact" value={formData.contact} onChange={handleChange} error={!!errors.contact} helperText={errors.contact}/>
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Email" variant="standard" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email}/>
              <Box sx={{ textAlign: "left", mt: 1 }}>
                <Typography variant="caption" color="textSecondary">
                  Verification email will be sent.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Password" type="password" variant="standard" name="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password}/>
            </Grid>
            <Grid item xs={12}>
              <RadioGroup row name="role" value={formData.role} onChange={handleChange}>
                <FormControlLabel value="user" control={<Radio />} label="User" />
                <FormControlLabel value="agency" control={<Radio />} label="Agency" />
              </RadioGroup>
              {errors.role && (
                <Typography color="error" variant="body2">{errors.role}</Typography>
              )}
            </Grid>

            {formData.role === "agency" && (
              <Grid item xs={12}>
                <TextField fullWidth label="Agency Number" variant="standard" name="agencyNumber" value={formData.agencyNumber} onChange={handleChange} error={!!errors.agencyNumber} helperText={errors.agencyNumber}/>
              </Grid>
            )}
          </Grid>

          <Box textAlign="center" mt={3}>
            <Button
              variant="contained"
              size="large"
              sx={{ textTransform: "uppercase", width: "100%", backgroundColor: "#4F646F" }}
              onClick={handleSignUp}
            >Sign Up
            </Button>
          </Box>

          <Box textAlign="center" mt={2}>
            <Typography variant="body2" color="black">
              Already registered? 
              <Button variant="text" onClick={loginRedirect}>
                Login
              </Button>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Register;
