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
import AgencyInfo from "../../../components/agencyInfo";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    agencyName: "",
    chiefName: "",
    contact1: "",
    contact2: "",
    address: "", 
    district: "",
    state: "",
    website: "",
    email: "",
    agencyType: "",
    dateOfEstablishment: "",
    agencyLevel: "",
  });

  const [errors, setErrors] = useState({});
  const [agencyTypeValue, setAgencyTypeValue] = useState("select");
  const [agencyLevelValue, setAgencyLevelValue] = useState("select");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");  

  const handleAgencyTypeChange = (e) => {
    setAgencyTypeValue(e.target.value);
    setFormData({
      ...formData,
      agencyType: e.target.value === "Other" ? "" : e.target.value,
    });
  };

  const handleState = (e) => {
    const state = e.target.value;
    setSelectedState(e.target.value || ""); 
    setSelectedDistrict("");
    setFormData({ 
      ...formData, 
      state: e.target.value || "", 
      district: "" });
  };
  
  const handleDistrict = (e) => {
    const district = e.target.value;
    setSelectedDistrict(e.target.value || ""); 
    setFormData({ 
      ...formData, 
      district: e.target.value || "" });
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

  const validateForm = () => {
    let newErrors = {};
    if (!formData.agencyName.trim()) newErrors.agencyName = "Agency Name is required";
    if (!formData.chiefName.trim()) newErrors.chiefName = "Chief Functionary Name is required";
    if (!formData.contact1.trim()) newErrors.contact = "Contact Number is required";
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
          <AgencyInfo 
            formData={formData} 
            errors={errors} 
            agencyLevelValue={agencyLevelValue} 
            agencyTypeValue={agencyTypeValue} 
            selectedState={selectedState} 
            selectedDistrict={selectedDistrict}
            handleChange={handleChange} 
            setFormData={setFormData}
            handleAgencyLevelChange={handleAgencyLevelChange} 
            handleAgencyTypeChange={handleAgencyTypeChange} 
            setSelectedState={setSelectedState}
            setSelectedDistrict={setSelectedDistrict}
          />

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
            {/* <Button
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
            </Button> */}
          </Card>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default RegistrationForm;