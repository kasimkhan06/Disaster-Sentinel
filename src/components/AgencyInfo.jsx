import React from 'react'
import { Card, Grid, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import StateDistrictDropdown from './StateDistrict';

function AgencyInfo({ 
    formData, 
    errors, 
    agencyLevelValue, 
    agencyTypeValue, 
    selectedState, 
    selectedDistrict,
    handleChange, 
    setFormData,
    handleAgencyLevelChange, 
    handleAgencyTypeChange, 
    setSelectedState,
    setSelectedDistrict
    }) {
  return (
    <Card
        sx={{
            bgcolor: "rgba(255, 255, 255, 0.95)", 
            padding: "20px",
            borderRadius: "10px",
            boxShadow: "0 0 10px rgba(14, 12, 12, 0.1)",
        }}
        >
        <Grid container spacing={2}>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Name Of The Agency"
                    variant="standard"
                    name="agencyName"
                    value={formData.agencyName}
                    onChange={handleChange}
                    error={!!errors.agencyName}
                    helperText={errors.agencyName}
                    InputLabelProps={{ style: { fontSize: '1.1rem', fontWeight: 'bold' } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Date Of Establishment"
                    variant="standard"
                    type="date"
                    name="dateOfEstablishment"
                    value={formData.dateOfEstablishment}
                    onChange={handleChange}
                    error={!!errors.dateOfEstablishment}
                    helperText={errors.dateOfEstablishment}
                    InputLabelProps={{
                    shrink: true,
                    style: { fontSize: '1.3rem', fontWeight: 'bold' },
                    }}
                    sx={{ mt: "10px" }}
                />
            </Grid>
            <Grid item xs={12} sx={{ marginTop: "10px" }}>
                <InputLabel sx={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Type Of The Agency</InputLabel>
                <FormControl fullWidth variant="outlined">
                    <Select variant="standard" value={agencyTypeValue} onChange={handleAgencyTypeChange}>
                    <MenuItem value="select">Select...</MenuItem>
                    <MenuItem value="Non-Governmental Organization (NGO)">Non-Governmental Organization (NGO)</MenuItem>
                    <MenuItem value="Community Based Organization (CBO)">Community Based Organization (CBO)</MenuItem>
                    <MenuItem value="Coporate Body">Coporate Body</MenuItem>
                    <MenuItem value="Governmental Organization">Governmental Organization</MenuItem>
                    <MenuItem value="Corporate Social Responsibility (CSR)">Corporate Social Responsibility (CSR)</MenuItem>
                    <MenuItem value="Disaster Relief">Disaster Relief</MenuItem>
                    <MenuItem value="Research & Development Institute">Research & Development Institute</MenuItem>
                    <MenuItem value="Religious / Spiritual Organization">Religious / Spiritual Organization</MenuItem>
                    <MenuItem value="Other">Other (Please Specify)</MenuItem>
                    </Select>
                </FormControl>
            </Grid>

            {agencyTypeValue === "Other" && (
            <Grid item xs={12}>
                <TextField
                fullWidth
                label="Specify Other Type Of Agency"
                variant="standard"
                name="agencyType"
                value={formData.agencyType}
                onChange={handleChange}
                error={!!errors.agencyType}
                helperText={errors.agencyType}
                InputLabelProps={{ style: { fontSize: '1.1rem', fontWeight: 'bold' } }}
                />
            </Grid>
            )}
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Contact Number #1"
                    variant="standard"
                    name="contact1"
                    value={formData.contact1}
                    onChange={handleChange}
                    error={!!errors.contact1}
                    helperText={errors.contact1}
                    InputLabelProps={{ style: { fontSize: '1.1rem', fontWeight: 'bold' } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Contact Number #2"
                    variant="standard"
                    name="contact2"
                    value={formData.contact2}
                    onChange={handleChange}
                    helperText={errors.contact2}
                    InputLabelProps={{ style: { fontSize: '1.2rem', fontWeight: 'bold' } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Email"
                    variant="standard"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    error={!!errors.email}
                    helperText={errors.email}
                    InputLabelProps={{ style: { fontSize: '1.1rem', fontWeight: 'bold' } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label="Website Address (if any)"
                    variant="standard"
                    name="website"
                    value={formData.website}
                    onChange={handleChange}
                    helperText={errors.website}
                    InputLabelProps={{ style: { fontSize: '1.1rem', fontWeight: 'bold' } }}
                />
            </Grid>
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    label='Address'
                    variant="standard"
                    name= 'address'
                    value={formData.address}
                    onChange={handleChange}
                    error={!!errors.address}
                    helperText={errors.address}
                    InputLabelProps={{ style: { fontSize: "1.1rem", fontWeight: "bold" } }}
                />
                </Grid>
                <StateDistrictDropdown 
                    formData={formData}
                    selectedState={selectedState} 
                    selectedDistrict={selectedDistrict} 
                    setFormData={setFormData}
                    setSelectedState={setSelectedState}
                    setSelectedDistrict={setSelectedDistrict}
                />
        </Grid>
    </Card>
  )
}

export default AgencyInfo