import React, {useState, useEffect, useCallback, useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { sentenceCase } from "change-case";
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
// import Scrollbar from "./Scrollbar";
import Confirm from "./Confirm";

export default function ProcedureNote({ procedure, onSave }){
  console.log('procedure:', procedure);
  const {request} = useHttp();
  const {token, userId, userTypeId}   = useContext(AuthContext);

  const zoneList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const fillerZoneList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const bodyZoneList = [1, 2, 3, 4, 5, 6, 7, 8];
  const productList = ['PLLA', 'Hyaluronic acid', 'Hydroxyapatite', 'Other'];
  const zoneCost = [179, 289, 369];
  const btx = [24, 26, 32];

  const [botoxWhat, setBotoxWhat] = useState(0);
  const [zone, setZone] = useState(0);
  const [fillerWhat, setFillerWhat] = useState(0);
  const [fillerZone, setFillerZone] = useState(0);
  const [bodyZone, setBodyZone] = useState(0);
  const [power, setPower] = useState(0);
  const [pulses, setPulses] = useState(0);
  const [nameTech, setNameTech] = useState('');
  const [product, setProduct] = useState(0);
  const [numberUnits, setNumberUnits] = useState(0);
  const [note, setNote] = useState('');
  const [medind, setMedind] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [checkoutList, setCheckoutList] = useState([]);
  const [bodyCheckoutList, setBodyCheckoutList] = useState([]);
  const [total, setTotal] = useState(0);

  const [clientList, setClientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [procedureList, setProcedureList] = useState([]);

  const [clientId, setClientId] = useState(procedure.client_id);
  const [doctorId, setDoctorId] = useState(procedure.doctor_id);
  const [procedureFinal, setProcedureFinal] = useState(procedure.procedure_id);

  const [confirmData, setConfirmData] = useState({});

  const getClients = useCallback(async () => {
    try {
      const clients = await request(`${API_URL}api/clients`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setClientList(clients)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getClients()}, [getClients])

  const getDoctors = useCallback(async () => {
    try {
      const doctors = await request(`${API_URL}api/doctors`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setDoctorList(doctors);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getDoctors()}, [getDoctors])

  const getProcedures = useCallback(async () => {
    try {
      const procedures = await request(`${API_URL}api/procedures`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setProcedureList(procedures)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getProcedures()}, [getProcedures])


  const addToCheckoutList = () => {
    // console.log('add to checkoutList:', zone, fillerZone, numberUnits);
    if((!zone && !fillerZone) || !numberUnits || numberUnits === 0) return;
    setCheckoutList((checkoutList) => [...checkoutList, {
      'zone': zone !== 0 ? zone : fillerZone,
      'numberUnits': numberUnits
    }]);
    // console.log('added to checkoutList:', checkoutList);
  }

  const addToBodyCheckoutList = () => {
    console.log('add to Body checkoutList:', bodyZone, nameTech, power, pulses);
    if(!bodyZone || !nameTech || !power || power === 0 || !pulses || pulses === 0 ) return;
    setBodyCheckoutList((bodyCheckoutList) => [...bodyCheckoutList, {
      'nameTech': nameTech,
      'bodyZone': bodyZone,
      'power': power,
      'pulses': pulses,
    }]);
    console.log('added to Body checkoutList:', bodyCheckoutList);
  }

  const delFromCheckoutList = (i) => {
    setCheckoutList((checkoutList) => [...checkoutList.slice(0, i), ...checkoutList.slice(i + 1)]);
    // console.log('del from checkoutList:', checkoutList);
  }

  const delFromBodyCheckoutList = (i) => {
    setBodyCheckoutList((bodyCheckoutList) => [...bodyCheckoutList.slice(0, i), ...bodyCheckoutList.slice(i + 1)]);
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
        procedure_id  : procedureFinal, 
        client_id     : clientId, 
        doctor_id     : doctorId, 
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

  const delRecord = (bookingId) => {
    setConfirmData({
      open:       true,
      message:    `Confirm delete booking #${bookingId}`,
      bookingId:  bookingId
    });
  }

  const _delRecord = async (response) => {
    // console.log('response:', response);
    // console.log('confirmData.bookingId:', confirmData.bookingId);
    if(response){
      try {
        const res = await request(`${API_URL}api/timetable/${confirmData.bookingId}`, 'DELETE', null, {
          Authorization: `Bearer ${token}`
        })
      } catch (e) {console.log('error:', e)}    
    }
    setConfirmData({ open:false });   
    onSave(); 
  }

  return(
    <div className="modal-tt-doctor">
      <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* extentended components */}
        <Confirm confirmData={confirmData} response={(response)=>{_delRecord(response)}} />

        {/* <Scrollbar> */}
          <Grid container>
            <Grid item xs={12} sm={4}>
              <FormControl sx={{ width:'90%' }}>
                <InputLabel id="procedure-select">Procedure</InputLabel>
                <Select
                  labelId="procedure-select"
                  id="procedure-select"
                  name="procedure_id"
                  value={procedureFinal}
                  label="Procedure"
                  onChange={(event)=>{setProcedureFinal(event.target.value)}} 
                >
                  {procedureList.map((item, key)=>{
                    return(
                      <MenuItem key={item.id} value={item.id}>{sentenceCase(item.procedure)}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ mb:3 }}>
              {/* Doctor */}
              <FormControl sx={{ width:'90%' }}>
                <InputLabel id="doctor-select">Doctor</InputLabel>
                <Select
                  labelId="doctor-select"
                  id="doctor-select"
                  name="doctor_id"
                  value={doctorId}
                  label="Doctor"
                  onChange={(event)=>{setDoctorId(event.target.value)}} 
                >
                  {doctorList.map((item, key)=>{
                    return(
                      <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)} {sentenceCase(item.lastname)}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <p>&nbsp;</p>
              {/* Patient */}
              <FormControl sx={{ width:'90%' }}>
                <InputLabel id="client-select">Client</InputLabel>
                <Select
                  labelId="client-select"
                  id="client-select"
                  name="client_id"
                  value={clientId}
                  label="Client"
                  onChange={(event)=>{setClientId(event.target.value)}} 
                >
                  {clientList.map((item, key)=>{
                    return(
                      <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)} {sentenceCase(item.lastname)}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={9} sm={3}>
              Start:<br /><strong>{humanDate(procedure.start)}</strong> <br /> 
              {/* <CalendarOutside onDateChange={handleDateChange} dValue={startDate}/> */}

              End:<br /><strong>{humanDate(procedure.end)}</strong>
            </Grid>
            <Grid item xs={3} sm={1} sx={{ textAlign: "right" }}>
              <Button onClick={() => {delRecord(procedure.id)}} size="small" variant="outlined" color="error">Delete</Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 1 }}>&nbsp;</Box>
            </Grid>

            <Grid item xs={12} sm={12}>
              {/* Note regarding Botox */}
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
                            <FormControlLabel value="1" control={<Radio size="small" />}  label="Azzalure"      onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/>
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

              {/* Note regarding Fillers */}
              {procedure.title === 'Cosmetic fillers' && 
                <Grid container spacing={2}>
                  <Grid item xs={4} sm={4}>
                    <img src="/static/face_scheme-fillers.svg" />
                  </Grid>
                  <Grid item xs={1} sm={1}>&nbsp;</Grid>
                  <Grid item xs={7} sm={7}>
                    <Grid container>
                      <Grid item xs={12} sm={12}>
                        <FormControl sx={{ mt: 3 }}>
                          <FormLabel id="filler-what">What drug was used for the procedure?</FormLabel>  
                          <RadioGroup row aria-labelledby="filler-what" name="filler-what" defaultValue="0">
                            <FormControlLabel value="0" control={<Radio size="small" />}  label="Microbolus" onChange={(e)=>{setFillerWhat(e.target.value)}} />
                            <FormControlLabel value="1" control={<Radio size="small" />}  label="Canulas"    onChange={(e)=>{setFillerWhat(e.target.value)}} sx={{ml:2}}/>
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Product</InputLabel>
                            <Select
                              labelId="product"
                              id="product"
                              name="product"
                              value={product}
                              label="Product"
                              onChange={(e)=>{setProduct(e.target.value)}} 
                              className='cons-input'
                            >
                              {productList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Zone</InputLabel>
                            <Select
                              labelId="zone"
                              id="zone"
                              name="zone"
                              value={fillerZone}
                              label="Zone"
                              onChange={(e)=>{setFillerZone(e.target.value)}} 
                              className='cons-input'
                            >
                              {fillerZoneList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="numberUnits" label="ml" name="numberUnits" type='number' value={numberUnits} onChange={(e)=>{setNumberUnits(e.target.value)}} className='cons-input' />
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
                                  <TableCell align="right">ml</TableCell>
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

              {/* Note regarding Body Cryo */}
              {procedure.title === 'Body Cryo' && 
                <Grid container spacing={2}>
                  <Grid item xs={4} sm={4}>
                    <img src="/static/body_scheme.svg" />
                  </Grid>
                  <Grid item xs={1} sm={1}>&nbsp;</Grid>
                  <Grid item xs={7} sm={7}>
                    <Grid container>
                      <Grid item xs={12} sm={12}>
                        <TextField fullWidth id="nameTech" label="Name of Technology" name="nameTech" type='text' value={nameTech} onChange={(e)=>{setNameTech(e.target.value)}} className='cons-input' />
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Spot</InputLabel>
                            <Select
                              labelId="Spot"
                              id="bodyZone"
                              name="bodyZone"
                              value={bodyZone}
                              label="Spot"
                              onChange={(e)=>{setBodyZone(e.target.value)}} 
                              className='cons-input'
                            >
                              {bodyZoneList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="power" label="Power" name="power" type='number' value={power} onChange={(e)=>{setPower(e.target.value)}} className='cons-input' />
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="pulses" label="Pulses" name="pulses" type='number' value={pulses} onChange={(e)=>{setPulses(e.target.value)}} className='cons-input' />
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <Button variant="outlined" sx={{ mt: 1, ml: 3 }} onClick={addToBodyCheckoutList}>Add</Button>
                        </Grid>
                      </Grid>
                      <Grid container sx={{ mt:2 }}>
                        <Grid item xs={12} sm={12}>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name of Technology</TableCell>
                                  <TableCell align="right">Spot</TableCell>
                                  <TableCell align="right">Power</TableCell>
                                  <TableCell align="right">Pulses</TableCell>
                                  <TableCell align="right"></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {bodyCheckoutList.map((item, key) => {
                                  return(
                                    <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                      <TableCell component="th" scope="row">{item.nameTech} </TableCell>
                                      <TableCell align="right">{item.bodyZone}</TableCell>
                                      <TableCell align="right">{item.power}</TableCell>
                                      <TableCell align="right">{item.pulses}</TableCell>
                                      <TableCell align="right">
                                        <Button id="DelButton" onClick={() => delFromBodyCheckoutList(key)} variant="outlined" color="error" size="small">&#10006; Delete</Button>
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
                        <Grid item xs={12} sm={12}>
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
        {/* </Scrollbar> */}
      </Box>
    </div>
  )
}