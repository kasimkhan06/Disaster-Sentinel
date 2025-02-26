import React from "react";
import { Grid, TextField } from "@mui/material";

const Address = ({ index, formData, errors, handleChange }) => {
  return (
    <Grid container spacing={2} sx={{ mb: 2, borderBottom: "1px solid #ccc", pb: 2 }}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label={`Address ${index + 1}`}
          variant="standard"
          name={`address-${index}`}
          value={formData.addresses[index] || ""}
          onChange={(e) => handleChange(e, index)}
          error={!!errors[`address-${index}`]}
          helperText={errors[`address-${index}`]}
          InputLabelProps={{ style: { fontSize: "1.1rem", fontWeight: "bold" } }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="City"
          variant="standard"
          name={`city-${index}`}
          value={formData.cities[index] || ""}
          onChange={(e) => handleChange(e, index)}
          error={!!errors[`city-${index}`]}
          helperText={errors[`city-${index}`]}
          InputLabelProps={{ style: { fontSize: "1.1rem", fontWeight: "bold" } }}
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          fullWidth
          label="State"
          variant="standard"
          name={`state-${index}`}
          value={formData.states[index] || ""}
          onChange={(e) => handleChange(e, index)}
          error={!!errors[`state-${index}`]}
          helperText={errors[`state-${index}`]}
          InputLabelProps={{ style: { fontSize: "1.1rem", fontWeight: "bold" } }}
        />
      </Grid>
    </Grid>
  );
};

export default Address;
