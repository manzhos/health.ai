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
// ----------------------------------------------------------------------
const TABLE_HEAD = [
  { id: 'date', label: 'Date', alignRight: false },
  { id: 'procedure', label: 'Procedure', alignRight: false },
  { id: 'client', label: 'Client', alignRight: false },
  { id: 'paid', label: 'Paid' },
  { id: 'del' },
];
// ----------------------------------------------------------------------


export default function Invoices() {
  const {token} = useContext(AuthContext)
  const navigate  = useNavigate()

  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [invoiceList, setInvoiceList] = useState([])
  const {loading, request} = useHttp()
  const [open, setOpen] = useState(false)
  // const [points, setPoints] = useState(144000);
  const [invoice, setInvoice] = useState({});

  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  
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


  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - invoiceList.length) : 0

  const getInvoice = (invoiceId) => {
    // console.log('invoice:', invoiceList.find(invoice => invoice.id === invoiceId));
    let inv = invoiceList.find(invoice => invoice.id === invoiceId),
        cost = inv.procedure_cost;
        inv.services.map((service)=>{
          if(typeof service.cost      !== "undefined") inv.cost       = service.cost
          if(typeof service.medind    !== "undefined") inv.medind     = service.medind
          if(typeof service.diagnosis !== "undefined") inv.diagnosis  = service.diagnosis
        });
    let d = new Date(inv.ts);
    
    // console.log('inv:', inv);
    if(!inv.bill){
      setInvoice({
        'id'                : inv.id,
        'title'             : inv.title + '/' + inv.id,
        'kunde'             : '',
        'steuer'             : '',
        'USt'             : '',
        'client_id'         : inv.client_id,
        'client_firstname'  : inv.client_firstname,
        'client_lastname'   : inv.client_lastname,
        'client_adress1'    : '',
        'client_adress2'    : '',
        'client_country'    : '',
        'doctor_id'         : inv.doctor_id,
        'doctor_firstname'  : inv.doctor_firstname,
        'doctor_lastname'   : inv.doctor_lastname,
        'note'              : inv.note,
        'procedure'         : inv.procedure,
        'procedure_cost'    : inv.procedure_cost,
        'procedure_id'      : inv.procedure_id,
        'services'          : inv.services,
        'date'              : (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + '.' + (d.getMonth() + 1 > 9 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)) + '.' + d.getFullYear(),
        'qty'               : inv.services[0].qty,
        'cost'              : inv.services[0].cost,
        'medind'            : inv.medind,
        'diagnosis'         : inv.diagnosis,
      })
    } else setInvoice(inv.bill);
    // console.log('invoice:', invoice);

    getInvoices();
    handleOpen();
  }

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

  const delInvoice = async (invoiceId) => {
    try {
      const res = await request(`${API_URL}api/note/${invoiceId}`, 'PATCH', null, {
        Authorization: `Bearer ${token}`
      })
      getInvoices();
    } catch (e) {console.log('error:', e)}    
  }


  if (loading) return <Loader/>
  else {
    return (
      <Page title="Invoice">
        
        <Container>
          <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
            <Typography variant="h4" gutterBottom>
              Invoices
            </Typography>
          </Stack>
  
          <Card>
            {/* <InvoiceListToolbar numSelected={selected.length} onFilterName={handleFilterByName} onInvoiceRole={handleFilterByInvoiceRole} /> */}
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <InvoiceListHead
                  headLabel={TABLE_HEAD}
                  rowCount={invoiceList.length}
                />
                <TableBody>
                  {invoiceList.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
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
                      paid,
                      procedure,
                      ts
                     } = row;

                    return (
                      <TableRow
                        hover
                        key={id}
                        tabIndex={-1}
                        // role="checkbox"
                      >
                        <TableCell onClick={() => getInvoice(id)} style={{cursor:"pointer"}}>
                          {humanDate(ts)}
                        </TableCell>
                        <TableCell onClick={() => getInvoice(id)} style={{cursor:"pointer"}}>
                          {procedure}
                        </TableCell>
                        <TableCell onClick={() => getInvoice(id)} style={{cursor:"pointer"}}>
                          {sentenceCase(client_firstname)} {sentenceCase(client_lastname)}
                        </TableCell>
                        <TableCell onClick={() => setPaid(id)}>
                          {paid ? <span style={{color:"green", cursor:"pointer"}}>{'Yes'}</span> : <span style={{color:"pink", cursor:"pointer"}}>{'No'}</span>}
                        </TableCell>

                        <TableCell align="right">
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

        <Modal
          open={open}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Scrollbar>
            <Container style={{textAlign:"center"}}>
              <div className="invoice-modal">
                <Grid container>
                  <PdfComponent invoice={invoice} onClose={()=>{setOpen(false)}} />
                </Grid>
              </div>
            </Container>
          </Scrollbar>
        </Modal>
      </Page>
    )
  }
}
