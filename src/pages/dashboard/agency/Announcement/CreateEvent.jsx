import { useState, useEffect, startTransition } from "react";
import { useForm } from "react-hook-form";
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
} from "@mui/material";
import { 
  Add, 
  Delete 
} from "@mui/icons-material";
import { Controller } from "react-hook-form";
import MaxHeightTextarea from "../../../../components/TextArea";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const steps = ["Basic Info", "Location", "Details", "Timeline", "Review & Submit"];
const eventTypes = ["Conference", "Workshop", "Seminar", "Webinar", "Networking"];
const platforms = ["Zoom", "Google Meet", "Microsoft Teams", "Webex"];
const regTypes = ["Free", "Paid"];
const disasterTags = [
  "Disaster Preparedness", "Emergency Response", "Risk Assessment", "Flood Management",
  "Earthquake Preparedness", "Evacuation Planning", "Climate Resilience", "Crisis Communication",
  "Search and Rescue", "Humanitarian Aid"
];

export default function EventFormWithStepper() {
  const { control } = useForm(); 
  const [activeStep, setActiveStep] = useState(0);
  const [isOnline, setIsOnline] = useState(false);
  const [selectedTags, setSelectedTags] = useState([]);
  const [timeline_items, setTimelineItems] = useState([
    { time: "", activity: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const navigate = useNavigate();

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
    city: "",
    state: "",
    attendees: "",
    reg_type: "",
    tags: [],
    timeline_items: [],
    description: "",
    location_type: "online",
  });

  const updateFormState = (newState) => {
    setFormData((prevState) => ({ ...prevState, ...newState }));
  };

  const formatTime = (time) => (time.length === 5 ? time + ":00" : time);

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
    if (selectedTags.includes(tag)) {
      const newTags = selectedTags.filter(t => t !== tag);
      setSelectedTags(newTags);
      onChange(newTags);
    } else if (selectedTags.length < 5) {
      const newTags = [...selectedTags, tag];
      setSelectedTags(newTags);
      onChange(newTags);
    }
  };

  const handleSubmit = async () => {
    try {
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
      data.append("city", formData.city);
      data.append("state", formData.state);
      data.append("attendees", formData.attendees);
      data.append("reg_type", formData.reg_type);
      data.append("tags", JSON.stringify(selectedTags));
      data.append("timeline_items", JSON.stringify(timeline_items));
      data.append("description", formData.description);
      data.append("location_type", formData.location_type);
  
      for (let pair of data.entries()) {
        console.log(pair[0] + ": " + pair[1]);
      }
  
      setActiveStep((prevStep) => prevStep + 1);
      setErrors({});
  
      const response = await axios.post(
        "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/events/",
        data,
        {
          withCredentials: true,
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      console.log("Event Created Successfully:", response.data);
      navigate("/event-listing");
    } catch (error) {
      console.error("Event Creation Failed:", error.response?.data || error);
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

  const validateForm = () => 
  {
    const newErrors = {};

    if(activeStep === 0){
      if (!formData.name?.trim()) newErrors.name = "Event name is required";
      if (!formData.date?.trim()) newErrors.date = "Date is required";
      if (!formData.start_time?.trim()) newErrors.start_time = "Start time is required";
      if (!formData.event_type?.trim()) newErrors.event_type = "Event type is required";
    }
    else if (activeStep === 1) {
      let newErrors = {};
      if (formData.location_type === "online") {
        if (!formData.platform?.trim()) newErrors.platform = "Platform is required";
        if (!formData.meeting_link?.trim()) newErrors.meeting_link = "Meeting Link is required";
        if (!formData.meeting_id?.trim()) newErrors.meeting_id = "Meeting ID is required";
      } else {
        if (!formData.venue_name?.trim()) newErrors.venue_name = "Venue name is required";
        if (!formData.address?.trim()) newErrors.address = "Address is required";
        if (!formData.city?.trim()) newErrors.city = "City is required";
        if (!formData.state?.trim()) newErrors.state = "State is required";
      }
    }
    else if(activeStep === 2){
      let newErrors = {}; 
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
    <Box sx={{ width: "80%", padding: "20px", marginTop: "80px", alignItems: "center", marginX: "auto" }}>
      {/* Stepper Component */}
      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      {/* Step Content */}
      {activeStep === steps.length ? (
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="h6">All steps completed - Event Created!</Typography>
          <Button onClick={() => setActiveStep(0)} variant="contained" sx={{ mt: 2 }}>
            Create Another Event
          </Button>
        </Box>
      ) : (
        <>
          <Grid container spacing={3} sx={{ mb: 3 }}>

            {/* Basic Info Step */}
            {activeStep === 0 && (
              <>
                {/* Event Name */}
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="Event Name *"
                    variant="standard"
                    value={formData.name}
                    onChange={(e) => updateFormState({ name: e.target.value })}
                    error={!!errors.name}
                    helperText={errors.name} 
                    sx = {{width: {xs:"100%", sm: "95%"}, marginX: "20px"}} 
                    InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                  />
                </Grid>

                {/* Date & Time */}
                <Grid item xs={6} md={3}>
                  <TextField
                    fullWidth
                    type="date"
                    label="Date *"
                    value={formData.date}
                    onChange={(e) => updateFormState({ ...formData, date: e.target.value })}
                    error={!!errors.date}
                    helperText={errors.date} 
                    InputLabelProps={{shrink: true, style: { fontSize: '1.2rem' } }}
                    sx = {{width: {xs:"80%", sm: "75%"}, marginX: "20px"}}
                  />
                </Grid>

                <Grid item xs={6} md={3} sx={{ marginLeft: "100px" }}>
                  <TextField
                    fullWidth
                    type="time"
                    label="Time *"
                    value={formData.start_time}
                    onChange={(e) => updateFormState({ ...formData, start_time: e.target.value })}
                    error={!!errors.start_time}
                    helperText={errors.start_time} 
                    InputLabelProps={{shrink: true, style: { fontSize: '1.2rem' } }}
                    sx = {{width: {xs:"80%", sm: "75%"}, marginX: "20px"}}
                  />
                </Grid>

                {/* Event Type */}
                <Grid item xs={12} md={12}>
                  <FormControl 
                    fullWidth 
                    variant="standard" 
                    sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
                    error={!!errors.event_type}
                  >
                    <InputLabel sx={{ fontSize: '0.9rem', width: {xs:"100%", sm: "95%"} }}>Event Type *</InputLabel>
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
              </>
            )}

            {/* Location Step */}
            {activeStep === 1 && (
              <>
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
                                const newLocation_type = checked ? "online" : "offline";
                                updateFormState({ location_type: newLocation_type });
                                setIsOnline(newLocation_type);
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
                    <Grid item xs={12} md={12}>
                      <FormControl fullWidth variant="standard" sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} error={!!errors.platform}>
                        <InputLabel sx={{ fontSize: "0.9rem", width: { xs: "100%", sm: "95%" } }}>Platform</InputLabel>
                        <Select 
                          value={formData.platform}
                          onChange={(e) => updateFormState({ ...formData, platform: e.target.value })} // Set image based on platform
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

                    <Grid item xs={12} md={12}>
                      <TextField
                        fullWidth
                        label="Meeting Link *"
                        variant="standard"
                        value={formData.meeting_link}
                        onChange={(e) => updateFormState({ ...formData, meeting_link: e.target.value })}
                        error={!!errors.meeting_link}
                        helperText={errors.meeting_link} 
                        sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} 
                        InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <TextField
                        fullWidth
                        label="Meeting ID *"
                        variant="standard"
                        value={formData.meeting_id}
                        onChange={(e) => updateFormState({ ...formData, meeting_id: e.target.value })}
                        error={!!errors.meeting_id}
                        helperText={errors.meeting_id} 
                        sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} 
                        InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      />
                    </Grid>
                  </>
                ) : (
                  <>
                    <Grid item xs={12} md={12}>
                      <TextField
                        fullWidth
                        label="Venue Name *"
                        variant="standard"
                        value={formData.venue_name}
                        onChange={(e) => updateFormState({ ...formData, venue_name: e.target.value })}
                        error={!!errors.venue_name}
                        helperText={errors.venue_name} 
                        sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} 
                        InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={12}>
                      <TextField
                        fullWidth
                        label="Venue Address *"
                        variant="standard"
                        value={formData.address}
                        onChange={(e) => updateFormState({ ...formData, address: e.target.value })}
                        error={!!errors.address}
                        helperText={errors.address}
                        sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} 
                        InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="City *"
                        variant="standard"
                        value={formData.city}
                        onChange={(e) => updateFormState({ ...formData, city: e.target.value })}
                        error={!!errors.city}
                        helperText={errors.city} 
                        sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} 
                        InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      />
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="State *"
                        variant="standard"
                        value={formData.state}
                        onChange={(e) => updateFormState({ ...formData, state: e.target.value })}
                        error={!!errors.state}
                        helperText={errors.state} 
                        sx={{ width: { xs: "100%", sm: "95%" }, marginX: "20px" }} 
                        InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                      />
                    </Grid>
                  </>
                )}
              </>
            )}

            {/* Details Step */}
            {activeStep === 2 && (
              <>
                <Grid item xs={12} md={12} sx={{ marginTop: "5px", marginX: "20px" }}>
                  <MaxHeightTextarea placeholder="Provide a description of the event." />
                </Grid>

                <Grid item xs={12} md={12} sx={{ marginTop: "-5px" }}>
                  <TextField
                    fullWidth
                    label="Maximum Attendees (optional)"
                    type="number"
                    variant="standard"
                    value={formData.attendees}
                    onChange={(e) => updateFormState({ ...formData, attendees: e.target.value })}
                    sx = {{width: {xs:"100%", sm: "95%"}, marginX: "20px"}} 
                    InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
                  />
                </Grid>

                <Grid item xs={12} md={12}>
                  <FormControl fullWidth variant="standard" sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }} error={!!errors.eventType}>
                    <InputLabel sx={{ fontSize: '0.9rem', width: {xs:"100%", sm: "95%"} }}>Registration Type</InputLabel>
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

                <Grid item xs={12} md={12} sx={{ marginTop: "10px", marginX: "20px" }}>
                  <Controller
                    name="tags"
                    control={control}
                    render={({ field: { onChange } }) => (
                      <FormControl fullWidth variant="standard" error={!!errors.tags}>
                        <FormLabel>Tags (Select up to 5)</FormLabel>
                        <Paper elevation={1} sx={{ p: 2, backgroundColor: "grey.50", borderRadius: 2 }}>
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
              </>
            )}

            {/* Timeline Step */}
            {activeStep === 3 && (
              <>
                <Box sx={{ px: { xs: 2, md: 4 }, py: 3, maxWidth: "1000px", minWidth: "600px", mx: "auto" }}>
                  <Typography variant="h6" fontWeight="600" color="text.primary" mb={2}>
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
                        sx={{ p: 3, borderRadius: 2, border: "1px solid", borderColor: "grey.500", bgcolor: "background.paper" }}
                        >
                        <Grid container spacing={3} alignItems="center">
                          <Grid item xs={6} md={6}>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              Time
                            </Typography>
                            <TextField
                              fullWidth
                              type="time"
                              value={item.time}
                              onChange={(e) => handleUpdateItem(index, "time", e.target.value)}
                              InputLabelProps={{shrink: true, style: { fontSize: '1.2rem' } }}
                              sx = {{width: {xs:"80%", sm: "75%"}}}
                              />
                          </Grid>
            
                          <Grid item xs={12} md={6}>
                            <Typography variant="body1" fontWeight={600} color="text.primary">
                              Activity Description
                            </Typography>
                            <TextField
                              fullWidth
                              placeholder="Enter activity description"
                              value={item.activity}
                              onChange={(e) => handleUpdateItem(index, "activity", e.target.value)}
                              />
                          </Grid>
            
                          <Grid item xs={12} md={1} display="flex" justifyContent="center" alignItems="center">
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
            
                  <Box display="flex" justifyContent="start" mt={3}>
                    <Button
                      variant="contained"
                      startIcon={<Add />}
                      onClick={handleAddItem}
                      sx={{
                        borderRadius: 2,
                        bgcolor: "primary.main",
                        color: "white",
                        "&:hover": { bgcolor: "primary.dark" },
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
              <>
              <Grid item xs={12}>
                <Typography variant="h6">Review Your Information</Typography>
                <Typography variant="body1">Event Name: {formData.name}</Typography>
                <Typography variant="body1">Date: {formData.date}</Typography>
                <Typography variant="body1">Time: {formData.start_time}</Typography>
                <Typography variant="body1">Event Type: {formData.event_type}</Typography>
                {isOnline ? (
                <>
                  <Typography variant="body1">Platform: {formData.platform}</Typography>
                  <Typography variant="body1">Meeting Link: {formData.meeting_link}</Typography>
                  <Typography variant="body1">Meeting ID: {formData.meeting_id}</Typography>
                </>
                ) : (
                <>
                  <Typography variant="body1">Venue Name: {formData.venue_name}</Typography>
                  <Typography variant="body1">Venue Address: {formData.address}</Typography>
                  <Typography variant="body1">City: {formData.city}</Typography>
                  <Typography variant="body1">State: {formData.state}</Typography>
                </>
                )}
                {selectedTags.length > 0 && (
                <Typography variant="body1">Tags: {selectedTags.join(", ")}</Typography>
                )}
                <Typography variant="body1">Registration Type: {formData.reg_type}</Typography>
                <Typography variant="body1">
                  Maximum Attendees: {formData.attendees?.trim() ? formData.attendees : "Not Entered"}
                </Typography>
                {timeline_items.length > 0 && (
                <Typography variant="body1">
                  Timeline: {timeline_items.map(item => `${item.time} - ${item.activity}`).join(", ")}
                </Typography>
                )}
                <Typography variant="body1">
                  Description: {formData.description?.trim() ? formData.description : "Not Entered"}
                </Typography>
              </Grid>
              </>
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
                onClick={() => 
                {
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
  );
}