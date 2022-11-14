import { useRef, useState, useEffect } from 'react';
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

  const [client, setClient] = useState(note.client_id)
  const [doctor, setDoctor] = useState(note.doctor_id)
  const [procedure, setProcedure] = useState(note.procedure_id)
  
  const {request} = useHttp()

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

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
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
