import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import { 
  Container,
  Box,
  Grid,
  Typography,
  Button,
  TextField
} from '@mui/material';
import Iconify from '../../components/Iconify';

import { AuthContext }    from '../../context/AuthContext';
import { URL, API_URL } from '../../config';
import { useHttp } from '../../hooks/http.hook';

export default function QRPartner(){
  const {request} = useHttp();
  const navigate  = useNavigate();
  const {token}   = useContext(AuthContext);
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

  const getUser = useCallback(async () => {
    try {
      const user = await request(`${API_URL}api/user/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setCurrentUser(user);
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  useEffect(() => {getUser()}, [getUser]) 
  console.log('currentUser:', currentUser)

  const savePartnerData = async (event) => {
    event.preventDefault()
    // console.log(`saving user #${id}`)
    const data = new FormData(event.currentTarget)
    try {
      const formData = new FormData();
      formData.append('bank_acc', data.get('bank_acc'));
      formData.append('firstname', data.get('firstName'));
      formData.append('lastname',  data.get('lastName'));
      formData.append('email',     data.get('email'));
      formData.append('password',  data.get('password'));

      await fetch(`${API_URL}api/user/${userId}`, {
        method: 'POST', 
        body: formData,
      })

      navigate('/partner')
    } catch (e) { console.log('error:', e) }
  }

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
            sx={{ width: 40, height: 40, ml: 1, color: "#FCFBFD" }}
            style={{ cursor:"pointer" }}
            onClick={()=>{navigate('/qrpartner')}}
          />
        </div>
        <div id="money">
          <div id={currentUser.lastname} style={{ display:"flex", flexDirection:"column", justifyContent:"center", margin:"10vh 0", textAlign:"center" }}>
            {(currentUser && Object.keys(currentUser).length) ? (
              <Box component="form" noValidate onSubmit={savePartnerData}>
                <Grid container item spacing={2} xs={12} sm={12}>
                  <Grid item xs={12} sx={{ mb: 3 }}>
                    <TextField
                      required
                      fullWidth
                      id="bank_acc"
                      label="Bank Account"
                      name="bank_acc"
                      autoComplete="bank_acc"
                      defaultValue={currentUser.bank_acc}
                      className='input-partner'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
                      defaultValue={currentUser.firstname}
                      className='input-partner'
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      required
                      fullWidth
                      id="lastName"
                      label="Last Name"
                      name="lastName"
                      autoComplete="family-name"
                      defaultValue={currentUser.lastname}
                      className='input-partner'
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Email Address"
                      name="email"
                      autoComplete="email"
                      defaultValue={currentUser.email}
                      className='input-partner'
                    />
                  </Grid>
                  <Grid item xs={12} sm={12}>
                    <TextField
                      fullWidth
                      name="password"
                      label="New password if needed"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                      className='input-partner'
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  variant="contained"
                  sx={{ mt: 8, mb: 2 }}
                  style={{
                    background:"#FCFBFD",
                    color:"#AA4037",
                    padding:"14px 36px",
                    textTransform:"uppercase"
                  }}
                >
                  Save changes
                </Button>
              </Box>
              ) : ( <div>...loading data</div> )
            }
          </div>
        </div>
      </Container>
    </div>    
  )
}