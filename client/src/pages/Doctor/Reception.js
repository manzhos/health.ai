import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react'
// import { Calendar, momentLocalizer } from "react-big-calendar"
// import moment from "moment";
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
  Checkbox
} from '@mui/material'

// components
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
  const pJWT = parseJwt(token);
  const userId = pJWT ? pJWT.userId : null;
  console.log('UserId:', userId);

  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  // const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const [receptionList, setReceptionList] = useState([])
  const [currentReception, setCurrentReception] = useState({});
  const [repeat, setRepeat] = useState({
    day     : false,
    week    : false,
    twoWeek : false,
    month   : false,
  });


  const getReceptions = useCallback(async () => {
    // console.log('try to take receptions');
    try {
      let receptList = []
      const receptions = await request(`${API_URL}api/reception_bydoctor/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('receptions:', receptions);
      let id = 0
      receptions.map((r) => {
        for(const key in r.time){
          const d = new Date(r.date)
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
  }, [token, request])
  useEffect(() => {getReceptions()}, [getReceptions]);

  const saveReceptions = async () => {
    console.log('save:', receptionList,  '\nfor: ',  userId)
    if(!userId || !receptionList) return
    try {
      const reception = await request(`${API_URL}api/reception`, 'POST', {
        doctor_id     : userId,
        receptionList : receptionList,
      })
      console.log('saved reception list:', reception);
    } catch (e) {console.log('error:', e)}    
  }
  // useEffect(() => {saveReceptions()}, [receptionList])

  const [open, setOpen] = useState(false);
  const [pickReception, setPickReception] = useState('');

  // const handleOpen = () => setOpen(true)
  const handleClose = () => {
    setCurrentReception({})
    setOpen(false)
  };


  const handleSelectSlot = useCallback(
    (event) => {
      console.log('handleSelectSlot', event, '\n', typeof(event.start), event.start);
      // console.log(receptionList);
      
      // receptionList.map(el => {
      //   if(String(new Date(el.date)) === String(event.start)) setTime(el.time);
      // });

      // // timezone magic
      // let magicDate = event.start;
      // // console.log(magicDate)
      // // console.log(magicDate.getHours())
      // // console.log(magicDate.getTimezoneOffset() / 60)
      // // console.log(magicDate.getHours() - magicDate.getTimezoneOffset() / 60)
      // magicDate.setHours(magicDate.getHours() - magicDate.getTimezoneOffset() / 60);
      // setMDate(magicDate)

      // setCurrDate(event.start);
      setOpen(true);
    }
  )

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

    const recList = [...receptionList];
    // console.log('recList:', recList)

    let id = Math.max(...recList.map(r => r.id)) + 1
    // console.log('ID:', id)

    switch(whenRepeat){
      case 'day':
        // console.log('Repeat every day');
        for(let d = currentReception.start; d <= lastDayOfYear; d.setDate(d.getDate() + 1)){
          // console.log('D:', d)
          const dEnd = new Date(currentReception.end)
          dEnd.setDate(d.getDate())

          recList.push({
            'id'    : id,
            'start' : new Date(d),
            'end'   : dEnd
          })

          id++
        }
        // console.log('receptionList', recList)
        break
      case 'week':
        // console.log('Repeat every week');
        for(let d = currentReception.start; d <= lastDayOfYear; d.setDate(d.getDate() + 7)){
          // console.log('D:', d)
          const dEnd = new Date(currentReception.end)
          dEnd.setDate(d.getDate())

          recList.push({
            'id'    : id,
            'start' : new Date(d),
            'end'   : dEnd
          })

          id++        }
        break
      case 'twoWeek':
        // console.log('Repeat every two week');
        for(let d = currentReception.start; d <= lastDayOfYear; d.setDate(d.getDate() + 14)){
          // console.log('D:', d)
          const dEnd = new Date(currentReception.end)
          dEnd.setDate(d.getDate())

          recList.push({
            'id'    : id,
            'start' : new Date(d),
            'end'   : dEnd
          })

          id++        }
        break
      case 'month':
        // console.log('Repeat every month');
        for(let d = currentReception.start; d <= lastDayOfYear; d.setMonth(d.getMonth() + 1)){
          // console.log('D:', d)
          const dEnd = new Date(currentReception.end)
          dEnd.setDate(d.getDate())

          recList.push({
            'id'    : id,
            'start' : new Date(d),
            'end'   : dEnd
          })

          id++        }
        break
      default: console.log('do nothing')
    }

    setReceptionList(recList)
    saveReceptions()
    handleClose()
  }

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(),
    }),
    []
  )

  const onEventDrop = useCallback((data) => {
    console.log('event drop', data);
  })

  const onEventResize = useCallback((data) => {
    console.log('event resize:', data);

    const rList = [...receptionList];
    rList.map((r) => {
      if(r.start.toDateString() === data.start.toDateString() && r.id === data.event.id){
        r.start = data.start
        r.end = data.end
      }
    })
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
  })
  // useEffect(()=>{console.log('the changes in receptionList >>> ', receptionList)}, [receptionList])

  const handleSelectReception = useCallback((data) => {
    // console.log('handleSelectReception:', data);
    const startMinutes = data.start.getMinutes() < 10 ? '0' + data.start.getMinutes() : data.start.getMinutes()
    const endMinutes   = data.end.getMinutes()   < 10 ? '0' + data.end.getMinutes()   : data.end.getMinutes()
    const recString = dayOfWeek[data.start.getDay()] 
                    + ', from ' + data.start.getHours() + ':' + startMinutes + ' till '  + data.end.getHours()   + ':' + endMinutes

    setPickReception(recString)
    setCurrentReception(data)

    saveReceptions()
    setOpen(true);
  })

  const handleDelete = () => {
    const newRecList = receptionList.filter((r) => r.id !== currentReception.id)
    setReceptionList(newRecList)
    saveReceptions()
    handleClose()
  }

  const view = "week"
  const step = 15
  const timeslots = 4

  return(
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
        <Typography variant="h4" gutterBottom>
          Reception Hours
        </Typography>
      </Stack>


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
                  type="submit"
                  // fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                  onClick={() => {handleSubmit()}}
                >
                  {currentReception.id ? 'Repeat' : 'Create'}
                </Button>
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
          defaultDate={defaultDate}
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