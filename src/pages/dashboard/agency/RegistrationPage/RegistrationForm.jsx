import React, { useState, useEffect } from "react";
import {
  Typography,
  Container,
  CssBaseline,
  Box,
  Button,
  Card,
  TextareaAutosize as Textarea,
} from "@mui/material";
import AgencyInfo from "../../../../components/AgencyInfo";
import MapLeaflet from "../../../../components/Map";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../../../../components/ImageUpload";
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
  const [success, setSuccess] = useState(false);
  const [images, setImages] = useState([]);
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

   useEffect(() => {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLogin(true);
        console.log("User data:", storedUser);
      }
    }, []);

  const handleAgencyTypeChange = (e) => {
    setAgencyTypeValue(e.target.value);
    setFormData({
      ...formData,
      agency_type: e.target.value === "Other" ? "" : e.target.value,
    });
  };

  const updateFormState = (newState) => {
    setFormData((prevState) => ({ ...prevState, ...newState }));
  };
  
  const validateForm = () => {
    let newErrors = {};
    const websiteRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/;
    if (!formData.agency_name.trim()) newErrors.agency_name = "Agency Name is required";
    if (!formData.contact1.trim()) newErrors.contact = "Contact Number is required";
    else if (!/^\d{10}$/.test(formData.contact1.trim())) newErrors.contact = "Contact Number must be 10 digits";
    if (formData.contact2 && !/^\d{10}$/.test(formData.contact2.trim())) newErrors.contact2 = "Contact Number #2 must be 10 digits";
    if (agencyTypeValue === "Other" && !formData.agency_type.trim())
      newErrors.agency_type = "Type Of The Agency is required";
    if (!formData.date_of_establishment.trim()) newErrors.date_of_establishment = "Date Of Establishment is required";
    if (!formData.volunteers.trim()) newErrors.volunteers = "Number of Volunteers is required";
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (markers.length === 0) newErrors.location = "Location is required";
    if (images.length === 0) newErrors.images = "At least one image is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.website.trim()) {
      newErrors.website = "Website is required";
    } else if (!websiteRegex.test(formData.website.trim())) {
      newErrors.website = "Please enter a valid website URL (e.g:- http://example.com)";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    try{
      if (validateForm()) {
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

        images.forEach((image) => {
          Data.append("images", image);
        });

        for (let pair of Data.entries()) {
          console.log(pair[0] + ": " + pair[1]);
        }

        const response = await axios.post(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/",
          Data,
          { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
        );
        console.log("Registration Success:", response.data);
        setSuccess(true);
      }
    }catch (error) {
      console.error("Registration Failed:", error.response?.data || error);
      setErrors({ form: "Registration failed. Please try again." });
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
              updateFormState={updateFormState} 
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
            <Textarea
              name="description"
              maxRows={50}
              aria-label="maximum height"
              placeholder="Give a detailed description about the agency"
              value={formData.description}
              onChange={(e) => updateFormState({ description: e.target.value })}
              style={{
                width: '100%',
                minHeight: '100px',
                resize: 'none',
                padding: '8px 12px',
                fontSize: '0.9rem',
                lineHeight: 1.5,
                borderRadius: '8px',
                border: '1px solid #ccc',
                fontFamily: 'inherit',
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