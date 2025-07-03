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
    IconButton,
    InputAdornment,
    CircularProgress
} from "@mui/material";
import { Search as SearchIcon } from '@mui/icons-material';
import ReCAPTCHA from "react-google-recaptcha";
import StateDistrictDropdown from '../../components/StateDistrict1.jsx'; // Adjust path if needed

// Styles
const textFieldStyles = {
    "& .MuiInputBase-root": { padding: {xs:"1px 8px", md:"4px 8px"} },
    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
    "& .MuiInputLabel-root": { fontSize: "0.9rem" },
    width: "100%",
};

const boxStyles = {
    width: {xs:"90%", md:"80%"}, // Consider making this responsive
    padding: 0,
    mb: 2,
    textAlign: "left",
    boxShadow: "2px 3px 2px #E8F1F5",
    position: "relative",
};

// Helper function to map detailed disaster titles to standardized types
const getStandardizedDisasterType = (titleFromApi) => {
    if (!titleFromApi) return "Other"; // Default if title is undefined or empty

    const title = titleFromApi.toLowerCase();

    if (title.includes("earthquake")) return "Earthquakes";
    if (title.includes("flood")) return "Floods";
    if (title.includes("cyclone")) return "Cyclones";
    if (title.includes("tsunami")) return "Tsunamis";
    if (title.includes("landslide")) return "Landslides";
    if (title.includes("fire")) return "Fire"; // Assuming 'Fire' is a standard type
    if (title.includes("heatwave")) return "Heatwave"; // Assuming 'Heatwave' is a standard type

    // Add more specific mappings if other common keywords appear in titles that should map to one of the standard types.

    return "Other"; // Default if no specific keyword found, or if it's genuinely 'Other'
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
    searchMapLocation,
    isSearchingLocation,
    isDisabled // <--- IMPORTANT: This prop is now correctly destructured here
}) => {

    const [recentDisasters, setRecentDisasters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filteredDisasters, setFilteredDisasters] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRecentDisasters = async () => {
            setLoading(true);
            try {
                const response = await fetch(
                    "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/disasters/title_state"
                );
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                console.log("Fetched recent disasters:", data);
                setRecentDisasters(Array.isArray(data) ? data : []); // Ensure data is an array
            } catch (error) {
                console.error("Error fetching recent disasters:", error);
                setRecentDisasters([]); // Set to empty array on error
            } finally {
                setLoading(false);
            }
        };

        fetchRecentDisasters();
    }, []);

    useEffect(() => {
        const MPState = selectedState?.state || formData?.state;
        console.log("Selected State for filtering disasters:", MPState);

        if (!MPState || !Array.isArray(recentDisasters) || recentDisasters.length === 0) {
            setFilteredDisasters([]);
            // If no state is selected, or no disasters fetched, also clear the disasterType from formData
            // to prevent submitting an old value if the user deselects a state.
            // However, handleInputChange will manage this if the select becomes empty.
            // If filteredDisasters becomes empty, the Select will show "No active disasters..."
            // and the user would need to pick again if they re-select a state with disasters.
            return;
        }

        const filtered = recentDisasters.filter(
            (disaster) =>
                disaster.state?.toLowerCase() === MPState.toLowerCase()
        );

        console.log("Filtered Disasters based on state:", filtered);
        setFilteredDisasters(filtered);

    }, [selectedState, formData?.state, recentDisasters]);

    const handleLocationKeyPress = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            searchMapLocation();
        }
    };

    return (
        <Card sx={{ p: {xs: 1, md: 3}, borderRadius: 3, boxShadow: 0, }}>
            <form onSubmit={handleSubmit} noValidate>
                <Grid container spacing={0} direction="column" alignItems="center">
                    {/* Name Field */}
                    <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                sx={textFieldStyles}
                                error={!!errors.name}
                                helperText={errors.name || ''}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                            />
                        </Box>
                    </Grid>
                    {/* Age Field */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Age"
                                name="age"
                                type="number"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                sx={textFieldStyles}
                                error={!!errors.age}
                                helperText={errors.age || ''}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                            />
                        </Box>
                    </Grid>
                    {/* Gender Field */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <FormControl fullWidth required error={!!errors.gender} disabled={isDisabled}> {/* <--- ADDED: Disable FormControl for Select */}
                                <InputLabel sx={{ fontSize: "0.9rem" }} id="gender-label">Gender</InputLabel>
                                <Select
                                    labelId="gender-label"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleInputChange}
                                    sx={{
                                        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                        width: "100%",
                                        '& .MuiSelect-select': { paddingTop: '10px', paddingBottom: '25px' },
                                    }}
                                    // disabled={isDisabled} // Select's disabled is on FormControl
                                >
                                    <MenuItem value="Male">Male</MenuItem>
                                    <MenuItem value="Female">Female</MenuItem>
                                    <MenuItem value="Other">Other</MenuItem>
                                </Select>
                                {errors.gender && <FormHelperText>{errors.gender}</FormHelperText>}
                            </FormControl>
                        </Box>
                    </Grid>
                    {/* Description Field */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                sx={textFieldStyles}
                                multiline
                                rows={3}
                                error={!!errors.description}
                                helperText={errors.description || ''}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                            />
                        </Box>
                    </Grid>
                    {/* Identification Marks Field */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Identification Marks"
                                name="identificationMarks"
                                value={formData.identificationMarks}
                                onChange={handleInputChange}
                                variant="outlined"
                                sx={textFieldStyles}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                            />
                        </Box>
                    </Grid>

                    {/* Last Seen Location Field (Editable + Search Button) */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Last Seen Location"
                                name="lastSeenPlace"
                                value={formData.lastSeenPlace}
                                onChange={handleInputChange}
                                onKeyPress={handleLocationKeyPress}
                                variant="outlined"
                                sx={textFieldStyles}
                                error={!!errors.location}
                                helperText={errors.location || ''}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="search location on map"
                                                onClick={searchMapLocation}
                                                edge="end"
                                                disabled={isSearchingLocation || !formData.lastSeenPlace?.trim() || isDisabled} // <--- ADDED: isDisabled to button
                                                size="small"
                                                sx={{ mr: -1 }}
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
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={{ ...boxStyles, boxShadow: 'none', mb: 0 }}>
                            {/* StateDistrictDropdown must accept and pass 'isDisabled' to its internal TextFields/Selects */}
                            <StateDistrictDropdown
                                formData={formData}
                                setFormData={setFormData}
                                selectedState={selectedState}
                                setSelectedState={setSelectedState}
                                selectedDistrict={selectedDistrict}
                                setSelectedDistrict={setSelectedDistrict}
                                errors={errors}
                                isDisabled={isDisabled} // <--- Pass isDisabled to StateDistrictDropdown
                            />
                            {errors.state && <FormHelperText error sx={{ ml: 1.5 }}>{errors.state}</FormHelperText>}
                            {errors.district && !errors.state && <FormHelperText error sx={{ ml: 1.5 }}>{errors.district}</FormHelperText>}
                        </Box>
                    </Grid>
                    {/* <Grid item xs={12} sx={{ height: '16px' }} /> Spacer */}

                    {/* Disaster Type Dropdown */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <FormControl fullWidth required error={!!errors.disasterType} disabled={isDisabled}> {/* <--- ADDED: Disable FormControl */}
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
                                        '& .MuiSelect-select': { paddingTop: '10px', paddingBottom: '25px' },
                                    }}
                                    // disabled={isDisabled} // Select's disabled is on FormControl
                                >
                                    <MenuItem value="">
                                        <em>-- Select Disaster Type --</em>
                                    </MenuItem>
                                    {loading ? (
                                        <MenuItem value="" disabled>Loading disasters...</MenuItem>
                                    ) : filteredDisasters.length > 0 ? (
                                        filteredDisasters.map((disaster, index) => (
                                            <MenuItem
                                                key={`${disaster.title}-${index}`}
                                                value={getStandardizedDisasterType(disaster.title)}
                                            >
                                                {disaster.title}
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
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={boxStyles}>
                            <TextField
                                fullWidth
                                label="Contact Information"
                                name="contactInfo"
                                value={formData.contactInfo}
                                onChange={handleInputChange}
                                required
                                variant="outlined"
                                sx={textFieldStyles}
                                error={!!errors.contactInfo}
                                helperText={errors.contactInfo || ''}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                            />
                        </Box>
                    </Grid>

                    {/* Additional Information Field */}
                    <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                        <Box sx={{ ...boxStyles, mb: 0 }}>
                            <TextField
                                fullWidth
                                label="Additional Information"
                                name="additional_info"
                                value={formData.additional_info}
                                onChange={handleInputChange}
                                variant="outlined"
                                sx={textFieldStyles}
                                multiline
                                rows={3}
                                disabled={isDisabled} // <--- ADDED: Disable based on isAuthenticated
                            />
                        </Box>
                    </Grid>

                    {/* Note: File Uploads, reCAPTCHA, and Submit Button are commented out in your provided code.
                       If you uncomment them in the parent MissingPersonPortal.jsx, ensure they also have
                       `disabled={isDisabled}` applied. */}

                </Grid>
            </form>
        </Card>
    );
};

export default MissingPersonForm;