// import React, { useState } from "react";
// import { Container, Grid, Paper, List, ListItemButton, ListItemText, Typography, Box } from "@mui/material";

// const categories = [
//   "Cyclones", "Earthquakes", "Tsunamis", "Floods", "Landslides", "Fire", "Heatwave"
// ];

// const dosDonts = {
//   Cyclones: {
//     dos: [
//       "Keep away from windows and use sturdy furniture or a mattress as cover in case of flying debris.",
//       "Include first aid supplies, water, non-perishable food, flashlights, batteries, and essential documents.",
//       "Follow weather updates from reliable sources and heed warnings or instructions from authorities.",
//       "Secure loose items, unplug electrical appliances.",
//       "Move to designated shelters or safe areas if authorities instruct you to evacuate.",
//       "Remain indoors in a safe structure until the cyclone has completely passed.",
//       "Assist children, the elderly, and those with disabilities in preparing and evacuating."
//     ],
//     donts: [
//       "Avoid using electrical equipment during heavy rains or flooding to prevent shocks.",
//       "Avoid venturing outside, even if it seems calm (the eye of the storm).",
//       "Avoid complacency and dismissing official advice or warnings.",
//       "Don’t share unverified information to avoid panic.",
//       "Ensure pets are in a safe and secure environment.",
//       "Avoid parking near large trees or structures that might collapse.",
//       "Avoid walking, driving, or swimming in floodwaters."
//     ]
//   }
// };

// export default function DosDontsPage() {
//   const [selectedCategory, setSelectedCategory] = useState("Cyclones");

//   return (
//     <Box
//       sx={{
//         height: "100vh", // Full viewport height
//         width: "100vw", // Full viewport width
//         overflow: "hidden", // Prevent scrolling
//         display: "flex",
//         flexDirection: "column",
//         backgroundColor: "#f5f5f5",
//       }}
//     >

//       {/* Content Section (Takes up remaining space) */}
//       <Box sx={{ flexGrow: 1, display: "flex", overflow: "hidden", marginTop: "70px" }}>
//         <Container maxWidth="lg" sx={{ flexGrow: 1, padding: 0, display: "flex", height: "100%" }}>
//           <Grid container spacing={2} sx={{ flexGrow: 1 }}>
//             {/* Sidebar */}
//             <Grid item xs={12} sm={3}>
//               <Paper sx={{ height: "100%", overflow: "hidden" }}>
//                 <List>
//                   {categories.map((category) => (
//                     <ListItemButton key={category} onClick={() => setSelectedCategory(category)}>
//                       <ListItemText primary={category} />
//                     </ListItemButton>
//                   ))}
//                 </List>
//               </Paper>
//             </Grid>

//             {/* Main Content */}
//             <Grid item xs={12} sm={9}>
//               <Paper sx={{ padding: 2, width: "100%", height: "100%" }}>
//                 <Typography variant="h5" gutterBottom>
//                   Do’s and Don’ts for {selectedCategory}
//                 </Typography>
//                 <Grid container spacing={2}>
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="h6">Do’s</Typography>
//                     <Box component="ul">
//                       {dosDonts[selectedCategory]?.dos.map((item, index) => (
//                         <li key={index}>{item}</li>
//                       ))}
//                     </Box>
//                   </Grid>
//                   <Grid item xs={12} sm={6}>
//                     <Typography variant="h6">Don’ts</Typography>
//                     <Box component="ul">
//                       {dosDonts[selectedCategory]?.donts.map((item, index) => (
//                         <li key={index}>{item}</li>
//                       ))}
//                     </Box>
//                   </Grid>
//                 </Grid>
//               </Paper>
//             </Grid>
//           </Grid>
//         </Container>
//       </Box>
//     </Box>
//   );
// }


import React, { useState } from "react";
import {
  Container,
  Grid,
  Paper,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  Box,
  Card,
  CardContent
} from "@mui/material";
import Header from "../../components/Header"; // Adjust path as needed

// Categories of Disasters
const categories = ["Cyclones", "Earthquakes", "Tsunamis", "Floods", "Landslides", "Fire", "Heatwave"];

// Do’s & Don’ts Data
const dosDonts = {
  Cyclones: {
    dos: [
      "Keep away from windows and use sturdy furniture or a mattress as cover in case of flying debris.",
      "Include first aid supplies, water, non-perishable food, flashlights, batteries, and essential documents.",
      "Follow weather updates from reliable sources and heed warnings or instructions from authorities.",
      "Secure loose items, unplug electrical appliances.",
      "Move to designated shelters or safe areas if authorities instruct you to evacuate.",
      "Remain indoors in a safe structure until the cyclone has completely passed.",
      "Assist children, the elderly, and those with disabilities in preparing and evacuating."
    ],
    donts: [
      "Avoid using electrical equipment during heavy rains or flooding to prevent shocks.",
      "Avoid venturing outside, even if it seems calm (the eye of the storm).",
      "Avoid complacency and dismissing official advice or warnings.",
      "Don’t share unverified information to avoid panic.",
      "Ensure pets are in a safe and secure environment.",
      "Avoid parking near large trees or structures that might collapse.",
      "Avoid walking, driving, or swimming in floodwaters."
    ]
  }
};

export default function DosDontsPage() {
  const [selectedCategory, setSelectedCategory] = useState("Cyclones");

  return (
    <>
      {/* Header Component */}
      <Header />

      {/* Main Content */}
      <Box
        sx={{
          height: "calc(100vh - 70px)", // Adjust height to account for header
          width: "100vw",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#f5f5f5",
          padding: 2,
          marginTop: "80px" // Space below header
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={2}>
            {/* Sidebar for Disaster Categories */}
            <Grid item xs={12} sm={3}>
              <Paper sx={{ height: "100%", padding: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Do’s & Don’ts
                </Typography>
                <List>
                  {categories.map((category) => (
                    <ListItemButton
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      sx={{
                        backgroundColor: selectedCategory === category ? "#2196f3" : "transparent",
                        color: selectedCategory === category ? "#fff" : "#000",
                        marginBottom: "8px",
                        borderRadius: "5px",
                      }}
                    >
                      <ListItemText primary={category} />
                    </ListItemButton>
                  ))}
                </List>
              </Paper>
            </Grid>

            {/* Main Content Display */}
            <Grid item xs={12} sm={9}>
              <Paper sx={{ padding: 2 }}>
                <Typography variant="h5" gutterBottom>
                  Do’s and Don’ts for {selectedCategory}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ backgroundColor: "#e8f5e9" }}>
                      <CardContent>
                        <Typography variant="h6" color="green">Do’s</Typography>
                        <Box component="ul">
                          {dosDonts[selectedCategory]?.dos.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Card sx={{ backgroundColor: "#ffebee" }}>
                      <CardContent>
                        <Typography variant="h6" color="red">Don’ts</Typography>
                        <Box component="ul">
                          {dosDonts[selectedCategory]?.donts.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </Paper>
            </Grid>
          </Grid>

          {/* Video Section */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
              Safety Videos
            </Typography>
            <Grid container spacing={2}>
              {[1, 2, 3, 4].map((video, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <iframe
                    width="100%"
                    height="150"
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    title="Safety Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </Grid>
              ))}
            </Grid>
          </Box>

          {/* Workshop Notification Section */}
          <Box sx={{ marginTop: 4 }}>
            <Typography variant="h5" gutterBottom>
              Upcoming Safety Workshops
            </Typography>
            <Paper sx={{ padding: 2 }}>
              <Typography variant="body1">No upcoming workshops at the moment. Check back later!</Typography>
            </Paper>
          </Box>
        </Container>
      </Box>
    </>
  );
}

