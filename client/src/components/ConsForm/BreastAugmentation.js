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

export default function BreastAugmentation({ onChangeBreastAugmentation }) {

  const [breastSizeNow, setBreastSizeNow] = useState('');
  const [breastSizeWant, setBreastSizeWant] = useState('');
  const [breastShape, setBreastShape] = useState('');
  const [ptosis, setPtosis] = useState(0);
  const [diseaseBreast, setDiseaseBreast] = useState('');

  useEffect(() => {
    onChangeBreastAugmentation(breastSizeNow, breastSizeWant, breastShape, ptosis, diseaseBreast)
  }, [breastSizeNow, breastSizeWant, breastShape, ptosis, diseaseBreast]);

  return(

    <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormControl>
          <FormLabel id="botox-when">What size are you now?</FormLabel>  
          <RadioGroup row aria-labelledby="botox-when" name="botox-when" defaultValue="0">
            <FormControlLabel value="AA"    control={<Radio size="small" />}  label="AA"    onChange={(e)=>{setBreastSizeNow(e.target.value)}} style={{ width:"31%" }} />
            <FormControlLabel value="A"     control={<Radio size="small" />}  label="A"     onChange={(e)=>{setBreastSizeNow(e.target.value)}} style={{ width:"31%" }} />
            <FormControlLabel value="B"     control={<Radio size="small" />}  label="B"     onChange={(e)=>{setBreastSizeNow(e.target.value)}} style={{ width:"31%" }} />
            <FormControlLabel value="C"     control={<Radio size="small" />}  label="C"     onChange={(e)=>{setBreastSizeNow(e.target.value)}} style={{ width:"31%" }} />
            <FormControlLabel value="D"     control={<Radio size="small" />}  label="D"     onChange={(e)=>{setBreastSizeNow(e.target.value)}} style={{ width:"31%" }} />
            <FormControlLabel value="Other" control={<Radio size="small" />}  label="Other" onChange={(e)=>{setBreastSizeNow(e.target.value)}} style={{ width:"31%" }} />
          </RadioGroup>
        </FormControl>
      </Grid>
      {(breastSizeNow && breastSizeNow !== '') &&
        <Grid item xs={12} sm={6}>
          <FormControl>
            <FormLabel id="botox-when">What size do you want?</FormLabel>  
            <RadioGroup row aria-labelledby="botox-when" name="botox-when" defaultValue="0">
              <FormControlLabel value="AA"    control={<Radio size="small" />}  label="AA"    onChange={(e)=>{setBreastSizeWant(e.target.value)}} style={{ width:"31%" }} />
              <FormControlLabel value="A"     control={<Radio size="small" />}  label="A"     onChange={(e)=>{setBreastSizeWant(e.target.value)}} style={{ width:"31%" }} />
              <FormControlLabel value="B"     control={<Radio size="small" />}  label="B"     onChange={(e)=>{setBreastSizeWant(e.target.value)}} style={{ width:"31%" }} />
              <FormControlLabel value="C"     control={<Radio size="small" />}  label="C"     onChange={(e)=>{setBreastSizeWant(e.target.value)}} style={{ width:"31%" }} />
              <FormControlLabel value="D"     control={<Radio size="small" />}  label="D"     onChange={(e)=>{setBreastSizeWant(e.target.value)}} style={{ width:"31%" }} />
              <FormControlLabel value="Other" control={<Radio size="small" />}  label="Other" onChange={(e)=>{setBreastSizeWant(e.target.value)}} style={{ width:"31%" }} />
            </RadioGroup>
          </FormControl>
        </Grid>
      }
      {(breastSizeWant && breastSizeWant !== '') &&
        <>
          <Grid item xs={12} sm={12}>
            <FormControl>
              <FormLabel id="botox-when">What shape do you want?</FormLabel>  
              <RadioGroup row aria-labelledby="botox-when" name="botox-when" defaultValue="0">
                <FormControlLabel value="Round" control={<Radio size="small" />}  label="Round" onChange={(e)=>{setBreastShape(e.target.value)}} style={{ width:"47%" }} />
                <FormControlLabel value="Drop"  control={<Radio size="small" />}  label="Drop"  onChange={(e)=>{setBreastShape(e.target.value)}} style={{ width:"47%" }} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormControl>
              <FormLabel id="ptos">Breast ptosis</FormLabel>  
              <RadioGroup row aria-labelledby="botox-when" name="botox-when" defaultValue="0">
                <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setPtosis(e.target.value)}} style={{ width:"45%" }} />
                <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setPtosis(e.target.value)}} style={{ width:"45%" }} />
              </RadioGroup>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={12}>
            <FormLabel id="diseaseBreast">{'Have there been previous surgeries? (what and when)'}</FormLabel>  
            <TextField name="diseaseBreast" fullWidth multiline rows={4} id="diseaseBreast" value={diseaseBreast} onChange={(e)=>{setDiseaseBreast(e.target.value)}} className='cons-input' />
          </Grid>
        </>
      }
    </Grid>
  )
}