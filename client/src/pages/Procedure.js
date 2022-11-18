/* eslint-disable */
import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import { useState, useCallback, useEffect } from 'react';
import { Link as RouterLink } from 'react-router-dom';
// material
import {
  Card,
  Table,
  Stack,
  // Avatar,
  Grid,
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
  Button,
  TableContainer,
  TablePagination,
} from '@mui/material';
// components
import Page from '../components/Page';
// import Label from '../components/Label';
import Scrollbar from '../components/Scrollbar';
import Iconify from '../components/Iconify';
import SearchNotFound from '../components/SearchNotFound';
import { ProcedureListHead, ProcedureListToolbar, ProcedureMoreMenu } from '../sections/@dashboard/procedure';
import { useHttp } from '../hooks/http.hook'
import { API_URL } from '../config'

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Procedure', alignRight: false },
  { id: 'proceduretype', label: 'Type', alignRight: false },
  { id: 'duration', label: 'Duration', alignRight: false },
  { id: 'promo', label: 'Cost', alignRight: false },
  { id: 'status', label: '', alignRight: false },
  { id: '' },
];

// ----------------------------------------------------------------------

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) return -1;
  if (b[orderBy] > a[orderBy]) return 1;
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
  if (query) return filter(array, (_procedure) => _procedure.procedure.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  return stabilizedThis.map((el) => el[0]);
}

export default function Procedure() {
  const jwt = localStorage.getItem("jwt")
  const [page, setPage] = useState(0)
  const [order, setOrder] = useState('asc')
  const [selected, setSelected] = useState([])
  const [orderBy, setOrderBy] = useState('name')
  const [filterName, setFilterName] = useState('')
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [procedureList, setProcedureList] = useState([])
  const [procedureTypeList, setProcedureTypeList] = useState([])
  const [procedureType, setProcedureType] = useState(1)

  const {request} = useHttp()

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };

  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/procedures`, 'GET', null, {
        // Authorization: `Bearer ${token}`
      })
      setProcedureList(res)
    } catch (e) { console.log('error:', e)}
  }, [request])
  useEffect(() => {getProcedures()}, [getProcedures])

  const getProcedureTypes = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/proceduretypes`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      setProcedureTypeList(res);
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  useEffect(() => {getProcedureTypes()}, [getProcedureTypes])  

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = procedureList.map((n) => n.name)
      setSelected(newSelecteds)
      return;
    }
    setSelected([])
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

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - procedureList.length) : 0;

  const filteredProcedures = applySortFilter(procedureList, getComparator(order, orderBy), filterName);

  const isProcedureNotFound = filteredProcedures.length === 0;

  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)

  const handleChangeProcedureType = (event) => {
    event.preventDefault();
    setProcedureType(event.target.value)
    console.log('procedureType now:', procedureType)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    // console.log('data:', 
    //   '\n', data.get('procedure'),
    //   '\n', data.get('duration'),
    //   '\n', data.get('cost'),
    //   '\n', data.get('proceduretype_id'),
    // )
    if(data.get('procedure') && data.get('duration') && data.get('cost') && data.get('proceduretype_id')){
      try {
        const res = await request(`${API_URL}api/procedure`, 'POST', {
          procedure:        data.get('procedure'),
          duration:         data.get('duration'),
          cost:             data.get('cost'),
          proceduretype_id: data.get('proceduretype_id'),
        })
        setOpen(false)
        getProcedures()
        // navigate('/admin/user')
      } catch (e) {console.log('error:', e)} 
    } else alert('You need to fill fields.')
  }

  const handleUpdate = (update) => {
    getProcedures()    
  }

  return (
    <Page title="Procedure">
      <Container>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
          <Typography variant="h4" gutterBottom>
            Procedures
          </Typography>
          <Button variant="contained"  onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
            New Procedure
          </Button>
          {/* add new procedure */}
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
                    New procedure
                  </Typography>
                  <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={12}>
                        <TextField
                          name="procedure"
                          required
                          fullWidth
                          id="procedure"
                          label="Procedure"
                          autoFocus
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="duration"
                          label="How much time is needed? (In minutes)"
                          name="duration"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          required
                          fullWidth
                          id="cost"
                          label="Cost (&#8364;)"
                          name="cost"
                        />
                      </Grid>
                      <Grid item xs={12} sm={12}>
                        <FormControl sx={{ width: 1 }}>
                          <InputLabel id="proceduretype-select">Procedure type</InputLabel>
                          <Select
                            labelId="proceduretype-select"
                            id="proceduretype-select"
                            name="proceduretype_id"
                            value={procedureType}
                            label="Procedure type"
                            onChange={handleChangeProcedureType} 
                          >
                            {procedureTypeList.map((item, key)=>{
                              return(
                                <MenuItem key={item.id} value={item.id}>{sentenceCase(item.proceduretype)}</MenuItem>
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
                      Add procedure
                    </Button>
                  </Box>
                </Box>
              </div>
            </Container>
          </Modal>
        </Stack>

        <Card>
          <ProcedureListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <ProcedureListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={procedureList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}
                />
                <TableBody>
                  {filteredProcedures.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { id, procedure, duration, cost, proceduretype, proceduretype_id } = row;
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
                            {/* <Avatar alt={firstname} src={avatarUrl} /> */}
                            <Typography variant="subtitle2" noWrap>
                              {sentenceCase(procedure)}
                            </Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="left">{sentenceCase(proceduretype)}</TableCell>
                        <TableCell align="left">{duration}</TableCell>
                        <TableCell align="left">{cost}</TableCell>
                        <TableCell align="right">
                          <ProcedureMoreMenu id={id} procedure={row} procedureTypeList={procedureTypeList} onChange={handleUpdate} />
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

                {isProcedureNotFound && (
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
