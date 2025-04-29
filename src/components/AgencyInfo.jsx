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
                variant="standard"
                label={
                    <span>
                      Agency Name <span style={{ color: 'red' }}>*</span>
                    </span>
                }
                name="agency_name"
                value={formData.agency_name}
                onChange={(e) => updateFormState({...formData, agency_name: e.target.value})}
                error={!!errors.agency_name}
                helperText={errors.agency_name}
                sx = {{width: {xs:"100%", sm: "95%"}, marginX: "20px"}} 
                InputLabelProps={{ sx: { fontSize: "0.9rem" } }}
            />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: "14px" }}>
            <TextField
                fullWidth
                variant="standard"
                type="date"
                label={
                    <span>
                      Founded Date <span style={{ color: 'red' }}>*</span>
                    </span>
                }
                name="date_of_establishment"
                value={formData.date_of_establishment || ""}
                onChange={(e) => updateFormState({...formData, date_of_establishment: e.target.value})}
                error={!!errors.date_of_establishment}
                helperText={errors.date_of_establishment}
                InputLabelProps={{shrink: true, style: { fontSize: '1.2rem' } }}
                sx = {{width: {xs:"100%", sm: "90%"}, marginX: "20px"}}
            />
        </Grid>
        <Grid item xs={6} sx={{ marginTop: "10px" }}>
            {agencyTypeValue !== "Other" ? (
                <>
                <InputLabel sx={{ fontSize: '0.9rem', width: { xs: "100%", sm: "90%" }, marginX: "10px" }}>
                    Agency Type <span style={{ color: "red" }}>*</span>
                </InputLabel>
                <FormControl fullWidth variant="outlined" sx={{ width: { xs: "100%", sm: "90%" }, marginX: "10px" }}>
                    <Select
                    variant="standard"
                    label={
                        <span>
                          Contact Number #1 <span style={{ color: 'red' }}>*</span>
                        </span>
                    }
                    value={agencyTypeValue}
                    onChange={handleAgencyTypeChange}
                    >
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
                </>
            ) : (
                <>
                <TextField
                    fullWidth
                    label={
                        <span>
                          Specify Type Of The Agency <span style={{ color: 'red' }}>*</span>
                        </span>
                    }
                    variant="standard"
                    name="agency_type"
                    value={formData.agency_type}
                    onChange={(e) => updateFormState({ agency_type: e.target.value })}
                    error={!!errors.agency_type}
                    helperText={errors.agency_type}
                    InputLabelProps={{ style: { fontSize: '0.9rem' } }}
                    sx={{ width: { xs: "100%", sm: "90%" }, marginX: "10px" }}
                />
                </>
            )}
        </Grid>
        <Grid item xs={6}>
            <TextField
                fullWidth
                label={
                    <span>
                        Contact Number #1 <span style={{ color: 'red' }}>*</span>
                    </span>
                }
                variant="standard"
                name="contact1"
                value={formData.contact1}
                onChange={(e) => updateFormState({...formData, contact1: e.target.value})}
                error={!!errors.contact1}
                helperText={errors.contact1}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "90%"}, marginX: "20px" }}
            />
        </Grid>
        <Grid item xs={6}>
            <TextField
                fullWidth
                label="Contact Number #2"
                variant="standard"
                name="contact2"
                value={formData.contact2}
                onChange={(e) => updateFormState({...formData, ccontact2: e.target.value})}
                helperText={errors.contact2}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "90%"}, marginX: "10px" }}
            />
        </Grid>
        <Grid item xs={6}>
            <TextField
                fullWidth
                label="Website Address (if any)"
                variant="standard"
                name="website"
                value={formData.website}
                onChange={(e) => updateFormState({...formData, website: e.target.value})}
                error={!!errors.website}
                helperText={errors.website}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "90%"}, marginX: "20px" }}
            />
        </Grid>
        <Grid item xs={6}>
            <TextField
                fullWidth
                label='Number Of Volunteers'
                variant="standard"
                name= 'volunteers'
                type='number'
                value={formData.volunteers}
                onChange={(e) => updateFormState({...formData, volunteers: e.target.value})}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "90%"}, marginX: "10px" }}
            />
        </Grid>
        <Grid item xs={6}>
            <StateDistrictDropdown 
                formData={formData}
                selectedState={selectedState} 
                selectedDistrict={selectedDistrict} 
                setFormData={setFormData}
                setSelectedState={setSelectedState}
                setSelectedDistrict={setSelectedDistrict}
            />
        </Grid>
        <Grid item xs={6}>
            <TextField
                fullWidth
                label={
                    <span>
                        Address <span style={{ color: 'red' }}>*</span>
                    </span>
                }
                variant="standard"
                name= 'address'
                value={formData.address}
                onChange={(e) => updateFormState({...formData, address: e.target.value})}
                error={!!errors.address}
                helperText={errors.address}
                InputLabelProps={{ style: { fontSize: '0.9rem'} }}
                sx={{ width: {xs:"100%", sm: "90%"}, marginX: "10px" }}
            />
        </Grid>
    </Grid>
)
}

export default AgencyInfo