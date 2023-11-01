import { filter } from 'lodash';
import { sentenceCase } from 'change-case';
import React, { useState, useCallback, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import PdfComponent from './PdfComponent';
// material
import {
  Card,
  Table,
  Stack,
  Grid,
  Modal,
  TableRow,
  TableBody,
  TableCell,
  Container,
  Typography,
  TableContainer,
  TablePagination,
  Checkbox
} from '@mui/material';
// components
import Page from '../../components/Page';
import { InvoiceListHead, InvoiceListToolbar, InvoiceMoreMenu } from '../../sections/@dashboard/invoice';
import { Loader } from '../../components/Loader';
import { useHttp } from '../../hooks/http.hook'
import { AuthContext } from '../../context/AuthContext'
import {API_URL} from '../../config'
import humanDate from '../../components/HumanDate';
import Scrollbar from '../../components/Scrollbar';
import Iconify from '../../components/Iconify';
import Confirm from '../../components/Confirm'
// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'procedure', label: 'Procedure', alignRight: false },
  { id: 'client_firstname', label: 'Client', alignRight: false },
  { id: 'invoice', label: 'Invoice' },
  { id: 'paid', label: 'Paid' },
  { id: 'del' },
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
    return filter(array, (_invoice) => (_invoice.client_firstname.toLowerCase().indexOf(query.toLowerCase()) !== -1) || _invoice.client_firstname.toLowerCase().indexOf(query.toLowerCase()) !== -1);
  }

  return stabilizedThis.map((el) => el[0]);
}


export default function Invoices() {
  const {token} = useContext(AuthContext)
  const navigate  = useNavigate()

  const [selected, setSelected] = useState([])
  const [order, setOrder] = useState('asc')
  const [orderBy, setOrderBy] = useState('name')
  const [filterName, setFilterName] = useState('')  
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [invoiceList, setInvoiceList] = useState([])
  const {loading, request} = useHttp()
  const [open, setOpen] = useState(false)
  // const [points, setPoints] = useState(144000);
  const [invoice, setInvoice] = useState({});
  const [perfProcedureIds, setPerfProcedureIds] = useState([]);
  const [confirmData, setConfirmData] = useState({});

  const handleRequestSort = (event, property) => {
    console.log('handleRequestSort', property);
    const isAsc = orderBy === property && order === 'asc'
    setOrder(isAsc ? 'desc' : 'asc')
    setOrderBy(property)
  };

  const getInvoices = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/invoices`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('invoices:', res);
      setInvoiceList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getInvoices()}, [getInvoices])


  const handleFilterByName = (filterString) => {
    setFilterName(filterString);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - invoiceList.length) : 0;

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = invoiceList.map((n) => n.id)
      setSelected(newSelecteds)
      return
    }
    setSelected([]);
  };

  const handleClick = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(selected.slice(0, selectedIndex), selected.slice(selectedIndex + 1));
    }
    setSelected(newSelected);
  };


  const setPaid = async(id) => {
    const inv = invoiceList.find(invoice => invoice.id === id)
    // console.log('invoice:', inv);
    if(!inv.bill) {
      alert('Make the bill firstly');
      return;
    }
    try {
      const res = await request(`${API_URL}api/invoicesetpaid/${id}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('paid:', res.paid);
      if(res.paid){
        try{
          const paid = await request(`${API_URL}api/loyalty`, 'POST', {
            'client_id' : res.client_id,
            'invoice_id': id,
            'ref'       : false,
            'ref_id'    : null,
            'multiply'  : 1,
            'points'    : inv.bill.cost
          },{Authorization: `Bearer ${token}`})
          // console.log('paid:', paid);
        } catch(e) {console.log('error:', e)}
      }else{
        try{
          const del = await request(`${API_URL}api/delloyalty/${id}`, 'GET', null, {
            Authorization: `Bearer ${token}`
          })
        } catch(e) {console.log('error:', e)}
      }
      getInvoices();
    } catch (e) {console.log('error:', e)}
  }

  const delInvoice = (invoiceId) => {
    setConfirmData({
      open:       true,
      message:    `Confirm delete invoice #${invoiceId}`,
      invoiceId:  invoiceId
    });
  }
  
  const _delInvoice = async (response) => {
    // console.log('response:', response);
    if(response){
      try {
        const res = await request(`${API_URL}api/note/${confirmData.invoiceId}`, 'PATCH', null, {
          Authorization: `Bearer ${token}`
        })
        getInvoices();
      } catch (e) {console.log('error:', e)}    
    }
    setConfirmData({ open:false });    
  }

  const makeInvoice = (id) => {
    // console.log('id:', typeof(id));
    setPerfProcedureIds(typeof(id) === 'number' ? [id] : id);
    setOpen(true);
  }

  const closePdf = () => {
    setOpen(false);
    getInvoices();
  }

  const filteredInvoices = applySortFilter(invoiceList, getComparator(order, orderBy), filterName);


  if (loading) return <Loader/>
  else {
    return (
      <Page title="Invoice">
        {/* extentended components */}
        <Confirm confirmData={confirmData} response={(response)=>{_delInvoice(response)}} />
        
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Invoices {selected}
            </Typography>
          </Stack>
  
          <Card>
            <InvoiceListToolbar numSelected={selected.length} onFilterName={handleFilterByName} handleMakeInvoice={() => makeInvoice(selected)} />
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <InvoiceListHead
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={invoiceList.length}
                  numSelected={selected.length}
                  onRequestSort={handleRequestSort}
                  onSelectAllClick={handleSelectAllClick}                  
                />
                <TableBody>
                  {filteredInvoices.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                    const { 
                      id,
                      title,
                      note,
                      client_id,
                      client_firstname,
                      client_lastname,
                      doctor_id,
                      doctor_firstname,
                      doctor_lastname,
                      procedure_id,
                      bill,
                      paid,
                      procedure,
                      ts
                     } = row;
                     const isItemSelected = selected.indexOf(id) !== -1;

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
                        <TableCell onClick={() => makeInvoice(id)} style={{cursor:"pointer"}}>
                          {humanDate(ts)}
                        </TableCell>
                        <TableCell onClick={() => makeInvoice(id)} style={{cursor:"pointer"}}>
                          {procedure}
                        </TableCell>
                        <TableCell onClick={() => makeInvoice(id)} style={{cursor:"pointer"}}>
                          {sentenceCase(client_firstname)} {sentenceCase(client_lastname)}
                        </TableCell>
                        <TableCell onClick={() => makeInvoice(id)} style={{cursor:"pointer"}}>
                          {bill?.id ? <span style={{color:"green", cursor:"pointer"}}>{'Yes'}</span> : <span style={{color:"pink", cursor:"pointer"}}>{'No'}</span>}
                        </TableCell>
                        <TableCell onClick={() => setPaid(id)}>
                          {paid ? <span style={{color:"green", cursor:"pointer"}}>{'Yes'}</span> : <span style={{color:"pink", cursor:"pointer"}}>{'No'}</span>}
                        </TableCell>

                        <TableCell align="right">
                          {/* <Iconify icon="eva:trash-2-outline" width={20} height={20} onClick = {() => {delInvoice(id)}} style={{ cursor:"pointer", color:"darkgoldenrod" }} /> */}
                          <Iconify icon="eva:trash-2-outline" width={20} height={20} onClick = {() => {delInvoice(id)}} style={{ cursor:"pointer", color:"darkgoldenrod" }} />
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
              </Table>
            </TableContainer>
  
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={invoiceList.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </Card>
        </Container>

        {perfProcedureIds.length > 0 && open &&
          <PdfComponent open={open} perfProcedureIds={perfProcedureIds} onClose={()=>{closePdf()}} />
        }

      </Page>
    )
  }
}
