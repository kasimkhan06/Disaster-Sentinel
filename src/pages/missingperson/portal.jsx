import React, { useState } from "react";
import { Box, Tabs, Tab, Container, Paper, Typography } from "@mui/material";
import MissingPersonForm from "./form";

export default function MissingPersonPortal() {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
        {/* Tab Navigation */}
        <Tabs value={selectedTab} onChange={(e, newValue) => setSelectedTab(newValue)} centered>
          <Tab label="Report Missing Person" />
          <Tab label="Check Status" />
          <Tab label="Search for Missing Person" />
        </Tabs>

        {/* Tab Content */}
        <Box sx={{ mt: 3 }}>
          {selectedTab === 0 && <MissingPersonForm />} 
          {selectedTab === 1 && <Typography>Check Status Section (Coming Soon...)</Typography>}
          {selectedTab === 2 && <Typography>Search for Missing Person Section (Coming Soon...)</Typography>}
        </Box>
      </Paper>
    </Container>
  );
}
