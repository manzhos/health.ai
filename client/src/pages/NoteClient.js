import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
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
  Typography,
  TextField,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
  MenuItem,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
import Page from '../components/Page';
// import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { NoteListHead, NoteListToolbar, NoteMoreMenu } from '../sections/@dashboard/note';
import { Loader } from '../components/Loader';
import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import {API_URL} from '../config'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'title', label: 'Subject', alignRight: false },
  { id: 'note', label: 'Note', alignRight: false },
  { id: 'procedure_id', label: 'Procedure', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function applySortFilter(array, comparator, query) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if (query) {
    return filter(array, (_note) => _note.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function NoteClient({clientId}) {
  const {token} = useContext(AuthContext)
  const jwt = localStorage.getItem("jwt")
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

  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [filterNote, setFilterNote] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [noteList, setNoteList] = useState([])
  // const [client, setClient] = useState()
  // const [clientList, setClientList] = useState([])
  const [doctor, setDoctor] = useState(userId)
  const [doctorList, setDoctorList] = useState([])
  const [procedure, setProcedure] = useState({})
  const [procedureList, setProcedureList] = useState([])
  const {loading, request} = useHttp()
  const navigate  = useNavigate()

  
  // get clients
  // const getClients = useCallback(async () => {
  //   try {
  //     const res = await request(`${API_URL}api/clients`, 'GET', null, {
  //       Authorization: `Bearer ${jwt}`
  //     })
  //     setClientList(res)
  //   } catch (e) { console.log('error:', e)}
  // }, [jwt, request])
  // useEffect(() => {getClients()}, [getClients])

  // get doctors
  const getDoctors = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/doctors`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      setDoctorList(res)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getDoctors()}, [getDoctors])

  // get procedures
  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/procedures`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      setProcedureList(res);
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getProcedures()}, [getProcedures])  

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };
  
  const getNotes = useCallback(async () => {
    try {
      const notes = await request(`${API_URL}api/note_client/${clientId}`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      setNoteList(notes)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getNotes()}, [getNotes])  

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = noteList.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([]);
  };

  const handleClick = (event, name) => {
    const selectedIndex = selected.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByNote = (event) => {
    setFilterNote(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if(data.get('note')){
      try {
        const formData = new FormData()
        formData.append('note',         data.get('note'))
        formData.append('client_id',    data.get('client_id'))
        formData.append('doctor_id',    data.get('doctor_id'))
        formData.append('procedure_id', data.get('procedure_id'))
        formData.append('notetype_id',  data.get('notetype_id'))

        const res = await fetch(`${API_URL}api/note`, {
          method: 'POST', 
          body: formData,
        })
        setOpen(false)
        handleUpdate()
        navigate('/doctor/note')
      } catch (e) {console.log('error:', e)} 
    } else alert('Need to check the filled information.')
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - noteList.length) : 0

  const filteredNotes = applySortFilter(noteList, getComparator(order, orderBy), filterNote)

  const isNoteNotFound = filteredNotes.length === 0

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleUpdate = (update) => {
    getNotes()    
  }

  // const handleChangeClient = (event) => {
  //   event.preventDefault();
  //   setClient(event.target.value)
  // }  
  const handleChangeDoctor = (event) => {
    event.preventDefault();
    setDoctor(event.target.value)
  }  
  const handleChangeProcedure = (event) => {
    event.preventDefault();
    setProcedure(event.target.value)
  } 
  
  const getNote = (event, id, doctor_firstname, doctor_lastname, procedure) => {
    event.preventDefault()
    // console.log('get Note:', id)
    navigate(`/doctor/user/note/${id}?doctor_firstname=${doctor_firstname}&doctor_lastname=${doctor_lastname}&procedure=${procedure}`)
  }

  if (loading) return <Loader/>
  else {
    return (
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom> </Typography>
          <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Note
          </Button>
          {/* add new note */}
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
                    New note
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
                      <Grid item xs={12} sm={4}>
                        {/* <FormControl sx={{ width: 1 }}>
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
                        </FormControl> */}
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
                      Save note
                    </Button>
                  </Box>
                </Box>
              </div>
            </Container>
          </Modal>
        </Stack>

        {/* <NoteListToolbar numSelected={selected.length} filterNote={filterNote} onFilterNote={handleFilterByNote} /> */}

        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <NoteListHead
                order={order}
                orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={noteList.length}
                numSelected={selected.length}
                onRequestSort={handleRequestSort}
                onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {filteredNotes.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const { id, title, note, client_id, client_firstname, client_lastname, doctor_id, doctor_firstname, doctor_lastname, procedure_id, procedure } = row;
                  const isItemSelected = selected.indexOf(note) !== -1;

                  return (
                    <TableRow
                      hover
                      key={id}
                      tabIndex={-1}
                      role="checkbox"
                      selected={isItemSelected}
                      aria-checked={isItemSelected}
                    >
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, note)} />
                      </TableCell>
                      {/* <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {title}
                          </Typography>
                        </Stack>
                      </TableCell> */}
                      <TableCell align="left" onClick={(event) => getNote(event, id, doctor_firstname, doctor_lastname, procedure)}>{sentenceCase(title)}</TableCell>
                      <TableCell align="left" onClick={(event) => getNote(event, id, doctor_firstname, doctor_lastname, procedure)}>{note}</TableCell>
                      <TableCell align="left">{sentenceCase(client_firstname)}&nbsp;{sentenceCase(client_lastname)}</TableCell>
                      <TableCell align="left">{sentenceCase(doctor_firstname)}&nbsp;{sentenceCase(doctor_lastname)}</TableCell>
                      <TableCell align="left">{procedure}</TableCell>
                      {/* <TableCell align="right">
                        <NoteMoreMenu id={id} note={row} procedureList={procedureList} clientList={clientList} doctorList={doctorList} onChange={handleUpdate} />
                      </TableCell> */}
                    </TableRow>
                  );
                })}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 53 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>

              {isNoteNotFound && (
                <TableBody>
                  <TableRow>
                    <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                      <SearchNotFound searchQuery={filterNote} />
                    </TableCell>
                  </TableRow>
                </TableBody>
              )}
            </Table>
          </TableContainer>
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={noteList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Container>
    )
  }
}
