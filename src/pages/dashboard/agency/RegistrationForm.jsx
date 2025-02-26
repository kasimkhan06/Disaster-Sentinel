import React, { useState } from "react";
import {
  Card,
  Typography,
  Container,
  CssBaseline,
  Box,
  Button,
  IconButton,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import Address from "../../../components/Address";
import AgencyInfo from "../../../components/agencyInfo";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    agencyName: "",
    chiefName: "",
    contact1: "",
    contact2: "",
    addresses: [""], 
    cities: [""],
    states: [""],
    website: "",
    email: "",
    agencyType: "",
    dateOfEstablishment: "",
    agencyLevel: "",
  });

  const [errors, setErrors] = useState({});
  const [agencyTypeValue, setAgencyTypeValue] = useState("select");
  const [agencyLevelValue, setAgencyLevelValue] = useState("select");
    
  const handleAgencyTypeChange = (e) => {
    setAgencyTypeValue(e.target.value);
    setFormData({
      ...formData,
      agencyType: e.target.value === "Other" ? "" : e.target.value,
    });
  };

  const handleAgencyLevelChange = (e) => {
    setAgencyLevelValue(e.target.value);
    setFormData({
      ...formData,
      agencyLevel: e.target.value === "select" ? "" : e.target.value,
    });
  };

  const handleChange = (e, index = null) => {
    const { name, value } = e.target;

    if (index !== null) {
      setFormData((prev) => {
        const updatedArray = [...prev[name + "es"]];
        updatedArray[index] = value;
        return { ...prev, [name + "es"]: updatedArray };
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }

    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const addAddress = () => {
    setFormData((prev) => ({
      ...prev,
      addresses: [...prev.addresses, ""],
      cities: [...prev.cities, ""],
      states: [...prev.states, ""],
    }));
  };

  const handleRemoveAddress = (index) => {
    setFormData((prev) => ({
      ...prev,
      addresses: prev.addresses.filter((_, i) => i !== index),
      cities: prev.cities.filter((_, i) => i !== index),
      states: prev.states.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.agencyName.trim()) newErrors.agencyName = "Agency Name is required";
    if (!formData.chiefName.trim()) newErrors.chiefName = "Chief Functionary Name is required";
    if (!formData.contact1.trim()) newErrors.contact = "Contact Number is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (agencyLevelValue === "select") newErrors.agencyLevel = "Level Of The Agency is required";
    if (agencyValue === "Other" && !formData.agencyType.trim())
      newErrors.agencyType = "Type Of The Agency is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  return (
    <React.Fragment>
      <CssBaseline />
      <Box
        sx={{
          backgroundColor: "#f5f5f5",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" fontWeight="bold" sx={{ textAlign: "center", mb: 3, color: "black", mt: 10 }}>
            Agency Registration Form
          </Typography>

          {/* Agency Information Section */}
          <Typography variant="h4" sx={{ textAlign: "start", mb: 1, color: "black" }}>
            1. Enter Information   
          </Typography>
          <AgencyInfo formData={formData} errors={errors} handleChange={handleChange} agencyLevelValue={agencyLevelValue} handleAgencyLevelChange={handleAgencyLevelChange} agencyTypeValue={agencyTypeValue} handleAgencyTypeChange={handleAgencyTypeChange} />

          {/* Address Section */}
          <Typography variant="h4" sx={{ textAlign: "start", mb: 1, color: "black", mt: 3 }}>
            2. Enter Address Details  
          </Typography>
          <Card
            sx={{
              bgcolor: "rgba(255, 255, 255, 0.95)",
              padding: "20px",
              borderRadius: "10px",
              boxShadow: "0 0 10px rgba(14, 12, 12, 0.1)",
            }}
          >
            <Typography variant="h5" sx={{ textAlign: "start", mb: 3, color: "black" }}>
              Headquarters Details
            </Typography>

            {formData.addresses.map((_, index) => (
              <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Address
                  index={index}
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                />
                {/* Delete Button */}
                {formData.addresses.length > 1 && (
                  <IconButton
                    onClick={() => handleRemoveAddress(index)}
                    sx={{ ml: 2, color: "red" }}
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
            ))}

            <Button
              variant="contained"
              onClick={addAddress}
              sx={{
                mt: 2,
                backgroundColor: "#1976d2",
                color: "#fff",
                "&:hover": { backgroundColor: "#1565c0" },
              }}
            >
              Add Location
            </Button>
          </Card>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default RegistrationForm;