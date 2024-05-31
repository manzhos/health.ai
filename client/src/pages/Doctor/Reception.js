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

  const workHour = [],
        recTime = {};
  for(let i=8; i<21; i++){
    workHour[workHour.length] = i;
    recTime[i] = false;
  }

  const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const month = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const [receptionList, setReceptionList] = useState([])
  const [date, setCurrDate] = useState(new Date());
  const [mDate, setMDate] = useState(new Date());
  const [time, setTime] = useState(recTime);
  const [repeat, setRepeat] = useState({
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
      receptions.map((r) => {
        for(const key in r.time){
          const d = new Date(r.date)
          receptList.push(
            {
              'start' : new Date((d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + Math.floor(r.time[key].start / 60) + ':' + r.time[key].start % 60),
              'end'   : new Date((d.getMonth()+1) + '-' + d.getDate() + '-' + d.getFullYear() + ' ' + Math.floor(r.time[key].end / 60)   + ':' + r.time[key].end % 60),
            }
          )
        }
      });
      // console.log('receptList:', receptList)
      setReceptionList(receptList);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getReceptions()}, [getReceptions]);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  // const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false);


  const handleSelectSlot = useCallback(
    (event) => {
      console.log('handleSelectSlot', event, '\n', typeof(event.start), event.start);
      console.log(receptionList);
      
      receptionList.map(el => {
        if(String(new Date(el.date)) === String(event.start)) setTime(el.time);
      });

      // timezone magic
      let magicDate = event.start;
      // console.log(magicDate)
      // console.log(magicDate.getHours())
      // console.log(magicDate.getTimezoneOffset() / 60)
      // console.log(magicDate.getHours() - magicDate.getTimezoneOffset() / 60)
      magicDate.setHours(magicDate.getHours() - magicDate.getTimezoneOffset() / 60);
      setMDate(magicDate)

      setCurrDate(event.start);
      setOpen(true);
    }
  )

  const handleSubmit = async () => {
    // console.log(userId, date, time);
    // console.log('repeat:', repeat);
    let whenRepeat;
    for(let r in repeat) if(repeat[r]) whenRepeat = r;
    // console.log('whenRepeat:', whenRepeat);
    try {
      const reception = await request(`${API_URL}api/reception`, 'POST', {
        doctor_id : userId,
        date      : mDate,
        time      : time,
        repeat    : whenRepeat
      })
      setReceptionList(reception);
    } catch (e) {console.log('error:', e)}
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
    // console.log('event resize:', data);
    // data.start
    const rList = [...receptionList];
    rList.map((r) => {
      if(r.start.toDateString() === data.start.toDateString() && r.start >= data.start && r.end <= data.end){
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
    console.log('handleSelectReception:', data);
    setOpen(true);
  })

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