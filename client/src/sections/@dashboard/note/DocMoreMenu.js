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
import { Navigate, useNavigate } from 'react-router-dom';
// ----------------------------------------------------------------------

export default function DocMoreMenu({id, row}) {
  // console.log('DocMoreMenu:', id, row)
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const jwt = localStorage.getItem("jwt")
  const navigate = useNavigate()
 
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
      // onChange(true)
    } catch (e) { console.log('error:', e)}
  }

  const humanDate = (ts) => {
    const date = new Date(ts)
    if(date && date !== '') return date.getDate() + '/' + (Number(date.getMonth())+1) + '/' + date.getFullYear()
    return '__/__/____'
  }

  const handlePrint = async (event) => {
    event.preventDefault()
    let date=humanDate(row.ts), doctor = row.doctor_firstname + ' '+ row.doctor_lastname, procedure = row.procedure, amount = row.invoice.amount, cost = row.invoice.cost
    navigate(`/admin/client/invoice/`);
  }

  const [open, setOpen] = useState(false)

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
        <MenuItem sx={{ color: 'text.secondary' }} onClick={handlePrint}>
          <ListItemIcon>
            <Iconify icon="eva:printer-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Preview" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>

        <MenuItem sx={{ color: 'text.secondary' }} onClick={handleDelete}>
          <ListItemIcon>
            <Iconify icon="eva:trash-2-outline" width={24} height={24} />
          </ListItemIcon>
          <ListItemText primary="Delete" primaryTypographyProps={{ variant: 'body2' }} />
        </MenuItem>
      </Menu>
      {/* edit note */}
    </>
  );
}
