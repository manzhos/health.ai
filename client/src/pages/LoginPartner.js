import React, { useContext, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  Button,
  Grid,
  Box,
  Container,
  TextField,
  Modal,
  Typography,
  Link,
  FormControlLabel,
  Checkbox
} from '@mui/material'
// import { createTheme } from '@mui/material/styles'

import Copyright from '../components/Copyright'
import { API_URL } from '../config'

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'

// const theme = createTheme()

export default function LoginPartner() {
  const params = useParams();
  const refId = params.id || null;
  // console.log('refId:', refId);

  const {request} = useHttp()
  const navigate  = useNavigate()
  const auth = useContext(AuthContext)

  const [emailClient, setEmailClient] = useState('');
  const [passwordClient, setPasswordClient] = useState('');
  const [passwordClientConf, setPasswordClientConf] = useState('');
  const [newUser, setNewUser] = useState(false);
  const [passRestore, setPassRestore] = useState(false);
  const [agreement, setAgreement] = useState(false);

  const handleSubmit = async () => {
    if(!agreement) alert('Please confirm that you agree to the terms and services.')
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
        usertype_id:    4
      })
      switch (res.status) {
        case 'newuser':
          setNewUser(true);
          break;
        case 'wrong_pass':
          setPassRestore(true);
          break;
        default:
          auth.login(res.token, res.user.id)
          navigate('/partner')
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
    <div className='authpage partner-ms'>
      <Container style={{textAlign:"center", maxWidth:"640px"}}>
        <div style={{ height:'20vh', maxHeight:'110px', position:'relative' }}>
          <img
            src="../static/SY-partner.svg"
            alt="Stunning You"
            loading="lazy"
            style={{ height: '20vh', maxHeight:'110px', maxWidth:'80vw', margin:'5vh auto'}}
          />
        </div>
        
        <div className='consult-form'>
          <Box noValidate sx={{ mt: 7 }}>
            <Grid container sx={{ mt: 5 }}>
              <Grid item xs={12} sm={12}>
                <Box sx={{ borderTop: 1, borderColor: '#FCFBFD', mt: 1, mb: 2 }}>&nbsp;</Box>
                <div style={{ color:"#FCFBFD", fontSize:"20px", marginBottom:"32px" }} >{"Sign in / Register"}</div>
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
                      <FormControlLabel
                        className='chkbx'
                        control={<Checkbox name="agreement" checked={agreement} onChange={() => {setAgreement(!agreement)}} color="primary" />}
                        // label="By registering you agree to our Privacy Policy."
                      />
                      <span style={{ color:"#FCFBFD", textAlign:"left", fontSize:"12px", lineHeight:"12px", marginLeft:"-16px" }}>
                        By registering you agree to our <a href="https://stunning-you.com/en/about/datenschutz.html" style={{ color:"#FCFBFD" }}>Privacy Policy</a>
                      </span>
                    </>
                  }
                </Grid>
              </Grid>
            </Grid>
            { (emailClient !== '') &&
              <Button onClick={handleSubmit} variant="contained" sx={{ mt: 2, mb: 1 }} style={{ padding:"8px 48px", backgroundColor:"#FCFBFD", color:"#AA4037" }}>{"Login"}</Button>
            }
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