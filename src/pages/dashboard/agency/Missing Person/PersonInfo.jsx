import React, { useState, useEffect } from "react";
import {
    Typography,
    Box,
    Grid,
    Button,
    TextField,
    Modal,
    IconButton,
    FormControl,
    MenuItem,
    Select,
    InputLabel,
    Card,
    CardContent,
    CardActions,
} from "@mui/material";
import axios from "axios";
import TextareaAutosize from "@mui/material/TextareaAutosize";
import CloseIcon from "@mui/icons-material/Close";
import {
    Person,
    CalendarToday,
    LocationOn,
    History,
    Home,
    Visibility,
    Wc,
    Description
} from "@mui/icons-material";
import { useParams, useLocation } from "react-router-dom";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import { useNavigate } from "react-router-dom";

const FoundForm = ({ open, handleClose, personId }) => {

    const [user, setUser] = useState(null);
    const [userId, setUserId] = useState(null);
    const [isLogin, setIsLogin] = useState(false);
    const [success, setSuccess] = useState(false);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        agency_found_location: "",
        found_date: "",
        agency_current_location_of_person: "",
        agency_person_condition: "UNKNOWN",
        agency_found_notes: "",
    });

    useEffect(() => {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setIsLogin(true);
            setUserId(parsedUser.user_id);
        }
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const Data = new FormData();
            Data.append("agency_found_location", formData.agency_found_location);
            Data.append("found_date", formData.found_date);
            Data.append("agency_current_location_of_person", formData.agency_current_location_of_person);
            Data.append("agency_person_condition", formData.agency_person_condition);
            Data.append("agency_found_notes", formData.agency_found_notes);
            Data.append("agency_user_id", userId);

            const response = await axios.post(
                `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/${personId}/agency-mark-found/`,
                Data,
                { withCredentials: true, headers: { "Content-Type": "multipart/form-data" } }
            );

            console.log("Form submitted successfully", response.data);
            setSuccess(true);
            handleClose();
            navigate("/missing-person", {
                state: { success: true, message: "Person marked as found successfully!" }
            });
        }
        catch (error) {
            console.error("Error submitting form", error);
            setSuccess(false);
        }

    };

    return (
        <Modal open={open} onClose={handleClose}>
            <Box
                sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    width: { xs: "90%", sm: "400px" },
                    bgcolor: "background.paper",
                    boxShadow: 24,
                    p: { xs: 2, sm: 3 },
                    borderRadius: 2,
                    outline: "none",
                }}
            >
                <IconButton
                    onClick={handleClose}
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        color: "grey.700",
                        "&:hover": { color: "grey.900" }
                    }}
                >
                    <CloseIcon />
                </IconButton>
                <Typography
                    variant="h5"
                    gutterBottom
                    sx={{
                        textAlign: "center",
                        fontSize: { xs: "1.2rem", sm: "1.5rem" },
                        fontWeight: 600
                    }}
                >
                    Recovered Person Details
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Found Location"
                        variant="standard"
                        name="agency_found_location"
                        value={formData.agency_found_location}
                        onChange={handleChange}
                        sx={{ my: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    />
                    <TextField
                        fullWidth
                        label="Found Date"
                        type="date"
                        variant="standard"
                        name="found_date"
                        value={formData.found_date}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ my: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    />
                    <TextField
                        fullWidth
                        label="Current Location"
                        variant="standard"
                        name="agency_current_location_of_person"
                        value={formData.agency_current_location_of_person}
                        onChange={handleChange}
                        sx={{ my: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    />
                    <FormControl fullWidth variant="standard" sx={{ my: 1 }}>
                        <InputLabel sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>Found State</InputLabel>
                        <Select
                            name="agency_person_condition"
                            value={formData.agency_person_condition}
                            onChange={handleChange}
                            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                        >
                            <MenuItem value="ALIVE">Unharmed</MenuItem>
                            <MenuItem value="INJURED">Injured</MenuItem>
                            <MenuItem value="DECEASED">Deceased</MenuItem>
                        </Select>
                    </FormControl>
                    <TextareaAutosize
                        minRows={3}
                        placeholder="Give small note about the person"
                        name="agency_found_notes"
                        value={formData.agency_found_notes}
                        onChange={handleChange}
                        style={{
                            width: '95%',
                            resize: 'none',
                            marginTop: '15px',
                            padding: '2px 10px',
                            fontSize: '0.9rem',
                            lineHeight: 1.5,
                            borderRadius: '8px',
                            border: '1px solid #ccc',
                            color: '#1C2025',
                            backgroundColor: '#fff',
                            outline: 'none',
                        }}
                    />
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: "#fff",
                                color: "#000",
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "20px",
                                px: { xs: 3, sm: 4 },
                                py: { xs: 1, sm: 1.5 },
                                fontSize: { xs: "0.9rem", sm: "1rem" },
                                "&:hover": {
                                    backgroundColor: "#f0f0f0",
                                },
                            }}
                        >
                            Submit
                        </Button>
                    </Box>
                </form>
            </Box>
        </Modal>
    );
};

function PersonInfo() {
    const { id } = useParams();
    const location = useLocation();
    const [open, setOpen] = useState(false);
    const person = location.state?.person;
    console.log(person);
    console.log(id);

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const getMissingDate = (dateString) => {
        const dateObj = new Date(dateString);
        console.log(dateObj);
        const date = dateObj.toISOString().split("T")[0];
        const time = dateObj.toTimeString().split(" ")[0];

        return { date, time };
    };

    if (!person) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh" }}>
                <Typography variant="h6">Person not found!</Typography>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                minHeight: "100vh",
                background: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${worldMapBackground})`,
                backgroundSize: "cover",
                backgroundAttachment: "fixed",
                paddingTop: "20px",
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100vh",
                    px: { xs: 2, sm: 3, md: 5 },
                    mt: { xs: 4, sm: 6, md: 0 },
                    overflowX: "hidden",
                }}
            >
                <Grid container sx={{ maxWidth: "1200px", width: "100%" }}>
                    <Card
                        elevation={3}
                        sx={{
                            p: { xs: 2, md: 3 },
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                            bgcolor: "background.paper",
                            borderRadius: "10px",
                            display: "flex",
                            flexDirection: { xs: "column", md: "row" },
                            alignItems: "center",
                            justifyContent: "center",
                            m: "auto",
                        }}
                    >
                        <CardContent
                            sx={{
                                display: "flex",
                                flexDirection: { xs: "column", md: "column", lg: "row" },
                                alignItems: "center",
                                justifyContent: "center",
                                width: "100%",
                                gap: { xs: 5, md: 10, lg: 15 },
                            }}
                        >
                            <Grid item xs={12} md={12} lg={6} sx={{ display: "flex", justifyContent: "center" }}>
                                {/* Image Section */}
                                <Box
                                    component="img"
                                    src={person.person_photo ? `https://res.cloudinary.com/doxgltggk/${person.person_photo}` : "/assets/person.png"}
                                    alt="Profile"
                                    sx={{
                                        width: { xs: "50%", md: "100%", lg: "65%" },
                                        minWidth: { xs: 150, md: 250, lg: 200 },
                                        height: "auto",
                                        borderRadius: "10px",
                                        border: "2px solid black",
                                        objectFit: "cover",
                                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                    }}
                                />
                            </Grid>

                            {/* Information Section */}
                            <Grid
                                item
                                xs={12}
                                md={12}
                                lg={6}
                                sx={{
                                    flex: 1,
                                    flexDirection: "column",
                                    justifyContent: "center",
                                    maxWidth: { xs: "100%", md: "60%" },
                                }}
                            >
                                {[
                                    { label: "Name", value: person.name, icon: <Person sx={{ color: "#5C6BC0" }} /> },
                                    { label: "Age", value: person.age, icon: <CalendarToday sx={{ color: "#42A5F5" }} /> },
                                    { label: "Gender", value: person.gender, icon: <Wc sx={{ color: "#26A69A" }} /> },
                                    { label: "Missing Date", value: `${getMissingDate(person.missingDate).date} at ${getMissingDate(person.missingDate).time}`, icon: <History sx={{ color: "#1E88E5" }} /> },
                                    { label: "Last Seen", value: person.lastSeenLocation.split(",").slice(0, 2).join(", "), icon: <LocationOn sx={{ color: "#E57373" }} /> },
                                    { label: "Address", value: person.lastSeenLocation, icon: <Home sx={{ color: "#8D6E63" }} /> },
                                    { label: "Identification Mark", value: person.identification_marks, icon: <Visibility sx={{ color: "#FBC02D" }} /> },
                                    { label: "Description", value: person.description, icon: <Description sx={{ color: "#757575" }} /> },
                                ].map((item, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            py: 1,
                                            borderBottom: "1px solid #ddd",
                                            gap: 1,
                                        }}
                                    >
                                        {item.icon}
                                        <Typography sx={{ fontWeight: 500, fontSize: { xs: "0.9rem", md: "1rem" } }}>
                                            {item.label}:
                                        </Typography>
                                        <Typography sx={{ ml: 1, fontSize: { xs: "0.85rem", md: "1rem" } }}>
                                            {item.value}
                                        </Typography>
                                    </Box>
                                ))}
                            </Grid>
                        </CardContent>
                    </Card>
                </Grid>

                <Button
                    variant="contained"
                    onClick={handleOpen}
                    sx={{
                        mt: { xs: 2, sm: 3 },
                        backgroundColor: "#fff",
                        color: "#000",
                        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        borderRadius: "20px",
                        fontSize: { xs: "0.8rem", sm: "0.9rem", md: "1rem" },
                        px: { xs: 3, sm: 4 },
                        py: { xs: 1, sm: 1.5 },
                        "&:hover": {
                            backgroundColor: "#f0f0f0",
                        },
                    }}
                >
                    Marked Found
                </Button>
                <FoundForm open={open} handleClose={handleClose} personId={id} />
            </Box>
        </Box>
    );
}

export default PersonInfo;