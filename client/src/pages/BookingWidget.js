import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { 
  Box,
  Grid,
  FormControl,
  // Typography,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox
} from '@mui/material'
// import Iconify from '../components/Iconify';

import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'

import CalendarOutside from '../components/CalendarOutside'
import Time from '../components/Time'

import { URL, API_URL, MONTH } from '../config'
import { useHttp } from '../hooks/http.hook'


export default function BookingFree(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();
  const source = searchParams.get("source");
  const procedureTypeIdDefault = searchParams.get("procedureTypeIdDefault") || 4;
  const procedureIdDefault = searchParams.get("procedureId") || 1;
  const windowWidth = searchParams.get("windowWidth") || 640;
  // const windowHeight  = searchParams.get("windowHeight");

  const [currentDate, setCurrentDate] = useState(new Date());
  const [visitDate, setVisitDate] = useState(new Date());
  const [days, setDays] = useState([]);
  const [time, setTime] = useState('__:__');
  const [doctorList, setDoctorList] = useState([]);
  const [doctorSelected, setDoctorSelected] = useState([]);
  const [procedureTypeId, setProcedureTypeId] = useState(procedureTypeIdDefault);
  const [procedureId, setProcedureId] = useState(procedureIdDefault);

  // console.log('params', procedureId, windowWidth, windowHeight);

  const [doctor, setDoctor] = useState(30)

  const [procedure, setProcedure] = useState('')
  const [recordList, setRecordList] = useState([])
  const [slots, setSlots] = useState([]);
  const [email, setEmail] = useState('');
  const [lead, setLead] = useState({});
  const [user, setUser] = useState({});
  const [receptionList, setReceptionList] = useState([])
  const [agreement, setAgreement] = useState(false)
  

  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId)
  }

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

  let s = [], t = [],  busy = [];

  // get the data about doctors procedure
  const getRecordsByDoctor = async () => {
    console.log('getRecordsByDoctor:', doctor);
    if(!doctor) return;
    try {
      const res = await request(`${API_URL}api/tt_bydoctor/${doctor}`, 'GET', null, {})
      console.log('tt_bydoctor:', res);
      setRecordList(res);
      busy.length = 0;
    } catch(error) { console.log('error:', error) }
  }
  useEffect(() => {getRecordsByDoctor()}, [doctor])   

  const filterRecordsByDate = () => {
    // console.log('currentDate:', currentDate);
    recordList.map(item => {
      const rd = new Date(item.currentDate);
      // console.log('item:', item);
      // console.log('r:', rd, currentDate);
      // console.log('r:', rd.getDate(), currentDate.getDate());
      if(rd.getFullYear() === currentDate.getFullYear() && rd.getMonth() === currentDate.getMonth() && rd.getDate() === currentDate.getDate()) {
        busy.push({
          'from'  : item.time,
          'total' : item.duration
        })
      }
    })
    // console.log('final busy:', busy);
    busy.forEach((item)=>{
      item.fromMin = Number(item.from.slice(0, 2))*60 + Number(item.from.slice(3));
      for(let i=item.fromMin; i<=(item.fromMin + item.total); i+=30) t.push(i);
      // console.log('busy time:', t);
    })
    s.length=0;
    // slots = [{'time':'10:00'}, {'time':'11:00'}, {'time':'12:00'}, {'time':'13:00'}, {'time':'14:00'}, {'time':'15:00'}]
    // working hours 10:00 - 17:00 (time interval 30 minutes)
    for(let i = 10*60; i < 14*60; i+=30){
      if(t.includes(i)) continue;
      let h = Math.trunc(i/60);
      let m = '00';
      if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
      // console.log('time:', (h + ':' + m));
      s[i] = {'time':(h + ':' + m)};
      // console.log(`s[${i}]=`, s[i]);
    }
    setSlots(s);
    // console.log('slots:', slots, 'for doctor:', doctor);
  }
  useEffect(()=>{filterRecordsByDate()}, [recordList]);

  const getReceptions = async () => {
    // console.log('try to take receptions');
    try {
      const reception = await request(`${API_URL}api/reception_bydoctor/${doctor}`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setReceptionList(reception);
    } catch (e) { console.log('error:', e)}
  }
  useEffect(()=>{getReceptions()}, [doctor])

  const getSlots = () => {
    const s = {};
    days.map((day) => {
      let tmpSlots = [];
      receptionList.map((el) => {
        let recDate = getOnlyDate(el.date);
        let dayDate = getOnlyDate(day);
        if(recDate === dayDate) {
          for (let t in el.time) {
            if(el.time[t]) {
              tmpSlots.push({'time' : (t + ':00')});
            }
          }
        }
      });
      s[day] = tmpSlots//.length ? tmpSlots : [{}];
    });

    console.log('pre   S:', s);
    
    recordList.map((record) => {
      const recordDate = getOnlyDate(record.date);
      console.log('REC:', record);
      for(let day in s) {
        console.log(day);
        const sDate = getOnlyDate(Number(day));
        console.log(sDate, recordDate)
        if (sDate === recordDate){
          console.log(s[day])
          s[day] = s[day].filter(el => el.time !== record.time)
        }
      }
    })
    console.log('after S:', s);

    setSlots(s);
    // console.log('SP slots:', slots);        
    // return tmpSlots;
  }
  useEffect(() => {getSlots()}, [receptionList]);

  // send data
  // Create the Lead
  const newLead = async() => {
    const bookfree = true,
    message  = `Hello. I am from the ${source}`;
    try {
      const res = await request(`${API_URL}`+'api/form', 'POST', {
        email     : email,
        source    : source,
        bookfree  : bookfree,
        message   : message
      })
      setLead(res);
      // console.log('Lead:', lead);
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    } 
  }
  // create New Client by Lead
  const newClient = async() => {
    try {
      const res = await request(`${API_URL}`+'api/user', 'POST', {
        firstname : '__New Lead__',
        lastname  : lead.id,
        email     : lead.email,
        password  : '00000000',
        promo     : true
      })
      // console.log('User', res);
      setUser(res);
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    } 
  }
  // book the procedure
  const bookProcedure = async() => {
    const vd = new Date(visitDate);
    try {
      const res = await request(`${API_URL}`+'api/timetable', 'POST', {
        procedure_id  : procedureId,
        user_id       : user.id,
        doctor_id     : doctor,
        date          : vd,
        time          : time,
      })
      setProcedure(res);
      // console.log('res:', procedure)
    } catch (e) {console.log('error:', e)} 
  }
  
  const handleRecord = async () => {
    if(email === '') {
      alert('Fill all field, please.');
      return;
    }
    setLead({});
    await newLead();
    setUser({});
    if(lead && Object.keys(lead).length) await newClient();
    if(user && Object.keys(user).length) await bookProcedure();
    if(procedure && Object.keys(procedure).length) window.top.location = `${URL}thanks`
    navigate('/thanks')
  }

  const handleDateChange = (dateValue) => {
    // console.log('dateValue', dateValue);
    setCurrentDate(dateValue);
  }
  
  const handleTimeChange = (timeValue, dateValue) => {
    // console.log('handleTimeChange', timeValue, dateValue);
    setVisitDate(dateValue)
    setTime(timeValue)
  }

  const handleChangeDoctor = (event) => {
    // console.log('setDoctor:', event.target.value);
    event.preventDefault();
    // setDoctor(event.target.value);
    setDoctor(event.target.value);
    // const index = doctorList.findIndex((el) => el.id === event.target.value)
    // if(index > -1) {
    //   let arr = []
    //   arr.push(doctorList[index])
    //   setDoctorSelected(arr)
    // }
  }
  useEffect(() => {console.log('new doctor:', doctor)}, [doctor]);

  const handleClickDoctor = () => {
    const index = doctorList.findIndex((el) => el.id === doctor)
    if(index > -1) {
      let arr = []
      arr.push(doctorList[index])
      setDoctorSelected(arr)
    }

  }
  useEffect(()=>{handleClickDoctor()}, [doctor]) 

  const setPeriod = () => {
    let period = Math.floor(windowWidth/100);
    // console.log(period);
    for(let i=0; i<period; i++){
      days[i] = new Date(currentDate);
      days[i] = days[i].setDate(days[i].getDate() + i);
    }
    setDays(days);
    // console.log('SP days:', days);
  }
  useEffect(()=>{setPeriod()},[currentDate])

  const dmDate = (dateValue) => {
    if(!dateValue) return;
    let d = new Date(dateValue)
    return d.getDate() + ' ' + MONTH[Number(d.getMonth())];
  }
  const getOnlyDate = (d) => {
    if(!d) return ' '
    d = new Date(d);
    return d.getDate() + ' ' + d.getMonth() + ' ' + d.getFullYear()
  }
  
  return(
    <div className='book-widget scroll-none' style={{ width: windowWidth+'px', }}> {/*height: windowHeight+'px'*/}
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
          {/* <Grid container>
            <Grid item xs={12} sm={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 5, mb: 1 }}>&nbsp;</Box>
              <Typography component="h1" variant="h5">
                Book the procedure
              </Typography>
            </Grid>
          </Grid> */}
          
          <Grid container sx={{mt: 5}}>
            <Grid item xs={1}></Grid>
            <Grid container item xs={10} sm={10} spacing={3}>
              {/* <Grid item xs={12} sm={6}> */}
                {/* <ProcedureType procedureTypeId={procedureTypeId} onChangeProcedureType={handleProcedureTypeChange} /> */}
                {/* procedureType now: {procedureTypeId} */}
              {/* </Grid> */}
              <Grid item xs={12} sm={12} >
                <ProcedureList procedureTypeId={procedureTypeId} procedureId={procedureId} onChangeProcedure={handleProcedureChange} />
                {/* procedure now: {procedureId} */}
              </Grid>
              
            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>

          {/* --- calendar --- */}          
          <Grid container item xs={12} sm={12} sx={{mt:5}}>
            {/* <Card style={{padding:"30px"}} sx={{ mt:3, mb: 3}}> */}
              <Grid container>
                <Grid item xs={12} sm={12}>
                  <Box style={{ maxWidth:"160px", margin:"0 auto", backgroundColor:"#FCFBFD", borderRadius:'10px' }}>
                    <CalendarOutside onDateChange={handleDateChange}/> 
                  </Box>
                </Grid>
              </Grid>
              <Grid style={{ margin:"24px auto 0" }}>
                <div style={{
                    display: "flex",
                    flexDirection: "row",
                    // alignItems: "center",
                    // justifyContent: "space-between"
                }}>
                  {days.map((day)=>{
                    return (
                      <div style={{ width:"100px" }}>
                        <b>{dmDate(day)}</b>
                        <Time onTimeChange={ handleTimeChange } slots={slots[day]} day={day} />
                      </div>
                    )
                  })}
                </div>
              </Grid>
            {/* </Card> */}
          </Grid>

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

              { time !== '__:__' &&
                <>
                  <Grid item xs={12} sx={12} >
                    <TextField
                      margin="normal"
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      autoFocus
                      onChange={(e)=>{setEmail(e.target.value)}}
                    />
                  </Grid>
                  <Grid>
                    {/* <Typography variant="caption" style={{ color:"black" }}>
                      By booking you agree to our <a href="https://stunning-you.com/en/about/datenschutz.html" style={{ color:"#AA4037" }}>Privacy Policy</a> and the processing of your personal data
                    </Typography> */}
                    <FormControlLabel
                      control={<Checkbox name="agreement" checked={agreement} onChange={() => {setAgreement(!agreement)}} color="primary" />}
                    />
                    <span style={{ color:"#000", textAlign:"left", fontSize:"12px", lineHeight:"12px", marginLeft:"-16px" }}>
                      By booking you agree to our <a href="https://stunning-you.com/en/about/datenschutz.html" style={{ color:"#AA4037" }}>Privacy Policy</a>
                    </span>
                  </Grid>
              </>
              }

            </Grid>
            <Grid item xs={1}></Grid>
          </Grid>              

          { agreement &&
            // <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, mb: 1 }} style={{ padding:"8px 48px", backgroundColor:"#FCFBFD", color:"#AA4037" }}>{"Login"}</Button>
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
      </div>
    </div>      
  )
}