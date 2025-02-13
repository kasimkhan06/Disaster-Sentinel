import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Typography,Box,Grid,TextField,RadioGroup,FormControlLabel,Radio,Button,Avatar,} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    email: "",
    password: "",
    role: "",
    agencyNumber: ""
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: "" }));
  };

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

  const handleSignUp = async () => {
    if (validateForm()) {
      try {
        const response = await axios.post(
          'https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/signup/', // API endpoint for registration
          {
            full_name: formData.fullName,
            contact: formData.contact,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            agency_pan: formData.role === 'agency' ? formData.agencyNumber : null,
          }
        );
        
        console.log('Registration Success:', response.data);
        navigate("/verification", { state: { email: formData.email } }); // Redirect to verification page
      } catch (error) {
        console.error('Registration Failed:', error.response?.data || error);
      }
    }
  };


  const loginRedirect = () => {
    navigate("/login");
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
        // background: "linear-gradient(to bottom,rgb(79, 68, 88), #ffffff)",
        background: "linear-gradient(to bottom,#4F646F,rgb(202, 213, 235))",
        // backgroundColor: "#4F646F",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 0,
        margin : 0,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: "70%", md: "50%" },
          padding: 4,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <Avatar sx={{ bgcolor: "#4F646F", width: 60, height: 60, margin: "auto" }}>
          <PersonAddAltIcon />
        </Avatar>
        <Typography variant="h5" fontWeight="bold" mt={2} mb={3}>
          Create Account
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Full Name" variant="standard" name="fullName" value={formData.fullName} onChange={handleChange} error={!!errors.fullName} helperText={errors.fullName}/>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField fullWidth label="Contact No." variant="standard" name="contact" value={formData.contact} onChange={handleChange} error={!!errors.contact} helperText={errors.contact}/>
          </Grid>
          <Grid item xs={12}>
            <TextField fullWidth label="Email" variant="standard" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email}/>
            <Typography variant="caption" color="textSecondary" display="block" mt={1}>
              Verification email will be sent.
            </Typography>
          </Grid>
          <Grid item xs={12}>
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

        <Button
          variant="contained"
          sx={{ mt: 3, width : "50%", backgroundColor: "#4F646F", padding: 1.5 }}
          onClick={handleSignUp}
        >Sign Up
        </Button>

        <Typography variant="body2" color="textSecondary" mt={2}>
          Already registered?
          <Button variant="text" onClick={loginRedirect} sx={{ ml: 1 }}>
            Login
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;