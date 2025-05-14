import { useState, useEffect, useMemo, useRef } from "react";
import {
  Card,
  CardContent,
  Typography,
  Container,
  Box,
  CardActionArea,
  Grid,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";
import Marquee from "react-fast-marquee";

import MissingPersonMap from "./MissingPersonMap";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

function MissingPerson() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const navigate = useNavigate();

  const [missingPersons, setMissingPersons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const mapContainerRef = useRef(null);

  useEffect(() => {
    const fetchMissingPersons = async () => {
      try {
        const res = await fetch(
          "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/missing-persons/"
        );
        const data = await res.json();
        setMissingPersons(data);
      } catch (err) {
        console.error("Failed to fetch missing persons:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMissingPersons();
  }, []);

  const topPersonsByType = useMemo(() => {
    const grouped = missingPersons.reduce((acc, person) => {
      acc[person.eventtype] = acc[person.eventtype] || [];
      acc[person.eventtype].push(person);
      return acc;
    }, {});

    return Object.values(grouped).flatMap((group) => group.slice(0, 5));
  }, [missingPersons]);

  const marqueePersons = missingPersons.slice(0, 3);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: `linear-gradient(rgba(255,255,255,0.95), rgba(255,255,255,0.95)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundAttachment: "fixed",
        paddingTop: "100px",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Marquee */}
          {/* <Grid item xs={12}>
            <Card elevation={2} sx={{ backgroundColor: "#E8F1F5", p: 1 }}>
              <Marquee speed={50} gradient={false}>
                {marqueePersons.map((person) => (
                  <Box
                    key={person.id}
                    onClick={() => setSelectedPerson(person)}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      mx: 3,
                      cursor: "pointer",
                    }}
                  >
                    <Typography fontWeight="bold" sx={{ whiteSpace: "nowrap" }}>
                      • {person.name} - {person.missingDate} - {person.location}
                    </Typography>
                  </Box>
                ))}
              </Marquee>
            </Card>
          </Grid> */}

          {/* Map and Sidebar */}
          <Grid item xs={12} md={8}>
            <Card elevation={3}>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 500 }} ref={mapContainerRef}>
                  {loading ? (
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      height="100%"
                    >
                      <Typography>Loading map...</Typography>
                    </Box>
                  ) : (
                    <MissingPersonMap
                      name={missingPersons.map((p) => p.name)}
                      missingDate={missingPersons.map((p) => p.missingDate)}
                      locations={missingPersons.map((p) => p.location)}
                      selectedPerson={selectedPerson}
                    />
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Person Cards */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ height: 500, overflowY: "auto" }}>
              <CardContent>
                {loading ? (
                  <Typography align="center">Loading data...</Typography>
                ) : missingPersons.length === 0 ? (
                  <Typography align="center">No missing persons found.</Typography>
                ) : (
                  <Grid container spacing={2}>
                    {topPersonsByType.map((person) => (
                      <Grid item xs={12} key={person.id}>
                        <Card
                          onClick={() => setSelectedPerson(person)}
                          sx={{
                            backgroundColor: "#F8FAFB",
                            display: "flex",
                            alignItems: "center",
                            p: 2,
                            cursor: "pointer",
                            "&:hover": {
                              boxShadow: 4,
                              transform: "scale(1.02)",
                            },
                            transition: "0.2s",
                          }}
                        >
                          <Box
                            component="img"
                            src={person.img}
                            alt={person.name}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: "50%",
                              objectFit: "cover",
                              mr: 2,
                              boxShadow: 1,
                            }}
                          />
                          <Box>
                            <Typography fontWeight="bold">{person.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Missing: {person.missingDate}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Location: {person.location}
                            </Typography>
                          </Box>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default MissingPerson;














// import { useState, useEffect, useMemo, useRef } from "react";
// import {
//   Card,
//   CardContent,
//   Typography,
//   Container,
//   Box,
//   CardActionArea,
// } from "@mui/material";
// import Grid from "@mui/material/Grid";
// import Marquee from "react-fast-marquee";
// import useMediaQuery from "@mui/material/useMediaQuery";
// import { useTheme } from "@mui/material/styles";
// import MissingPersonMap from "./MissingPersonMap"; // Keep your existing map component
// import worldMapBackground from "/assets/background_image/world-map-background.jpg";

// const dummyMissingPersons = [
//   {
//     id: 1,
//     name: "Jane Doe",
//     missingDate: "2025-04-15",
//     location: "Manila",
//     img: "/assets/person.png",
//     eventtype: "Flood",
//   },
//   {
//     id: 2,
//     name: "John Smith",
//     missingDate: "2025-04-12",
//     location: "Cebu",
//     img: "/assets/person.png",
//     eventtype: "Earthquake",
//   },
//   {
//     id: 3,
//     name: "Maria Lopez",
//     missingDate: "2025-04-18",
//     location: "Davao",
//     img: "/assets/person.png",
//     eventtype: "Flood",
//   },
//   {
//     id: 4,
//     name: "Maria Lopez",
//     missingDate: "2025-04-18",
//     location: "Davao",
//     img: "/assets/person.png",
//     eventtype: "Flood",
//   },
//   {
//     id: 5,
//     name: "Maria Lopez",
//     missingDate: "2025-04-18",
//     location: "Davao",
//     img: "/assets/person.png",
//     eventtype: "Flood",
//   },
// ];

// function MissingPerson() {
//   const theme = useTheme();
//   const isMobileOrTablet = useMediaQuery(theme.breakpoints.down("md"));
//   const [missingPersonDetails, setMissingPersonDetails] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedPerson, setSelectedPerson] = useState(null);

//   const handlePersonSelect = (person) => {
//     setSelectedPerson(person);
//   };

//   // Simulate API call
//   useEffect(() => {
//     setTimeout(() => {
//       setMissingPersonDetails(dummyMissingPersons);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   const marqueePeople = useMemo(() => missingPersonDetails.slice(0, 3), [missingPersonDetails]);

//   return (
//     <Box
//       sx={{
//         position: "absolute",
//         top: 0,
//         left: 0,
//         right: 0,
//         minHeight: "100vh",
//         background: `
//           linear-gradient(rgba(255, 255, 255, 0.9), rgba(255, 255, 255, 0.9)),
//           url(${worldMapBackground})`,
//         backgroundSize: "cover",
//         backgroundPosition: "center",
//         backgroundAttachment: "fixed",
//         padding: 0,
//       }}
//     >
//       <Container
//         maxWidth="lg"
//         sx={{
//             paddingTop: "100px",
//             paddingBottom: "50px",
//         }}
//       >
//         <Grid container spacing={2}>
//           {/* Marquee */}
//           <Grid item xs={12}>
//             <Card sx={{ background: "transparent", boxShadow: 0 }}>
//               <CardContent sx={{ py: 1 }}>
//                 <Marquee speed={50} gradient={false}>
//                   {marqueePeople.map((person) => (
//                     <Box
//                       key={person.id}
//                       sx={{ display: "flex", alignItems: "center", px: 3, cursor: "pointer" }}
//                       onClick={() => handlePersonSelect(person)}
//                     >
//                       <Box sx={{ fontSize: 24, px: 1 }}>•</Box>
//                       <Typography sx={{ fontWeight: "bold", whiteSpace: "nowrap" }}>
//                         {person.name} - {person.missingDate} - {person.location}
//                       </Typography>
//                     </Box>
//                   ))}
//                 </Marquee>
//               </CardContent>
//             </Card>
//           </Grid>

//           {/* Map Section */}
//           <Grid item xs={12} md={8}>
//                 {loading ? (
//                   <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//                     <Typography>Loading map data...</Typography>
//                   </Box>
//                 ) : (
//                   <MissingPersonMap
//                     name={missingPersonDetails.map((p) => p.name)}
//                     missingDate={missingPersonDetails.map((p) => p.missingDate)}
//                     locations={missingPersonDetails.map((p) => p.location)}
//                     selectedPerson={selectedPerson}
//                   />
//                 )}
//           </Grid>

//           {/* Details Section */}
//           <Grid item xs={12} md={4}>
//             <Card sx={{ height: 500, overflowY: "auto", borderRadius: 2, boxShadow: 3 }}>
//               <CardContent>
//                 {loading ? (
//                   <Box display="flex" justifyContent="center" alignItems="center" height="100%">
//                     <Typography>Loading...</Typography>
//                   </Box>
//                 ) : (
//                   <Grid container spacing={2}>
//                     {missingPersonDetails.map((person) => (
//                       <Grid item xs={12} key={person.id}>
//                         <Card
//                           onClick={() => handlePersonSelect(person)}
//                           sx={{
//                             display: "flex",
//                             flexDirection: "column",
//                             alignItems: "center",
//                             backgroundColor: "#E8F1F5",
//                             borderRadius: 3,
//                             boxShadow: 2,
//                             transition: "transform 0.2s",
//                             "&:hover": {
//                               boxShadow: 6,
//                               transform: "scale(1.01)",
//                             },
//                           }}
//                         >
//                           <CardActionArea>
//                             <CardContent sx={{ textAlign: "center" }}>
//                               <Box
//                                 component="img"
//                                 src={person.img}
//                                 alt={person.name}
//                                 sx={{
//                                   width: 70,
//                                   height: 70,
//                                   borderRadius: "50%",
//                                   objectFit: "cover",
//                                   mb: 1,
//                                   mx: "auto",
//                                   boxShadow: 2,
//                                 }}
//                               />
//                               <Typography fontWeight={600}>{person.name}</Typography>
//                               <Typography fontSize={13} color="text.secondary">
//                                 Missing on: {person.missingDate}
//                               </Typography>
//                               <Typography fontSize={13} color="text.secondary">
//                                 Location: {person.location}
//                               </Typography>
//                             </CardContent>
//                           </CardActionArea>
//                         </Card>
//                       </Grid>
//                     ))}
//                   </Grid>
//                 )}
//               </CardContent>
//             </Card>
//           </Grid>
//         </Grid>
//       </Container>
//     </Box>
//   );
// }

// export default MissingPerson;