import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { 
  Container,
  Card,
  Box,
  Grid,
  FormControl,
  Typography,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField
} from '@mui/material'
// import Iconify from '../components/Iconify';

import ProcedureType      from '../components/ProcedureType'
import ProcedureList      from '../components/ProcedureList'

import CalendarOutside from '../components/CalendarOutside'
import Time from '../components/Time'

import PWAMenu            from '../components/PWAMenu'
import { AuthContext }    from '../context/AuthContext'
import {API_URL} from '../config'
import { useHttp } from '../hooks/http.hook'
import { maxHeight } from '@mui/system';


export default function Booking(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const {token}   = useContext(AuthContext)

  const [card, setCard] = useState('00000000000000000000');
  const [expMonth, setExpMonth] = useState('00');
  const [expYear, setExpYear] = useState('00');
  const [cvv, setSvv] = useState('000');

  const handlePay = () => {
    console.log('payed');
  }
  
  return(
    <Container style={{textAlign:"center"}}>
      <PWAMenu />
      <div className='logo-block'>
        <div className='logo-consult-form'>
          <img
            src="../static/sy_logo.svg"
            alt="Stunning You"
            loading="lazy"
          />
        </div>
      </div>
      <div className='consult-form'>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
          <Grid container>
            <Grid item xs={12} sm={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 5, mb: 2 }}>&nbsp;</Box>
              <Typography component="h1" variant="h5">
                Pay for the service
              </Typography>
              <p>&nbsp;</p>
              <p>
                The cost of the consultation is<br />
                <strong>50</strong>EUR
              </p>
            </Grid>
          </Grid>

          <Card style={{padding:"30px"}}  sx={{ mt: 3 }}>
            <Grid container item xs={12} sm={12} spacing={3} justifyContent="center" alignItems="center">
              <Grid item xs={12} sm={12} sx={{ mb:3 }}>
                <TextField fullWidth name="card" id="card" value={card} onChange={(e)=>{setCard(e.target.value)}} label="Card number" type="text" className='cons-input' />
              </Grid>
              <Grid item xs={4} sm={4}>
                <TextField name="exp_month" id="exp_month" value={expMonth} onChange={(e)=>{setExpMonth(e.target.value)}} label="Month" type="text" className='cons-input' />
              </Grid>
              <Grid item xs={4} sm={4}>
                <TextField name="exp_year" id="exp_year" value={expYear} onChange={(e)=>{setExpYear(e.target.value)}} label="Year" type="text" className='cons-input' />
              </Grid>
              <Grid item xs={4} sm={4}>
                <TextField name="cvv" id="cvv" value={cvv} onChange={(e)=>{setSvv(e.target.value)}} label="CVV" type="text" className='cons-input' />
              </Grid>
            </Grid>
          </Card>

          <Button
            type="button"
            // fullWidth
            variant="contained"
            sx={{ mt: 7, mb: 18 }}
            onClick={handlePay}
          >
            Pay
          </Button>
          
        </Box>
      </div>
    </Container>      
  )
}