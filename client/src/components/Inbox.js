import React from 'react';
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
import { useHttp } from '../hooks/http.hook'
import { API_URL } from '../config'
import { MailListHead, MailListToolbar, MailMoreMenu } from '../sections/@dashboard/mail';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'client', label: 'Client', alignRight: false },
  { id: 'procedure', label: 'Procedure', alignRight: false },
  { id: 'info', label: 'Info', alignRight: false },
  { id: '' },
];

const mailList = [
  {id:'0', client: 'Sindy', procedure: 'BTX', info: { botoxWhen:'six months', botoxWhat:'Azalure'}},
  {id:'1', client: 'Winston Churchill', procedure: 'BTX', info: { botoxWhen:'never', botoxWhat:''}}
]

// ----------------------------------------------------------------------


export default function Inbox() {
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [selected, setSelected] = useState([])

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - mailList.length) : 0;

  const handleClick = (event, name) => {
    // const selectedIndex = selected.indexOf(name);
    // let newSelected = [];
    // if (selectedIndex === -1) {
    //   newSelected = newSelected.concat(selected, name);
    // } else if (selectedIndex === 0) {
    //   newSelected = newSelected.concat(selected.slice(1));
    // } else if (selectedIndex === selected.length - 1) {
    //   newSelected = newSelected.concat(selected.slice(0, -1));
    // } else if (selectedIndex > 0) {
    //   newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    // }
    // setSelected(newSelected);
  };

  const handleUpdate = () => {
    console.log('Update');
  }

  return(
    <Page title="Email: Inbox">
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4" gutterBottom>
          Inbox
        </Typography>
        {/* <Button variant="contained"  onClick={handleOpen} startIcon={<Iconify icon="eva:plus-fill" />}>
          New Mail
        </Button> */}
        {/* add new procedure */}
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
        </Modal> */}
      </Stack>

      <Card>
        {/* <MailListToolbar numSelected={selected.length} filterName={filterName} onFilterName={handleFilterByName} /> */}
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800 }}>
            <Table>
              <MailListHead
                // order={order}
                // orderBy={orderBy}
                headLabel={TABLE_HEAD}
                rowCount={mailList.length}
                numSelected={selected.length}
                // onRequestSort={handleRequestSort}
                // onSelectAllClick={handleSelectAllClick}
              />
              <TableBody>
                {mailList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                  const {id, client, procedure, info } = row;
                  const isItemSelected = selected.indexOf(client) !== -1;

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
                        <Checkbox checked={isItemSelected} onChange={(event) => handleClick(event, client)} />
                      </TableCell>
                      <TableCell component="th" scope="row" padding="none">
                        <Stack direction="row" alignItems="center" spacing={2}>
                          <Typography variant="subtitle2" noWrap>
                            {sentenceCase(client)}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell align="left">{sentenceCase(procedure)}</TableCell>
                      <TableCell align="left">
                        Last procedure: {info.botoxWhen}<br />
                        Used drug: {info.botoxWhat}<br />
                      </TableCell>
                      <TableCell align="right">
                        <MailMoreMenu id={id} client={row} onChange={handleUpdate} />
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

              {/* {isMailNotFound && (
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
        </Scrollbar>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={mailList.length}
          rowsPerPage={rowsPerPage}
          page={page}
          // onPageChange={handleChangePage}
          // onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
    </Container>
  </Page>

  )
}