import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react'
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
  // console.log('UserId:', userId);

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
      const reception = await request(`${API_URL}api/reception_bydoctor/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('receptions:', reception);
      reception.map((r) => {
        const d = new Date(r.date);
        r.start = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        r.end   = new Date(Date.parse(r.start) + 10 * 60000);
      });
      setReceptionList(reception);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getReceptions()}, [getReceptions]);

  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(0);
  // const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false);


  const handleSelectSlot = useCallback(
    (event) => {
      // console.log(typeof(event.start), event.start);
      // console.log(receptionList);
      
      receptionList.map(el => {
        if(String(new Date(el.date)) === String(event.start)) setTime(el.time);
      });

      // timezone magic
      let magicDate = event.start;
      console.log(magicDate)
      console.log(magicDate.getHours())
      console.log(magicDate.getTimezoneOffset() / 60)
      console.log(magicDate.getHours() - magicDate.getTimezoneOffset() / 60)
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

  const handleChangeRecTime = (e) => {
    const { target } = e;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    let { name } = target;
    name = name.replace('checkHour', '');
    setTime( t => ({ ...t, [name]: value }));
    // console.log('Time:', time);
  }

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
                Edit Reception Hours
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3, width: 1 }} style={{ textAlign:'center'}}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <Box style={{ maxWidth:"160px", margin:"0 auto" }}>
                      <h3>{dayOfWeek[date.getDay()]}, {date.getDate()}&nbsp;{month[date.getMonth()]}</h3>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Typography sx={{mb:3, width:1}}>Check the boxes if you ready for visits in:</Typography>
                    <Box sx={{mt:3}}>
                      <Grid container>
                        <Grid item xs={12} sm={6}>
                          {workHour.map((val, key)=>{
                            if(key < workHour.length/2) return(
                              <FormControlLabel
                                key={'checkHourId' + key}
                                control={
                                  <Checkbox 
                                    name={'checkHour' + val} 
                                    checked={time[val]} 
                                    color="primary" 
                                    onChange={handleChangeRecTime} 
                                  />
                                }
                                label={val + ':00 - '+ (val + 1) +':00'}
                                style={{width:'100%', paddingLeft:"30px"}}
                              />
                            )
                          })}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          {workHour.map((val, key)=>{
                            if(key >= workHour.length/2) return(
                              <FormControlLabel
                                key={'checkHourId' + key}
                                control={
                                  <Checkbox 
                                    name={'checkHour' + val} 
                                    checked={time[val]} 
                                    color="primary" 
                                    onChange={handleChangeRecTime} 
                                  />
                                }
                                label={val + ':00 - '+ (val + 1) +':00'}
                                style={{width:'100%', paddingLeft:"30px"}}
                              />
                            )
                          })}
                        </Grid>

                      </Grid>
                    </Box>
                  </Grid>
                  
                  <Box sx={{ width: '100%', fontWeight:'600', padding:'10px 0 0', borderTop: 1, borderColor: 'divider', mt: 2, mb: 1, marginLeft: '15px' }}>Repeat settings</Box>

                  <Grid>
                    <FormControlLabel
                      key={'checkEveryWeek'}
                      control={
                        <Checkbox 
                          name={'setEveryWeek'} 
                          checked={repeat.week} 
                          color="primary" 
                          onChange={() => {setRepeat({...repeat, 'week': !repeat.week, 'twoWeek': false, 'month': false})}} 
                        />
                      }
                      label='Every week'
                      style={{width:'50%', paddingLeft:"30px"}}
                    />
                    <FormControlLabel
                      key={'checkEveryTwoWeek'}
                      control={
                        <Checkbox 
                          name={'setEveryTwoWeek'} 
                          checked={repeat.twoWeek} 
                          color="primary" 
                          onChange={() => {setRepeat({...repeat, 'week':false, 'twoWeek': !repeat.twoWeek, 'month': false})}} 
                        />
                      }
                      label='Every two week'
                      style={{width:'47%', paddingLeft:"30px"}}
                    />
                    <FormControlLabel
                      key={'checkEveryMonth'}
                      control={
                        <Checkbox 
                          name={'setEveryMonth'} 
                          checked={repeat.month} 
                          color="primary" 
                          onChange={() => {setRepeat({...repeat,  'week':false, 'twoWeek':false, 'month': !repeat.month})}} 
                        />
                      }
                      label='Every Month'
                      style={{width:'100%', paddingLeft:"30px"}}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  // fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Save
                </Button>
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>

      {/* ========= SCEDULER ========= */}
      <Card>
        <Calendar 
          localizer={localizer} 
          events={receptionList} 
          startAccessor="start" 
          endAccessor="end" 
          defaultDate={defaultDate}
          // defaultView={Views.WEEK}
          // onSelectEvent={handleSelectReception}
          onSelectSlot={handleSelectSlot}
          selectable
          scrollToTime={scrollToTime}
          style={{ height: "70vh", margin: "20px" }} 
        />
      </Card>
    </Container>
  )
}