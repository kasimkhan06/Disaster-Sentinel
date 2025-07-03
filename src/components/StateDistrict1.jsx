import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Grid, TextField, Autocomplete, Box } from "@mui/material";
import { padding } from "@mui/system";

const StateDistrictDropdown = ({
  formData,
  selectedState,
  selectedDistrict,
  setFormData,
  setSelectedState,
  setSelectedDistrict,
  isDisabled,
}) => {
  const [stateDistricts, setStateDistricts] = useState({});
  const [districts, setDistricts] = useState([]);

  // Load and parse the Excel file
  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        const response = await fetch("/assets/District_Masters.xlsx");
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
            const state = row["State Name"];
            const district = row["District Name"];
            if (state && district) {
              if (!tempStateDistricts[state]) {
                tempStateDistricts[state] = [];
              }
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
      }
    };

    fetchExcelFile();
  }, []);

  const handleStateChange = (event, newValue) => {
    const newState = newValue || "";
    setSelectedState(newState);
    setDistricts(newState ? stateDistricts[newState] || [] : []);
    setSelectedDistrict("");
    setFormData({ ...formData, state: newState, district: "" });
  };

  const handleDistrictChange = (event, newValue) => {
    const newDistrict = newValue || "";
    setSelectedDistrict(newDistrict);
    setFormData({ ...formData, district: newDistrict });
  };

  const boxStyles = {
    width: "100%",
    padding: 0,
    mb: 2,
    textAlign: "left",
    boxShadow: "2px 2px 2px #E8F1F5",
    position: "relative",
    // paddingBottom: "11px",
    paddingTop: "1px",
  };

  return (
    <Grid container spacing={0}>
      {/* State Autocomplete */}
      <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
        <Box sx={boxStyles}>
          <Autocomplete
            options={Object.keys(stateDistricts)}
            value={selectedState || null}
            onChange={handleStateChange}
            disabled={isDisabled}
            renderInput={(params) => (
              <TextField
                {...params}
                label="State"
                variant="outlined"
                sx={{
                  "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                  width: "100%",
                  '& .MuiAutocomplete-inputRoot': { 
                    paddingTop: '5px', 
                    paddingBottom: '15px',
                    paddingLeft: '14px !important'
                    
                  },
                  "& .MuiInputLabel-root": {
                    fontSize: "0.9rem",
                  },
                }}
              />
            )}
          />
        </Box>
      </Grid>

      {/* District Autocomplete (Conditionally Rendered) */}
      {selectedState && (
        <Grid item xs={12} sx={{ display: "flex", justifyContent: "center", width: '100%' }}>
          <Box sx={boxStyles}>
            <Autocomplete
              options={districts}
              value={selectedDistrict || null}
              onChange={handleDistrictChange}
              disabled={!selectedState || districts.length === 0 || isDisabled}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="District"
                  variant="outlined"
                  sx={{
                    "& .MuiOutlinedInput-notchedOutline": { border: "none" },
                    width: "100%",
                    '& .MuiAutocomplete-inputRoot': { 
                      paddingTop: '5px', 
                      paddingBottom: '15px',
                      paddingLeft: '14px !important'
                    },
                    "& .MuiInputLabel-root": {
                      fontSize: "0.9rem",
                    },
                  }}
                />
              )}
            />
          </Box>
        </Grid>
      )}
    </Grid>
  );
};

export default StateDistrictDropdown;