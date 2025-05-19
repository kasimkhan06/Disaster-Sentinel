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
  TextareaAutosize as Textarea,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

// router hooks
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";

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
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import ImageUpload from "../../../../components/ImageUpload";

const UpdateModal = ({ open, handleClose, mode, initialData = {}, userId, fetchAgencyDetails }) => {
  const [formData, setFormData] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);

  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.images) {
        setExistingImages(initialData.images);
      }
    }
  }, [initialData]);

  
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRemoveExistingImage = async (index) => {
    const imgToDelete = existingImages[index];
    const imageId = imgToDelete.id || imgToDelete;
    try {
      await axios.delete(`https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-images/${imageId}/`, { withCredentials: true });
      setExistingImages((prev) => prev.filter((_, i) => i !== index));
      console.log("Image deleted successfully");
      fetchAgencyDetails(userId);
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  };

  const handleSubmit = async (e, id) => {
    e.preventDefault();
    console.log("Submitting:", formData);

    try {
      setIsUpdating(true);

      const Data = new FormData();
      if (mode === "description") {
        Data.append("description", formData.description);
      } else if (mode === "basicDetails") {
        Data.append("contact1", formData.contact1);
        Data.append("contact2", formData.contact2);
        Data.append("website", formData.website);
        Data.append("address", formData.address);
      }else if (mode === 'images') {
        newImages.forEach((file) => Data.append('images', file));
      }

      const response = await axios.patch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${id}/`,
        Data,
        { withCredentials: true }
      );

      console.log("Updation Success:", response.data);
      setFormData({});
      fetchAgencyDetails(id);
      handleClose();
    } catch (error) {
      console.error("Updation Failed:", error.response?.data || error);
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
            label="Contact 2"
            variant="standard"
            name="contact2"
            value={formData.contact2 || ""}
            onChange={handleChange}
            sx={{ my: 1 }}
          />
          <TextField
            fullWidth
            label="Website"
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
        <textarea
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          style={{
            width: "80%",
            minHeight: "500px",
            resize: "none",
            padding: "8px 12px",
            fontSize: "1.0rem",
            lineHeight: 1.5,
            borderRadius: "8px",
            border: "1px solid #ccc",
            fontFamily: "inherit",
            color: "#1C2025",
            backgroundColor: "#fff",
            outline: "none",
          }}
        />
      );
    } else if (mode === 'images') {
      return (
        <>
          <Grid container spacing={2} sx={{ width: { xs: "100%", sm: "80%" }, mb: 2 }}>
            {existingImages.map((img, index) => (
              <Grid item xs={4} key={index}>
                <img src={`https://res.cloudinary.com/doxgltggk/${img.image}`} alt={`img-${index}`} style={{ width: '100%' }} />
                <Button onClick={() => handleRemoveExistingImage(index)}>Remove</Button>
              </Grid>
            ))}
          </Grid>
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
          width: { xs: "90%", sm: 400 },
          bgcolor: "background.paper",
          boxShadow: 24,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
        }}
      >
        <IconButton
          onClick={handleClose}
          sx={{ position: "absolute", top: 10, right: 10 }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h5" gutterBottom sx={{ textAlign: "center" }}>
          {mode === "basicDetails"
            ? "Update Basic Details"
            : mode === "description"
              ? "Update Description"
              : mode === "images"
                ? "Update Images"
                : ""}
        </Typography>
        <form onSubmit={(e) => handleSubmit(e, userId)}>
          {renderFields()}
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
                sx={{
                  backgroundColor: "#fff",
                  color: "#000",
                  boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  borderRadius: "20px",
                  px: 4,
                  py: 1,
                  fontSize: { xs: "0.8rem", sm: "0.9rem" },
                  "&:hover": {
                    backgroundColor: "#f0f0f0",
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
  const [isLogin, setIsLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [agency, setAgency] = useState(null);
  const [editMode, setEditMode] = useState("");
  const [initialData, setInitialData] = useState({});
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [type, setType] = useState("about");
  const theme = useTheme();
  const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();


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
      images: agency?.images || [],
    });
    setEditMode("images");
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLogin(true);
      fetchAgencyDetails(parsedUser.user_id);
      setUserId(parsedUser.user_id);
    }
  }, []);

  const fetchAgencyDetails = async (userId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${userId}/`
      );
      const data = await response.json();
      setAgency(data);
    } catch (error) {
      console.error("Error fetching agency details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !agency) return <Typography>Loading...</Typography>;

  return (
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#f0f2f5",
        pb: { xs: 2, md: 8 },
      }}
    >
      {/* Banner */}
      <Box
        sx={{
          width: "100%",
          height: { xs: 180, md: 260 },
          backgroundImage: `url(https://res.cloudinary.com/doxgltggk/${agency.images?.[0]?.image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          position: "relative",
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: "relative",
          width: "100%",
          minHeight: "100vh",
          background: `
            linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)),
            url(${worldMapBackground})
          `,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundAttachment: "fixed",
          backgroundRepeat: "repeat-y",
        }}
      >
        {/* Profile Card */}
        <Box
          sx={{
            maxWidth: { xs: "85%", md: "85%", lg: "1000px" },
            mx: "auto",
            mt: { xs: -3, md: -5 },
            p: { xs: 2, md: 3, lg: 5 },
            backgroundColor: "white",
            borderRadius: 3,
            boxShadow: 3,
            zIndex: 1,
            position: "relative",
          }}
        >
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 500,
                  mb: 2,
                  textAlign: "center",
                  color: "black",
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  fontSize: { xs: "1.2rem", md: "1.5rem" },
                  textShadow: "1px 1px 2px rgba(0, 0, 0, 0.2)",
                }}
              >
                {agency.agency_name}
              </Typography>
              <Box
                component="img"
                src={agency.images?.[0]?.image ? `https://res.cloudinary.com/doxgltggk/${agency.images[1].image}` : "/assets/logo_image.webp"}
                alt="Profile"
                sx={{
                  width: { xs: 120, md: 180 },
                  height: { xs: 120, md: 180 },
                  borderRadius: "10px",
                  border: "2px solid #ccc",
                  objectFit: "cover",
                  mb: 2,
                  boxShadow: 1,
                }}
              />
            </Grid>
            <Grid item xs={12} md={8} sx={{ display: "flex", flexDirection: "column", gap: { xs: 2, md: 5 }, textAlign: "left", alignItems: "center", justifyContent: "center" }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {[
                  {
                    label: "Name",
                    value: agency.agency_name,
                    icon: <Person fontSize="small" />
                  },
                  {
                    label: "Founded",
                    value: agency.date_of_establishment,
                    icon: <CalendarToday fontSize="small" />
                  },
                  {
                    label: "Address",
                    value: `${agency.address}, ${agency.district}, ${agency.state}`,
                    icon: <LocationOn fontSize="small" />
                  },
                  {
                    label: "Contact",
                    value: agency.contact2
                      ? `${agency.contact1}, ${agency.contact2}`
                      : agency.contact1,
                    icon: <Phone fontSize="small" />
                  },
                  {
                    label: "Website",
                    value: agency.website
                      ? agency.website
                      : "No website available",
                    icon: <LanguageIcon fontSize="small" />
                  },
                  {
                    label: "Volunteers",
                    value: agency.volunteers,
                    icon: <Visibility fontSize="small" />
                  },
                ].map((item, index) => (
                  <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    {item.icon}
                    <Typography sx={{ ml: 1, fontWeight: 600, minWidth: 100, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                      {item.label}:
                    </Typography>
                    <Typography sx={{ ml: 1, color: "text.secondary", wordBreak: "break-word", fontSize: { xs: "0.8rem", md: "1rem" } }}>
                      {item.value}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} sx={{ textAlign: "center", display: "flex", justifyContent: "end", p: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "center" }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "green",
                    borderColor: "#388e3c",
                    "&:hover": {
                      backgroundColor: "black",
                      borderColor: "black",
                      color: "white",
                    }
                  }}
                  onClick={handleOpenBasicDetails}
                >
                  Edit
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Box>

        {/* Description Section */}
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          {isMobileOrTablet ? (
            <Box sx={{ width: "100%", maxWidth: { xs: "90%", md: "85%", lg: "1000px" }, mx: "auto", mt: 2 }}>
              <Accordion
                sx={{
                  width: "100%",
                  boxShadow: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.67)",
                  transition: "margin 0.3s ease",
                  "&.Mui-expanded": {
                    mt: 1,  // Add top margin when expanded
                  },
                  "&:before": {
                    display: "none",  // Remove default underline
                  },
                  "&:hover": {
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    minHeight: "48px !important",
                    "&.Mui-expanded": {
                      minHeight: "48px !important",
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: "12px 0",
                      justifyContent: "center",
                      "&.Mui-expanded": {
                        margin: "12px auto",
                      },
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", fontSize: "1rem", textAlign: "center" }}>
                    ABOUT US
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    p: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "rgb(255, 255, 255)",
                    minHeight: "60px",  // Maintain height when expanded
                  }}
                >
                  <Typography
                    sx={{
                      color: "text.secondary",
                      whiteSpace: "pre-line",
                      fontSize: { xs: "0.8rem", md: "1rem" },
                      textAlign: "center",
                      p: 2,
                    }}
                  >
                    {agency.description || "No description available."}
                  </Typography>
                  <Grid
                    item
                    xs={12}
                    sx={{ textAlign: "center", display: "flex", justifyContent: "end", p: 2 }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "green",
                        borderColor: "#388e3c",
                        "&:hover": {
                          backgroundColor: "black",
                          borderColor: "black",
                          color: "white",
                        },
                      }}
                      onClick={handleOpenDescription}
                    >
                      Edit
                    </Button>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Box
              sx={{
                maxWidth: { xs: "85%", md: "85%", lg: "1000px" },
                mx: "auto",
                p: { xs: 2, md: 3, lg: 5 },
                backgroundColor: "white",
                borderRadius: 3,
                boxShadow: 3,
                mt: 2,
              }}
            >
              <Typography
                sx={{
                  color: "text.secondary",
                  whiteSpace: "pre-line",
                  fontSize: { xs: "0.8rem", md: "1rem" },
                }}
              >
                {agency.description || "No description available."}
              </Typography>
              <Grid
                item
                xs={12}
                sx={{ textAlign: "center", display: "flex", justifyContent: "end", p: 2 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "green",
                    borderColor: "#388e3c",
                    "&:hover": {
                      backgroundColor: "black",
                      borderColor: "black",
                      color: "white",
                    },
                  }}
                  onClick={handleOpenDescription}
                >
                  Edit
                </Button>
              </Grid>
            </Box>
          )}
        </Grid>

        {/* Images Section */}
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center" }}>
          {isMobileOrTablet ? (
            <Box sx={{ width: "100%", maxWidth: { xs: "90%", md: "85%", lg: "1000px" }, mx: "auto", mt: 2 }}>
              <Accordion
                sx={{
                  width: "100%",
                  boxShadow: "none",
                  backgroundColor: "rgba(255, 255, 255, 0.67)",
                  transition: "margin 0.3s ease",
                  "&.Mui-expanded": {
                    mt: 1,  // Maintain top spacing when expanded
                  },
                  "&:before": {
                    display: "none",  // Remove default underline
                  },
                  "&:hover": {
                    boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    backgroundColor: "rgb(255, 255, 255)",
                    minHeight: "48px !important",
                    "&.Mui-expanded": {
                      minHeight: "48px !important",
                    },
                    "& .MuiAccordionSummary-content": {
                      margin: "12px 0",
                      justifyContent: "center",
                      "&.Mui-expanded": {
                        margin: "12px auto",
                      },
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: "bold", fontSize: "1rem", textAlign: "center" }}>
                    GALLERY
                  </Typography>
                </AccordionSummary>
                <AccordionDetails
                  sx={{
                    p: 0,
                    width: "100%",
                    boxSizing: "border-box",
                    backgroundColor: "rgb(255, 255, 255)",
                    minHeight: "60px",  // Maintain height when expanded
                  }}
                >
                  <Box sx={{ my: 2 }}>
                    <Carousel
                      responsive={{
                        mobile: { breakpoint: { max: 600, min: 0 }, items: 1 },
                      }}
                      ssr={true}
                      infinite={true}
                      autoPlay={true}
                      autoPlaySpeed={2000}
                      arrows={true}
                    >
                      {agency.images?.map((imgObj, index) => (
                        <Box
                          key={index}
                          sx={{
                            padding: { xs: 1, md: 2 },
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            component="img"
                            src={`https://res.cloudinary.com/doxgltggk/${imgObj.image}`}
                            alt={`Agency Image ${index}`}
                            sx={{
                              width: "100%",
                              height: { xs: 200, md: 180 },
                              borderRadius: 2,
                              border: "1px solid #ccc",
                              boxShadow: 1,
                              transition: "transform 0.3s",
                              "&:hover": {
                                transform: "scale(1.05)",
                              },
                            }}
                          />
                        </Box>
                      ))}
                    </Carousel>
                  </Box>
                  <Grid
                    item
                    xs={12}
                    sx={{ textAlign: "center", display: "flex", justifyContent: "end", p: 2 }}
                  >
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Edit />}
                      sx={{
                        mt: 1,
                        textTransform: "none",
                        fontWeight: 600,
                        color: "green",
                        borderColor: "#388e3c",
                        "&:hover": {
                          backgroundColor: "black",
                          borderColor: "black",
                          color: "white",
                        },
                      }}
                      onClick={handleOpenImages}
                    >
                      Edit
                    </Button>
                  </Grid>
                </AccordionDetails>
              </Accordion>
            </Box>
          ) : (
            <Box
              sx={{
                maxWidth: { xs: "85%", md: "85%", lg: "1000px" },
                mx: "auto",
                p: { xs: 2, md: 3, lg: 5 },
                backgroundColor: "white",
                borderRadius: 3,
                boxShadow: 3,
                mt: 2,
              }}
            >
              <Box sx={{ my: 2 }}>
                <Carousel
                  responsive={{
                    desktop: { breakpoint: { max: 3000, min: 1024 }, items: agency.images?.length === 2 ? 2 : 4 },
                    tablet: { breakpoint: { max: 1024, min: 600 }, items: 2 },
                    mobile: { breakpoint: { max: 600, min: 0 }, items: 1 },
                  }}
                  ssr={true}
                  infinite={true}
                  autoPlay={true}
                  autoPlaySpeed={2000}
                  arrows={true}
                >
                  {agency.images?.map((imgObj, index) => (
                    <Box
                      key={index}
                      sx={{
                        padding: { xs: 1, md: 2 },
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Box
                        component="img"
                        src={`https://res.cloudinary.com/doxgltggk/${imgObj.image}`}
                        alt={`Agency Image ${index}`}
                        sx={{
                          width: "100%",
                          height: { xs: 200, md: 180 },
                          borderRadius: 2,
                          border: "1px solid #ccc",
                          boxShadow: 1,
                          transition: "transform 0.3s",
                          "&:hover": {
                            transform: "scale(1.05)",
                          },
                        }}
                      />
                    </Box>
                  ))}
                </Carousel>
              </Box>
              <Grid
                item
                xs={12}
                sx={{ textAlign: "center", display: "flex", justifyContent: "end", p: 2 }}
              >
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<Edit />}
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    fontWeight: 600,
                    color: "green",
                    borderColor: "#388e3c",
                    "&:hover": {
                      backgroundColor: "black",
                      borderColor: "black",
                      color: "white",
                    },
                  }}
                  onClick={handleOpenImages}
                >
                  Edit
                </Button>
              </Grid>
            </Box>
          )}
        </Grid>
        <UpdateModal
          open={open}
          handleClose={handleClose}
          mode={editMode}
          initialData={initialData}
          userId={userId}
          fetchAgencyDetails={fetchAgencyDetails}
        />
      </Box>
    </Box>
  );
}

export default Profile;