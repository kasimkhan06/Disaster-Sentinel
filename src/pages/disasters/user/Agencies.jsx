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
import worldMapBackground from "/assets/background_image/world-map-background.jpg";

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
    return (
      headerHeight +
      rowCount * rowHeight +
      (filteredAgencies.length > itemsPerPage ? paginationHeight : 0)
    );
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
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
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
      <Typography
        align="center"
        sx={{
          pt: "17px",
          pb: "5px",
          mt: 8,
          mb: 1,
          fontSize: {
            xs: "1rem",
            sm: "1.2rem",
            md: isBelow ? "1.2rem" : "1.4rem",
            lg: isBelow ? "1.2rem" : "1.4rem",
          },
          fontWeight: "700",
          color: "rgba(0, 0, 0, 0.87)",
          position: "relative",
          zIndex: 1,
        }}
      >
        AGENCY DETAILS
      </Typography>

      {/* Centered Filter Controls */}
      <Grid
        container
        spacing={1}
        sx={{
          mb: 1,
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
              mb: 0,
              textAlign: "left",
              backgroundColor: "white",
              // boxShadow: "2px 2px 2px #E8F1F5",
              position: "relative",
              height: "48px",
              display: "flex",
              alignItems: "center",
              boxShadow: 2,
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
                  // label="State"
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
                                "&:active": {
                                  // Remove blue background on click
                                  backgroundColor: "transparent",
                                },
                                "&:focus": {
                                  // Remove focus outline
                                  backgroundColor: "transparent",
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
                      transform: "translate(14px, 12px) scale(1)", // Adjust label position
                      "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -6px) scale(0.75)", // Adjust shrunk label
                      },
                    },
                    "& .MuiAutocomplete-endAdornment": {
                      top: "50%", // Center vertically
                      transform: "translateY(-50%)", // Adjust for exact centering
                      right: "10px", // Maintain right positioning
                    },
                    "& .MuiAutocomplete-popupIndicator": {
                      padding: "4px", // Adjust padding if needed
                    },
                    width: "100%",
                  }}
                />
              )}
              sx={{
                width: "100%",
                "& .MuiAutocomplete-endAdornment": {
                  right: "10px",
                  top: "calc(50% - 12px)", // Center adornment vertically
                }, 
              }}
            />
          </Box>
        </Grid>
        <Grid
          size={{ xs: 12, sm: 6, md: 3, lg: 3 }}
          sx={{
            display: "flex",
            justifyContent: { xs: "center", sm: "left", md: "left" },
            alignItems: "stretch",
          }}
        >
          <Button
            onClick={handleClearFilters}
            disableRipple
            disabled={selectedState === "All States"}
            sx={{
              height: "48px",
              paddingY: "9px",
              mb: 2,
              display: "flex",
              alignItems: "center", boxShadow: 2,
              backgroundColor: "white",
              "&:hover": {
                backgroundColor: "white",
              },
              "&:active": {
                // Remove blue background on click
                backgroundColor: "white",
              },
              "&:focus": {
                // Remove focus outline
                backgroundColor: "white",
              },
              color: "rgba(0, 0, 0, 0.87)",
              position: "relative", // Add this
              zIndex: 1,
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
          borderRadius: 2, boxShadow: 3,
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
                    disableRipple // Remove ripple effect on click
                    sx={{
                      cursor: "pointer",
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                      "&.Mui-selected": {
                        backgroundColor: "transparent", // Remove blue background on selection
                      },
                      "&.Mui-selected:hover": {
                        backgroundColor: "transparent", // Keep hover effect
                      },
                      "&:active": {
                        backgroundColor: "transparent", // Remove blue background on click
                      },
                      "&:focus": {
                        backgroundColor: "transparent", // Remove blue background on focus
                      },
                    }}
                  >
                    <TableCell
                      sx={{
                        color: "rgba(0, 0, 0, 0.87)",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {agency.name}
                    </TableCell>
                    <TableCell
                      sx={{
                        color: "rgba(0, 0, 0, 0.87)",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      {agency.city}, {agency.state}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={2}
                    align="center"
                    sx={{ color: "rgba(0, 0, 0, 0.87)" }}
                  >
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
              <DialogContentText
                sx={{
                  color: "rgba(0, 0, 0, 0.87)",
                  position: "relative", // Add this
                  zIndex: 1,
                }}
              >
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Location:</strong> {selectedAgency.city},{" "}
                  {selectedAgency.state}
                </Typography>
                {/* Add more agency details here */}
                {selectedAgency.address && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Address:</strong> {selectedAgency.address}
                  </Typography>
                )}
                {selectedAgency.telephone && (
                  <Typography variant="body1" gutterBottom>
                    <strong>Phone:</strong> {selectedAgency.telephone}
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
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleCloseDialog}
                color="primary"
                sx={{
                  "&:active": {
                    backgroundColor: "transparent",
                  },
                  "&:focus": {
                    backgroundColor: "transparent",
                  },
                }}
              >
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
