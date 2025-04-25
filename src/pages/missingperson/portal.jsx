import React, { useState } from "react";
// Use Grid from @mui/material, not @mui/material/Grid2 unless you specifically installed and configured v2
import {
    Grid, // Changed from Grid2
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
    // Autocomplete is used within StateDistrictDropdown, not directly needed here unless used elsewhere
} from "@mui/material";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import ReCAPTCHA from "react-google-recaptcha";

// Import the updated StateDistrictDropdown component
import StateDistrictDropdown from '../../components/StateDistrict1.jsx'; // Adjust path if necessary

// Custom map marker icon (ensure Leaflet's default icon path is configured or use this)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Component to handle map click event
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
    // Add state and district to the initial form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        identificationMarks: "",
        lastSeen: null,
        lastSeenPlace: "", // Added field to store text input for location
        state: "",         // Added state field
        district: "",      // Added district field
        contactInfo: "",
        additionalInfo: "",
        disasterType: "",
        idCard: null,
        photo: null,
    });

    // Add state variables to manage the dropdown selections
    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");

    const [reportedPersons, setReportedPersons] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState(false);
    const [fileError, setFileError] = useState({}); // Changed to object for specific errors
    const [captchaToken, setCaptchaToken] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const fieldName = e.target.name; // e.g., 'photo' or 'idCard'

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
        const allowedTypes = ["jpeg", "jpg"]; // Allow both jpeg and jpg

        // Clear previous error for this field first
         setFileError((prevErrors) => ({
            ...prevErrors,
            [fieldName]: "",
         }));


        if (!allowedTypes.includes(fileExtension)) {
            setFileError((prevErrors) => ({
                ...prevErrors,
                [fieldName]: "Invalid file type! Only JPEG/JPG files are allowed.",
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setError(""); // Clear previous errors
        setSuccess(false); // Reset success state

        // --- Validation ---
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
                photo: "Uploading a photo (JPEG/JPG) is required.",
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
        console.log("Form Data Submitted:", formData); // Log data before adding
        setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);

        // --- Reset Form ---
        setFormData({
            name: "",
            description: "",
            identificationMarks: "",
            lastSeen: null,
            lastSeenPlace: "", // Reset place name text
            state: "",         // Reset state
            district: "",      // Reset district
            contactInfo: "",
            additionalInfo: "",
            disasterType: "",
            idCard: null,
            photo: null,
        });

        // Reset dropdown specific states
        setSelectedState("");
        setSelectedDistrict("");

        // Revoke object URLs and reset previews/errors
        if (imagePreviews.photo) URL.revokeObjectURL(imagePreviews.photo);
        if (imagePreviews.idCard) URL.revokeObjectURL(imagePreviews.idCard);
        setImagePreviews({ photo: null, idCard: null });
        setFileError({});

        // Reset reCAPTCHA (if using the component's reset method - requires a ref)
        // Or simply reset the token state
        setCaptchaToken(null);
        // Consider adding a ref to ReCAPTCHA component and calling grecaptcha.reset();

        setError("");
        setSuccess(true); // Indicate success

         // Optionally clear success message after a delay
        setTimeout(() => setSuccess(false), 5000);

    };

     // Common TextField styling
     const textFieldStyles = {
         "& .MuiInputBase-root": { padding: "4px 8px" },
         "& .MuiOutlinedInput-notchedOutline": { border: "none" },
         "& .MuiInputLabel-root": { fontSize: "0.9rem" },
         width: "100%",
     };

     // Common Box styling
     const boxStyles = {
         width: "80%", padding: 0, mb: 2, textAlign: "left",
         boxShadow: "2px 2px 2px #E8F1F5", position: "relative",
     };


    return (
        <Container maxWidth="lg" sx={{ mt: {xs: 4, md: 10}, pb: 4, minHeight: "100vh", overflowX: "hidden" }}> {/* Prevent horiz scroll */}
            {/* Title Centered */}
            <Typography
                align="center"
                sx={{
                    mt: 2, mb: 4,
                    fontSize: { xs: "1.2rem", sm: "1.4rem", md: "1.6rem" }, // Responsive font size
                    fontWeight: "500",
                }}
            >
                Report a Missing Person
            </Typography>

             {/* Error Message Display */}
            {error && (
                <Typography color="error" align="center" sx={{ mb: 2 }}>
                    {error}
                </Typography>
            )}

            {/* Success Message Display */}
            {success && (
                <Typography color="success.main" align="center" sx={{ mb: 2 }}>
                    Report submitted successfully!
                </Typography>
            )}


            <Grid
                container
                spacing={4}
                alignItems="stretch" // Ensures cards stretch to the same height if content differs
                sx={{ display: "flex", justifyContent: "center" }}
            >
                {/* Left Side - Form */}
                <Grid item xs={12} md={6}> {/* Changed Grid 'size' prop to 'item xs/md' */}
                    <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, height: "100%" }}> {/* Added subtle shadow */}
                        <Typography
                            align="center"
                            sx={{
                                mt: 0, mb: 3, // Increased margin bottom
                                fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" },
                                fontWeight: "500",
                            }}
                        >
                            Report Details
                        </Typography>
                        <form onSubmit={handleSubmit} noValidate> {/* Added noValidate to disable default browser validation */}
                            {/* Using a container Grid for form elements for consistent spacing */}
                            <Grid container spacing={0} direction="column" alignItems="center"> {/* Center align the Box elements */}

                                {/* Name Field */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                     <Box sx={boxStyles}>
                                        <TextField fullWidth label="Name*" name="name" value={formData.name} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} />
                                    </Box>
                                </Grid>

                                {/* Description Field */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Description*" name="description" value={formData.description} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} multiline rows={3}/> {/* Allow multiline description */}
                                    </Box>
                                </Grid>

                                {/* Identification Marks Field */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Identification Marks" name="identificationMarks" value={formData.identificationMarks} onChange={handleInputChange} variant="outlined" sx={textFieldStyles} />
                                    </Box>
                                </Grid>

                                {/* Last Seen Location Field (Text Input) */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Last Seen Location (Enter Place Name)*" name="lastSeenPlace" value={formData.lastSeenPlace} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} helperText="Or click location on the map"/>
                                    </Box>
                                </Grid>

                                 {/* State and District Dropdowns - Integrated Here */}
                                 {/* The StateDistrictDropdown component renders its own Grid items with alignment */}
                                 <StateDistrictDropdown
                                     formData={formData}
                                     setFormData={setFormData} // Pass setFormData down
                                     selectedState={selectedState}
                                     setSelectedState={setSelectedState}
                                     selectedDistrict={selectedDistrict}
                                     setSelectedDistrict={setSelectedDistrict}
                                 />
                                 {/* Ensure StateDistrictDropdown uses <Grid item> internally for proper layout */}


                                {/* Disaster Type Field */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <FormControl fullWidth required> {/* Added required */}
                                            <InputLabel sx={{ fontSize: "0.9rem" }} id="disaster-type-label">Disaster Type*</InputLabel>
                                            <Select
                                                labelId="disaster-type-label"
                                                label="Disaster Type*" // Match label
                                                name="disasterType"
                                                value={formData.disasterType}
                                                onChange={handleInputChange}
                                                sx={{ // Apply similar styling for consistency
                                                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                                                    width: "100%",
                                                    // Adjust vertical padding if needed
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
                                                 <MenuItem value="Other">Other</MenuItem> {/* Added Other */}
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Grid>

                                {/* Contact Information Field */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                    <Box sx={boxStyles}>
                                        <TextField fullWidth label="Your Contact Information*" name="contactInfo" value={formData.contactInfo} onChange={handleInputChange} required variant="outlined" sx={textFieldStyles} />
                                    </Box>
                                </Grid>

                                {/* Additional Information Field */}
                                <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
                                    <Box sx={{...boxStyles, mb: 3}}> {/* Adjusted margin */}
                                        <TextField fullWidth label="Additional Information" name="additionalInfo" value={formData.additionalInfo} onChange={handleInputChange} variant="outlined" sx={textFieldStyles} multiline rows={3}/>
                                    </Box>
                                </Grid>

                                {/* File Upload Section Title */}
                                <Grid item xs={12} sx={{ width: '80%', mb: 1 }}>
                                     <Typography variant="subtitle1" sx={{ fontWeight: '500' }}>Uploads (JPEG/JPG only, max 5MB)</Typography>
                                </Grid>


                                {/* ID Card Upload */}
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
                                    <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'}, gap: 2 }}>
                                         <Typography variant="body1" sx={{ minWidth: '150px', textAlign: {xs: 'center', sm: 'left'} }}>Identity Card:</Typography>
                                         <Input type="file" name="idCard" onChange={handleFileChange} sx={{ flexGrow: 1 }} disableUnderline/>
                                    </Box>
                                </Grid>
                                 <Grid item xs={12} sx={{ width: '80%', pl: { sm: '150px'}, mb: 2}}> {/* Align error below input */}
                                    {fileError.idCard && <Typography color="error" variant="body2">{fileError.idCard}</Typography>}
                                </Grid>


                                {/* Photo Upload */}
                                 <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', width: '100%', mb: 1 }}>
                                    <Box sx={{ width: '80%', display: 'flex', alignItems: 'center', flexDirection: {xs: 'column', sm: 'row'}, gap: 2 }}>
                                         <Typography variant="body1" sx={{ minWidth: '150px', textAlign: {xs: 'center', sm: 'left'} }}>Photo (Required*):</Typography>
                                         <Input type="file" name="photo" onChange={handleFileChange} required sx={{ flexGrow: 1 }} disableUnderline/>
                                    </Box>
                                </Grid>
                                <Grid item xs={12} sx={{ width: '80%', pl: { sm: '150px'}, mb: 2}}> {/* Align error below input */}
                                      {fileError.photo && <Typography color="error" variant="body2">{fileError.photo}</Typography>}
                                </Grid>


                                {/* reCAPTCHA */}
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                     <ReCAPTCHA
                                        sitekey={import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcfLAcrAAAAACJZCZHt9WRxK_4CxM9gv6pwP-94"} // Ensure this key exists in .env and starts with VITE_
                                        onChange={handleCaptchaVerify}
                                    />
                                </Grid>

                                {/* Submit Button */}
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button
                                        variant="contained" // Use contained variant for primary action
                                        type="submit"
                                        size="large"
                                        sx={{
                                            fontWeight: 600,
                                            px: 5, // Padding left/right
                                        }}
                                    >
                                        Submit Report
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </Card>
                </Grid>

                {/* Right Side - Map and Previews */}
                 <Grid item xs={12} md={6}>
                     <Grid container direction="column" spacing={3}> {/* Stack Map and Previews vertically */}
                        {/* Map Card */}
                         <Grid item xs={12}>
                            <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3, position: "relative", overflow: "hidden" }}>
                                <Typography align="center" sx={{ mt: 0, mb: 2, fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" }, fontWeight: "500" }}>
                                    Last Seen Location (Click on Map)
                                </Typography>
                                <Box sx={{ position: "relative", width: "100%", height: "400px", borderRadius: 2, overflow: "hidden" }}>
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
                                    {/* Blur Overlay */}
                                    <Box sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none", background: `linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 5%), linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 5%), linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 5%), linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 5%)`, zIndex: 2 }} />
                                </Box>
                            </Card>
                        </Grid>

                        {/* Image Previews Card */}
                        {(imagePreviews.photo || imagePreviews.idCard) && ( // Show card if at least one image is previewable
                             <Grid item xs={12}>
                                <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                                    <Typography align="center" sx={{ mt: 0, mb: 2, fontSize: { xs: "1.1rem", sm: "1.2rem", md: "1.3rem" }, fontWeight: "500" }}>
                                        Uploaded Images Preview
                                    </Typography>
                                    <Grid container spacing={2} justifyContent="center">
                                        {imagePreviews.photo && (
                                             <Grid item xs={imagePreviews.idCard ? 6 : 12} sm={imagePreviews.idCard ? 6 : 8} md={imagePreviews.idCard ? 6 : 10}> {/* Adjust size based on whether ID card is also present */}
                                                <Typography align="center" variant="caption" display="block" gutterBottom>Photo Preview</Typography>
                                                <img src={imagePreviews.photo} alt="Uploaded Photo" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee' }} />
                                            </Grid>
                                        )}
                                         {imagePreviews.idCard && (
                                            <Grid item xs={6} sm={6} md={6}>
                                                 <Typography align="center" variant="caption" display="block" gutterBottom>ID Card Preview</Typography>
                                                 <img src={imagePreviews.idCard} alt="Uploaded ID Card" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee' }} />
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




// import React, { useState } from "react"; 
// import Grid from "@mui/material/Grid2";
// import {
//   Container, 
//   TextField, 
//   Button, 
//   Card, 
//   Typography, 
//   Input, 
//   MenuItem, 
//   Select, 
//   FormControl, 
//   InputLabel, 
//   Box,
//   Autocomplete
// } from "@mui/material";
// import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
// import "leaflet/dist/leaflet.css";
// import L from "leaflet";
// import ReCAPTCHA from "react-google-recaptcha";
// import StateDistrictDropdown from '../../components/StateDistrict1.jsx';

// // Custom map marker icon
// const customIcon = new L.Icon({
//   iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
//   iconSize: [25, 41],
//   iconAnchor: [12, 41],
// });

// // Component to handle map click event
// const LocationSelector = ({ setFormData }) => {
//   useMapEvents({
//     click(e) {
//       setFormData(prev => ({
//         ...prev,
//         lastSeen: [e.latlng.lat, e.latlng.lng],
//         // Clear any place name when clicking directly on map
//         lastSeenPlace: prev.lastSeenPlace || "Selected Location" 
//       }));
//     },
//   });
//   return null;
// };

// const MissingPersonPortal = () => {
//   const [formData, setFormData] = useState({
//     name: "",
//     description: "",
//     identificationMarks: "",
//     lastSeen: null,
//     contactInfo: "",
//     additionalInfo: "",
//     disasterType: "",
//     idCard: null,
//     photo: null,
//   });

//   const [reportedPersons, setReportedPersons] = useState([]);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState(false);
//   const [fileError, setFileError] = useState("");
//   const [captchaToken, setCaptchaToken] = useState(null);
//   const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });

//   const handleInputChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     const fileName = file.name.toLowerCase();
//     const fileExtension = fileName.split(".").pop();

//     if (fileExtension !== "jpeg") {
//       setFileError((prevErrors) => ({
//         ...prevErrors,
//         [e.target.name]: "Invalid file type! Only .jpeg files are allowed.",
//       }));
//       setFormData((prevData) => ({ ...prevData, [e.target.name]: null }));
//       setImagePreviews((prevPreviews) => ({ ...prevPreviews, [e.target.name]: null }));
//       return;
//     }

//     const fileUrl = URL.createObjectURL(file);

//     setFileError((prevErrors) => ({
//       ...prevErrors,
//       [e.target.name]: "",
//     }));
//     setFormData((prevData) => ({ ...prevData, [e.target.name]: file }));
//     setImagePreviews((prevPreviews) => ({ ...prevPreviews, [e.target.name]: fileUrl }));
//   };

//   const handleCaptchaVerify = (token) => {
//     setCaptchaToken(token);
//   };

//   const handleSubmit = (e) => {
//     e.preventDefault();

//     if (!formData.disasterType) {
//       setError("Please select a disaster type.");
//       return;
//     }
//     if (!formData.lastSeen) {
//       setError("Please select a last seen location on the map.");
//       return;
//     }
//     if (!formData.photo) {
//       setFileError((prevErrors) => ({
//         ...prevErrors,
//         photo: "Uploading a photo (JPEG) is required.",
//       }));
//       return;
//     }
//     if (!captchaToken) {
//       setError("Please complete the reCAPTCHA verification.");
//       return;
//     }

//     setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);
    
//     setFormData({
//       name: "",
//       description: "",
//       identificationMarks: "",
//       lastSeen: null,
//       contactInfo: "",
//       additionalInfo: "",
//       disasterType: "",
//       idCard: null,
//       photo: null,
//     });

//     setImagePreviews({ photo: null, idCard: null });
//     setFileError({});
//     setCaptchaToken(null);
//     setError("");
//     setSuccess(true);
//   };

//   return (
//     <Container maxWidth="lg" sx={{ mt: 10, pb: 4, minHeight: "100vh", overflow: "hidden" }}>
//       {/* Title Centered */}
//       <Typography
//                     align="center"
//                     sx={{
//                       mt: 2,
//                       mb: 4,
//                       fontSize: {
//                         xs: "1rem",
//                         sm: "1.2rem",
//                         md: "1.4rem",
//                         lg:  "1.4rem",
//                       },
//                       fontWeight: "500",
//                     }}
//                   >
//         Report a Missing Person
//       </Typography>

//       <Grid 
//         container 
//         spacing={4} 
//         alignItems="stretch" 
//         sx={{ display: "flex", justifyContent: "center" }}
//       >
//         {/* Left Side - Form */}
//         <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
//           <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, height: "100%" }}>
//           <Typography
//                     align="center"
//                     sx={{
//                       mt: 0,
//                       mb: 1,
//                       fontSize: {
//                         xs: "1rem",
//                         sm: "1.2rem",
//                         md:  "1.2rem",
//                         lg:  "1.2rem",
//                       },
//                       fontWeight: "500",
//                     }}
//                   >
//               Report Details
//             </Typography>
//             <form onSubmit={handleSubmit}>
//               {/* Name Field */}
//               <Grid container spacing={0}>
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 2,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <TextField
//                       fullWidth
//                       label="Name"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleInputChange}
//                       required
//                       variant="outlined"
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           padding: "4px 8px",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           border: "none",
//                         },
//                         "& .MuiInputLabel-root": {
//                           fontSize: "0.9rem",
//                         },
//                         width: "100%",
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* Description Field */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 2,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <TextField
//                       fullWidth
//                       label="Description"
//                       name="description"
//                       value={formData.description}
//                       onChange={handleInputChange}
//                       required
//                       variant="outlined"
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           padding: "4px 8px",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           border: "none",
//                         },
//                         "& .MuiInputLabel-root": {
//                           fontSize: "0.9rem",
//                         },
//                         width: "100%",
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* Identification Marks Field */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 2,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <TextField
//                       fullWidth
//                       label="Identification Marks"
//                       name="identificationMarks"
//                       value={formData.identificationMarks}
//                       onChange={handleInputChange}
//                       variant="outlined"
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           padding: "4px 8px",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           border: "none",
//                         },
//                         "& .MuiInputLabel-root": {
//                           fontSize: "0.9rem",
//                         },
//                         width: "100%",
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* Last Seen Location Field */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 2,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <TextField
//                       fullWidth
//                       label="Last Seen Location (Enter Place Name)"
//                       name="lastSeenPlace"
//                       value={formData.lastSeenPlace || ""}
//                       onChange={(e) => setFormData({ ...formData, lastSeenPlace: e.target.value })}
//                       required
//                       variant="outlined"
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           padding: "4px 8px",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           border: "none",
//                         },
//                         "& .MuiInputLabel-root": {
//                           fontSize: "0.9rem",
//                         },
//                         width: "100%",
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* Disaster Type Field */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 2,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <FormControl fullWidth>
//                       <InputLabel sx={{ fontSize: "0.9rem" }}>Disaster Type</InputLabel>
//                       <Select
//                         name="disasterType"
//                         value={formData.disasterType}
//                         onChange={handleInputChange}
//                         sx={{
//                           "& .MuiInputBase-root": {
//                             padding: "4px 8px",
//                           },
//                           "& .MuiOutlinedInput-notchedOutline": {
//                             border: "none",
//                           },
//                         }}
//                       >
//                         <MenuItem value="Cyclones">Cyclones</MenuItem>
//                         <MenuItem value="Earthquakes">Earthquakes</MenuItem>
//                         <MenuItem value="Tsunamis">Tsunamis</MenuItem>
//                         <MenuItem value="Floods">Floods</MenuItem>
//                         <MenuItem value="Landslides">Landslides</MenuItem>
//                         <MenuItem value="Fire">Fire</MenuItem>
//                         <MenuItem value="Heatwave">Heatwave</MenuItem>
//                       </Select>
//                     </FormControl>
//                   </Box>
//                 </Grid>

//                 {/* Contact Information Field */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 2,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <TextField
//                       fullWidth
//                       label="Contact Information"
//                       name="contactInfo"
//                       value={formData.contactInfo}
//                       onChange={handleInputChange}
//                       required
//                       variant="outlined"
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           padding: "4px 8px",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           border: "none",
//                         },
//                         "& .MuiInputLabel-root": {
//                           fontSize: "0.9rem",
//                         },
//                         width: "100%",
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* Additional Information Field */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" }}>
//                   <Box
//                     sx={{
//                       width: "80%",
//                       padding: 0,
//                       mb: 0,
//                       textAlign: "left",
//                       boxShadow: "2px 2px 2px #E8F1F5",
//                       position: "relative",
//                     }}
//                   >
//                     <TextField
//                       fullWidth
//                       label="Additional Information"
//                       name="additionalInfo"
//                       value={formData.additionalInfo}
//                       onChange={handleInputChange}
//                       variant="outlined"
//                       sx={{
//                         "& .MuiInputBase-root": {
//                           padding: "4px 8px",
//                         },
//                         "& .MuiOutlinedInput-notchedOutline": {
//                           border: "none",
//                         },
//                         "& .MuiInputLabel-root": {
//                           fontSize: "0.9rem",
//                         },
//                         width: "100%",
//                       }}
//                     />
//                   </Box>
//                 </Grid>

//                 {/* File Uploads */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%" }}>
//                 <Typography align="center" variant="subtitle1" sx={{ mt: 2, mr: 30 }}>Upload Identity Card:</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%", mr:10 }}>
//                     <Input type="file" name="idCard" onChange={handleFileChange}  />
//                     {fileError.idCard && <Typography color="error" variant="body2">{fileError.idCard}</Typography>}
//                   </Grid>
                  
//                   <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%" }}>
//                 <Typography align="center" variant="subtitle1" sx={{ mt: 2, mr: 21 }}>Upload Photo (JPEG Required):</Typography>
//                 </Grid>
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ display: "flex", justifyContent: "right" , width: "90%", mr:10 }}>
//                   <Input type="file" name="photo" onChange={handleFileChange} required />
//                   {fileError.photo && <Typography color="error" variant="body2">{fileError.photo}</Typography>}
//                 </Grid>

//                 {/* reCAPTCHA */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ml:11}}>
//                   <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
//                     <ReCAPTCHA sitekey="6LcfLAcrAAAAACJZCZHt9WRxK_4CxM9gv6pwP-94" onChange={handleCaptchaVerify} />
//                   </div>
//                 </Grid>

//                 {/* Submit Button */}
//                 <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
//                   <Button disableRipple type="submit"
//                     sx={{
//                       height: { md: 62 }, // Match the height of the Autocomplete boxes
//                       // padding: "8px 16px", // Adjust padding
//                       paddingY: "9px",
//                       // pr: { xs: 1, md: 0 },
//                       // pl: 1,
//                       // marginX: "auto",
//                       fontSize: "1.1rem",
//                       fontWeight: 800,
//                       ml:30,
//                       mb: 2,
//                       display: "flex",
//                       alignItems: "center",
//                       backgroundColor: "white", // Maintain the original background
//                       "&:hover": {
//                         backgroundColor: "white", // Prevent color change on hover
//                       },
//                     }}>
//                     Submit
//                   </Button>
//                 </Grid>
//               </Grid>
//             </form>
//           </Card>
//         </Grid>

//         {/* Vertical Line
//         <Grid item xs={0.5} sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
//           <div style={{ width: "2px", height: "100%", backgroundColor: "#ccc" }}></div>
//         </Grid> */}

//         {/* Right Side - Map */}
//         <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
//           <Card
//             sx={{
//               p: 3,
//               borderRadius: 3,
//               boxShadow: 0,
//               position: "relative",
//               overflow: "hidden",
//             }}
//           >
//             <Typography
//                     align="center"
//                     sx={{
//                       mt: 0,
//                       mb: 1,
//                       fontSize: {
//                         xs: "1rem",
//                         sm: "1.2rem",
//                         md:  "1.2rem",
//                         lg:  "1.2rem",
//                       },
//                       fontWeight: "500",
//                     }}
//                   >
//               Last Seen Location
//             </Typography>

//             <Box
//               sx={{
//                 position: "relative",
//                 width: "100%",
//                 height: "400px",
//                 borderRadius: 2,
//                 overflow: "hidden",
//                 mt: 2,
//               }}
//             >
//               {/* Map */}
//               <MapContainer
//   center={[20.5937, 78.9629]}
//   zoom={5}
//   style={{
//     height: "100%",
//     width: "100%",
//     position: "absolute",
//     zIndex: 1,
//   }}
// >
//   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
//   {formData.lastSeen && (
//     <Marker 
//       position={formData.lastSeen} 
//       icon={customIcon}
//       eventHandlers={{
//         click: () => {
//           // Optional: handle marker click if needed
//         },
//       }}
//     >
//       <Popup>
//         {formData.lastSeenPlace || "Selected Location"}
//       </Popup>
//     </Marker>
//   )}
//   <LocationSelector setFormData={setFormData} />
// </MapContainer>

//               {/* 4-side white blur overlay */}
//               <Box
//                 sx={{
//                   position: "absolute",
//                   top: 0,
//                   left: 0,
//                   width: "100%",
//                   height: "100%",
//                   pointerEvents: "none",
//                   background: `
//                     linear-gradient(to top, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
//                     linear-gradient(to bottom, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
//                     linear-gradient(to left, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%),
//                     linear-gradient(to right, rgba(255, 255, 255, 1) 0%, rgba(255, 255, 255, 0) 3%)
//                   `,
//                   zIndex: 2,
//                 }}
//               />
//             </Box>
//           </Card>

//           {/* Image Previews */}
//           {imagePreviews.photo && (
//             <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }} sx={{ mt: 3 }}>
//               <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0 }}>
//               <Typography
//                     align="center"
//                     sx={{
//                       mt: 0,
//                       mb: 1,
//                       fontSize: {
//                         xs: "1rem",
//                         sm: "1.2rem",
//                         md:  "1.2rem",
//                         lg:  "1.2rem",
//                       },
//                       fontWeight: "500",
//                     }}
//                   >
//                   Uploaded Images Preview
//                 </Typography>
//                 <Grid container spacing={2} justifyContent="center">
//                   {imagePreviews.idCard ? (
//                     <>
//                       <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
//                         <img src={imagePreviews.photo} alt="Uploaded Photo" style={{ width: "100%", borderRadius: 8 }} />
//                         <Typography align="center">Uploaded Photo</Typography>
//                       </Grid>
//                       <Grid item size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
//                         <img src={imagePreviews.idCard} alt="Uploaded ID Card" style={{ width: "100%", borderRadius: 8 }} />
//                         <Typography align="center">Uploaded ID Card</Typography>
//                       </Grid>
//                     </>
//                   ) : (
//                     <Grid item xs={12}>
//                       <img src={imagePreviews.photo} alt="Uploaded Photo" style={{ width: "100%", borderRadius: 8 }} />
//                       <Typography align="center">Uploaded Photo</Typography>
//                     </Grid>
//                   )}
//                 </Grid>
//               </Card>
//             </Grid>
//           )}
//         </Grid>
//       </Grid>
//     </Container>
//   );
// };

// export default MissingPersonPortal;