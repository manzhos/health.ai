import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Button,
  Grid,
  Box,
  Container,
  TextField
} from '@mui/material'
// import { createTheme } from '@mui/material/styles'

import AuthSocial from '../components/AuthSocial'
import Copyright from '../components/Copyright'
import { API_URL } from '../config'

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'

// const theme = createTheme()

export default function LoginPWA() {
  const {request} = useHttp()
  const navigate  = useNavigate()
  const auth = useContext(AuthContext)

  const [emailClient, setEmailClient] = useState('');
  const [passwordClient, setPasswordClient] = useState('');
  const [verifyPasswordClient, setVerifyPasswordClient] = useState('');
  const [regEmail, setRegEmail] = useState(false);

  const appleReg = async (appleUser) => {
    console.log('appleUser:', appleUser);
    try {
      const res = await request(`${API_URL}api/loginpwa`, 'POST', {
        email:    appleUser.email,
        password: appleUser.password
      })
      // console.log('res:', res)
      auth.login(res.token, res.user.id)
      navigate('/consult')
    } catch (e) {
      console.log('error:', e)
      alert('Please check your login and password details or you may need to register.')
    } 
  }

  const handleSubmit = async () => {
    // console.log('submit:', emailClient, 'pass:', passwordClient, 'check pass:', verifyPasswordClient);
    if(passwordClient !== verifyPasswordClient) {
      alert('The entered passwords do not match');
      return;
    }

    try {
      const res = await request(`${API_URL}api/loginpwa`, 'POST', {
        email:    emailClient,
        password: passwordClient,
      })
      auth.login(res.token, res.user.id)
      navigate('/consult')
    } catch (e) {
      console.log('error:', e)
      alert('Please check your login and password details...')
    } 
  }


  return (
    <div className='authpage'>
      <Container style={{textAlign:"center"}}>
        <div style={{ height:'20vh', maxHeight:'110px', position:'relative' }}>
          {/* <div className='logo-consult-form' > */}
            <img
              src="../static/sy_logo.svg"
              alt="Stunning You"
              loading="lazy"
              style={{ height: '20vh', maxWidth:'80vw', margin:'5vh auto'}}
            />
          {/* </div> */}
        </div>
        <div className='consult-form'>
          <Box noValidate sx={{ mt: 7 }}>
            <Grid container>
              <Grid item xs={12} sm={12} sx={{ mt:5, mb: 5 }}>
                {/* <div style={{ color:"#000", fontSize:"10px", marginBottom:"32px" }} >{"Please authorize the app for the first time."}</div> */}
                <div style={{ color:"#000", fontSize:"24px", marginBottom:"32px" }} >{"Sign in."}</div>
                <AuthSocial onChangeClientEmail={appleReg} />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sm={12}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 1 }}>&nbsp;</Box>
              </Grid>
              <Grid item xs={12} sm={12} >
                <div onClick={() => {setRegEmail(!regEmail); console.log(regEmail)}} style={{ color:"#000", fontSize:"14px", textDecoration:"underline", cursor:"pointer" }}>{"or tap to login pres email"}</div>
              </Grid>
            </Grid>  
            { (regEmail) &&
                <>
                  <Grid container sx={{ mt: 5 }}>
                    {/* <Grid item xs={12} sm={12}>
                      <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 3 }}>&nbsp;</Box>
                    </Grid> */}
                    <Grid item xs={1}></Grid>
                    <Grid container item xs={10} sm={10} spacing={6}>
                      <Grid item xs={12} sm={12}>
                        <TextField fullWidth sx={{ mb:1 }} id="email" name="email" value={emailClient} onChange={(e)=>{setEmailClient(e.target.value)}} label="Email" autoFocus className='login-pwa-input'/>
                        <TextField fullWidth sx={{ mb:1 }} id="password" name="password" value={passwordClient} onChange={(e)=>{setPasswordClient(e.target.value)}} label="Password" className='login-pwa-input'/>
                        <TextField fullWidth sx={{ mb:1 }} id="verify_password" name="verify_password" value={verifyPasswordClient} onChange={(e)=>{setVerifyPasswordClient(e.target.value)}} label="Repeat Password" className='login-pwa-input'/>
                      </Grid>
                    </Grid>
                  </Grid>
                  { (emailClient !== '') &&
                    <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, mb: 1 }} style={{ padding:"6px 30px", backgroundColor:"#dfbd63" }}>Login</Button>
                  }
                  <Grid container>
                    <Grid item xs={12} sm={12}>
                      <Box sx={{ width:'100%', height:'140px'}}>&nbsp;</Box>
                    </Grid>
                  </Grid>
                </>
              }
          </Box>
        </div>

        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    </div>
  )
}