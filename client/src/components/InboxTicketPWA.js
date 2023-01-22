import { filter } from 'lodash';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom'
// material
import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  Button,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
// import Page from './Page';
// import Label from '../components/Label';
// import Scrollbar from './Scrollbar';
// import Iconify from './Iconify';
// import SearchNotFound from './SearchNotFound';
import { MessageListHead } from '../sections/@dashboard/message';
import { Loader } from './Loader';
import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import humanDate from './HumanDate';
import {API_URL} from '../config'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'message',   label: 'Message',       alignRight: false },
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

export default function InboxTicketPWA(messageTicket, client) {
  // console.log('ticket:', messageTicket)
  const {token} = useContext(AuthContext)
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [messageList, setMessageList] = useState([])
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

  // const handleRequestSort = (event, property) => {
  //   const isAsc = orderBy === property && order === 'asc'
  //   setOrder(isAsc ? 'desc' : 'asc')
  //   setOrderBy(property)
  // };
  
  const getMessagesByTicket = useCallback(async () => {
    try {
      const messages = await request(`${API_URL}api/messagesbyticket/${messageTicket.ticket}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      for(let key in messages){
        // console.log('message:', messages[key]);
        if(messages[key].client_id)         messages[key].client    = await getClient(messages[key].client_id);             else messages[key].client = {};
        if(messages[key].body.procedureId)  messages[key].procedure = await getProcedure(messages[key].body.procedureId);   else messages[key].procedure = {};
      }
      // console.log('messages:', messages);
      setMessageList(messages);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getMessagesByTicket()}, [getMessagesByTicket])

  async function getClient(clientId) {
    if(!clientId) return;
    try {
      const client = await request(`${API_URL}api/user/${clientId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      return client
    } catch (e) { console.log('error:', e)}
  } 

  const getProcedure = async(procedureId) =>{
    try{
      const proc = await request(`${API_URL}api/procedure/${procedureId}`, 'GET', null, {
          Authorization: `Bearer ${token}`
        })
        // console.log('procedure:', proc);
        return proc;
    }catch(err){
      console.log(`Error ${err}`);
    }
  }

  // const handleSelectAllClick = (event) => {
  //   if (event.target.checked) {
  //     const newSelecteds = messageList.map((n) => n.name)
  //     setSelected(newSelecteds)
  //     return
  //   }
  //   setSelected([]);
  // };

  // const handleClick = (event, name) => {
  //   const selectedIndex = selected.indexOf(name);
  //   let newSelected = [];
  //   if (selectedIndex === -1) {
  //     newSelected = newSelected.concat(selected, name);
  //   } else if (selectedIndex === 0) {
  //     newSelected = newSelected.concat(selected.slice(1));
  //   } else if (selectedIndex === selected.length - 1) {
  //     newSelected = newSelected.concat(selected.slice(0, -1));
  //   } else if (selectedIndex > 0) {
  //     newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
  //   }
  //   setSelected(newSelected);
  // };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // const handleFilterByName = (event) => {
  //   setFilterName(event.target.value);
  // };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - messageList.length) : 0

  const filteredMessages = applySortFilter(messageList, getComparator(order, orderBy), filterName)

  // const isMessageNotFound = filteredMessages.length === 0

  const stat = (s) => {
    // 0 - not answered, 1 - answered, 2 - closed
    switch(s){
      case 0:
        return (<span style={{ color:"lightblue" }}>{'Processing'}</span>);
      case 1:
        return (<span style={{ color:"green" }}>{'Answered'}</span>);
      case 2:
        return (<span style={{ color:"lightgray" }}>{'Closed'}</span>);
      default : return '';
    }
  }


  if (loading) return <Loader/>
  else {
    return (
      <div style={{ width:"100%" }}>
        {/* <Page title="Message"> */}
          {/* <Container> */}
            {/* <MessageListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} /> */}
            <TableContainer sx={{ width: "100%", maxHeight:"65vh" }}>
              <Table>
                <MessageListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={messageList.length}
                  numSelected={selected.length}
                  // onRequestSort={handleRequestSort}
                  // onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredMessages.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, ts, ticket, status, client, body, procedure, admin_id } = row;
                    const isItemSelected = selected.indexOf(ts) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        // tabIndex={-1}
                        // role="checkbox"
                        // selected={isItemSelected}
                        // aria-checked={isItemSelected}
                      >
                        {/* <TableCell padding="checkbox">
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, id)} />
                        </TableCell> */}
                        {/* <TableCell align="left">{client.id ? 'Request >>>' : '<<< Answer'}</TableCell> */}
                        <TableCell align="left">
                          {/* {client.id && (
                            <> */}
                              {/* <h4>Ticket: {ticket}</h4> */}
                              <span style={{ fontSize:"12px" }}>{humanDate(ts)}</span>
                          {!body.answer && (stat(status))}
                          <hr />
                          {!body.answer && (
                            <div>
                              { body.note && (
                                <div>
                                  <p>You wrote:</p>
                                  <p>{body.note}</p>
                                </div>
                              )}
                              { procedure?.procedure && (
                                <div>
                                  <p>{'Procedure: '}<strong>{procedure.procedure}</strong></p>
                                </div>
                              )}
                              { body.procedureId && body.procedureId !== 0 ? (
                                <div>
                                  {/* botox */}
                                  { procedure?.id === 1 && (
                                    <div>
                                      <p>Details:</p>
                                      <p style={{ marginLeft:"20px" }}>When:       <strong>{botox.botoxWhen[body.detail?.botoxWhen]}</strong></p>
                                      <p style={{ marginLeft:"20px" }}>What:       <strong>{botox.botoxWhat[body.detail?.botoxWhat]}</strong></p>
                                      <p style={{ marginLeft:"20px" }}>Migren:     <strong>{yesno[body.detail?.migren]}</strong></p>
                                      <p style={{ marginLeft:"20px" }}>Allergy:    <strong>{yesno[body.detail?.allergy]}</strong></p>
                                      <p style={{ marginLeft:"20px" }}>Autoimmune: <strong>{yesno[body.detail?.autoimmune]}</strong></p>
                                      <p style={{ marginLeft:"20px" }}>Pregnant:   <strong>{yesno[body.detail?.pregnant]}</strong></p>
                                    </div>
                                  )}
                                  {/* breast */}
                                  { [32,33,34,35,36,37,39,40,41,44].filter(item => item === procedure.id).length > 0 && (
                                    <div>
                                      <p>Details:</p>
                                      {/* {"breastShape": "Drop", "breastPtosis": 0, "breastDisease": "never", "breastSizeNow": "A", "breastSizeWant": "C"} */}
                                      <p style={{ marginLeft:"20px" }}>Now the size is      <strong>{body.detail?.breastSizeNow}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Desired size is      <strong>{body.detail?.breastSizeWant}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Desired shape is     <strong>{body.detail?.breastShape}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Breast ptosis        <strong>{yesno[Number(body.detail?.breastPtosis)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Previous surgeries:  <strong>{body.detail?.breastDisease}</strong></p>
                                    </div>
                                  )}
                                  {/* sculptra */}
                                  { [55].filter(item => item === procedure.id).length > 0 && (
                                    <div>
                                      <p>Details:</p>
                                      {/* "sculptraEdema": 0, "sculptraPregnant": 0, "sculptraAutoimmune": 0, "sculptraLocalReaction": 0 */}
                                      <p style={{ marginLeft:"20px" }}>Autoimmune:      <strong>{yesno[Number(body.detail?.sculptraAutoimmune)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Pregnant:        <strong>{yesno[Number(body.detail?.sculptraPregnant)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Local reaction:  <strong>{yesno[Number(body.detail?.sculptraLocalReaction)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Edema:           <strong>{yesno[Number(body.detail?.sculptraEdema)]}</strong></p>  
                                    </div>
                                  )}
                                  {/* CO2 */}
                                  { [56].filter(item => item === procedure.id).length > 0 && (
                                    <div>
                                      <p>Details:</p>
                                      {/* {"co2Akne": 0, "co2Edema": "1", "co2Tatoo": "1", "co2Rosacea": 0, "co2Pigmentation": "0", "co2LightSensitivity": "1" */}
                                      <p style={{ marginLeft:"20px" }}>Akne:             <strong>{yesno[Number(body.detail?.co2Akne)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Rosacea:          <strong>{yesno[Number(body.detail?.co2Rosacea)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Tatoo:            <strong>{yesno[Number(body.detail?.co2Tatoo)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Edema:            <strong>{yesno[Number(body.detail?.co2Edema)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>LightSensitivity: <strong>{yesno[Number(body.detail?.co2LightSensitivity)]}</strong></p>  
                                      <p style={{ marginLeft:"20px" }}>Pigmentation:     <strong>{yesno[Number(body.detail?.co2Pigmentation)]}</strong></p>  
                                    </div>
                                  )}
                                </div>
                              ) : null}
                            </div>
                          )}
                          {body.answer && body.procedureId !== 0 ? (
                            <div>
                              <p><strong style={{color:"green"}}>Answer about you request</strong></p>
                              <p>{body.note}</p>
                              <p>{body.clientMessage}</p>
                              <p>{body.adminMessage}</p>
                              {body.adminMessage && (
                                <Button variant="outlined" sx={{ mt:2, mb:2 }} onClick={()=>{navigate('/bookconsult')}}>
                                  Book the consultation
                                </Button>
                              )}
                              <p style={{fontSize:"10px"}}>Or respond to this message by asking a more specific question</p>
                            </div>
                          ) : null}
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

                {/* {isMessageNotFound && (
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
              rowsPerPageOptions={[3, 6, 9]}
              component="div"
              count={messageList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          {/* </Container> */}
        {/* </Page> */}
      </div>
    )
  }
}
