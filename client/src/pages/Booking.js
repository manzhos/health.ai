import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { 
  Container,
  Card,
  Box,
  Grid,
  FormControl,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Button
} from '@mui/material'
// import Iconify from '../components/Iconify';

import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'

import CalendarOutside from '../components/CalendarOutside'
import Time from '../components/Time'

import PWAMenu            from '../components/PWAMenu'
import { AuthContext }    from '../context/AuthContext'
import {API_URL} from '../config'
import { useHttp } from '../hooks/http.hook'
import { maxHeight } from '@mui/system';


export default function Booking(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const {token}   = useContext(AuthContext)

  const [date, setDate] = useState(new Date())
  const [time, setTime] = useState('__:__')
  const [doctorList, setDoctorList] = useState([])
  const [doctorSelected, setDoctorSelected] = useState([])
  const [procedureTypeId, setProcedureTypeId] = useState(4)
  const [procedureId, setProcedureId] = useState(0)
  const [doctor, setDoctor] = useState('')
  const [procedure, setProcedure] = useState('')
  const [recordList, setRecordList] = useState([])
  const [slots, setSlots] = useState([]);

  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId)
  }

  const handleProcedureChange = (newProcedureId) => {
    setProcedureId(newProcedureId)
  }

  const avatar = `${API_URL}`+'blank-avatar.svg'

  function parseJwt (token) {
    if(token && token !== ''){
      var base64Url = token.split('.')[1]
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    }
  };
  const pJWT = parseJwt(token)
  const userId = pJWT ? pJWT.userId : null
  // console.log('userId:', userId);

  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/doctors', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setDoctorList(res)
      setDoctorSelected(res)
    } catch (e) { console.log('error:', e) }
  }, [request])
  useEffect(() => {getDoctors()}, [getDoctors]); 

  let s = [], t = [],  busy = [];
  // busy  = [{'from':'11:15', 'total':60}, {'from':'16:30', 'total':90}] // 1- time from; 2- time how much
  // slots = [{'time':'10:00'}, {'time':'11:00'}, {'time':'12:00'}, {'time':'13:00'}, {'time':'14:00'}, {'time':'15:00'}]

  // working hours 10:00 - 17:00 (time interval 30 minutes)
  // for(let i=10*60; i<17*60; i+=30){
  //   let h = Math.trunc(i/60);
  //   let m = '00';
  //   if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
  //   // console.log('time:', (h + ':' + m));
  //   s[i] = {'time':(h + ':' + m)};
  // }

  // get the data about doctors procedure
  const getRecordsByDoctor = async () => {
    // console.log('getRecordsByDoctor:', doctor);
    try {
      const res = await request(`${API_URL}api/tt_bydoctor/${doctor}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('tt_bydoctor:', res);
      setRecordList(res);
      busy.length=0;
    } catch (e) { console.log('error:', e) }
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
  const handleRecord = async () => {
    // navigate('/payment')
    // const data = {
    //   'procedure_id'  : procedureId, 
    //   'user_id'       : userId, 
    //   'doctor_id'     : doctor,
    //   'date'          : date, 
    //   'time'          : time,
    // }
    // console.log('data', data)
    try {
      const res = await request(`${API_URL}`+'api/timetable', 'POST', {
        procedure_id  : procedureId,
        user_id       : userId,
        doctor_id     : doctor,
        date          : date,
        time          : time,
      })
      // console.log('res:', res)
      navigate('/calendar')
      // window.top.location = `${URL}user/timetable`
    } catch (e) {console.log('error:', e)} 
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
      <PWAMenu />
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
                  <ProcedureType onChangeProcedureType={handleProcedureTypeChange} />
                  {/* procedureType now: {procedureTypeId} */}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <ProcedureList procedureTypeId={procedureTypeId} onChangeProcedure={handleProcedureChange} online={true} />
                  {/* procedure now: {procedureId} */}
                </Grid>
                
              </Grid>
            <Grid item xs={1}></Grid>
          </Grid>

          {/* --- calendar --- */}          
          {/* <Grid container item xs={12} sm={12}> */}
            <Card style={{padding:"30px"}} sx={{ mt:3, mb: 3}}>
              <Grid container>
                {/* <Grid item xs={12} sm={8} sx={{ mb:3 }}>
                  <Typography component="h1" variant="h5">
                    {sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}
                  </Typography>
                </Grid> */}
                <Grid item xs={12} sm={12}>
                  <Box style={{ maxWidth:"160px", margin:"0 auto" }}>
                    <CalendarOutside onDateChange={handleDateChange}/> 
                  </Box>
                </Grid>
              </Grid>
              <Grid sx={{ mt:3 }}>
                <Time onTimeChange={handleTimeChange} slots={slots} />
              </Grid>
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