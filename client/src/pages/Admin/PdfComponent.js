import React, { useRef, useState } from 'react';
import { useReactToPrint } from 'react-to-print';
// material
import {
  Card,
  Grid,
  Button,
  Box,
} from '@mui/material';
import { useHttp } from '../../hooks/http.hook'
import { ComponentToPrint } from './ComponentToPrint';
import {API_URL} from '../../config';

const PdfComponent = ({invoice, onClose}) => {
  const componentRef = useRef(null);
  const {loading, request} = useHttp();
  const [invs, setInvs] = useState(invoice);

  const handleClick = () => {
    handlePrint();
    onClose();
  }

  const handlePrint = useReactToPrint({
    content: () => componentRef.current,  
  });

  const handleInvoiceSave = async() => {
    try {
      const res = await request(`${API_URL}api/bill`, 'POST', {
        'invoice': invs
      });
      onClose();
    } catch (e) {console.log('error:', e)} 
  }

  const handleInvoiceUpdate = (invoiceData) => {
    // console.log('invoiceData:', invoiceData);
    setInvs(invoiceData);
    // console.log('invs:', invs);
  }

  return (
    <div>
      <Grid item xs={12} sm={12}>
        <Card style={{textAlign:"center", background:'darkgrey' }}>
          <Box style={{ padding:"2vw" }}>
            {/* <img src="/static/docs/inv_proc_2---08-01-2023.jpg" /> */}
            <Grid container spacing={2}>
              <Grid item xs={10} sm={10}>
                <ComponentToPrint ref={componentRef} inv={invoice} onInvoiceUpdate={handleInvoiceUpdate} />
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
                <Grid container sx={{mt:4}} justifyContent="center">
                  <Grid item>
                    <Button variant='outlined' color="secondary">Use Point</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Grid>
    </div>
  );
};
export default PdfComponent;