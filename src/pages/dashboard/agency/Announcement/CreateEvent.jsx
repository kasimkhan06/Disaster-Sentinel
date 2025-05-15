//React
import { useState, useEffect, startTransition } from "react";

// React Router
import { useForm } from "react-hook-form";
import { Controller } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { useMediaQuery } from "@mui/material";

// MUI Components
import {
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Button,
  Grid,
  Box,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Switch,
  FormControlLabel,
  Paper,
  Container,
  FormLabel,
  Chip,
  IconButton,
  FormHelperText,
  Card,
  TextareaAutosize,
  Divider,
} from "@mui/material";
import {
  Add,
  Delete
} from "@mui/icons-material";

// Styles & Assets
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

// Axios for API requests
import axios from "axios";


const steps = ["Basic Info", "Location", "Details", "Timeline", "Review & Submit"];
const eventTypes = ["Conference", "Workshop", "Seminar", "Webinar", "Networking"];
const platforms = ["Zoom", "Google Meet", "Microsoft Teams", "Webex"];
const regTypes = ["Free", "Paid"];
const disasterTags = [
  "Disaster Preparedness", "Emergency Response", "Risk Assessment", "Flood Management",
  "Earthquake Preparedness", "Evacuation Planning", "Climate Resilience", "Humanitarian Aid"
];

export default function EventFormWithStepper() {
  const { control } = useForm();
  const [activeStep, setActiveStep] = useState(0);
  const [isOnline, setIsOnline] = useState("offline");
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeline_items, setTimelineItems] = useState([
    { time: "", activity: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const formatTime = (time) => (time.length === 5 ? time + ":00" : time);
  const isMobile = useMediaQuery("(max-width:600px)");


  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
      setIsLogin(true);
      console.log("User data:", storedUser);
    }
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    start_time: "",
    event_type: "",
    platform: "",
    meeting_link: "",
    meeting_id: "",
    venue_name: "",
    address: "",
    district: "",
    state: "",
    attendees: "",
    reg_type: "",
    tags: [],
    timeline_items: [],
    description: "",
    location_type: "offline",
  });

  useEffect(() => {
    if (location.state?.eventData) {
      setFormData({
        name: location.state.eventData.name || "",
        event_type: location.state.eventData.event_type || "",
        date: location.state.eventData.date || "",
        start_time: location.state.eventData.start_time || "",
        platform: location.state.eventData.platform || "",
        meeting_link: location.state.eventData.meeting_link || "",
        meeting_id: location.state.eventData.meeting_id || "",
        venue_name: location.state.eventData.venue_name || "",
        address: location.state.eventData.address || "",
        district: location.state.eventData.district || "",
        state: location.state.eventData.state || "",
        attendees: location.state.eventData.attendees || "",
        reg_type: location.state.eventData.reg_type || "",
        description: location.state.eventData.description || "",
      });
      const location_type = location.state.eventData.location_type || "offline";
      const existingTags = location.state.eventData.tags || [];
      const timeline_items = location.state.eventData.timeline_items || [];
      setIsOnline(location_type);
      updateFormState({ location_type: location_type });
      setSelectedTags(existingTags);
      setTimelineItems(timeline_items);
    }
  }, [location.state]);

  const updateFormState = (newState) => {
    setFormData((prevState) => ({ ...prevState, ...newState }));
  };

  const handleChange = (field) => (event) => {
    updateFormState({ [field]: event.target.value });
  };

  const handleUpdateItem = (index, field, value) => {
    setTimelineItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index ? { ...item, [field]: field === "time" ? formatTime(value) : value } : item
      )
    );
  };

  const handleRemoveItem = (index) => {
    setTimelineItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  const handleAddItem = () => {
    setTimelineItems((prevItems) => [...prevItems, { time: "", activity: "" }]);
  };

  const handleTagClick = (tag, onChange) => {
    let updatedTags;
    if (selectedTags.includes(tag)) {
      updatedTags = selectedTags.filter((t) => t !== tag);
    } else if (selectedTags.length < 5) { // Limit to 5 tags
      updatedTags = [...selectedTags, tag];
    } else {
      alert("Maximum 5 tags allowed");
      return;
    }

    setSelectedTags(updatedTags);
    onChange(updatedTags); // Update the form state
  };

  const createFormData = () => {
    const data = new FormData();
    data.append("user_id", user?.user_id ? parseInt(user.user_id, 10) : null);
    data.append("name", formData.name);
    data.append("date", formData.date);
    data.append("start_time", formData.start_time);
    data.append("event_type", formData.event_type);
    data.append("platform", formData.platform || "");
    data.append("meeting_link", formData.meeting_link);
    data.append("meeting_id", formData.meeting_id);
    data.append("venue_name", formData.venue_name);
    data.append("address", formData.address);
    data.append("district", formData.district);
    data.append("state", formData.state);
    data.append("attendees", formData.attendees);
    data.append("reg_type", formData.reg_type);
    data.append("tags", JSON.stringify(selectedTags));
    data.append("timeline_items", JSON.stringify(timeline_items));
    data.append("description", formData.description);
    data.append("location_type", formData.location_type);
    return data;
  };

  const handleSubmit = async () => {
    try {
      // Determine API method and endpoint
      const isEditMode = Boolean(location.state?.eventData);
      const method = isEditMode ? "put" : "post";
      const endpoint = isEditMode
        ? `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/${location.state.eventData.id}/`
        : "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/";

      // Create FormData
      const data = createFormData();
      // for (let pair of data.entries()) {
      //   console.log(pair[0] + ": " + pair[1]);
      // }

      // Make API call
      const response = await axios[method](endpoint, data, {
        withCredentials: true,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(isEditMode ? "Event updated successfully!" : "Event created successfully!");
      console.log("Success:", response.data);
      navigate("/event-listing");
    } catch (error) {
      console.error("Event save/update failed:", error.response?.data || error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      console.log("Final Data:", formData);
    } else {
      setActiveStep((prevStep) => prevStep + 1);
      console.log("Next Step:", activeStep + 1);
    }
  };

  const validateMeetingID = (id, platform) => {
    const patterns = {
      zoom: /^\d{9,11}$/,
      google: /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/i,
      webex: /^\d{9,10}$/,
      microsoft: /.*/,
    };

    const platformKey = platform.toLowerCase().split(" ")[0];
    const regex = patterns[platformKey];

    if (!regex) return false;

    return regex.test(id.trim());
  };

  const validateForm = () => {
    let newErrors = {};
    if (activeStep === 0) {
      if (!formData.name?.trim()) newErrors.name = "Event name is required";
      if (!formData.date?.trim()) newErrors.date = "Date is required";
      if (!formData.start_time?.trim()) newErrors.start_time = "Start time is required";
      if (!formData.event_type?.trim()) newErrors.event_type = "Event type is required";
    }

    else if (activeStep === 1) {
      if (formData.location_type === "online") {
        if (!formData.platform?.trim()) newErrors.platform = "Platform is required";
        if (!formData.meeting_link?.trim()) {
          newErrors.meeting_link = "Meeting Link is required";
        } else {
          const platformDomainMap = {
            google: "meet.google.com",
            zoom: "zoom.us",
            microsoft: "teams.microsoft.com",
            webex: "webex.com",
          };
          try {
            const url = new URL(formData.meeting_link.trim());
            const host = url.hostname.toLowerCase();
            const expectedDomain = platformDomainMap[formData.platform.toLowerCase().split(" ")[0]];
            if (!expectedDomain) {
              newErrors.platform = "Unknown platform selected";
            } else if (!host.includes(expectedDomain)) {
              newErrors.meeting_link = `The meeting link must be a valid ${formData.platform} URL`;
            }
          } catch (error) {
            const platformKey = formData.platform.toLowerCase().split(" ")[0];
            const exampleDomain = platformDomainMap[platformKey];
            newErrors.meeting_link = `Please enter a valid URL (e.g., https://${exampleDomain}/...)`;
          }
        }
        if (!formData.meeting_id?.trim()) newErrors.meeting_id = "Meeting ID is required";
        else if (!validateMeetingID(formData.meeting_id, formData.platform)) {
          newErrors.meeting_id = "Invalid meeting ID format for " + formData.platform;
        }

      }
      else {
        if (!formData.venue_name?.trim()) newErrors.venue_name = "Venue name is required";
        if (!formData.address?.trim()) newErrors.address = "Address is required";
        if (!formData.district?.trim()) newErrors.district = "District is required";
        if (!formData.state?.trim()) newErrors.state = "State is required";
      }
    }

    else if (activeStep === 2) {
      if (!formData.reg_type.trim()) newErrors.reg_type = "Registration type is required";
      if (selectedTags.length === 0) newErrors.tags = "At least one tag is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  return (
    <Box
      sx={{
        position: "relative",
        width: "100vw",
        minHeight: "100vh", 
        top: 0,
        left: 0,
        right: 0,
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
        overflow: "auto", 
      }}
    >
      <Box
        sx={{
          mt: { xs: 15, md: 15 },
          mb: { xs: 2, md: 4 },
          mx: "auto",
          width: { xs: "80%", md: "70%" },
          display: "flex",
          flexDirection: "column",
          overflowY: "auto", 
        }}
      >
        {/* Stepper Component */}
        <Stepper activeStep={activeStep} sx={{ mb: { xs: 2, md: 4 } }}>
          {isMobile ? (
            <Step
              key={steps[activeStep]}
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                width: "100%"
              }}
            >
              <StepLabel>
                {steps[activeStep]}
              </StepLabel>
            </Step>
          ) : (
            steps.map((label, index) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))
          )}
        </Stepper>

        {/* Step Content */}
        {activeStep === steps.length ? (
          <Box sx={{ textAlign: "center" }}>
            <Typography variant="h6">All steps completed - Event Created!</Typography>
          </Box>
        ) : (
          <>
            <Grid container spacing={3} sx={{ mb: { xs: 2, md: 3 } }}>

              {/* Basic Info Step */}
              {activeStep === 0 && (
                <Grid item xs={12} sx={{ marginTop: "20px" }}>
                  <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                    {/* Event Name & Event Type */}
                    <Grid container spacing={3}>
                      {/* Event Name */}
                      <Grid item xs={12} md={12}>
                        <TextField
                          fullWidth
                          label={
                            <span>
                              Event Name <span style={{ color: 'red' }}>*</span>
                            </span>
                          }
                          variant="standard"
                          value={formData.name}
                          onChange={(e) => updateFormState({ name: e.target.value })}
                          error={!!errors.name}
                          helperText={errors.name}
                          InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                          sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}

                        />
                      </Grid>

                      {/* Event Type */}
                      <Grid item xs={12} md={12}>
                        <FormControl
                          fullWidth
                          variant="standard"
                          error={!!errors.event_type}
                          sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}

                        >
                          <InputLabel sx={{ fontSize: '0.9rem' }}>
                            Event Type <span style={{ color: "red" }}>*</span>
                          </InputLabel>
                          <Select
                            value={formData.event_type}
                            onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                          >
                            {eventTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.event_type && <FormHelperText>{errors.event_type}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    </Grid>

                    {/* Date & Time */}
                    <Grid container spacing={3} sx={{ marginTop: "20px" }}>
                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          fullWidth
                          type="date"
                          label={
                            <span>
                              Date <span style={{ color: 'red' }}>*</span>
                            </span>
                          }
                          value={formData.date}
                          onChange={(e) => updateFormState({ ...formData, date: e.target.value })}
                          error={!!errors.date}
                          helperText={errors.date}
                          InputLabelProps={{ shrink: true, sx: { fontSize: '0.9rem' } }}
                          sx={{ width: { xs: "95%", md: "80%" }, marginX: { xs: "5px", md: "20px" } }}

                        />
                      </Grid>

                      <Grid item xs={12} sm={6} md={6}>
                        <TextField
                          fullWidth
                          type="time"
                          label={
                            <span>
                              Time <span style={{ color: 'red' }}>*</span>
                            </span>
                          }
                          value={formData.start_time}
                          onChange={(e) => updateFormState({ ...formData, start_time: e.target.value })}
                          error={!!errors.start_time}
                          helperText={errors.start_time}
                          InputLabelProps={{ shrink: true, sx: { fontSize: '0.9rem' } }}
                          sx={{ width: { xs: "95%", md: "80%" }, marginX: { xs: "5px", md: "20px" } }}

                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              )}

              {/* Location Step */}
              {activeStep === 1 && (
                <Grid item xs={12} sx={{ marginTop: "20px" }}>
                  <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                    <Container maxWidth="md" sx={{ display: "flex", justifyContent: "center", alignItems: "center", mt: 4 }}>
                      <Paper
                        elevation={3}
                        sx={{
                          width: "100%",
                          maxWidth: 600,
                          p: 3,
                          borderRadius: 3,
                          bgcolor: "background.paper",
                          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
                        }}
                      >
                        <Box display="flex" alignItems="center" justifyContent="space-between">
                          <Typography variant="body1" fontWeight={600} color="text.primary">
                            Event Format:
                          </Typography>
                          <FormControl>
                            <FormControlLabel
                              control={
                                <Switch
                                  checked={isOnline === "online"}
                                  color="primary"
                                  onChange={(event) => {
                                    const checked = event.target.checked;
                                    const newLocationType = checked ? "online" : "offline";
                                    updateFormState({ location_type: newLocationType });
                                    setIsOnline(newLocationType);
                                  }}
                                />
                              }
                              label={isOnline === "online" ? "Virtual" : "In-Person"}
                            />
                          </FormControl>
                        </Box>
                      </Paper>
                    </Container>

                    {/* Online Event */}
                    {isOnline === "online" ? (
                      <>
                        <Grid container spacing={3} sx={{ marginTop: "10px" }}>
                          {/* Event Platform */}
                          <Grid item xs={12} md={6}>
                            <FormControl fullWidth variant="standard" sx={{ width: { xs: "100%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }} error={!!errors.platform}>
                              <InputLabel sx={{ fontSize: "0.9rem", width: { xs: "100%", sm: "95%" } }}>
                                Platform <span style={{ color: "red" }}>*</span>
                              </InputLabel>
                              <Select
                                value={formData.platform}
                                onChange={(e) => updateFormState({ ...formData, platform: e.target.value })}
                              >
                                {platforms.map((type) => (
                                  <MenuItem key={type} value={type}>
                                    {type}
                                  </MenuItem>
                                ))}
                              </Select>
                              {errors.platform && <FormHelperText>{errors.platform}</FormHelperText>}
                            </FormControl>
                          </Grid>

                          {/* Meeting Link */}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={
                                <span>
                                  Meeting Link <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                              variant="standard"
                              value={formData.meeting_link}
                              onChange={(e) => updateFormState({ ...formData, meeting_link: e.target.value })}
                              error={!!errors.meeting_link}
                              helperText={errors.meeting_link}
                              sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                            />
                          </Grid>
                        </Grid>

                        <Grid item xs={12} md={6} sx={{ marginTop: "10px" }}>
                          <TextField
                            fullWidth
                            label={
                              <span>
                                Meeting ID <span style={{ color: 'red' }}>*</span>
                              </span>
                            }
                            variant="standard"
                            value={formData.meeting_id}
                            onChange={(e) => updateFormState({ ...formData, meeting_id: e.target.value })}
                            error={!!errors.meeting_id}
                            helperText={errors.meeting_id}
                            sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                            InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                          />
                        </Grid>
                      </>
                    ) : (
                      <>
                        <Grid container spacing={3} sx={{ marginTop: "10px" }}>
                          {/* Venue Name */}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={
                                <span>
                                  Venue Name <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                              variant="standard"
                              value={formData.venue_name}
                              onChange={(e) => updateFormState({ ...formData, venue_name: e.target.value })}
                              error={!!errors.venue_name}
                              helperText={errors.venue_name}
                              sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                            />
                          </Grid>

                          {/* Venue Address */}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={
                                <span>
                                  Venue Address <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                              variant="standard"
                              value={formData.address}
                              onChange={(e) => updateFormState({ ...formData, address: e.target.value })}
                              error={!!errors.address}
                              helperText={errors.address}
                              sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                            />
                          </Grid>
                        </Grid>

                        <Grid container spacing={3} sx={{ marginTop: "10px" }}>
                          {/* District & State */}
                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={
                                <span>
                                  District <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                              variant="standard"
                              value={formData.district}
                              onChange={(e) => updateFormState({ ...formData, district: e.target.value })}
                              error={!!errors.district}
                              helperText={errors.district}
                              sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                            />
                          </Grid>

                          <Grid item xs={12} md={6}>
                            <TextField
                              fullWidth
                              label={
                                <span>
                                  State <span style={{ color: 'red' }}>*</span>
                                </span>
                              }
                              variant="standard"
                              value={formData.state}
                              onChange={(e) => updateFormState({ ...formData, state: e.target.value })}
                              error={!!errors.state}
                              helperText={errors.state}
                              sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                              InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                            />
                          </Grid>
                        </Grid>
                      </>
                    )}
                  </Card>
                </Grid>
              )}

              {/* Details Step */}
              {activeStep === 2 && (
                <Grid item xs={12} sx={{ marginTop: "20px" }}>
                  <Card sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, boxShadow: 3 }}>
                    <Grid item xs={12} md={12} sx={{ marginTop: "5px", marginX: "20px" }}>
                      <TextareaAutosize
                        minRows={4}
                        placeholder="Provide a description of the event."
                        value={formData.description}
                        onChange={(e) => updateFormState({ description: e.target.value })}
                        style={{
                          width: '97%',
                          resize: 'none',
                          padding: '8px 12px',
                          fontSize: '0.9rem',
                          lineHeight: 1.5,
                          borderRadius: '8px',
                          border: '1px solid #ccc',
                          color: '#1C2025',
                          backgroundColor: '#fff',
                          outline: 'none',
                        }}
                      />
                    </Grid>

                    <Grid container spacing={3} sx={{ marginTop: "10px" }}>
                      <Grid item xs={12} md={6}>
                        <TextField
                          fullWidth
                          label="Maximum Attendees"
                          type="number"
                          variant="standard"
                          value={formData.attendees}
                          onChange={(e) => updateFormState({ ...formData, attendees: e.target.value })}
                          sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }}
                          InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                        />
                      </Grid>

                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth variant="standard" sx={{ width: { xs: "95%", md: "90%" }, marginX: { xs: "10px", md: "20px" } }} error={!!errors.eventType}>
                          <InputLabel sx={{ fontSize: '0.9rem', width: { xs: "100%", sm: "90%" } }}>
                            Registration Type <span style={{ color: 'red' }}>*</span>
                          </InputLabel>
                          <Select
                            value={formData.reg_type}
                            onChange={(e) => setFormData({ ...formData, reg_type: e.target.value })}>
                            {regTypes.map((type) => (
                              <MenuItem key={type} value={type}>
                                {type}
                              </MenuItem>
                            ))}
                          </Select>
                          {errors.reg_type && <FormHelperText>{errors.reg_type}</FormHelperText>}
                        </FormControl>
                      </Grid>
                    </Grid>

                    <Grid container spacing={3} sx={{ marginTop: "15px" }}>
                      <Grid item xs={12} md={12} sx={{ marginX: "10px" }}>
                        <Controller
                          name="tags"
                          control={control}
                          render={({ field: { onChange } }) => (
                            <FormControl fullWidth variant="standard" error={!!errors.tags}>
                              <FormLabel sx={{ width: { xs: "100%", sm: "90%" }, marginBottom: "10px" }}>
                                Tags (Max 5 tags) <span style={{ color: 'red' }}>*</span>
                              </FormLabel>
                              <Paper
                                elevation={1}
                                sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 2, width: { xs: "90%", sm: "96%" } }}
                              >
                                <Box display="flex" flexWrap="wrap" gap={1}>
                                  {disasterTags.map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      variant={selectedTags.includes(tag) ? "filled" : "outlined"}
                                      color={selectedTags.includes(tag) ? "primary" : "default"}
                                      onClick={() => handleTagClick(tag, onChange)}
                                      sx={{ cursor: "pointer" }}
                                    />
                                  ))}
                                </Box>
                              </Paper>
                              {errors.tags && <FormHelperText>{errors.tags}</FormHelperText>}
                            </FormControl>
                          )}
                        />
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              )}

              {/* Timeline Step */}
              {activeStep === 3 && (
                <>
                  <Box
                    sx={{
                      px: { xs: 2, md: 4 },
                      py: { xs: 2, md: 3 },
                      width: "85%",
                      maxWidth: { xs: "100%", md: "1000px" },
                      marginLeft: "auto",
                      mt: { xs: 5, md: 5 },
                      mb: 2,
                      borderRadius: 3,
                      boxShadow: 3,
                      bgcolor: "background.paper",
                    }}
                  >
                    <Typography variant="h6" fontWeight="600" color="text.primary" mb={2} sx={{ fontSize: { xs: "1.2rem", md: "1.5rem" } }}>
                      Event Timeline
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                      Add key activities to your event schedule
                    </Typography>

                    <Box display="flex" flexDirection="column" gap={2}>
                      {timeline_items.map((item, index) => (
                        <Paper
                          key={index}
                          elevation={2}
                          sx={{
                            p: { xs: 2, md: 3 },
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "grey.500",
                            bgcolor: "background.paper",
                          }}
                        >
                          <Grid container spacing={2} alignItems="center">
                            <Grid item xs={12} sm={6} md={5}>
                              <Typography variant="body1" fontWeight={600} color="text.primary" mb={1}>
                                Time
                              </Typography>
                              <TextField
                                fullWidth
                                type="time"
                                value={item.time}
                                onChange={(e) => handleUpdateItem(index, "time", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                sx={{ width: "100%" }}
                              />
                            </Grid>

                            <Grid item xs={12} sm={6} md={6}>
                              <Typography variant="body1" fontWeight={600} color="text.primary" mb={1}>
                                Activity Description
                              </Typography>
                              <TextField
                                fullWidth
                                placeholder="Enter activity description"
                                value={item.activity}
                                onChange={(e) => handleUpdateItem(index, "activity", e.target.value)}
                                sx={{ width: "100%" }}
                              />
                            </Grid>

                            <Grid item xs={12} sm={1} display="flex" justifyContent="center" alignItems="center">
                              {timeline_items.length > 1 && (
                                <IconButton color="error" onClick={() => handleRemoveItem(index)}>
                                  <Delete />
                                </IconButton>
                              )}
                            </Grid>
                          </Grid>
                        </Paper>
                      ))}
                    </Box>

                    <Box display="flex" justifyContent={{ xs: "center", md: "start" }} mt={3}>
                      <Button
                        variant="contained"
                        startIcon={<Add />}
                        onClick={handleAddItem}
                        sx={{
                          borderRadius: 2,
                          bgcolor: "primary.main",
                          color: "white",
                          "&:hover": { bgcolor: "primary.dark" },
                          fontSize: { xs: "0.8rem", md: "1rem" },
                          px: { xs: 2, md: 3 },
                        }}
                      >
                        Add Activity
                      </Button>
                    </Box>
                  </Box>
                </>
              )}

              {/* Review Step */}
              {activeStep === 4 && (
                <Grid item xs={12} sx={{ mt: 4 }}>
                  <Card sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Review Your Information
                    </Typography>
                    <Divider sx={{ mb: 2 }} />

                    <Grid container spacing={1}>
                      {/* First Column */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h7"><strong>Event Name:</strong> {formData.name}</Typography><br /><br />
                        <Typography variant="h7"><strong>Date:</strong> {formData.date}</Typography><br /><br />
                        <Typography variant="h7"><strong>Time:</strong> {formData.start_time}</Typography><br /><br />
                        <Typography variant="h7"><strong>Event Type:</strong> {formData.event_type}</Typography><br /><br />

                        {isOnline ? (
                          <>
                            <Typography variant="h7"><strong>Platform:</strong> {formData.platform}</Typography><br /><br />
                            <Typography variant="h7"><strong>Meeting Link:</strong> {formData.meeting_link}</Typography><br /><br />
                            <Typography variant="h7"><strong>Meeting ID:</strong> {formData.meeting_id}</Typography><br /><br />
                          </>
                        ) : (
                          <>
                            <Typography variant="h7"><strong>Venue Name:</strong> {formData.venue_name}</Typography><br /><br />
                            <Typography variant="h7"><strong>Venue Address:</strong> {formData.address}</Typography><br /><br />
                            <Typography variant="h7"><strong>district:</strong> {formData.district}</Typography><br /><br />
                            <Typography variant="h7"><strong>State:</strong> {formData.state}</Typography><br /><br />
                          </>
                        )}
                      </Grid>

                      {/* Second Column */}
                      <Grid item xs={12} sm={6}>
                        <Typography variant="h7"><strong>Registration Type:</strong> {formData.reg_type}</Typography><br /><br />
                        <Typography variant="h7">
                          <strong>Maximum Attendees:</strong>{" "}
                          {formData.attendees ? String(formData.attendees).trim() : "Not Entered"}
                        </Typography>
                        <br /><br />

                        {selectedTags.length > 0 && (
                          <Typography variant="h7"><strong>Tags:</strong> {selectedTags.join(", ")}</Typography>
                        )}
                        <br /><br />

                        {timeline_items.length > 0 && (
                          <Typography variant="h7">
                            <strong>Timeline:</strong>{" "}
                            {timeline_items.map(item => `${item.time} - ${item.activity}`).join(", ")}
                          </Typography>
                        )}
                        <br /><br />

                        <Typography variant="h7" sx={{ whiteSpace: 'pre-wrap' }}>
                          <strong>Description:</strong>{" "}
                          {formData.description?.trim() ? formData.description : "Not Entered"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Card>
                </Grid>
              )}
            </Grid>

            <Box sx={{ display: "flex", flexDirection: "row", pt: 2 }}>
              <Button color="inherit" disabled={activeStep === 0} onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
              <Box sx={{ flex: "1 1 auto" }} />
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit} sx={{ mr: 1 }}>
                  Submit
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => {
                    const isValid = validateForm();
                    console.log("Validation Result:", isValid);
                    if (isValid) {
                      handleNext();
                    }
                  }}
                  sx={{ mr: 1 }}
                >
                  Next
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}