import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { Link as RouterLink } from 'react-router-dom'
// material 
import {
  Card,
  Table,
  Box,
  Grid,
  Stack,
  // Avatar,
  Button,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Modal,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material'
import { sentenceCase } from 'change-case'
import { filter } from 'lodash'
// components
import Page from '../components/Page'
import Iconify from '../components/Iconify'
import Scrollbar from '../components/Scrollbar'
import { ProcedureListHead, ProcedureListToolbar } from '../sections/@dashboard/procedure'
import SearchNotFound from '../components/SearchNotFound'
import { useHttp } from '../hooks/http.hook'
import Note from './Note'
import {API_URL, URL, MONTH} from '../config'
// scheduler
import format from 'date-fns/format'
import getDay from 'date-fns/getDay'
import parse from 'date-fns/parse'
import startOfWeek from 'date-fns/startOfWeek'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
// import DatePicker from 'react-datepicker'
// import 'react-datepicker/dist/react-datepicker.css'
// ----------------------------------------------------------------------
// const TABLE_HEAD = [
//   { id: 'procedure', label: 'Procedure', alignRight: false },
//   { id: 'date', label: 'Date', alignRight: false },
//   { id: 'time', label: 'Time', alignRight: false },
//   { id: 'duration', label: 'Duration', alignRight: false },
//   { id: 'cost', label: 'Cost, €', alignRight: false }, // eur in html - &#8364;
// ];
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
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

// scheduler
const locales = {
  "en-US": require("date-fns/locale/en-US"),
}
const localizer = dateFnsLocalizer({
    format,
    parse,
    startOfWeek,
    getDay,
    locales,
})


export default function TimeTable(){
  const {request} = useHttp()
  const jwt = localStorage.getItem("jwt")
  function parseJwt (token) {
    if(token && token !== ''){
      var base64Url = token.split('.')[1]
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    }
  };
  const pJWT = parseJwt(jwt)
  const userId = pJWT ? pJWT.userId : null
  // console.log('UserId:', userId)

  const [procedureList, setProcedureList] = useState([])
  const [procedure, setProcedure] = useState({})
  // const [rowsPerPage, setRowsPerPage] = useState(5)
  // const [order, setOrder] = useState('asc')
  // const [selected, setSelected] = useState([])
  // const [orderBy, setOrderBy] = useState('name')
  // const [filterProcedure, setFilterProcedure] = useState('')

  // const filteredProcedures = applySortFilter(procedureList, getComparator(order, orderBy), filterProcedure)

  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/doc_procedures/${userId}`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      console.log('procedures:', res)
      let procedures = res.map((el) => {
        const d = new Date(el.date),
              t = el.time.split(':'),
              start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), t[0], t[1]),
              end = new Date(Date.parse(start) + el.duration * 60000)
        return {
          'id'              : el.id,
          'title'           : el.procedure, 
          'client_id'       : el.client_id,
          'client_firstname': el.client_firstname,
          'client_lastname' : el.client_lastname,
          'doctor_id'       : el.doctor_id,
          'procedure_id'    : el.procedure_id,
          'start'           : start,
          'end'             : end,
        }
      })
      console.log('p:', procedures)
      setProcedureList(procedures)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getProcedures()}, [getProcedures])

  // const handleClick = (event, procedure) => {
  //   const selectedIndex = selected.indexOf(procedure);
  //   let newSelected = [];
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, procedure);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  //   }
  //   setSelected(newSelected);
  // }

  // const handleFilterByProcedure = (event) => {
  //   setFilterProcedure(event.target.value)
  // }

  // const handleChangePage = (event, newPage) => {
  //   setPage(newPage)
  // }
  // const handleChangeRowsPerPage = (event) => {
  //   setRowsPerPage(parseInt(event.target.value, 10))
  //   setPage(0)
  // }

  // const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - procedureList.length) : 0
  // const isProcedureNotFound = filteredProcedures.length === 0

  // const humanDuration = (d) => {
  //   let hh = Math.trunc(d / 60)
  //   let mm = hh > 0 ? d % 60 : d
  //   return hh > 0 ? hh + 'h ' + ( mm ? mm + 'm' : '00m') : mm ? mm + 'm' : ''
  // }
  const humanDate = (d) => {
    d = new Date(d)
    return d.getDate() + ' ' + MONTH[Number(d.getMonth())] + ' ' + d.getFullYear() + ' ' + d.getHours() + ':' + (d.getMinutes() == '0' ? '00' : d.getMinutes())
  }
  const [open, setOpen] = useState(false)
  // const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)


  // SCEDULER =====================================
  // const [newProcedure, setNewProcedure] = useState({ title: "", start: "", end: "" })
  // const [allEvents, setAllEvents] = useState(events)

  // function handleAddEvent() {
  //   for (let i=0; i<allEvents.length; i++){
  //     const d1 = new Date (allEvents[i].start);
  //     const d2 = new Date(newEvent.start);
  //     const d3 = new Date(allEvents[i].end);
  //     const d4 = new Date(newEvent.end);
  //     /*
  //     console.log(d1 <= d2);
  //     console.log(d2 <= d3);
  //     console.log(d1 <= d4);
  //     console.log(d4 <= d3);
  //     */
  //     if (( (d1  <= d2) && (d2 <= d3) ) || ( (d1  <= d4) && (d4 <= d3) )) {   
  //       alert("CLASH"); 
  //       break;
  //     }
  //   }
    
  //   setAllEvents([...allEvents, newEvent]);
  // }

  const handleSelectSlot = useCallback(
    ({ start, end }) => {
      const title = window.prompt('New Procedure')
      if (title) {
        setProcedureList((prev) => [...prev, { start, end, title }])
      }
    },
    [setProcedureList]
  )

  const handleSelectProcedure = (event) => {
    // console.log(event)
    setProcedure({
      'id'              : event.id,
      'title'           : event.title, 
      'client_id'       : event.client_id,
      'client_firstname': event.client_firstname,
      'client_lastname' : event.client_lastname,
      'doctor_id'       : event.doctor_id,
      'procedure_id'    : event.procedure_id,
      'start'           : event.start,
      'end'             : event.end,
    })
    // console.log('popup procedure:', procedure)
    setOpen(true)
  }

  // const handleSelectProcedure = useCallback(
  //   (event) => {
  //     console.log(event)
  //     window.alert(event.title)
  //   },
  //   []
  // )

  const { defaultDate, scrollToTime } = useMemo(
    () => ({
      defaultDate: new Date(),
      scrollToTime: new Date(),
    }),
    []
  )


  return(
    <Page title="Booking">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="h4" gutterBottom>
            Time Table
          </Typography>
        </Stack>
        {/* <Card>
            <ProcedureListToolbar numSelected={selected.length} filterProcedure={filterProcedure} onFilterProcedure={handleFilterByProcedure} />
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <ProcedureListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={procedureList.length}
                  />
                  <TableBody>
                    {filteredProcedures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, procedure, date, time, duration, cost } = row;
                      const isItemSelected = selected.indexOf(procedure) !== -1;
  
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
                            <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, procedure)} />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="center" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {sentenceCase(procedure)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{humanDate(date)}</TableCell>
                          <TableCell align="left">{time}</TableCell>
                          <TableCell align="left">{humanDuration(duration)}</TableCell>
                          <TableCell align="left">{cost}</TableCell>
                        </TableRow>
                      );
                    })}
                    {emptyRows > 0 && (
                      <TableRow style={{ height: 53 * emptyRows }}>
                        <TableCell colSpan={6} />
                      </TableRow>
                    )}
                  </TableBody>
  
                  {isProcedureNotFound && (
                    <TableBody>
                      <TableRow>
                        <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                          <SearchNotFound searchQuery={filterProcedure} />
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
              count={procedureList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Card> */}
        {/* Edit Event window */}
        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Container component="main" maxWidth="md" disableGutters>
            <div className="modal-tt">
              <Box  sx={{ margin: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Grid container>
                  <Grid item xs={12} sm={3}>
                    <Box className='tt_title'> 
                      Procedure:<br /><strong>{procedure.title}</strong> <br /> <br /> 
                      Patient:<br /><strong>{procedure.client_firstname}&nbsp;{procedure.client_lastname}</strong> <br /> <br /> 
                      Start:<br /><strong>{humanDate(procedure.start)}</strong>&nbsp;&nbsp;&nbsp;&nbsp; <br /> 
                      End:<br /><strong>{humanDate(procedure.end)}</strong>
                    </Box>            
                  </Grid>
                  {/* <Grid item xs={12} sm={1}></Grid> */}
                  <Grid item xs={12} sm={9}>
                    {/* <Typography variant="h6" gutterBottom>Notes</Typography>     */}
                    <Note />        
                  </Grid>
                </Grid>
              </Box>
            </div>
          </Container>
        </Modal>
        <Card>
          {/* ========= SCEDULER ========= */}
          {/* <div> */}
              {/* <input type="text" placeholder="Add Title" style={{ width: "20%", marginRight: "10px" }} value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} /> */}
              {/* <DatePicker placeholderText="Start Date" style={{ marginRight: "10px" }} selected={newEvent.start} onChange={(start) => setNewEvent({ ...newEvent, start })} />
              <DatePicker placeholderText="End Date" selected={newEvent.end} onChange={(end) => setNewEvent({ ...newEvent, end })} /> */}
              {/* <button stlye={{ marginTop: "10px" }} onClick={handleAddEvent}>Add Event</button> */}
          {/* </div> */}
          <Calendar 
            localizer={localizer} 
            events={procedureList} 
            startAccessor="start" 
            endAccessor="end" 
            defaultDate={defaultDate}
            // defaultView={Views.WEEK}
            onSelectEvent={handleSelectProcedure}
            onSelectSlot={handleSelectSlot}
            selectable
            scrollToTime={scrollToTime}
            style={{ height: 500, margin: "10px" }} 
          />
        </Card>
      </Container>
    </Page>
  )
}