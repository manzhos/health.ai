import { sentenceCase } from 'change-case'
import React, { useState, useCallback, useEffect, useContext } from 'react'
import { Link as RouterLink, useParams, useSearchParams, useNavigate } from 'react-router-dom'
// material
import {
  Card,
  Table,
  Stack,
  // Avatar,
  Grid,
  Button,
  Box,
  Modal,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Link,
  Typography,
  TextField,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
  MenuItem,
  TableContainer,
  TablePagination,
  Tab,
  Tabs
} from '@mui/material'
// components
import Page from '../components/Page'
import Iconify from '../components/Iconify'
import Scrollbar from '../components/Scrollbar'
import { Loader } from '../components/Loader'
import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import {API_URL} from '../config'

// ----------------------------------------------------------------------

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `tab-${index}`,
    'aria-controls': `tabpanel-${index}`,
  };
}

export default function NoteInfo() {
  const {token} = useContext(AuthContext)
  const jwt = localStorage.getItem("jwt")
  // console.log('JWT:', jwt)
  function parseJwt (token) {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  };
  const pJWT = parseJwt(jwt)
  const userId = pJWT.userId

  const {loading, request} = useHttp()
  // const navigate  = useNavigate()
  const params = useParams()
  const noteId = params.id
  const [searchParams, setSearchParams] = useSearchParams()
  const noteInfo = {
    doctor_firstname: searchParams.get('doctor_firstname'),
    doctor_lastname:  searchParams.get('doctor_lastname'),
    procedure:        searchParams.get('procedure')
  }
  
  const[note, setNote] = useState([])

  // get note info
  const getNote = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/note/${noteId}`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      // console.log('note:', res)
      setNote(res)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getNote()}, [getNote])

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('E:', event)
    // const data = new FormData(event.currentTarget)
    // if(data.get('note')){
    //   try {
    //     const formData = new FormData()
    //     formData.append('note',         data.get('note'))
    //     formData.append('client_id',    data.get('client_id'))
    //     formData.append('doctor_id',    data.get('doctor_id'))
    //     formData.append('procedure_id', data.get('procedure_id'))
    //     formData.append('notetype_id',  data.get('notetype_id'))

    //     const res = await fetch(`${API_URL}api/note`, {
    //       method: 'POST', 
    //       body: formData,
    //     })
    //     setOpen(false)
    //     handleUpdate()
    //     navigate('/doctor/note')
    //   } catch (e) {console.log('error:', e)} 
    // } else alert('Need to check the filled information.')
  }

  const [tab, setTab] = useState(0);
  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  }

  const [savedFiles, setSavedFiles] = useState([])
  
  const getFiles = useCallback(async () => {
    try {
      const res_f = await request(`${API_URL}api/files/${noteId}`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      res_f.map((item) => {
        let type = item.filename.toLowerCase().split('.')
        if(type[1] === 'jpg' || type[1] === 'jpeg' || type[1] === 'png' || type[1] === 'gif') item.type = 'img'
        else if(type[1] === 'mpg' || type[1] === 'mpeg' || type[1] === 'mov' || type[1] === 'avi' || type[1] === 'asf' || type[1] === 'mp4' || type[1] === 'm4v') item.type = 'mov'
        else item.type = 'file'
        let displayFileName = type[0].split('_')
        displayFileName.shift()
        item.displayFileName = displayFileName.join('_')
      }) 
      // console.log('savedFiles(res_f):', res_f)
      setSavedFiles(res_f)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getFiles()}, [getFiles])

  if (loading) return <Loader/>
  else {
    return (
      <Page title="Note info">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              {note.title}
            </Typography>
            <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
              Edit
            </Button>
            {/* edit note */}
            <Modal
              open={open}
              onClose={handleClose}
              aria-labelledby="modal-modal-title"
              aria-describedby="modal-modal-description"
            >
              <Container component="main" maxWidth="md" disableGutters>
                <div className="login-modal">
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <Typography component="h1" variant="h5">
                      Edit note
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                      <Grid container spacing={2} item xs={12} sm={12}>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            fullWidth
                            id="title"
                            label="Title / Subject"
                            name="title"
                            autoFocus
                          />
                        </Grid>
                        <Grid item xs={12} sm={12}>
                          <TextField
                            name="note"
                            required
                            fullWidth
                            multiline 
                            rows={4}
                            id="note"
                            label="Note"
                            autoFocus
                          />
                        </Grid>
                        {/* <Grid item xs={12} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="client-select">Client</InputLabel>
                            <Select
                              labelId="client-select"
                              id="client-select"
                              name="client_id"
                              value={client}
                              label="Client"
                              onChange={handleChangeClient} 
                            >
                              {clientList.map((item, key)=>{
                                return(
                                  <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="doctor-select">Doctor</InputLabel>
                            <Select
                              labelId="doctor-select"
                              id="doctor-select"
                              name="doctor_id"
                              value={doctor}
                              label="Doctor"
                              onChange={handleChangeDoctor} 
                            >
                              {doctorList.map((item, key)=>{
                                return(
                                  <MenuItem key={item.id} value={item.id}>{sentenceCase(item.firstname)}&nbsp;{sentenceCase(item.lastname)}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="procedure-select">Procedure</InputLabel>
                            <Select
                              labelId="procedure-select"
                              id="procedure-select"
                              name="procedure_id"
                              value={procedure}
                              label="Procedure"
                              onChange={handleChangeProcedure} 
                            >
                              {procedureList.map((item, key)=>{
                                return(
                                  <MenuItem key={item.id} value={item.id}>{sentenceCase(item.procedure)}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        </Grid> */}
                      </Grid>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Save note
                      </Button>
                    </Box>
                  </Box>
                </div>
              </Container>
            </Modal>
          </Stack>
  
          <Card>
            <Container component="main" maxWidth="md" disableGutters>
              <Box sx={{ mt: 3, mb: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={7}>
                    Procedure: <strong>{noteInfo.procedure}</strong>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    Doctor: <strong>{sentenceCase(noteInfo.doctor_firstname)} {sentenceCase(noteInfo.doctor_lastname)}</strong>
                  </Grid>
                  {/* <Grid item xs={12} sm={2}>
                    <Grid item>
                      Date: <strong>{note.ts}</strong>
                    </Grid>
                    <Grid item>
                      Time: <strong>{note.ts}</strong>
                    </Grid>
                  </Grid> */}
                  <Grid item xs={12} sm={12} sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <div style={{width:"100%", height:"20px"}}>&nbsp;</div>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    {note.note}
                  </Grid>
                </Grid>
              </Box>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <div style={{width:"100%", height:"40px"}}>&nbsp;</div>
              </Box>
              <div style={{width:"100%", height:"20px"}}>&nbsp;</div>
              <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={tab} onChange={handleTabChange} aria-label="doc tabs">
                  <Tab label="Images" {...a11yProps(0)} />
                  <Tab label="Videos" {...a11yProps(1)} />
                  <Tab label="Docs" {...a11yProps(2)} />
                </Tabs>
              </Box>
              <TabPanel value={tab} index={0}>
                {savedFiles.map(item => 
                  <>
                    {item.type === 'img' &&
                      <div key={item.id} className='docfile'>
                        <Link href={API_URL+'docs/'+item.filename}>
                          <img src={API_URL+'docs/'+item.filename} className='imgfile' />
                          <div>{item.displayFileName}</div> 
                        </Link>
                      </div>
                    }
                  </>
                )}
              </TabPanel>
              <TabPanel value={tab} index={1}>
                {savedFiles.map(item => 
                  <>
                    {item.type === 'mov' &&
                      <div key={item.id} className='docfile'>
                        <Link href={API_URL+'docs/'+item.filename}>
                          <img src={API_URL+'video.png'} className='imgfile' />
                          <div>{item.displayFileName}</div> 
                        </Link>
                      </div>
                    }
                  </>
                )}
              </TabPanel>
              <TabPanel value={tab} index={2}>
                {savedFiles.map(item => 
                  <>
                    {item.type === 'file' &&
                      <div key={item.id} className='docfile'>
                        <Link href={API_URL+'docs/'+item.filename}>
                          <img src={API_URL+'document.png'} className='imgfile' />
                          <div>{item.displayFileName}</div> 
                        </Link>
                      </div>
                    }
                  </>
                )}
              </TabPanel>
            </Container>
          </Card>
        </Container>
      </Page>
    )
  }
}
