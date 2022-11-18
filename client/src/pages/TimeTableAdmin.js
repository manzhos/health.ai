import React, { useState, useEffect, useCallback } from 'react'
// import { Link as RouterLink } from 'react-router-dom'
// material
import {
  Card,
  Table,
  Box,
  // Grid,
  Stack,
  // Avatar,
  // Button,
  // FormControl,
  // Select,
  // MenuItem,
  // InputLabel,
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
import { filter } from 'lodash';
// components
import Page from '../components/Page'
// import Iconify from '../components/Iconify'
import Scrollbar from '../components/Scrollbar'
import { ProcedureListHead, ProcedureListToolbar } from '../sections/@dashboard/procedure'
import SearchNotFound from '../components/SearchNotFound';
import { useHttp } from '../hooks/http.hook'
import {API_URL, URL, MONTH} from '../config'
// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'procedure', label: 'Procedure', alignRight: false },
  { id: 'doctor', label: 'Doctor', alignRight: false },
  { id: 'client', label: 'Client', alignRight: false },
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'time', label: 'Time', alignRight: false },
  { id: 'duration', label: 'Duration', alignRight: false },
  { id: 'cost', label: 'Cost, €', alignRight: false }, // eur in html - &#8364;
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
    return filter(array, (_user) => _user.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function TimeTable(){
  const {request} = useHttp()
  const jwt = localStorage.getItem("jwt")
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [procedureList, setProcedureList] = useState([])
  const [filterProcedure, setFilterProcedure] = useState('')

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

  const filteredProcedures = applySortFilter(procedureList, getComparator(order, orderBy), filterProcedure)

  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/procedures_inf`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      // console.log('procedures:', res)
      setProcedureList(res)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  
  useEffect(() => {getProcedures()}, [getProcedures])

  const handleClick = (event, procedure) => {
    const selectedIndex = selected.indexOf(procedure);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, procedure);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  }

  const handleFilterByProcedure = (event) => {
    setFilterProcedure(event.target.value)
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage)
  }
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - procedureList.length) : 0
  const isProcedureNotFound = filteredProcedures.length === 0

  const humanDuration = (d) => {
    let hh = Math.trunc(d / 60)
    let mm = hh > 0 ? d % 60 : d
    return hh > 0 ? hh + 'h ' + ( mm ? mm + 'm' : '00m') : mm ? mm + 'm' : ''
  }
  const humanDate = (d) => {
    d = new Date(d)
    return d.getDate() + ' ' + MONTH[Number(d.getMonth())] + ' ' + d.getFullYear()
  }
  const [open, setOpen] = useState(false)
  // const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  return(
    <Page title="Booking">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Time Table
          </Typography>
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
                    marginTop: 3,
                    marginBottom: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                  }}
                >
                  <Typography component="h1" variant="h5">
                    Special promo
                  </Typography>
                  <Box
                    sx={{
                      marginTop: 2,
                      marginBottom: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                    }}
                  >
                    <img src={`${URL}static/stunning-you-non-botox-02.jpg`} style={{width:"400px"}} />
                  </Box>
                  <Box>
                    <Typography component="h1" variant="h5">
                      You can have {7 - procedureList.length} more treatments and get a 10% discount.
                    </Typography>
                  </Box>
                </Box>
              </div>
            </Container>
          </Modal>
        </Stack>
        <Card>
            <ProcedureListToolbar numSelected={selected.length} filterProcedure={filterProcedure} onFilterProcedure={handleFilterByProcedure} />
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <ProcedureListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={procedureList.length}
                    // numSelected={selected.length}
                    // onRequestSort={handleRequestSort}
                    // onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredProcedures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, procedure_id, procedure, proceduretype_id, proceduretype, date, time, duration, cost, doctor_id, doctor_firstname, doctor_lastname, client_id, client_firstname, client_lastname } = row;
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
                          <TableCell align="left">{sentenceCase(doctor_firstname)}&nbsp;{sentenceCase(doctor_lastname)}</TableCell>
                          <TableCell align="left">{sentenceCase(client_firstname)}&nbsp;{sentenceCase(client_lastname)}</TableCell>
                          <TableCell align="left">{humanDate(date)}</TableCell>
                          <TableCell align="left">{time}</TableCell>
                          <TableCell align="left">{humanDuration(duration)}</TableCell>
                          <TableCell align="left">{cost}</TableCell>
                          {/* <TableCell align="left">{id}</TableCell> */}
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
          </Card>
      </Container>
    </Page>
  )
}