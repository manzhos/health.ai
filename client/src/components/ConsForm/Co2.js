import React, { useState, useEffect } from 'react';

import { 
  Grid,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  TextField,
  FormControlLabel,
} from '@mui/material'

export default function Co2({ onChangeCo2 }) {
  const [akne, setAkne] = useState(0);
  const [rosacea, setRosacea] = useState(0);
  const [tatoo, setTatoo] = useState(0);
  const [burns, setBurns] = useState(0);
  const [lightSensitivity, setLightSensitivity] = useState(0);
  const [pigmentation, setPigmentation] = useState(0);

  useEffect(() => {
    onChangeCo2(akne, rosacea, tatoo, burns, lightSensitivity, pigmentation)
  }, [akne, rosacea, tatoo, burns, lightSensitivity, pigmentation]);

  return(
    <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center">
      {/* akne */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="akne">Akne</FormLabel>  
          <RadioGroup row aria-labelledby="akne" name="akne" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setAkne(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setAkne(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>


      {/* rosacea */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="rosacea">Rosacea</FormLabel>  
          <RadioGroup row aria-labelledby="rosacea" name="rosacea" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setRosacea(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setRosacea(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>
  
      {/* tatoo */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="tatoo">Tatoo</FormLabel>  
          <RadioGroup row aria-labelledby="tatoo" name="tatoo" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setTatoo(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setTatoo(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>

      {/* burns */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="burns">Burns</FormLabel>  
          <RadioGroup row aria-labelledby="burns" name="burns" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setBurns(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setBurns(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>
  
      {/* lightSensitivity */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="lightSensitivity">Light Sensitivity</FormLabel>  
          <RadioGroup row aria-labelledby="lightSensitivity" name="lightSensitivity" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setLightSensitivity(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setLightSensitivity(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>

      {/* pigmentation */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="pigmentation">Pigmentation</FormLabel>  
          <RadioGroup row aria-labelledby="pigmentation" name="pigmentation" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setPigmentation(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setPigmentation(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>

    </Grid>
  )
}