import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';

import { 
  Container,
  Box,
  Grid,
  Typography,
  Button,
} from '@mui/material';
import Iconify from '../../components/Iconify';

import { AuthContext }    from '../../context/AuthContext';
import { URL, API_URL } from '../../config';
import { useHttp } from '../../hooks/http.hook';

export default function QRPartner(){
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
  const pJWT = parseJwt(token);
  const userId = pJWT ? pJWT.userId : null;

  const url = `${URL}loginpwa?partner_id=${userId}`

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
    <div className="partner-ms" style={{ width:"100vw", minHeight:"100vh", color:"#FCFBFD"}}>
      <Container style={{maxWidth:"640px"}}>
        <div id="topline" className='partner-top-menu'>
          <Iconify
            icon={'gg:list'}
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/partnerclients')}}
          />
          <Iconify
            icon={'majesticons:home-line'}
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/partner')}}
          />
          <Iconify
            icon={'fluent:qr-code-24-filled'}
            sx={{ width: 40, height: 40, ml: 1, color: "#D39D9A" }}
          />
        </div>
        <div id="money">
          <div id="sum" style={{ display:"flex", flexDirection:"column", justifyContent:"center", margin:"10vh 0", textAlign:"center" }}>
              <Typography variant="body">
                <strong>Become a client</strong>
              </Typography>
           
              <Grid sx={{ m:5 }}>
                <img src={qrcode} style={{width:"100%", maxWidth:"240px", margin:"0 auto"}}/>
                <p style={{ margin:"30px 0 0", fontSize:"14px" }}>
                  To register, scan the QR code or use this link:<br />
                  <strong style={{ fontDecoration:"underline", lineHeight:"48px" }}>{url}</strong>
                </p>
              </Grid>
          </div>
        </div>
      </Container>
    </div>    
  )
}