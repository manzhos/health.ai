import React, {useState, useEffect, useCallback, useContext} from "react";
import { AuthContext } from "../context/AuthContext";
import { sentenceCase } from "change-case";
import {
  Box,
  Paper,
  Grid,
  Card,
  Button,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormLabel,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from '@mui/material';
import Carousel from 'react-material-ui-carousel'

import {API_URL, URL, MONTH} from '../config';
import { useHttp } from '../hooks/http.hook'
// import Scrollbar from "./Scrollbar";
import humanDate from "./HumanDate";
import Confirm from "./Confirm";
import AddFile from "./AddFile";
import CalendarOutside from "./CalendarOutside";
import Time from "./Time";

export default function ProcedureNote({ procedure, onSave }){
  // console.log('procedure >>>', procedure)
  const {request} = useHttp();
  const {token, userId, userTypeId}   = useContext(AuthContext);

  const zoneList = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  const fillerZoneList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const bodyZoneList = [1, 2, 3, 4, 5, 6, 7, 8];
  const productList = ['PLLA', 'Hyaluronic acid', 'Hydroxyapatite', 'Other'];
  const zoneCost = [179, 289, 369];
  const btx = [24, 26, 32];

  const [botoxWhat, setBotoxWhat] = useState(0);
  const [zone, setZone] = useState(0);
  const [fillerWhat, setFillerWhat] = useState(0);
  const [fillerZone, setFillerZone] = useState(0);
  const [bodyZone, setBodyZone] = useState(0);
  const [power, setPower] = useState(0);
  const [pulses, setPulses] = useState(0);
  const [nameTech, setNameTech] = useState('');
  const [product, setProduct] = useState(0);
  const [numberUnits, setNumberUnits] = useState(0);
  const [note, setNote] = useState([]);
  const [noteNew, setNoteNew] = useState('');
  const [medind, setMedind] = useState(false);
  const [diagnosis, setDiagnosis] = useState('');
  const [checkoutList, setCheckoutList] = useState([]);
  const [bodyCheckoutList, setBodyCheckoutList] = useState([]);
  const [total, setTotal] = useState(0);

  const [clientList, setClientList] = useState([]);
  const [doctorList, setDoctorList] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [procedureList, setProcedureList] = useState([]);
  const [docList, setDocList] = useState([]);

  const [noteId, setNoteId] = useState();
  const [editNoteMode, setEditNoteMode] = useState({});
  const [editNote, setEditNote] = useState('');
  const [clientId, setClientId] = useState(procedure.client_id);
  const [doctorId, setDoctorId] = useState(procedure.doctor_id);
  const [procedureFinal, setProcedureFinal] = useState(procedure.procedure_id);
  
  const [currentDate, setCurrentDate] = useState(procedure.start);
  const [visitDate, setVisitDate] = useState(new Date());
  const [time, setTime] = useState();
  const [timeEnd, setTimeEnd] = useState();
  const [duration, setDuration] = useState();
  const [slots, setSlots] = useState([]);
  const [receptionList, setReceptionList] = useState([])
  const [recordList, setRecordList] = useState([])
  
  const [photoList, setPhotoList] = useState([])
  const [photoBefore, setPhotoBefore] = useState([])
  const [photoAfter, setPhotoAfter] = useState([])
  const [fileUrl, setFileUrl] = useState([])
  
  const [confirmData, setConfirmData] = useState({ open: false });
  
  const [files, setFiles] = useState()
  
  useEffect(()=>{
    console.log('Doctor ID:', procedure.doctor_id); 
    setDoctorId(procedure.doctor_id)
    setTime(getOnlyTime(procedure.start));
    setTimeEnd(getOnlyTime(procedure.start + procedure.duration*60*1000));
  }, []);


  const getProcedureDataFromInvoice = async () => {
    try{
      const procedureData = await request(`${API_URL}api/getproceduredata_frominvoice/${procedure.timetable_id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      const staff = await request(`${API_URL}api/staff`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('procedureData:', procedureData);
      const notes = [];
      for (let key in procedureData.note){
        notes.push(procedureData.note[key]);
        const author = staff.find((s) => s.id === notes[notes.length-1].user_id);
        notes[notes.length-1].author = author.firstname + ' ' + author.lastname;
      }
      setNote(notes);
      setNoteId(procedureData.id);
      setProcedureFinal(procedureData.procedure_id);
      setClientId(procedureData.client_id);
      setDoctorId(procedureData.doctor_id);
      setMedind(procedureData.invoice.details.medind);
      setDiagnosis(procedureData.invoice.details.diagnosis); 
      setCheckoutList(procedureData.invoice.services); 
      setTotal(procedureData.invoice.details.cost);
      setBotoxWhat(procedureData.invoice.details.botox_what);

    } catch (e) { console.log('error:', e)}
  }  
  useEffect(()=>{
    if(procedure.is_invoiced) getProcedureDataFromInvoice();
  }, []);

  const getClients = useCallback(async () => {
    try {
      const clients = await request(`${API_URL}api/clients`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setClientList(clients)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getClients()}, [getClients])

  const getDoctors = useCallback(async () => {
    try {
      const doctors = await request(`${API_URL}api/doctors`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setDoctorList(doctors);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getDoctors()}, [getDoctors])

  const getStaff = useCallback(async () => {
    try {
      const staff = await request(`${API_URL}api/staff`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('staff:', staff);
      setStaffList(staff);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getStaff()}, [getStaff])

  const getProcedures = useCallback(async () => {
    try {
      const procedures = await request(`${API_URL}api/procedures`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setProcedureList(procedures)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getProcedures()}, [getProcedures])

  const getReceptions = async () => {
    console.log('try to take receptions by doctor ID:', doctorId);
    try {
      const reception = await request(`${API_URL}api/reception_bydoctor/${doctorId}`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      console.log('reception_bydoctor:', reception);
      setReceptionList(reception);
    } catch (e) { console.log('error:', e)}
  }
  useEffect(()=>{getReceptions()}, [doctorId])

  // get the data about doctors procedure
  const getRecordsByDoctor = async () => {
    console.log('getRecordsByDoctor:', doctorId);
    if(!doctorId) return;
    try {
      const res = await request(`${API_URL}api/tt_bydoctor/${doctorId}`, 'GET', null, {})
      console.log('tt_bydoctor:', res);
      setRecordList(res);
      // busy.length = 0;
    } catch(error) { console.log('error:', error) }
  }
  useEffect(() => {getRecordsByDoctor()}, [doctorId]) 

  const getDocs = useCallback(async () => {
    try {
      const docs = await request(`${API_URL}api/files/${procedure.timetable_id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setDocList(docs)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getDocs()}, [getDocs])

  const addToCheckoutList = () => {
    // console.log('add to checkoutList:', zone, fillerZone, numberUnits);
    if((!zone && !fillerZone) || !numberUnits || numberUnits === 0) return;
    setCheckoutList((checkoutList) => [...checkoutList, {
      'zone': zone !== 0 ? zone : fillerZone,
      'numberUnits': numberUnits
    }]);
    // console.log('added to checkoutList:', checkoutList);
  }

  const addToBodyCheckoutList = () => {
    console.log('add to Body checkoutList:', bodyZone, nameTech, power, pulses);
    if(!bodyZone || !nameTech || !power || power === 0 || !pulses || pulses === 0 ) return;
    setBodyCheckoutList((bodyCheckoutList) => [...bodyCheckoutList, {
      'nameTech': nameTech,
      'bodyZone': bodyZone,
      'power': power,
      'pulses': pulses,
    }]);
    console.log('added to Body checkoutList:', bodyCheckoutList);
  }

  const delFromCheckoutList = (i) => {
    setCheckoutList((checkoutList) => [...checkoutList.slice(0, i), ...checkoutList.slice(i + 1)]);
    // console.log('del from checkoutList:', checkoutList);
  }

  const delFromBodyCheckoutList = (i) => {
    setBodyCheckoutList((bodyCheckoutList) => [...bodyCheckoutList.slice(0, i), ...bodyCheckoutList.slice(i + 1)]);
  }

  useEffect(()=>{
    // setTotal( checkoutList.reduce( (acc, curr) => acc + curr.numberUnits * btx[botoxWhat], 0 ) );
    // setTotal( checkoutList.reduce( (acc, curr) => acc % 3 === 0 ? 369 : (acc % 2 === 0 ? 289 : 179), 0 ) );
    setTotal(()=>{
      if(checkoutList?.length){
        // console.log('checkoutList:', checkoutList);
        const count = checkoutList.length;
        const countInt = parseInt(count / 3),
              countRes = count % 3;
        return countInt * zoneCost[2] + (countRes === 2 ? zoneCost[1] : countRes === 1 ? zoneCost[0] : 0);
      }
    })
  },[checkoutList]);

  const saveNote = async () => {
    let success = {'save':false, 'update':false};
    // console.log('>>> procedure.timetable_id, note, client_id, doctor_id, procedure_id, services, cost:::::\n', procedure.timetable_id, note, clientId, doctorId, procedureFinal, checkoutList, total)
    if(procedure.is_invoiced){
      try {
        const res = await request(`${API_URL}api/doc/${noteId}`, 'POST', {
          timetable_id  : procedure.timetable_id,
          procedure_id  : procedureFinal, 
          client_id     : clientId, 
          doctor_id     : doctorId, 
          note          : {...note}, 
          medind        : medind, 
          diagnosis     : diagnosis, 
          botox_what    : botoxWhat,
          services      : checkoutList,
          cost          : total
        })
        // upload/delete files
        if(files){
          console.log('userId, clientId, files:', userId, clientId, files)
          const formData = new FormData();
          files.map((item)=>{ formData.append('file', item) });
          formData.append('user_id', userId);
          formData.append('client_id', clientId);
          formData.append('doc_id', procedure.timetable_id);
          try {
            const f = await fetch(`${API_URL}api/file/${procedure.timetable_id}`, {
              method: 'POST', 
              body: formData,
            });
            // console.log('f:', f);
            success.files = true;
          } catch (e) {console.log('error:', e)} 
        }
        onSave();
      } catch (e) {console.log('error:', e)} 
    }
    else{      
      try {
        const res = await request(`${API_URL}`+'api/doc', 'POST', {
          timetable_id  : procedure.timetable_id,
          procedure_id  : procedureFinal, 
          client_id     : clientId, 
          doctor_id     : doctorId, 
          note          : {...note}, 
          medind        : medind, 
          diagnosis     : diagnosis, 
          botox_what    : botoxWhat,
          services      : checkoutList,
          cost          : total
        })
        // auth.login(data.token, data.userId)
        success.save = true;
      } catch (e) {console.log('error:', e)} 

      try {
        const res = await request(`${API_URL}api/setprocedure_invoiced/${procedure.timetable_id}`, 'PATCH', null, {
          Authorization: `Bearer ${token}`
        })
        success.update = true;
      } catch (e) {console.log('error:', e)} 

      // upload/delete files
      if(files){
        console.log('>>> userId, clientId, files:', userId, clientId, files)
        const formData = new FormData();
        files.map((item)=>{ formData.append('file', item) });
        formData.append('user_id', userId);
        formData.append('client_id', clientId);
        formData.append('doc_id', procedure.timetable_id);
        try {
          const f = await fetch(`${API_URL}api/file/${procedure.timetable_id}`, {
            method: 'POST', 
            body: formData,
          });
          // console.log('f:', f);
          success.files = true;
        } catch (e) {console.log('error:', e)} 
      }
  
      if(success.save && success.update && ((files && success.files) || !files)) onSave();
      else alert('DB error -- nothing saved');
    }

  }

  const updateProcedureInTimetable = async () => {
    try {
      const tt_procedure = await request(`${API_URL}api/updateTimeTableProceduresById/${procedureFinal}`, 'PATCH', {
        'time'    : time,
        'date'    : currentDate,
        'duration': duration,
      });
      console.log('Procedure in timetable is updated:', tt_procedure);
    } catch (e) {console.log('error:', e)} 
  }
  // useEffect(()=>{updateProcedureInTimetable()}, [currentDate, time, duration]);

  const delRecord = (bookingId) => {
    setConfirmData({
      open:       true,
      message:    `Confirm delete booking #${bookingId}`,
      bookingId:  bookingId
    });
  }

  const _delRecord = async (response) => {
    console.log('response:', response);
    console.log('confirmData:', confirmData);
    if(response && confirmData.bookingId){
      try {
        const res = await request(`${API_URL}api/timetable/${confirmData.bookingId}`, 'DELETE', null, {
          Authorization: `Bearer ${token}`
        })
      } catch (e) {console.log('error:', e)}    
      onSave(); 
    }
    if(response && (confirmData.noteId || confirmData.noteId === 0)){
      const notes = note;
      notes.splice(confirmData.noteId, 1);
      console.log('notes:', notes);
      setNote(notes);
    }
    setConfirmData({ open:false }); 
  }

  const addNote = async () => {
    console.log('note:', note);
    const notes = note;
    const author = staffList.find((s) => s.id === userId);
    const date = new Date(); 
    notes.push({
      "date": date,
      "user_id": userId,
      "author": author.firstname + ' ' + author.lastname,
      "note": noteNew,
    });
    console.log('notes:', notes)
    setNote(notes);
    setNoteNew('');
  }

  const delNote = (key, date) => {
    const d = new Date(date)
    const hDate = d.getDate() + ' ' + MONTH[Number(d.getMonth())] + ' ' + d.getFullYear() + ' / ' + d.getHours() + ':' + (d.getMinutes() === 0 ? '00' : (String(d.getMinutes()).length === 1 ? '0' + d.getMinutes() : d.getMinutes() + ''))
    setConfirmData({
      open:    true,
      message: `Confirm delete note for ${hDate} `,
      noteId:  key
    });
  }

  const saveEditNote = (key) => {
    const notes = note;
    notes[key].note = editNote;
    setNote(notes);
    setEditNote('');
    setEditNoteMode({ mode: false })
  }

  const handlerFileChange = (files) => {
    setFiles(files);
  }

  const getPhotoByProcedure = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/files/${procedure.timetable_id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      const photo = res.filter(d=>(d.type === 'jpg' || d.type === 'jpeg' || d.type === 'png' || d.type === 'gif'))
      console.log('Photo >>>', photo)
      setPhotoList(photo)
    } catch (e) {console.log('error:', e)}   
  }, [token, request])
  useEffect(()=>{ getPhotoByProcedure() }, [])

  const getUrl = async () => {
    const fUrl = [];
    for(let p in photoList){
      const path = URL + 'files/docs/' + photoList[p].doc_id + '/' + photoList[p].filename
      const blob = await fetchImage(path);
      const f = new File([blob], photoList[p].filename)
      const url  = global.URL.createObjectURL(f);
      fUrl.push({'id':photoList[p].id, 'name':photoList[p].filename, 'type':photoList[p].type, 'path':url, 'ts':photoList[p].ts});
    }
    // setFileUrl(fUrl)
    if(!fUrl.length) return
    setPhotoBefore([...fUrl])
    const el = fUrl[fUrl.length-1]
    fUrl.pop()
    fUrl.unshift(el)
    setPhotoAfter([...fUrl])    
  }
  useEffect(()=>{ getUrl() }, [photoList])

  async function fetchImage(url){
    const data = await fetch(url);
    const buffer = await data.arrayBuffer();
    const blob = new Blob([buffer], { type: "image/png" });
    return blob;
  }

  const PhotoItem = ({item}) => {
    return (
        <Paper sx={{ textAlign:"center"}}>
            <img src={item.path} width={'100%'} height={'auto'} />
            <Typography variant="body2"> { item.ts ? humanDate(item.ts) : '' } </Typography>
        </Paper>
    )
  }

  const Gallery = () => {
    return (
      <Grid container>
        <Card sx={{ mt: 2, mb: 3, width: "100%", padding: "20px"}}>
          <Typography variant="h5">Results</Typography>
          <Grid container spacing={6}>
            <Grid item sm={6} sx={{ textAlign: 'center' }} >
              <Typography variant="body2">BEFORE</Typography>
                <Carousel autoPlay={false}>
                  { photoBefore.map( (item, i) => <PhotoItem key={i} item={item} /> ) }
                </Carousel>
            </Grid>
            <Grid item sm={6} sx={{ textAlign: 'center' }} >
              <Typography variant="body2">AFTER</Typography>
              <Carousel autoPlay={false}>
                { photoAfter.map( (item, i) => <PhotoItem key={i} item={item} /> ) }
              </Carousel>
            </Grid>
          </Grid>
        </Card>
      </Grid>      
    )
  }

  const getOnlyDate = (d) => {
    if(!d) return ' '
    d = new Date(d);
    return d.getDate() + ' ' + d.getMonth() + ' ' + d.getFullYear()
  }

  const getOnlyTime = (d) => {
    if(!d) return ' '
    d = new Date(d);
    return d.toTimeString('HH:mm');
  }

  const getSlots = () => {
    // // working hours
    const timeStartDay = 8, // hour of the starting
          timeEndDay   = 21, // hour of the ending
          timeInterval = 15; // time interval - 15 minutes
    let freeSlotDay = [], tmpSlot = [], busy = [], busyTimeInMinutes = [], freeSlot = {};

    // const receptions = getReceptions(doctorId);
    // const records    = getRecordsByDoctor(doctorId);
    console.log('receptionList:', receptionList);
    console.log('recordList:', recordList);
    const dayDate = getOnlyDate(currentDate);
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
    console.log(`tmpSlot:`, tmpSlot);

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
    console.log(`busy:`, busy);

    busyTimeInMinutes.length = 0;
    busy.forEach((item)=>{
      item.fromMin = Number(item.from.slice(0, 2))*60 + Number(item.from.slice(3));
      for(let i=item.fromMin; i<(item.fromMin + item.total); i+=timeInterval) busyTimeInMinutes.push(i);
    })
    console.log(`busyTimeInMinutes:`, busyTimeInMinutes);

    // Object.keys(freeSlotDay).forEach(key => delete freeSlotDay[key]);
    for(let i = timeStartDay*60; i < timeEndDay*60; i+=timeInterval){
      console.log('Create slot:', i, busyTimeInMinutes.includes(i))
      if(tmpSlot.includes(i) || tmpSlot.includes(i - timeInterval) || tmpSlot.includes(i - timeInterval*2) || tmpSlot.includes(i - timeInterval*3)){
        if(busyTimeInMinutes.includes(i)) continue;
        console.log('Create slot:', i, i - timeInterval, i - timeInterval*2, i - timeInterval*3)
        let h = Math.trunc(i/60);
        let m = '00';
        if(i%60 !== 0) m = i-(Math.trunc(i/60)*60);
        console.log('time:', (h + ':' + m));
        freeSlotDay.push(h + ':' + m);
      }
    }

    setSlots(freeSlotDay);
    // console.log('SP slots:', freeSlot);
  }
  useEffect(() => {getSlots()}, [doctorId, receptionList, recordList]);  
  // useEffect(() => {getSlots()}, [receptionList, days]);  

  const handleDateChange = (dateValue) => {
    console.log('handleDateChange >>> dateValue:', dateValue);
    const now = new Date();
    if(dateValue < now) {
      alert("You can\'t book in the past")
      return;
    }
    setCurrentDate(dateValue);
  }

  const handleTimeChange = (timeValue) => {
    console.log('handleTimeChange', timeValue);
    setTime(timeValue)
  }
  const timeToMin = (time) => {
    if(!time) return
    const timeArr = time.split(':');
    return timeArr[0]*60 + timeArr[1];
  }
  const handleTimeEndChange = (timeValue) => {
    console.log('handleTimeChange', timeValue);
    setTimeEnd(timeValue);
    setDuration(timeToMin(time) - timeToMin(timeValue));
  }
  useEffect(()=>{handleTimeEndChange()}, [time]);
 

  return(
    <div className="modal-tt-doctor">
      <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* extentended components */}
        <Confirm confirmData={confirmData} response={(response)=>{_delRecord(response)}} />

        {/* <Scrollbar> */}
          <Grid container>
            <Grid item xs={12} sm={3}>
              <FormControl sx={{ width:'90%', mb:3 }}>
                <InputLabel id="procedure-select">Procedure</InputLabel>
                <Select
                  labelId="procedure-select"
                  id="procedure-select"
                  name={procedure.name + procedure.id}
                  value={procedureFinal}
                  label="Procedure"
                  onChange={(event)=>{setProcedureFinal(event.target.value)}} 
                >
                  {procedureList.map((item, key)=>{
                    return(
                      <MenuItem key={item.id} value={item.id}>{sentenceCase(item.procedure)}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4} sx={{ mb:3 }}>
              {/* Doctor */}
              <FormControl sx={{ width:'90%' }}>
                <InputLabel id="doctor-select">Doctor</InputLabel>
                <Select
                  labelId="doctor-select"
                  id="doctor-select"
                  name="doctor_id"
                  value={doctorId}
                  label="Doctor"
                  onChange={(event)=>{setDoctorId(event.target.value)}} 
                >
                  {doctorList.map((item, key)=>{
                    return(
                      <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)} {sentenceCase(item.lastname)}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
              <p>&nbsp;</p>
              {/* Patient */}
              <FormControl sx={{ width:'90%' }}>
                <InputLabel id="client-select">Client</InputLabel>
                <Select
                  labelId="client-select"
                  id="client-select"
                  name="client_id"
                  value={clientId}
                  label="Client"
                  onChange={(event)=>{setClientId(event.target.value)}} 
                >
                  {clientList.map((item, key)=>{
                    return(
                      <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)} {sentenceCase(item.lastname)}</MenuItem>
                    )
                  })}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={9} sm={4}>
              <Grid container>
                <Grid item xs={12} sm={2}>Start: </Grid>
                <Grid item xs={12} sm={6}>
                  <CalendarOutside onDateChange={ (newDate) => handleDateChange(newDate) } dValue={currentDate} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl sx={{width:1}}>
                    <InputLabel id="doctor-select">Time</InputLabel>
                    <Select
                      labelId="time"
                      id="time"
                      name="time"
                      value={time}
                      label="Time"
                      onChange={(event)=>{handleTimeChange(event.target.value)}} 
                    >
                      {slots.map((item, key)=>{
                        return(
                          <MenuItem key={key} value={item}>{item}</MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <p>&nbsp;</p>
              <Grid container>
                <Grid item xs={12} sm={2}>End: </Grid>
                <Grid item xs={12} sm={6}>
                  <CalendarOutside onDateChange={ (newDate) => handleDateChange(newDate) } dValue={currentDate} />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl sx={{width:1}}>
                    <InputLabel id="time-end">Time</InputLabel>
                    <Select
                      labelId="time-end"
                      id="time-end"
                      name="time-end"
                      value={timeEnd}
                      label="Time"
                      onChange={(event)=>{handleTimeEndChange(event.target.value)}} 
                    >
                      {slots.map((item, key)=>{
                        return(
                          <MenuItem key={key} value={item}>{item}</MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              {/* End:<br /><strong>{humanDate(procedure.end)}</strong> */}
            </Grid>
            <Grid item xs={3} sm={1} sx={{ textAlign: "right" }}>
              <Button onClick={() => {delRecord(procedure.id)}} size="small" variant="outlined" color="error">Delete</Button>
            </Grid>

            <Grid item xs={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 1 }}>&nbsp;</Box>
            </Grid>

            <Grid item xs={12} sm={12}>
              {/* Note regarding Botox */}
              {procedure.title === 'BTX-A treatment' && 
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <img src="/static/face_scheme.svg" />
                  </Grid>
                  <Grid item xs={0} sm={1}>&nbsp;</Grid>
                  <Grid item xs={12} sm={7}>
                    <Grid container>
                      <Grid item xs={12} sm={12}>
                        <FormControl sx={{ mt: 3 }}>
                          <FormLabel id="botoxWhat">What drug was used for the procedure?</FormLabel>  
                          <RadioGroup row aria-labelledby="botoxWhat" name="botoxWhat" value={botoxWhat}>
                            <FormControlLabel value="0" control={<Radio size="small" />}  label="Allergan BTX"  onChange={(e)=>{setBotoxWhat(e.target.value)}} />
                            <FormControlLabel value="1" control={<Radio size="small" />}  label="Azzalure"      onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/>
                            <FormControlLabel value="2" control={<Radio size="small" />}  label="Bocoutur"      onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/>
                            {/* <FormControlLabel value="3" control={<Radio size="small" />}  label="Other"         onChange={(e)=>{setBotoxWhat(e.target.value)}} sx={{ml:2}}/> */}
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Botox zone</InputLabel>
                            <Select
                              labelId="zone"
                              id="zone"
                              name="zone"
                              value={zone}
                              label="Botox zone"
                              onChange={(e)=>{setZone(e.target.value)}} 
                              className='cons-input'
                            >
                              {zoneList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="numberUnits" label="Number units" name="numberUnits" type='number' value={numberUnits} onChange={(e)=>{setNumberUnits(e.target.value)}} className='cons-input' />
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <Button variant="outlined" sx={{ mt: 1, ml: 3 }} onClick={addToCheckoutList}>Add</Button>
                        </Grid>
                      </Grid>
                      <Grid container sx={{ mt:2 }}>
                        <Grid item xs={8} sm={8}>
                          <TableContainer>
                            <Table aria-label="zone table">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Zone</TableCell>
                                  <TableCell align="right">Number Units</TableCell>
                                  <TableCell align="right"></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {checkoutList.map((item, key) => {
                                  return(
                                    <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                      <TableCell component="th" scope="row">{item.zone} </TableCell>
                                      <TableCell align="right">{item.numberUnits}</TableCell>
                                      <TableCell align="right">
                                        <Button id="DelButton" onClick={() => delFromCheckoutList(key)} variant="outlined" color="error" size="small">&#10006; Delete</Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>                      
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={8} sm={8}>
                          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                            {/* <Box sx={{ mt:2 }}>Total cost: <strong>{total}</strong> EUR</Box> */}
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, mb: 0 }}>&nbsp;</Box>
                  </Grid>
                </Grid>
              }

              {/* Note regarding Fillers */}
              {procedure.title === 'Cosmetic fillers' && 
                <Grid container spacing={2}>
                  <Grid item xs={4} sm={4}>
                    <img src="/static/face_scheme-fillers.svg" />
                  </Grid>
                  <Grid item xs={1} sm={1}>&nbsp;</Grid>
                  <Grid item xs={7} sm={7}>
                    <Grid container>
                      <Grid item xs={12} sm={12}>
                        <FormControl sx={{ mt: 3 }}>
                          <FormLabel id="filler-what">What drug was used for the procedure?</FormLabel>  
                          <RadioGroup row aria-labelledby="filler-what" name="filler-what" defaultValue="0">
                            <FormControlLabel value="0" control={<Radio size="small" />}  label="Microbolus" onChange={(e)=>{setFillerWhat(e.target.value)}} />
                            <FormControlLabel value="1" control={<Radio size="small" />}  label="Canulas"    onChange={(e)=>{setFillerWhat(e.target.value)}} sx={{ml:2}}/>
                          </RadioGroup>
                        </FormControl>
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Product</InputLabel>
                            <Select
                              labelId="product"
                              id="product"
                              name="product"
                              value={product}
                              label="Product"
                              onChange={(e)=>{setProduct(e.target.value)}} 
                              className='cons-input'
                            >
                              {productList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Zone</InputLabel>
                            <Select
                              labelId="zone"
                              id="zone"
                              name="zone"
                              value={fillerZone}
                              label="Zone"
                              onChange={(e)=>{setFillerZone(e.target.value)}} 
                              className='cons-input'
                            >
                              {fillerZoneList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="numberUnits" label="ml" name="numberUnits" type='number' value={numberUnits} onChange={(e)=>{setNumberUnits(e.target.value)}} className='cons-input' />
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <Button variant="outlined" sx={{ mt: 1, ml: 3 }} onClick={addToCheckoutList}>Add</Button>
                        </Grid>
                      </Grid>
                      <Grid container sx={{ mt:2 }}>
                        <Grid item xs={8} sm={8}>
                          <TableContainer>
                            <Table aria-label="zone table">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Zone</TableCell>
                                  <TableCell align="right">ml</TableCell>
                                  <TableCell align="right"></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {checkoutList.map((item, key) => {
                                  return(
                                    <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                      <TableCell component="th" scope="row">{item.zone} </TableCell>
                                      <TableCell align="right">{item.numberUnits}</TableCell>
                                      <TableCell align="right">
                                        <Button id="DelButton" onClick={() => delFromCheckoutList(key)} variant="outlined" color="error" size="small">&#10006; Delete</Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>                      
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={8} sm={8}>
                          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                            {/* <Box sx={{ mt:2 }}>Total cost: <strong>{total}</strong> EUR</Box> */}
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, mb: 0 }}>&nbsp;</Box>
                  </Grid>
                </Grid>
              }

              {/* Note regarding Body Cryo */}
              {procedure.title === 'Body Cryo' && 
                <Grid container spacing={2}>
                  <Grid item xs={4} sm={4}>
                    <img src="/static/body_scheme.svg" />
                  </Grid>
                  <Grid item xs={1} sm={1}>&nbsp;</Grid>
                  <Grid item xs={7} sm={7}>
                    <Grid container>
                      <Grid item xs={12} sm={12}>
                        <TextField fullWidth id="nameTech" label="Name of Technology" name="nameTech" type='text' value={nameTech} onChange={(e)=>{setNameTech(e.target.value)}} className='cons-input' />
                      </Grid>
                      <Grid container spacing={2} sx={{ mt: 3 }}>
                        <Grid item xs={4} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="zone">Spot</InputLabel>
                            <Select
                              labelId="Spot"
                              id="bodyZone"
                              name="bodyZone"
                              value={bodyZone}
                              label="Spot"
                              onChange={(e)=>{setBodyZone(e.target.value)}} 
                              className='cons-input'
                            >
                              {bodyZoneList.map((item)=>{
                                return(
                                  <MenuItem key={item} value={item}>{item}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="power" label="Power" name="power" type='number' value={power} onChange={(e)=>{setPower(e.target.value)}} className='cons-input' />
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <TextField fullWidth id="pulses" label="Pulses" name="pulses" type='number' value={pulses} onChange={(e)=>{setPulses(e.target.value)}} className='cons-input' />
                        </Grid>
                        <Grid item xs={4} sm={4}>
                          <Button variant="outlined" sx={{ mt: 1, ml: 3 }} onClick={addToBodyCheckoutList}>Add</Button>
                        </Grid>
                      </Grid>
                      <Grid container sx={{ mt:2 }}>
                        <Grid item xs={12} sm={12}>
                          <TableContainer>
                            <Table>
                              <TableHead>
                                <TableRow>
                                  <TableCell>Name of Technology</TableCell>
                                  <TableCell align="right">Spot</TableCell>
                                  <TableCell align="right">Power</TableCell>
                                  <TableCell align="right">Pulses</TableCell>
                                  <TableCell align="right"></TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {bodyCheckoutList.map((item, key) => {
                                  return(
                                    <TableRow key={key} sx={{ '&:last-child td, &:last-child th': { border: 0 } }} >
                                      <TableCell component="th" scope="row">{item.nameTech} </TableCell>
                                      <TableCell align="right">{item.bodyZone}</TableCell>
                                      <TableCell align="right">{item.power}</TableCell>
                                      <TableCell align="right">{item.pulses}</TableCell>
                                      <TableCell align="right">
                                        <Button id="DelButton" onClick={() => delFromBodyCheckoutList(key)} variant="outlined" color="error" size="small">&#10006; Delete</Button>
                                      </TableCell>
                                    </TableRow>
                                  )
                                })}
                              </TableBody>
                            </Table>
                          </TableContainer>                      
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={12} sm={12}>
                          <Box sx={{ borderTop: 1, borderColor: 'divider' }}>
                            <Box sx={{ mt:2 }}>Total cost: <strong>{total}</strong> EUR</Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
                  <Grid item xs={12}>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 2, mb: 0 }}>&nbsp;</Box>
                  </Grid>
                </Grid>
              }

              <Grid container spacing={2}>
                <Grid item xs={12} sm={12}>
                  <FormControlLabel
                    control={<Checkbox name="medind" value="medind" onChange={()=>{setMedind(!medind)}} color="primary" />}
                    label="Medical indication"
                  />
                  { medind &&
                    <Grid item xs={12} sm={12} sx={{ mt: 1 }}>
                      <TextField 
                        fullWidth multiline rows={4}
                        name="diagnosis"
                        id="diagnosis"
                        label="Diagnosis"
                        className='cons-input' style={{ marginTop:"4px" }} 
                        value={diagnosis} onChange={(e)=>{setDiagnosis(e.target.value)}}
                      />
                    </Grid>
                  }
                </Grid>
                <Grid item xs={12} sm={12}>
                  <Typography variant="body2" sx={{ mt:1 }}>
                    {'Note about procedure'}
                  </Typography>
                  <Grid item xs={12} sm={12}>
                    <TableContainer sx={{ minWidth: 800 }}>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>
                              Date
                            </TableCell>
                            <TableCell>
                              Author
                            </TableCell>
                            <TableCell>
                              Note
                            </TableCell>
                            <TableCell>
                              &nbsp;
                            </TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          { note.map((n, key)=>{
                              return(
                                <TableRow id={'NoteRow_'+key}>
                                  <TableCell>{humanDate(n.date)}</TableCell>
                                  <TableCell>{n.author}</TableCell>
                                  <TableCell>
                                    {editNoteMode.id !== key && n.note}
                                    {editNoteMode.mode && editNoteMode.id === key && <TextField name="note" fullWidth multiline rows={4} id="note" value={editNote} onChange={(e)=>{setEditNote(e.target.value)}} label="Note" className='cons-input' />}
                                    {editNoteMode.mode && editNoteMode.id === key && <Button size="small" variant="outlined" color="secondary" sx={{ mt: 1 }} onClick={()=>{saveEditNote(key)}}>Save</Button>}
                                    {editNoteMode.mode && editNoteMode.id === key && <Button size="small" variant="outlined" sx={{ mt: 1, ml: 2 }} onClick={()=>{ setEditNoteMode({ mode: false }) }}>Cancel</Button>}
                                  </TableCell>
                                  <TableCell>
                                    {userId === Number(n.user_id) && 
                                      <Button size="small" color="secondary" 
                                        onClick={() => { 
                                          setEditNote(n.note)
                                          setEditNoteMode({ mode: true, id: key }) 
                                        }}
                                      >
                                        Edit
                                      </Button>
                                    }
                                    {userId === Number(n.user_id) && <Button size="small" color="error" onClick={() => {delNote(key, n.date)}} >Delete</Button>}
                                  </TableCell>
                                </TableRow>
                              )
                            })
                          }
                        </TableBody>
                      </Table>
                    </TableContainer>
                    <Grid container>
                      <Grid item sm={10}>
                        <Typography variant="body2" sx={{ mt:2, mb:1 }}>
                          {'Add a new note'}
                        </Typography>
                        <TextField name="note" fullWidth multiline rows={4} id="note" value={noteNew} onChange={(e)=>{setNoteNew(e.target.value)}} label="Note" className='cons-input' />
                      </Grid>
                      <Grid item sm={2} sx={{ mt:17, display:"flex", justifyContent:"center"}}>
                        <div>
                          <Button size="small" variant="outlined" onClick={()=>{addNote()}}>Add</Button>
                        </div>
                      </Grid>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
              <Grid item xs={12}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 5 }}>&nbsp;</Box>
              </Grid>
              <Grid container>
                <Card sx={{ mt: 2, mb: 3, width: "100%", padding: "20px"}}>
                  <Grid item sx={{ display:"flex", flexDirection:"column", justifyContent:"center" }}>
                    {/* <Box sx={{ minHeight: "150px" }}>&nbsp;</Box> */}
                    <Box sx={{ borderTop: 1, borderBottom: 1, borderColor: 'divider', mt: 1, mb: 1, padding:"20px" }}>
                      <AddFile docList = {docList} onFileChange = {handlerFileChange}/>
                    </Box>
                    {/* <Button variant="outlined" sx={{  }} onClick={saveNote}>Add files</Button> */}
                  </Grid>
                </Card>
              </Grid>
              { photoBefore?.length > 0 && 
                <Gallery />
              }
              <Button variant="contained" sx={{ mt: 3 }} onClick={saveNote}>Save</Button>
            </Grid>
          </Grid>
        {/* </Scrollbar> */}
      </Box>
    </div>
  )
}