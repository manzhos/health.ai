import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Container,
  Card,
  Box,
  Grid,
  Typography,
} from '@mui/material'
// import Iconify from '../components/Iconify';

import Scrollbar from '../components/Scrollbar'

import PWAMenu            from '../components/PWAMenu'
import { AuthContext }    from '../context/AuthContext'
import { API_URL, URL } from '../config'
import { useHttp } from '../hooks/http.hook'


export default function Checkin(){
  
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
        <Box >
          <Grid container>
            <Grid item xs={12} sm={12}>
              <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 5, mb: 1 }}>&nbsp;</Box>
              <Typography component="h1" variant="h5">
                Check in
              </Typography>
            </Grid>
          </Grid>
          
          <Card sx={{ mt:3, mb:18 }}>
              <Grid sx={{ mt:3, mb: 3, ml:3, mr:3 }}>
                <img src="../static/qr/qr_botox.svg" />
              </Grid>
          </Card>
        </Box>
      </div>
    </Container>      
  )
}