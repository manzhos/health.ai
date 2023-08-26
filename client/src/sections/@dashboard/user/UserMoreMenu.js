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

import ProcedureType      from '../../../components/ProcedureType'
import ProcedureList      from '../../../components/ProcedureList'

// ----------------------------------------------------------------------

export default function UserMoreMenu({id, user, roleList, onChange}) {
  // console.log('User:', user)
  const {token} = useContext(AuthContext)
  const ref = useRef(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(user.usertype_id)
  const {request} = useHttp()
  const [newAvatar, setNewAvatar] = useState()
  const [avatarURL, setAvatarURL] = useState();

  const handleDelete = async (event) => {
    event.preventDefault()
    // console.log(`deleting user #${id}`)
    try {
      await request(`${API_URL}api/deluser/${id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    // console.log(`saving user #${id}`)
    const data = new FormData(event.currentTarget)
    try {
      const formData = new FormData();
      formData.append('firstname', data.get('firstName'));
      formData.append('lastname',   data.get('lastName'));
      formData.append('email',      data.get('email'));
      formData.append('password',   data.get('password'));
      formData.append('usertype_id',data.get('usertype_id'));
      formData.append('promo',      data.get('allowExtraEmails'));
      formData.append('avatar',     data.get('avatar'));

      await fetch(`${API_URL}api/user/${id}`, {
        method: 'POST', 
        body: formData,
      })
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e) }
  }

  const [open, setOpen] = useState(false);
  const [loyaltyOpen, setLoyaltyOpen] = useState(false);
  const [loyalty, setLoyalty] = useState({});
  const handleOpen  = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const handleLoyaltyOpen  = () => {setLoyaltyOpen(true)};
  const handleLoyaltyClose = () => {setLoyaltyOpen(false)};

  const [doctorList, setDoctorList] = useState([]);
  const [doctor, setDoctor] = useState('');
  const [doctorSelected, setDoctorSelected] = useState([]);

  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}`+'api/doctors', 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setDoctorList(res);
      setDoctorSelected(res);
    } catch (e) { console.log('error:', e) }
  }, [request])
  useEffect(() => {getDoctors()}, [getDoctors]); 
  
  const handleChangeDoctor = (event) => {
    // console.log('setDoctor:', event.target.value);
    event.preventDefault();
    setDoctor(event.target.value);
    const index = doctorList.findIndex((el) => el.id === event.target.value);
    if(index > -1) {
      let arr = [];
      arr.push(doctorList[index]);
      setDoctorSelected(arr);
    }
    // console.log('doctorSelected', doctor)
  }

  const [invoiceOpen, setInvoiceOpen]  = useState(false);

  const [procedureTypeId, setProcedureTypeId] = useState(4);
  const [procedureId, setProcedureId] = useState(0);
  const handleProcedureTypeChange = (newProcedureTypeId) => {
    setProcedureTypeId(newProcedureTypeId);
  }
  const handleProcedureChange = (newProcedureId) => {
    setProcedureId(newProcedureId);
  }
  const handleInvoiceSubmit = async (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    // console.log(
    //   'title', 'invoice',
    //   '\n doc_type', 1,
    //   '\n client_id', id,
    //   '\n doctor_id', doctor,
    //   '\n procedure_id', data.get('procedure_id'),
    //   '\n quantity',     data.get('quantity'),
    //   '\n cost',        data.get('cost')
    // );
    try {
      const res = await request(`${API_URL}api/note`, 'POST', {
        'title':        'invoice',
        'doc_type':     1,
        'client_id':    id,
        'doctor_id':    doctor,
        'procedure_id': data.get('procedure_id'),
        'invoice':      {
          'procedure_id': data.get('procedure_id'),
          'client_id':    id,
          'doctor_id':    doctor,
          'qty':          data.get('quantity'),
          'cost':         data.get('cost')
        }
      });

      setInvoiceOpen(false);
    } catch (err) { console.log('error:', err) }
  }


  const handleChangeRole = (event) => {
    event.preventDefault();
    setRole(event.target.value)
    // console.log('role now:', role)
  }

  const getLoyalty = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/client/loyalty/${id}`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      console.warn('Loyalty:', res);
      setLoyalty(res);
    } catch (e) { console.log('error:', e)}
  }, [request])
  useEffect(() => {getLoyalty()}, [getLoyalty])

  const avatar = () => {
    // console.log('user avatar:', user.avatar ? user.avatar : 'none');
    if(user.avatar && user.avatar?.slice(0,4) === 'http') return user.avatar;
    if(user.avatar) return URL + 'files/avatars/' + user.avatar;
    return URL + 'files/blank-avatar.svg';
  }
  const onAvatarChange = (e) => {
    // console.log('E:', e)
    setNewAvatar(e.target.files[0]);
    // console.log('new avatar:', newAvatar);
  } 
  useEffect(()=>{
    if(!newAvatar) return
    setAvatarURL(global.URL.createObjectURL(newAvatar))
  }, [newAvatar]) 

  const handleCommunicate = () => {
    // console.log('start communication');
    navigate(`/admin/user/communication/client/${id}`);
  }
  // const handleInvoice = () => {
  //   navigate(`/admin/client/invoice`);
  // }


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
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleCommunicate}>
          <ListItemIcon>
            <Iconify icon="material-symbols:chat-rounded" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Communication" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleOpen}>
          <ListItemIcon>
            <Iconify icon="eva:edit-fill" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Edit" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        { role === 3 &&
          <>
            <MenuItem sx={{ color: 'text.secondary' }} onClick={handleLoyaltyOpen}>
              <ListItemIcon>
                <Iconify icon="material-symbols:loyalty" width={24} height={24} />
              </ListItemIcon>
              <ListItemText primary="Loyalty" primaryTypographyProps={{ variant: 'body2' }} />
            </MenuItem>
            <MenuItem sx={{ color: 'text.secondary' }} onClick={()=>{setInvoiceOpen(true)}}>
              <ListItemIcon>
                <Iconify icon="fa6-solid:file-invoice" width={24} height={24} />
              </ListItemIcon>
              <ListItemText primary="Invoice" primaryTypographyProps={{ variant: 'body2' }} />
            </MenuItem>
          </>
        }

        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleDelete}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>

      {/* ***edit user*** */}
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
                Edit user
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              {/* <Box component="form" noValidate onSubmit={handleClose} sx={{ mt: 3 }}> */}
                <Grid container spacing={2}>
                  <Grid container item xs={12} sm={2} direction="column" justifyContent="flex-start" alignItems="center">
                    <img src={avatarURL || avatar()} className='avatar' alt="" />
                    <label htmlFor="avatar">
                      <input id="avatar" name="avatar" type="file" accept='image/*' onChange={onAvatarChange} style={{ display: "none" }}/>
                      <Button variant="outlined" component="span">
                        Set Photo
                      </Button>
                    </label>
                  </Grid> 
                  <Grid container item spacing={2} xs={12} sm={10}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        autoComplete="given-name"
                        name="firstName"
                        required
                        fullWidth
                        id="firstName"
                        label="First Name"
                        autoFocus
                        defaultValue={user.firstname}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        required
                        fullWidth
                        id="lastName"
                        label="Last Name"
                        name="lastName"
                        autoComplete="family-name"
                        defaultValue={user.lastname}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        defaultValue={user.email}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        name="password"
                        label="New password if needed"
                        type="password"
                        id="password"
                        autoComplete="new-password"
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <FormControl sx={{ width: 1 }}>
                        <InputLabel id="role-select">Role</InputLabel>
                        <Select
                          labelId="role-select"
                          id="role-select"
                          name="usertype_id"
                          value={role}
                          label="Role"
                          onChange={handleChangeRole} 
                        >
                          {roleList.map((item, key)=>{
                            return(
                              <MenuItem key={item.id} value={item.id}>{sentenceCase(item.usertype)}</MenuItem>
                            )
                          })}
                        </Select>
                      </FormControl>
                    </Grid>                          
                    <Grid item xs={12}>
                      <FormControlLabel
                        control={<Checkbox name="allowExtraEmails" value="allowExtraEmails" color="primary" />}
                        label="Set for receive inspiration, marketing promotions and updates via email."
                      />
                    </Grid>
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

      {/* ***make invoice*** */}
      <Modal
        open={invoiceOpen}
        onClose={()=>{setInvoiceOpen(false)}}
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
                New Invoice
              </Typography>
              <Box component="form" noValidate onSubmit={handleInvoiceSubmit} sx={{ mt: 3 }}>
              {/* <Box component="form" noValidate onSubmit={handleClose} sx={{ mt: 3 }}> */}
                <Grid container spacing={2}>
                  <Grid container item spacing={2} xs={12} sm={12}>
                    <Grid item xs={12} sm={6}>
                      <ProcedureType onChangeProcedureType={handleProcedureTypeChange} />
                      {/* procedureType now: {procedureTypeId} */}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <ProcedureList procedureTypeId={procedureTypeId} onChangeProcedure={handleProcedureChange} />
                      {/* procedure now: {procedureId} */}
                    </Grid>
                    <Grid item container spacing={2} xs={12} sm={12}>
                      <Grid item xs={3} sm={3}>&nbsp;</Grid>
                      <Grid item xs={3} sm={3}>
                        <TextField
                          required
                          fullWidth
                          id="quantity"
                          name="quantity"
                          label="Quantity"
                          type="number"
                        />
                      </Grid>
                      <Grid item xs={3} sm={3}>
                        <TextField
                          required
                          fullWidth
                          id="cost"
                          name="cost"
                          label="Cost per unit"
                          type="number"
                        />
                      </Grid>  
                      <Grid item xs={3} sm={3}>&nbsp;</Grid>                      
                    </Grid>
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
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Save invoice
                </Button>
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>

      {/* ***loyalty info user*** */}
      <Modal
        open={loyaltyOpen}
        onClose={handleLoyaltyClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="login-modal">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
              <Typography component="h1" variant="h5">
                Loyalty program
              </Typography>
              <Box sx={{ mt: 3 }}>
                <Grid container item spacing={2} xs={12} sm={12}>
                  <Grid item xs={12} sm={12} justifyContent='center'>
                    <Box sx={{ borderTop: 1, borderBottom: 1, borderColor: 'divider', mt: 0, mb: 2 }}>
                      <Typography component="h3" variant="h5" sx={{ mt: 2, mb: 2 }}>{user.firstname} {user.lastname}</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={7}>
                    <Typography>{'By Procedures: '}<strong>2300</strong>{' points'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={5}>
                    <Typography>{'By Referals: '}<strong>7800</strong> {'points'}</Typography>
                    <Typography>{'(Count of referals: '}<strong>3</strong>{')'}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <Typography component="h3" variant="h5">{'Total: '}<strong>10 100</strong>{' points'}</Typography>
                  </Grid>
                </Grid>
                <Button type="button"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 5, mb: 2 }}
                  onClick = {()=>setLoyaltyOpen(false)}
                >
                  Ok
                </Button>
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>
    </>
  );
}
