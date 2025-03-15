import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  CssBaseline,
  Box,
  Button,
  Card,
} from "@mui/material";
import AgencyInfo from "../../../components/agencyInfo";
import MaxHeightTextarea from "../../../components/TextArea";
import MapLeaflet from "../../../components/Map";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../../components/ImageUpload";
import axios from "axios";

const SuccessMessage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate("/dashboard/agency/AgencyDashboard");
    }, 5000);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: "50%",
        width: "50%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        margin: "300px auto",
        padding: "20px",
      }}
    >
      <Container sx={{ textAlign: "center" }}>
        <Typography variant="h4" fontWeight="bold" sx={{ mb: 3, color: "black" }}>
          Registration Successful
        </Typography>
        <Typography variant="h6" sx={{ mb: 3, color: "black" }}>
          Your agency has been successfully registered. You will be redirected to the dashboard shortly.
        </Typography>
      </Container>
    </Box>
  );
};

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
    images: [],
  });

  const [errors, setErrors] = useState({});
  const [agencyTypeValue, setAgencyTypeValue] = useState("select");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");  
  const [markers, setMarkers] = useState([]);
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);

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
      const formData = new FormData();
      formData.append("agency_name", formData.agencyName);
      formData.append("contact1", formData.contact1);
      formData.append("contact2", formData.contact2);
      formData.append("email", formData.email);
      formData.append("agency_type", formData.agencyType);
      formData.append("website", formData.website);
      formData.append("date_of_establishment", formData.dateOfEstablishment);
      formData.append("volunteers", formData.volunteers);
      formData.append("address", formData.address);
      formData.append("district", formData.district);
      formData.append("state", formData.state);
      formData.append("lat", markers[0]?.[0] || "");
      formData.append("lng", markers[0]?.[1] || "");

      images.forEach((image) => {
        formData.append("images", image);
      });

      console.log("Sending form data...", formData);
      setSuccess(true);

      // try {
      //   const response = await axios.post(
      //     "https://your-api-endpoint.com/agency/register/",
      //     formData,
      //     { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
      //   );

      //   console.log("Registration Success:", response.data);
      //   setSuccess(true);
      // } catch (error) {
      //   console.error("Registration Failed:", error.response?.data || error);
      // }
    }
  };

  return success ? (
    <SuccessMessage />
  ) : (
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

          {/* Image Upload Section */}
          <Typography variant="h5" sx={{ textAlign: "start", mb: 1, color: "black", mt: 3 }}>
            3. Upload Agency Images
          </Typography>
          <Card sx={{ bgcolor: "rgba(255, 255, 255, 0.95)", padding: "20px", borderRadius: "10px" }}>
            <ImageUpload images={images} setImages={setImages} />
            {errors.images && <Typography color="error">{errors.images}</Typography>}
          </Card>

          {/* Location Section */}
          <Typography variant="h5" sx={{ textAlign: "start", mb: 1, color: "black", mt: 3 }}>
            4. Enter Agency Location
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
            5. Submit the Form
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