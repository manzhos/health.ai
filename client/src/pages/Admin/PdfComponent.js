import React, { useRef, useState, useEffect, useContext } from 'react';
import { useReactToPrint } from 'react-to-print';
// material
import {
  Card,
  Grid,
  Button,
  Box,
  Modal,
  Container
} from '@mui/material';
import { useHttp } from '../../hooks/http.hook'
import { ComponentToPrint } from './ComponentToPrint';
import { AuthContext } from '../../context/AuthContext';
import Scrollbar from '../../components/Scrollbar';
import {API_URL} from '../../config';

const PdfComponent = ({open, perfProcedureIds, onClose}) => {
  let globalPerfProcedures = [];
  // console.log('perfProcedureIds:', perfProcedureIds);
  // console.log('Invoice:', invoice);
  const {token} = useContext(AuthContext)
  const componentRef = useRef(null);
  const {loading, request} = useHttp();

  const [perfProcedures, setPerfProcedures] = useState([]);
  const [invoice, setInvoice] = useState();
  const [isBill, setIsBill] = useState(false);

  const getPerfProcedures = async() => {
    try{
      const procedures = await request(`${API_URL}api/get_perf_procedures`, 'POST', {
        'ids': perfProcedureIds
      }, { Authorization: `Bearer ${token}` });
      // console.log('procedures', procedures);
      const checkInvoice = procedures.find(p => p.bill);
      // console.log('checkInvoice', checkInvoice);
      if(checkInvoice) setIsBill(true);
      if(isBill && procedures.length > 1) {
        console.log('One or more of selected procedures already include in the invoice');
        alert('One or more of selected procedures already include in the invoice');
        onClose();
      }
      // else{ getNextInvoiceNumber() }
      setPerfProcedures(procedures);
      // setPerfProceduresDetail(procedures);
    }catch(err){console.log('Error:', err)}
  } 
  useEffect(()=>{getPerfProcedures()}, []);

  useEffect(()=>{
    // console.log('perfProcedures >> ', perfProcedures);
    // console.log('bill:', isBill);
    if(perfProcedures?.length && !isBill) setInvoiceDetail();
    if(perfProcedures?.length && isBill) {
      // globalPerfProcedures = [...perfProcedures];
      getInvoice(perfProcedures[0]?.bill.number);
      // console.log('Invoice already created >>> globalPerfProcedures:', globalPerfProcedures);
    }
  }, [perfProcedures]);

  const getInvoice = async (number) => {
    // console.log('get invoice');
    try{
      const res = await request(`${API_URL}api/invoice/${number}`, 'GET', null, { Authorization: `Bearer ${token}` });
      // console.log('getted invoice:', res);
      setInvoice(res);
    }catch(err){console.log('Error:', err)}
  }

  const setInvoiceDetail = async() => {
    // console.log('setInvoiceDetail >>> procedures:', perfProcedures, '\n', perfProcedures.find(p => p.bill)?.length);
      try{
        const res = await request(`${API_URL}api/invoice`, 'POST', {
          'perform_procedure_id'  : perfProcedureIds,
          'inv_title'             : {
            // 'title'             : perfProcedures[0].title + '/' + perfProcedures[0].id,
            // 'kunde'             : '',
            // 'steuer'            : '',
            // 'USt'               : '',
            'client_id'         : perfProcedures[0].client_id,
            'client_firstname'  : perfProcedures[0].client_firstname,
            'client_lastname'   : perfProcedures[0].client_lastname,
            'client_adress1'    : '',
            'client_adress2'    : '',
            'client_country'    : '',
          } 
        }, { Authorization: `Bearer ${token}` });
        // console.log('res:', res);
        // console.log('Invoice:', res);
        setInvoice(res);
      }catch(err){console.log(`Error: ${err}`)}
  };

  useEffect(()=>{
    // console.log('Invoice >> ', invoice);
    // console.log('Invoice >> bill:', isBill);
    if(invoice && !isBill) setPerfProceduresDetail();
  }, [invoice]);

  const setPerfProceduresDetail = async() => {
    globalPerfProcedures = [...perfProcedures];
    globalPerfProcedures.map((procedure)=>{
      procedure.cost = procedure.procedure_cost;
      procedure.services.map((service)=>{
        if(typeof service.cost      !== "undefined") procedure.cost       = service.cost
        if(typeof service.medind    !== "undefined") procedure.medind     = service.medind
        if(typeof service.diagnosis !== "undefined") procedure.diagnosis  = service.diagnosis
      });
      let d = new Date(procedure.ts);
      // console.log('procedure:', procedure);
      if(!procedure.bill){
        procedure.bill = {
          'number'            : invoice.number,
          'id'                : procedure.id,
          'title'             : procedure.title + '/' + procedure.id,
          'kunde'             : '',
          'steuer'            : '',
          'USt'               : '',
          'client_id'         : procedure.client_id,
          'client_firstname'  : procedure.client_firstname,
          'client_lastname'   : procedure.client_lastname,
          'client_adress1'    : '',
          'client_adress2'    : '',
          'client_country'    : '',
          'doctor_id'         : procedure.doctor_id,
          'doctor_firstname'  : procedure.doctor_firstname,
          'doctor_lastname'   : procedure.doctor_lastname,
          'note'              : procedure.note,
          'procedure'         : procedure.procedure,
          'procedure_cost'    : procedure.procedure_cost,
          'procedure_id'      : procedure.procedure_id,
          'services'          : procedure.services,
          'date'              : (d.getDate() > 9 ? d.getDate() : '0' + d.getDate()) + '.' + (d.getMonth() + 1 > 9 ? d.getMonth() + 1 : '0' + (d.getMonth() + 1)) + '.' + d.getFullYear(),
          'qty'               : procedure.services[0].qty,
          'cost'              : procedure.services[0].cost,
          'medind'            : procedure.medind,
          'diagnosis'         : procedure.diagnosis,
        }
        updatePerfProcedure(procedure)
      }
    });
    // console.log('setPerfProceduresDetail >>> globalPerfProcedures:', globalPerfProcedures);
    setPerfProcedures(globalPerfProcedures);
  }

  const updatePerfProcedure = async (procedure) => {
    // console.log('UPDATE PROCEDURE:', procedure)
    try{
      const res = await request(`${API_URL}api/note/${procedure.id}`, 'POST', {
        'title'        : procedure.title,
        'note'         : procedure.note,
        'client_id'    : procedure.client_id,
        'doctor_id'    : procedure.doctor_id,
        'procedure_id' : procedure.procedure_id,
        'bill'         : procedure.bill
      }, { Authorization: `Bearer ${token}` });
      // console.log('res:', res);
      setIsBill(true);
    }catch(err){console.log('Error:', err)}
  }

  const updateInvoice = async () => {
    // console.log('UPDATE INVOICE:', invoice)
    try{
      const res = await request(`${API_URL}api/invoice/${invoice.id}`, 'PATCH', {
        'invoice' : invoice,
      }, { Authorization: `Bearer ${token}` });
      // console.log('res:', res);
    }catch(err){console.log('Error:', err)}
  }

  const handleClick = () => {
    handlePrint();
    handleInvoiceSave();
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,  
  });

  const handleInvoiceSave = () => {
    perfProcedures.map((procedure)=>{
      updatePerfProcedure(procedure);
    });
    updateInvoice(invoice);
    onClose();
  }

  const handleInvoiceUpdate = (invoiceData) => {
    // console.log('NEW invoiceData:', invoiceData);
    setInvoice(invoiceData);
  }

  const handleProcedureUpdate = (procedureData) => {
    // console.log('NEW procedureData:', procedureData);
    setPerfProcedures(procedureData);
  }

  const handleClose = () => onClose();

  return (
    <Modal
      open={open}
      onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Scrollbar>
        <Container style={{textAlign:"center"}}>
          { invoice && isBill &&
            <div className="invoice-modal">
              <Grid container item xs={12} sm={12}>
                <Card style={{textAlign:"center", background:'darkgrey' }}>
                  <Box style={{ padding:"2vw" }}>
                    <Grid container spacing={2}>
                      <Grid item xs={10} sm={10}>
                          <ComponentToPrint 
                            ref={componentRef} 
                            inv={invoice}
                            perfProcedures={perfProcedures}
                            onInvoiceUpdate={handleInvoiceUpdate} 
                            onProcedureUpdate={handleProcedureUpdate} 
                          />
                      </Grid>

                      <Grid item xs={2} sm={2}>
                        <Grid container justifyContent="right">
                          <Grid item>
                          <Button variant='outlined' color="error" size="small" onClick={()=>{onClose()}}>Close</Button>
                          </Grid>
                        </Grid>
                        <Grid container spacing={2} sx={{mt:4}}>
                          <Grid item>
                            <Button variant='contained' onClick={handleInvoiceSave}>Save</Button>
                          </Grid>
                          <Grid item>
                            <Button variant='contained' onClick={handleClick}>Print</Button>
                          </Grid>
                        </Grid>
                        {/* <Grid container sx={{mt:4}} justifyContent="center">
                          <Grid item>
                            <Button variant='outlined' color="secondary">Use Point</Button>
                          </Grid>
                        </Grid> */}
                      </Grid>
                    </Grid>
                  </Box>
                </Card>
              </Grid>
            </div>
          }
        </Container>
      </Scrollbar>
    </Modal>
  );
};
export default PdfComponent;