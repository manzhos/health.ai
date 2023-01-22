import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react'
// material 
import {
  Card,
  Box,
  Grid,
  Stack,
  // Avatar,
  Button,
  Modal,
  Container,
  Typography,
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
  const {token}   = useContext(AuthContext)

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
  // console.log('UserId:', userId)

  const [procedureList, setProcedureList] = useState([])
  const [procedure, setProcedure] = useState({})

  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/tt_procedures/${userId}`, 'GET', null, {
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
          'procedure_id'    : el.procedure_id,
          'start'           : start,
          'end'             : end,
        }
      })
      // console.log('p:', procedures)
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
  const handleClose = () => setOpen(false);


  // SCEDULER =====================================
  // const [newProcedure, setNewProcedure] = useState({ title: "", start: "", end: "" })
  // const [allEvents, setAllEvents] = useState(events)

  // function handleAddEvent() {
  //   for (let i=0; i<allEvents.length; i++){
  //     const d1 = new Date (allEvents[i].start);
  //     const d2 = new Date(newEvent.start);
  //     const d3 = new Date(allEvents[i].end);
  //     const d4 = new Date(newEvent.end);
  //     /*
  //     console.log(d1 <= d2);
  //     console.log(d2 <= d3);
  //     console.log(d1 <= d4);
  //     console.log(d4 <= d3);
  //     */
  //     if (( (d1  <= d2) && (d2 <= d3) ) || ( (d1  <= d4) && (d4 <= d3) )) {   
  //       alert("CLASH"); 
  //       break;
  //     }
  //   }
    
  //   setAllEvents([...allEvents, newEvent]);
  // }

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt('New Procedure')
      if (title) {
        setProcedureList((prev) => [...prev, { start, end, title }])
      }
    },
    [setProcedureList]
  )

  const handleSelectProcedure = (event) => {
    // console.log(event)
    setProcedure({
      'id'              : event.id,
      'title'           : event.title, 
      'client_id'       : event.client_id,
      'client_firstname': event.client_firstname,
      'client_lastname' : event.client_lastname,
      'doctor_id'       : event.doctor_id,
      'procedure_id'    : event.procedure_id,
      'start'           : event.start,
      'end'             : event.end,
    })
    // console.log('popup procedure:', procedure)
    setOpen(true)
  }

  // const handleSelectProcedure = useCallback(
  //   (event) => {
  //     console.log(event)
  //     window.alert(event.title)
  //   },
  //   []
  // )

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(),
    }),
    []
  )


  return(
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4" gutterBottom>
          Time Table
        </Typography>
      </Stack>
      
      {/* Event window for Admin*/}
      {/* <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="modal-tt">
            <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Grid container>
                <Grid item xs={12} sm={9}>
                  <Box className='tt_title'> 
                    Procedure:<br /><strong>{procedure.title}</strong> <br /> <br /> 
                    Patient:<br /><strong>{procedure.client_firstname}&nbsp;{procedure.client_lastname}</strong> <br /> <br /> 
                    Start:<br /><strong>{humanDate(procedure.start)}</strong> <br /> 
                    End:<br /><strong>{humanDate(procedure.end)}</strong>
                  </Box>            
                </Grid>
                <Grid item xs={12} sm={3}>
                  <Button fullWidth variant={status === 0 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(1)}}>
                    Check In
                  </Button>
                  <Button fullWidth variant={status === 1 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(2)}}>
                    Log In
                  </Button>
                  <Button fullWidth variant={status === 2 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(3)}}>
                    Log Out
                  </Button>
                  <Button fullWidth variant={status === 3 ? 'contained' : 'outlined'} sx={{mb:3}} onClick={()=>{setStatus(4)}}>
                    Check Out
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </div>
        </Container>
      </Modal> */}

      {/* Event window for Doctor*/}
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