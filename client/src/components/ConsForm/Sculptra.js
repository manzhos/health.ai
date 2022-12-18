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

export default function Sculptra({ onChangeSculptra }) {

  const [autoimmune, setAutoimmune] = useState(0);
  const [pregnant, setPregnant] = useState(0);
  const [localReaction, setLocalReaction] = useState(0);
  const [edema, setEdema] = useState(0);

  useEffect(() => {
    onChangeSculptra(autoimmune, pregnant, localReaction, edema)
  }, [autoimmune, pregnant, localReaction, edema]);

  return(
    <Grid container spacing={2} sx={{ mt: 2 }} justifyContent="center">
      {/* autoimmune */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="autoimmune">Autoimmune</FormLabel>  
          <RadioGroup row aria-labelledby="autoimmune" name="autoimmune" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setAutoimmune(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setAutoimmune(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>


      {/* pregnant */}
      <Grid item xs={6} sm={6}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="pregnant">Pregnant</FormLabel>  
          <RadioGroup row aria-labelledby="pregnant" name="pregnant" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setPregnant(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setPregnant(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>
  
      {/* local reactions */}
      <Grid item xs={12} sm={12}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="localReaction">Have there been local reactions to the filler before?</FormLabel>  
          <RadioGroup row aria-labelledby="localReaction" name="localReaction" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setLocalReaction(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setLocalReaction(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>

      {/* edema */}
      <Grid item xs={12} sm={12}>
        <FormControl sx={{ mt: 2 }}>
          <FormLabel id="localReaction">Chronic edema (eyes/face)</FormLabel>  
          <RadioGroup row aria-labelledby="edema" name="edema" defaultValue="0">
            <FormControlLabel value="0" control={<Radio size="small" />}  label="No"  onChange={(e)=>{setEdema(e.target.value)}} className="cons-radio"/>
            <FormControlLabel value="1" control={<Radio size="small" />}  label="Yes" onChange={(e)=>{setEdema(e.target.value)}} className="cons-radio"/>
          </RadioGroup>
        </FormControl>
      </Grid>

    </Grid>
  )
}