import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  Grid,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Avatar,
  Alert,
  Autocomplete, // Import Autocomplete
} from "@mui/material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import {
  AccountCircle,
  Phone,
  Email,
  Lock,
  Business,
  LocationOn,
  LocationCity,
} from "@mui/icons-material";
import axios from "axios";
import * as XLSX from "xlsx"; // Import xlsx
import worldMapBackground from "/assets/background_image/world-map-background.jpg"; 
import Footer from "../../components/Footer"; 

const Register = () => {
  const navigate = useNavigate();

  // --- Component State ---
  const [formData, setFormData] = useState({
    fullName: "",
    contact: "",
    state: "",
    district: "",
    email: "",
    password: "",
    role: "",
    agencyNumber: "",
  });

  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  // State for dropdowns
  const [stateDistricts, setStateDistricts] = useState({});
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");

  // --- Data Loading Effect ---
  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        // Assuming the file is in the public folder
        const response = await fetch("/assets/District_Masters.xlsx");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(sheet);

            const tempStateDistricts = {};
            jsonData.forEach((row) => {
              const state = row["State Name"]?.trim();
              const district = row["District Name"]?.trim();
              if (state && district) {
                if (!tempStateDistricts[state]) {
                  tempStateDistricts[state] = [];
                }
                if (!tempStateDistricts[state].includes(district)) {
                  tempStateDistricts[state].push(district);
                }
              }
            });
            // Sort states alphabetically
            const sortedStates = Object.keys(tempStateDistricts).sort();
            const sortedStateDistricts = {};
            sortedStates.forEach(state => {
              // Sort districts within each state alphabetically (This ensures districts are sorted)
              sortedStateDistricts[state] = tempStateDistricts[state].sort();
            });

            setStateDistricts(sortedStateDistricts);
          } catch (parseError) {
            console.error("Error parsing Excel data:", parseError);
            setStatusMessage({ type: 'error', text: 'Error processing state/district data.' });
          }
        };
        reader.onerror = (error) => {
          console.error("FileReader error:", error);
          setStatusMessage({ type: 'error', text: 'Error reading state/district file.' });
        }

        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("Error fetching the Excel file:", error);
        setStatusMessage({ type: 'error', text: 'Could not load state/district data.' });
      }
    };

    fetchExcelFile();
  }, []);


  // --- Handlers ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
    if (name !== 'state' && name !== 'district') {
      setStatusMessage({ type: "", text: "" });
    }
  };

  const handleStateChange = (event, newValue) => {
    const newState = newValue || "";
    setSelectedState(newState);
    // Pulls the already sorted list of districts from stateDistricts
    const newDistricts = newState ? (stateDistricts[newState] || []) : [];
    setDistricts(newDistricts);
    setSelectedDistrict(""); // Reset district when state changes
    setFormData({ ...formData, state: newState, district: "" });
    setErrors((prevErrors) => ({ ...prevErrors, state: "", district: "" }));
    setStatusMessage({ type: "", text: "" });
  };

  const handleDistrictChange = (event, newValue) => {
    const newDistrict = newValue || "";
    setSelectedDistrict(newDistrict);
    setFormData({ ...formData, district: newDistrict });
    setErrors((prevErrors) => ({ ...prevErrors, district: "" }));
    setStatusMessage({ type: "", text: "" });
  };

  const validateForm = () => {
    let newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact No. is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
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
    setStatusMessage({ type: "", text: "" });
    if (validateForm()) {
      try {
        const response = await axios.post(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/auth/signup/",
          { /* Payload includes state and district */
            full_name: formData.fullName,
            contact: formData.contact,
            state: formData.state,
            district: formData.district,
            email: formData.email,
            password: formData.password,
            role: formData.role,
            agency_pan: formData.role === "agency" ? formData.agencyNumber : null,
          },
          { withCredentials: true, headers: { "Content-Type": "application/json" } }
        );

        console.log("Registration Success:", response.data);
        setStatusMessage({ type: "success", text: "Registration successful! Redirecting..." });
        setTimeout(() => {
          navigate("/verification", { state: { email: formData.email } });
        }, 2000);

      } catch (error) {
        // --- Error handling logic (same as before) ---
        console.error("Registration Failed Full Error:", error);
        console.log("Error Response Object:", error.response);
        console.log("Error Response Data:", error.response?.data);
        const errorData = error.response?.data;
        let errorMessage = "Registration failed. Please check your input or try again later.";
        if (errorData) {
          if (errorData.email && Array.isArray(errorData.email) && errorData.email.length > 0) {
            errorMessage = errorData.email[0].toLowerCase().includes("already exists") ? "This Email ID already exists. Please use a different email or login." : `Email: ${errorData.email[0]}`;
          } else if (errorData.detail) {
            errorMessage = errorData.detail.toLowerCase().includes("email already exists") ? "This Email ID already exists. Please use a different email or login." : errorData.detail;
          } else if (errorData.message) {
            errorMessage = errorData.message.toLowerCase().includes("email already exists") ? "This Email ID already exists. Please use a different email or login." : errorData.message;
          } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
            if (errorData.state && Array.isArray(errorData.state) && errorData.state.length > 0) {
              errorMessage = `State: ${errorData.state[0]}`;
            } else if (errorData.district && Array.isArray(errorData.district) && errorData.district.length > 0) {
              errorMessage = `District: ${errorData.district[0]}`;
            } else {
              const firstKey = Object.keys(errorData)[0];
              if (Array.isArray(errorData[firstKey]) && errorData[firstKey].length > 0) {
                errorMessage = `${firstKey.charAt(0).toUpperCase() + firstKey.slice(1)}: ${errorData[firstKey][0]}`;
              } else if (typeof errorData[firstKey] === 'string') {
                errorMessage = `${firstKey.charAt(0).toUpperCase() + firstKey.slice(1)}: ${errorData[firstKey]}`;
              }
            }
          }
        } else if (error.request) {
          errorMessage = "No response from server. Please check your network connection.";
        } else {
          errorMessage = "An unexpected error occurred. Please try again.";
        }
        setStatusMessage({ type: "error", text: errorMessage });
        // --- End Error Handling ---
      }
    } else {
      setStatusMessage({ type: "error", text: "Please correct the errors highlighted below." });
    }
  };

  const loginRedirect = () => {
    navigate("/login");
  };

  useEffect(() => { // Body margin effect
    const originalMargin = document.body.style.margin;
    document.body.style.margin = "0";
    return () => { document.body.style.margin = originalMargin; };
  }, []);

  // --- Component Render ---
  return (
    <Box // Outer container
      sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              minHeight: "100vh",
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
              zIndex: 0,
            }}
    >
      <Box // Centering container
        sx={{
          minHeight: "100vh", display: "flex", justifyContent: "center",
          alignItems: "center", padding: 0, margin: 0, overflow: "hidden", marginTop: "80px"
        }}
      >
        <Box // Form container
          sx={{
            width: { xs: "90%", sm: "70%", md: "40%", lg: "35%" },
            maxWidth: "600px", padding: { xs: 2, sm: 3, md: 4 }, paddingTop: "25px", paddingBottom: "25px",
            backgroundColor: "#ffffff", borderRadius: 2, boxShadow: 3,
            textAlign: "center", my: 4
          }}
        >
          <Avatar sx={{ bgcolor: "#4F646F", width: 50, height: 50, margin: "auto" }}>
            <PersonAddAltIcon />
          </Avatar>
          <Typography variant="h6" fontWeight="bold" mt={1}>
            CREATE ACCOUNT
          </Typography>

          {/* Status Message */}
          {statusMessage.text && (
            <Alert severity={statusMessage.type} sx={{ mt: 2, mb: 1, textAlign: 'left' }}>
              {statusMessage.text}
            </Alert>
          )}

          {/* Main Form Grid */}
          <Grid container spacing={1} alignItems="center" justifyContent="center">

            {/* Name */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <AccountCircle sx={{ mt: 2, mr: 1, color: "gray" }} />
                <TextField label="Full Name" variant="standard" name="fullName" value={formData.fullName} onChange={handleChange}
                  error={!!errors.fullName} helperText={errors.fullName} size="small"
                  sx={{ width: "85%" }} InputLabelProps={{ sx: { fontSize: "0.9rem" } }} />
              </Box>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                <Phone sx={{ mt: 2, mr: 1, color: "gray" }} />
                <TextField label="Contact No." variant="standard" name="contact" value={formData.contact} onChange={handleChange}
                  error={!!errors.contact} helperText={errors.contact} size="small"
                  sx={{ width: "85%" }} InputLabelProps={{ sx: { fontSize: "0.9rem" } }} />
              </Box>
            </Grid>

            {/* State */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
                <LocationOn sx={{ mt: 2, mr: 1, color: "gray" }} />
                <Autocomplete
                  options={Object.keys(stateDistricts)}
                  value={selectedState}
                  onChange={handleStateChange}
                  isOptionEqualToValue={(option, value) => option === value || value === ""}
                  renderInput={(params) => (
                    <TextField {...params} label="State" variant="standard" error={!!errors.state} />
                  )}
                  size="small" sx={{ width: "85%" }} />
                {errors.state && <Typography color="error" variant="caption" display="block" textAlign="left">{errors.state}</Typography>}
              </Box>
            </Grid>

            {/* District - NOW ALWAYS VISIBLE but disabled initially */}
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
                <LocationOn sx={{ mt: 2, mr: 1, color: "gray" }} />
                <Autocomplete
                  options={districts} // Options are dynamically set based on selected state
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  isOptionEqualToValue={(option, value) => option === value || value === ""}
                  // Disable if no state is selected OR if the districts array is empty (e.g., data loading)
                  disabled={!selectedState || districts.length === 0}
                  renderInput={(params) => (
                    <TextField {...params} label="District" variant="standard" error={!!errors.district} />
                  )}
                  size="small" sx={{ width: "85%" }} />
                {errors.district && <Typography color="error" variant="caption" display="block" textAlign="left">{errors.district}</Typography>}
              </Box>
            </Grid>

            {/* Email */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", flexDirection: "column", width: "100%", mt: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Email sx={{ mt: 2, mr: 1, color: "gray" }} />
                  <TextField label="Email" variant="standard" name="email" value={formData.email} onChange={handleChange}
                    error={!!errors.email} helperText={errors.email} size="small"
                    sx={{ width: "92%" }} InputLabelProps={{ sx: { fontSize: "0.9rem" } }} />
                </Box>
                <Typography variant="caption" color="textSecondary" display="block" sx={{ textAlign: 'left', ml: 4.5 }}>
                  Verification email will be sent.
                </Typography>
              </Box>
            </Grid>

            {/* Password */}
            <Grid item xs={12}>
              <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
                <Lock sx={{ mt: 2, mr: 1, color: "gray" }} />
                <TextField label="Password" type="password" variant="standard" name="password" value={formData.password} onChange={handleChange}
                  error={!!errors.password} helperText={errors.password} size="small"
                  sx={{ width: "92%" }} InputLabelProps={{ sx: { fontSize: "0.9rem" } }} />
              </Box>
            </Grid>

            {/* Role Selection */}
            <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 1 }}>
              <RadioGroup row name="role" value={formData.role} onChange={handleChange} sx={{ gap: 1 }}>
                <FormControlLabel value="user" control={<Radio sx={{ transform: "scale(0.7)" }} />} label={<Typography sx={{ fontSize: "0.85rem" }}>User</Typography>} />
                <FormControlLabel value="agency" control={<Radio sx={{ transform: "scale(0.7)" }} />} label={<Typography sx={{ fontSize: "0.85rem" }}>Agency</Typography>} />
              </RadioGroup>
              {errors.role && <Typography color="error" variant="body2">{errors.role}</Typography>}
            </Grid>

            {/* Agency Number (Conditional) */}
            {formData.role === "agency" && (
              <Grid item xs={12}>
                <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
                  <Business sx={{ mt: 2, mr: 1, color: "gray" }} />
                  <TextField label="Agency Number" variant="standard" name="agencyNumber" value={formData.agencyNumber} onChange={handleChange}
                    error={!!errors.agencyNumber} helperText={errors.agencyNumber} size="small"
                    sx={{ width: "92%" }} InputLabelProps={{ sx: { fontSize: "0.9rem" } }} />
                </Box>
              </Grid>
            )}
          </Grid> {/* End Main Form Grid */}

          {/* Sign Up Button */}
          <Button variant="contained"
            sx={{ mt: 2, width: "20%", backgroundColor: "#4F646F", padding: 1, minWidth: '100px' }}
            onClick={handleSignUp}
          >
            Sign Up
          </Button>

          {/* Login Redirect */}
          <Typography variant="body2" color="textSecondary" mt={2}>
            Already registered?
            <Button variant="text" onClick={loginRedirect}>Login</Button>
          </Typography>

        </Box> {/* End Form container */}
      </Box> {/* End Centering container */}
      <Footer/>
    </Box> // End Outer container
  );
};

export default Register;