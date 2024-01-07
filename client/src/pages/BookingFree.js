import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';

import { v4 as uuidv4 } from 'uuid';

import { 
  Box,
  Grid,
  FormControl,
  Typography,
  Container,
  InputLabel,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Checkbox
} from '@mui/material'
// import Iconify from '../components/Iconify';

// import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'

// import CalendarOutside from '../components/CalendarOutside'
import Time from '../components/Time'

import { URL, API_URL, MONTH } from '../config'
import { useHttp } from '../hooks/http.hook'


export default function BookingFree(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams();

  const source = searchParams.get("source");
  const procedureTypeIdDefault = searchParams.get("procedureTypeIdDefault") || 4;
  const procedureIdDefault = searchParams.get("procedureId") || 2;
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
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
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
    // working hours
    const timeStartDay = 8, // hour of the starting
          timeEndDay   = 21, // hour of the ending
          timeInterval = 15; // time interval - 15 minutes
    let freeSlotDay = {}, tmpSlot = [], busy = [], busyTimeInMinutes = [], freeSlot = {};

    days.map((day) => {
      // let tmpSlot = [];
      const dayDate = getOnlyDate(day);
      // console.log('receptionList:', receptionList);
      // console.log('recordList:', recordList);
      tmpSlot.length = 0;
      receptionList.map(item => {
        const receptDate = getOnlyDate(new Date(item.date));
        if(receptDate === dayDate) {
          for (let t in item.time) {
            // console.log(`item.time[${t}]:`, item.time[t]);
            if(item.time[t]) {
              tmpSlot.push(Number(t)*60);
            }
          }
        }
      })
      // console.log(`tmpSlot ${dayDate}:`, tmpSlot);

      busy.length = 0;
      recordList.map(item => {
        const recordDate = getOnlyDate(new Date(item.date));
        if(recordDate === dayDate) {
          busy.push({
            'from'  : item.time,
            'total' : item.duration
          })
        }
      })
      // console.log(`busy ${dayDate}:`, busy);

      busyTimeInMinutes.length = 0;
      busy.forEach((item)=>{
        item.fromMin = Number(item.from.slice(0, 2))*60 + Number(item.from.slice(3));
        for(let i=item.fromMin; i<(item.fromMin + item.total); i+=timeInterval) busyTimeInMinutes.push(i);
        // console.log('busy time:', t);
      })
      // console.log(`busyTimeInMinutes ${dayDate}:`, busyTimeInMinutes);

      Object.keys(freeSlotDay).forEach(key => delete freeSlotDay[key]);
      for(let i = timeStartDay*60; i < timeEndDay*60; i+=timeInterval){
        // console.log('Create slot:', i, busyTimeInMinutes.includes(i))
        if(tmpSlot.includes(i) || tmpSlot.includes(i - timeInterval) || tmpSlot.includes(i - timeInterval*2) || tmpSlot.includes(i - timeInterval*3)){
          if(busyTimeInMinutes.includes(i)) continue;
          // console.log('Create slot:', i, i - timeInterval, i - timeInterval*2, i - timeInterval*3)
            let h = Math.trunc(i/60);
            let m = '00';
            if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
            freeSlotDay[i] = {'time':(h + ':' + m)};
            // console.log('time:', (h + ':' + m));
            // console.log(`s[${i}]=`, s[i]);
          // }
        }
      }
      freeSlot[day] = { ...freeSlotDay };
    })

    setSlots(freeSlot);
    // console.log('SP slots:', freeSlot);
  }
  useEffect(() => {getSlots()}, [receptionList, days]);

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
    const vd = new Date(visitDate);
    try {
      const newProcedure = await request(`${API_URL}`+'api/timetable', 'POST', {
        procedure_id  : procedureId,
        user_id       : user.id,
        doctor_id     : doctor,
        date          : vd,
        time          : time,
      })
      setProcedure(newProcedure);
      console.log('Book the Procedure:', newProcedure)
      // window.top.location = `${URL}thanks`
      navigate('/thanks')
    } catch (e) {console.log('error:', e)} 
  }

  const checkUserByEmail = async () => {
    console.log('try to check user by', email);
    try {
      const exist_user = await request(`${API_URL}api/checkuser_byemail/${email}`, 'GET', null, {})
      console.log('User:', exist_user);
      if(exist_user){
        setUser(exist_user);
        setFirstName(exist_user.firstname);
        setLastName(exist_user.lastname);
        setPhone(exist_user.phone);
      }
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    }
  }
  
  const checkUserByPhone = async () => {
    try {
      const exist_user = await request(`${API_URL}api/checkuser_byphone/${email}`, 'GET', null, {})
      console.log('User:', exist_user);
      if(exist_user){
        setUser(exist_user);
        setFirstName(exist_user.firstname);
        setLastName(exist_user.lastname);
        setEmail(exist_user.email);
      }
    } catch (e) {
      console.log('error:', e);
      alert('Something goes wrong. Check all & repeat, please.');
    }
  }
  
  const handleRecord = async () => {
    if(email === '') {
      alert('Fill in the Email field, please.');
      return;
    }
    // setLead({});
    // await newLead();
    // console.log('Lead:', lead);

    if(!user || Object.keys(user).length === 0){
      await checkUserByEmail();
      await checkUserByPhone();
      if(!user || Object.keys(user).length === 0) await newClient();
    }
    await bookProcedure();
    navigate('/thanks')
  }

  const handleDateChange = (dateValue) => {
    console.log('handleDateChange >>> dateValue:', dateValue.$d);
    const now = new Date();
    if(dateValue.$d < now) {
      alert("You can\'t book in the past")
      return;
    }
    setCurrentDate(dateValue.$d);
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

  const setPeriod = () => {
    // console.log('currentDate:', currentDate)
    let period = 3;//Math.floor(windowWidth/100);
    let newDays = []
    // console.log('setPeriod:', period);
    for(let i=0; i<period; i++){
      newDays[i] = new Date(currentDate);
      newDays[i] = newDays[i].setDate(newDays[i].getDate() + i);
    }
    setDays(newDays);
    // console.log('setPeriod >>> days:', newDays);
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

  const [emailCode, setEmailCode] = useState('');
  const [checkEmailCode, setCheckEmailCode] = useState('man');
  const [emailConfirm, setEmailConfirm] = useState(false);

  const sendEmailCode = async () => {
    const eCode = uuidv4();
    setEmailCode(eCode);
    // console.log('setEmailCode:', eCode)
    try {
      const newEmail = await request(`${API_URL}`+'api/newmail', 'POST', {
        subject   : 'Stunning You. Verification code.',
        body      : 'You verification coode is ' + eCode,
        adressee  : email,
        send_date : new Date()
      })
      console.log('Email', newEmail);
      
    } catch (e) { console.log('error:', e)}
  }

  const checkingEmailCode = () => {
    if(emailCode !== checkEmailCode) {
      alert('The email address or code you entered is invalid.')
      return;
    }
    setEmailConfirm(true)
  }
  
  const [checkPhoneCode, setCheckPhoneCode] = useState('man');
  const [phoneConfirm, setPhoneConfirm] = useState(false);

  const sendPhoneCode = async () => {
    try {
      await request(`${API_URL}api/twiliosend?phonenumber=${phone}`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })      
    } catch (e) { console.log('error:', e)}
  }

  const checkingPhoneCode = async () => {
    try {
      const res = await request(`${API_URL}api/twiliocheck?phonenumber=${phone}&code=${checkPhoneCode}`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })    
      console.log('res:', res);  
      setPhoneConfirm(true)
    } catch (e) { console.log('error:', e)}
  }
  
  
  return(
    <Container style={{textAlign:"center"}}>
      {/* <PWAMenu /> */}
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
                Book the procedure
              </Typography>
            </Grid>
          </Grid>
                    
          <Grid container sm={{mt: 6}}>
            <Grid item xs={12} sm={5}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DateCalendar currentDate={currentDate} onChange={ (newDate) => handleDateChange(newDate) } />
              </LocalizationProvider>
            </Grid>

            <Grid item xs={12} sm={7}>
              <Grid container>
                <Grid xs={1} sm={0}>&nbsp;</Grid>
                <Grid xs={10} sm={9}>
                  {/* procedure */}
                  {/* <Grid item xs={12} sm={6}> */}
                    {/* <ProcedureType procedureTypeId={procedureTypeId} onChangeProcedureType={handleProcedureTypeChange} /> */}
                    {/* procedureType now: {procedureTypeId} */}
                  {/* </Grid> */}
                  <Grid item xs={12} sm={12} sx={{ mt: 3}}>
                    <ProcedureList procedureTypeId={procedureTypeId} procedureId={procedureId} onChangeProcedure={handleProcedureChange} online={true} />
                    {/* procedure now: {procedureId} */}
                  </Grid>

                  {/* doctor */}
                  <Grid item xs={12} sm={12} sx={{ mt: 4 }}>
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
                            <MenuItem key={item.id + '_' + item.id} value={item.id}>{sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}</MenuItem>
                          )
                        })}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* SLOTS */}
                  <Grid style={{ margin:"24px auto 0" }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "row",
                        // alignItems: "center",
                        justifyContent: "space-between"
                    }}>
                      {days.map((day)=>{
                        return (
                          <div style={{ width:"30%" }}>
                            <b>{dmDate(day)}</b>
                            <Time onTimeChange={ handleTimeChange } slots={slots[day]} day={day} />
                          </div>
                        )
                      })}
                    </div>
                  </Grid>
                </Grid>
                <Grid xs={1} sm={3}>&nbsp;</Grid>
              </Grid>
            </Grid>
          </Grid>

          <Grid container sx={{mt: 3}}>
            <Grid item xs={1}></Grid>
            <Grid container item xs={10} sm={10} spacing={3} style={{ justifyContent: 'center' }}>

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
                  <Grid item xs={12} sm={12} >
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
                  <Grid item xs={12} sm={12} >
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
                  <Grid item xs={12} sm={12} >
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
                      style={{ background: emailConfirm ? 'lightgreen' : '', borderRadius: '8px' }}
                      className='inp-center'
                    />
                  </Grid>
                  {
                    email && //!emailConfirm &&
                    <Grid item xs={12} sm={12}>
                      {/* <Button onClick={()=>{sendEmailCode()}}>Send code to Email</Button>
                      <TextField
                        id="email_code"
                        label="Input Verification Code"
                        name="email_code"
                        size="small"
                        sx={{ ml:5, mr:5, textAlign:'center' }}
                        onChange={(e)=>{setCheckEmailCode(e.target.value)}}

                      />
                      <Button onClick={()=>{checkingEmailCode()}}>Check Email</Button> */}
                      <Grid item xs={12} sm={12}>
                        <Button 
                          variant="contained"
                          sx={{ mb: 2, ml: 8, mr:8, pl: 4, pr: 4}} 
                          onClick={()=>{checkUserByEmail()}}
                          size="small"
                        >
                            Already registered. Sign In by Email
                        </Button>
                      </Grid>
                    </Grid>
                  }
                  <Grid item xs={12} sm={12} >
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
                      style={{ background: phoneConfirm ? 'lightgreen' : '', borderRadius: '8px' }}
                      className='inp-center'
                    />
                  </Grid>
                  {
                    phone && !phoneConfirm &&
                    <Grid item xs={12} sm={12}>
                      <Button onClick={()=>{sendPhoneCode()}}>{'Send code >> '}</Button>
                      <TextField
                        id="phone_code"
                        label="Input Verification Code"
                        name="phone_code"
                        size="small"
                        sx={{ ml:5, mr:5, textAlign:'center' }}
                        onChange={(e)=>{setCheckPhoneCode(e.target.value)}}
                      />
                      <Button onClick={()=>{checkingPhoneCode()}}>{' >> Check Phone'}</Button>
                      <Grid item xs={12} sm={12}>
                        <Button 
                          variant="contained"
                          sx={{ mt: 2, mb: 2, ml: 8, mr: 8, pl: 4, pr: 4}} 
                          onClick={()=>{checkUserByPhone()}}
                          size="small"
                        >
                            Already registered. Sign In by Phone
                        </Button>
                      </Grid>
                    </Grid>
                  }

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

          { agreement && firstName && lastName && email && phone &&
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
    </Container>      
  )
}