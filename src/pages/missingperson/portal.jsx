import React, { useState, useEffect, useCallback } from "react"; // Added useCallback
import Grid from "@mui/material/Grid2";
import { Container, Typography, Box, Alert, Card } from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

// Import components
import MissingPersonForm from '../missingperson/form'; // Adjust path
import InteractiveMap from '../../components/InteractiveMap';   // Adjust path

const MissingPersonPortal = () => {
    const [formData, setFormData] = useState({
        name: "", age: "", gender: "", description: "", identificationMarks: "",
        lastSeen: null, lastSeenPlace: "", state: "", district: "",
        contactInfo: "", additionalInfo: "", disasterType: "",
        idCard: null, photo: null,
    });

    const [selectedState, setSelectedState] = useState("");
    const [selectedDistrict, setSelectedDistrict] = useState("");
    const [errors, setErrors] = useState({});
    const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
    const [reportedPersons, setReportedPersons] = useState([]);
    const [captchaToken, setCaptchaToken] = useState(null);
    const [imagePreviews, setImagePreviews] = useState({ photo: null, idCard: null });
    const [isSearchingLocation, setIsSearchingLocation] = useState(false); // Loading state for form search button

    // Cleanup Object URLs
    useEffect(() => {
        return () => {
            if (imagePreviews.photo) URL.revokeObjectURL(imagePreviews.photo);
            if (imagePreviews.idCard) URL.revokeObjectURL(imagePreviews.idCard);
        };
    }, [imagePreviews.photo, imagePreviews.idCard]);

    // --- Input Handlers ---
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear specific error when user starts typing/interacting
        if (errors[name]) {
             setErrors(prev => ({ ...prev, [name]: undefined }));
        }
        // Clear location error if user starts typing in the field
        if (name === 'lastSeenPlace' && errors.location) {
            setErrors(prev => ({ ...prev, location: undefined }));
             // Optionally clear coordinates when typing starts, requiring a new search/click
             // setFormData(prev => ({ ...prev, lastSeen: null }));
        }

        // Handle state/district changes
        if (name === 'state') {
            setFormData(prev => ({ ...prev, state: value, district: '' }));
            setSelectedState(value); setSelectedDistrict('');
             if (errors.state || errors.district) setErrors(prev => ({ ...prev, state: undefined, district: undefined }));
        } else if (name === 'district') {
            setFormData(prev => ({ ...prev, district: value }));
            setSelectedDistrict(value);
             if (errors.district) setErrors(prev => ({ ...prev, district: undefined }));
        }
         // Clear other errors on input change
         if (name === 'disasterType' && errors.disasterType) setErrors(prev => ({ ...prev, disasterType: undefined }));
         if (name === 'contactInfo' && errors.contactInfo) setErrors(prev => ({ ...prev, contactInfo: undefined }));
         if (name === 'name' && errors.name) setErrors(prev => ({ ...prev, name: undefined }));
         if (name === 'description' && errors.description) setErrors(prev => ({ ...prev, description: undefined }));
    };

    const handleFileChange = (e) => {
        // ... (file change logic remains the same) ...
        const file = e.target.files[0];
        const fieldName = e.target.name;
        const newErrors = { ...errors };

        const resetFileState = () => {
            setFormData((prevData) => ({ ...prevData, [fieldName]: null }));
            if (imagePreviews[fieldName]) URL.revokeObjectURL(imagePreviews[fieldName]);
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: null }));
            e.target.value = null;
        };

        newErrors[fieldName] = undefined; // Clear previous error

        if (!file) {
            resetFileState();
            setErrors(newErrors);
            return;
        }

        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split(".").pop();
        const allowedTypes = ["jpeg"];
        const maxSizeInBytes = 5 * 1024 * 1024;

        let fileIsValid = true;
        if (!allowedTypes.includes(fileExtension)) {
            newErrors[fieldName] = "Invalid file type! Only JPEG allowed."; fileIsValid = false;
        } else if (file.size > maxSizeInBytes) {
            newErrors[fieldName] = `File too large! Max size is ${maxSizeInBytes / (1024 * 1024)}MB.`; fileIsValid = false;
        }

        if (!fileIsValid) { resetFileState(); }
        else {
            if (imagePreviews[fieldName]) URL.revokeObjectURL(imagePreviews[fieldName]);
            const fileUrl = URL.createObjectURL(file);
            setFormData((prevData) => ({ ...prevData, [fieldName]: file }));
            setImagePreviews((prevPreviews) => ({ ...prevPreviews, [fieldName]: fileUrl }));
        }
        setErrors(newErrors);
    };

    const handleCaptchaVerify = (token) => {
        setCaptchaToken(token);
        if (errors.captcha) setErrors(prev => ({ ...prev, captcha: undefined }));
        setStatusMessage({ type: '', text: '' });
    };

    // --- Geocoding Function (Triggered by Form Search Button) ---
    const searchMapLocation = useCallback(async () => {
        const query = formData.lastSeenPlace?.trim();
        if (!query) {
            setStatusMessage({ type: 'error', text: 'Please enter a location to search.' });
            return;
        }
        // Clear previous location errors specifically
        if (errors.location) {
             setErrors(prev => ({ ...prev, location: undefined }));
        }

        setIsSearchingLocation(true);
        setStatusMessage({ type: 'info', text: `Searching for "${query}"...` });

        const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(query)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            const data = await response.json();

            if (data && data.length > 0) {
                const { lat, lon, display_name } = data[0];
                const coordinates = [parseFloat(lat), parseFloat(lon)];
                setFormData(prev => ({
                    ...prev,
                    lastSeen: coordinates,
                    // Update place name with the result for consistency, even if user typed something slightly different
                    lastSeenPlace: display_name
                }));
                setStatusMessage({ type: 'success', text: `Location found: ${display_name}` });
                setTimeout(() => setStatusMessage({ type: '', text: '' }), 3000); // Clear success message after 3s

            } else {
                setStatusMessage({ type: 'error', text: `Location "${query}" not found. Please try again or use the map.` });
                // Clear coordinates if search fails, keep the typed text
                setFormData(prev => ({ ...prev, lastSeen: null }));
            }
        } catch (error) {
            console.error("Error fetching location data:", error);
            setStatusMessage({ type: 'error', text: "Failed to search for location. Check connection or try again." });
            setFormData(prev => ({ ...prev, lastSeen: null })); // Clear coords on error
        } finally {
            setIsSearchingLocation(false);
        }
    }, [formData.lastSeenPlace, errors.location]); // Include errors.location in dependency


    // --- Form Submission ---
    const handleSubmit = (e) => {
        e.preventDefault();
        setStatusMessage({ type: '', text: '' });
        const validationErrors = {};

        // --- Validation Checks ---
        if (!formData.name.trim()) validationErrors.name = "Name is required.";
        if (!formData.age.trim()) validationErrors.age = "Age is required."; 
        if (!formData.gender.trim()) validationErrors.gender = "Gender is required.";
        if (!formData.description.trim()) validationErrors.description = "Description is required.";
        if (!formData.lastSeen) {
             validationErrors.location = "Last seen location is required.";
        }
        if (!formData.state) validationErrors.state = "State is required.";
        if (formData.state && !formData.district) validationErrors.district = "District is required.";
        if (!formData.disasterType) validationErrors.disasterType = "Disaster type is required.";
        if (!formData.contactInfo.trim()) validationErrors.contactInfo = "Contact information is required.";
        if (!formData.photo) validationErrors.photo = "Photo (JPEG) is required.";
        else if (errors.photo) validationErrors.photo = errors.photo;
        if (errors.idCard) validationErrors.idCard = errors.idCard;
        if (!captchaToken) validationErrors.captcha = "Please complete the reCAPTCHA verification.";

        setErrors(validationErrors);

        if (Object.keys(validationErrors).length > 0) {
             setStatusMessage({ type: 'error', text: 'Please fix the errors highlighted in the form.' });
            return;
        }

        // --- Submission Logic ---
        setStatusMessage({ type: 'info', text: 'Submitting report...' });
        console.log("Form Data Submitted:", formData);
        const apiFormData = new FormData();
         Object.keys(formData).forEach(key => {
            if (key === 'lastSeen' && formData[key]) {
                apiFormData.append('latitude', formData.lastSeen[0]);
                apiFormData.append('longitude', formData.lastSeen[1]);
                apiFormData.append('lastSeenPlace', formData.lastSeenPlace);
            } else if (key === 'photo' || key === 'idCard') {
                 if (formData[key]) { apiFormData.append(key, formData[key], formData[key].name); }
            } else if (formData[key] !== null && key !== 'lastSeen') {
                apiFormData.append(key, formData[key]);
            }
        });
        apiFormData.append('captchaToken', captchaToken);

        // Mock API Call
        setTimeout(() => {
            console.log("Mock API Success. Data:", Object.fromEntries(apiFormData.entries()));
            setReportedPersons([...reportedPersons, { ...formData, id: Date.now() }]);
            setStatusMessage({ type: 'success', text: 'Report submitted successfully!' });
            setErrors({});
            // Reset form
            setFormData({
                name: "", description: "", identificationMarks: "", lastSeen: null,
                lastSeenPlace: "", state: "", district: "", contactInfo: "",
                additionalInfo: "", disasterType: "", idCard: null, photo: null,
            });
            setSelectedState(""); setSelectedDistrict("");
            if (imagePreviews.photo) URL.revokeObjectURL(imagePreviews.photo);
            if (imagePreviews.idCard) URL.revokeObjectURL(imagePreviews.idCard);
            setImagePreviews({ photo: null, idCard: null });
            setCaptchaToken(null);
            setTimeout(() => setStatusMessage({ type: '', text: '' }), 5000);
        }, 1500);
    };

    return (
        <Box
            sx={{   
                    position: "absolute",top: 0, left: 0,right: 0,
                    minHeight: "100vh",background: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
                    url(${worldMapBackground})`,
                    backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", backgroundRepeat: "repeat-y", margin: 0, padding: 0, zIndex: 0, // Only needed if you have other elements with zIndex
                }}
                >
            <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 8 }, pb: 4, position: "relative" }}>
                <Typography align="center" sx={{ mt: 1, mb: 3, fontSize: { xs: "1.1rem", sm: "1.3rem", md: "1.5rem" }, fontWeight: "500"
                 }}>
                    Report a Missing Person
                </Typography>

                {statusMessage.text && (
                    <Alert severity={statusMessage.type || 'info'} sx={{ mb: 2, width: '100%', maxWidth: '800px', mx: 'auto' }}>
                        {statusMessage.text}
                    </Alert>
                )}

                <Grid container spacing={4} sx={{ display: "flex", justifyContent: "center" }}>
                    {/* Left Side - Form Component */}
                    <Grid size={{ xs: 12, md: 6 }}>
                        <MissingPersonForm
                            formData={formData}
                            setFormData={setFormData}
                            handleInputChange={handleInputChange}
                            handleFileChange={handleFileChange}
                            handleSubmit={handleSubmit}
                            errors={errors}
                            handleCaptchaVerify={handleCaptchaVerify}
                            selectedState={selectedState}
                            setSelectedState={setSelectedState}
                            selectedDistrict={selectedDistrict}
                            setSelectedDistrict={setSelectedDistrict}
                            searchMapLocation={searchMapLocation}
                            isSearchingLocation={isSearchingLocation}
                        />
                    </Grid>

                    {/* Right Side - Map and Previews Component */}
                    <Grid size={{ xs: 12, md: 6 }}>
                         <Card sx={{ p: 3, borderRadius: 3, boxShadow: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                             <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 0 }}>
                                Last Seen Location Map
                            </Typography>
                            {/* Interactive Map Component */}
                            <InteractiveMap
                                formData={formData}
                                setFormData={setFormData}
                                setError={(mapError) => setStatusMessage({ type: 'error', text: mapError })}
                                // handleInputChange prop removed
                            />

                            {/* Image Previews */}
                            {(imagePreviews.photo || imagePreviews.idCard) && (
                                <Box sx={{ mt: 2 }}>
                                    <Typography align="center" sx={{ fontSize: { xs: "1rem", sm: "1.2rem" }, fontWeight: "500", mb: 1 }}>
                                        Uploaded Images Preview
                                    </Typography>
                                    <Grid container spacing={2} justifyContent="center">
                                         {imagePreviews.photo && (
                                            <Grid item xs={12} sm={imagePreviews.idCard ? 6 : 12}>
                                                <img src={imagePreviews.photo} alt="Uploaded Photo Preview" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '200px', objectFit: 'contain' }} />
                                                <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>Photo Preview</Typography>
                                            </Grid>
                                        )}
                                        {imagePreviews.idCard && (
                                            <Grid item xs={12} sm={imagePreviews.photo ? 6 : 12}>
                                                <img src={imagePreviews.idCard} alt="Uploaded ID Card Preview" style={{ width: "100%", borderRadius: 8, border: '1px solid #eee', maxHeight: '200px', objectFit: 'contain' }} />
                                                <Typography align="center" variant="caption" display="block" sx={{ mt: 0.5 }}>ID Card Preview</Typography>
                                            </Grid>
                                        )}
                                    </Grid>
                                </Box>
                            )}
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

export default MissingPersonPortal;
