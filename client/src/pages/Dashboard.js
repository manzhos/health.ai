import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

import { 
  Container,
  Box,
  Grid,
  Typography,
} from '@mui/material';

import PWAMenu            from '../components/PWAMenu';
import BetaButton from '../components/BetaButton';
import { AuthContext }    from '../context/AuthContext';
import {URL, API_URL} from '../config';
import { useHttp } from '../hooks/http.hook';


export default function Dashboard(){
  const {request} = useHttp();
  const navigate  = useNavigate();
  const {token}   = useContext(AuthContext);
  const [qrcode, setQrcode] = useState('');
  const [currentUser, setCurrentUser] = useState({});

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

  const url = `${URL}loginpwa/${userId}`

  const generateQRCode = () => {
    QRCode.toDataURL(url, (err, url)=>{
      if(err) return console.error('Error:', err);
      setQrcode(url);
    })
  }
  useEffect(()=>{generateQRCode()},[generateQRCode]);

  const getUser = useCallback(async () => {
    try {
      const user = await request(`${API_URL}api/user/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setCurrentUser(user)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getUser()}, [getUser]) 
  // console.log('currentUser:', currentUser)

  return(
    <div className='authpage'>
      <Container style={{ textAlign:"center" }}>
        {/* <BetaButton /> */}
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
          <Box sx={{ mt: 4 }}>
            <Grid container>
              <Grid item xs={12} sm={12}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 1 }}>&nbsp;</Box>
                <div className='dash-block'>
                  <Typography variant="body" sx={{ color: 'text.secondary' }}>
                    <strong>Loyalty program</strong>
                  </Typography>
                  <p className='points'>
                    {currentUser.total_points ? currentUser.total_points : '0'}
                  </p>
                  <Typography variant="body" sx={{ color: 'text.secondary' }}>
                    points
                  </Typography>
                </div>
                <div className='dash-block qr-block' sx={{ mt:3 }}>
                  <Typography variant="body" sx={{ color: 'text.secondary' }}>
                    <strong>Referral link</strong>
                  </Typography>
                  
                  <Grid sx={{ mt:3, mb: 3, ml:3, mr:3 }}>
                    {/* <img src="../static/qr/qr_botox.svg" /> */}
                    <img src={qrcode} style={{width:"100%"}}/>
                    <p style={{ margin:"20px 0 0", fontSize:"14px" }}>
                      or share this link:<br />
                      <strong style={{ fontDecoration:"underline", wordBreak: "break-all "}}>{url}</strong>
                    </p>
                  </Grid>
                  
                  <Typography variant="body" sx={{ color: 'text.secondary' }}>
                    Followers: <strong>{currentUser.total_refs ? currentUser.total_refs : '0'}</strong>
                  </Typography>
                </div>
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sm={12}>
                <Box sx={{ height:'140px' }}>&nbsp;</Box>
              </Grid>
            </Grid>
          </Box>
        </div>
      </Container>
    </div>
  )
}