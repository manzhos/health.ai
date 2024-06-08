import React, { useRef, useState, useEffect, useCallback } from 'react';
import { sentenceCase } from 'change-case';
// material
import { 
  Menu, 
  MenuItem, 
  IconButton, 
  ListItemIcon, 
  ListItemText,
  Grid,
  Button,
  Box,
  Modal,
  Link,
  Checkbox,
  Container,
  Typography,
  TextField,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
 } from '@mui/material';
// component
import Iconify from '../../../components/Iconify';
import { useHttp } from '../../../hooks/http.hook'
import { API_URL } from '../../../config'
// ----------------------------------------------------------------------

export default function NoteMoreMenu({id, note, procedureList, clientList, doctorList, onChange}) {
  // console.log('Note:', note)
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const jwt = localStorage.getItem("jwt")
  // function parseJwt (token) {
  //   var base64Url = token.split('.')[1]
  //   var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  //   var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
  //     return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
  //   }).join(''))
  //   return JSON.parse(jsonPayload)
  // };
  // const pJWT = parseJwt(jwt)
  // const userId = pJWT.userId
  
  const {request} = useHttp()

  const [open, setOpen] = useState(false)
  const [client, setClient] = useState(note.client_id)
  const [doctor, setDoctor] = useState(note.doctor_id)
  const [procedure, setProcedure] = useState(note.procedure_id)
  const [files, setFiles] = useState([])
  const [savedFiles, setSavedFiles] = useState([])
  
  const getFiles = useCallback(async () => {
    try {
      const res_f = await request(`${API_URL}api/files/${note.id}`, 'GET', null, {
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

  const handleDelete = async (event) => {
    event.preventDefault()
    // console.log(`deleting note #${id}`)
    try {
      const res = await request(`${API_URL}api/note/${id}`, 'patch', null, {
        Authorization: `Bearer ${jwt}`
      })
      // console.log(res)
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    // console.log(`saving note #${id}`)
    const data = new FormData(event.currentTarget)
    try {
      const formData = new FormData()
      formData.append('title',        data.get('title'))
      formData.append('note',         data.get('note'))
      formData.append('client_id',    data.get('client_id'))
      formData.append('doctor_id',    data.get('doctor_id'))
      formData.append('procedure_id', data.get('procedure_id'))

      const res = await fetch(`${API_URL}api/note/${id}`, {
        method: 'POST', 
        body: formData,
      })
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const handleOpen = async () => {
    await getFiles()
    setOpen(true)
  }
  const handleClose = () => setOpen(false)

  const handleChangeClient = (event) => {
    event.preventDefault();
    setClient(event.target.value)
  }  
  const handleChangeDoctor = (event) => {
    event.preventDefault();
    setDoctor(event.target.value)
  }  
  const handleChangeProcedure = (event) => {
    event.preventDefault();
    setProcedure(event.target.value)
  } 

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
    // console.log('adding file:', event)
    // console.log('note.id:', note.id)
    // console.log('files:', files)
    // const data = new FormData(event.currentTarget)
    try {
      const formData = new FormData()
      formData.append('note_id', note.id)
      formData.append('client_id', note.client_id)
      formData.append('doctor_id', note.doctor_id)
      formData.append('procedure_id', note.procedure_id)
      files.map((item)=>{formData.append('file', item)})
      const res = await fetch(`${API_URL}api/file`, {
        method: 'POST', 
        body: formData,
      })
      // setOpen(false)
      // onChange(true)
      getFiles()
    } catch (e) { console.log('error:', e)}
  }

  const onDelButtonClick = async (e, id) => {
    // console.log('E:', e, 'Id:', id)
    const del = await fetch(`${API_URL}api/file/${id}`, {
      method: 'DELETE'
    })
    getFiles()
  }

  return (
    <>
      <IconButton ref={ref} onClick={() => setIsOpen(true)}>
        <Iconify icon="eva:more-vertical-fill" width={20} height={20} />
      </IconButton>

      <Menu
        open={isOpen}
        anchorEl={ref.current}
        onClose={() => setIsOpen(false)}
        PaperProps={{
          sx: { width: 200, maxWidth: '100%' },
        }}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleDelete}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleOpen}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
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
                // marginTop: 8,
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
                      defaultValue={note.title}
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
                      defaultValue={note.note}
                    />
                  </Grid>
                  <Grid item xs={12} sm={4}>
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
                        name={procedure.name + procedure.id}
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
                  </Grid>

                  {/* add file */}
                  <Grid item xs={12} sm={12}>
                    <div>
                      Files: 
                    </div>
                    <div>
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
                    </div>
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
                  Save changes
                </Button>
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>
    </>
  );
}
