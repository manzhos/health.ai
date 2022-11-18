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

export default function UserMoreMenu({id, user, roleList, onChange}) {
  // console.log('User:', user)
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState(user.usertype_id)
  const jwt = localStorage.getItem("jwt")
  const {request} = useHttp()
  const [newAvatar, setNewAvatar] = useState()
  const [avatarURL, setAvatarURL] = useState();

  const handleDelete = async (event) => {
    event.preventDefault()
    // console.log(`deleting user #${id}`)
    try {
      const res = await request(`${API_URL}api/user/${id}`, 'patch', null, {
        Authorization: `Bearer ${jwt}`
      })
      // console.log(res)
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    // console.log(`saving user #${id}`)
    const data = new FormData(event.currentTarget)
    try {
      const formData = new FormData()
      formData.append('firstname', data.get('firstName'))
      formData.append('lastname',   data.get('lastName'))
      formData.append('email',      data.get('email'))
      formData.append('password',   data.get('password'))
      formData.append('usertype_id',data.get('usertype_id'))
      formData.append('promo',      data.get('allowExtraEmails'))
      formData.append('avatar',     data.get('avatar'))

      const res = await fetch(`${API_URL}api/user/${id}`, {
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
  const handleChangeRole = (event) => {
    event.preventDefault();
    setRole(event.target.value)
    // console.log('role now:', role)
  }

  const avatar = () => {
    // console.log('user:', user)
    if(user.avatar) return API_URL + 'avatars/' + user.avatar
    return API_URL + 'blank-avatar.svg'
  }
  const onAvatarChange = (e) => {
    // console.log('E:', e)
    setNewAvatar(e.target.files[0]);
    // console.log('new avatar:', newAvatar);
  } 
  useEffect(()=>{
    if(!newAvatar) return
    setAvatarURL(URL.createObjectURL(newAvatar))
  }, [newAvatar]) 

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
      {/* edit user */}
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
    </>
  );
}
