import React, { useState, useEffect, useCallback, useContext } from "react"
// material
import {
  Card,
  Table,
  Stack,
  Box,
  Checkbox,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Modal
} from '@mui/material'

import { AuthContext } from "../context/AuthContext"
import { useHttp } from "../hooks/http.hook"
import { API_URL, MONTH } from "../config"
import humanDate from "./HumanDate"
import ProcedureNote from "./ProcedureNote"


export default function Booking({ clientId, client, mode }){
  const {token} = useContext(AuthContext)
  const {loading, request} = useHttp()
  // Table
  const TABLE_HEAD = [
    { id: 'procedure',  label: 'Procedure', alignRight: false },
    { id: 'date',       label: 'Date',      alignRight: true },
    { id: 'time',       label: 'Time',      alignRight: true },
    { id: 'doctor',     label: 'Doctor',    alignRight: false },
    { id: 'status',     label: 'Status',    alignRight: false },
    // { id: '' },
  ];
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [procedure, setProcedure] = useState({})
  const [openProcedureNote, setOpenProcedureNote] = useState(false)

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const [bookingList, setBookingList] = useState([
    // {id:0, procedure:'procedure',  date:'11/11/2023', time:'11:00', doctor:'Nural',   status:'booked'},
    // {id:1, procedure:'procedure1', date:'11/11/2023', time:'12:00', doctor:'Ivanna',  status:'booked'}
  ])

  const getBooking = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/procedures/${clientId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('Booking:', res);
      setBookingList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(()=>{
    if(clientId) getBooking()
  }, [])

  const fullDate = (pDate) => {
    const d = new Date(pDate)
    return d.getDate() + ' ' + MONTH[Number(d.getMonth())] + ' ' + d.getFullYear()
  }

  const handleSelectProcedure = (data) => {
    // console.log('handleSelectProcedure:', data);
    const d = new Date(data.date),
              t = data.time.split(':'),
              start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), t[0], t[1]),
              end = new Date(Date.parse(start) + data.duration * 60000)
    setProcedure({
      'id'              : data.id,
      'timetable_id'    : data.id,
      'is_invoiced'     : data.is_invoiced,
      'title'           : data.procedure, 
      'client_id'       : clientId,
      'client_firstname': client.client_firstname,
      'client_lastname' : client.client_lastname,
      'doctor_id'       : data.doctor_id,
      'doctor_firstname': data.doctor_firstname,
      'doctor_lastname' : data.doctor_lastname,
      'procedure_id'    : data.procedure_id,
      'start'           : start,
      'end'             : end,
    })
    console.log('popup procedure:', procedure)
    setOpenProcedureNote(true)
  }

  const handleClose = () => {
    setOpenProcedureNote(false);
  }

  return(
    <>
      {/* Event window for Invoicing*/}
      <Modal
        open={openProcedureNote}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters style={{ maxHeight:"85vh" }}>
          <ProcedureNote procedure={procedure} onSave={handleClose} />
        </Container>
      </Modal>
      <Card>
        {/* {'Bookings'} */}
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((headCell, index) => (
                  <TableCell
                    key={ 'tablehead_' + index }
                    align={headCell.alignRight ? 'right' : 'left'}
                    // sortDirection={orderBy === headCell.id ? order : false}
                  >
                    {headCell.label}
                    {/* <TableSortLabel
                      hideSortIcon
                      active={orderBy === headCell.id}
                      direction={orderBy === headCell.id ? order : 'asc'}
                      onClick={createSortHandler(headCell.id)}
                    >
                      {headCell.label}
                      {orderBy === headCell.id ? (
                        <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
                      ) : null}
                    </TableSortLabel> */}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {bookingList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, index) => {
                const { id, procedure, date, time, doctor_fname, doctor_lname, is_invoiced, is_paid } = row;
                // console.log('row >>>', row);
                return (
                  <>
                    {is_invoiced === mode && <TableRow
                      hover
                      key = { 'booklist' + index }
                      // tabIndex={-1}
                      // role="checkbox"
                      // selected={isItemSelected}
                      // aria-checked={isItemSelected}
                      // style={{ cursor:"pointer" }}
                    >
                      {/* <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} />
                      </TableCell> */}
                      <TableCell component="th" scope="row" onClick={() => {handleSelectProcedure(row)}} sx={{ cursor:"pointer"}}>
                        <Typography variant="subtitle2" noWrap>{procedure}</Typography>
                      </TableCell>
                      <TableCell align="right" onClick={() => {handleSelectProcedure(row)}} sx={{ cursor:"pointer"}}>{fullDate(date)}</TableCell>
                      <TableCell align="right" onClick={() => {handleSelectProcedure(row)}} sx={{ cursor:"pointer"}}>{time}</TableCell>
                      <TableCell align="left" onClick={() => {handleSelectProcedure(row)}} sx={{ cursor:"pointer"}}>{doctor_fname + ' ' + doctor_lname}</TableCell>
                      <TableCell align="left">{is_invoiced ? (is_paid ? 'paid' : 'waiting for payment') : 'waiting for visit'}</TableCell>
                      {/* <TableCell align="right">
                        <UserMoreMenu id={id} user={row} roleList={roleList} onChange={handleUpdate} />
                      </TableCell> */}
                    </TableRow>}
                  </>
                );
              })}
              {/* {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={6} />
                </TableRow>
              )} */}
            </TableBody>

            {/* {isUserNotFound && (
              <TableBody>
                <TableRow>
                  <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                    <SearchNotFound searchQuery={filterName} />
                  </TableCell>
                </TableRow>
              </TableBody>
            )} */}
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={bookingList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </>
  )
}