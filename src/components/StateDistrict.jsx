import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Grid, TextField, Autocomplete } from "@mui/material";

const StateDistrictDropdown = ({
  formData,
  selectedState,
  selectedDistrict,
  setFormData,
  setSelectedState,
  setSelectedDistrict,
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
              tempStateDistricts[state].push(district);
            }
          });

          setStateDistricts(tempStateDistricts);
        };

        reader.readAsArrayBuffer(blob);
      } catch (error) {
        console.error("Error fetching the Excel file:", error);
      }
    };

    fetchExcelFile();
  }, []);

  const handleStateChange = (event, newValue) => {
    setSelectedState(newValue || "");
    setDistricts(newValue ? stateDistricts[newValue] || [] : []);
    setSelectedDistrict("");
    setFormData({ ...formData, state: newValue || "", district: "" });
  };

  const handleDistrictChange = (event, newValue) => {
    setSelectedDistrict(newValue || "");
    setFormData({ ...formData, district: newValue || "" });
  };

  return (
    <Grid container spacing={2}>
      {/* State Autocomplete */}
      <Grid item xs={12} md={6}>
        <Autocomplete
          options={Object.keys(stateDistricts)} // List of states
          value={selectedState}
          onChange={handleStateChange}
          renderInput={(params) => (
            <TextField 
            {...params} 
            label={
              <span>
                  State <span style={{ color: 'red' }}>*</span>
              </span>
          }
            variant="standard" 
            />
          )}
          sx = {{width: {xs:"95%", md: "95%"}, marginX: {xs: "10px", md: "20px"}}}
        />
      </Grid>

      {/* District Autocomplete (Only Show if State is Selected) */}
      {selectedState && (
        <Grid item xs={12} md={6}>
          <Autocomplete
            options={districts} 
            value={selectedDistrict}
            onChange={handleDistrictChange}
            renderInput={(params) => (
              <TextField 
              {...params} 
              label={
                <span>
                    District <span style={{ color: 'red' }}>*</span>
                </span>
              }
              variant="standard" />
            )}
            sx = {{width: {xs:"95%", md: "90%"}, marginX: {xs: "10px", md: "20px"}}}
          />
        </Grid>
      )}
    </Grid>
  );
};

export default StateDistrictDropdown;