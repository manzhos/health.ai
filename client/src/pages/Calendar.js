import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { sentenceCase } from 'change-case';

import { 
  Container,
  Card,
  Box,
  Grid,
  Typography,
} from '@mui/material'
// import Iconify from '../components/Iconify';

import PWAMenu            from '../components/PWAMenu'
import { AuthContext }    from '../context/AuthContext'
import { API_URL, MONTH } from '../config'
import { useHttp } from '../hooks/http.hook'


export default function Calendar(){
  const {request} = useHttp()
  const navigate  = useNavigate()
  const {token}   = useContext(AuthContext)
  
  const [procedureList, setProcedureList] = useState([])
  
  function parseJwt (token) {
    if(token && token !== ''){
      var base64Url = token.split('.')[1]
      var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    }
  };
  const pJWT = parseJwt(token)
  const userId = pJWT ? pJWT.userId : null
  // console.log('userId:', userId);

  const humanDuration = (d) => {
    let hh = Math.trunc(d / 60)
    let mm = hh > 0 ? d % 60 : d
    return hh > 0 ? hh + 'h ' + ( mm ? mm + 'm' : '00m') : mm ? mm + 'm' : ''
  }
  const humanDate = (d) => {
    d = new Date(d)
    return d.getDate() + ' ' + MONTH[Number(d.getMonth())] + ' ' + d.getFullYear()
  }

  const getProcedures = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/procedures/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      // console.log('procedures:', res)
      setProcedureList(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  
  useEffect(() => {getProcedures()}, [getProcedures])

  
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
                Your booking
              </Typography>
            </Grid>
          </Grid>
          
          <Card sx={{ mt:3, mb:18 }}>
            <Grid sx={{ mt:3, mb: 3, ml:3, mr:3 }}>
              {procedureList.map((item)=>{
                return(
                  <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 3 }} onClick={()=>{navigate('/checkin')}}>
                    <Grid container key={item.id} value={item.id} sx={{ alignItems: 'center', textAlign: 'left', mt: 3 }}>
                      <Grid item xs={12} sm={12} sx={{ mb: 2 }}>
                        <p>Procedure:</p>
                        <p><strong>{sentenceCase(item.procedure)}</strong></p>
                      </Grid>
                      <Grid container>
                        <Grid item xs={6} sm={6} >
                          {humanDate(item.date)}
                        </Grid>
                        <Grid item xs={6} sm={6} >
                          at {item.time}
                        </Grid>
                      </Grid>
                      <Grid container>
                        <Grid item xs={6} sm={6} >
                          Duration: <strong>{humanDuration(item.duration)}</strong>
                        </Grid>
                        <Grid item xs={6} sm={6} >
                          Cost: <strong>{item.cost}</strong>EUR
                        </Grid>
                      </Grid>
                    </Grid>
                  </Box>
                )
              })}
            </Grid>
          </Card>
        </Box>
      </div>
    </Container>      
  )
}