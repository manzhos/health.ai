import React, { useContext, useState } from 'react'
import { useParams, useSearchParams,useNavigate } from 'react-router-dom'
import { 
  Button,
  Grid,
  Box,
  Container,
  TextField,
  Modal,
  Typography,
  Link
} from '@mui/material'
// import { createTheme } from '@mui/material/styles'

import AuthSocial from '../components/AuthSocial'
import Copyright from '../components/Copyright'
import { API_URL } from '../config'

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'

// const theme = createTheme()

export default function LoginPWARef() {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const refId = params.id || null;
  const partnerId = searchParams.get("partner_id") || null;
  // console.log('refId:', refId);
  // console.log('partnerId:', partnerId);

  const {request} = useHttp()
  const navigate  = useNavigate()
  const auth = useContext(AuthContext)

  const [emailClient, setEmailClient] = useState('');
  const [passwordClient, setPasswordClient] = useState('');
  const [passwordClientConf, setPasswordClientConf] = useState('');
  const [newUser, setNewUser] = useState(false);
  const [passRestore, setPassRestore] = useState(false);

  const appleReg = async (appleUser) => {
    // console.log('appleUser:', appleUser);
    try {
      const res = await request(`${API_URL}api/loginpwa`, 'POST', {
        email:    appleUser.email,
        password: appleUser.password,
        ref_id:   refId
      })
      // console.log('res:', res)
      auth.login(res.token, res.user.id, res.user.usertype_id)
      navigate('/consult')
    } catch (e) {
      console.log('error:', e)
      alert('Please check your login and password details or you may need to register.')
    } 
  }

  const handleSubmit = async () => {
    // console.log('submit:', emailClient, 'pass:', passwordClient, 'check pass:', passwordClientConf);
    if(newUser && passwordClient !== passwordClientConf) {
      alert('The entered passwords do not match');
      return;
    }

    try {
      const res = await request(`${API_URL}api/loginpwa`, 'POST', {
        email:          emailClient,
        password:       passwordClient,
        password_conf:  passwordClientConf,
        ref_id:         refId,
        partner_id:     partnerId
      });
      console.log(777, res);
      switch (res.status) {
        case 'newuser':
          setNewUser(true);
          break;
        case 'wrong_pass':
          setPassRestore(true);
          break;
        default:
          auth.login(res.token, res.user.id, res.user.usertype_id)
          navigate('/dashboard')
      }
    } catch (e) {
      console.log('error:', e.errors)
      alert('Please check your login and password details.')
    } 
  }

  const handleRestorePass = async () => {
    try {
      const res = await request(`${API_URL}api/restorepass`, 'POST', {
        email: emailClient,
      })
      if(res.status === 'unreg') alert('Please register first.');
      setPassRestore(false)
    } catch (e) {
      console.log('error:', e.errors)
      alert('Please check your login and password details.')
    }     
  }

  const handlePassRestoreClose = () => setPassRestore(false);

  return (
    <div className='authpage'>
      <Container style={{textAlign:"center"}}>
        <div style={{ height:'20vh', maxHeight:'110px', position:'relative' }}>
          {/* <div className='logo-consult-form' > */}
            <img
              src="../static/sy_logo.svg"
              alt="Stunning You"
              loading="lazy"
              style={{ height: '20vh', maxHeight:'110px', maxWidth:'80vw', margin:'5vh auto'}}
            />
          {/* </div> */}
        </div>
        
        <div className='consult-form'>
          <Box noValidate sx={{ mt: 7 }}>
            <Grid container sx={{ mt: 5 }}>
              <Grid item xs={12} sm={12}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mb: 1 }}>&nbsp;</Box>
                <div style={{ color:"#000", fontSize:"20px", marginBottom:"32px" }} >{"Sign in / Register"}</div>
              </Grid>
              <Grid item xs={1}></Grid>
              <Grid container item xs={10} sm={10} spacing={6}>
                <Grid item xs={12} sm={12}>
                  <TextField 
                    fullWidth sx={{ mb:1 }} 
                    id="email" 
                    name="email" 
                    value={emailClient} 
                    onChange={(e)=>{setEmailClient(e.target.value)}} 
                    label="Email"
                    autoFocus 
                    className='login-pwa-input'
                  />
                  <TextField 
                    fullWidth sx={{ mb:1 }} 
                    id="password" 
                    name="password" 
                    label="Password" 
                    type="password"
                    autoComplete="current-password"
                    value={passwordClient} 
                    onChange={(e)=>{setPasswordClient(e.target.value)}} 
                    className='login-pwa-input'
                  />
                  { newUser && 
                    <>
                      <TextField 
                        fullWidth sx={{ mb:1 }} 
                        id="passwordConf" 
                        name="passwordConf" 
                        label="Confirm Password" 
                        type="password"
                        autoComplete="current-password"
                        value={passwordClientConf} 
                        onChange={(e)=>{setPasswordClientConf(e.target.value)}} 
                        className='login-pwa-input'
                      />
                      <Typography variant="caption" >
                        By registering you agree to our <a href="https://stunning-you.com/en/about/datenschutz.html">Privacy Policy</a> and the processing of your personal data
                      </Typography>
                    </>
                  }
                </Grid>
              </Grid>
            </Grid>
            { (emailClient !== '') &&
              <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, mb: 1 }} style={{ padding:"6px 30px", backgroundColor:"#dfbd63" }}>{"Login"}</Button>
            }
            <Grid container>
              <Grid item xs={12} sm={12}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 3 }}>&nbsp;</Box>
              </Grid>
            </Grid>  
            <Grid container>
              <Grid item xs={12} sm={12} sx={{ mt:0, mb: 5 }}>
                <div style={{ color:"#000", fontSize:"18px", marginBottom:"32px" }} >{"or connect with"}</div>
                <AuthSocial onChangeClientEmail={appleReg} />
              </Grid>
            </Grid>

          </Box>
        </div>

        <Copyright sx={{ mt: 8, mb: 4 }} />

        {/* Restore Password */}
        <Modal
          open={passRestore}
          onClose={handlePassRestoreClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Container component="main" maxWidth="md" disableGutters sx={{width: "100%", height: "80vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
            <div className="login-modal" style={{ width: "85vw", maxWidth: "330px"}}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                }}
              >
                <Box component="form" noValidate onSubmit={handleSubmit} style={{width: "100%"}}>
                  <Grid container spacing={2} item xs={12} sm={12}>
                    <Grid item xs={12} sx={{ textAlign:"center" }}>
                      <Typography variant="subtitle2" component="subtitle2">
                        The password is incorrect.<br/>
                      </Typography>
                      <Typography variant="body2" component="body2">
                        If you want to restore it,<br/>
                        enter your Email below
                      </Typography>
                    </Grid>
                    <Grid item xs={12} >
                      <TextField
                        required
                        fullWidth
                        id="email"
                        label="Email"
                        name="email"
                        value={emailClient} 
                        onChange={(e)=>{setEmailClient(e.target.value)}} 
                        autoComplete="email"
                      />
                    </Grid>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign:"center" }}>
                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      sx={{ mt: 3, mb: 2 }}
                      style={{ padding:"6px 30px", backgroundColor:"#dfbd63", maxWidth:"100px" }}
                      onClick={handleRestorePass}
                    >
                      {"Send"}
                    </Button>
                  </Grid>
                  <Grid item xs={12} sx={{ textAlign:"center" }}>
                    <Link href="#" color="inherit" onClick={handlePassRestoreClose}>
                      <Typography variant="body2" component="body2">  
                        {"No, I remembered"}
                      </Typography>
                    </Link>
                  </Grid>
                </Box>
              </Box>
            </div>
          </Container>
        </Modal>

      </Container>
    </div>
  )
}