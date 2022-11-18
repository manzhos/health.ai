import React, { useContext } from 'react'
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

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import AuthSocial from '../sections/auth/AuthSocial'
import Copyright from '../components/Copyright'
import { API_URL } from '../config'

const theme = createTheme();

export default function SignUp() {
  const navigate  = useNavigate();
  // const {loading, request, error, clearError} = useHttp()
  const {request} = useHttp()
  const auth = useContext(AuthContext)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    // console.log('data', data);
    if(data.get('firstName') && data.get('lastName') && data.get('email') && data.get('password')){
      try {
        const res = await request(`${API_URL}api/user`, 'POST', {
          firstname:  data.get('firstName'),
          lastname:   data.get('lastName'),
          email:      data.get('email'),
          password:   data.get('password'),
          promo:      data.get('allowExtraEmails'),
        })
        auth.login(res.token, res.userId)
        localStorage.setItem("jwt", res.token)
        // navigate('/dashboard/user')
        Redirect(3)
      } catch (e) {console.log('error:', e)} 
      // eslint-disable-next-line
    } else alert('You need to fill fields.')
  }

  function Redirect(route) {
    // redirect to external URL
    switch (route){
      case 1:
        navigate('/admin/app')
        break
      case 2:
        navigate('/doctor/procedure')
        break
      case 3:
        navigate('/user/timetable')
        break
      default:
        console.log(`Sorry, we are out of ${route}.`)
    }
    return null
  }

  const loginLink = () => {
    navigate('/login')
  }

  return (
    <ThemeProvider theme={theme}>
      <div className='authpage'>
        <div className='logo-block'>
          <div className='logo-container'>
            <img width={45} src="../static/healthai_white.svg" alt="health.ai"/>
            <h1 style={{margin:"0 0 0 20px"}}>Health.AI</h1>
          </div>
        </div>
        <Container component="main" maxWidth="sm">
          <div className="login-modal">
            <CssBaseline />
            <Box
              sx={{
                // marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Sign up
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      autoComplete="given-name"
                      name="firstName"
                      required
                      fullWidth
                      id="firstName"
                      label="First Name"
                      autoFocus
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
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      required
                      fullWidth
                      name="password"
                      label="Password"
                      type="password"
                      id="password"
                      autoComplete="new-password"
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <FormControlLabel
                      control={<Checkbox name="allowExtraEmails" value="allowExtraEmails" color="primary" />}
                      label="I want to receive inspiration, marketing promotions and updates via email."
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign Up
                </Button>
                <Grid container justifyContent="flex-end">
                  <Grid item>
                    <Link href="#" variant="body2" onClick={loginLink}>
                      {"Already have an account? Sign in"}
                    </Link>
                  </Grid>
                </Grid>
                <AuthSocial />
              </Box>
            </Box>
          </div>
          <Copyright sx={{ mt: 5 }} style={{color:"white"}} />
        </Container>
      </div>  
    </ThemeProvider>
  );
}