import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react'
import { sentenceCase } from 'change-case';
// material 
import {
  Card,
  FormControl,
  InputLabel,
  MenuItem,
  Grid,
  Stack,
  Select,
  Modal,
  Container,
  Typography,
  Button
} from '@mui/material'
// components
import { useHttp } from '../../hooks/http.hook'
import { AuthContext } from '../../context/AuthContext'
import ProcedureNote from '../../components/ProcedureNote'
import {API_URL, MONTH} from '../../config'
import humanDate from '../../components/HumanDate'
// scheduler
import format from 'date-fns/format'
import getDay from 'date-fns/getDay'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import ScheduleNewProcedure from '../../components/ScheduleNewProcedure'
// import DatePicker from 'react-datepicker'
// import 'react-datepicker/dist/react-datepicker.css'
// ----------------------------------------------------------------------

// scheduler
const locales = {
  "en-US": require("date-fns/locale/en-US"),
}
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})


export default function TimeTable(){
  const {request} = useHttp()
  const {token, userId, userTypeId}   = useContext(AuthContext)

  // console.log('token:', token)
  // console.log('userId:', userId)
  // console.log('userTypeId:', userTypeId)

  const [procedureList, setProcedureList] = useState([])
  const [procedure, setProcedure] = useState({})
  const [date, setDate] = useState(new Date())
  const [doctor, setDoctor] = useState('')
  const [doctorList, setDoctorList] = useState([])  

  const getProcedures = useCallback(async (doctorId=null) => {
    if(!token || !userId) return;
    let filterById = userId;
    console.log('doctor:', doctorId);
    console.log('userId:', userId);
    console.log('userTypeId:', userTypeId);
    if(doctorId && userTypeId === 1) filterById = doctorId;
    console.log('filterById:', filterById);
    try {
      const res = await request(`${API_URL}api/tt_procedures/${filterById}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('procedures:', res)
      let procedures = res.map((el) => {
        const d = new Date(el.date),
              t = el.time.split(':'),
              start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), t[0], t[1]),
              end = new Date(Date.parse(start) + el.duration * 60000)
        return {
          'id'              : el.id,
          'title'           : el.procedure, 
          'client_id'       : el.client_id,
          'client_firstname': el.client_firstname,
          'client_lastname' : el.client_lastname,
          'doctor_id'       : el.doctor_id,
          'doctor_firstname': el.doctor_firstname,
          'doctor_lastname' : el.doctor_lastname,
          'procedure_id'    : el.procedure_id,
          'is_invoiced'     : el.is_invoiced,
          'start'           : start,
          'end'             : end,
        }
      })
      // console.log('procedures:', procedures)
      setProcedureList(procedures)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getProcedures()}, [getProcedures])

  
  // const humanDate = (d) => {
  //   d = new Date(d)
  //   return d.getDate() + ' ' + MONTH[Number(d.getMonth())] + ' ' + d.getFullYear() + ' at ' + d.getHours() + ':' + (d.getMinutes() === 0 ? '00' : d.getMinutes())
  // }
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  // const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setOpen(false);
    getProcedures();
  }


  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      // const title = window.prompt('New Procedure')
      // if (title) {
      //   setProcedureList((prev) => [...prev, { start, end, title }])
      // }
      // console.log('start, end', start, end);
      setDate(start);
      setOpenNewProcedure(true);
    },
    [setProcedureList]
  )
  // const handleSelectSlot = () => {
  //   setOpenNewProcedure(true);
  // }

  const handleSelectProcedure = (event) => {
    // console.log('handleSelectProcedure:', event);
    setProcedure({
      'id'              : event.id,
      'timetable_id'    : event.id,
      'is_invoiced'     : event.is_invoiced,
      'title'           : event.title, 
      'client_id'       : event.client_id,
      'client_firstname': event.client_firstname,
      'client_lastname' : event.client_lastname,
      'doctor_id'       : event.doctor_id,
      'doctor_firstname': event.doctor_firstname,
      'doctor_lastname' : event.doctor_lastname,
      'procedure_id'    : event.procedure_id,
      'start'           : event.start,
      'end'             : event.end,
    })
    // console.log('popup procedure:', procedure)
    setOpen(true)
  }

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(),
    }),
    []
  )

  const [openNewProcedure, setOpenNewProcedure] = useState(false);

  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/doctors', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setDoctorList(res)
    } catch (e) { console.log('error:', e) }
  }, [request])
  useEffect(() => {getDoctors()}, [getDoctors]); 

  const handleChangeDoctor = (event) => {
    console.log('setDoctor:', event.target.value);
    event.preventDefault();
    setDoctor(event.target.value);
  }

  useEffect(()=>{
    console.log('doctor Id:', doctor);
    getProcedures(doctor);
  }, [doctor]);

  return(
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4" gutterBottom>
          Time Table
        </Typography>
      </Stack>
      <ScheduleNewProcedure openNewProcedure={openNewProcedure} currDate={date} onClose={()=>{setOpenNewProcedure(false)}} />

      {/* Event window for Invoicing*/}
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters style={{ maxHeight:"85vh" }}>
          <ProcedureNote procedure={procedure} onSave={handleClose} />
        </Container>
      </Modal>

      <Grid container>
        <Grid item xs={12} sm={12}>
          <FormControl sx={{ width: "90%" }}>
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
          {userTypeId === 1 && <Button onClick={()=>{setDoctor(0)}}>Show All</Button>}
        </Grid>
      </Grid>
      {/* ========= SCEDULER ========= */}
      <Card>
        {/* <div> */}
            {/* <input type="text" placeholder="Add Title" style={{ width: "20%", marginRight: "10px" }} value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} /> */}
            {/* <DatePicker placeholderText="Start Date" style={{ marginRight: "10px" }} selected={newEvent.start} onChange={(start) => setNewEvent({ ...newEvent, start })} />
            <DatePicker placeholderText="End Date" selected={newEvent.end} onChange={(end) => setNewEvent({ ...newEvent, end })} /> */}
            {/* <button stlye={{ marginTop: "10px" }} onClick={handleAddEvent}>Add Event</button> */}
        {/* </div> */}
        <Calendar 
          localizer={localizer} 
          events={procedureList} 
          startAccessor="start" 
          endAccessor="end" 
          defaultDate={defaultDate}
          // defaultView={Views.WEEK}
          onSelectEvent={handleSelectProcedure}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          style={{ height: "70vh", margin: "20px" }} 
        />
      </Card>
    </Container>
  )
}