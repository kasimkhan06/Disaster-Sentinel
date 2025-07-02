import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Grid, TextField, Autocomplete, Box } from "@mui/material";

const StateDistrictDropdown = ({
  formData,
  selectedState,
  selectedDistrict,
  setFormData,
  setSelectedState,
  setSelectedDistrict,
  isDisabled, // <--- New prop added here
}) => {
  const [stateDistricts, setStateDistricts] = useState({});
  const [districts, setDistricts] = useState([]);

  // Load and parse the Excel file
  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        const response = await fetch("/assets/District_Masters.xlsx"); // Ensure this path is correct relative to your public folder
        const blob = await response.blob();
        const reader = new FileReader();

        reader.onload = (e) => {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];

          // Convert sheet data to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet);

          // Transform JSON into a state-district object
          const tempStateDistricts = {};
          jsonData.forEach((row) => {
            // Ensure keys match your Excel file column headers exactly
            const state = row["State Name"];
            const district = row["District Name"];
            if (state && district) {
              if (!tempStateDistricts[state]) {
                tempStateDistricts[state] = [];
              }
              // Avoid adding duplicate districts if the Excel file has them
              if (!tempStateDistricts[state].includes(district)) {
                tempStateDistricts[state].push(district);
              }
            }
          });

          // Optionally sort states and districts alphabetically
          const sortedStates = Object.keys(tempStateDistricts).sort();
          const sortedStateDistricts = {};
          sortedStates.forEach(state => {
            sortedStateDistricts[state] = tempStateDistricts[state].sort();
          });


          setStateDistricts(sortedStateDistricts);
        };

        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("Error fetching or parsing the Excel file:", error);
        // Handle the error appropriately in your UI, e.g., show a message
      }
    };

    fetchExcelFile();
  }, []); // Empty dependency array ensures this runs only once on mount

  const handleStateChange = (event, newValue) => {
    const newState = newValue || "";
    setSelectedState(newState);
    setDistricts(newState ? stateDistricts[newState] || [] : []);
    setSelectedDistrict(""); // Reset district when state changes
    setFormData({ ...formData, state: newState, district: "" });
  };

  const handleDistrictChange = (event, newValue) => {
    const newDistrict = newValue || "";
    setSelectedDistrict(newDistrict);
    setFormData({ ...formData, district: newDistrict });
  };

  // Common TextField styling from the target example
  const textFieldStyles = {
    "& .MuiInputBase-root": {
      padding: "4px 8px", // Adjusted padding
    },
    "& .MuiOutlinedInput-notchedOutline": {
      border: "none", // Hide the outline border
    },
    "& .MuiInputLabel-root": {
      fontSize: "0.9rem", // Adjust label font size
    },
    width: "100%", // Ensure TextField takes full width of the Box
  };

  // Common Box styling from the target example
  const boxStyles = {
    width: "100%", // Match target width
    padding: 0,
    mb: 2, // Margin bottom
    textAlign: "left",
    boxShadow: "2px 2px 2px #E8F1F5", // Match target shadow
    position: "relative",
  };

  return (
    // Using Grid container to manage layout
    <Grid container spacing={0}> {/* Adjust spacing if needed */}

      {/* State Autocomplete */}
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "right" }}> {/* Apply alignment */}
        <Box sx={boxStyles}> {/* Apply Box styling */}
          <Autocomplete
            options={Object.keys(stateDistricts)} // List of states
            value={selectedState || null} // Ensure value is null if empty for Autocomplete
            onChange={handleStateChange}
            disabled={isDisabled} // <--- ADDED: Disable based on the isDisabled prop
            renderInput={(params) => (
              <TextField
                {...params}
                label="State"
                variant="outlined" // Changed to outlined
                sx={textFieldStyles} // Apply TextField styling
              />
            )}
          />
        </Box>
      </Grid>

      {/* District Autocomplete (Conditionally Rendered) */}
      {selectedState && (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "right" }}> {/* Apply alignment */}
          <Box sx={boxStyles}> {/* Apply Box styling */}
            <Autocomplete
              options={districts}
              value={selectedDistrict || null} // Ensure value is null if empty
              onChange={handleDistrictChange}
              disabled={!selectedState || districts.length === 0 || isDisabled} // <--- ADDED: Include isDisabled
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="District"
                  variant="outlined" // Changed to outlined
                  sx={textFieldStyles} // Apply TextField styling
                />
              )}
              // Removed Autocomplete specific sx width/margin, handled by Box now
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default StateDistrictDropdown;