//React
import React, { useState, useEffect } from "react";

// MUI Components
import {
  Typography,
  Box,
  Grid,
  Button,
  Modal,
  TextField,
  IconButton,
  TextareaAutosize as Textarea, // Already present, good. Using MUI's TextareaAutosize might be an option too.
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// router hooks
import { useNavigate } from "react-router-dom";
// import { useParams } from "react-router-dom"; // Not used in the provided Profile component
// import { useLocation } from "react-router-dom"; // Not used in the provided Profile component

// Icons
import {
  Person,
  CalendarToday,
  LocationOn,
  Visibility,
  Phone,
  Edit,
} from "@mui/icons-material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LanguageIcon from "@mui/icons-material/Language";
import CloseIcon from "@mui/icons-material/Close";
import Carousel from "react-multi-carousel";
import "react-multi-carousel/lib/styles.css";

// Axios for API calls
import axios from "axios";

// Styles & Assets
import worldMapBackground from "/assets/background_image/world-map-background.jpg"; // Ensure this path is correct
import ImageUpload from "../../../../components/ImageUpload"; // Ensure this path is correct

const UpdateModal = ({ open, handleClose, mode, initialData = {}, userId, fetchAgencyDetails, setStatusMessage }) => {
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  // const [isLoading, setIsLoading] = useState(false); // isLoading was declared but not used here. Removed for clarity.

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (mode === 'images' && initialData.images) { // Specifically for images mode
        setExistingImages(initialData.images);
        setNewImages([]); // Reset new images when modal opens for images
      } else {
        setExistingImages([]); // Clear existing images for other modes
      }
    } else { // If initialData is undefined/null, reset form
      setFormData({});
      setExistingImages([]);
      setNewImages([]);
    }
  }, [initialData, mode, open]); // Added `open` to dependencies to re-initialize when modal re-opens


  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRemoveExistingImage = async (index) => {
    const imgToDelete = existingImages[index];
    const imageId = typeof imgToDelete === 'object' && imgToDelete !== null ? imgToDelete.id : imgToDelete;

    if (!imageId) {
      console.error('Image is missing for deletion.');
      setStatusMessage({ type: "error", text: "Failed: Image missing." });
      return;
    }

    try {
      // Optimistically remove from UI first
      const updatedImages = existingImages.filter((_, i) => i !== index);
      setExistingImages(updatedImages);
      await axios.delete(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-images/${imageId}/`,
        { withCredentials: true }
      );

      console.log("Image deleted successfully");

      setStatusMessage({ type: "success", text: "Image removed successfully." });
    } catch (error) {
      console.error('Failed to delete image:', error.response?.data || error);
      setStatusMessage({ type: "error", text: error.response?.data?.detail || "Failed to delete image." });

      setExistingImages((prev) => {
        const rollbackImages = [...prev];
        rollbackImages.splice(index, 0, imgToDelete); // Reinsert the removed image
        return rollbackImages;
      });
    }
  };

  const handleSubmit = async (e) => { // Removed 'id' from params as 'userId' is already a prop
    e.preventDefault();
    console.log("Submitting for mode:", mode, "Data:", formData, "New Images:", newImages);

    if (!userId) {
      console.error("User ID is missing for update.");
      setStatusMessage({ type: "error", text: "User ID missing. Cannot update." });
      return;
    }

    setIsUpdating(true);
    const submissionData = new FormData();

    if (mode === "description") {
      submissionData.append("description", formData.description || "");
    } else if (mode === "basicDetails") {
      submissionData.append("contact1", formData.contact1 || "");
      submissionData.append("contact2", formData.contact2 || ""); // Allow empty if not provided
      submissionData.append("website", formData.website || "");   // Allow empty
      submissionData.append("address", formData.address || "");
    } else if (mode === 'images') {
      newImages.forEach((file) => submissionData.append('images', file));
      if (newImages.length === 0) {
        console.log("No new images to upload for user:", userId);
        fetchAgencyDetails(userId); // Refresh details
        handleClose();
        setIsUpdating(false);
        return;
      }
    }

    try {
      const response = await axios.patch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${userId}/`,
        submissionData,
        { withCredentials: true }
      );

      console.log("Updation Success:", response.data);
      setFormData({}); // Clear form in modal
      setNewImages([]); // Clear new images
      if (fetchAgencyDetails) {
        fetchAgencyDetails(userId); // Refresh data in Profile component
      }
      handleClose(); // Close modal

      // Set status message in Profile component immediately
      let successText = "Information updated successfully.";
      if (mode === "basicDetails") {
        successText = "Basic details updated.";
      } else if (mode === "description") {
        successText = "Description updated.";
      } else if (mode === "images" && newImages.length > 0) { 
        successText = "Images updated successfully.";
      }
      setStatusMessage({ type: "success", text: successText });

    } catch (error) {
      console.error("Updation Failed:", error.response?.data || error);
      setStatusMessage({ type: "error", text: error.response?.data?.detail || `Failed to update ${mode}.` });
    } finally {
      setIsUpdating(false);
    }
  };

  const renderFields = () => {
    if (mode === "basicDetails") {
      return (
        <>
          <TextField
            fullWidth
            label="Address"
            variant="standard"
            name="address"
            value={formData.address || ""}
            onChange={handleChange}
            sx={{ my: 1 }}
          />
          <TextField
            fullWidth
            label="Contact 1"
            variant="standard"
            name="contact1"
            value={formData.contact1 || ""}
            onChange={handleChange}
            sx={{ my: 1 }}
          />
          <TextField
            fullWidth
            label="Contact 2 (Optional)"
            variant="standard"
            name="contact2"
            value={formData.contact2 || ""}
            onChange={handleChange}
            sx={{ my: 1 }}
          />
          <TextField
            fullWidth
            label="Website (Optional)"
            variant="standard"
            name="website"
            value={formData.website || ""}
            onChange={handleChange}
            sx={{ my: 1 }}
          />
        </>
      );
    } else if (mode === "description") {
      return (
        <>
          <Textarea // Using the imported TextareaAutosize as Textarea
            name="description"
            value={formData.description || ""}
            onChange={handleChange}
            placeholder="Enter agency description..."
            minRows={1} // MUI TextareaAutosize uses minRows
            style={{ // Retaining your style for consistency
              width: "100%", // Changed to 100% for better fit in modal
              minHeight: "300px", // Adjusted for modal view
              resize: "vertical",
              padding: "8px 12px",
              fontSize: "1.0rem",
              lineHeight: 1.5,
              borderRadius: "8px",
              border: "1px solid #ccc",
              fontFamily: "inherit",
              color: "#1C2025",
              backgroundColor: "#fff",
              outline: "none",
              boxSizing: 'border-box', // Ensure padding and border are inside width
            }}
          />
        </>
      );
    } else if (mode === "images") {
      return (
        <>
          {existingImages.length > 0 && (
            <Typography variant="subtitle1" gutterBottom>Existing Images:</Typography>
          )}
          <Grid container spacing={2} sx={{ width: "100%", mb: 2 }}>
            {existingImages.map((img, index) => {
              // Assuming img can be a string (URL part) or an object {id: ..., image: ...}
              const imgSrc = typeof img === 'object' && img !== null ? img.image : img;
              return (
                <Grid item xs={6} sm={4} key={img.id || index}> {/* Use a stable key like img.id if available */}
                  <Box sx={{ position: "relative", textAlign: 'center' }}>
                    <img
                      src={`https://res.cloudinary.com/doxgltggk/${imgSrc}`}
                      alt={`img-${index}`}
                      style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <Button
                      variant="contained"
                      size="small"
                      color="error"
                      onClick={() => {
                        if (window.confirm("Are you sure you want to remove this image?")) {
                          handleRemoveExistingImage(index);
                        }
                      }}
                      sx={{ mt: 1, width: "100px", fontSize: '0.7rem', p: '2px 4px' }}
                    >
                      Remove
                    </Button>
                  </Box>
                </Grid>
              );
            })}
          </Grid>
          <Typography variant="subtitle1" gutterBottom sx={{ mt: existingImages.length > 0 ? 2 : 0 }}>Add New Images:</Typography>
          <ImageUpload images={newImages} setImages={setNewImages} />
        </>
      );
    }
    return null;
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "90%", sm: mode === 'description' ? 600 : 450, md: mode === 'description' ? 800 : 500 }, // Wider for description
          maxHeight: "90vh",
          overflowY: "auto",
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          aria-label="close"
          sx={{ position: "absolute", top: 10, right: 10, zIndex: 1 }} // Ensure close button is on top
        >
          <CloseIcon />
        </IconButton>

        <Typography variant="h5" gutterBottom sx={{ textAlign: "center", mb: 2 }}>
          {{
            basicDetails: "Update Basic Details",
            description: "Update Description",
            images: "Update Gallery Images",
          }[mode] || "Update Information"}
        </Typography>

        <form onSubmit={handleSubmit}> {/* Pass userId to handleSubmit if it was intended */}
          {renderFields()}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            {isUpdating ? (
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={24} sx={{ color: "primary.main" }} />
                <Typography variant="body2">
                  Updating...
                </Typography>
              </Box>
            ) : (
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "primary.main", // Consistent theme color
                  color: "primary.contrastText",
                  boxShadow: 3,
                  borderRadius: "20px",
                  px: 4,
                  py: 1,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  "&:hover": {
                    backgroundColor: "primary.dark",
                  },
                }}
              >
                Update
              </Button>
            )}
          </Box>
        </form>
      </Box>
    </Modal>
  );
};

function Profile() {
  const [user, setUser] = useState(null);
  // const [isLogin, setIsLogin] = useState(false); // isLogin not directly used for conditional rendering after initial check.
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [agency, setAgency] = useState(null);
  const [editMode, setEditMode] = useState("");
  const [initialData, setInitialData] = useState({});
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  // const [type, setType] = useState("about"); // 'type' state for tab/section selection not implemented in provided JSX. Removed for now.
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });

  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md")); // Adjusted to 'md' for wider tablet applicability
  const navigate = useNavigate();

  useEffect(() => {
    if (statusMessage.text) {
      console.log("Status message set:", statusMessage); // Log when message appears
      const timer = setTimeout(() => {
        console.log("Clearing status message via timer:", statusMessage);
        setStatusMessage({ type: "", text: "" });
      }, 5000);
      return () => {
        console.log("useEffect cleanup: Clearing timer for status message:", statusMessage);
        clearTimeout(timer);
      };
    }
  }, [statusMessage]);


  const handleOpenBasicDetails = () => {
    setInitialData({
      address: agency?.address || "",
      contact1: agency?.contact1 || "",
      contact2: agency?.contact2 || "",
      website: agency?.website || "",
    });
    setEditMode("basicDetails");
    setOpen(true);
  };

  const handleOpenDescription = () => {
    setInitialData({
      description: agency?.description || "",
    });
    setEditMode("description");
    setOpen(true);
  };

  const handleOpenImages = () => {
    setInitialData({
      images: agency?.images || [], // Pass existing images to the modal
    });
    setEditMode("images");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    // Optionally reset initialData if it's large and not needed
    // setInitialData({});
  };

  const fetchAgencyDetails = async (currentUserId) => {
    if (!currentUserId) return; // Don't fetch if no userId
    setIsLoading(true);
    // console.log(`Workspaceing agency details for user ID: ${currentUserId}`);
    try {
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${currentUserId}/`
      );
      if (!response.ok) {
        // If response is not OK (e.g. 404), treat as no agency or error
        if (response.status === 404) {
          console.warn("Agency profile not found for user:", currentUserId);
          setAgency({ agency_name: null }); // Explicitly set to indicate "not found" state for rendering logic
        } else {
          throw new Error(`Failed to fetch agency details: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setAgency(data);
      }
    } catch (error) {
      console.error("Error fetching agency details:", error);
      // Optionally set an error status message for the user here
      // setStatusMessage({ type: "error", text: "Could not load agency details." });
      setAgency({ agency_name: null }); // Fallback to a state indicating no agency or error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      // setIsLogin(true);
      setUserId(parsedUser.user_id); // Set userId state
      fetchAgencyDetails(parsedUser.user_id); // Fetch details using the id
    } else {
      // Handle not logged in: redirect or show message
      setIsLoading(false); // Not loading if no user
      // navigate("/login"); // Example redirect
    }
  }, [navigate]); // Added navigate to dependencies of useEffect


  // Loading state
  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Loading profile...</Typography>
      </Box>
    );
  }

  // No user identified (e.g. not logged in, or userId not set)
  if (!userId && !agency) { // If no userId and still no agency data (e.g. initial load failed before user parse)
    return (
      <Box sx={{ textAlign: 'center', mt: 5, p: 3 }}>
        <Typography variant="h5">User information not available.</Typography>
        <Button variant="contained" onClick={() => navigate("/login")} sx={{ mt: 2 }}>Go to Login</Button>
      </Box>
    );
  }

  // User identified, but no agency profile found for them
  if (agency && !agency.agency_name) {
    return (
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#f0f2f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          p: 2, // Padding for smaller screens
        }}
      >
        {/* Display status message if any (e.g. error from fetch) */}
        {statusMessage.text && (
          <Alert
            severity={statusMessage.type || "info"}
            sx={{ mt: 0, mb: 3, width: 'auto', minWidth: '300px', maxWidth: '90%' }}
            onClose={() => setStatusMessage({ type: "", text: "" })}
          >
            {statusMessage.text}
          </Alert>
        )}
        <Typography variant="h4" sx={{ textAlign: "center", mt: statusMessage.text ? 0 : 5, fontSize: { xs: "1.5rem", sm: "2rem" } }}>
          No Agency Profile Found
        </Typography>
        <Typography variant="body1" sx={{ mt: 1, mb: 3, color: 'text.secondary' }}>
          It seems you haven't created an agency profile yet.
        </Typography>
        <Button
          variant="contained" // Changed to contained for better visibility
          color="primary"
          size="large"
          sx={{
            textTransform: "none",
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
            borderRadius: "20px",
            px: { xs: 3, sm: 4 },
            py: { xs: 1, sm: 1.5 },
            fontSize: { xs: "0.9rem", sm: "1rem" },
          }}
          onClick={() => navigate("/registration-form")}
        >
          Create Agency Profile
        </Button>
      </Box>
    );
  }

  // Agency profile exists, render main profile view
  if (agency && agency.agency_name) { // Ensure agency is not null and has a name
    const profileImageSrc = agency.images?.[1]?.image // Use second image for profile card as per original logic
      ? `https://res.cloudinary.com/doxgltggk/${agency.images[1].image}`
      : "/assets/logo_image.webp"; // Fallback
    const bannerImageSrc = agency.images?.[0]?.image
      ? `https://res.cloudinary.com/doxgltggk/${agency.images[0].image}`
      : worldMapBackground; // Fallback to world map if no first image


    return (
      <Box
        sx={{
          width: "100%",
          backgroundColor: "#f0f2f5", // Light grey background for the whole page
          pb: { xs: 2, md: 8 }, // Bottom padding
        }}
      >
        {/* Status Message Alert - This is the crucial part */}
        {statusMessage.text && (
          <Alert
            severity={statusMessage.type || "info"} // Default to info if type is missing
            sx={{
              position: 'fixed', // Fixed position to ensure visibility
              top: theme.spacing(2), // Spacing from top (Material UI theme spacing)
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 1500, // High zIndex to be on top of other elements
              minWidth: 300, // Minimum width
              maxWidth: '90%', // Max width relative to viewport
              boxShadow: theme.shadows[6],
            }}
            onClose={() => setStatusMessage({ type: "", text: "" })}
          >
            {statusMessage.text}
          </Alert>
        )}
        {/* Banner */}
        <Box
          sx={{
            width: "100%",
            // Removed minWidth for simplicity, maxWidth on inner content is better
            height: { xs: 180, sm: 220, md: 250 }, // Responsive height
            backgroundImage: `url(${bannerImageSrc})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            position: "relative", // For potential overlays if needed, but not strictly zIndex here
            mt: { xs: 1, sm: -2, md: 2, lg: 3 }, // Negative margin to pull it up a bit on larger screens
          }}
        />
        <Box // This Box now serves as the main content area with the world map background
          sx={{
            position: "relative",
            width: "100%",
            minHeight: "100vh", // Ensure it takes at least full viewport height
            background: `
              linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), 
              url(${worldMapBackground})
            `, // Slightly more opaque gradient
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed", // Keeps background stationary on scroll
            backgroundRepeat: "no-repeat", // No repeat should be fine for cover
            pt: 5, // Padding top to space content from banner
          }}
        >
          {/* Profile Card */}
          <Box
            sx={{
              width: "100%",
              maxWidth: { xs: "90%", sm: "85%", md: "80%", lg: "1000px" },
              mx: "auto",
              mt: { xs: -8, sm: -10, md: -12 },
              backgroundColor: "white",
              borderRadius: 3,
              boxShadow: theme.shadows[5],
              position: "relative",
              zIndex: 10,
            }}
          >
            <Grid
              container
              spacing={{ xs: 2, md: 4 }}
              sx={{
                flexDirection: { xs: "column", md: "row" },
                alignItems: { md: "center" },
                justifyContent: { md: "space-between" },
              }}
            >
              {/* Profile Section */}
              <Grid
                item
                xs={12}
                md={4}
                sx={{
                  textAlign: { xs: "center", md: "center" },
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Typography
                  variant="h4"
                  component="h1"
                  sx={{
                    fontWeight: 600,
                    mb: 2,
                    color: "text.primary",
                    textTransform: "uppercase",
                    letterSpacing: 1.5,
                    fontSize: { xs: "1.3rem", sm: "1.5rem", md: "1.75rem" },
                    textShadow: "1px 1px 2px rgba(0,0,0,0.1)",
                  }}
                >
                  {agency.agency_name}
                </Typography>
                <Box
                  component="img"
                  src={profileImageSrc}
                  alt={`${agency.agency_name} Profile`}
                  sx={{
                    width: { xs: 120, sm: 150, md: 180 },
                    height: { xs: 120, sm: 150, md: 180 },
                    borderRadius: "50%",
                    border: `3px solid ${theme.palette.grey[300]}`,
                    objectFit: "cover",
                    mb: 2,
                    boxShadow: theme.shadows[3],
                  }}
                />
              </Grid>

              {/* Info Section */}
              <Grid
                item
                xs={12}
                md={8}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: { xs: 1, md: 1.5 },
                  alignItems: "flex-start",
                  textAlign: "left",
                  m: { xs: 2, md: 0 },
                  mt: { xs: 2, md: 8, lg: 5 },
                }}
              >
                {[
                  { label: "Name", value: agency.agency_name, icon: <Person fontSize="small" /> },
                  {
                    label: "Founded",
                    value: agency.date_of_establishment
                      ? new Date(agency.date_of_establishment).toLocaleDateString()
                      : "N/A",
                    icon: <CalendarToday fontSize="small" />,
                  },
                  {
                    label: "Address",
                    value:
                      `${agency.address || ''}, ${agency.district || ''}, ${agency.state || ''}`
                        .replace(/, ,/g, ',')
                        .replace(/^,|,$/g, '') || "N/A",
                    icon: <LocationOn fontSize="small" />,
                  },
                  {
                    label: "Contact",
                    value: agency.contact2
                      ? `${agency.contact1}, ${agency.contact2}`
                      : agency.contact1 || "N/A",
                    icon: <Phone fontSize="small" />,
                  },
                  {
                    label: "Website",
                    value: agency.website || "No website available",
                    icon: <LanguageIcon fontSize="small" />,
                    link: agency.website,
                  },
                  { label: "Volunteers", value: agency.volunteers || "N/A", icon: <Visibility fontSize="small" /> },
                ].map((item, index) => (
                  <Box
                    key={index}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mb: 0.5,
                      flexWrap: "wrap",
                      justifyContent: { xs: "center", md: "flex-start" },
                    }}
                  >
                    <Box sx={{ mr: 1.5, color: "primary.main" }}>{item.icon}</Box>
                    <Typography
                      sx={{
                        fontWeight: 600,
                        minWidth: { xs: 80, sm: 100 },
                        fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                      }}
                    >
                      {item.label}:
                    </Typography>
                    {item.link ? (
                      <Typography
                        component="a"
                        href={item.link.startsWith("http") ? item.link : `http://${item.link}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{
                          ml: 1,
                          color: "primary.main",
                          wordBreak: "break-word",
                          fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                          textDecoration: "none",
                          "&:hover": { textDecoration: "underline" },
                        }}
                      >
                        {item.value}
                      </Typography>
                    ) : (
                      <Typography
                        sx={{
                          ml: 1,
                          color: "text.secondary",
                          wordBreak: "break-word",
                          fontSize: { xs: "0.85rem", sm: "0.9rem", md: "1rem" },
                        }}
                      >
                        {item.value}
                      </Typography>
                    )}
                  </Box>
                ))}

              </Grid>

              {/* Edit Button */}
              <Grid item xs={12} sx={{ textAlign: { xs: "center", md: "right" }, p: 2 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  onClick={handleOpenBasicDetails}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "primary.main",
                    borderColor: "primary.main",
                    "&:hover": {
                      backgroundColor: theme.palette.primary.main,
                      color: theme.palette.primary.contrastText,
                      borderColor: theme.palette.primary.main,
                    },
                  }}
                >
                  Edit Details
                </Button>
              </Grid>
            </Grid>
          </Box>

          {/* Sections: About Us & Gallery */}
          {["description", "images"].map((sectionName) => {
            const sectionTitle = sectionName === "description" ? "ABOUT US" : "GALLERY";
            const sectionContent = sectionName === "description"
              ? <Typography sx={{ color: "text.secondary", whiteSpace: "pre-line", fontSize: { xs: "0.9rem", md: "1rem" }, p: 2, textAlign: isMobileOrTablet ? 'center' : 'left' }}>{agency.description || "No description available."}</Typography>
              : (
                <Box sx={{ my: 2, p: { xs: 1, sm: 0 } }}> {/* Added padding for mobile carousel */}
                  {agency.images && agency.images.length > 0 ? (
                    <Carousel
                      responsive={{
                        desktop: { breakpoint: { max: 3000, min: 1024 }, items: Math.min(agency.images.length, isMobileOrTablet ? 1 : 3), slidesToSlide: 1 }, // Show 3 or less on desktop
                        tablet: { breakpoint: { max: 1024, min: 600 }, items: Math.min(agency.images.length, 2), slidesToSlide: 1 },
                        mobile: { breakpoint: { max: 600, min: 0 }, items: 1, slidesToSlide: 1 },
                      }}
                      ssr={true}
                      infinite={agency.images.length > (isMobileOrTablet ? 1 : 3)} // Only infinite if enough items
                      autoPlay={agency.images.length > 1 ? true : false}
                      autoPlaySpeed={3000}
                      arrows={true}
                      centerMode={isMobileOrTablet && agency.images.length > 1} // Center mode for mobile if multiple images
                    >
                      {agency.images.map((imgObj, index) => (
                        <Box
                          key={imgObj.id || index} // Use stable ID
                          sx={{
                            padding: { xs: '0 8px', sm: '0 10px', md: '0 12px' }, // Horizontal padding for spacing between items
                            display: "flex", justifyContent: "center", alignItems: "center",
                          }}
                        >
                          <Box
                            component="img"
                            src={`https://res.cloudinary.com/doxgltggk/${imgObj.image}`}
                            alt={`Agency Image ${index + 1}`}
                            sx={{
                              width: "100%", // Make image responsive within its container
                              height: { xs: 200, sm: 220, md: 250 },
                              objectFit: "cover", // Cover to maintain aspect ratio
                              borderRadius: 2,
                              border: `1px solid ${theme.palette.grey[300]}`,
                              boxShadow: theme.shadows[2],
                              transition: "transform 0.3s ease-in-out",
                              "&:hover": { transform: "scale(1.03)" },
                            }}
                          />
                        </Box>
                      ))}
                    </Carousel>
                  ) : <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No images in the gallery yet.</Typography>}
                </Box>
              );
            const handleOpenAction = sectionName === "description" ? handleOpenDescription : handleOpenImages;

            return (
              <Grid item xs={12} key={sectionName} sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                <Box sx={{ width: "100%", maxWidth: { xs: "90%", sm: "85%", md: "80%", lg: "1000px" }, mx: "auto" }}>
                  {isMobileOrTablet ? (
                    <Accordion
                      sx={{ width: "100%", boxShadow: theme.shadows[2], '&:before': { display: 'none' }, '&.Mui-expanded': { mt: 1, mb: 1, boxShadow: theme.shadows[4] }, backgroundColor: 'white' }}
                    >
                      <AccordionSummary expandIcon={<ExpandMoreIcon />} sx={{ minHeight: "48px !important", '&.Mui-expanded': { minHeight: "48px !important" }, '& .MuiAccordionSummary-content': { margin: "12px 0", justifyContent: "space-between", alignItems: 'center' } }}>
                        <Typography sx={{ fontWeight: "bold", fontSize: "1.1rem", textAlign: "left" }}>{sectionTitle}</Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0, backgroundColor: "white" }}>
                        {sectionContent}
                        <Grid item xs={12} sx={{ textAlign: "right", p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                          <Button variant="outlined" size="small" startIcon={<Edit />} onClick={handleOpenAction} sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", borderColor: "primary.main", '&:hover': { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText } }}>Edit {sectionName}</Button>
                        </Grid>
                      </AccordionDetails>
                    </Accordion>
                  ) : (
                    <Box sx={{ p: { xs: 2, md: 3 }, backgroundColor: "white", borderRadius: 3, boxShadow: theme.shadows[3], mt: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb={sectionName === "images" ? 0 : 2}>
                        <Typography variant="h5" component="h2" sx={{ fontWeight: 500, color: "text.primary" }}>{sectionTitle}</Typography>
                        <Button variant="outlined" size="small" startIcon={<Edit />} onClick={handleOpenAction} sx={{ textTransform: "none", fontWeight: 600, color: "primary.main", borderColor: "primary.main", '&:hover': { backgroundColor: theme.palette.primary.main, color: theme.palette.primary.contrastText } }}>Edit {sectionName}</Button>
                      </Box>
                      {sectionContent}
                    </Box>
                  )}
                </Box>
              </Grid>
            );
          })}

          <UpdateModal
            open={open}
            handleClose={handleClose}
            mode={editMode}
            initialData={initialData}
            userId={userId} // Pass the userId state
            fetchAgencyDetails={fetchAgencyDetails}
            setStatusMessage={setStatusMessage}
          />
        </Box>
      </Box>
    );
  }

  // Fallback if agency is null for some reason after loading and not fitting other conditions
  // This case should ideally be covered by isLoading or !agency.agency_name check
  return (
    <Box sx={{ textAlign: 'center', mt: 5 }}>
      <Typography>Profile data is currently unavailable.</Typography>
    </Box>
  );
}

export default Profile;