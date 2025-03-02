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
import MaxHeightTextarea from "../../../components/TextArea";
import AgencyInfo from "../../../components/agencyInfo";
import MapLeaflet from "../../../components/Map";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const RegistrationForm = () => {
  const [formData, setFormData] = useState({
    agencyName: "",
    contact1: "",
    contact2: "",
    address: "", 
    district: "",
    state: "",
    website: "",
    email: "",
    agencyType: "",
    dateOfEstablishment: "",
    volunteers: "",
    lat: "",
    lng: "",
  });

  const [errors, setErrors] = useState({});
  const [agencyTypeValue, setAgencyTypeValue] = useState("select");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");  
  const [markers, setMarkers] = useState([]);

  const handleAgencyTypeChange = (e) => {
    setAgencyTypeValue(e.target.value);
    setFormData({
      ...formData,
      agencyType: e.target.value === "Other" ? "" : e.target.value,
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
    if (!formData.contact1.trim()) newErrors.contact = "Contact Number is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (agencyTypeValue === "Other" && !formData.agencyType.trim())
      newErrors.agencyType = "Type Of The Agency is required";
    if (!formData.dateOfEstablishment.trim()) newErrors.dateOfEstablishment = "Date Of Establishment is required";
    if (!formData.volunteers.trim()) newErrors.volunteers = "Number of Volunteers is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    // if (!formData.district.trim()) newErrors.district = "District is required";
    // if (!formData.state.trim()) newErrors.state = "State is required";
    if (markers.length === 0) newErrors.location = "Location is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      const requestData = {
        agency_name: formData.agencyName,
        contact1: formData.contact1,
        contact2: formData.contact2,
        email: formData.email,
        agency_type: formData.agencyType,
        website: formData.website,
        date_of_establishment: formData.dateOfEstablishment,
        volunteers: formData.volunteers,
        address: formData.address,
        district: formData.district,
        state: formData.state,
        lat: markers[0]?.[0] || "",
        lng: markers[0]?.[1] || "",
      };
  
      console.log("Sending data:", requestData);
  
      try {
        const response = await axios.post(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/agency/register/",
          requestData,
          { withCredentials: true }
        );
  
        console.log("Registration Success:", response.data);
        navigate("/dashboard/agency/AgencyDashboard");
      } catch (error) {
        console.error("Registration Failed:", error.response?.data || error);
      }
    }
  };
  

  return (
    <React.Fragment>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Container sx={{ width: "55%" }}>
          <Typography variant="h4" fontWeight="bold" sx={{ textAlign: "center", mb: 3, color: "black", mt: 10 }}>
            Agency Registration Form
          </Typography>

          {/* Agency Information Section */}
          <Typography variant="h5" sx={{ textAlign: "start", mb: 1, color: "black" }}>
            1. Enter Information   
          </Typography>
          <Card
          sx={{
                  bgcolor: "rgba(255, 255, 255, 0.95)", 
                  padding: "20px",
                  borderRadius: "10px",
                  boxShadow: "0 0 10px rgba(14, 12, 12, 0.1)",
          }}
          >
            <AgencyInfo 
              formData={formData} 
              errors={errors}  
              agencyTypeValue={agencyTypeValue} 
              selectedState={selectedState} 
              selectedDistrict={selectedDistrict}
              handleChange={handleChange} 
              setFormData={setFormData}
              handleAgencyTypeChange={handleAgencyTypeChange} 
              setSelectedState={setSelectedState}
              setSelectedDistrict={setSelectedDistrict}
            />
          </Card>

          {/* Description Section */}
          <Typography variant="h5" sx={{ textAlign: "start", mb: 1, color: "black", mt: 3 }}>
          2. Enter Agency Description
          </Typography>
          <Card
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(14, 12, 12, 0.1)",
          }}
          >
            <MaxHeightTextarea/>
            <Typography 
              variant="body2" 
              gutterBottom 
              sx={{ mt: 1, color: "grey", textAlign: "justify", fontSize: "0.6rem", lineHeight: "1.5", fontStyle: "italic" }}
            >
              Please ensure that the agency description includes the following key points:<br />
              1. The heading must begin with three hashtags (<strong>###</strong>).<br />
              2. Bullet points must be enclosed within asterisks (<strong>*</strong>).<br />
              <br />
              <strong>The description should cover:</strong><br />
              1. <strong>Core Activities:</strong> Explain the NGO's primary focus areas, such as <em>education, healthcare, disaster relief, livelihood support, or environmental conservation</em>.<br />
              2. <strong>Major Initiatives & Projects:</strong> Mention any <em>flagship programs, partnerships, or government collaborations</em> that have significantly impacted society.<br />
              3. <strong>Disaster & Humanitarian Response:</strong> Highlight their <em>role during natural disasters, pandemics, or crises</em>, specifying the type of aid provided (<em>food, shelter, medical assistance, financial support, etc.</em>).<br />
              4. <strong>Community Impact:</strong> Discuss how the NGO has <em>positively influenced individuals, families, or larger communities</em>, citing any measurable improvements in quality of life.
            </Typography>
          </Card>

          {/* Location Section */}
          <Typography variant="h5" sx={{ textAlign: "start", mb: 1, color: "black", mt: 3 }}>
          3. Enter Agency Location
          </Typography>
          <Card
          sx={{
            bgcolor: "rgba(255, 255, 255, 0.95)",
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(14, 12, 12, 0.1)",
          }}
          >
            <MapLeaflet 
              markers = {markers} 
              setMarkers={setMarkers}
            />
          </Card>

          {/* Submit Button */}
          <Typography variant="h5" sx={{ textAlign: "start", mb: 1, color: "black", mt: 3 }}>
          4. Submit the Form
          </Typography>
            <Button
            variant="contained"
            size="large"
            sx={{ mt: 3, mb: 3, backgroundColor: "#4F646F", padding: 1, "&:hover": { backgroundColor: "#6B7A85" }}}
            onClick={handleSubmit}
          >
            Submit
          </Button>
        </Container>
      </Box>
    </React.Fragment>
  );
};

export default RegistrationForm;