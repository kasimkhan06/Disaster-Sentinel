import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  CircularProgress,
  TextField,
  Autocomplete,
  Tooltip,
  IconButton,
  Pagination,
  Stack,
  useTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import useAgencyData from "../../../hooks/useAgencyData";
import { getCurrentLocationState } from "../../../utils/locationUtils";

const Agencies = () => {
  const { agencies, states, loading, error } = useAgencyData();
  const [filteredAgencies, setFilteredAgencies] = useState([]);
  const [selectedState, setSelectedState] = useState("All States");
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [page, setPage] = useState(1);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isBelow = useMediaQuery("(max-width:1470px)");

  const itemsPerPage = isMobile ? 10 : 20;
  const rowHeight = isMobile ? 48 : 53;
  const headerHeight = 57;
  const paginationHeight = 72;

  useEffect(() => {
    setFilteredAgencies(agencies);
    setPage(1);
  }, [agencies]);

  useEffect(() => {
    if (selectedState === "All States") {
      setFilteredAgencies(agencies);
    } else {
      const filtered = agencies.filter(
        (agency) => agency.state === selectedState
      );
      setFilteredAgencies(filtered);
    }
    setPage(1);
  }, [selectedState, agencies]);

  const paginatedAgencies = filteredAgencies.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const calculateTableHeight = () => {
    const rowCount = Math.min(paginatedAgencies.length, itemsPerPage);
    return headerHeight + (rowCount * rowHeight) + (filteredAgencies.length > itemsPerPage ? paginationHeight : 0);
  };

  const handleUseCurrentLocation = async () => {
    setIsLocating(true);
    setLocationError(null);

    try {
      const state = await getCurrentLocationState();
      setSelectedState(state);
    } catch (err) {
      setLocationError(err);
    } finally {
      setIsLocating(false);
    }
  };

  const handleClearFilters = () => {
    setSelectedState("All States");
    setLocationError(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleRowClick = (agency) => {
    setSelectedAgency(agency);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Typography color="error" align="center">
        Error loading agencies: {error}
      </Typography>
    );
  }

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        p: 2,
      }}
    >
      <Typography
        align="center"
        sx={{
          padding: "16px 0",
          mt: 8,
          mb: 2,
          fontSize: {
            xs: "1rem",
            sm: "1.2rem",
            md: isBelow ? "1.2rem" : "1.4rem",
            lg: isBelow ? "1.2rem" : "1.4rem",
          },
          fontWeight: "500",
        }}
      >
        Agencies
      </Typography>

      {/* Centered Filter Controls */}
      <Grid
        container
        spacing={1}
        sx={{
          mb: { xs: 1, md: 2 },
          width: {
            xs: "100%",
            sm: "90%",
            md: "83%",
            lg: isBelow ? "70%" : "60%",
          },
          marginX: "auto",
        }}
      >
        <Grid
          size={{ xs: 12, sm: 6, md: 4, lg: 4 }}
          sx={{
            display: "flex",
            justifyContent: "right",
            alignItems: "stretch",
          }}
        >
          <Box
            sx={{
              width: "100%",
              padding: 0,
              paddingLeft: { xs: 1, md: 2 },
              mb: 2,
              textAlign: "left",
              boxShadow: "2px 2px 2px #E8F1F5",
              position: "relative",
            }}
          >
            <Autocomplete
              options={["All States", ...states]}
              value={selectedState}
              onChange={(event, newValue) =>
                setSelectedState(newValue || "All States")
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="State"
                  variant="outlined"
                  slotProps={{
                    input: {
                      ...params.InputProps,
                      endAdornment: (
                        <>
                          <Tooltip title="Use my current location">
                            <IconButton
                              onClick={handleUseCurrentLocation}
                              disabled={isLocating}
                              size="small"
                              sx={{
                                mr: -1,
                                fontSize: {
                                  xs: "1rem",
                                  sm: "1.2rem",
                                  md: isBelow ? "1.2rem" : "1.4rem",
                                  lg: isBelow ? "1.2rem" : "1.4rem",
                                },
                              }}
                            >
                              {isLocating ? (
                                <CircularProgress size={20} />
                              ) : (
                                <MyLocationIcon fontSize="small" />
                              )}
                            </IconButton>
                          </Tooltip>
                          {params.InputProps?.endAdornment}
                        </>
                      ),
                    },
                  }}
                  sx={{
                    "& .MuiInputBase-root": {
                      padding: "4px 8px",
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none",
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: {
                        xs: "0.8rem",
                        sm: "0.9rem",
                        md: isBelow ? "1rem" : "1.1rem",
                        lg: isBelow ? "1rem" : "1.1rem",
                      },
                    },
                    width: "100%",
                  }}
                />
              )}
              sx={{
                "& .MuiAutocomplete-endAdornment": {
                  right: "10px",
                },
              }}
            />
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
          sx={{
            display: "flex",
            justifyContent: {xs: "center", sm: "left", md: "left"},
            alignItems: "stretch",
          }}
        >
          <Button
            onClick={handleClearFilters}
            disableRipple
            disabled={selectedState === "All States"}
            sx={{
              height: { md: 62 },
              paddingY: "9px",
              mb: 2,
              display: "flex",
              alignItems: "center",
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
              },
            }}
          >
            Clear Filters
          </Button>
        </Grid>
      </Grid>

      {locationError && (
        <Typography color="error" align="center" sx={{ mb: 2 }}>
          {locationError}
        </Typography>
      )}

      {/* Table with dynamic height */}
      <Box
        sx={{
          width: {
            xs: "100%",
            sm: "90%",
            md: "83%",
            lg: isBelow ? "70%" : "60%",
          },
          marginX: "auto",
          height: `${calculateTableHeight()}px`,
          minHeight: `${headerHeight + rowHeight + paginationHeight}px`,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <TableContainer 
          component={Paper} 
          sx={{ 
            flex: 1,
            overflow: "auto",
          }}
        >
          <Table stickyHeader aria-label="agencies table">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: "bold" }}>Agency Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Location</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedAgencies.length > 0 ? (
                paginatedAgencies.map((agency) => (
                  <TableRow 
                    key={agency.id}
                    hover
                    onClick={() => handleRowClick(agency)}
                    sx={{ 
                      cursor: "pointer",
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <TableCell>{agency.name}</TableCell>
                    <TableCell>
                      {agency.district}, {agency.state}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No agencies found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        {filteredAgencies.length > itemsPerPage && (
          <Box 
            sx={{ 
              display: "flex", 
              justifyContent: "center", 
              pt: 2,
              pb: 2,
            }}
          >
            <Pagination
              count={Math.ceil(filteredAgencies.length / itemsPerPage)}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size={isMobile ? "small" : "medium"}
            />
          </Box>
        )}
      </Box>

      {/* Agency Details Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        aria-labelledby="agency-details-dialog"
        maxWidth="sm"
        fullWidth
      >
        {selectedAgency && (
          <>
            <DialogTitle id="agency-details-dialog">
              {selectedAgency.name}
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Location:</strong> {selectedAgency.district}, {selectedAgency.state}
                </Typography>
                {/* Add more agency details here */}
                {selectedAgency.address && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Address:</strong> {selectedAgency.address}
                  </Typography>
                )}
                {selectedAgency.phone && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Phone:</strong> {selectedAgency.phone}
                  </Typography>
                )}
                {selectedAgency.email && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Email:</strong> {selectedAgency.email}
                  </Typography>
                )}
                {selectedAgency.website && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Website:</strong>{" "}
                    <a 
                      href={selectedAgency.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      {selectedAgency.website}
                    </a>
                  </Typography>
                )}
                {selectedAgency.description && (
                  <Typography variant="body1">
                    <strong>Description:</strong> {selectedAgency.description}
                  </Typography>
                )}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="primary">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default Agencies;