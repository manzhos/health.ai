import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';

import { 
  Container,
  Card,
  Typography,
  Table,
  Stack,
  Grid,
  Button,
  Box,
  Modal,
  Checkbox,
  TableRow,
  TableBody,
  TableCell,
  TextField,
  InputLabel,
  Select,
  FormControl,
  FormControlLabel,
  MenuItem,
  TableContainer,
  TablePagination,  
} from '@mui/material';
import Iconify from '../../components/Iconify';
import SearchNotFound from '../../components/SearchNotFound';

import { AuthContext }    from '../../context/AuthContext';
import { URL, API_URL } from '../../config';
import { useHttp } from '../../hooks/http.hook';
import { PartnerClientListHead, UserListToolbar } from '../../sections/@dashboard/user';

import humanDate from '../../components/HumanDate';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'fullName', label: 'Client Name',   alignRight: false },
  { id: 'ts',       label: 'Registration Date',   alignRight: false },
  { id: 'med_cost', label: 'Medical',   alignRight: false },
  { id: 'cos_cost', label: 'Cosmetology',   alignRight: false },
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

function applySortFilter(array, comparator, query, role) {
  const stabilizedThis = array.map((el, index) => [el, index]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  if(query) {
    return filter(array, (_user) => (_user.firstname.toLowerCase().indexOf(query.toLowerCase()) !== -1) || _user.lastname.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function PartnerClients(){
  const {loading, request} = useHttp();
  const navigate  = useNavigate();
  const {token}   = useContext(AuthContext);
  const [userList, setUserList] = useState([]);
  const [filterName, setFilterName] = useState('');

  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('name');
  const [filterUserRole, setFilterUserRole] = useState();
  const [rowsPerPage, setRowsPerPage] = useState(8);


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
  const pJWT = parseJwt(token)
  const userId = pJWT ? pJWT.userId : null
  // console.log('userId:', userId);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterByName = (filterString) => {
    setFilterName(filterString);
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName, filterUserRole)

  const isUserNotFound = filteredUsers.length === 0

  const handleUpdate = (update) => {
    getUsers();
  }

  const getUsers = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/partnerclients/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('USERS:', res);
      setUserList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getUsers()}, [getUsers])

  return(
    <div className="partner-ms" style={{ width:"100vw", minHeight:"100vh", color:"#FCFBFD"}}>
      <Container style={{maxWidth:"640px"}}>
        <div id="topline" className='partner-top-menu'>
          <Iconify
            icon={'gg:list'}
            sx={{ width: 40, height: 40, ml: 1, color: "#D39D9A" }}
            style={{ cursor:"pointer" }}
          />
          <Iconify
            icon={'majesticons:home-line'}
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/partner')}}
          />
          <Iconify
            icon={'fluent:qr-code-24-filled'}
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/qrpartner')}}
          />
        </div>
        <div id="money">
          <Card>
            <UserListToolbar onFilterName={handleFilterByName} />
            <TableContainer>
              <Table>
                <PartnerClientListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userList.length}
                  onRequestSort={handleRequestSort}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, firstname, lastname, ts, med_cost, cos_cost } = row;
                    // const isItemSelected = selected.indexOf(firstname) !== -1;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        role="checkbox"
                        // selected={isItemSelected}
                        // aria-checked={isItemSelected}
                      >
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2} sx={{ ml:3 }}>
                            <Typography variant="subtitle2" noWrap>
                              {sentenceCase(firstname || '')}&nbsp;{sentenceCase(lastname || '')}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">
                          {humanDate(ts)}
                        </TableCell>
                        <TableCell align="left">
                          {med_cost}
                        </TableCell>
                        <TableCell align="left">
                          {cos_cost}
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

                {isUserNotFound && (
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
              rowsPerPageOptions={[8, 16, 32]}
              component="div"
              count={userList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </div>
      </Container>
    </div>    
  )
}