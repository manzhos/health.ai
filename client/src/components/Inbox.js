import { filter } from 'lodash';
import React, { useState, useCallback, useEffect, useContext } from 'react';
// import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
// material
import {
  Table,
  Stack,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
import Page from './Page';
// import Label from '../components/Label';
import Scrollbar from './Scrollbar';
import SearchNotFound from './SearchNotFound';
import { MessageListHead, MessageListToolbar, MessageMoreMenu } from '../sections/@dashboard/message';
import { Loader } from './Loader';
import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import humanDate from './HumanDate';
import {API_URL} from '../config'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'ts',           label: 'Date',          alignRight: false },
  { id: 'clientEmail',  label: 'Email Client',  alignRight: false },
  { id: 'message',      label: 'Message',       alignRight: false },
  // { id: '' },
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
    return filter(array, (_message) => _message.name.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Inbox() {
  const {token} = useContext(AuthContext)
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [messageList, setMessageList] = useState([])
  const [client, setClient] = useState({})
  const [procedure, setProcedure] = useState({});
  const {loading, request} = useHttp()
  const navigate  = useNavigate()

  const yesno = {'0' : 'No', '1' : 'Yes'}
  const botox = {
    'botoxWhen' : {
      "0": "Never"       ,
      "1": "One Month"   ,
      "2": "Six months"  ,
      "3": "About a year",
    },
    'botoxWhat' : {
      "0" : "Allergan BTX",
      "1" : "Azalure"     ,
      "2" : "Bocoutur"    ,
      "3" : "Other"       ,
    }
  }

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };
  
  const getMessages = useCallback(async () => {
    try {
      const messages = await request(`${API_URL}api/messages`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      messages.map(async (message) => {
        const c = await getClient(message.client_id);
        // console.log('client', c);
        const huMessage = await humanMessage(message.ticket, message.body)
        // console.log('humanMessage:', huMessage)
        message.clientEmail = c.email;
        message.huMessage = huMessage;
      })
      setMessageList(messages);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getMessages()}, [getMessages])

  async function getClient(clientId) {
    if(!clientId) return;
    try {
      const client = await request(`${API_URL}api/user/${clientId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      return client
    } catch (e) { console.log('error:', e)}
  } 

  async function humanMessage(ticket, body) {
    try{
      const proc = await request(`${API_URL}api/procedure/${body.procedureId}`, 'GET', null, {
          Authorization: `Bearer ${token}`
        })
        // console.log('procedure:', proc);
        setProcedure(proc);
    }catch(err){console.log(`Error ${err}`)}
  
    return (
      <>
        <h3>Ticket: {ticket}</h3>
        <p>The client {body.age} year old needs a procedure</p>
        <p><strong>{procedure.procedure}</strong></p>
        <p>Details:</p>
        { procedure.id === 1 && (
          <>
            <p>When:       <strong>{botox.botoxWhen[body.detail?.botoxWhen]}</strong></p>
            <p>What:       <strong>{botox.botoxWhat[body.detail?.botoxWhat]}</strong></p>
            <p>Migren:     <strong>{yesno[body.detail?.migren]}</strong></p>
            <p>Allergy:    <strong>{yesno[body.detail?.allergy]}</strong></p>
            <p>Autoimmune: <strong>{yesno[body.detail?.autoimmune]}</strong></p>
            <p>Pregnant:   <strong>{yesno[body.detail?.pregnant]}</strong></p>
          </>
        )}
        { body.note && (
          <>
            <p>Also client wrote about:</p>
            <p>{body.note}</p>
          </>
        )}
      </>
    )
  } 

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = messageList.map((n) => n.name)
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

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
  };

  // const handleChangeRole = (event) => {
  //   event.preventDefault();
  //   setRole(event.target.value)
  //   // console.log('role now:', role)
  // }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - messageList.length) : 0

  const filteredMessages = applySortFilter(messageList, getComparator(order, orderBy), filterName)

  const isMessageNotFound = filteredMessages.length === 0

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleUpdate = (update) => {getMessages()}



  if (loading) return <Loader/>
  else {
    return (
      <Page title="Message">
        <Container>
            <MessageListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />
  
            <Scrollbar>
              <TableContainer sx={{ minWidth: 800 }}>
                <Table>
                  <MessageListHead
                    order={order}
                    orderBy={orderBy}
                    headLabel={TABLE_HEAD}
                    rowCount={messageList.length}
                    numSelected={selected.length}
                    onRequestSort={handleRequestSort}
                    onSelectAllClick={handleSelectAllClick}
                  />
                  <TableBody>
                    {filteredMessages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                      const { id, ts, ticket, client_id, clientEmail, body, huMessage } = row;
                      const isItemSelected = selected.indexOf(ts) !== -1;
  
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
                            <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} />
                          </TableCell>
                          <TableCell component="th" scope="row" padding="none">
                            <Stack direction="row" alignItems="left" spacing={2}>
                              <Typography variant="subtitle2" noWrap>
                                {humanDate(ts)}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell align="left">{clientEmail}</TableCell>
                          <TableCell align="left">{huMessage}</TableCell>
                          {/* <TableCell align="right">
                            <MessageMoreMenu id={id} message={row} roleList={roleList} onChange={handleUpdate} />
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
  
                  {isMessageNotFound && (
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
            </Scrollbar>
  
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={messageList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
        </Container>
      </Page>
    )
  }
}
