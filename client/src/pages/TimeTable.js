import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Box,
  Grid,
  Stack,
  // Avatar,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
import Page from '../components/Page';
import Iconify from '../components/Iconify';
import Scrollbar from '../components/Scrollbar';
import Calendar from '../components/Calendar'
import Time from '../components/Time'
import { useHttp } from '../hooks/http.hook'
import { getDate } from 'date-fns';

export default function TimeTable(){
  const {request} = useHttp()

  const [date, setDate] = useState('')
  const [time, setTime] = useState('__:__')
  const [doctorList, setDoctorList] = useState([])
  const [procedureList, setProcedureList] = useState([])
  const [doctor, setDoctor] = useState('')
  const [procedure, setProcedure] = useState('')

  const getDoctors = useCallback(async () => {
    try {
      const res = await request('http://localhost:3300/api/doctors', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setDoctorList(res);
    } catch (e) { console.log('error:', e)}
  }, [request])
  const getProcedures = useCallback(async () => {
    try {
      const res = await request('http://localhost:3300/api/procedures', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setProcedureList(res);
    } catch (e) { console.log('error:', e)}
  }, [request])

  useEffect(() => {getDoctors()}, [getDoctors])  
  useEffect(() => {getProcedures()}, [getProcedures])  

  let slots = [], t = [];
  const busy = [{'from':'11:15', 'total':60}, {'from':'16:30', 'total':90}] // 1- time from; 2- time how much
  busy.forEach((item)=>{
    item.fromMin = Number(item.from.slice(0, 2))*60 + Number(item.from.slice(3));
    for(let i=item.fromMin; i<=(item.fromMin + item.total); i+=15) t.push(i);
    // console.log(t);
  })
  // slots = [{'time':'10:00'}, {'time':'11:00'}, {'time':'12:00'}, {'time':'13:00'}, {'time':'14:00'}, {'time':'15:00'}]
  // working hours 8:00 - 20:00 (time interval 15 minutes)
  for(let i=480; i<1200; i+=15){
    if(t.includes(i)) continue;
    let h = Math.trunc(i/60);
    let m = '00';
    if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
    // console.log('time:', (h + ':' + m));
    slots[i] = {'time':(h + ':' + m)};
  }

  // send data
  const handleRecord = async (event) => {
    event.preventDefault()
    // const data = new FormData(event.currentTarget)
    const data = {
      'procedure_id'  : 1, 
      'user_id'       : 2, 
      'date'          : date, 
      'time'          : time,
    }
    // console.log('data', data);
    // if(data.get('firstName') && data.get('lastName') && data.get('email') && data.get('password')){
    // if(data){
    //   try {
    //     const res = await request('http://localhost:3300/api/timetable', 'POST', {
    //       procedure_id: data.procedure_id,
    //       user_id:      data.user_id,
    //       date:         data.date,
    //       time:         data.time,
    //     })
    //     // auth.login(data.token, data.userId)
    //     console.log('res:', res)
    //     navigate('/dashboard/timetable')
    //   } catch (e) {console.log('error:', e)} 
    //   // eslint-disable-next-line
    // } else alert('You need to fill fields.')
  }

  const handleDateChange = (dateValue) => {
    setDate(dateValue)
  }
  const handleTimeChange = (timeValue) => {
    setTime(timeValue)
  }

  const handleChangeDoctor = (event) => {
    event.preventDefault();
    setDoctor(event.target.value)
  }

  const handleChangeProcedure = (event) => {
    event.preventDefault();
    setProcedure(event.target.value)
  }

  function doctorName() {
    if(doctorList && doctor !==''){
      for(let i=0; i<doctorList.length; i++)
        if(doctorList[i].id === doctor) return doctorList[i].firstname + ' ' + doctorList[i].lastname
    }
    return 'Any'
  }

  function procedureTitle() {
    if(procedureList && procedure !==''){
      for(let i=0; i<procedureList.length; i++)
        if(procedureList[i].id === procedure) return procedureList[i].procedure
    }
    return 'Choose please'
  }

  function takeDate() {
    // console.log('date:', date);
    if(date && date !== '') return date.getDate() + '/' + date.getMonth() + '/' + date.getFullYear()
    return '__/__/____'
  }

  return(
    <Page title="Booking">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Time Table
          </Typography>
          {/* <Button variant="contained" component={RouterLink} onClick={handleRecord} startIcon={<Iconify icon="eva:plus-fill" />} >
            Book
          </Button> */}
        </Stack>
        {/* <Grid container spacing={2} mb={5}>
          <Grid item xs={12} sm={4}>
            <FormControl>
              <InputLabel id="doctor-select">Doctor</InputLabel>
              <Select
                labelId="doctor-select"
                id="doctor-select"
                sx={{ minWidth: 200 }}
                value={doctor}
                label="Doctor"
                onChange={handleChangeDoctor} 
              >
                {doctorList.map((item, key)=>{
                  return(
                    <MenuItem key={item.id} value={item.id}>{item.firstname}&nbsp;{item.lastname}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <FormControl>
              <InputLabel id="procedure-select">Procedure</InputLabel>
              <Select
                labelId="procedure-select"
                id="procedure-select"
                sx={{ minWidth: 200 }}
                value={procedure}
                label="Procedure"
                onChange={handleChangeProcedure} 
              >
                {procedureList.map((item, key)=>{
                  return(
                    <MenuItem key={item.id} value={item.id}>{item.procedure}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box className='tt_title'> 
              Procedure: <strong>{procedureTitle()}</strong> <br /> 
              Doctor: <strong>{doctorName()}</strong> <br /> 
              Date: <strong>{takeDate()}</strong>&nbsp;&nbsp;&nbsp;&nbsp;Time: <strong>{time}</strong>
            </Box>            
          </Grid>
        </Grid> */}

        <Card>
          <Scrollbar style={{textAlign:"center"}}>
            <div style={{height:"30px"}}>&nbsp;</div>
            <div className='inlineCal'>
              <Calendar onDateChange={handleDateChange} />
            </div>
            <div className='inlineCal'>
              <Time onTimeChange={handleTimeChange} slots={slots}/>
            </div>
          </Scrollbar>
        </Card>
      </Container>
    </Page>
  )
}