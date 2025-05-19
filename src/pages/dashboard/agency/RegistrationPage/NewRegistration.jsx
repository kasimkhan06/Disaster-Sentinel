//React
import React, { useState, useEffect } from "react";

// MUI Components
import {
  Typography,
  Container,
  CssBaseline,
  Box,
  Button,
  Card,
  Stepper,
  Step,
  StepLabel,
  Grid,
  TextareaAutosize as Textarea,
} from "@mui/material";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import { useMediaQuery } from "@mui/material";

// Custom Components
import AgencyInfo from "../../../../components/AgencyInfo";
import MapLeaflet from "../../../../components/Map";
import ImageUpload from "../../../../components/ImageUpload";

// React Router
import { useNavigate } from "react-router-dom";

// Axios for API calls
import axios from "axios";

// Styles & Assets
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const steps = ["Agency Information", "Description", "Image Upload", "Map Location"];

const SuccessMessage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/agency-dashboard");
    }, 5000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: { xs: "70%", md: "50%" },  
        width: { xs: "90%", sm: "70%", md: "50%", lg: "40%" },
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(255, 255, 255, 0.95)",
        borderRadius: "10px",
        boxShadow: "0 0 10px rgba(0, 0, 0, 0.1)",
        margin: { xs: "100px auto", md: "300px auto" },  
        padding: { xs: "15px", md: "20px", lg: "25px" },
      }}
    >
      <Container sx={{ textAlign: "center" }}>
        <Typography
          variant="h4"
          fontWeight="bold"
          sx={{ mb: 2, color: "black", fontSize: { xs: "1.5rem", md: "2rem" } }}  
        >
          Registration Successful
        </Typography>
        <Typography
          variant="h6"
          sx={{ mb: 2, color: "black", fontSize: { xs: "1rem", md: "1.25rem" } }}  
        >
          Your agency has been successfully registered. You will be redirected to the dashboard shortly.
        </Typography>
      </Container>
    </Box>
  );
};

const RegistrationForm = ({ setSuccess }) => {
  const [formData, setFormData] = useState({
    agency_name: "",
    contact1: "",
    contact2: "",
    address: "",
    district: "",
    state: "",
    website: "",
    date_of_establishment: "",
    volunteers: "",
    lat: "",
    lng: "",
    images: [],
    description: "",
    agency_type: "",
  });

  const [errors, setErrors] = useState({});
  const [agencyTypeValue, setAgencyTypeValue] = useState("select");
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [markers, setMarkers] = useState([]);
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(min-width:600px) and (max-width:900px)");
  const isDesktop = useMediaQuery("(min-width:900px)");
  const isLargeDesktop = useMediaQuery("(min-width:1200px)");

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLogin(true);
    }
  }, []);

  const handleAgencyTypeChange = (e) => {
    setAgencyTypeValue(e.target.value);
    setFormData((prev) => ({
      ...prev,
      agency_type: e.target.value === "Other" ? "" : e.target.value,
    }));
  };

  const updateFormState = (newState) => {
    setFormData((prev) => ({ ...prev, ...newState }));
  };

  const validateForm = () => {
    let newErrors = {};
    const websiteRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
    const phoneRegex = /^\d{10}$/;

    if (activeStep === 0) {
      if (!formData.agency_name.trim()) newErrors.agency_name = "Agency Name is required";
      if (!formData.date_of_establishment.trim()) newErrors.date_of_establishment = "Date of Establishment is required";
      if (agencyTypeValue === "Other" && !formData.agency_type.trim())
        newErrors.agency_type = "Type of the Agency is required";
      if (!formData.contact1.trim()) newErrors.contact1 = "Contact Number is required";
      else if (!phoneRegex.test(formData.contact1.trim())) newErrors.contact1 = "Must be 10 digits";
      if (formData.contact2 && !phoneRegex.test(formData.contact2.trim()))
        newErrors.contact2 = "Contact Number 2 must be 10 digits";
      if (!formData.website.trim()) newErrors.website = "Website is required";
      else if (!websiteRegex.test(formData.website.trim())) newErrors.website = "Invalid URL format";
      if (!formData.address.trim()) newErrors.address = "Address is required";
    }
    else if (activeStep === 1) {
      if (!formData.description.trim()) newErrors.description = "Description is required";
    }
    else if (activeStep === 2) {
      if (!Array.isArray(images) || images.length < 2) {
        newErrors.images = "At least 2 images are required";
      }
    }
    else if (activeStep === 3) {
      if (markers.length === 0) newErrors.location = "Location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateForm()) {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    if (validateForm()) {
      try {
        const Data = new FormData();
        Data.append("user_id", user?.user_id ? parseInt(user.user_id, 10) : null);
        Data.append("agency_name", formData.agency_name);
        Data.append("contact1", formData.contact1);
        Data.append("contact2", formData.contact2);
        Data.append("agency_type", formData.agency_type);
        Data.append("website", formData.website);
        Data.append("date_of_establishment", formData.date_of_establishment);
        Data.append("volunteers", formData.volunteers);
        Data.append("address", formData.address);
        Data.append("district", formData.district);
        Data.append("state", formData.state);
        Data.append("lat", markers[0]?.[0] || "");
        Data.append("lng", markers[0]?.[1] || "");
        Data.append("description", formData.description);

        images.forEach((img) => Data.append("images", img));

        await axios.post(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/",
          Data,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );

        setSuccess(true);
      } catch (error) {
        console.error("Registration Failed:", error.response?.data || error.message);
        setErrors({ form: "Registration failed. Please try again." });
      }
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        width: "100vw",
        minHeight: "100vh",
        top: 0,
        left: 0,
        right: 0,
        background: `
      linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
      url(${worldMapBackground})
    `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        margin: 0,
        padding: 0,
        overflow: "auto",
      }}
    >
      <Box sx={{
        mt: { xs: 15, md: 15 },
        mb: { xs: 2, md: 4 },
        mx: "auto",
        width: { xs: "85%", md: "70%" },
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
      }}>
        <Stepper activeStep={activeStep} sx={{ mb: { xs: 2, md: 4 } }}>
          {isMobile ? (
            <Step
              key={steps[activeStep]}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                width: "100%"
              }}
            >
              <StepLabel>
                {steps[activeStep]}
              </StepLabel>
            </Step>
          ) : (
            steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))
          )}
        </Stepper>

        <Grid container spacing={3} sx={{ mb: { xs: 2, md: 3 } }}>
          {activeStep === 0 && (
            <Grid item xs={12} sx={{ marginTop: "10px" }}>
              <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                <AgencyInfo
                  formData={formData}
                  errors={errors}
                  agencyTypeValue={agencyTypeValue}
                  selectedState={selectedState}
                  selectedDistrict={selectedDistrict}
                  updateFormState={updateFormState}
                  setFormData={setFormData}
                  handleAgencyTypeChange={handleAgencyTypeChange}
                  setSelectedState={setSelectedState}
                  setSelectedDistrict={setSelectedDistrict}
                />
              </Card>
            </Grid>
          )}

          {activeStep === 1 && (
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                <TextareaAutosize
                  minRows={4}
                  placeholder="Give a detailed description about the agency"
                  value={formData.description}
                  onChange={(e) => updateFormState({ description: e.target.value })}
                  style={{
                    width: '100%',
                    resize: 'none',
                    padding: '8px 12px',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    color: '#1C2025',
                    backgroundColor: '#fff',
                    outline: 'none',
                  }}
                />
                {errors.description && <Typography color="error">{errors.description}</Typography>}
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
                  1. <strong>Core Activities:</strong> Explain the Agency's primary focus areas, such as <em>education, healthcare, disaster relief, livelihood support, or environmental conservation</em>.<br />
                  2. <strong>Major Initiatives & Projects:</strong> Mention any <em>flagship programs, partnerships, or government collaborations</em> that have significantly impacted society.<br />
                  3. <strong>Disaster & Humanitarian Response:</strong> Highlight their <em>role during natural disasters, pandemics, or crises</em>, specifying the type of aid provided (<em>food, shelter, medical assistance, financial support, etc.</em>).<br />
                  4. <strong>Community Impact:</strong> Discuss how the Agency has <em>positively influenced individuals, families, or larger communities</em>, citing any measurable improvements in quality of life.
                </Typography>
              </Card>
            </Grid>
          )}

          {activeStep === 2 && (
            <Grid item xs={12}>
              <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                <Typography variant="h6" sx={{ textAlign: "start", mb: 1, color: "black" }}>
                  Upload Images
                </Typography>
                <Typography
                  variant="body2"
                  gutterBottom
                  sx={{ color: "grey", textAlign: "justify", fontSize: "0.6rem", lineHeight: "1.5", fontStyle: "italic" }}
                >
                  Please upload images that showcase the agency's activities, volunteers, and any other relevant aspects.
                  <br />
                  <strong>Note:</strong><br />
                  1. First image will be used as the <strong>BANNER</strong> for the agency.<br />
                  2. Second image will be used as the <strong>PROFILE PICTURE</strong> for the agency.<br />
                  3. The images should be clear and of high quality to ensure they are suitable for display on the website.<br />
                </Typography>
                <ImageUpload images={images} setImages={setImages} />
                {errors.images && <Typography color="error">{errors.images}</Typography>}
              </Card>
            </Grid>
          )}

          {activeStep === 3 && (
            <Grid item xs={12} sm={12} md={8} lg={8} sx={{ marginX: "auto" }}>
              <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                <MapLeaflet markers={markers} setMarkers={setMarkers} />
                {errors.location && (
                  <Typography color="error" textAlign="center" mt={2}>
                    {errors.location}
                  </Typography>
                )}
              </Card>
            </Grid>
          )}
        </Grid>

        {/* Navigation Buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: { xs: 2, md: 3 } }}>
          <Button
            disabled={activeStep === 0}
            onClick={handleBack}
            sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleSubmit}
              sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
            >
              Submit
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleNext}
              sx={{ fontSize: { xs: "0.8rem", md: "1rem" } }}
            >
              Next
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
};

const NewRegistration = () => {
  const [success, setSuccess] = useState(false);

  return (
    <Container component="main" maxWidth="lg">
      <CssBaseline />
      {success ? <SuccessMessage /> : <RegistrationForm setSuccess={setSuccess} />}
    </Container>
  );
};

export default NewRegistration;