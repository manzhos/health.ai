import { useRef, useState } from 'react'
// material
import { 
  Grid,
  Button,
  Box,
  Modal,
  Container,
  Typography,
  Menu, 
  MenuItem, 
  IconButton, 
  ListItemIcon, 
  ListItemText,
  TextField,
  InputLabel,
  Select,
  FormControl,  
 } from '@mui/material'
// component
import Iconify from '../../../components/Iconify'
import { useHttp } from '../../../hooks/http.hook'
import { API_URL } from '../../../config'
// ----------------------------------------------------------------------

export default function MailMoreMenu({id, client, onChange}) {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const jwt = localStorage.getItem("jwt")  
  const {request} = useHttp()

  console.log('client:', client);
  
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log(`saving procedure #${id}`)
    // const data = new FormData(event.currentTarget)
    // console.log('data:\n', 
    //   '\n', data.get('procedure'),
    //   '\n', data.get('duration'),
    //   '\n', data.get('cost'),
    //   '\n', data.get('proceduretype_id')
    // )
    // try {
    //   const formData = new FormData()
    //   formData.append('procedure',        data.get('procedure'))
    //   formData.append('duration',         data.get('duration'))
    //   formData.append('cost',             data.get('cost'))
    //   formData.append('proceduretype_id', data.get('proceduretype_id'))

    //   const res = await fetch(`${API_URL}api/procedure/${id}`, {
    //     method: 'PATCH', 
    //     body: formData,
    //   })
    //   setOpen(false)
    //   onChange(true)
    // } catch (e) {console.log('error:', e)} 
  }

  const handleDelete = async (event) => {
    event.preventDefault()
    console.log(`deleting mail #${id}`)
    // try {
    //   const res = await request(`${API_URL}api/procedure/${id}`, 'delete', null, {
    //     Authorization: `Bearer ${jwt}`
    //   })
    //   // console.log(res)
    //   setOpen(false)
    //   onChange(true)
    // } catch (e) { console.log('error:', e)}
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
      {/* read mail */}
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
                Make the offer
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, mb: 0 }}>&nbsp;</Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    Client: {client.client}
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    Email: sindy@mail.io
                  </Grid>
                  
                  {/* <Grid item xs={12} sm={12}>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 1, mb: 0 }}>&nbsp;</Box>
                  </Grid> */}

                  <Grid container item sx={{ mt: 3 }}>
                    <Grid item xs={12} sm={6}>
                      Procedure: {client.procedure}
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      Last procedure: {client.info.botoxWhen}<br />
                      Used drug: {client.info.botoxWhat}<br /> 
                    </Grid>
                  </Grid>

                  <Grid item xs={12} sm={12} sx={{ mt: 3, mb:3 }}>
                    <TextField name="note" fullWidth multiline rows={4} id="note" label="Recomendation from doctor" className='cons-input' />
                  </Grid>
                </Grid>
                <Grid item xs={12} sm={12} style={{textAlign:"center"}}>
                  <Button type="submit" variant="contained" sx={{ mt: 3, mb: 2 }}>
                    Send the offer
                  </Button>
                </Grid>
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>
    </>
  );
}
