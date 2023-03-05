import React, { useState, useCallback, useEffect, useContext } from 'react';
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
// import { Link as RouterLink } from 'react-router-dom';
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
import Page from '../../components/Page';
// import Label from '../components/Label';
import Iconify from '../../components/Iconify';
import SearchNotFound from '../../components/SearchNotFound';
import { UserListHead, UserListToolbar, UserMoreMenu } from '../../sections/@dashboard/user';
import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook'
import { AuthContext } from '../../context/AuthContext'
import {API_URL} from '../../config'
import humanDate from '../../components/HumanDate';
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'pass',     label: 'Pass',   alignRight: false },
  { id: 'fullName', label: 'Name',   alignRight: false },
  { id: 'email',    label: 'Email',  alignRight: false },
  { id: 'phone',    label: 'Phone',  alignRight: false },
  { id: 'ts',       label: 'Date',   alignRight: false },
  { id: 'source',   label: 'Source', alignRight: false },
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

export default function Lead() {
  const {token} = useContext(AuthContext)
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [filterName, setFilterName] = useState('')
  const [filterUserRole, setFilterUserRole] = useState()
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [userList, setUserList] = useState([])
  const {loading, request} = useHttp()
  const navigate  = useNavigate()

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };
  
  const getUsers = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/user?role=lead`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      res.map((el)=>{
        el.pass = timeInLead(el.ts);
        el.fullName = el.firstname + ' ' + el.lastname;
      });
      setUserList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getUsers()}, [getUsers])
  

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = userList.map((n) => n.name)
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

  const handleFilterByName = (filterString) => {
    setFilterName(filterString);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - userList.length) : 0

  const filteredUsers = applySortFilter(userList, getComparator(order, orderBy), filterName, filterUserRole)

  const isUserNotFound = filteredUsers.length === 0

  const handleUpdate = (update) => {
    getUsers();
  }

  const getUser = (event, id) => {
    event.preventDefault()
    console.log('get User:', id)
    // navigate(`/admin/client/docs/${id}`)
  }

  const timeInLead = (ts) => {
    const now = Date.now(),
          start = new Date(ts);
    return Math.trunc((now - start.getTime())/1000/3600 / 24);
  }

  const passDay = (ts) => {
    const pass = timeInLead(ts);
    if(pass < 1) return 'day0';
    if(pass < 3) return 'day1';
    if(pass < 7) return 'day2';
    return 'day3';
  }

  if (loading) return <Loader/>
  else {
    return (
      <Page title="User">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Leads
            </Typography>
            {/* <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
              New Lead
            </Button> */}
          </Stack>
  
          <Card>
            <UserListToolbar numSelected={selected.length} onFilterName={handleFilterByName} />
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <UserListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={userList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    // const { id, name, role, status, company, avatarUrl, isVerified } = row;
                    const { id, pass, fullName, email, phone, ts, source } = row;
                    const isItemSelected = selected.indexOf(fullName) !== -1;

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
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, fullName)} />
                        </TableCell>
                        <TableCell sx={{ textAlign:"center"}}>
                          <div className={'passed-days ' + passDay(ts)}>
                            {pass < 1 ? '' : pass}
                          </div>
                        </TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            <Typography variant="subtitle2" noWrap>
                              { fullName ? sentenceCase(fullName) : '' }
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{email}</TableCell>
                        <TableCell align="left">{phone}</TableCell>
                        <TableCell align="left">{humanDate(ts)}</TableCell>
                        <TableCell align="left">{source ? source : '-'}</TableCell>

                        <TableCell align="right">
                          {/* <UserMoreMenu id={id} user={row} roleList={roleList} onChange={handleUpdate} /> */}
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
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={userList.length}
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
}
