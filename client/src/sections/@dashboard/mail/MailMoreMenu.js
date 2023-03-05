import React, { useRef, useState, useEffect, useContext, useCallback } from 'react';
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
  RadioGroup,
  Radio,
  Container,
  Typography,
  TextField,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
 } from '@mui/material';
// component
import { AuthContext } from '../../../context/AuthContext'
import Iconify from '../../../components/Iconify';
import { useHttp } from '../../../hooks/http.hook'
import { URL, API_URL } from '../../../config'
import { useNavigate } from 'react-router-dom';
// ----------------------------------------------------------------------

export default function MailMoreMenu({id, mail, onChange}) {
  // console.log('Mail:', mail)
  const {token} = useContext(AuthContext)
  const ref = useRef(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const {request} = useHttp()

  const handleDelete = async (event) => {
    event.preventDefault()
    // console.log(`deleting mail #${id}`)
    try {
      await request(`${API_URL}api/delmail/${id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    // console.log(`saving mail #${id}`)
    const data = new FormData(event.currentTarget)
    try {
      const formData = new FormData()
      formData.append('subject',  data.get('subject'))
      formData.append('body',     data.get('body'))
      formData.append('type',     data.get('type'))
      formData.append('senddate', data.get('senddate'))
      formData.append('adressee', adressee)
      // console.log('formData:', formData);

      await fetch(`${API_URL}api/mail/${id}`, {
        method: 'POST', 
        body: formData,
      })
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const [open, setOpen] = useState(false)
  const handleOpen  = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const [adressee, setAdressee] = useState([]);
  const [adresseeList, setAdresseeList] = useState([]);

  const getAdresseeList = async(role) =>{
    console.log('Role:', role);
    try {
      const users = await request(`${API_URL}api/user?role=${role}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setAdresseeList(users);
      console.log(adresseeList);
    } catch (e) { console.log('error:', e)}
  }

  const handleChangeAdreessee = (event) => {
    console.log('handleChangeAdreessee');
    event.preventDefault();
    setAdressee([...adressee, event.target.value]);
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
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleOpen}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleDelete}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>

      {/* ***edit mail*** */}
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
                Edit mail
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {/* <Box component="form" noValidate onSubmit={handleClose} sx={{ mt: 3 }}> */}
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      autoComplete="given-name"
                      name="subject"
                      required
                      fullWidth
                      id="subject"
                      label="Subject"
                      autoFocus
                      defaultValue={mail.subject}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      required
                      fullWidth
                      multiline rows={4}
                      id="body"
                      label="Body"
                      name="body"
                      defaultValue={mail.body}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      required
                      fullWidth
                      id="type"
                      label="Type"
                      name="type"
                      defaultValue={mail.type}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <TextField
                      fullWidth
                      name="senddate"
                      label="Send date/time"
                      id="senddate"
                      defaultValue={mail.senddate}
                    />
                  </Grid>                          
                  <Grid item xs={12}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1, mb: 1 }}>&nbsp;</Box>
                    {/* <FormControl> */}
                    <RadioGroup row aria-labelledby="usertype" name="usertype" defaultValue="leads">
                      <FormControlLabel value="client" control={<Radio size="small" />} label="Clients" onChange={(e)=>{getAdresseeList(e.target.value)}} />                                                                                                       
                      <FormControlLabel value="lead"   control={<Radio size="small" />} label="Leads"   onChange={(e)=>{getAdresseeList(e.target.value)}} />
                    </RadioGroup>
                    {/* </FormControl> */}
                    <Typography variant='body'>
                      {adressee.map(item => {
                        return(
                          <div style={{display: "inline-block"}}>{item}, </div>
                        )}
                      )}
                    </Typography>
                    <InputLabel id="add_adressee">Add Adressee</InputLabel>
                    <Select
                      labelId="add_adressee"
                      id="add_adressee-select"
                      fullWidth
                      value={mail}
                      label="Add Adressee"
                      onChange={handleChangeAdreessee}
                    >
                      {adresseeList.length > 0 &&
                        adresseeList.map((item) => {
                          return(
                            // console.log('item:', item)
                            <MenuItem key={item.id} value={item.email}>{item.firstname} {item.lastname} (<strong>{item.email}</strong>)</MenuItem>
                          )
                        })
                      }
                    </Select>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 1, mb: 1 }}>&nbsp;</Box>
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
