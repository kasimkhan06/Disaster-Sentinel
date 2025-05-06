// import React, { useState } from "react";
// import {
//   Card,
//   Typography,
//   Container,
//   CssBaseline,
//   Grid,
//   TextField,
//   Box,
//   Button,
//   IconButton,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   Select,
// } from "@mui/material";

// const AgencyDashboard = () => {
//   return(
//   <Container component="main" maxWidth="md">
//     <Typography variant="h4" sx={{ mb: 3, mt: 10, textAlign: "center" }}>
//       Agency Dashboard Page
//     </Typography>
//   </Container>
//   );
// };

// export default AgencyDashboard;

//working code with api for volunteer management
// import React, { useState, useEffect } from 'react';
// import { Box, Button, TextField, Typography, Modal, Checkbox, FormGroup, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, CircularProgress } from '@mui/material';
// import axios from 'axios';

// const permissionsList = [
//   "can_view_missing", "can_edit_missing", "can_view_announcements", "can_edit_announcements", "can_make_announcements", "can_manage_volunteers", "is_agency_admin"
// ];

// const style = {
//   position: 'absolute',
//   top: '50%',
//   left: '50%',
//   transform: 'translate(-50%, -50%)',
//   width: 400,
//   bgcolor: 'background.paper',
//   border: '2px solid #000',
//   boxShadow: 24,
//   p: 4,
// };

// const BASE_URL = 'https://disaster-sentinel-backend-26d3102ae035.herokuapp.com';

// export default function VolunteerDashboard() {
//   const agencyId = localStorage.getItem('agency_id');

//   const [searchEmail, setSearchEmail] = useState('');
//   const [searchResult, setSearchResult] = useState(null);
//   const [requests, setRequests] = useState([]);
//   const [volunteers, setVolunteers] = useState([]);
//   const [selectedPermissions, setSelectedPermissions] = useState([]);
//   const [openModal, setOpenModal] = useState(false);
//   const [currentVolunteer, setCurrentVolunteer] = useState(null);
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     fetchVolunteerRequests();
//     fetchExistingPermissions();
//   }, []);

//   const fetchVolunteerRequests = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/volunteer-interests/?agency_id=${agencyId}`);
//       setRequests(res.data.filter(req => !req.is_accepted));
//     } catch (error) {
//       console.error('Error fetching volunteer requests:', error);
//     }
//   };

//   const fetchExistingPermissions = async () => {
//     try {
//       const res = await axios.get(`${BASE_URL}/api/agency/${agencyId}/permissions/`);
//       setVolunteers(res.data);
//     } catch (error) {
//       console.error('Error fetching permissions:', error);
//     }
//   };

//   const handleSearch = async () => {
//     if (!searchEmail) return;
//     setLoading(true);
//     try {
//       const res = await axios.get(`${BASE_URL}/api/users/search/?email=${encodeURIComponent(searchEmail)}`);
//       setSearchResult(res.data);
//     } catch (error) {
//       console.error('Error searching user:', error);
//       setSearchResult(null);
//     }
//     setLoading(false);
//   };

//   const handleAcceptRequest = (user) => {
//     setCurrentVolunteer(user);
//     setSelectedPermissions([]);
//     setOpenModal(true);
//   };

//   const handlePermissionChange = (permission) => {
//     setSelectedPermissions(prev =>
//       prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
//     );
//   };

//   const handleGivePermissions = async () => {
//     if (!currentVolunteer) return;

//     try {
//       if (currentVolunteer.id) {
//         // Case: Accepting a volunteer request
//         await axios.post(`${BASE_URL}/api/volunteer-interests/${currentVolunteer.id}/accept/`);
//       }

//       const permissionBody = {};
//       permissionsList.forEach((perm) => {
//         permissionBody[perm] = selectedPermissions.includes(perm);
//       });

//       await axios.put(`${BASE_URL}/api/agency/${agencyId}/permissions/${currentVolunteer.volunteer || currentVolunteer.id}/`, permissionBody);

//       fetchVolunteerRequests();
//       fetchExistingPermissions();
//       setOpenModal(false);
//     } catch (error) {
//       console.error('Error giving permissions:', error);
//     }
//   };

//   const handleSavePermissions = async (memberId, updatedPermissionsArray) => {
//     const permissionBody = {};
//     permissionsList.forEach((perm) => {
//       permissionBody[perm] = updatedPermissionsArray.includes(perm);
//     });

//     try {
//       await axios.put(`${BASE_URL}/api/agency/${agencyId}/permissions/${memberId}/`, permissionBody);
//       fetchExistingPermissions();
//     } catch (error) {
//       console.error('Error updating permissions:', error);
//     }
//   };

//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', p: 2 }}>
//       {/* Header & Sidebar Spaces */}
//       <Box sx={{ height: 60, bgcolor: '#f0f0f0', mb: 2 }}>Header Space</Box>
//       <Box sx={{ display: 'flex', minHeight: 500 }}>
//         <Box sx={{ width: 200, bgcolor: '#f9f9f9', mr: 2 }}>Sidebar Space</Box>

//         {/* Main Content */}
//         <Box sx={{ flexGrow: 1 }}>
//           {/* Search Section */}
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="h6">Search Volunteer</Typography>
//             <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
//               <TextField label="Search by Email" value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} />
//               <Button variant="contained" onClick={handleSearch}>Search</Button>
//             </Box>
//             {loading ? <CircularProgress sx={{ mt: 2 }} /> : searchResult && (
//               <Box sx={{ mt: 2 }}>
//                 <Typography>Name: {searchResult.full_name}</Typography>
//                 <Typography>Email: {searchResult.email}</Typography>
//                 <Button variant="outlined" sx={{ mt: 1 }} onClick={() => handleAcceptRequest(searchResult)}>Add Volunteer</Button>
//               </Box>
//             )}
//           </Box>

//           {/* Requests Section */}
//           <Box sx={{ mb: 3 }}>
//             <Typography variant="h6">Volunteer Requests</Typography>
//             <TableContainer component={Paper} sx={{ maxHeight: 300 }}>
//               <Table stickyHeader>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Name</TableCell>
//                     <TableCell>ID</TableCell>
//                     <TableCell>Email</TableCell>
//                     <TableCell>Note</TableCell>
//                     <TableCell>Action</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {requests.map((req, idx) => (
//                     <TableRow key={idx}>
//                       <TableCell>{req.volunteer_name}</TableCell>
//                       <TableCell>{req.id}</TableCell>
//                       <TableCell>{req.volunteer_email}</TableCell>
//                       <TableCell>{req.message}</TableCell>
//                       <TableCell><Button variant="contained" onClick={() => handleAcceptRequest(req)}>Accept</Button></TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//             <Pagination count={10} sx={{ mt: 1 }} />
//           </Box>

//           {/* Manage Existing Volunteers Section */}
//           <Box>
//             <Typography variant="h6">Manage Existing Permissions</Typography>
//             <TableContainer component={Paper}>
//               <Table>
//                 <TableHead>
//                   <TableRow>
//                     <TableCell>Name</TableCell>
//                     {permissionsList.map((perm, idx) => (
//                       <TableCell key={idx}>{perm.replace(/_/g, ' ')}</TableCell>
//                     ))}
//                     <TableCell>Save</TableCell>
//                   </TableRow>
//                 </TableHead>
//                 <TableBody>
//                   {volunteers.map((vol, idx) => (
//                     <TableRow key={idx}>
//                       <TableCell>{vol.member.full_name}</TableCell>
//                       {permissionsList.map((perm, pidx) => (
//                         <TableCell key={pidx}>
//                           <Checkbox
//                             checked={vol[perm]}
//                             onChange={(e) => {
//                               const updated = permissionsList.filter(p => vol[p] || p === perm && e.target.checked);
//                               handleSavePermissions(vol.member.id, updated);
//                             }}
//                           />
//                         </TableCell>
//                       ))}
//                       <TableCell>
//                         <Button variant="outlined" onClick={() => handleSavePermissions(vol.member.id, permissionsList.filter(p => vol[p]))}>Save</Button>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             </TableContainer>
//             <Pagination count={10} sx={{ mt: 1 }} />
//           </Box>

//           {/* Permission Popup Modal */}
//           <Modal open={openModal} onClose={() => setOpenModal(false)}>
//             <Box sx={style}>
//               <Typography variant="h6">Grant Permissions</Typography>
//               <FormGroup>
//                 {permissionsList.map((perm, idx) => (
//                   <FormControlLabel
//                     control={<Checkbox checked={selectedPermissions.includes(perm)} onChange={() => handlePermissionChange(perm)} />}
//                     label={perm.replace(/_/g, ' ')}
//                     key={idx}
//                   />
//                 ))}
//               </FormGroup>
//               <Button variant="contained" sx={{ mt: 2 }} onClick={handleGivePermissions}>Give Permissions</Button>
//             </Box>
//           </Modal>
//         </Box>
//       </Box>
//     </Box>
//   );
// }

import React, { useState } from 'react';
import { Box, Button, TextField, Typography, Modal, Checkbox, FormGroup, FormControlLabel, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Pagination, CircularProgress } from '@mui/material';
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

const permissionsList = [
  "can_view_missing",
  "can_edit_missing",
  "can_view_announcements",
  "can_edit_announcements",
  "can_make_announcements",
  "can_manage_volunteers",
  "is_agency_admin"
];

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

// For now, skipping BASE_URL and API call logic to make it fully testable

export default function AgencyDashboard() {
  const agencyId = localStorage.getItem('agency_id') || '123'; // fallback dummy ID
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [requests, setRequests] = useState([
    { id: 1, volunteer_name: 'Alice Johnson', volunteer_email: 'alice@example.com', message: 'Want to help in rescue' },
    { id: 2, volunteer_name: 'Bob Smith', volunteer_email: 'bob@example.com', message: 'I have a medical background' },
  ]);
  const [volunteers, setVolunteers] = useState([
    {
      member: { id: 11, full_name: 'Charlie Brown', email: 'charlie@example.com', contact: '9998887777' },
      can_view_missing: true,
      can_edit_missing: false,
      can_view_announcements: true,
      can_edit_announcements: false,
      can_make_announcements: true,
      can_manage_volunteers: false,
      is_agency_admin: false,
    },
    {
      member: { id: 12, full_name: 'Dana White', email: 'dana@example.com', contact: '8887776666' },
      can_view_missing: true,
      can_edit_missing: true,
      can_view_announcements: true,
      can_edit_announcements: true,
      can_make_announcements: false,
      can_manage_volunteers: true,
      is_agency_admin: false,
    }
  ]);

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => { // Simulating API delay
      setSearchResult({
        id: 99,
        full_name: 'Test User',
        email: searchEmail,
      });
      setLoading(false);
    }, 1000);
  };

  const handleAcceptRequest = (user) => {
    setCurrentVolunteer(user);
    setSelectedPermissions([]);
    setOpenModal(true);
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions(prev =>
      prev.includes(permission) ? prev.filter(p => p !== permission) : [...prev, permission]
    );
  };

  const handleGivePermissions = () => {
    if (currentVolunteer) {
      const newVolunteer = {
        member: {
          id: currentVolunteer.volunteer || currentVolunteer.id,
          full_name: currentVolunteer.volunteer_name || currentVolunteer.full_name,
          email: currentVolunteer.volunteer_email || currentVolunteer.email,
          contact: 'N/A'
        },
      };
      permissionsList.forEach(perm => {
        newVolunteer[perm] = selectedPermissions.includes(perm);
      });

      setVolunteers(prev => [...prev, newVolunteer]);
      setRequests(prev => prev.filter(r => r.id !== currentVolunteer.id));
      setOpenModal(false);
    }
  };

  const handleSavePermissions = (memberId, updatedPermissionsArray) => {
    const updatedVolunteers = volunteers.map(vol => {
      if (vol.member.id === memberId) {
        const updatedVol = { ...vol };
        permissionsList.forEach(perm => {
          updatedVol[perm] = updatedPermissionsArray.includes(perm);
        });
        return updatedVol;
      }
      return vol;
    });
    setVolunteers(updatedVolunteers);
  };

  return (
    <Box sx={{ 
                 position: "relative", minHeight: "100vh",
                 background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${worldMapBackground})`,
                 backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed", backgroundRepeat: "repeat-y",
                 overflowX: "hidden",
                 overflowY: "hidden",
                 marginTop:"65px", display: 'flex', flexDirection: 'column', 
                 p: { xs: 1, sm: 2, md: 3 }
            }}>
      {/* Header & Sidebar Spaces */}
      {/* <Box sx={{ height: 60, bgcolor: '#f0f0f0', mb: 2 }}>Header Space</Box> */}
      <Box sx={{ display: { xs: 'block', md: 'flex' }, minHeight: 'calc(100vh - 80px)' }}>
        <Box sx={{
            width: { xs: '100%', md: 300 },
            bgcolor: '#f9f9f9',
            mb: { xs: 2, md: 0 },
            mr: { md: 2 },
            p: 2,
            borderRadius: 2
          }}>Sidebar Space
        </Box>

        {/* Main Content */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Search Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Search Volunteer</Typography>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 1, alignItems: { xs: 'stretch', sm: 'center' } }}>
              <TextField
                placeholder="Search by Email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                sx={{
                  borderBottom: "2px solid #eee",
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "white",
                    "& fieldset": { borderColor: "transparent" },
                    "&:hover fieldset": { borderColor: "transparent" },
                    "&.Mui-focused fieldset": { borderColor: "transparent" },
                  },
                  width: { xs: "100%", md: "300px" },
                }}
              />
              <Button 
                disableRipple
                // sx={{ height: '40px', width: { xs: '100%', sm: 'auto' } }}
                onClick={() => handleSearch(searchEmail)}
              >
                Search
              </Button>
          </Box>

          {/* Loading or Found Person Section */}
          {loading ? (
            <CircularProgress sx={{ mt: 2 }} />
          ) : (
            searchResult && (
              <Box sx={{ mt: 2 }}>
                <Typography>Name: {searchResult.full_name}</Typography>
                <Typography>Email: {searchResult.email}</Typography>
                <Button disableRipple sx={{ mt: 1 }} onClick={() => handleAcceptRequest(searchResult)}>
                  Add Volunteer
                </Button>
              </Box>
            )
          )}
        </Box>

          {/* Requests Section */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6">Volunteer Requests</Typography>
            <TableContainer component={Paper} sx={{ maxHeight: 300, overflowX: 'auto' }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>ID</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Note</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.map((req, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{req.volunteer_name}</TableCell>
                      <TableCell>{req.id}</TableCell>
                      <TableCell>{req.volunteer_email}</TableCell>
                      <TableCell>{req.message}</TableCell>
                      <TableCell>
                        <Button disableRipple onClick={() => handleAcceptRequest(req)}>Accept</Button>
                        </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <Pagination count={1} sx={{ mt: 1 }} />
          </Box>

          {/* Manage Existing Volunteers Section */}
          <Box>
            <Typography variant="h6">Manage Existing Permissions</Typography>
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    {permissionsList.map((perm, idx) => (
                      <TableCell key={idx}>{perm.replace(/_/g, ' ')}</TableCell>
                    ))}
                    <TableCell>Save</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {volunteers.map((vol, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{vol.member.full_name}</TableCell>

                      {permissionsList.map((perm, pidx) => (
                        <TableCell key={pidx}>
                          <Checkbox
                            checked={vol[perm]}
                            onChange={(e) => {
                              const updatedVolunteers = [...volunteers];
                              updatedVolunteers[idx][perm] = e.target.checked;
                              setVolunteers(updatedVolunteers);
                            }}
                          />
                        </TableCell>
                      ))}

                      <TableCell>
                        <Button
                        disableRipple
                          // variant="outlined"
                          onClick={() => {
                            const updatedPermissions = permissionsList.filter(p => volunteers[idx][p]);
                            handleSavePermissions(vol.member.id, updatedPermissions);
                          }}
                        >
                          Save
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>

              </Table>
            </TableContainer>
            <Pagination count={1} sx={{ mt: 1 }} />
          </Box>

          {/* Permission Popup Modal */}
          <Modal open={openModal} onClose={() => setOpenModal(false)}>
            <Box sx={style}>
              <Typography variant="h6">Grant Permissions</Typography>
              <FormGroup>
                {permissionsList.map((perm, idx) => (
                  <FormControlLabel
                    control={<Checkbox checked={selectedPermissions.includes(perm)} onChange={() => handlePermissionChange(perm)} />}
                    label={perm.replace(/_/g, ' ')}
                    key={idx}
                  />
                ))}
              </FormGroup>
              <Button variant="contained" sx={{ mt: 2 }} onClick={handleGivePermissions}>Give Permissions</Button>
            </Box>
          </Modal>
        </Box>
      </Box>
    </Box>
  );
}
