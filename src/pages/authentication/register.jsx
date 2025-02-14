import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {Typography,Box,Grid,TextField,RadioGroup,FormControlLabel,Radio,Button,Avatar,} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import { AccountCircle, Phone, Email, Lock, Business } from "@mui/icons-material";

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

  const handleSignUp = () => {
    if (validateForm()) {
      navigate("/verification");
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
        background: "linear-gradient(to bottom,rgb(100, 126, 139), rgb(210, 223, 248))",
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
          width: { xs: "90%", sm: "70%", md: "30%" },
          padding: 4,
          paddingTop: 3,
          paddingBottom: 2,
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.1)",
          textAlign: "center",
        }}
      >
        <Avatar sx={{ bgcolor: "#4F646F", width: 50, height: 50, margin: "auto" }}>
          <PersonAddAltIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" mt={1} mb={1}>
          CREATE ACCOUNT
        </Typography>

        <Grid container spacing={1} alignItems={"center"} justifyContent={"center"}>
          <Grid item xs={12} sm={6}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <AccountCircle sx={{ mt:2, mr: 1, color: "gray" }} />
            <TextField  label="Full Name" variant="standard" name="fullName" value={formData.fullName} onChange={handleChange} error={!!errors.fullName} helperText={errors.fullName} size="small"
              sx = {{width: {xs:"85%", sm: "70%"}}} InputLabelProps={{ sx: { fontSize: "0.9rem" } }}/>
          </Box>
          </Grid>
          <Grid item xs={12} sm={6}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Phone sx={{ mt:2, mr: 1, color: "gray" }} />
            <TextField label="Contact No." variant="standard" name="contact" value={formData.contact} onChange={handleChange} error={!!errors.contact} helperText={errors.contact} size="small"
              sx ={{width: {xs:"85%", sm: "70%"}}} InputLabelProps={{ sx: { fontSize: "0.9rem" } }}/>
          </Box>
          </Grid>
          <Grid item xs={12}>
          <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Email sx={{ mt:2, mr: 1, color: "gray" }} />
            <TextField label="Email" variant="standard" name="email" value={formData.email} onChange={handleChange} error={!!errors.email} helperText={errors.email} size="small"
              sx = {{width: "85%"}} InputLabelProps={{ sx: { fontSize: "0.9rem" } }}/>
          </Box>
            <Typography variant="caption" color="textSecondary" display="block">
              Verification email will be sent.
            </Typography>
          </Box>
          </Grid>
          <Grid item xs={12}>
          <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          <Lock sx={{ mt:2, mr: 1, color: "gray" }} />
            <TextField label="Password" type="password" variant="standard" name="password" value={formData.password} onChange={handleChange} error={!!errors.password} helperText={errors.password} size="small"
              sx = {{width: "85%"}} InputLabelProps={{ sx: { fontSize: "0.9rem" } }}/>
          </Box>
          </Grid>
          <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
            <RadioGroup row name="role" value={formData.role} onChange={handleChange} sx={{ gap: 1 }}>
              <FormControlLabel value="user" control={<Radio sx={{ transform: "scale(0.7)" }}/>} label={<Typography sx={{ fontSize: "0.85rem" }}>User</Typography>} />
              <FormControlLabel value="agency" control={<Radio sx={{ transform: "scale(0.7)" }}/>} label={<Typography sx={{ fontSize: "0.85rem" }}>Agency</Typography>} />
            </RadioGroup>
            {errors.role && (
              <Typography color="error" variant="body2">{errors.role}</Typography>
            )}
          </Grid>

          {formData.role === "agency" && (
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
              <Business sx={{ mt:2, mr: 1, color: "gray" }} />
              <TextField label="Agency Number" variant="standard" name="agencyNumber" value={formData.agencyNumber} onChange={handleChange} error={!!errors.agencyNumber} helperText={errors.agencyNumber} size="small"
              sx = {{width: "85%"}} InputLabelProps={{ sx: { fontSize: "0.9rem" } }}/>
              </Box>
            </Grid>
          )}
        </Grid>

        <Button
          variant="contained"
          sx={{ mt: 3, width : "20%", backgroundColor: "#4F646F", padding: 1 }}
          onClick={handleSignUp}
        >Sign Up
        </Button>

        <Typography variant="body2" color="textSecondary" mt={2}>
          Already registered?
          <Button variant="text" onClick={loginRedirect} >
            Login
          </Button>
        </Typography>
      </Box>
    </Box>
  );
};

export default Register;