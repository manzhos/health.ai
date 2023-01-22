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


export default function BookConsult(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const {token}   = useContext(AuthContext)

  const [date, setDate] = useState('')
  const [time, setTime] = useState('__:__')
  const [doctorList, setDoctorList] = useState([])
  const [doctorSelected, setDoctorSelected] = useState([])
  const [procedureTypeId, setProcedureTypeId] = useState(4)
  const [procedureId, setProcedureId] = useState(0)
  const [doctor, setDoctor] = useState('')
  const [procedure, setProcedure] = useState('')

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
    } catch (e) { console.log('error:', e)}
  }, [request])

  useEffect(() => {getDoctors()}, [getDoctors])   

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

    navigate('/payment')


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
    if(data){
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
                Book the consultation
              </Typography>
            </Grid>
          </Grid>
          
          {/* --- calendar --- */}          
          <Card style={{padding:"30px"}} sx={{ mt:3, mb: 3}}>
            <Grid container>  
              <Grid item xs={12} sm={12} sx={{ mb:3 }}>
                <p>
                  The consultation regarding the<br />
                  <strong>BTX-A treatment</strong>.
                </p>
                <p>Select date and time please:</p>
              </Grid>
              <Grid item xs={12} sm={4}>
                <CalendarOutside onDateChange={handleDateChange} /> 
              </Grid>
            </Grid>
            <Grid sx={{ mt:3 }}>
              <Time onTimeChange={handleTimeChange} slots={slots}/>
            </Grid>
          </Card>

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