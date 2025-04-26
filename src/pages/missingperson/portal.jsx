import React, { useState } from "react";
// Use Grid from @mui/material/Grid2 for v6+ features and syntax
import Grid from "@mui/material/Grid2"; // Changed from v5 Grid
import {
    Container,
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
    // Autocomplete is likely used within StateDistrictDropdown
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ReCAPTCHA from "react-google-recaptcha";

// Import the updated StateDistrictDropdown component
import StateDistrictDropdown from '../../components/StateDistrict1.jsx'; // Adjust path if necessary

// Custom map marker icon (Leaflet default path configuration)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click event (using original logic)
const LocationSelector = ({ setFormData }) => {
    useMapEvents({
        click(e) {
            setFormData(prev => ({
                ...prev,
                lastSeen: [e.latlng.lat, e.latlng.lng],
                // Use a more descriptive default or update based on reverse geocoding if desired
                lastSeenPlace: prev.lastSeenPlace || `Coordinates: ${e.latlng.lat.toFixed(4)}, ${e.latlng.lng.toFixed(4)}`
            }));
        },
    });
    return null;
};

const MissingPersonPortal = () => {
    // Keeping original state structure
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        identificationMarks: "",
        lastSeen: null,
        lastSeenPlace: "",
        state: "",
        district: "",
        contactInfo: "",
        additionalInfo: "",
        disasterType: "",
        idCard: null,
        photo: null,
    });

    // Keeping original state variables
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [reportedPersons, setReportedPersons] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [fileError, setFileError] = useState({});
    const [captchaToken, setCaptchaToken] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Using original, more robust file handling
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name;

        if (!file) {
             // Clear existing preview and data if file selection is cancelled
             setFormData((prevData) => ({ ...prevData, [fieldName]: null }));
             setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: null }));
             setFileError((prevErrors) => ({
                 ...prevErrors,
                 [fieldName]: "", // Clear error if selection is cancelled
             }));
            return;
        }

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split(".").pop();
        const allowedTypes = ["jpeg"]; // Allow both jpeg

        // Clear previous error for this field first
         setFileError((prevErrors) => ({
            ...prevErrors,
            [fieldName]: "",
         }));


        if (!allowedTypes.includes(fileExtension)) {
            setFileError((prevErrors) => ({
                ...prevErrors,
                [fieldName]: "Invalid file type! Only JPEG files are allowed.",
            }));
            setFormData((prevData) => ({ ...prevData, [fieldName]: null })); // Clear invalid file data
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: null })); // Clear preview
            e.target.value = null; // Reset file input
            return;
        }

        // Check file size (e.g., limit to 5MB)
        const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSizeInBytes) {
             setFileError((prevErrors) => ({
                 ...prevErrors,
                 [fieldName]: `File too large! Maximum size is ${maxSizeInBytes / (1024*1024)}MB.`,
             }));
            setFormData((prevData) => ({ ...prevData, [fieldName]: null }));
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: null }));
            e.target.value = null; // Reset file input
             return;
        }


        // If validation passes, create object URL for preview
        const fileUrl = URL.createObjectURL(file);

        // Revoke previous object URL for this field to prevent memory leaks
        if (imagePreviews[fieldName]) {
             URL.revokeObjectURL(imagePreviews[fieldName]);
        }


        setFormData((prevData) => ({ ...prevData, [fieldName]: file }));
        setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: fileUrl }));
    };


    const handleCaptchaVerify = (token) => {
        setCaptchaToken(token);
        setError(""); // Clear general errors when captcha is verified
    };

    // Using original, more robust submit handler validation
    const handleSubmit = (e) => {
        e.preventDefault();
        setError("");
        setSuccess(false);

        // --- Validation (Original Robust Checks) ---
        let validationPassed = true;

        if (!formData.name.trim()) {
            setError("Please enter the name.");
            validationPassed = false;
        } else if (!formData.description.trim()) {
             setError("Please enter a description.");
            validationPassed = false;
        } else if (!formData.lastSeenPlace.trim() && !formData.lastSeen) {
            // Require either map click or text input for location
            setError("Please enter or select the last seen location on the map.");
            validationPassed = false;
        } else if (!formData.state) { // Added state validation
            setError("Please select a state.");
            validationPassed = false;
        } else if (!formData.district) { // Added district validation
            setError("Please select a district.");
            validationPassed = false;
        } else if (!formData.disasterType) {
            setError("Please select a disaster type.");
            validationPassed = false;
        } else if (!formData.contactInfo.trim()) {
             setError("Please enter contact information.");
            validationPassed = false;
        } else if (!formData.photo) {
            // Ensure photo error state is updated correctly if needed
             setFileError((prevErrors) => ({
                 ...prevErrors,
                 photo: "Uploading a photo (JPEG) is required.",
             }));
            setError("Photo upload is required. Please check file requirements."); // More general error
            validationPassed = false;
        } else if (fileError.photo || fileError.idCard) {
            // Check if there are any existing file validation errors
            setError("Please resolve file upload errors.");
            validationPassed = false;
        } else if (!captchaToken) {
            setError("Please complete the reCAPTCHA verification.");
            validationPassed = false;
        }

        if (!validationPassed) {
            return; // Stop submission if validation fails
        }

        // --- Submission Logic ---
        console.log("Form Data Submitted:", formData);
        setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);

        // --- Reset Form (Original Reset Logic) ---
        setFormData({
            name: "",
            description: "",
            identificationMarks: "",
            lastSeen: null,
            lastSeenPlace: "",
            state: "",
            district: "",
            contactInfo: "",
            additionalInfo: "",
            disasterType: "",
            idCard: null,
            photo: null,
        });
        setSelectedState("");
        setSelectedDistrict("");
        if (imagePreviews.photo) URL.revokeObjectURL(imagePreviews.photo);
        if (imagePreviews.idCard) URL.revokeObjectURL(imagePreviews.idCard);
        setImagePreviews({ photo: null, idCard: null });
        setFileError({});
        setCaptchaToken(null);
        // Consider adding a ref to ReCAPTCHA component and calling grecaptcha.reset(); if needed
        setError("");
        setSuccess(true);
        setTimeout(() => setSuccess(false), 5000);
    };

     // Common TextField styling (kept from original)
     const textFieldStyles = {
        "& .MuiInputBase-root": { padding: "4px 8px" },
        "& .MuiOutlinedInput-notchedOutline": { border: "none" },
        "& .MuiInputLabel-root": { fontSize: "0.9rem" },
        width: "100%", // Box controls the 80%, TextField fills the box
     };

     // Common Box styling (adapted from reference)
     const boxStyles = {
        width: "80%",
        padding: 0,
        mb: 2, // Consistent margin bottom
        textAlign: "left",
        boxShadow: "2px 2px 2px #E8F1F5", // Reference shadow
        position: "relative",
     };


    return (
        // Keeping original container padding/margins, adjusted mt
        <Container maxWidth="lg" sx={{ mt: {xs: 4, md: 10}, pb: 4, minHeight: "100vh", overflowX: "hidden" }}>
            {/* Title Centered (Using reference font sizes) */}
            <Typography
                align="center"
                sx={{
                    mt: 2,
                    mb: 4,
                    fontSize: { xs: "1rem", sm: "1.2rem", md: "1.4rem", lg: "1.4rem" }, // Reference sizes
                    fontWeight: "500",
                }}
            >
                Report a Missing Person
            </Typography>

             {/* Error Message Display (Kept from original) */}
             {error && (
                 <Typography color="error" align="center" sx={{ mb: 2 }}>
                     {error}
                 </Typography>
             )}

             {/* Success Message Display (Kept from original) */}
             {success && (
                 <Typography color="success.main" align="center" sx={{ mb: 2 }}>
                     Report submitted successfully!
                 </Typography>
             )}

            {/* Using Grid v2 */}
            <Grid
                container
                spacing={4}
                alignItems="stretch"
                sx={{ display: "flex", justifyContent: "center" }}
            >
                {/* Left Side - Form */}
                <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                    {/* Card styling from reference */}
                    <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, height: "100%" }}>
                        <Typography
                            align="center"
                            sx={{
                                mt: 0,
                                mb: 1, // Reference margin
                                fontSize: { xs: "1rem", sm: "1.2rem", md: "1.2rem", lg: "1.2rem" }, // Reference sizes
                                fontWeight: "500",
                            }}
                        >
                            Report Details
                        </Typography>
                        <form onSubmit={handleSubmit} noValidate>
                            {/* Grid v2 container for form items */}
                            <Grid container spacing={0} direction="column" alignItems="center"> {/* Center align the Box elements wrapper */}

                                {/* Name Field */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}> {/* Pushes Box right */}
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Name" name="name" value={formData.name} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} />
                                    </Box>
                                </Grid>

                                {/* Description Field */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Description" name="description" value={formData.description} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} multiline rows={3}/>
                                    </Box>
                                </Grid>

                                {/* Identification Marks Field */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Identification Marks" name="identificationMarks" value={formData.identificationMarks} onChange={handleInputChange} variant="outlined" sx={textFieldStyles} />
                                    </Box>
                                </Grid>

                                {/* Last Seen Location Field (Text Input) */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Last Seen Location (Enter Place Name)" name="lastSeenPlace" value={formData.lastSeenPlace} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles}/>
                                    </Box>
                                </Grid>

                                {/* State and District Dropdowns - Integrated Here */}
                                {/* Wrap StateDistrictDropdown similarly if it doesn't handle its own alignment/width */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    {/* This Box ensures the dropdown container aligns like other fields */}
                                    <Box sx={{...boxStyles, boxShadow: 'none', mb: 0}}>
                                        <StateDistrictDropdown
                                            formData={formData}
                                            setFormData={setFormData}
                                            selectedState={selectedState}
                                            setSelectedState={setSelectedState}
                                            selectedDistrict={selectedDistrict}
                                            setSelectedDistrict={setSelectedDistrict}
                                            // Pass common styles if needed by the dropdown component
                                            // textFieldStyles={textFieldStyles}
                                            // boxStyles={boxStyles}
                                        />
                                    </Box>
                                </Grid>
                                {/* Add margin below the dropdown container if needed */}
                                <Grid size={12} sx={{ height: '16px' }}/> {/* Spacer to mimic mb: 2 */}


                                {/* Disaster Type Field */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <FormControl fullWidth required>
                                            <InputLabel sx={{ fontSize: "0.9rem" }} id="disaster-type-label">Disaster Type</InputLabel>
                                            <Select
                                                labelId="disaster-type-label"
                                                label="Disaster Type*"
                                                name="disasterType"
                                                value={formData.disasterType}
                                                onChange={handleInputChange}
                                                sx={{ // Apply similar styling for consistency
                                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                                    width: "100%",
                                                    '& .MuiSelect-select': { paddingTop: '10px', paddingBottom: '10px' },
                                                }}
                                            >
                                                <MenuItem value="Cyclones">Cyclones</MenuItem>
                                                <MenuItem value="Earthquakes">Earthquakes</MenuItem>
                                                <MenuItem value="Tsunamis">Tsunamis</MenuItem>
                                                <MenuItem value="Floods">Floods</MenuItem>
                                                <MenuItem value="Landslides">Landslides</MenuItem>
                                                <MenuItem value="Fire">Fire</MenuItem>
                                                <MenuItem value="Heatwave">Heatwave</MenuItem>
                                                <MenuItem value="Other">Other</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>

                                {/* Contact Information Field */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Contact Information" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} />
                                    </Box>
                                </Grid>

                                {/* Additional Information Field */}
                                <Grid size={12} sx={{ display: "flex", justifyContent: "right", width: '100%' }}>
                                    <Box sx={{...boxStyles, mb: 0}}> {/* Adjusted margin from reference */}
                                        <TextField fullWidth label="Additional Information" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} variant="outlined" sx={textFieldStyles} multiline rows={3}/>
                                    </Box>
                                </Grid>


                                {/* File Uploads - Reference Layout */}
                                <Grid container size={12} sx={{ display: "flex", justifyContent: "right" , width: "90%", mt: 2}}>
                                     <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'right', sm: 'right' }, pr: 1, mb: {xs: 1, sm: 0}, alignSelf: 'center' }}>
                                         <Typography variant="subtitle1">Upload Identity Card:</Typography>
                                     </Grid>
                                     <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'left', pl: 1 }}>
                                         <Input type="file" name="idCard" onChange={handleFileChange} disableUnderline />
                                         {fileError.idCard && <Typography color="error" variant="body2" sx={{ display: 'block' }}>{fileError.idCard}</Typography>}
                                     </Grid>
                                </Grid>

                                <Grid container size={12} sx={{ display: "flex", justifyContent: "right" , width: "90%", mt: 2}}>
                                    <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: { xs: 'right', sm: 'right' }, pr: 1, mb: {xs: 1, sm: 0}, alignSelf: 'center' }}>
                                        <Typography variant="subtitle1">Photo (JPEG Req*):</Typography>
                                     </Grid>
                                     <Grid size={{ xs: 12, sm: 6 }} sx={{ textAlign: 'left', pl: 1 }}>
                                         <Input type="file" name="photo" onChange={handleFileChange} required disableUnderline />
                                         {fileError.photo && <Typography color="error" variant="body2" sx={{ display: 'block' }}>{fileError.photo}</Typography>}
                                    </Grid>
                                </Grid>


                                {/* reCAPTCHA */}
                                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', my: 2, width: '100%' }}> {/* Centered */}
                                     <ReCAPTCHA
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcfLAcrAAAAACJZCZHt9WRxK_4CxM9gv6pwP-94"} // Use environment variable
                                        onChange={handleCaptchaVerify}
                                    />
                                </Grid>

                                {/* Submit Button - Reference Style */}
                                <Grid size={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button disableRipple type="submit"
                                        sx={{
                                            height: { md: 52 },
                                            paddingY: "9px",
                                            px: 5, // Added padding X for better appearance
                                            fontSize: "1rem",
                                            fontWeight: 800,
                                            // ml:30, // Reference margin - centering is often better
                                            mb: 2,
                                            display: "flex",
                                            alignItems: "center",
                                            color: 'primary.main', // Use theme color for text
                                            backgroundColor: "white", // Maintain the original background
                                            "&:hover": {
                                                backgroundColor: "white", // Prevent color change on hover
                                            },
                                        }}>
                                        Submit Report
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Card>
                </Grid>

                {/* Right Side - Map and Previews */}
                 <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                     <Grid container direction="column" spacing={3}> {/* Stack Map and Previews vertically */}
                         {/* Map Card - Reference Style */}
                         <Grid size={12}>
                            <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, position: "relative", overflow: "hidden" }}>
                                <Typography
                                    align="center"
                                    sx={{
                                        mt: 0,
                                        mb: 1, // Reference margin
                                        fontSize: { xs: "1rem", sm: "1.2rem", md: "1.2rem", lg: "1.2rem" }, // Reference sizes
                                        fontWeight: "500",
                                    }}
                                >
                                    Last Seen Location (Click on Map)
                                </Typography>
                                <Box sx={{ position: "relative", width: "100%", height: "400px", borderRadius: 2, overflow: "hidden", mt: 2 }}>
                                    {/* Map */}
                                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: "100%", width: "100%", position: "absolute", zIndex: 1 }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
                                        {formData.lastSeen && (
                                            <Marker position={formData.lastSeen}>
                                                <Popup>{formData.lastSeenPlace || "Selected Location"}</Popup>
                                            </Marker>
                                        )}
                                        <LocationSelector setFormData={setFormData} />
                                    </MapContainer>
                                    {/* 4-side white blur overlay - Reference Style */}
                                    <Box
                                        sx={{
                                            position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none",
                                            background: `
                                                linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                                                linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                                                linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
                                                linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%)
                                            `,
                                            zIndex: 2,
                                        }}
                                    />
                                </Box>
                            </Card>
                          </Grid>

                        {/* Image Previews Card - Reference Style */}
                        {(imagePreviews.photo || imagePreviews.idCard) && ( // Original condition to show card
                             <Grid size={12}>
                                <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0 }}>
                                    <Typography
                                        align="center"
                                        sx={{
                                            mt: 0,
                                            mb: 1, // Reference margin
                                            fontSize: { xs: "1rem", sm: "1.2rem", md: "1.2rem", lg: "1.2rem" }, // Reference sizes
                                            fontWeight: "500",
                                        }}
                                    >
                                        Uploaded Images Preview
                                    </Typography>
                                    {/* Reference Grid layout for previews */}
                                    <Grid container spacing={2} justifyContent="center">
                                         {imagePreviews.photo && (
                                             <Grid item size={imagePreviews.idCard ? { xs: 12, sm: 6 } : { xs: 12 }}> {/* Adjust size based on whether ID card is also present */}
                                                 <img src={imagePreviews.photo} alt="Uploaded Photo" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee' }} />
                                                 <Typography align="center" variant="caption" display="block" sx={{ mt: 1 }}>Photo Preview</Typography>
                                             </Grid>
                                         )}
                                         {imagePreviews.idCard && (
                                            <Grid item size={{ xs: 12, sm: 6 }}>
                                                 <img src={imagePreviews.idCard} alt="Uploaded ID Card" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee' }} />
                                                 <Typography align="center" variant="caption" display="block" sx={{ mt: 1 }}>ID Card Preview</Typography>
                                             </Grid>
                                         )}
                                     </Grid>
                                </Card>
                            </Grid>
                         )}
                    </Grid>
                </Grid>
            </Grid>
        </Container>
    );
};

export default MissingPersonPortal;
