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

export default function ProcedureMoreMenu({id, procedure, procedureTypeList, onChange}) {
  const ref = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const jwt = localStorage.getItem("jwt")  
  const {request} = useHttp()
  
  const [procedureType, setProcedureType] = useState(procedure.proceduretype_id)
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const handleChangeProcedureType = (event) => {
    event.preventDefault();
    setProcedureType(event.target.value)
  }
  
  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log(`saving procedure #${id}`)
    const data = new FormData(event.currentTarget)
    console.log('data:\n', 
      '\n', data.get('procedure'),
      '\n', data.get('duration'),
      '\n', data.get('cost'),
      '\n', data.get('proceduretype_id')
    )
    try {
      const formData = new FormData()
      formData.append('procedure',        data.get('procedure'))
      formData.append('duration',         data.get('duration'))
      formData.append('cost',             data.get('cost'))
      formData.append('proceduretype_id', data.get('proceduretype_id'))

      const res = await fetch(`${API_URL}api/procedure/${id}`, {
        method: 'PATCH', 
        body: formData,
      })
      setOpen(false)
      onChange(true)
    } catch (e) {console.log('error:', e)} 
  }

  const handleDelete = async (event) => {
    event.preventDefault()
    // console.log(`deleting procedure #${id}`)
    try {
      const res = await request(`${API_URL}api/procedure/${id}`, 'delete', null, {
        Authorization: `Bearer ${jwt}`
      })
      // console.log(res)
      setOpen(false)
      onChange(true)
    } catch (e) { console.log('error:', e)}
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
      {/* edit procedure */}
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
                Edit procedure
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      name="procedure"
                      required
                      fullWidth
                      id="procedure"
                      label="Procedure"
                      autoFocus
                      defaultValue={procedure.procedure}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      id="duration"
                      label="How much time is needed? (In minutes)"
                      name="duration"
                      defaultValue={procedure.duration}
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="cost"
                      label="Cost (&#8364;)"
                      name="cost"
                      defaultValue={procedure.cost}
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
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
                            <MenuItem key={item.id} value={item.id}>{item.proceduretype}</MenuItem>
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
