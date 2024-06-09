import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react'
import { sentenceCase } from 'change-case';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";

// material 
import {
  Card,
  Box,
  Grid,
  Stack,
  Button,
  Modal,
  Container,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'

// components
import Iconify from '../../components/Iconify';
import { useHttp } from '../../hooks/http.hook'
import { AuthContext } from '../../context/AuthContext'
import {API_URL} from '../../config'

// scheduler
import format from 'date-fns/format'
import getDay from 'date-fns/getDay'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css'

// const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);
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


export default function Reception(){
  const {request} = useHttp()
  const {token, userId, userTypeId}   = useContext(AuthContext)

  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const [doctorId, setDoctorId] = useState(userTypeId === 2 ? userId : '')
  const [doctorList, setDoctorList] = useState([]) 
  // useEffect(() => {console.log('New DoctorId:', doctorId)}, [doctorId])

  const getDoctors = useCallback(async () => {
    try {
      const doctors = await request(`${API_URL}`+'api/doctors', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      console.log('doctors:', doctors);
      setDoctorList(doctors)
      setDoctorId(doctors[0].id)
    } catch (e) { console.log('error:', e) }
  }, [request])
  useEffect(() => {
    if(userTypeId === 1) getDoctors()
  }, [getDoctors]); 

  const handleChangeDoctor = (e) => {
    console.log('setDoctorId:', e);
    // event.preventDefault();
    setDoctorId(e.value);
  }


  const [receptionList, setReceptionList] = useState([])
  const [currentReception, setCurrentReception] = useState({})
  const [repeat, setRepeat] = useState({
    day     : false,
    week    : false,
    twoWeek : false,
    month   : false,
  });

  const [open, setOpen] = useState(false)
  const [pickReception, setPickReception] = useState('')

  const getReceptions = useCallback(async () => {
    console.log('try to take receptions for doctor ID:', doctorId);
    if(!doctorId || doctorId === '') return
    try {
      let receptList = []
      const receptions = await request(`${API_URL}api/reception_bydoctor/${doctorId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      console.log('receptions:', receptions)
      let id = 0
      // const timezoneOffset = new Date().getTimezoneOffset() // offset in minutes
      receptions.map((r) => {
        for(const key in r.time){
          const d = new Date(r.date)// new Date((new Date(r.date).getTime()) + 24 * 60 * 60 * 1000) 
          receptList.push(
            {
              'id'    : id,
              'start' : new Date((d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + Math.floor(r.time[key].start / 60) + ':' + r.time[key].start % 60),
              'end'   : new Date((d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + Math.floor(r.time[key].end / 60)   + ':' + r.time[key].end % 60),
            }
          )
          id++
        }
      });
      console.log('receptList:', receptList)
      setReceptionList(receptList);
    } catch (e) { console.log('error:', e)}
  }, [token, request, doctorId])
  useEffect(() => {getReceptions()}, [getReceptions, doctorId]);

  // const createReceptions = async () => {
  //   console.log('save:', receptionList,  '\nfor: ',  userId)
  //   // if(!userId || !receptionList) return
  //   try {
  //     const reception = await request(`${API_URL}api/reception`, 'POST', {
  //       // doctor_id     : userId,
  //       // receptionList : receptionList,
  //     })
  //     // console.log('saved reception list:', reception);
  //   } catch (e) {console.log('error:', e)}    
  // }
  // useEffect(() => {saveReceptions()}, [receptionList])

  const saveReceptions = async () => {
    console.log('save:', receptionList,  '\nfor: ',  doctorId)
    if(!doctorId || !receptionList) return

    const recDates = receptionList.map((rec) => {
      // console.log('rec:', new Date(rec.start).toDateString())
      return new Date(rec.start).toDateString()
    })
    const uniqueRecDates = [...new Set(recDates)]
    // console.log('recDates:', recDates)
    // console.log('uniqueRecDates:', uniqueRecDates)

    const newRecList = {}
    for(let d in uniqueRecDates){
      newRecList[uniqueRecDates[d]] = {}

      receptionList.map((rec) => {
        if(new Date(rec.start).toDateString() === uniqueRecDates[d]){
          const id = Object.keys(newRecList[uniqueRecDates[d]]).length,
                dateStart = new Date(rec.start),
                dateEnd   = new Date(rec.end),
                start = dateStart.getHours() * 60 + dateStart.getMinutes(),
                end   = dateEnd.getHours()   * 60 + dateEnd.getMinutes()

          newRecList[uniqueRecDates[d]][id] = {
            'start': start,
            'end': end
          }

        }
      })
    }
    // console.log('newRecList:', newRecList)

    try {
      const reception = await request(`${API_URL}api/savereception`, 'POST', {
        doctor_id     : doctorId,
        receptionList : newRecList,
      })
      console.log('saved reception list:', reception);
    } catch (e) {console.log('error:', e)}    
  }
  // useEffect(() => {saveReceptions()}, [receptionList])

  // const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setCurrentReception({})
    setOpen(false)
  };

  const getLastDayOfYear = () => {
    const date = new Date();
    date.setMonth(11); // December
    date.setDate(31);
    return date;
  }

  const handleSubmit = async () => {
    let whenRepeat;
    for(let r in repeat) if(repeat[r]) whenRepeat = r;
    // console.log('whenRepeat:', whenRepeat);

    const lastDayOfYear = getLastDayOfYear();
    // console.log('lastDayOfYear:', lastDayOfYear)

    let recList = [...receptionList];
    // console.log('recList:', recList)

    let id = Math.max(...recList.map(r => r.id)) + 1
    console.log('ID:', id)

    const getNextDay = (d) => {
      switch(whenRepeat){
        case 'day':
          return d.getDate() + 1
          break
        case 'week':
          return d.getDate() + 7
          break
        case 'twoWeek':
          return d.getDate() + 14
          break
        case 'month':
          return d.getMonth() + 1
        default: console.log('looks like error')
      }
    }

    for(let d = new Date(currentReception.start); d <= lastDayOfYear; d.setDate(getNextDay(d))){
      console.log('D:', d)
      let rStart = new Date(d);
      // get End time from the current reception
      const hours         = currentReception.end.getHours(),
            minutes       = currentReception.end.getMinutes(),
            seconds       = currentReception.end.getSeconds(),
            milliseconds  = currentReception.end.getMilliseconds();
      // get date from setting day
      const date  = d.getDate(),
            month = d.getMonth(),
            year  = d.getFullYear();
      // new End - new day, but currentRecption time
      let rEnd = new Date(year, month, date, hours, minutes, seconds, milliseconds);
      console.log('rStart:', rStart, '\n>>> rEnd:', rEnd)

      const event = {
        id:     id,
        start:  rStart,
        end:    rEnd
      }

      const recToday = recList.filter(r => r.start.toDateString() === event.start.toDateString()).sort((a, b) => {
        if (a.start < b.start) return -1;
        if (a.start > b.start) return 1;
        return 0;
      });
  
      if(!recToday?.length) recToday.push({
        id:     event.id,
        start:  new Date(event.start),
        end:    new Date(event.end)
      }); 
      else{
        for(let k = 0; k < recToday.length; k++) {
          const r = recToday[k]
          if(event.start.toDateString() === r.start.toDateString()){
            if(event.start <= r.start && event.end <= r.end && event.end >= r.start) {
              r.start = event.start;
              continue;
            }
            if(event.start >= r.start && event.start <= r.end && event.end >= r.end) {
              r.end = event.end;
              continue
            }
            if(event.start <= r.start && event.end >= r.end) {
              r.start = event.start;
              r.end = event.end;
              continue
            }
            if(event.start === r.start && event.end === r.end) {
              continue
            }
            if(event.end < r.start || event.start > r.end){
              recToday.push({
                id:     event.id,
                start:  new Date(event.start),
                end:    new Date(event.end)
              })
              continue
            }
          }
        }  
      }
      const recAnotherDay = recList.filter((r) => r.start.toDateString() !== event.start.toDateString());
      recList = [...new Set([...recToday, ...recAnotherDay])]
      id++
    }

    setReceptionList(recList)
    // saveReceptions()
    handleClose()
  }

  const onEventDrop = useCallback((data) => {
    console.log('event drop', data);
  })

  const onEventResize = (data) => {
    console.log('event resize:', data);

    const rList = [...receptionList];

    const booking = rList.find(r => r.id === data.event.id)
    if(booking){
      booking.start = data.start
      booking.end   = data.end
    }
    
    const recToday = rList.filter(r => r.start.toDateString() === data.start.toDateString()).sort((a, b) => {
      if (a.start < b.start) return -1;
      if (a.start > b.start) return 1;
      return 0;
    });

    let i = 1
    while(i < recToday.length){
      if(recToday[i].start <= recToday[i-1].end){
        recToday[i-1].end = recToday[i].end
        recToday.splice(i, 1);
        i = 1
      } else i++
    }
    const recAnotherDay = rList.filter((r) => r.start.toDateString() !== data.start.toDateString());

    setReceptionList([...new Set([...recToday, ...recAnotherDay])])
  }
  // useEffect(()=>{console.log('the changes in receptionList >>> ', receptionList)}, [receptionList])

  const handleSelectReception = (data) => {
    console.log('handleSelectReception:', data);
    const startMinutes = data.start.getMinutes() < 10 ? '0' + data.start.getMinutes() : data.start.getMinutes()
    const endMinutes   = data.end.getMinutes()   < 10 ? '0' + data.end.getMinutes()   : data.end.getMinutes()
    const recString = dayOfWeek[data.start.getDay()] 
                    + ', from ' + data.start.getHours() + ':' + startMinutes + ' till '  + data.end.getHours()   + ':' + endMinutes

    setPickReception(recString)
    setCurrentReception(data)

    // saveReceptions()
    setOpen(true);
  }
  useEffect(() => {console.log('currentReception:', currentReception)}, [currentReception])

  const handleSelectSlot = useCallback(
    (event) => {
      // console.log('handleSelectSlot', event, '\n', typeof(event.start), event.start);
      // console.log(receptionList);

      const recList = [...receptionList],
            id = 1000 + recList.length*1,
            d = new Date(event.start),
            record = {
              'id'    : id,
              'start' : event.start,
              'end'   : event.end,
            }
      // console.log('new record:', record)
      setCurrentReception(record)
      recList.push(record)
      // console.log('receptList:', recList)
      setReceptionList(recList);

      // createReceptions();
      
      // setOpen(true);
    }
  )

  const handleDelete = () => {
    const newRecList = receptionList.filter((r) => r.id !== currentReception.id)
    setReceptionList(newRecList)
    saveReceptions()
    handleClose()
  }

  // Calendar settings
  const view = "week"
  const step = 15
  const timeslots = 4

  return(
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4" gutterBottom>
          Reception Hours
        </Typography>
        <Button variant="contained" onClick={() => {saveReceptions()}} startIcon={<Iconify icon="eva:save-outline" />}>
          Save
        </Button>
      </Stack>

      { userTypeId === 1 &&
        <Grid container>
          <Grid item xs={12} sm={12}>
            <FormControl sx={{ width: "90%" }}>
              <InputLabel id="doctor-select">Doctor</InputLabel>
              <Select
                labelId="doctor-select"
                id="doctor-select"
                name="doctor_id"
                value={doctorId}
                label="Doctor"
                onChange={(event) => {handleChangeDoctor(event.target)}} 
                className='cons-input'
              >
                {doctorList.map((item)=>{
                  return(
                    <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}</MenuItem>
                  )
                })}
              </Select>
            </FormControl>
            {/* {userTypeId === 1 && <Button onClick={()=>{setDoctorId(0)}}>Show All</Button>} */}
          </Grid>
        </Grid>
      }


      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters style={{ maxHeight:"85vh", maxWidth:"480px" }}>
          <div className="login-modal">
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5">
                Reception Hours
              </Typography>
              <Box sx={{ mt: 3, width: 1 }} style={{ textAlign:'center'}}>
                {currentReception.id && 
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={12}>
                      <Box style={{ maxWidth:"160px", margin:"0 auto" }}>
                        <h3>{pickReception}</h3>
                      </Box>
                    </Grid>

                    <Button
                      // fullWidth
                      variant="outlined"
                      sx={{ mt: 3, mb: 2 }}
                      style = {{ margin:"0 auto"}}
                      onClick={() => {handleDelete()}}
                    >
                      Delete
                    </Button>
                  
                    <Box sx={{ width: '100%', fontWeight:'600', padding:'10px 0 0', borderTop: 1, borderColor: 'divider', mt: 2, mb: 1, marginLeft: '15px' }}>Repeat these Reception Hours</Box>

                    <Grid>
                      <FormControlLabel
                        key={'checkEveryDay'}
                        control={
                          <Checkbox 
                            name={'setEveryDay'} 
                            checked={repeat.day} 
                            color="primary" 
                            onChange={() => {setRepeat({...repeat, 'day': !repeat.day, 'week': false, 'twoWeek': false, 'month': false})}} 
                          />
                        }
                        label='Every day'
                        style={{width:'50%', paddingLeft:"30px"}}
                      />
                      <FormControlLabel
                        key={'checkEveryWeek'}
                        control={
                          <Checkbox 
                            name={'setEveryWeek'} 
                            checked={repeat.week} 
                            color="primary" 
                            onChange={() => {setRepeat({...repeat, 'day': false, 'week': !repeat.week, 'twoWeek': false, 'month': false})}} 
                          />
                        }
                        label='Every week'
                        style={{width:'47%', paddingLeft:"30px"}}
                      />
                      <FormControlLabel
                        key={'checkEveryTwoWeek'}
                        control={
                          <Checkbox 
                            name={'setEveryTwoWeek'} 
                            checked={repeat.twoWeek} 
                            color="primary" 
                            onChange={() => {setRepeat({...repeat, 'day': false, 'week':false, 'twoWeek': !repeat.twoWeek, 'month': false})}} 
                          />
                        }
                        label='Every two week'
                        style={{width:'50%', paddingLeft:"30px"}}
                      />
                      <FormControlLabel
                        key={'checkEveryMonth'}
                        control={
                          <Checkbox 
                            name={'setEveryMonth'} 
                            checked={repeat.month} 
                            color="primary" 
                            onChange={() => {setRepeat({...repeat,  'day': false, 'week':false, 'twoWeek':false, 'month': !repeat.month})}} 
                          />
                        }
                        label='Every Month'
                        style={{width:'47%', paddingLeft:"30px"}}
                      />
                    </Grid>
                  </Grid>
                }
                <Button
                  type="button"
                  // fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => {handleSubmit()}}
                >
                  {currentReception.id ? 'Repeat' : 'Create'}
                </Button>
                {/* <Button
                  type="button"
                  // fullWidth
                  variant="outlined"
                  size="small"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => {setOpen(false)}}
                >
                  Close
                </Button> */}
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>


      {/* ========= SCEDULER ========= */}
      <Card>
        <DnDCalendar 
          localizer={localizer} 
          events={receptionList} 
          startAccessor="start" 
          endAccessor="end" 
          defaultDate={new Date()}
          defaultView={view}
          step={step}
          timeslots={timeslots}
          min={new Date(2024, 1, 1, 8, 0, 0)}  // Начало расписания в 8 утра
          max={new Date(2024, 1, 1, 20, 0, 0)} // Конец расписания в 20 вечера
          onSelectEvent={handleSelectReception}
          resizable
          selectable
          onSelectSlot={handleSelectSlot}
          onEventDrop={onEventDrop}
          onEventResize={onEventResize}
          // scrollToTime={scrollToTime}
          style={{ height: "70vh", margin: "20px" }} 
        />
      </Card>
    </Container>
  )
}