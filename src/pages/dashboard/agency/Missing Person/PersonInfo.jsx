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
                        name="foundLocation"
                        value={formData.foundLocation}
                        onChange={handleChange}
                        sx={{ my: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
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
                        sx={{ my: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    />
                    <TextField
                        fullWidth
                        label="Current Location"
                        variant="standard"
                        name="currentLocation"
                        value={formData.currentLocation}
                        onChange={handleChange}
                        sx={{ my: 1, fontSize: { xs: "0.9rem", sm: "1rem" } }}
                    />
                    <FormControl fullWidth variant="standard" sx={{ my: 1 }}>
                        <InputLabel sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}>Found State</InputLabel>
                        <Select
                            name="foundState"
                            value={formData.foundState}
                            onChange={handleChange}
                            sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
                        >
                            <MenuItem value="Alive and Safe">Unharmed</MenuItem>
                            <MenuItem value="Injured">Injured</MenuItem>
                            <MenuItem value="Deceased">Deceased</MenuItem>
                        </Select>
                    </FormControl>
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
            <Grid container spacing={3} sx={{ maxWidth: "1200px", width: "100%" }}>
                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={12}
                    lg={4}
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        mt: { xs: 4, sm: 6, md: 2, lg: 3 },
                        p: { xs: 1, sm: 2, md: 3, lg: 4 },
                    }}
                >
                    <Box
                        component="img"
                        src={person.person_photo ? `https://res.cloudinary.com/doxgltggk/${person.person_photo}` : "/assets/person.png"}
                        alt="Profile"
                        sx={{
                            width: { xs: "100%", sm: "70%", md: "65%", lg: "90%" },
                            maxWidth: {md: 300, lg: 500},
                            height: "auto",
                            borderRadius: "10px",
                            border: "3px solid black",
                            objectFit: "cover",
                            mx: "auto",
                            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.2)",
                        }}
                    />
                </Grid>
                <Grid
                    item
                    xs={12}
                    sm={6}
                    md={7}
                    lg={8}
                    sx={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center", 
                        mx: "auto",
                        maxWidth: { xs: "100%", md: "80%" }, 
                    }}>
                    <Card
                        sx={{
                            p: { xs: 2, md: 3 },
                            boxShadow: "none",
                            border: "none",
                            bgcolor: "background.paper",
                        }}
                    >
                        <CardContent>
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
                        </CardContent>
                    </Card>
                </Grid>
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
            <FoundForm open={open} handleClose={handleClose} />
        </Box>
    );
}

export default PersonInfo;