import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Modal,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Pagination,
  useTheme,
  useMediaQuery,
  Stack,
} from "@mui/material";
import worldMapBackground from "/assets/background_image/world-map-background.jpg";
import Footer from "../../components/Footer";
import { Grid } from "@mui/material";
import { useNavigate } from "react-router-dom";

import PersonSearchIcon from "@mui/icons-material/PersonSearch";
import EventIcon from "@mui/icons-material/Event";

const permissionsList = [
  "can_view_missing",
  "can_edit_missing",
  "can_view_announcements",
  "can_edit_announcements",
  "can_make_announcements",
  // "can_manage_volunteers", // Keep commented as per original code
  // "is_agency_admin",     // Keep commented as per original code
];

// Adjusted style object for responsive modals
const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "90%", sm: 400 }, // Responsive width: 90% on small screens, 400px on larger
  maxWidth: "95%", // Ensures it doesn't get too wide on very large screens
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
  outline: "none", // Removes the focus outline for better aesthetics
  maxHeight: "90vh", // Limits the maximum height of the modal to 90% of viewport height
  overflowY: "auto", // Enables vertical scrolling if content exceeds maxHeight
};

const API_BASE_URL =
  "https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api";

export default function AgencyDashboard() {
  const [agencyId, setAgencyId] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [agency, setAgency] = useState(null);
  const [statusMessage, setStatusMessage] = useState({ type: "", text: "" });
  const [volunteersCount, setVolunteersCount] = useState(null);

  const navigate = useNavigate();

  const [searchEmail, setSearchEmail] = useState("");
  const [searchResult, setSearchResult] = useState(null);

  const [requests, setRequests] = useState([]);
  const [volunteers, setVolunteers] = useState([]);

  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [openModal, setOpenModal] = useState(false);
  const [currentVolunteer, setCurrentVolunteer] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [loadingVolunteers, setLoadingVolunteers] = useState(false);
  const [loadingAction, setLoadingAction] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const successTimerRef = useRef(null);
  const errorTimerRef = useRef(null);

  const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);

  const [
    confirmVolunteerPermissionsDelete,
    setConfirmVolunteerPermissionsDelete,
  ] = useState(false);
  const [volunteerPermissionsToDelete, setVolunteerPermissionsToDelete] =
    useState(null);

  const [requestsPage, setRequestsPage] = useState(1);
  const [volunteersPage, setVolunteersPage] = useState(1);
  const volunteersPerPage = 4;
  const requestsPerPage = 2;

  const [openNoteModal, setOpenNoteModal] = useState(false);
  const [currentNote, setCurrentNote] = useState("");
  const [currentNoteVolunteerName, setCurrentNoteVolunteerName] = useState("");

  // Media query hooks
  const theme = useTheme();
  // isPhoneOrSmaller will be true for xs, sm (phones/small tablets)
  const isPhoneOrSmaller = useMediaQuery(theme.breakpoints.down("md"));
  // isTabletOrSmaller is still used for layout of main sections, true for xs, sm, md
  const isTabletOrSmaller = useMediaQuery(theme.breakpoints.down("lg"));
  // isBelow1470 is for more granular control for font sizes etc.
  const isBelow1470 = useMediaQuery("(max-width:1470px)");

  useEffect(() => {
    let idToUse = localStorage.getItem("agency_id");
    if (!idToUse) {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const userObject = JSON.parse(userString);
          if (
            userObject &&
            userObject.role === "agency" &&
            userObject.user_id
          ) {
            idToUse = userObject.user_id.toString();
          }
        } catch (e) {
          console.error(
            "[AgencyDashboard] Failed to parse 'user' for fallback agency_id",
            e
          );
        }
      }
    }
    if (idToUse) {
      setAgencyId(idToUse);
      fetchAgencyDetails(idToUse);
    } else {
      showErrorWithTimeout(
        "Agency ID is missing and could not be derived. Please ensure you are logged in correctly for the dashboard to function."
      );
    }
  }, []);

  useEffect(() => {
    return () => {
      if (successTimerRef.current) {
        clearTimeout(successTimerRef.current);
      }
      if (errorTimerRef.current) {
        clearTimeout(errorTimerRef.current);
      }
    };
  }, []);

  const clearMessages = () => {
    setError("");
    setSuccessMessage("");
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
  };

  const showSuccessWithTimeout = (message) => {
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    if (errorTimerRef.current) {
      clearTimeout(errorTimerRef.current);
      errorTimerRef.current = null;
    }
    setError("");
    setSuccessMessage(message);
    successTimerRef.current = setTimeout(() => {
      setSuccessMessage("");
      successTimerRef.current = null;
    }, 3000);
  };

  const showErrorWithTimeout = (message) => {
    if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
    if (successTimerRef.current) {
      clearTimeout(successTimerRef.current);
      successTimerRef.current = null;
    }
    setSuccessMessage("");
    setError(message);
    errorTimerRef.current = setTimeout(() => {
      setError("");
      errorTimerRef.current = null;
    }, 5000);
  };

  const fetchAgencyVolunteers = async () => {
    if (!agencyId) return;
    setLoadingVolunteers(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to fetch agency volunteers" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      const data = await response.json();
      setVolunteers(data);
      setVolunteersPage(1);
    } catch (apiError) {
      console.error("Failed to fetch agency volunteers:", apiError);
      showErrorWithTimeout(
        `Failed to fetch agency volunteers: ${apiError.message}`
      );
    } finally {
      setLoadingVolunteers(false);
    }
  };

  const fetchRequests = async () => {
    if (!agencyId) return;
    setLoadingRequests(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteer-interests/?agency_id=${agencyId}`
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to fetch volunteer requests" }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
      let data = await response.json();
      data.sort((a, b) => b.id - a.id);
      const formattedRequests = data
        .map((req) => ({
          id: req.id,
          volunteer_user_id: req.volunteer,
          volunteer_name: req.volunteer_name || `User ID: ${req.volunteer}`,
          volunteer_email: req.volunteer_email || "N/A",
          volunteer_contact: req.volunteer_contact || "N/A",
          message: req.message || "No message provided.",
          is_accepted: req.is_accepted,
        }))
        .filter((req) => !req.is_accepted);
      setRequests(formattedRequests);
      setRequestsPage(1);
    } catch (apiError) {
      console.error("Failed to fetch volunteer requests:", apiError);
      showErrorWithTimeout(
        `Failed to fetch volunteer requests: ${apiError.message}`
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (agencyId) {
      if (error.includes("Agency ID is missing")) setError("");
      fetchRequests();
      fetchAgencyVolunteers();
    }
  }, [agencyId]);

  const handleSearch = async () => {
    setLoading(true);
    clearMessages();
    setSearchResult(null);

    if (!searchEmail.trim()) {
      showErrorWithTimeout("Please enter an email to search.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/users/search/?email=${encodeURIComponent(
          searchEmail
        )}`
      );

      if (response.ok) {
        const userData = await response.json();
        if (userData && userData.email === searchEmail) {
          setSearchResult({
            id: userData.id,
            full_name: userData["full_name"] || "N/A",
            email: userData.email,
          });
        } else {
          showErrorWithTimeout(
            `No volunteer found with the email: ${searchEmail}.`
          );
        }
      } else if (response.status === 404) {
        const errorData = await response.json().catch(() => null);
        showErrorWithTimeout(
          errorData?.error ||
          `No volunteer found with the email: ${searchEmail}.`
        );
      } else if (response.status === 400) {
        const errorData = await response.json().catch(() => null);
        showErrorWithTimeout(
          errorData?.error ||
          "Search input is invalid. Please check the email entered."
        );
      } else {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to search for volunteer." }));
        throw new Error(
          errorData.detail || `HTTP error! status: ${response.status}`
        );
      }
    } catch (apiError) {
      console.error("Failed to search volunteer:", apiError);
      showErrorWithTimeout(`Failed to search: ${apiError.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptRequest = (user) => {
    setCurrentVolunteer(user);
    clearMessages();
    const userIdToCheck = user.id || user.volunteer_user_id;
    const existingVolunteerData = volunteers.find(
      (vol) => vol.member && vol.member.id === userIdToCheck
    );

    if (existingVolunteerData) {
      const currentPermissions = permissionsList.filter(
        (perm) => existingVolunteerData[perm] === true
      );
      setSelectedPermissions(currentPermissions);
    } else {
      setSelectedPermissions([]);
    }
    setOpenModal(true);
  };

  const handlePermissionChange = (permission) => {
    setSelectedPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission]
    );
  };

  const initiateDeleteRequest = (requestData) => {
    if (!requestData || !requestData.id || !requestData.volunteer_user_id) {
      showErrorWithTimeout("Cannot delete: Invalid request data provided.");
      return;
    }
    setRequestToDelete(requestData);
    setConfirmDeleteDialogOpen(true);
  };

  const executeDeleteRequest = async () => {
    if (!requestToDelete) return;
    const interestIdToDelete = requestToDelete.id;
    const volunteerName = requestToDelete.volunteer_name || "Volunteer";
    clearMessages();
    setLoadingAction(true);
    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteer-interests/${interestIdToDelete}/`,
        { method: "DELETE" }
      );
      if (response.status === 204) {
        showSuccessWithTimeout(
          `Volunteer request from ${volunteerName} deleted successfully.`
        );
        setRequests((prevRequests) =>
          prevRequests.filter((req) => req.id !== interestIdToDelete)
        );
        if (
          currentVolunteer &&
          currentVolunteer.id === interestIdToDelete &&
          currentVolunteer.volunteer_user_id ===
          requestToDelete.volunteer_user_id
        ) {
          setOpenModal(false);
          setCurrentVolunteer(null);
        }
      } else if (response.status === 404) {
        throw new Error(
          "Request not found. It might have already been deleted."
        );
      } else {
        const errorText = await response.text();
        throw new Error(
          `Failed to delete request. Status: ${response.status}. ${errorText}`
        );
      }
    } catch (apiError) {
      console.error("API Error deleting volunteer interest:", apiError);
      showErrorWithTimeout(`Error deleting request: ${apiError.message}`);
    } finally {
      setLoadingAction(false);
      setConfirmDeleteDialogOpen(false);
      setRequestToDelete(null);
    }
  };

  const handleGivePermissions = async () => {
    if (!currentVolunteer || !agencyId) {
      showErrorWithTimeout("Missing current volunteer data or Agency ID.");
      return;
    }
    clearMessages();
    setLoadingAction(true);
    const isFromRequest = currentVolunteer.hasOwnProperty("volunteer_user_id");
    const memberId = isFromRequest
      ? currentVolunteer.volunteer_user_id
      : currentVolunteer.id;
    const memberFullName =
      currentVolunteer.volunteer_name || currentVolunteer.full_name;
    let interestAccepted = false;
    let accumulatedError = "";

    if (isFromRequest && currentVolunteer.id) {
      try {
        const acceptResponse = await fetch(
          `${API_BASE_URL}/volunteer-interests/${currentVolunteer.id}/accept/`,
          { method: "POST" }
        );
        if (!acceptResponse.ok) {
          const errorData = await acceptResponse
            .json()
            .catch(() => ({ detail: "Failed to accept interest." }));
          throw new Error(
            `Accept Interest API: ${errorData.detail || `Status ${acceptResponse.status}`
            }`
          );
        }
        interestAccepted = true;
      } catch (apiError) {
        console.error("API Error accepting interest:", apiError);
        accumulatedError += `Error accepting interest: ${apiError.message}. `;
      }
    }

    const permissionPayload = {};
    permissionsList.forEach((perm) => {
      permissionPayload[perm] = selectedPermissions.includes(perm);
    });

    try {
      const setPermissionsResponse = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/${memberId}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permissionPayload),
        }
      );
      if (!setPermissionsResponse.ok) {
        const errorData = await setPermissionsResponse
          .json()
          .catch(() => ({ detail: "Failed to set permissions." }));
        throw new Error(
          `Set Permissions API: ${errorData.detail || `Status ${setPermissionsResponse.status}`
          }`
        );
      }

      if (accumulatedError) {
        showErrorWithTimeout(
          accumulatedError +
          `Permissions for ${memberFullName} set, but there was an issue with the initial request acceptance.`
        );
      } else {
        showSuccessWithTimeout(
          `Volunteer ${memberFullName} processed and permissions set successfully!`
        );
      }
      if (isFromRequest && interestAccepted) fetchRequests();
      fetchAgencyVolunteers();
    } catch (apiError) {
      console.error("API Error setting/creating permissions:", apiError);
      accumulatedError += `Error setting permissions for ${memberFullName}: ${apiError.message}`;
      showErrorWithTimeout(accumulatedError.trim());
      fetchAgencyVolunteers();
    } finally {
      setLoadingAction(false);
      setOpenModal(false);
      setCurrentVolunteer(null);
      setSearchResult(null);
      setSearchEmail("");
    }
  };

  const handleSavePermissions = async (
    memberIdToUpdate,
    currentVolunteerObject
  ) => {
    if (!agencyId || !memberIdToUpdate) {
      showErrorWithTimeout(
        "Agency ID or Member ID is missing for saving permissions."
      );
      return;
    }
    clearMessages();
    setLoadingAction(true);
    const permissionPayload = {};
    permissionsList.forEach((perm) => {
      permissionPayload[perm] = !!currentVolunteerObject[perm];
    });
    try {
      const response = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/${memberIdToUpdate}/`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(permissionPayload),
        }
      );
      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ detail: "Failed to update permissions." }));
        throw new Error(
          `Update Permissions API: ${errorData.detail || `HTTP error! status: ${response.status}`
          }`
        );
      }
      const updatedPermissionRecord = await response.json();
      setVolunteers((prevVolunteers) =>
        prevVolunteers.map((vol) =>
          vol.member.id === memberIdToUpdate ? updatedPermissionRecord : vol
        )
      );
      showSuccessWithTimeout(
        `Permissions for ${updatedPermissionRecord.member.full_name} updated successfully.`
      );
    } catch (apiError) {
      console.error("API Error updating permissions:", apiError);
      showErrorWithTimeout(
        `Error updating permissions for user ID ${memberIdToUpdate}: ${apiError.message}`
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const initiateDeleteVolunteerPermissionsAndRequest = async (volunteerData) => {
    if (!volunteerData || !volunteerData.member || !volunteerData.member.id) {
      showErrorWithTimeout("Cannot delete: Invalid volunteer data provided.");
      return;
    }

    setLoadingAction(true);

    let volunteerRequestId = null;
    try {
      const response = await fetch(
        `${API_BASE_URL}/volunteer-interests/?agency_id=${agencyId}&volunteer_id=${volunteerData.member.id}`
      );
      if (response.ok) {
        const data = await response.json();
        const foundRequest = data.find(
          (req) => req.volunteer === volunteerData.member.id
        );
        if (foundRequest) {
          volunteerRequestId = foundRequest.id;
          console.log(
            `Found associated volunteer interest ID: ${volunteerRequestId}`
          );
        } else {
          console.log(
            `No associated volunteer interest found matching volunteer ID ${volunteerData.member.id} within fetched requests.`
          );
        }
      } else {
        console.error(
          `Failed to fetch associated volunteer interest for member ID ${volunteerData.member.id}. Status: ${response.status}`
        );
      }
    } catch (error) {
      console.error(
        `Error during fetch for associated volunteer interest: ${error.message}`
      );
    } finally {
      setLoadingAction(false);
    }

    setVolunteerPermissionsToDelete({
      ...volunteerData,
      volunteer_request_id: volunteerRequestId,
    });
    setConfirmVolunteerPermissionsDelete(true);
  };

  const executeDeleteVolunteerPermissionsAndRequest = async () => {
    if (!volunteerPermissionsToDelete || !agencyId) return;

    const memberId = volunteerPermissionsToDelete.member.id;
    const volunteerName =
      volunteerPermissionsToDelete.member.full_name || "Volunteer";
    const volunteerRequestId =
      volunteerPermissionsToDelete.volunteer_request_id;

    clearMessages();
    setLoadingAction(true);
    let successCount = 0;
    let errorMessages = [];

    console.log(
      `--- Starting combined deletion for: ${volunteerName} (Member ID: ${memberId}) ---`
    );
    console.log(`Agency ID: ${agencyId}`);
    console.log(
      `Attempting to delete Volunteer Request ID: ${volunteerRequestId || "N/A (No ID found for request deletion)"
      }`
    );

    // Step 1: Delete permissions from the agency
    try {
      console.log(
        `Calling DELETE ${API_BASE_URL}/agency/${agencyId}/permissions/${memberId}/`
      );
      const permResponse = await fetch(
        `${API_BASE_URL}/agency/${agencyId}/permissions/${memberId}/`,
        { method: "DELETE" }
      );
      if (permResponse.status === 204) {
        successCount++;
        console.log(
          `Permissions for ${volunteerName} (Member ID: ${memberId}) deleted successfully (Status 204).`
        );
      } else if (permResponse.status === 404) {
        errorMessages.push(
          "Permissions record not found (might have been removed already)."
        );
        console.warn(
          `Permissions record for ${volunteerName} (Member ID: ${memberId}) not found (Status 404).`
        );
      } else {
        const errorText = await permResponse.text();
        errorMessages.push(
          `Failed to remove permissions: Status ${permResponse.status}. ${errorText}`
        );
        console.error(
          `Failed to delete permissions for ${volunteerName}: Status ${permResponse.status}, Response: ${errorText}`
        );
      }
    } catch (apiError) {
      console.error("API Error removing volunteer permissions:", apiError);
      errorMessages.push(`Error removing permissions: ${apiError.message}`);
    }

    // Step 2: Delete the original volunteer interest request, IF one was found
    if (volunteerRequestId) {
      try {
        console.log(
          `Calling DELETE ${API_BASE_URL}/volunteer-interests/${volunteerRequestId}/`
        );
        const reqResponse = await fetch(
          `${API_BASE_URL}/volunteer-interests/${volunteerRequestId}/`,
          { method: "DELETE" }
        );
        if (reqResponse.status === 204) {
          successCount++;
          console.log(
            `Original volunteer request (ID: ${volunteerRequestId}) for ${volunteerName} deleted successfully (Status 204).`
          );
        } else if (reqResponse.status === 404) {
          errorMessages.push(
            "Original volunteer request not found (might have been deleted already)."
          );
          console.warn(
            `Original volunteer request (ID: ${volunteerRequestId}) for ${volunteerName} not found (Status 404).`
          );
        } else {
          const errorText = await reqResponse.text();
          errorMessages.push(
            `Failed to delete original request: Status ${reqResponse.status}. ${errorText}`
          );
          console.error(
            `Failed to delete original request (ID: ${volunteerRequestId}) for ${volunteerName}: Status ${reqResponse.status}, Response: ${errorText}`
          );
        }
      } catch (apiError) {
        console.error("API Error deleting volunteer interest request:", apiError);
        errorMessages.push(`Error deleting original request: ${apiError.message}`);
      }
    } else {
      console.log(
        "No associated volunteer interest request ID found, skipping request deletion."
      );
    }

    console.log(`--- Finished combined deletion for: ${volunteerName} ---`);

    if (errorMessages.length > 0) {
      showErrorWithTimeout(`Action completed with issues: ${errorMessages.join(". ")}`);
    } else if (successCount > 0) {
      showSuccessWithTimeout(`Volunteer ${volunteerName} fully removed (permissions and request).`);
    } else {
      showErrorWithTimeout(`No effective action taken for ${volunteerName}. Check console for details.`);
    }

    fetchAgencyVolunteers();
    fetchRequests();

    setLoadingAction(false);
    setConfirmVolunteerPermissionsDelete(false);
    setVolunteerPermissionsToDelete(null);
  };

  const handleVolunteersPageChange = (event, value) => {
    setVolunteersPage(value);
  };

  const handleRequestsPageChange = (event, value) => {
    setRequestsPage(value);
  };

  const handleOpenNoteModal = (note, volunteerName) => {
    setCurrentNote(note);
    setCurrentNoteVolunteerName(volunteerName);
    setOpenNoteModal(true);
  };

  const fetchAgencyDetails = async (currentUserId) => {
    console.log("Fetching agency details for user ID:", currentUserId);
    if (!currentUserId) return;
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency-profiles/${currentUserId}/`
      );
      const volunteersResponse = await fetch(
        `https://disaster-sentinel-backend-26d3102ae035.herokuapp.com/api/agency/${currentUserId}/permissions/`
      );
      if (!response.ok && !volunteersResponse.ok) {
        if (response.status === 404 || volunteersResponse.status === 404) {
          console.warn("Agency profile not found for user:", currentUserId);
          setAgency({ agency_name: null });
        } else {
          throw new Error(`Failed to fetch agency details: ${response.status}`);
        }
      } else {
        const data = await response.json();
        const volunteersData = await volunteersResponse.json();
        setAgency(data);
        console.log("Agency volunteers fetched successfully:", volunteersData);
        setVolunteersCount(volunteersData.length || 0);
      }
    } catch (error) {
      console.error("Error fetching agency details:", error);
      setStatusMessage({ type: "error", text: "Failed to fetch agency details." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "absolute",
        minHeight: "100vh",
        background: `linear-gradient(rgba(255, 255, 255, 0.92), rgba(255, 255, 255, 0.92)), url(${worldMapBackground})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundRepeat: "repeat-y",
        overflowX: "hidden", // Prevent horizontal scroll for the whole page
        overflowY: "hidden",
        p: { xs: 1, sm: 2, md: 3 },
        top: 0,
        left: 0,
        right: 0,
        zIndex: 0,
      }}
    >
      {/* Global Alert Messages */}
      <Box
        sx={{
          minHeight: "60px",
          width: "100%",
          position: "sticky",
          top: "55px",
          zIndex: 1200, // Ensure alerts appear above other content
          mb: error || successMessage ? 2 : 0,
        }}
      >
        {error && (
          <Alert
            severity="error"
            onClose={() => {
              setError("");
              if (errorTimerRef.current) {
                clearTimeout(errorTimerRef.current);
                errorTimerRef.current = null;
              }
            }}
            sx={{
              mb: 2,
              width: "fit-content",
              maxWidth: "90%",
              mx: "auto",
            }}
          >
            {error}
          </Alert>
        )}
        {successMessage && !error && (
          <Alert
            severity="success"
            onClose={() => {
              setSuccessMessage("");
              if (successTimerRef.current) {
                clearTimeout(successTimerRef.current);
                successTimerRef.current = null;
              }
            }}
            sx={{
              mb: 2,
              width: "fit-content",
              maxWidth: "90%",
              mx: "auto",
            }}
          >
            {successMessage}
          </Alert>
        )}
      </Box>

      {/* Main Content Layout */}
      <Box
        sx={{
          display: { xs: "block", md: "flex" }, // Side-by-side for sidebar on md+, block for main content on xs/sm
          flexDirection: { xs: "column", md: "row" }, // Stack main sections vertically on xs/sm, sidebar next to main content on md+
          minHeight: "calc(100vh - 150px)",
          mt: 2,
        }}
      >
        <Stack
          direction="column"
          spacing={2}
          sx={{
            display: { xs: "flex", md: "flex" },
            mr: 2,
          }}
        >
          {/* Quick Access Sidebar - Hidden on xs/sm, shown on md+ */}
          <Box
            sx={{
              width: { md: 180 },
              display: { xs: "none", md: "block" },
              height: 180,
              bgcolor: "white",
              mb: { xs: 2, md: 0 },
              mr: { md: 2 },
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Typography variant="h6" gutterBottom sx={{ textAlign: "center" }}>
              Quick Access
            </Typography>
            <List>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate("/missing-person")}>
                  <ListItemIcon>
                    <PersonSearchIcon />
                  </ListItemIcon>
                  <ListItemText primary="Missing Persons" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate("/event-listing")}>
                  <ListItemIcon>
                    <EventIcon />
                  </ListItemIcon>
                  <ListItemText primary="Event Page" />
                </ListItemButton>
              </ListItem>
            </List>
          </Box>

          <Box
            sx={{
              display: { xs: "flex", md: "block" },
              justifyContent: "center",
              width: "100%",
            }}
          >
            <Box
              sx={{
                width: { xs: "85%", md: 180 },
                height: { xs: "auto", md: 110 },
                bgcolor: "#f9f9f9",
                display: "flex",
                flexDirection: { xs: "row", md: "column" },
                alignItems: { xs: "center", md: "center" },
                justifyContent: { xs: "space-between", md: "center" },
                transition: "transform 0.2s ease-in-out",
                "&:hover": {
                  transform: { md: "scale(1.03)" },
                  boxShadow: { md: "0 6px 14px rgba(0, 0, 0, 0.15)" },
                },
                px: 2,
                py: { xs: 1, md: 1.5 },
                textAlign: { xs: "left", md: "center" },
                borderRadius: 2,
                boxShadow: 1,
                mx: { xs: "auto", md: 0 },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 600,
                  fontSize: { xs: "1rem", md: "1.2rem" },
                  mr: { xs: 1, md: 0 },
                }}
              >
                Volunteers
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  color: "#333",
                  fontSize: { xs: "1rem", md: "1.5rem" },
                }}
              >
                {(Number(agency?.volunteers || 0) + Number(volunteersCount || 0))}
              </Typography>
            </Box>
          </Box>

        </Stack>
        {/* Main Dashboard Sections (Search, Requests, Permissions) - Always columnar overall */}
        <Box
          sx={{
            flexGrow: 1,
            mt: { xs: 2, md: 0 },
            display: "flex",
            flexDirection: "column", // Ensure Search/Requests and Permissions always stack
            gap: 3, // Gap between major dashboard sections
            width: "100%", // Take full width of its parent flex item
          }}
        >
          {/* Container for Search and Volunteer Requests - Stacked on tablets/mobile, side-by-side on large desktops */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" }, // Key change: Stack on xs, sm, md; row on lg+
              gap: 2, // Gap between Search and Requests
              width: "100%", // Take full width of its parent flex item
            }}
          >
            {/* Search Volunteer Section */}
            <Box sx={{ width: { xs: "100%", lg: "30%" }, mb: { xs: 0, lg: 0 } }}>
              <Typography variant="h6">Search Volunteer</Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 2,
                  mt: 1,
                  alignItems: { xs: "stretch", sm: "center" },
                }}
              >
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
                    width: { xs: "100%", sm: "250px" },
                    flexGrow: { sm: 0 },
                  }}
                />
                <Button
                  disableRipple
                  onClick={handleSearch}
                  disabled={loading}
                  sx={{ flexShrink: 0 }}
                >
                  Search
                </Button>
              </Box>
              {loading ? (
                <CircularProgress sx={{ mt: 2 }} />
              ) : (
                searchResult && (
                  <Box sx={{ mt: 2 }}>
                    <Typography>Name: {searchResult.full_name}</Typography>
                    <Typography>Email: {searchResult.email}</Typography>
                    <Button
                      disableRipple
                      sx={{ mt: 1 }}
                      onClick={() => handleAcceptRequest(searchResult)}
                    >
                      {" "}
                      Add Volunteer{" "}
                    </Button>
                  </Box>
                )
              )}
            </Box>

            {/* Volunteer Requests Section */}
            <Box sx={{ width: { xs: "100%", lg: "70%" } }}>
              <Typography variant="h6">Volunteer Requests</Typography>
              {loadingRequests ? (
                <CircularProgress sx={{ mt: 1 }} />
              ) : requests.length === 0 ? (
                <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                  No pending requests.
                </Typography>
              ) : (
                <TableContainer
                  component={Paper}
                  sx={{ maxHeight: 350, overflow: "auto", width: "100%" }}
                >
                  <Table
                    stickyHeader
                    size="small"
                    sx={{
                      minWidth: { xs: 350, sm: 500 }, // Horizontal scroll on phones/small tablets
                      // For md and up, minWidth is not explicitly set, allowing columns to compress
                      // to avoid horizontal scroll, as per the original requirement for laptops.
                    }}
                  >
                    <TableHead>
                      <TableRow>
                        <TableCell
                          sx={{
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            // Changed whiteSpace: "nowrap" to dynamic
                            whiteSpace: isPhoneOrSmaller ? "nowrap" : "normal",
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: isBelow1470 ? "0.8rem" : "0.9rem",
                            },
                            minWidth: isPhoneOrSmaller ? { xs: "100px", sm: "120px" } : undefined, // Min width for Name
                          }}
                        >
                          Name
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            // Changed whiteSpace: "nowrap" to dynamic
                            whiteSpace: isPhoneOrSmaller ? "nowrap" : "normal",
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: isBelow1470 ? "0.8rem" : "0.9rem",
                            },
                            minWidth: isPhoneOrSmaller ? { xs: "140px", sm: "180px" } : undefined, // Min width for Email
                          }}
                        >
                          Email
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "20%",
                            // display: { xs: "none", sm: "table-cell" },
                            padding: "6px 10px",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap", // Keep nowrap for this hidden/less critical column
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: isBelow1470 ? "0.8rem" : "0.9rem",
                            },
                          }}
                        >
                          Contact
                        </TableCell>
                        <TableCell
                          sx={{
                            width: "20%",
                            // display: { xs: "none", md: "table-cell" },
                            padding: "6px 10px",
                            minWidth: "120px",
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: isBelow1470 ? "0.8rem" : "0.9rem",
                            },
                          }}
                        >
                          Note
                        </TableCell>
                        <TableCell
                          sx={{
                            padding: "6px 10px",
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: isBelow1470 ? "0.8rem" : "0.9rem",
                            },
                            minWidth: { xs: "80px", sm: "90px" }, // Min width for Action button
                          }}
                        >
                          Action
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {requests
                        .slice(
                          (requestsPage - 1) * requestsPerPage,
                          requestsPage * requestsPerPage
                        )
                        .map((req) => (
                          <TableRow key={req.id} sx={{ height: "48px" }}>
                            <TableCell
                              sx={{
                                padding: "6px 10px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                // Changed whiteSpace: "nowrap" to dynamic
                                whiteSpace: isPhoneOrSmaller ? "nowrap" : "normal",
                                minWidth: isPhoneOrSmaller ? { xs: "100px", sm: "120px" } : undefined, // Match header minWidth
                              }}
                            >
                              {req.volunteer_name}
                            </TableCell>
                            <TableCell
                              sx={{
                                padding: "6px 10px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                // Changed whiteSpace: "nowrap" to dynamic
                                whiteSpace: isPhoneOrSmaller ? "nowrap" : "normal",
                                minWidth: isPhoneOrSmaller ? { xs: "140px", sm: "180px" } : undefined, // Match header minWidth
                              }}
                            >
                              {req.volunteer_email}
                            </TableCell>
                            <TableCell
                              sx={{
                                // display: { xs: "none", sm: "table-cell" },
                                padding: "6px 10px",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap", // Keep nowrap for this hidden/less critical column
                              }}
                            >
                              {req.volunteer_contact}
                            </TableCell>
                            <TableCell
                              sx={{
                                // display: { xs: "none", md: "table-cell" },
                                padding: "6px 10px",
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  display: "-webkit-box",
                                  WebkitBoxOrient: "vertical",
                                  WebkitLineClamp: 2,
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  wordBreak: "break-word",
                                  cursor:
                                    req.message.length > 50
                                      ? "pointer"
                                      : "default",
                                }}
                                onClick={() => {
                                  if (req.message.length > 50) {
                                    handleOpenNoteModal(
                                      req.message,
                                      req.volunteer_name
                                    );
                                  }
                                }}
                              >
                                {req.message}
                              </Typography>
                            </TableCell>
                            <TableCell
                              sx={{
                                padding: "6px 10px",
                                minWidth: { xs: "80px", sm: "90px" }, // Match header minWidth
                              }}
                            >
                              <Button
                                disableRipple
                                size="small"
                                onClick={() => handleAcceptRequest(req)}
                              >
                                Accept
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              {requests.length > 0 && (
                <Pagination
                  count={Math.ceil(requests.length / requestsPerPage)}
                  page={requestsPage}
                  onChange={handleRequestsPageChange}
                  sx={{ mt: 2, display: "flex", justifyContent: "center" }}
                />
              )}
            </Box>
          </Box>

          {/* Manage Existing Permissions Section - Always full width below */}
          <Box sx={{ width: "100%" }}>
            <Typography variant="h6">Manage Existing Permissions</Typography>
            {loadingVolunteers ? (
              <CircularProgress sx={{ mt: 1 }} />
            ) : volunteers.length === 0 ? (
              <Typography sx={{ mt: 1, fontStyle: "italic" }}>
                No agency volunteers found.
              </Typography>
            ) : (
              <TableContainer
                component={Paper}
                sx={{ overflowX: "auto", mt: 1 }} // Ensure horizontal scrolling
              >
                <Table
                  stickyHeader
                  size="small"
                  sx={{ minWidth: isTabletOrSmaller ? 750 : 900 }}
                >
                  <TableHead>
                    <TableRow sx={{ height: "52px" }}>
                      <TableCell
                        sx={{
                          padding: "6px 10px",
                          minWidth: "100px",
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.7rem",
                            md: isBelow1470 ? "0.8rem" : "0.9rem",
                          },
                        }}
                      >
                        Name
                      </TableCell>
                      {permissionsList.map((perm) => (
                        <TableCell
                          key={perm}
                          sx={{
                            padding: "6px 7px",
                            textAlign: "center",
                            minWidth: "95px",
                            fontSize: {
                              xs: "0.6rem",
                              sm: "0.7rem",
                              md: isBelow1470 ? "0.8rem" : "0.9rem",
                            },
                          }}
                        >
                          {perm.replace(/_/g, " ")}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.7rem",
                            md: isBelow1470 ? "0.8rem" : "0.9rem",
                          },
                        }}
                      >
                        Save
                      </TableCell>
                      {/* NEW: Delete Column Header */}
                      <TableCell
                        sx={{
                          padding: "6px 10px",
                          textAlign: "center",
                          fontSize: {
                            xs: "0.6rem",
                            sm: "0.7rem",
                            md: isBelow1470 ? "0.8rem" : "0.9rem",
                          },
                          minWidth: "80px", // Ensure enough space for button
                        }}
                      >
                        Delete
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {volunteers
                      .slice(
                        (volunteersPage - 1) * volunteersPerPage,
                        volunteersPage * volunteersPerPage
                      )
                      .map((vol) => (
                        <TableRow key={vol.member.id} sx={{ height: "48px" }}>
                          <TableCell sx={{ padding: "6px 10px" }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 500, cursor: "pointer" }}
                              onClick={() =>
                                initiateDeleteVolunteerPermissionsAndRequest(
                                  vol
                                )
                              }
                            >
                              {vol.member.full_name}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: "text.secondary",
                                fontSize: "0.65rem",
                              }}
                            >
                              {vol.member.email}
                            </Typography>
                          </TableCell>
                          {permissionsList.map((perm) => (
                            <TableCell
                              key={perm}
                              sx={{ padding: "0px 8px", textAlign: "center" }}
                            >
                              <Checkbox
                                checked={!!vol[perm]}
                                onChange={(e) => {
                                  setVolunteers((prevVols) =>
                                    prevVols.map((v_orig) =>
                                      v_orig.member.id === vol.member.id
                                        ? {
                                          ...v_orig,
                                          [perm]: e.target.checked,
                                        }
                                        : v_orig
                                    )
                                  );
                                }}
                                sx={{ padding: "4px" }}
                              />
                            </TableCell>
                          ))}
                          <TableCell
                            sx={{ padding: "6px 10px", textAlign: "center" }}
                          >
                            <Button
                              disableRipple
                              size="small"
                              onClick={() => {
                                const volunteerToSave = volunteers.find(
                                  (v_orig) => v_orig.member.id === vol.member.id
                                );
                                if (volunteerToSave)
                                  handleSavePermissions(
                                    vol.member.id,
                                    volunteerToSave
                                  );
                              }}
                              disabled={loadingAction}
                            >
                              Save
                            </Button>
                          </TableCell>
                          {/* NEW: Delete Button Cell */}
                          <TableCell
                            sx={{ padding: "6px 10px", textAlign: "center" }}
                          >
                            <Button
                              disableRipple
                              size="small"
                              color="error"
                              onClick={() =>
                                initiateDeleteVolunteerPermissionsAndRequest(
                                  vol
                                )
                              }
                              disabled={loadingAction}
                            >
                              Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
            {volunteers.length > 0 && (
              <Pagination
                count={Math.ceil(volunteers.length / volunteersPerPage)}
                page={volunteersPage}
                onChange={handleVolunteersPageChange}
                sx={{ mt: 2, display: "flex", justifyContent: "center" }}
              />
            )}
          </Box>

          <Modal
            open={openModal}
            onClose={() => {
              setOpenModal(false);
              setCurrentVolunteer(null);
            }}
          >
            <Box sx={style}>
              {" "}
              {/* Uses the adjusted responsive style */}
              <Typography variant="h6" gutterBottom>
                Grant Permissions
              </Typography>
              <Typography variant="body2" sx={{ mb: 0 }}>
                Volunteer:{" "}
                {currentVolunteer?.volunteer_name ||
                  currentVolunteer?.full_name}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                Email:{" "}
                {currentVolunteer?.volunteer_email || currentVolunteer?.email}
              </Typography>
              <FormGroup
                sx={{
                  maxHeight: "calc(90vh - 250px)",
                  overflowY: "auto",
                  pr: 1,
                }}
              >
                {permissionsList.map((perm) => (
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedPermissions.includes(perm)}
                        onChange={() => handlePermissionChange(perm)}
                      />
                    }
                    label={perm.replace(/_/g, " ")}
                    key={perm}
                  />
                ))}
              </FormGroup>
              <Box
                sx={{
                  mt: 2,
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 1,
                }}
              >
                {currentVolunteer && currentVolunteer.volunteer_user_id && (
                  <Button
                    disableRipple
                    color="error"
                    onClick={() => initiateDeleteRequest(currentVolunteer)}
                    disabled={loadingAction}
                    size="small"
                  >
                    Delete Request
                  </Button>
                )}
                {!(currentVolunteer && currentVolunteer.volunteer_user_id) && (
                  <Box sx={{ flexGrow: 1 }}></Box>
                )}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button
                    disableRipple
                    onClick={() => {
                      setOpenModal(false);
                      setCurrentVolunteer(null);
                    }}
                    disabled={loadingAction}
                    size="small"
                  >
                    Cancel
                  </Button>
                  <Button
                    disableRipple
                    color="primary"
                    onClick={handleGivePermissions}
                    disabled={loadingAction}
                    size="small"
                  >
                    {loadingAction ? (
                      <CircularProgress size={20} color="inherit" />
                    ) : (
                      "Give Permissions"
                    )}
                  </Button>
                </Box>
              </Box>
            </Box>
          </Modal>

          <Modal
            open={openNoteModal}
            onClose={() => setOpenNoteModal(false)}
            aria-labelledby="note-modal-title"
            aria-describedby="note-modal-description"
          >
            <Box sx={style}>
              {" "}
              {/* Uses the adjusted responsive style */}
              <Typography id="note-modal-title" variant="h6" component="h2">
                Note from {currentNoteVolunteerName}
              </Typography>
              <Typography
                id="note-modal-description"
                sx={{ mt: 2, whiteSpace: "pre-wrap" }}
              >
                {currentNote}
              </Typography>
              <Button onClick={() => setOpenNoteModal(false)} sx={{ mt: 2 }}>
                Close
              </Button>
            </Box>
          </Modal>

          <Dialog
            open={confirmDeleteDialogOpen}
            onClose={() => {
              setConfirmDeleteDialogOpen(false);
              setRequestToDelete(null);
            }}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">Confirm Deletion</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Are you sure you want to delete the request from{" "}
                <Box component="span" fontWeight="bold">
                  {requestToDelete?.volunteer_name || "this volunteer"}
                </Box>
                ? This cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setConfirmDeleteDialogOpen(false);
                  setRequestToDelete(null);
                }}
                disabled={loadingAction}
              >
                Cancel
              </Button>
              <Button
                onClick={executeDeleteRequest}
                color="error"
                disabled={loadingAction}
                autoFocus
              >
                {loadingAction ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Confirm Delete"
                )}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={confirmVolunteerPermissionsDelete}
            onClose={() => {
              setConfirmVolunteerPermissionsDelete(false);
              setVolunteerPermissionsToDelete(null);
            }}
            aria-labelledby="confirm-volunteer-permissions-delete-title"
            aria-describedby="confirm-volunteer-permissions-delete-description"
          >
            <DialogTitle id="confirm-volunteer-permissions-delete-title">
              Confirm Volunteer Removal
            </DialogTitle>
            <DialogContent>
              <DialogContentText id="confirm-volunteer-permissions-delete-description">
                Are you sure you want to remove{" "}
                <Box component="span" fontWeight="bold">
                  {volunteerPermissionsToDelete?.member?.full_name ||
                    "this volunteer"}
                </Box>{" "}
                and revoke all their permissions for your agency? This action
                will also attempt to delete their original volunteer interest
                request. This action cannot be undone.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  setConfirmVolunteerPermissionsDelete(false);
                  setVolunteerPermissionsToDelete(null);
                }}
                disabled={loadingAction}
              >
                Cancel
              </Button>
              <Button
                onClick={executeDeleteVolunteerPermissionsAndRequest}
                color="error"
                disabled={loadingAction}
                autoFocus
              >
                {loadingAction ? (
                  <CircularProgress size={20} color="inherit" />
                ) : (
                  "Remove Volunteer & Request"
                )}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </Box>
      <Grid
        container
        xs={12}
        sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}
      >
        <Grid item xs={12} md={10} sx={{ textAlign: "center" }}>
          <Footer />
        </Grid>
      </Grid>
    </Box>
  );
}