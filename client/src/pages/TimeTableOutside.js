import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { sentenceCase } from 'change-case'
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
  TextField,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material'
// components
import Page from '../components/Page'
import Iconify from '../components/Iconify'
import Scrollbar from '../components/Scrollbar'
import CalendarOutside from '../components/CalendarOutside'
import Time from '../components/Time'
import { useHttp } from '../hooks/http.hook'
import { getDate } from 'date-fns'
import {API_URL, URL} from '../config'
import { Book } from '@mui/icons-material'

export default function TimeTableOutside(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const jwt = localStorage.getItem("jwt")
  // console.log('JWT:', jwt)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('__:__')
  const [doctorList, setDoctorList] = useState([])
  const [doctorSelected, setDoctorSelected] = useState([])
  const [procedureList, setProcedureList] = useState([])
  const [doctor, setDoctor] = useState('')
  const [procedure, setProcedure] = useState('')

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
  const pJWT = parseJwt(jwt)
  const userId = pJWT ? pJWT.userId : null
  // console.log('UserId:', userId)

  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/doctors', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setDoctorList(res)
      setDoctorSelected(res)
    } catch (e) { console.log('error:', e)}
  }, [request])
  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/procedures', 'GET', null, {
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
  for(let i=660; i<900; i+=15){
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
      'procedure_id'  : procedure, 
      'user_id'       : userId, 
      'date'          : date, 
      'time'          : time,
    }
    console.log('data', data)
    // window.top.location = `${URL}/login`
    // window.top.location = `${URL}user/timetable`
    if(data && jwt !== ''){
      try {
        const res = await request(`${API_URL}`+'api/timetable', 'POST', {
          procedure_id: data.procedure_id,
          user_id:      data.user_id,
          date:         data.date,
          time:         data.time,
        })
        // auth.login(data.token, data.userId)
        console.log('res:', res)
        // navigate('/dashboard/timetable')
        window.top.location = `${URL}user/timetable`
      } catch (e) {console.log('error:', e)} 
    } else window.top.location = `${URL}/login&booking={}`
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
    const index = doctorList.findIndex((el) => el.id === event.target.value)
    if(index > -1) {
      let arr = []
      arr.push(doctorList[index])
      setDoctorSelected(arr)
    }
    // console.log('doctorSelected', doctorSelected)
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
    // console.log('date:', date)
    if(date && date !== '') return date.getDate() + '/' + (Number(date.getMonth())+1) + '/' + date.getFullYear()
    return '__/__/____'
  }

  return(
    <Page title="Booking">
      <Container component="main" maxWidth="md" disableGutters>
        <div className="login-modal">
          <Box
            sx={{
              // marginTop: 8,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Typography component="h1" variant="h5">
              Book the procedure
            </Typography>
            <Box component="form" noValidate sx={{ mt: 3 }}>
              {/* --- header --- */}
              <Grid container spacing={2} mb={5}>
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
              </Grid>

              {/* --- photo + calendar --- */}

              <Grid container spacing={2}>
                {doctorSelected.map((item, key)=>{
                  return(
                    <Grid key={item.id} container item spasing={2} direction="row">
                      <Grid item xs={6} sm={3}>
                        <img src={API_URL + 'avatars/' + item.avatar} alt={'Doctor ' + sentenceCase(item.firstname) + ' ' + sentenceCase(item.lastname)}/>
                      </Grid>
                      <Grid item xs={1} sm={1}>&nbsp;</Grid>
                      <Grid item xs={12} sm={8}>
                        <Card style={{padding:"30px"}}>
                          <Grid container>
                            <Grid item xs={12} sm={8}>
                              <Typography component="h1" variant="h5">
                                {sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}
                              </Typography>
                            </Grid>
                            <Grid item xs={12} sm={4}>
                              <CalendarOutside onDateChange={handleDateChange} /> 
                            </Grid>
                          </Grid>
                          <Grid>
                            <Time onTimeChange={handleTimeChange} slots={slots}/>
                          </Grid>
                        </Card>
                      </Grid>
                    </Grid>
                  )
                })}
              </Grid>
              <Button
                type="button"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                onClick={handleRecord}
              >
                Book
              </Button>
            </Box>
          </Box>
        </div>
      </Container>      
    </Page>
  )
}