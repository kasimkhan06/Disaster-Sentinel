import { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  CardActionArea,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TablePagination,
  TextField,
  MenuItem,
  InputAdornment,
  IconButton,
  Select,
  FormControl,
  InputLabel,
  Autocomplete,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import Marquee from "react-fast-marquee";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MissingPersonMap from "./MissingPersonMap";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import { useNavigate } from "react-router-dom";

function MissingPerson() {
    const rows = [
        { 
            id: 1, 
            name: "John Doe", 
            location: "Panjim", 
            address: "Altino Panjim", 
            missingDate: "10 Jan 2023", 
            gender: "Male", 
            mark: "Scar on the left eye", 
            age: 30, 
            img: "/assets/person.png",
            description: "Last seen near Altino Panjim wearing a blue shirt and jeans. Scar on the left eye."
        },
        { 
            id: 2, 
            name: "Jane Doe", 
            location: "Margao", 
            address: "Fatorda, Margao", 
            missingDate: "15 Feb 2023", 
            gender: "Female", 
            mark: "Mole on the right cheek", 
            age: 25, 
            img: "/assets/person.png",
            description: "Disappeared from Fatorda, Margao. Last seen wearing a red dress near the bus stand."
        },
        { 
            id: 3, 
            name: "John Smith", 
            location: "Mapusa", 
            address: "Karaswada, Mapusa", 
            missingDate: "05 Mar 2023", 
            gender: "Male", 
            mark: "Tattoo on left arm", 
            age: 40, 
            img: "/assets/person.png",
            description: "Left home for work and did not return. Has a tribal tattoo on his left arm."
        },
        { 
            id: 4, 
            name: "Emily Johnson", 
            location: "Mormugao", 
            address: "Dabolim, Vasco", 
            missingDate: "12 Apr 2023", 
            gender: "Female", 
            mark: "Burn mark on right hand", 
            age: 35, 
            img: "/assets/person.png",
            description: "Was last seen near Dabolim railway station. Recognizable by a burn mark on her right hand."
        },
        { 
            id: 5, 
            name: "Michael Brown", 
            location: "Ponda", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Last seen at the Ponda market. Has a noticeable gap between his front teeth."
        },
        { 
            id: 6, 
            name: "Raju", 
            location: "Ponda", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Seen last near a tea stall at Farmagudi. He has a distinct gap in his front teeth."
        },
        { 
            id: 7, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Went missing near Valpoi bus stop. Wore a white shirt and black pants."
        },
        { 
            id: 8, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Reported missing from a roadside eatery in Valpoi. Had a small bag with him."
        },
        { 
            id: 9, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Reported missing from a roadside eatery in Valpoi. Had a small bag with him."
        },
        { 
            id: 10, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Reported missing from a roadside eatery in Valpoi. Had a small bag with him."
        },
        { 
            id: 11, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Reported missing from a roadside eatery in Valpoi. Had a small bag with him."
        },
        { 
            id: 12, 
            name: "Michael Doe", 
            location: "Valpoi", 
            address: "Farmagudi, Ponda", 
            missingDate: "20 May 2023", 
            gender: "Male", 
            mark: "Gap between front teeth", 
            age: 50, 
            img: "/assets/person.png",
            description: "Reported missing from a roadside eatery in Valpoi. Had a small bag with him."
        }
    ];     

    const theme = useTheme();
    const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
    const isBelow = useMediaQuery("(max-width:1470px)");
    const navigate = useNavigate();

    const [recentMissingPersons, setRecentMissingPersons] = useState([]);
    const [missingPersonDetails, setMissingPersonDetails] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);

    const handlePersonSelect = (person) => {
        setSelectedPerson(person);
    };

    const slicedMissingPerson = useMemo(() => {
        const MPByType = recentMissingPersons.reduce((acc, person) => {
            if (!acc[person.eventtype]) {
            acc[person.eventtype] = [];
            }
            acc[person.eventtype].push(person);
            return acc;
        }, {});

        // Get top 5 disasters per type and flatten the array
        return Object.values(MPByType).flatMap((persons) =>
            persons.slice(0, 5)
        );
    }, [recentMissingPersons]);

    // Fetch recent disasters from API
    // useEffect(() => {
    //     const fetchRecentMP = async () => {
    //     try {
    //         // Replace with your actual API call
    //         const response = await fetch(
    //         "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/disasters/"
    //         );
    //         const data = await response.json();
    //         console.log("Fetched recent Missing Persons:", data);
    //         setRecentMissingPersons(data);
    //         setLoading(false);
    //     } catch (error) {
    //         console.error("Error fetching recent Missing Persons:", error);
    //         setLoading(false);
    //     }
    //     };

    //     fetchRecentMP();
    // }, []);

    const [highlightedPerson, setHighlightedPerson] = useState(null);

    const mapContainerRef = useRef(null);
  
    // Get the 3 most recent Missing Persons for the marquee
    const recentPersonsForMarquee = recentMissingPersons.slice(0, 3);

    return (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            minHeight: "100vh",
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
            zIndex: 0, // Only needed if you have other elements with zIndex
          }}
        >
          <Container
            maxWidth={false}
            sx={{
              mt: "100px",
              mb: 4,
              width: { sm: "90%", md: "85%", lg: "75%" },
              padding: 0,
              marginLeft: "auto", // Centers the container
              marginRight: "auto",
            }}
          >
            <Grid container spacing={1}>
                {/* Marquee for most recent disasters */}
                <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                    <Card
                    sx={{
                        borderRadius: 0,
                        boxShadow: 0,
                        border: "none",
                        background: "transparent",
                        width: "100%",
                        margin: "0 auto",
                    }}
                    >
                        <CardContent
                            sx={{
                            py: 1,
                            backgroundColor: "transparent",
                            display: "flex",
                            alignItems: "center",
                            overflow: "hidden",
                            "&.MuiCardContent-root": {
                                paddingBottom: "8px",
                            },
                            border: "none",
                            boxShadow: "none",
                            }}
                        >
                            {/* Scrolling content container */}
                            <Box
                            sx={{
                                width: "100%",
                                overflow: "hidden",
                                position: "relative",
                                border: "none",
                            }}
                            >
                                {/* Scrolling content using react-fast-marquee
                                <Marquee speed={50} gradient={false}>
                                    {rows.map((person, index) => (
                                        <Box
                                        key={person.id}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            px: 3,
                                            cursor: "pointer",
                                        }}
                                        onClick={() => handlePersonSelect(person)}
                                        >
                                        <Box
                                            sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            width: "6px",
                                            mx: 1,
                                            }}
                                        >
                                            •
                                        </Box>
                                        <Typography
                                            variant="h6"
                                            sx={{
                                            fontWeight: "bold",
                                            color: "rgba(45, 45, 68, 0.87)",
                                            whiteSpace: "nowrap",
                                            }}
                                        >
                                            {person.name} - {person.missingDate} - {person.location}
                                        </Typography>
                                        </Box>
                                    ))}
                                </Marquee> */}
                            </Box>
                        </CardContent>
                    </Card>
                </Grid>
                {/* Map Section (75% width) */}
                <Grid
                    size={{ xs: 12, sm: 12, md: 12, lg: 12 }}
                    sx={{
                    mb: 2, // or whatever value you prefer
                    }}
                    ref={mapContainerRef}
                >
                    <Card
                    sx={{ borderRadius: 2, boxShadow: 3, height: "100%", padding: 1 }}
                    >
                    <CardContent
                        sx={{
                        p: 0,
                        height: "100%",
                        "&.MuiCardContent-root": {
                            paddingBottom: "0px", // or whatever value you prefer
                        },
                        }}
                    >
                        <Box sx={{ height: "500px", width: "100%" }}>
                        {loading ? (
                            <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                            >
                            <Typography>Loading map data...</Typography>
                            </Box>
                        ) : (
                            <MissingPersonMap
                                name={rows.map(row => row.name)}
                                missingDate={rows.map(row => row.missingDate)}
                                locations={rows.map(row => row.location)}
                                selectedPerson={selectedPerson}
                            />
                        )}
                        </Box>
                    </CardContent>
                    </Card>
                </Grid>

                {/* Missing Person Details Section (25% width) */}
                <Card sx={{ height: 500, display: "flex", flexDirection: "column", borderRadius: 2, boxShadow: 3 }}>
                    <CardContent sx={{ flexGrow: 1, overflowY: "auto", p: 2 }}>
                        <Grid
                        container
                        spacing={2}
                        sx={{
                            pr: 1, // padding right for scrollbar space
                        }}
                        >
                        {rows.map((person) => (
                            <Grid item xs={12} sm={6} md={6} key={person.id}>
                                <Card
                                    onClick={() => handlePersonSelect(person)}
                                    sx={{
                                        borderRadius: 3,
                                        backgroundColor: "#E8F1F5",
                                        boxShadow: "2px 2px 8px rgba(0,0,0,0.1)",
                                        "&:hover": {
                                            boxShadow: 6,
                                            transform: "scale(1.01)",
                                        },
                                        transition: "transform 0.2s ease-in-out",
                                        height: { xs: 180, md: 220 },
                                        display: "flex",
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                <CardActionArea sx={{ width: "100%", height: "100%" }}>
                                    <CardContent
                                        sx={{
                                        textAlign: "center",
                                        display: "flex",
                                        flexDirection: "column",
                                        justifyContent: "center",
                                        height: "100%",
                                        }}
                                    >
                                        <Box
                                            component="img"
                                            src={person.img}
                                            alt={person.name}
                                            sx={{
                                                width: 70,
                                                height: 70,
                                                borderRadius: "50%",
                                                objectFit: "cover",
                                                mb: 1,
                                                mx: "auto",
                                                boxShadow: 2,
                                            }}
                                        />
                                        <Typography
                                            sx={{
                                                fontSize: {
                                                xs: "1rem",
                                                sm: "1.05rem",
                                                md: "1.1rem",
                                                },
                                                fontWeight: 600,
                                                color: "text.primary",
                                                mb: 0.5,
                                            }}
                                        >
                                            {person.name}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: { xs: 13, sm: 14 },
                                                mb: 0.3,
                                            }}
                                        >
                                            Missing on: {person.missingDate}
                                        </Typography>
                                        <Typography
                                            sx={{
                                                color: "text.secondary",
                                                fontSize: { xs: 13, sm: 14 },
                                            }}
                                        >
                                            Location: {person.location}
                                        </Typography>
                                    </CardContent>
                                </CardActionArea>
                            </Card>
                            </Grid>
                        ))}
                        </Grid>
                    </CardContent>
                </Card>
            </Grid>
          </Container>
        </Box>
    );
};

export default MissingPerson;