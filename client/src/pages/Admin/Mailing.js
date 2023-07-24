import React, { useState, useCallback, useEffect, useContext } from "react";
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
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
  RadioGroup,
  Radio,
  FormControlLabel,
  MenuItem,
  TableContainer,
  TablePagination,
} from '@mui/material';
import Page from '../../components/Page';
import Iconify from '../../components/Iconify';
import SearchNotFound from '../../components/SearchNotFound';
import { MailListHead, MailListToolbar, MailMoreMenu } from '../../sections/@dashboard/mail';
import humanDate from "../../components/HumanDate";
import CalendarOutside from '../../components/CalendarOutside'

import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook';
import { AuthContext } from '../../context/AuthContext';
import {API_URL} from '../../config'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'subject',    label: 'Subject',         alignRight: false },
  { id: 'type',       label: 'Type',            alignRight: false },
  { id: 'sendstate',  label: 'Status',          alignRight: false },
  { id: 'senddate',   label: 'Send date/time',  alignRight: false },
  { id: 'ts',         label: 'Created',         alignRight: false },
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
  if(query) {
    return filter(array, (_mail) => (_mail.subject.toLowerCase().indexOf(query.toLowerCase()) !== -1));
  }
  return stabilizedThis.map((el) => el[0]);
}


export default function Mailing() {
  const {token} = useContext(AuthContext);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [order, setOrder] = useState('asc');
  const [selected, setSelected] = useState([]);
  const [orderBy, setOrderBy] = useState('ts');
  const [filterName, setFilterName] = useState('');
  const [mailList, setMailList] = useState([]);
  const [date, setDate] = useState(new Date());
  const [time, setTime] = useState('00:00');

  const {loading, request} = useHttp();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  }

  const getMail = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/mail`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setMailList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getMail()}, [getMail])
  
  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = mailList.map((n) => n.name)
      setSelected(newSelecteds)
      return
    }
    setSelected([]);
  }

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
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  }

  const handleFilterByName = (filterString) => {
    setFilterName(filterString);
  }

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - mailList.length) : 0

  const filteredMails = applySortFilter(mailList, getComparator(order, orderBy), filterName)

  const isMailNotFound = filteredMails.length === 0

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleUpdate = (update) => {
    getMail();
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
    formData.append('date',     date)
    formData.append('time',     time)
    formData.append('adressee', adressee)
    console.log('formData:', date);

    await fetch(`${API_URL}api/newmail`, {
      method: 'POST', 
      body: formData,
    })
    setOpen(false);
    getMail();
  } catch (e) { console.log('error:', e)}
}

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

  const handleDateChange = (dateValue) => {
    // console.log('dateValue', dateValue);
    setDate(dateValue);
  }

  // if (loading) return <Loader/>
  // else {
    return (
      <Page title="Mail">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Mails
            </Typography>
            <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
              New Mail
            </Button>
            {/* add new mail */}
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
                            // defaultValue={mail.subject}
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
                            // defaultValue={mail.body}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            required
                            fullWidth
                            id="type"
                            label="Type"
                            name="type"
                            // defaultValue={mail.type}
                          />
                        </Grid>
                        <Grid item xs={1}>
                          &nbsp;
                        </Grid>
                        <Grid item xs={5}>
                          <Grid container spacing={2}>
                            <Grid item xs={6} sm={6}>
                              <CalendarOutside onDateChange={handleDateChange}/>
                            </Grid>
                            <Grid item xs={6} sm={6}>
                              <TextField
                                fullWidth
                                name="time"
                                label="Set time"
                                id="senddate"
                                defaultValue={time}
                                onChange = {(e) => {
                                  setTime(e.target.value); 
                                  const re = /\b[0-2]?[0-9]:[0-5][0-9]\b/;
                                  if(!re.exec(e.target.value)){
                                    alert('Check the time. Need to be from 00:00 to 23:59');
                                    setTime('00:00')
                                  }
                                }}
                              />
                            </Grid>
                          </Grid>
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
                            value="mail"
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
          </Stack>
  
          <Card>
            <MailListToolbar numSelected={selected.length} onFilterName={handleFilterByName} />
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <MailListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={mailList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredMails.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, subject, body, type, sendstate, senddate, ts } = row;
                    const isItemSelected = selected.indexOf(subject) !== -1;

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
                          <Checkbox checked={isItemSelected} />
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {/* <Avatar alt={firstname} src={avatarUrl} /> */}
                            <Typography variant="subtitle2" noWrap>
                              {subject}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{type}</TableCell>
                        <TableCell align="left" style={sendstate ? {color:"green"} : {color:"pink"}}>{sendstate ? 'send' : 'not sent'}</TableCell>
                        <TableCell align="left">{humanDate(senddate)}</TableCell>
                        <TableCell align="left">{humanDate(ts)}</TableCell>
                        <TableCell align="right">
                          <MailMoreMenu id={id} mail={row} onChange={handleUpdate} />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {emptyRows > 0 && (
                    <TableRow style={{ height: 53 * emptyRows }}>
                      <TableCell colSpan={6} />
                    </TableRow>
                  )}
                </TableBody>

                {isMailNotFound && (
                  <TableBody>
                    <TableRow>
                      <TableCell align="center" colSpan={6} sx={{ py: 3 }}>
                        <SearchNotFound searchQuery={filterName} />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                )}
              </Table>
            </TableContainer>
  
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={mailList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>
      </Page>
    )
  // }
}