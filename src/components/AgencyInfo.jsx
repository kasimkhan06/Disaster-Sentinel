import React from 'react'
import { Card, Grid, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material'
import StateDistrictDropdown from './StateDistrict';

function AgencyInfo({ 
    formData, 
    errors, 
    agencyTypeValue, 
    selectedState, 
    selectedDistrict,
    updateFormState, 
    setFormData,
    handleAgencyTypeChange, 
    setSelectedState,
    setSelectedDistrict
    }) {
return (
    <Grid container spacing={2}>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label="Name Of The Agency"
                variant="standard"
                name="agency_name"
                value={formData.agency_name}
                onChange={(e) => updateFormState({...formData, agency_name: e.target.value})}
                error={!!errors.agency_name}
                helperText={errors.agency_name}
                sx = {{width: {xs:"100%", sm: "95%"}, marginX: "20px"}} 
                InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label="Date Of Establishment"
                variant="standard"
                type="date"
                name="date_of_establishment"
                value={formData.date_of_establishment || ""}
                onChange={(e) => updateFormState({...formData, date_of_establishment: e.target.value})}
                error={!!errors.date_of_establishment}
                helperText={errors.date_of_establishment}
                InputLabelProps={{shrink: true, style: { fontSize: '1.2rem' } }}
                sx = {{width: {xs:"100%", sm: "95%"}, marginX: "20px"}}
            />
        </Grid>
        <Grid item xs={12} sx={{ marginTop: "10px" }}>
            <InputLabel sx={{ fontSize: '0.9rem', width: {xs:"100%", sm: "95%"}, marginX: "20px" }}>Type Of The Agency</InputLabel>
            <FormControl fullWidth variant="outlined" sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}>
                <Select variant="standard" value={agencyTypeValue} onChange={handleAgencyTypeChange}>
                    <MenuItem value="select">Select...</MenuItem>
                    <MenuItem value="Non-Governmental Organization (NGO)">Non-Governmental Organization (NGO)</MenuItem>
                    <MenuItem value="Community Based Organization (CBO)">Community Based Organization (CBO)</MenuItem>
                    <MenuItem value="Governmental Organization">Governmental Organization</MenuItem>
                    <MenuItem value="Corporate Social Responsibility (CSR)">Corporate Social Responsibility (CSR)</MenuItem>
                    <MenuItem value="Disaster Relief">Disaster Relief</MenuItem>
                    <MenuItem value="Other">Other (Please Specify)</MenuItem>
                </Select>
                {errors.agency_type && <FormHelperText>{errors.agency_type}</FormHelperText>}
            </FormControl>
        </Grid>

        {agencyTypeValue === "Other" && (
        <Grid item xs={12}>
            <TextField
                fullWidth
                label="Specify Other Type Of Agency"
                variant="standard"
                name="agency_type"
                value={formData.agency_type}
                onChange={(e) => updateFormState({...formData, agency__type: e.target.value})}
                error={!!errors.agency_type}
                helperText={errors.agency_type}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
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
                onChange={(e) => updateFormState({...formData, contact1: e.target.value})}
                error={!!errors.contact1}
                helperText={errors.contact1}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label="Contact Number #2"
                variant="standard"
                name="contact2"
                value={formData.contact2}
                onChange={(e) => updateFormState({...formData, ccontact2: e.target.value})}
                helperText={errors.contact2}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label="Website Address (if any)"
                variant="standard"
                name="website"
                value={formData.website}
                onChange={(e) => updateFormState({...formData, website: e.target.value})}
                helperText={errors.website}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label='Address'
                variant="standard"
                name= 'address'
                value={formData.address}
                onChange={(e) => updateFormState({...formData, address: e.target.value})}
                error={!!errors.address}
                helperText={errors.address}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
            />
        </Grid>
        <Grid item xs={12}>
            <StateDistrictDropdown 
                formData={formData}
                selectedState={selectedState} 
                selectedDistrict={selectedDistrict} 
                setFormData={setFormData}
                setSelectedState={setSelectedState}
                setSelectedDistrict={setSelectedDistrict}
            />
        </Grid>
        <Grid item xs={12}>
            <TextField
                fullWidth
                label='Number Of Volunteers'
                variant="standard"
                name= 'volunteers'
                type='number'
                value={formData.volunteers}
                onChange={(e) => updateFormState({...formData, volunteers: e.target.value})}
                error={!!errors.volunteers}
                helperText={errors.volunteers}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "95%"}, marginX: "20px" }}
            />
        </Grid>
    </Grid>
)
}

export default AgencyInfo