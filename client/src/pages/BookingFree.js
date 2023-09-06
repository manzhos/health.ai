import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { 
  Container,
  Card,
  Box,
  Grid,
  FormControl,
  Typography,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Button
} from '@mui/material'
// import Iconify from '../components/Iconify';

import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'

import CalendarOutside from '../components/CalendarOutside'
import Time from '../components/Time'

import PWAMenu from '../components/PWAMenu'
import {URL, API_URL} from '../config'
import { useHttp } from '../hooks/http.hook'


export default function BookingFree(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const source  = searchParams.get("source");
  const procedureTypeIdDefault  = searchParams.get("procedureTypeIdDefault");
  const procedureIdDefault  = searchParams.get("procedureIdDefault");

  console.log('procedureTypeIdDefault, procedureIdDefault', procedureTypeIdDefault, procedureIdDefault)

  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState('__:__')
  const [doctorList, setDoctorList] = useState([])
  const [doctorSelected, setDoctorSelected] = useState([])
  const [procedureTypeId, setProcedureTypeId] = useState(procedureTypeIdDefault)
  const [procedureId, setProcedureId] = useState(procedureIdDefault)

  console.warn('procedureType, procedureId', procedureTypeId, procedureId)

  const [doctor, setDoctor] = useState('')
  const [procedure, setProcedure] = useState('')
  const [recordList, setRecordList] = useState([])
  const [slots, setSlots] = useState([]);
  const [email, setEmail] = useState('');
  const [lead, setLead] = useState({});
  const [user, setUser] = useState({});

  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId)
  }

  const handleProcedureChange = (newProcedureId) => {
    setProcedureId(newProcedureId)
  }

  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/doctors', 'GET', null, {})
      setDoctorList(res)
      setDoctorSelected(res)
    } catch (e) { console.log('error:', e) }
  }, [request])
  useEffect(() => {getDoctors()}, [getDoctors]); 

  let s = [], t = [],  busy = [];

  // get the data about doctors procedure
  const getRecordsByDoctor = async () => {
    // console.log('getRecordsByDoctor:', doctor);
    try {
      const res = await request(`${API_URL}api/tt_bydoctor/${doctor}`, 'GET', null, {})
      // console.log('tt_bydoctor:', res);
      setRecordList(res);
      busy.length=0;
    } catch(error) { console.log('error:', error) }
  }
  useEffect(() => {getRecordsByDoctor()}, [date, doctor])   

  const filterRecordsByDate = () => {
    recordList.map(item => {
      const rd = new Date(item.date);
      if(rd.getFullYear() === date.getFullYear() && rd.getMonth() === date.getMonth() && rd.getDate() === date.getDate()) {
        busy.push({
          'from'  : item.time,
          'total' : item.duration
        })
      }
    })
    busy.forEach((item)=>{
      item.fromMin = Number(item.from.slice(0, 2))*60 + Number(item.from.slice(3));
      for(let i=item.fromMin; i<=(item.fromMin + item.total); i+=30) t.push(i);
      // console.log('busy time:', t);
    })
    // console.log('final busy:', busy);
    s.length=0;
    // slots = [{'time':'10:00'}, {'time':'11:00'}, {'time':'12:00'}, {'time':'13:00'}, {'time':'14:00'}, {'time':'15:00'}]
    // working hours 10:00 - 21:00 (time interval 60 minutes)
    for(let i = 10*60; i < 21*60; i+=60){
      if(t.includes(i)) continue;
      let h = Math.trunc(i/60);
      let m = '00';
      if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
      // console.log('time:', (h + ':' + m));
      s[i] = {'time':(h + ':' + m)};
      // console.log(`s[${i}]=`, s[i]);
    }
    setSlots(s);
    // console.log('slots:', slots, 'for doctor:', doctor);
  }
  useEffect(()=>{filterRecordsByDate()}, [recordList]);

  // send data
  // Create the Lead
  const newLead = async() => {
    const bookfree = true,
    message  = `Hello. I am from the ${source}`;
    try {
      const res = await request(`${API_URL}`+'api/form', 'POST', {
        email     : email,
        source    : source,
        bookfree  : bookfree,
        message   : message
      })
      setLead(res);
      // console.log('Lead:', lead);
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    } 
  }
  // create New Client by Lead
  const newClient = async() => {
    try {
      const res = await request(`${API_URL}`+'api/user', 'POST', {
        firstname : '__New Lead__',
        lastname  : lead.id,
        email     : lead.email,
        password  : '00000000',
        promo     : true
      })
      setUser(res);
      // console.log('User:', user);
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    } 
  }
  // book the procedure
  const bookProcedure = async() => {
    try {
    const res = await request(`${API_URL}`+'api/timetable', 'POST', {
      procedure_id  : procedureId,
      user_id       : user.id,
      doctor_id     : doctor,
      date          : date,
      time          : time,
    })
    setProcedure(res);
    // console.log('res:', procedure)
    } catch (e) {console.log('error:', e)} 
  }
  
  const handleRecord = async () => {
    if(email === '') {
      alert('Fill all field, please.');
      return;
    }
    setLead({});
    await newLead();
    setUser({});
    if(lead && Object.keys(lead).length) await newClient();
    if(user && Object.keys(user).length) await bookProcedure();
    if(procedure && Object.keys(procedure).length) window.top.location = `${URL}thanks`
  }

  const handleDateChange = (dateValue) => {
    // console.log('dateValue', dateValue);
    setDate(dateValue);
  }
  const handleTimeChange = (timeValue) => {
    setTime(timeValue)
  }

  const handleChangeDoctor = (event) => {
    // console.log('setDoctor:', event.target.value);
    event.preventDefault();
    setDoctor(event.target.value);
    const index = doctorList.findIndex((el) => el.id === event.target.value)
    if(index > -1) {
      let arr = []
      arr.push(doctorList[index])
      setDoctorSelected(arr)
    }
    // console.log('doctorSelected', doctor)
  }

  const handleClickDoctor = () => {
    const index = doctorList.findIndex((el) => el.id === doctor)
    if(index > -1) {
      let arr = []
      arr.push(doctorList[index])
      setDoctorSelected(arr)
    }

  }
  useEffect(()=>{handleClickDoctor()}, [doctor]) 

  
  return(
    <Container style={{textAlign:"center"}}>
      {/* <PWAMenu /> */}
      <div className='logo-block'>
        <div className='logo-consult-form'>
          <img
            src="../static/sy_logo.svg"
            alt="Stunning You"
            loading="lazy"
          />
        </div>
      </div>
      <div className='consult-form'>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
          <Grid container>
            <Grid item xs={12} sm={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 5, mb: 1 }}>&nbsp;</Box>
              <Typography component="h1" variant="h5">
                Book the procedure
              </Typography>
            </Grid>
          </Grid>
          
          <Grid container sx={{mt: 3}}>
            <Grid item xs={1}></Grid>
              <Grid container item xs={10} sm={10} spacing={3}>
                <Grid item xs={12} sm={12}>
                  <FormControl sx={{ width: 1 }}>
                    <InputLabel id="doctor-select">Doctor</InputLabel>
                    <Select
                      labelId="doctor-select"
                      id="doctor-select"
                      name="doctor_id"
                      value={doctor}
                      label="Doctor"
                      onChange={handleChangeDoctor} 
                      className='cons-input'
                    >
                      {doctorList.map((item)=>{
                        return(
                          <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}</MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} sm={12} spasing={2} direction="row" justifyContent="center" alignItems="center">
                  {doctorSelected.map((item, key)=>{
                    return(
                      <img 
                        key={item.id} 
                        src={API_URL + 'files/avatars/' + item.avatar} 
                        alt={'Doctor ' + sentenceCase(item.firstname) + ' ' + sentenceCase(item.lastname)} 
                        className="doc-ava" 
                        onClick={()=>{setDoctor(item.id)}}
                      />
                    )
                  })}
                </Grid>

                <Grid item xs={12} sm={6}>
                  <ProcedureType procedureTypeId={procedureTypeId} onChangeProcedureType={handleProcedureTypeChange} />
                  {/* procedureType now: {procedureTypeId} */}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ProcedureList procedureTypeId={procedureTypeId} procedureId={procedureId} onChangeProcedure={handleProcedureChange} online={true} />
                  {/* procedure now: {procedureId} */}
                </Grid>
                
              </Grid>
            <Grid item xs={1}></Grid>
          </Grid>

          {/* --- calendar --- */}          
          {/* <Grid container item xs={12} sm={12}> */}
            <Card style={{padding:"30px"}} sx={{ mt:3, mb: 3}}>
              <Grid container>
                <Grid item xs={12} sm={12}>
                  <Box style={{ maxWidth:"160px", margin:"0 auto" }}>
                    <CalendarOutside onDateChange={handleDateChange}/> 
                  </Box>
                </Grid>
              </Grid>
              <Grid sx={{ mt:3 }}>
                <Time onTimeChange={handleTimeChange} slots={slots} />
              </Grid>
              { time !== '__:__' &&
                <Grid item sx={{ mt: 6, mb: 3 }} style={{ width:"50%", maxWidth:"600px", minWidth:"280px", margin:"40px auto 30px"}}>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    id="email"
                    label="Email Address"
                    name="email"
                    autoComplete="email"
                    autoFocus
                    onChange={(e)=>{setEmail(e.target.value)}}
                  />
                </Grid>
              }
            </Card>
          {/* </Grid> */}

          <Button
            type="button"
            // fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 18 }}
            onClick={handleRecord}
          >
            Book
          </Button>
          
        </Box>
      </div>
    </Container>      
  )
}