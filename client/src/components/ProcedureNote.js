import React, {useState, useEffect} from "react";
import humanDate from "./HumanDate";
import {
  Box,
  Grid,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import {API_URL} from '../config';
import { useHttp } from '../hooks/http.hook'

export default function ProcedureNote({ procedure, onSave }){
  // console.log('procedure:', procedure);
  const {request} = useHttp()

  const zoneList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const zoneCost = [179, 289, 369];
  const btx = [24, 26, 32];

  const [botoxWhat, setBotoxWhat] = useState(0);
  const [zone, setZone] = useState(0);
  const [numberUnits, setNumberUnits] = useState(0);
  const [note, setNote] = useState('');
  const [medind, setMedind] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [checkoutList, setCheckoutList] = useState([]);
  const [total, setTotal] = useState(0);

  const addToCheckoutList = () => {
    if(!zone || !numberUnits || numberUnits === 0) return;
    setCheckoutList((checkoutList) => [...checkoutList, {
      'zone': zone,
      'numberUnits': numberUnits
    }]);
    // console.log('added to checkoutList:', checkoutList);
  }

  const delFromCheckoutList = (i) => {
    setCheckoutList((checkoutList) => [...checkoutList.slice(0, i), ...checkoutList.slice(i + 1)]);
    // console.log('del from checkoutList:', checkoutList);
  }

  useEffect(()=>{
    // setTotal( checkoutList.reduce( (acc, curr) => acc + curr.numberUnits * btx[botoxWhat], 0 ) );
    // setTotal( checkoutList.reduce( (acc, curr) => acc % 3 === 0 ? 369 : (acc % 2 === 0 ? 289 : 179), 0 ) );
    setTotal(()=>{
      if(checkoutList?.length){
        // console.log('checkoutList:', checkoutList);
        const count = checkoutList.length;
        const countInt = parseInt(count / 3),
              countRes = count % 3;
        return countInt * zoneCost[2] + (countRes === 2 ? zoneCost[1] : countRes === 1 ? zoneCost[0] : 0);
      }
    })
  },[checkoutList]);

  const saveNote = async () => {
    // note, client_id, doctor_id, procedure_id, services, cost
    try {
      const res = await request(`${API_URL}`+'api/doc', 'POST', {
        procedure_id  : procedure.id, 
        client_id     : procedure.client_id, 
        doctor_id     : procedure.doctor_id, 
        note          : note, 
        medind        : medind, 
        diagnosis     : diagnosis, 
        services      : checkoutList,
        cost          : total
      })
      // auth.login(data.token, data.userId)
      onSave();
    } catch (e) {console.log('error:', e)} 
  }

  return(
    <div className="modal-tt-doctor">
      <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Grid container>
          <Grid item xs={6} sm={3}>
            Procedure:<br /><strong>{procedure.title}</strong> <br /> <br /> 
          </Grid>
          <Grid item xs={6} sm={3}>
            Patient:<br /><strong>{procedure.client_firstname}&nbsp;{procedure.client_lastname}</strong> <br /> <br /> 
          </Grid>
          <Grid item xs={6} sm={3}>
            Start:<br /><strong>{humanDate(procedure.start)}</strong> <br /> 
          </Grid>
          <Grid item xs={6} sm={3}>
            End:<br /><strong>{humanDate(procedure.end)}</strong>
          </Grid>

          <Grid item xs={12}>
            <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 1 }}>&nbsp;</Box>
          </Grid>

          <Grid item xs={12} sm={12}>
            {procedure.title === 'BTX-A treatment' && 
              <Grid container spacing={2}>
                <Grid item xs={4} sm={4}>
                  <img src="/static/face_scheme.svg" />
                </Grid>
                <Grid item xs={1} sm={1}>&nbsp;</Grid>
                <Grid item xs={7} sm={7}>
                  <Grid container>
                    <Grid item xs={12} sm={12}>
                      <FormControl sx={{ mt: 3 }}>
                        <FormLabel id="botox-what">What drug was used for the procedure?</FormLabel>  
                        <RadioGroup row aria-labelledby="botox-what" name="botox-what" defaultValue="0">
                          <FormControlLabel value="0" control={<Radio size="small" />}  label="Allergan BTX"  onChange={(e)=>{setBotoxWhat(e.target.value)}} />
                          <FormControlLabel value="1" control={<Radio size="small" />}  label="Azalure"       onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/>
                          <FormControlLabel value="2" control={<Radio size="small" />}  label="Bocoutur"      onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/>
                          {/* <FormControlLabel value="3" control={<Radio size="small" />}  label="Other"         onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/> */}
                        </RadioGroup>
                      </FormControl>
                    </Grid>
                    <Grid container spacing={2} sx={{ mt: 3 }}>
                      <Grid item xs={4} sm={4}>
                        <FormControl sx={{ width: 1 }}>
                          <InputLabel id="zone">Botox zone</InputLabel>
                          <Select
                            labelId="zone"
                            id="zone"
                            name="zone"
                            value={zone}
                            label="Botox zone"
                            onChange={(e)=>{setZone(e.target.value)}} 
                            className='cons-input'
                          >
                            {zoneList.map((item)=>{
                              return(
                                <MenuItem key={item} value={item}>{item}</MenuItem>
                              )
                            })}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={4} sm={4}>
                        <TextField fullWidth id="numberUnits" label="Number units" name="numberUnits" type='number' value={numberUnits} onChange={(e)=>{setNumberUnits(e.target.value)}} className='cons-input' />
                      </Grid>
                      <Grid item xs={4} sm={4}>
                        <Button variant="outlined" sx={{ mt: 1, ml: 3 }} onClick={addToCheckoutList}>Add</Button>
                      </Grid>
                    </Grid>
                    <Grid container sx={{ mt:2 }}>
                      <Grid item xs={8} sm={8}>
                        <TableContainer>
                          <Table aria-label="zone table">
                            <TableHead>
                              <TableRow>
                                <TableCell>Zone</TableCell>
                                <TableCell align="right">Number Units</TableCell>
                                <TableCell align="right"></TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {checkoutList.map((item, key) => {
                                return(
                                  <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                    <TableCell component="th" scope="row">{item.zone} </TableCell>
                                    <TableCell align="right">{item.numberUnits}</TableCell>
                                    <TableCell align="right">
                                      <Button id="DelButton" onClick={() => delFromCheckoutList(key)} variant="outlined" color="error" size="small">&#10006; Delete</Button>
                                    </TableCell>
                                  </TableRow>
                                )
                              })}
                            </TableBody>
                          </Table>
                        </TableContainer>                      
                      </Grid>
                    </Grid>
                    <Grid container>
                      <Grid item xs={8} sm={8}>
                        <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                          <Box sx={{ mt:2 }}>Total cost: <strong>{total}</strong> EUR</Box>
                        </Box>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item xs={12}>
                  <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, mb: 0 }}>&nbsp;</Box>
                </Grid>
              </Grid>
            }
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" sx={{ mt:1 }}>
                  {'Note about procedure'}
                </Typography>
                <Grid item xs={12} sm={12} sx={{ mt: 3 }}>
                  <TextField name="note" fullWidth multiline rows={4} id="note" value={note} onChange={(e)=>{setNote(e.target.value)}} label="Note" className='cons-input' />
                </Grid>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Checkbox name="medind" value="medind" onChange={()=>{setMedind(!medind)}} color="primary" />}
                  label="Medical indication"
                />
                { medind &&
                  <Grid item xs={12} sm={12} sx={{ mt: 1 }}>
                    <TextField 
                      fullWidth multiline rows={4}
                      name="diagnosis"
                      id="diagnosis"
                      label="Diagnosis"
                      className='cons-input' style={{ marginTop:"4px" }} 
                      value={diagnosis} onChange={(e)=>{setDiagnosis(e.target.value)}}
                    />
                  </Grid>
                }
              </Grid>
            </Grid>
            <Button variant="contained" sx={{ mt: 3 }} onClick={saveNote}>Save</Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}