import { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { Grid, InputLabel, FormControl, Select, MenuItem } from "@mui/material";

const StateDistrictDropdown = ({
  formData,
  selectedState, 
  selectedDistrict, 
  setFormData, 
  setSelectedState,
  setSelectedDistrict}) => {
  const [stateDistricts, setStateDistricts] = useState({});
  const [districts, setDistricts] = useState([]);

  // Automatically load and parse the Excel file
  useEffect(() => {
    const fetchExcelFile = async () => {
      try {
        const response = await fetch("/District_Masters.xlsx");
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

  const handleStateChange = (event) => {
    const state = event.target.value;
    setSelectedState(state);
    setDistricts(stateDistricts[state] || []);
    setFormData({ 
      ...formData, 
      state: event.target.value || "", 
      district: "" });
  };
  
  const handleDistrictChange = (event) => {
    const district = event.target.value;
    setSelectedDistrict(district);
    setFormData({ 
      ...formData, 
      district: event.target.value || "" });
  };
  

  return (
    <Grid container spacing={2} sx={{ padding: "15px" }}>
      {/* State Dropdown */}
      <Grid item xs={12} sx={{ marginTop: "10px" }}>
        <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>State</InputLabel>
        <FormControl fullWidth variant="outlined">
          <Select value={selectedState} onChange={handleStateChange} variant="standard">
            <MenuItem value="">Select State...</MenuItem>
            {Object.keys(stateDistricts).map((state) => (
              <MenuItem key={state} value={state}>
                {state}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Grid>

      {/* District Dropdown */}
      {selectedState && (
        <Grid item xs={12} sx={{ marginTop: "10px" }}>
          <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>District</InputLabel>
          <FormControl fullWidth variant="outlined">
            <Select value={selectedDistrict} onChange={handleDistrictChange} variant="standard">
              <MenuItem value="">Select District...</MenuItem>
              {districts.map((district) => (
                <MenuItem key={district} value={district}>
                  {district}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      )}
    </Grid>
  );
};

export default StateDistrictDropdown;