import React from 'react';
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Grid from "@mui/material/Grid2";
import {
    TextField,
    Button,
    Card,
    Typography,
    Input,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Box,
    FormHelperText,
    IconButton, // Import IconButton
    InputAdornment, // Import InputAdornment
    CircularProgress // Import CircularProgress
} from "@mui/material";
import { Search as SearchIcon } from '@mui/icons-material'; // Import SearchIcon
import ReCAPTCHA from "react-google-recaptcha";
import StateDistrictDropdown from '../../components/StateDistrict1.jsx'; // Adjust path if needed

// Styles
const textFieldStyles = {
    "& .MuiInputBase-root": { padding: "4px 8px" },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputLabel-root": { fontSize: "0.9rem" },
    width: "100%",
};

const boxStyles = {
    width: "80%", // Consider making this responsive
    padding: 0,
    mb: 2,
    textAlign: "left",
    boxShadow: "2px 2px 2px #E8F1F5",
    position: "relative",
};

const MissingPersonForm = ({
    formData,
    setFormData,
    handleInputChange,
    handleFileChange,
    handleSubmit,
    errors,
    handleCaptchaVerify,
    selectedState,
    setSelectedState,
    selectedDistrict,
    setSelectedDistrict,
    searchMapLocation, // Function to trigger map search from portal
    isSearchingLocation // Loading state for the search button
}) => {

    const [recentDisasters, setRecentDisasters] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [filteredDisasters, setFilteredDisasters] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentDisasters = async () => {
          try {
            // Replace with your actual API call
            const response = await fetch(
              "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/disasters/"
            );
            const data = await response.json();
            console.log("Fetched recent disasters:", data);
            setRecentDisasters(data);
            setLoading(false);
          } catch (error) {
            console.error("Error fetching recent disasters:", error);
            setLoading(false);
          }
        };
    
        fetchRecentDisasters();
      }, []);

      useEffect(() => {
        const MPState = selectedState?.state || formData?.state;
        console.log("Selected State:", MPState);
    
        if (!MPState) {
            setFilteredDisasters([]); // Clear list if no valid state
            return;
        }
    
        // Filter disasters by state and country
        const filtered = recentDisasters.filter(
            (disaster) =>
                disaster.state?.toLowerCase() === MPState.toLowerCase() &&
                disaster.country === "India"
        );
    
        // Map event types to readable disaster types
        const eventTypeMap = {
            EQ: "Earthquake",
            FL: "Flood",
            WF: "Wildfire",
            TC: "Tropical Cyclone",
            VO: "Volcano",
            DR: "Drought",
            // Extend as needed
        };
    
        // Map filtered disasters to enriched objects with proper event_type mapping
        const mappedDisasters = filtered.map((disaster) => ({
            disaster_type: eventTypeMap[disaster.eventtype] || disaster.eventtype,
        }));
    
        console.log("Mapped Disasters:", mappedDisasters);
    
        setFilteredDisasters(mappedDisasters);
    }, [selectedState, formData?.state]);    

     // Handle Enter key press in the location field to trigger search
    const handleLocationKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission on Enter
            searchMapLocation();
        }
    };

    return (
        <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, height: "100%" }}>
            <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 0 }}>
                Report Details
            </Typography>
            <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={0} direction="column" alignItems="center">
                    {/* ... other fields (Name, Description, etc.) ... */}
                     {/* Name Field */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} error={!!errors.name} helperText={errors.name || ''} />
                        </Box>
                    </Grid>
                    {/* Age Field */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField fullWidth label="Age" name="age" type="number" value={formData.age} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} error={!!errors.age} helperText={errors.age || ''}
                            />
                        </Box>
                    </Grid>
                    {/* Gender Field */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <FormControl fullWidth required error={!!errors.gender}>
                                <InputLabel sx={{ fontSize: "0.9rem" }} id="gender-label">Gender</InputLabel>
                                <Select labelId="gender-label" name="gender" value={formData.gender} onChange={handleInputChange}
                                    sx={{
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                        width: "100%",
                                        '& .MuiSelect-select': { paddingTop: '10px', paddingBottom: '10px' },
                                    }}>
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                            </FormControl>
                        </Box>
                    </Grid>
                    {/* Description Field */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} multiline rows={3} error={!!errors.description} helperText={errors.description || ''} />
                        </Box>
                    </Grid>
                    {/* Identification Marks Field */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField fullWidth label="Identification Marks" name="identificationMarks" value={formData.identificationMarks} onChange={handleInputChange} variant="outlined" sx={textFieldStyles} />
                        </Box>
                    </Grid>


                    {/* Last Seen Location Field (Editable + Search Button) */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Last Seen Location"
                                name="lastSeenPlace"
                                value={formData.lastSeenPlace}
                                onChange={handleInputChange} // Allow typing
                                onKeyPress={handleLocationKeyPress} // Trigger search on Enter
                                variant="outlined"
                                sx={textFieldStyles}
                                error={!!errors.location}
                                helperText={errors.location || ''}
                                InputProps={{ // Add the search button here
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="search location on map"
                                                onClick={searchMapLocation} // Trigger search
                                                edge="end"
                                                disabled={isSearchingLocation || !formData.lastSeenPlace?.trim()} // Disable if searching or empty
                                                size="small" // Make icon button smaller
                                                sx={{ mr: -1 }} // Adjust margin if needed
                                            >
                                                {isSearchingLocation ? <CircularProgress size={20} /> : <SearchIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                        </Box>
                    </Grid>

                    {/* State and District Dropdowns */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={{ ...boxStyles, boxShadow: 'none', mb: 0 }}>
                            <StateDistrictDropdown formData={formData} setFormData={setFormData} selectedState={selectedState} setSelectedState={setSelectedState} selectedDistrict={selectedDistrict} setSelectedDistrict={setSelectedDistrict} errors={errors} />
                             {errors.state && <FormHelperText error sx={{ ml: 1.5 }}>{errors.state}</FormHelperText>}
                             {errors.district && !errors.state && <FormHelperText error sx={{ ml: 1.5 }}>{errors.district}</FormHelperText>}
                        </Box>
                    </Grid>
                    <Grid size={12} sx={{ height: '16px' }} /> {/* Spacer */}

                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <FormControl fullWidth required error={!!errors.disasterType}>
                                <InputLabel sx={{ fontSize: "0.9rem" }} id="disaster-type-label">Disaster Type</InputLabel>
                                <Select
                                    labelId="disaster-type-label"
                                    label="Disaster Type*"
                                    name="disasterType"
                                    value={formData.disasterType}
                                    onChange={handleInputChange}
                                    sx={{
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                        width: "100%",
                                        '& .MuiSelect-select': { paddingTop: '10px', paddingBottom: '10px' },
                                    }}
                                >
                                    {filteredDisasters.length > 0 ? (
                                        filteredDisasters.map((disaster, index) => (
                                            <MenuItem key={index} value={disaster.disaster_type}>
                                                {disaster.disaster_type}
                                            </MenuItem>
                                        ))
                                    ) : (
                                        <MenuItem value="" disabled>No active disasters in selected region</MenuItem>
                                    )}
                                </Select>
                                {errors.disasterType && <FormHelperText>{errors.disasterType}</FormHelperText>}
                            </FormControl>
                        </Box>
                    </Grid>

                    {/* Contact Information Field */}
                     <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField fullWidth label="Contact Information" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} error={!!errors.contactInfo} helperText={errors.contactInfo || ''} />
                        </Box>
                    </Grid>

                    {/* Additional Information Field */}
                    <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                        <Box sx={{ ...boxStyles, mb: 0 }}>
                            <TextField fullWidth label="Additional Information" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} variant="outlined" sx={textFieldStyles} multiline rows={3} />
                        </Box>
                    </Grid>


                    {/* ... File Uploads ... */}
                     <Grid container size={12} sx={{ display: "flex", justifyContent: "right", width: "90%", mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'right', sm: 'right' }, pr: 1, mb: { xs: 1, sm: 0 }, alignSelf: 'center' }}>
                            <Typography variant="subtitle1">Upload Identity Card:</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'left', pl: 1 }}>
                            <Input type="file" name="idCard" onChange={handleFileChange} disableUnderline />
                            {errors.idCard && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>{errors.idCard}</Typography>}
                        </Grid>
                    </Grid>
                    <Grid container size={12} sx={{ display: "flex", justifyContent: "right", width: "90%", mt: 2 }}>
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'right', sm: 'right' }, pr: 1, mb: { xs: 1, sm: 0 }, alignSelf: 'center' }}>
                            <Typography variant="subtitle1">Photo (JPEG Req*):</Typography>
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'left', pl: 1 }}>
                            <Input type="file" name="photo" onChange={handleFileChange} required disableUnderline />
                             {errors.photo && <Typography color="error" variant="caption" sx={{ display: 'block', mt: 0.5 }}>{errors.photo}</Typography>}
                        </Grid>
                    </Grid>

                    {/* ... reCAPTCHA ... */}
                     <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', my: 2, width: '100%' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <ReCAPTCHA sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcfLAcrAAAAACJZCZHt9WRxK_4CxM9gv6pwP-94"} onChange={handleCaptchaVerify} />
                             {errors.captcha && <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>{errors.captcha}</Typography>}
                        </Box>
                    </Grid>

                    {/* ... Submit Button ... */}
                    <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                        <Button disableRipple type="submit" sx={{ height: { md: 52 }, paddingY: "9px", px: 5, fontSize: "1rem", fontWeight: 800, mb: 2, display: "flex", alignItems: "center", "&:hover": { backgroundColor: "white" }, }}>
                            Submit Report
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Card>
    );
};

export default MissingPersonForm;
