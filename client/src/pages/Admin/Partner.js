import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useCallback, useEffect, useContext } from 'react';
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
import { PartnerListHead, PartnerListToolbar, PartnerMoreMenu } from '../../sections/@dashboard/partner';
import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook'
import { AuthContext } from '../../context/AuthContext'
import {API_URL} from '../../config'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id',           label: 'ID', alignRight: false },
  { id: 'name',         label: 'Name', alignRight: false },
  { id: 'email',        label: 'Email', alignRight: false },
  { id: 'phone',        label: 'Phone', alignRight: false },
  { id: 'promo',        label: 'Ready for promo', alignRight: false },
  { id: 'reward_cos',   label: 'Reward cosmetology', alignRight: false },
  { id: 'reward_med',   label: 'Reward medical', alignRight: false },
  { id: 'reward_total', label: 'Reward total', alignRight: false },
  { id: 'paid_out',     label: '', alignRight: true },
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
    return filter(array, (_partner) => (_partner.firstname.toLowerCase().indexOf(query.toLowerCase()) !== -1) || _partner.lastname.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }
  if(role){
    return filter(array, (_partner) => _partner.partnertype_id === role);
  }
  return stabilizedThis.map((el) => el[0]);
}

export default function Partner() {
  const {token} = useContext(AuthContext)
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [partnerList, setPartnerList] = useState([])

  const {loading, request} = useHttp()
  const navigate  = useNavigate()

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };
  
  const getPartners = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/partners`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('res:', res);
      setPartnerList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getPartners()}, [getPartners])

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = partnerList.map((n) => n.name)
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

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    // console.log('data:\n', 
    //   '\n', data.get('firstName'),
    //   '\n', data.get('lastName'),
    //   '\n', data.get('email'),
    //   '\n', data.get('password'),
    //   '\n', data.get('partnertype_id'),
    //   '\n', data.get('allowExtraEmails'),
    //   '\n', data.get('avatar')
    // )
    if(data.get('firstName') && data.get('lastName') && data.get('email') && data.get('password')){
      try {
        const formData = new FormData()
        formData.append('firstname',  data.get('firstName'))
        formData.append('lastname',   data.get('lastName'))
        formData.append('email',      data.get('email'))
        formData.append('password',   data.get('password'))
        formData.append('partnertype_id',data.get('partnertype_id'))
        formData.append('promo',      data.get('allowExtraEmails'))
        formData.append('avatar',     data.get('avatar'))

        const res = await fetch(`${API_URL}api/partner`, {
          method: 'POST', 
          body: formData,
        })
        setOpen(false)
        handleUpdate()
        navigate('/admin/partner')
      } catch (e) {console.log('error:', e)} 
    } else alert('You need to fill fields.')
  }

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - partnerList.length) : 0

  const filteredPartners = applySortFilter(partnerList, getComparator(order, orderBy), filterName)

  const isPartnerNotFound = filteredPartners.length === 0

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleUpdate = (update) => {
    getPartners();
  }

  const getPartner = (event, id) => {
    event.preventDefault()
    console.log('get Partner:', id)
    // navigate(`/admin/client/docs/${id}`)
  }

  const paidOut = async (partner_id) => {
    try {
      const res = await request(`${API_URL}api/paidout/${partner_id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      console.log('res:', res);
      getPartners();
    } catch (e) { console.log('error:', e)} 
  }

  if (loading) return <Loader/>
  else {
    return (
      <Page title="Partner">
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Partners
            </Typography>
            {/* <Button variant="contained" onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
              New Partner
            </Button> */}
            {/* add new partner */}
            {/* <Modal
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
                      New partner
                    </Typography>
                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                      <Grid container spacing={2}>
                        <Grid container item xs={12} sm={2} direction="column" justifyContent="flex-start" alignItems="center">
                          <img src={avatarURL || avatar} className='avatar' alt="" />
                          <label htmlFor="avatar">
                            <input id="avatar" name="avatar" type="file" accept='image/*' onChange={onAvatarChange} style={{ display: "none" }}/>
                            <Button variant="outlined" component="span">
                              Set Photo
                            </Button>
                          </label>
                        </Grid>  
                        <Grid container spacing={2} item xs={12} sm={10}>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              autoComplete="given-name"
                              name="firstName"
                              required
                              fullWidth
                              id="firstName"
                              label="First Name"
                              autoFocus
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              required
                              fullWidth
                              id="lastName"
                              label="Last Name"
                              name="lastName"
                              autoComplete="family-name"
                            />
                          </Grid>
                          <Grid item xs={12}>
                            <TextField
                              required
                              fullWidth
                              id="email"
                              label="Email Address"
                              name="email"
                              autoComplete="email"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <TextField
                              required
                              fullWidth
                              name="password"
                              label="Password"
                              type="password"
                              id="password"
                              autoComplete="new-password"
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <FormControl sx={{ width: 1 }}>
                              <InputLabel id="role-select">Role</InputLabel>
                              <Select
                                labelId="role-select"
                                id="role-select"
                                name="partnertype_id"
                                value={role}
                                label="Role"
                                onChange={handleChangeRole} 
                              >
                                {roleList.map((item, key)=>{
                                  return(
                                    <MenuItem key={item.id} value={item.id}>{sentenceCase(item.partnertype)}</MenuItem>
                                  )
                                })}
                              </Select>
                            </FormControl>
                          </Grid>                          
                          <Grid item xs={12}>
                            <FormControlLabel
                              control={<Checkbox name="allowExtraEmails" value="allowExtraEmails" color="primary" />}
                              label="Set for receive inspiration, marketing promotions and updates via email."
                            />
                          </Grid>
                        </Grid>
                      </Grid>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                      >
                        Register
                      </Button>
                    </Box>
                  </Box>
                </div>
              </Container>
            </Modal> */}
          </Stack>
  
          <Card>
            <PartnerListToolbar numSelected={selected.length} onFilterName={handleFilterByName} />
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <PartnerListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={partnerList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredPartners.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    // const { id, name, role, status, company, avatarUrl, isVerified } = row;
                    const { id, firstname, lastname, email, phone, promo, total_med_cost, total_cos_cost, total } = row;
                    const isItemSelected = selected.indexOf(firstname) !== -1;

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
                          <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, firstname)} />
                        </TableCell>
                        <TableCell align="left">{id}</TableCell>
                        <TableCell component="th" scope="row" padding="none">
                          <Stack direction="row" alignItems="center" spacing={2}>
                            {/* <Avatar alt={firstname} src={avatarUrl} /> */}
                            <Typography variant="subtitle2" noWrap>
                              {sentenceCase(firstname)}&nbsp;{sentenceCase(lastname)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{email}</TableCell>
                        <TableCell align="left">{phone}</TableCell>
                        <TableCell align="left">{promo ? 'Yes' : 'No'}</TableCell>
                        <TableCell align="left">{Number(total_med_cost).toFixed(2)}</TableCell>
                        <TableCell align="left">{Number(total_cos_cost).toFixed(2)}</TableCell>
                        <TableCell align="left">{Number(total).toFixed(2)}</TableCell>
                        <TableCell align="right">
                          <Button onClick={()=>{paidOut(id)}}>Paid&nbsp;out</Button>
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

                {isPartnerNotFound && (
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
              count={partnerList.length}
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
