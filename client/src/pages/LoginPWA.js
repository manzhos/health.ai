import React, { useContext, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import CssBaseline from '@mui/material/CssBaseline'
import TextField from '@mui/material/TextField'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'
import Link from '@mui/material/Link'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import { createTheme, ThemeProvider } from '@mui/material/styles'

import AuthSocial from '../sections/auth/AuthSocial'
import Copyright from '../components/Copyright'
import { API_URL } from '../config'

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'

const theme = createTheme()

export default function Login() {
  const {request} = useHttp()
  const navigate  = useNavigate()
  const auth = useContext(AuthContext)

  const [emailClient, setEmailClient] = useState('');
  const [regEmail, setRegEmail] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault()
    console.log('submit');
    // const data = new FormData(event.currentTarget)
    // if(data.get('email') && data.get('password')){
    //   try {
    //     const res = await request(`${API_URL}api/login`, 'POST', {
    //       email:      data.get('email'),
    //       password:   data.get('password'),
    //       remember:   data.get('remember'),
    //     })
    //     auth.login(res.token, res.user.id)
    //     localStorage.setItem("jwt", res.token)
    //     Redirect(res.user.usertype_id)
    //   } catch (e) {
    //     console.log('error:', e)
    //     alert('Please check your login and password details or you may need to register.')
    //   } 
    //   // eslint-disable-next-line
    // } else alert('You need to fill fields.')
  }

  function Redirect(route) {
    // redirect to external URL
    switch (route){
      case 1:
        // window.top.location = `${URL}admin/app`
        navigate('/admin/app')
        break
      case 2:
        // window.top.location = `${URL}doctor/procedure`
        navigate('/doctor/procedure')
        break
      case 3:
        // window.top.location = `${URL}user/timetable`
        navigate('/user/timetable')
        break
      default:
        console.log(`Sorry, we are out of ${route}.`)
    }
    return null
  }

  const registrationLink = () => {
    navigate('/register')
  }

  return (
    <div className='authpage'>
      <Container style={{textAlign:"center"}}>
        <div className='logo-block'>
          <div className='logo-consult-form'>
            <img
              src="../static/sy_logo_w.svg"
              alt="Stunning You"
              loading="lazy"
            />
          </div>
        </div>
        <div className='consult-form'>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 7 }}>
            <Grid container>
              <Grid item xs={12} sm={12} sx={{ mt:5, mb: 5 }}>
                <div style={{ color:"#fff", fontSize:"10px", marginBottom:"32px" }} >{"Please authorize the app for the first time."}</div>
                <AuthSocial />
              </Grid>
            </Grid>
            <Grid container>
              <Grid item xs={12} sm={12}>
                <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 3 }}>&nbsp;</Box>
              </Grid>
              <Grid item xs={12} sm={12} >
                <div onClick={() => {setRegEmail(!regEmail)}} style={{ color:"#fff", fontSize:"10px", textDecoration:"underline" }}>{"or tap to login pres email"}</div>
              </Grid>
            </Grid>
            { (regEmail) &&
              <>
                <Grid container sx={{ mt: 3 }}>
                  {/* <Grid item xs={12} sm={12}>
                    <Box sx={{ borderTop: 1, borderColor: 'divider', mt: 0, mb: 3 }}>&nbsp;</Box>
                  </Grid> */}
                  <Grid item xs={1}></Grid>
                  <Grid container item xs={10} sm={10} spacing={6}>
                    <Grid item xs={12} sm={12}>
                      <TextField fullWidth id="email" name="email" value={emailClient} onChange={(e)=>{setEmailClient(e.target.value)}} autoFocus className='login-pwa-input'/>
                    </Grid>
                  </Grid>
                </Grid>
                { (emailClient !== '') &&
                  <Button type="submit" variant="contained" sx={{ mt: 3, mb: 1 }} style={{ padding:"6px 30px", backgroundColor:"#dfbd63" }}>Login</Button>
                }
              </>
            }
          </Box>
        </div>
      </Container>
    </div>
  )
}