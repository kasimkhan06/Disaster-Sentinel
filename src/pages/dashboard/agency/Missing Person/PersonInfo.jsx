import React, { useState } from "react";
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
    CardContent
} from "@mui/material";
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

const FoundForm = ({ open, handleClose }) => {
    const [formData, setFormData] = useState({
        foundLocation: "",
        foundDate: "",
        currentLocation: "",
        foundState: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log(formData);
        handleClose(); 
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
                    Recovered Person Details
                </Typography>
                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Found Location"
                        variant="standard"
                        name="foundLocation"
                        value={formData.foundLocation}
                        onChange={handleChange}
                        sx={{ my: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Found Date"
                        type="date"
                        variant="standard"
                        name="foundDate"
                        value={formData.foundDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        sx={{ my: 1 }}
                    />
                    <TextField
                        fullWidth
                        label="Current Location"
                        variant="standard"
                        name="currentLocation"
                        value={formData.currentLocation}
                        onChange={handleChange}
                        sx={{ my: 1 }}
                    />
                    <FormControl fullWidth variant="standard" sx={{ my: 1 }}>
                        <InputLabel>Found State</InputLabel>
                        <Select name="foundState" value={formData.foundState} onChange={handleChange}>
                            <MenuItem value="Alive and Safe">Alive and Safe</MenuItem>
                            <MenuItem value="Injured">Injured</MenuItem>
                            <MenuItem value="Deceased">Deceased</MenuItem>
                        </Select>
                    </FormControl>
                    <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            sx={{
                                backgroundColor: "#fff",
                                color: "#000",
                                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                                borderRadius: "20px",
                                px: 4, // Padding for better touch area
                                py: 1, // Adjusted for smaller screens
                                fontSize: { xs: "0.8rem", sm: "0.9rem" }, // Adjusted font size
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

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

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
                display: "flex", 
                flexDirection: "column", 
                justifyContent: "center", 
                alignItems: "center", 
                minHeight: "100vh",
                px: { xs: 2, sm: 3, md: 5 },  
                mt: { xs: 8, sm: 6, md: 0 }, // Ensure margin only applies to small screens
                overflowX: "hidden",  
            }}
        >
            <Grid container spacing={3} sx={{ maxWidth: "1200px" }}>
                <Grid item xs={12} sm={12} lg={4} md={10}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: { xs: 8, sm: 6, md: 2, lg: 3 }, // Added mt for medium and larger screens
                        p: { xs: 1, sm: 2, md: 3, lg: 4 }, 
                    }}
                >
                    <Box
                        component="img"
                        src={person.img}
                        alt="Profile"
                        sx={{
                            width: { xs: "100%", sm: 250, md: 300, lg: 350 }, 
                            maxWidth: 250,  // Prevents image from being too big
                            height: 250, 
                            borderRadius: "10px",
                            border: "3px solid black",
                            objectFit: "cover",
                            marginBottom: { xs: 1, sm: 1, md: 2 }, 
                        }}
                    />
                </Grid>
                <Grid item xs={12} sm={12} md={10} lg={8}>
                    <Card sx={{ p: 2, boxShadow: "none", border: "none" }}>
                        <CardContent>
                            {[
                                { label: "Name", value: person.name, icon: <Person sx={{ color: "#5C6BC0" }} /> },
                                { label: "Age", value: person.age, icon: <CalendarToday sx={{ color: "#42A5F5" }} /> },
                                { label: "Gender", value: person.gender, icon: <Wc sx={{ color: "#26A69A" }} /> },
                                { label: "Missing Date", value: person.missingDate, icon: <History sx={{ color: "#1E88E5" }} /> },
                                { label: "Last Seen", value: person.location, icon: <LocationOn sx={{ color: "#E57373" }} /> },
                                { label: "Address", value: person.address, icon: <Home sx={{ color: "#8D6E63" }} /> },
                                { label: "Identification Mark", value: person.mark, icon: <Visibility sx={{ color: "#FBC02D" }} /> },
                                { label: "Description", value: person.description, icon: <Description sx={{ color: "#757575" }} /> },
                            ].map((item, index) => (
                                <Box key={index} sx={{ display: "flex", alignItems: "center", padding: 1, borderBottom: "1px solid #ddd" }}>
                                    {item.icon}
                                    <Typography sx={{ marginLeft: 1, fontWeight: 500 }}>{item.label}:</Typography>
                                    <Typography sx={{ marginLeft: 1 }}>{item.value}</Typography>
                                </Box>
                            ))}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
            <Button
                variant="contained"
                onClick={handleOpen}
                sx={{
                marginTop: "10px",
                backgroundColor: "#fff",
                color: "#000",
                boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                borderRadius: "20px",
                fontSize: {
                    xs: "0.7rem",
                    sm: "0.7rem",
                    md: "0.8rem",
                    lg: "0.9rem",
                },
                // fontWeight: "bold",
                }}
            >
                Marked Found
            </Button>
            <FoundForm open={open} handleClose={handleClose} />
        </Box>
    );
}

export default PersonInfo;