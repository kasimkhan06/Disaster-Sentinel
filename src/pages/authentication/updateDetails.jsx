import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Container,
} from "@mui/material";
import PersonIcon from "@mui/icons-material/Person";

const UpdateDetails = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    address: "",
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Fetch user details from localStorage or API and populate the form
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      setFormData({
        fullName: user.full_name || "",
        email: user.email || "",
        contact: user.contact || "",
        address: user.address || "",
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      console.log("Updated Details:", formData);
      alert("Details updated successfully!");
      // Save updated details to localStorage or send to API
      localStorage.setItem("user", JSON.stringify(formData));
    }
  };

  return (
    <Box
      sx={{
        background: "linear-gradient(to bottom, #647E8B, #D2DFF8)",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: 4,
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          backgroundColor: "#fff",
          borderRadius: "12px",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
          p: 4,
        }}
      >
        <Box textAlign="center" mb={3}>
          <Avatar
            sx={{
              bgcolor: "#4F646F",
              width: 60,
              height: 60,
              margin: "auto",
            }}
          >
            <PersonIcon fontSize="large" />
          </Avatar>
          <Typography variant="h5" fontWeight="bold" mt={2}>
            Update Details
          </Typography>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              variant="standard"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              error={!!errors.fullName}
              helperText={errors.fullName}
              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
          </Grid>
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
              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Contact"
              variant="standard"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              error={!!errors.contact}
              helperText={errors.contact}
              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Address"
              variant="standard"
              name="address"
              value={formData.address}
              onChange={handleChange}
              error={!!errors.address}
              helperText={errors.address}
              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
          </Grid>
        </Grid>

        <Box textAlign="center" mt={4}>
          <Button
            variant="contained"
            size="large"
            sx={{
              textTransform: "uppercase",
              backgroundColor: "#4F646F",
              padding: "10px 20px",
              fontSize: "14px",
            }}
            onClick={handleSubmit}
          >
            Update
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default UpdateDetails;