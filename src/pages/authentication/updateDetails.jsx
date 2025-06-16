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
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import LocationOn from "@mui/icons-material/LocationOn";
import Autocomplete from "@mui/material/Autocomplete";
import * as XLSX from "xlsx";

const UpdateDetails = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    contact: "",
    state: "",
    district: "",
  });

  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [selectedState, setSelectedState] = useState("");
  const [districts, setDistricts] = useState([]);
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [stateDistricts, setStateDistricts] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      console.log("Stored User:", user);
      setFormData({
        fullName: parsedUser.full_name || parsedUser.fullName,
        email: parsedUser.email || "",
        contact: parsedUser.contact || "",
        state: parsedUser.state || "",
        district: parsedUser.district || "",
      });

      // Ensure selectedState and selectedDistrict are set after stateDistricts is loaded
      if (parsedUser.state && parsedUser.district) {
        setSelectedState(parsedUser.state);
        setSelectedDistrict(parsedUser.district);
      }
    }
  }, [stateDistricts]); // Add stateDistricts as a dependency

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const handleStateChange = (event, newValue) => {
    const newState = newValue || formData.state;
    setSelectedState(newState);
    setDistricts(newState ? stateDistricts[newState] || [] : []);
    setSelectedDistrict("");
    setFormData({ ...formData, state: newState, district: "" });
    console.log("Selected State:", newState);
  };

  const handleDistrictChange = (event, newValue) => {
    const newDistrict = newValue || formData.district;
    setSelectedDistrict(newDistrict);
    setFormData({ ...formData, district: newDistrict });
    console.log("Selected District:", newDistrict);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    if (!formData.contact.trim()) newErrors.contact = "Contact is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.district.trim()) newErrors.district = "District is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    if (!user || !user.user_id) {
      console.error("User ID is missing. Cannot submit form.");
      return;
    }

    if (validateForm()) {
      e.preventDefault();
      console.log("Submitting:", formData);

      const originalState = user.state;
      const originalDistrict = user.district;
      console.log("Original State:", originalState);
      console.log("Original District:", originalDistrict);
      const stateChanged = formData.state !== originalState;
      const districtChanged = formData.district !== originalDistrict;

      const isLocationUpdate = stateChanged || districtChanged;
      const updateURL = isLocationUpdate
        ? `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/users/${user?.user_id}/location/`
        : `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/users/${user?.user_id}/profile/`;

      const dataToSend = isLocationUpdate
        ? { state: formData.state, district: formData.district }
        : {
          fullName: formData.fullName,
          email: formData.email,
          contact: formData.contact,
        };
      try {
        setIsUpdating(true);
        const Data = new FormData();
        Data.append("fullName", formData.fullName);
        Data.append("email", formData.email);
        Data.append("contact", formData.contact);
        Data.append("state", formData.state);
        Data.append("district", formData.district);

        const res = await axios.patch(updateURL, dataToSend);

        console.log("Updation Success:", res.data);
        alert("Details updated successfully!");
        localStorage.setItem("user", JSON.stringify(formData));
        // navigate("/home");

      } catch (error) {
        console.error("Updation Failed:", error.response?.data || error);
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <Box
      sx={{
        position: "fixed",
        top: 40,
        left: 0,
        right: 0,
        minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        paddingTop: "60px",
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
              value={formData.fullName || ""}
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
              value={formData.email || ""}
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
              value={formData.contact || ""}
              onChange={handleChange}
              error={!!errors.contact}
              helperText={errors.contact}
              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
              <Autocomplete
                options={Object.keys(stateDistricts)}
                value={selectedState || ""}
                onChange={handleStateChange}
                isOptionEqualToValue={(option, value) => option === value || value === ""}
                renderInput={(params) => (
                  <TextField {...params} label="State" variant="standard" error={!!errors.state} />
                )}
                size="small" sx={{ width: "100%" }} />
              {errors.state && <Typography color="error" variant="caption" display="block" textAlign="left">{errors.state}</Typography>}
            </Box>
          </Grid>

          {/* District */}
          <Grid item xs={12}>
            <Box sx={{ display: "flex", alignItems: "center", width: "100%", mt: 1 }}>
              <Autocomplete
                options={districts} // Options are dynamically set based on selected state
                value={selectedDistrict || ""}
                onChange={handleDistrictChange}
                isOptionEqualToValue={(option, value) => option === value || value === ""}
                disabled={!selectedState || districts.length === 0}
                renderInput={(params) => (
                  <TextField {...params} label="District" variant="standard" error={!!errors.district} />
                )}
                size="small" sx={{ width: "100%" }} />
              {errors.district && <Typography color="error" variant="caption" display="block" textAlign="left">{errors.district}</Typography>}
            </Box>
          </Grid>
        </Grid>

        <form onSubmit={(e) => handleSubmit(e)}>
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            {isUpdating ? (
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <CircularProgress size={24} sx={{ color: "#4caf50" }} />
                <Typography variant="body2" sx={{ ml: 1 }}>
                  Updating...
                </Typography>
              </Box>
            ) : (
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  backgroundColor: "#4F646F",
                  color: "#fff",
                  "&:hover": {
                    backgroundColor: "#3e545b",
                  },
                }}
                disabled={isUpdating}
              >
                Update
              </Button>
            )}
          </Box>
        </form>
      </Container>
    </Box>
  );
};

export default UpdateDetails;