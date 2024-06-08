import React, { useState, useEffect, useCallback, useContext } from "react";
import dayjs, { Dayjs } from 'dayjs';
import validator from 'validator';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { 
  Modal,
  Container,
  Grid,
  Box,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  Typography,
  TextField,
} from '@mui/material'
import Iconify from "./Iconify";

import ProcedureType from "./ProcedureType";
import ProcedureList from "./ProcedureList";
import CalendarOutside from "./CalendarOutside";
import Time from "./Time";

import { AuthContext } from "../context/AuthContext";

import { URL, API_URL } from '../config'
import { useHttp } from '../hooks/http.hook'

export default function ScheduleNewProcedure({openNewProcedure, currDate, onClose}){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  
  const procedureTypeIdDefault = searchParams.get("procedureTypeIdDefault") || 4;
  const procedureIdDefault = searchParams.get("procedureId") || "2";
  
  const [currentDate, setCurrentDate] = useState(dayjs(new Date(currDate)))
  const [time, setTime] = useState('__:__');
  const [doctorList, setDoctorList] = useState([]);
  const [doctorSelected, setDoctorSelected] = useState([]);
  const [procedureTypeId, setProcedureTypeId] = useState(procedureTypeIdDefault);
  const [procedureId, setProcedureId] = useState(procedureIdDefault);
  const [doctor, setDoctor] = useState(30)
  const [procedure, setProcedure] = useState('')
  const [recordList, setRecordList] = useState([])
  const [slots, setSlots] = useState([]);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [user, setUser] = useState({});
  const [receptionList, setReceptionList] = useState([])
  const [agreement, setAgreement] = useState(false)
  const [errors, setErrors] = useState({})


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

  // get the data about doctors procedure
  const getRecordsByDoctor = async () => {
    // console.log('getRecordsByDoctor:', doctor);
    if(!doctor) return;
    try {
      const res = await request(`${API_URL}api/tt_bydoctor/${doctor}`, 'GET', null, {})
      // console.log('tt_bydoctor:', res);
      setRecordList(res);
      // busy.length = 0;
    } catch(error) { console.log('error:', error) }
  }
  useEffect(() => {getRecordsByDoctor()}, [doctor])   

  const getReceptions = async () => {
    // console.log('try to take receptions for', doctor);
    try {
      const reception = await request(`${API_URL}api/reception_bydoctor/${doctor}`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      // console.log('reception:', reception);
      setReceptionList(reception);
    } catch (e) { console.log('error:', e)}
  }
  useEffect(()=>{getReceptions()}, [doctor])

  const getSlots = () => {
    // working hours
    const timeStartDay = 8, // hour of the starting
          timeEndDay   = 21, // hour of the ending
          timeInterval = 15; // time interval - 15 minutes

    const baseSlots = {};

    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const difference = now.getTime() - midnight.getTime();
    const timeNowInMinutes = Math.floor(difference / (1000 * 60));
    // console.log('timeNowInMinutes:', timeNowInMinutes)

    // for(let timeInMinute = timeStartDay*60; timeInMinute < timeEndDay*60; timeInMinute += timeInterval){
    //   // console.log('timeInMin:', timeInMinute)
    //   const hour = parseInt(timeInMinute / 60)
    //   const minute = timeInMinute % 60
    //   baseSlots[timeInMinute] = hour + ':' + (minute < 10 ? '0' + minute : minute)
    // }
    // console.log('baseSlots:', baseSlots);

    const receptions = receptionList.filter(recept => getOnlyDate(recept.date) === getOnlyDate(currentDate))
    const todayRecept = receptions[0]?.time
    // console.log('Receptions', todayRecept)

    for(const key in todayRecept){
      for(let timeInMinute = todayRecept[key].start; timeInMinute < todayRecept[key].end; timeInMinute += timeInterval){
        if(todayRecept[key].start <= timeNowInMinutes && getOnlyDate(new Date()) === getOnlyDate(receptions[0]?.date)) continue
        const hour = parseInt(timeInMinute / 60)
        const minute = timeInMinute % 60
        baseSlots[timeInMinute] = hour + ':' + (minute < 10 ? '0' + minute : minute)
      }
    }
    // console.log('Slots:', baseSlots)

    const todayRecords = recordList.filter(rec => getOnlyDate(rec.date) === getOnlyDate(currentDate))
    // console.log('todayRecords', todayRecords)

    todayRecords.map((record) => {
      const timeArr = record.time.split(':')
      const startTimeInMinute = timeArr[0]*60 + timeArr[1]*1,
            endTimeInMinute = startTimeInMinute + record.duration*1
      for(let timeInMinute = startTimeInMinute; timeInMinute < endTimeInMinute; timeInMinute += timeInterval){
        const hour = parseInt(timeInMinute / 60)
        const minute = timeInMinute % 60
        delete baseSlots[timeInMinute]
      }
    })
    // console.log('Slots AFTER:', baseSlots)

    setSlots(baseSlots);
  }
  useEffect(() => {getSlots()}, [currentDate, doctor, receptionList, recordList]);

  // send data
  // create New Client by Lead
  const newClient = async() => {
    try {
      const newUser = await request(`${API_URL}`+'api/user', 'POST', {
        firstname : firstName,
        lastname  : lastName,
        email     : email,
        phone     : phone,
        password  : '00000000',
        promo     : true
      })
      console.log('User', newUser);
      setUser(newUser);
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    } 
  }
  // book the procedure
  const bookProcedure = async() => {
    const vd = new Date(currentDate)
    try {
      const newProcedure = await request(`${API_URL}`+'api/timetable', 'POST', {
        procedure_id  : procedureId,
        user_id       : user.id,
        doctor_id     : doctor,
        date          : vd,
        time          : time.humanView,
      })
      setProcedure(newProcedure);
      // navigate('/thanks')
      alert('the procedure is booked')
    } catch (e) {console.log('error:', e)} 
  }
  useEffect(()=>{
    if(user.id) bookProcedure()
  }, [user])

  const checkUserByEmail = async () => {
    console.log('check user by', email);
    try {
      const exist_user = await request(`${API_URL}api/checkuser_byemail/${email}`, 'GET', null, {})
      if(exist_user && Object.keys(exist_user).length !== 0){
        // console.log('User:', exist_user);
        setUser(exist_user);
        setFirstName(exist_user.firstname);
        setLastName(exist_user.lastname);
        setPhone(exist_user.phone);
      } else newClient();
    } catch (e) {
      console.log('error:', e);
      // alert('Something goes wrong. Check all & repeat, please.');
    }
  }
  
  const checkUserByPhone = async () => {
    if(user || Object.keys(user).length > 0) return
    const checkPhone = phone.replace('+','')
    console.log('check user by', checkPhone);
    try {
      const exist_user = await request(`${API_URL}api/checkuser_byphone/${checkPhone}`, 'GET', null, {})
      if(exist_user && Object.keys(exist_user).length !== 0){
        // console.log('User:', exist_user);
        setUser(exist_user);
        setFirstName(exist_user.firstname);
        setLastName(exist_user.lastname);
        setEmail(exist_user.email);
      } else newClient();
    } catch (e) {
      console.log('error:', e);
      // alert('Something goes wrong. Check all & repeat, please.');
    }
  }

  const validatePhoneNumber = (number) => {
    const isValidPhoneNumber = validator.isMobilePhone(number)
    return (isValidPhoneNumber)
  }

  const handleRecord = async () => {
    setErrors({ ...errors, 'email':0 , 'phone':0})

    if (!email || email === '') {
      setErrors({ ...errors, 'email':'Email required' })
      return
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(email)) {
      setErrors({  ...errors, 'email':'Invalid email address' })
      return
    }

    if (!phone) {
      setErrors({ ...errors, 'phone':'Phone number required' })
      return
    }
    if (!validatePhoneNumber(phone)) {
      setErrors({ ...errors, 'phone':'Phone number is invalid' })
      // console.log('Phone number is invalid')
      return
    }

    if(!user || Object.keys(user).length === 0) await checkUserByEmail();
    if(!user || Object.keys(user).length === 0) await checkUserByPhone();
  }

  const handleDateChange = (dateValue) => {
    if(!dateValue) return
    const now = new Date();
    if(new Date(getOnlyDate(dateValue.$d)) < new Date(getOnlyDate(now))) {
      alert("You can\'t book in the past")
    } else {
      setCurrentDate(dayjs(dateValue.$d))
      setTime('__:__')
    }
  }

  const handleChangeDoctor = (event) => {
    // console.log('setDoctor:', event.target.value);
    event.preventDefault();
    setDoctor(event.target.value);
  }
  // useEffect(() => {console.log('new doctor:', doctor)}, [doctor]);

  const handleClickDoctor = () => {
    const index = doctorList.findIndex((el) => el.id === doctor)
    if(index > -1) {
      let arr = []
      arr.push(doctorList[index])
      setDoctorSelected(arr)
    }

  }
  useEffect(()=>{handleClickDoctor()}, [doctor]) 

  const getOnlyDate = (d) => {
    if(!d) return ' '
    d = new Date(d);
    return d.getFullYear() + '-' + d.getMonth() + '-' + d.getDate() 
  }


  return(
    <>
      <Modal
        open={openNewProcedure}
        onClose={onClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        {/* <Container component="main" maxWidth="md" disableGutters> */}
          <div style={{
            padding: '0 40px',
            position: 'absolute',
            left: '0',
            top: '0',
            margin: '1vw auto',
            width: '90vw',
            minWidth: '300px',
            maxHeight: '95vh',
            left: '50%',
            // top: '50%',
            transform: 'translateX(-50%)',
            // transform: 'translateY(50%)',
            // box-shadow: 0px 15px 38px 0px rgba(0, 0, 0, 0.49);
            overflow: 'auto'
          }}>
            <Card sx={{ mt: 6, padding:'0 0 20px' }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
                <Grid container sx={{ mt: 3 }}>
                  <Grid item xs={12} md={12}>
                    {/* <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 5, mb: 1 }}>&nbsp;</Box> */}
                    <Typography component="h1" variant="h5" sx={{ textAlign:'center' }}>
                      Book the procedure
                    </Typography>
                  </Grid>
                </Grid>
                          
                <Grid container sx={{mt: 4}}>
                  <Grid item xs={12} md={7}>
                    <Grid container>
                      <Grid item xs={1} md={1}>&nbsp;</Grid>
                      <Grid item xs={10} md={10}>
                        {/* procedure */}
                        {/* <Grid item xs={12} md={6}> */}
                          {/* <ProcedureType procedureTypeId={procedureTypeId} onChangeProcedureType={handleProcedureTypeChange} /> */}
                          {/* procedureType now: {procedureTypeId} */}
                        {/* </Grid> */}
                        <Grid item xs={12} md={12} sx={{ mt: 3}}>
                          <ProcedureList procedureTypeId={procedureTypeId} procedureId={procedureId} onChangeProcedure={handleProcedureChange} online={true} />
                        </Grid>

                        {/* doctor */}
                        <Grid item xs={12} md={12} sx={{ mt: 4 }}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="doctor-select">Doctor</InputLabel>
                            <Select
                              labelId="doctor-select"
                              id="doctor-select"
                              name="doctor_id"
                              value={doctor || ""}
                              label="Doctor"
                              onChange={handleChangeDoctor} 
                              className="cons-input"
                            >
                              {doctorList.map((item)=>{
                                return(
                                  <MenuItem key={item.id + '_' + item.id} value={item.id}>{sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>
                      <Grid item xs={1} md={1}>&nbsp;</Grid>
                    </Grid>
                  </Grid>

                  <Grid item xs={12} md={5}>
                    <Grid container>
                      {/* <Grid xs={0} md={0}>&nbsp;</Grid> */}
                      <Grid item xs={12} md={10}>
                        <LocalizationProvider dateAdapter={AdapterDayjs}>
                          <DateCalendar value={currentDate} onChange={ (newDate) => handleDateChange(newDate) } />
                        </LocalizationProvider>
                      </Grid>
                      {/* <Grid xs={0} md={2}>&nbsp;</Grid> */}
                    </Grid>
                  </Grid>
                </Grid>

                {/* SLOTS */}
                <Grid sx={{ textAlign:'center', padding:'0 30px' }}>
                  {slots && Object.keys(slots).length !== 0
                    ?<p style={{ textAlign:'center' }}>Select a time slot from the list below:</p>
                    :<p style={{ textAlign:'center' }}>There is no availability on this day.<br/>Choose another date or check availability with other doctors..</p>
                  }
                  {slots && 
                    Object.entries(slots).map(([key, value]) => {
                      return(
                        <Button key={key} variant={time['timeInMinute'] === key ? "contained" : "outlined"} sx={{ mt:2, ml:1, mr:1 }} onClick={() => {setTime({'timeInMinute':key,'humanView':value})}}>{value}</Button>
                      )
                    })
                  }
                </Grid>
           
                <Grid container sx={{mt: 3}}>
                  <Grid item xs={1}></Grid>
                  <Grid container item xs={10} md={10} spacing={3} style={{ justifyContent: 'center' }}>
                    { time !== '__:__' &&
                      <>
                        <Grid item xs={12} md={12} >
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="firstname"
                            label="Name"
                            name="firstname"
                            autoComplete="firstname"
                            value={firstName}
                            autoFocus
                            onChange={(e)=>{setFirstName(e.target.value)}}
                            className='inp-center'
                          />
                        </Grid>
                        <Grid item xs={12} md={12} >
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="lastname"
                            label="Surname"
                            name="lastname"
                            autoComplete="lastname"
                            value={lastName}
                            onChange={(e)=>{setLastName(e.target.value)}}
                            className='inp-center'
                          />
                        </Grid>
                        <Grid item xs={12} md={12} >
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="email"
                            label="Email Address"
                            name="email"
                            autoComplete="email"
                            defaultValue={user.email}
                            onChange={(e)=>{setEmail(e.target.value)}}
                            style={{ borderRadius: '8px' }}
                            // style={{ background: emailConfirm ? 'lightgreen' : '', borderRadius: '8px' }}
                            className='inp-center'
                          />
                          {errors.email !== 0 && <p style={{ fontSize:'small', color:'red'}}><i>{errors.email}</i></p>}
                        </Grid>

                        <Grid item xs={12} md={12} >
                          <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="phone"
                            label="Phone"
                            name="phone"
                            autoComplete="phone"
                            value={phone}
                            onChange={(e)=>{setPhone(e.target.value)}}
                            style={{ borderRadius: '8px' }}
                            // style={{ background: phoneConfirm ? 'lightgreen' : '', borderRadius: '8px' }}
                            className='inp-center'
                          />
                          {errors.phone !== 0 && <p style={{ fontSize:'small', color:'red'}}><i>{errors.phone}</i></p>}
                        </Grid>
                    </>
                    }

                  </Grid>
                  <Grid item xs={1}></Grid>
                </Grid>              

                { (email || phone) &&
                  <Button
                    type="button"
                    // fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 3, pl: 5, pr: 5}}
                    onClick={handleRecord}
                  >
                    Book
                  </Button>
                }
                
              </Box>
            </Card>
          </div>
      </Modal>
    </>
  )

}