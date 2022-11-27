import React, { useState, useCallback,useEffect } from "react"
import axios from "axios"
import { sentenceCase } from 'change-case'
import { useHttp } from '../hooks/http.hook'
// material
import {
  Card,
  Table,
  Stack,
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
  FormLabel,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  MenuItem,
  TableContainer,
  TablePagination,
  Tab,
  Tabs
} from '@mui/material'
// components
import Page from '../components/Page'
import Iconify from '../components/Iconify'
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



export default function MailAdmin(){
  const jwt = localStorage.getItem("jwt")
  const[sent, setSent] = useState(false)
  const[subject, setSubject] = useState('')
  const[text, setText] = useState('')
  const[mailTo, setMailTo] = useState('')

  const {request} = useHttp()

  const handleSend = async () => {
    setSent(true)
    try{
      await axios.post(`${API_URL}send_mail/`, {
        mailTo:   mailTo,
        subject:  subject,
        text:     text
      })
      alert('Mail sent.')
    } catch (error) {
      console.log('Error:', error)
    }
  }

  const [tab, setTab] = useState(0);
  const handleTabChange = (event, newTab) => {
    setTab(newTab);
  }

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const[files, setFiles] = useState([])
  //send File
  const onFileChange = (e) => {
    // console.log('E -> e.target.files:', e.target.files, typeof e.target.files)
    let fileArr = [];    
    for(let key in e.target.files){
      fileArr.push(e.target.files[key])
    }
    fileArr.length = fileArr.length - 2;
    setFiles(fileArr)
    // console.log('files:', files)
  } 

  const addFile = async (event) => {
    event.preventDefault()
    console.log('add files...')
    // console.log('adding file:', event)
    // console.log('note.id:', note.id)
    // console.log('files:', files)
    // const data = new FormData(event.currentTarget)

    // try {
    //   const formData = new FormData()
    //   formData.append('note_id', note.id)
    //   formData.append('client_id', note.client_id)
    //   formData.append('doctor_id', note.doctor_id)
    //   formData.append('procedure_id', note.procedure_id)
    //   files.map((item)=>{formData.append('file', item)})
    //   const res = await fetch(`${API_URL}api/file`, {
    //     method: 'POST', 
    //     body: formData,
    //   })
    //   // setOpen(false)
    //   // onChange(true)
    //   getFiles()
    // } catch (e) { console.log('error:', e)}
  }

  const [recipientType, setRecipientType] = useState('personal')

  const [procedureTypeList, setProcedureTypeList] = useState([])
  const [procedureType, setProcedureType] = useState(1)
  const handleChangeProcedureType = (event) => {
    event.preventDefault();
    setProcedureType(event.target.value)
    // console.log('procedureType now:', procedureType)
  }
  const getProcedureTypes = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/proceduretypes`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      setProcedureTypeList(res);
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getProcedureTypes()}, [getProcedureTypes])  

  return(
    <Page title="Mail">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Mail
          </Typography>
          <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Mail
          </Button>
          {/* add new user */}
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
                    // marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography component="h1" variant="h5">
                    New mail
                  </Typography>
                  <Box component="form" noValidate onSubmit={handleSend} sx={{ mt: 3 }}>
                    <Grid container spacing={2}> 
                      <Grid item xs={12} sm={12}>
                        <Box mb={2}>
                          <FormControl>
                            <FormLabel id="Recipients-row-radio-buttons-group-label">Select recipients</FormLabel>
                            <RadioGroup row aria-labelledby="Recipients-row-radio-buttons-group-label" name="row-radio-buttons-group">
                              <FormControlLabel value="personal"        control={<Radio size="small" />} label="Personal"           onChange={(e)=>{setRecipientType(e.target.value)}}/>
                              <FormControlLabel value="procedure_type"  control={<Radio size="small" />} label="By procedure type"  onChange={(e)=>{setRecipientType(e.target.value)}} />
                              <FormControlLabel value="all_client"      control={<Radio size="small" />} label="All Clients"        onChange={(e)=>{setRecipientType(e.target.value)}} />
                              <FormControlLabel value="all_doctor"      control={<Radio size="small" />} label="All Doctors"        onChange={(e)=>{setRecipientType(e.target.value)}} />
                              <FormControlLabel value="all"             control={<Radio size="small" />} label="All"                onChange={(e)=>{setRecipientType(e.target.value)}} />
                              {/* <FormControlLabel value="disabled" disabled control={<Radio />} label="other" /> */}
                            </RadioGroup>
                          </FormControl>
                        </Box>
                        { recipientType === 'personal' &&
                          <TextField
                            name="mailto"
                            required
                            fullWidth
                            id="mailTo"
                            label="To:"
                            autoFocus
                            type="text" 
                            value={mailTo} 
                            onChange={(e)=>{setMailTo(e.target.value)}}
                          />
                        }
                        { recipientType === 'procedure_type' &&
                          <FormControl sx={{ width: 1 }}>
                            <InputLabel id="proceduretype-select">Procedure type</InputLabel>
                            <Select
                              labelId="proceduretype-select"
                              id="proceduretype-select"
                              name="proceduretype_id"
                              value={procedureType}
                              label="Procedure type"
                              onChange={handleChangeProcedureType} 
                            >
                              {procedureTypeList.map((item, key)=>{
                                return(
                                  <MenuItem key={item.id} value={item.id}>{sentenceCase(item.proceduretype)}</MenuItem>
                                )
                              })}
                            </Select>
                          </FormControl>
                        }
                        { recipientType === 'all_client' &&
                          <Typography component="h3" variant="h5">Send mail to all clients</Typography>
                        }
                        { recipientType === 'all_doctor' &&
                          <Typography component="h3" variant="h5">Send mail to all doctors</Typography>
                        }
                        { recipientType === 'all' &&
                          <Typography component="h3" variant="h5">Send mail to all</Typography>
                        }
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <TextField
                          name="subject"
                          fullWidth
                          id="subject"
                          label="Subject"
                          autoFocus
                          type="text" 
                          value={subject} 
                          onChange={(e)=>{setSubject(e.target.value)}}
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <TextField
                          name="text"
                          required
                          fullWidth
                          multiline
                          rows={4}
                          id="text"
                          label="Text"
                          type="text" 
                          value={text} 
                          onChange={(e)=>{setText(e.target.value)}}
                          autoFocus
                        />
                      </Grid>
                          {/* add file */}
                      <Grid item xs={12} sm={12}>
                        <div>
                          Attach files:
                        </div>
                        {/* <div>
                          {savedFiles.map(item => 
                            <div key={item.id} style={{margin:"20px", width:"140px", display:"inline-block"}}>
                              <Link href={API_URL+'docs/'+item.filename}>
                                {item.type === 'img' &&
                                  <img src={API_URL+'docs/'+item.filename} style={{height:"auto", maxHeight:"120px"}}/>
                                }
                                {item.type === 'mov' &&
                                  <img src={API_URL+'video.png'} style={{height:"auto", maxHeight:"90px", margin:"0 auto"}}/>
                                }
                                {item.type === 'file' &&
                                  <img src={API_URL+'document.png'} style={{height:"auto", maxHeight:"90px", margin:"0 auto"}}/>
                                }
                                <div>{item.displayFileName}</div> 
                              </Link>
                              <Button id="DelButton" onClick={(e) => onDelButtonClick(e, item.id)} variant="text" color="error" size="small">&#10006; Delete</Button>
                            </div>
                          )}
                        </div> */}
                        <label htmlFor="files">
                          <input id="files" name="file" type="file" formEncType='multipart/form-data' accept='' onChange={onFileChange} multiple/>
                          <Button variant="outlined" component="span" onClick={addFile}>
                            Add file
                          </Button>
                        </label>
                      </Grid>
                    </Grid>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                    >
                      Send mail
                    </Button>
                  </Box>
                </Box>
              </div>
            </Container>
          </Modal>
        </Stack>
    
        <Card>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs value={tab} onChange={handleTabChange} aria-label="doc tabs">
              <Tab label="INBOX" {...a11yProps(0)} />
              <Tab label="SENT" {...a11yProps(1)} />
              <Tab label="SCHEDULED" {...a11yProps(2)} />
            </Tabs>
          </Box>
          <TabPanel value={tab} index={0}>
            INBOX
          </TabPanel>
          <TabPanel value={tab} index={1}>
            SENT
          </TabPanel>
          <TabPanel value={tab} index={2}>
            SCHEDULED
          </TabPanel>
        </Card>
      </Container>
    </Page>
  )
}