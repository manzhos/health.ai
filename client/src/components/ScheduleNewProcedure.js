import React, { useState, useEffect, useCallback, useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';
// mui
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
  Card
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
  const {token, userId, userTypeId}   = useContext(AuthContext)
  
  // console.log('currDate:', currDate)
  const [time, setTime] = useState('__:__')
  const [doctorList, setDoctorList] = useState([])
  const [doctorSelected, setDoctorSelected] = useState([])
  const [procedureTypeId, setProcedureTypeId] = useState(4)
  const [procedureId, setProcedureId] = useState(0)
  const [doctor, setDoctor] = useState(userTypeId ? userId : '')
  const [procedure, setProcedure] = useState('')
  const [recordList, setRecordList] = useState([])
  const [slots, setSlots] = useState([]);

  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId)
  }

  const handleProcedureChange = (newProcedureId) => {
    setProcedureId(newProcedureId)
  }

  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/doctors', 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setDoctorList(res)
      setDoctorSelected(res)
    } catch (e) { console.log('error:', e) }
  }, [request])
  useEffect(() => {getDoctors()}, [getDoctors]); 
  
  // get the data about doctors procedure
  const getRecordsByDoctor = async () => {
    // console.log('getRecordsByDoctor:', doctor);
    try {
      const res = await request(`${API_URL}api/tt_bydoctor/${doctor}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('recordList:', res);
      setRecordList(res);
      // busy.length=0;
    } catch (e) { console.log('error:', e) }
  }
  useEffect(() => {getRecordsByDoctor()}, [currDate, doctor])   
  
  const filterRecordsByDate = () => {
    let freeSlot = [], busyTimeInMinutes = [],  busy = [];
    // working hours
    const timeStartDay = 8, // hour of the starting
          timeEndDay   = 21, // hour of the ending
          timeInterval = 15; // time interval - 15 minutes

    recordList.map(item => {
      const rd = new Date(item.date);
      if(rd.getFullYear() === currDate.getFullYear() && rd.getMonth() === currDate.getMonth() && rd.getDate() === currDate.getDate()) {
        busy.push({
          'from'  : item.time,
          'total' : item.duration
        })
      }
    })
    // console.log('final busy:', busy);
    busy.forEach((item)=>{
      item.fromMin = Number(item.from.slice(0, 2))*60 + Number(item.from.slice(3));
      for(let i=item.fromMin; i<(item.fromMin + item.total); i+=timeInterval) busyTimeInMinutes.push(i);
      // console.log('busy time:', t);
    })
    // console.log('busyTimeInMinutes:', busyTimeInMinutes);
    freeSlot.length=0;
    for(let i = timeStartDay*60; i < timeEndDay*60; i+=timeInterval){
      if(busyTimeInMinutes.includes(i)) continue;
      let h = Math.trunc(i/60);
      let m = '00';
      if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
      // console.log('time:', (h + ':' + m));
      freeSlot[i] = {'time':(h + ':' + m)};
      // console.log(`s[${i}]=`, s[i]);
    }
    setSlots(freeSlot);
    // console.log('slots:', slots, 'for doctor:', doctor);
  }
  useEffect(()=>{filterRecordsByDate()}, [recordList]);

  // send data
  const handleRecord = async () => {
    try {
      const res = await request(`${API_URL}`+'api/timetable', 'POST', {
        procedure_id  : procedureId,
        user_id       : userId,
        doctor_id     : doctor,
        date          : new Date(currDate.setMinutes(currDate.getMinutes() - currDate.getTimezoneOffset())),
        time          : time,
      })
      // console.log('res:', res)
      onClose();
      window.location.reload();
    } catch (e) {console.log('error:', e)} 
  }

  const handleDateChange = (dateValue) => {
    // console.log('handleDateChange dateValue', dateValue);
    currDate = Object.assign(dateValue);
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
    console.log('doctorSelected', event.target.value)
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
    <Modal
      open={openNewProcedure}
      onClose={onClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Container component="main" maxWidth="md" disableGutters>
        <div className="modal-tt">
          <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Grid container>
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

                    {/* <Grid item xs={12} sm={12} spasing={2} direction="row" justifyContent="center" alignItems="center">
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
                    </Grid> */}

                    <Grid item xs={12} sm={6}>
                      <ProcedureType onChangeProcedureType={handleProcedureTypeChange} />
                      {/* procedureType now: {procedureTypeId} */}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ProcedureList procedureTypeId={procedureTypeId} onChangeProcedure={handleProcedureChange} />
                      {/* procedure now: {procedureId} */}
                    </Grid>
                    
                  </Grid>
                <Grid item xs={1}></Grid>
              </Grid>

              {/* --- calendar --- */}          
              <Card style={{padding:"30px"}} sx={{ mt:3, mb: 3, width:"100%"}}>
                <Grid container>
                  <Grid item xs={12} sm={12}>
                    <Box style={{ maxWidth:"160px", margin:"0 auto" }}>
                      <CalendarOutside onDateChange={handleDateChange} dValue={currDate}/> 
                    </Box>
                  </Grid>
                </Grid>
                <Grid sx={{ mt:3 }}>
                  <Time onTimeChange={handleTimeChange} slots={slots} />
                </Grid>
              </Card>

              <Button fullWidth variant='contained' sx={{mb:3}} onClick={handleRecord}>
                Save
              </Button>
            </Grid>
          </Box>
        </div>
      </Container>
    </Modal>
  )
}