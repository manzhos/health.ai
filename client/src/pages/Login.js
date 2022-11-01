import React, { useContext } from 'react'
// import { useNavigate } from 'react-router-dom'
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

import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'

const theme = createTheme()

export default function Login() {
  const {request} = useHttp()
  // const navigate  = useNavigate()
  const auth = useContext(AuthContext)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    if(data.get('email') && data.get('password')){
      try {
        const res = await request('http://localhost:3300/api/login', 'POST', {
          email:      data.get('email'),
          password:   data.get('password'),
          remember:   data.get('remember'),
        })
        auth.login(res.token, res.user.id)
        localStorage.setItem("jwt", res.token)
        Redirect(res.user.usertype_id)
      } catch (e) {
        console.log('error:', e)
        alert('Please check your login and password details or you may need to register.')
      } 
      // eslint-disable-next-line
    } else alert('You need to fill fields.')
  }

  function Redirect(route) {
    // redirect to external URL
    switch (route){
      case 1:
        window.top.location = `http://localhost:3000/admin/app`
        break
      case 2:
        window.top.location = `http://localhost:3000/doctor/procedure`
        break
      case 3:
        window.top.location = `http://localhost:3000/user/timetable`
        break
      default:
        console.log(`Sorry, we are out of ${route}.`)
    }
    return null
  }

  return (
    <ThemeProvider theme={theme}>
      <div className='authpage'>
        {/* <div className='logo-block'>
          <div className='logo-container'>
            <img width={45} src="../static/healthai_white.svg" alt="health.ai"/>
            <h1 style={{margin:"0 0 0 20px"}}>Health.AI</h1>
          </div>
        </div> */}
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
                Sign in
              </Typography>
              <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  autoFocus
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="current-password"
                />
                <FormControlLabel
                  control={<Checkbox name="remember" value="remember" color="primary" />}
                  label="Remember me"
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Sign In
                </Button>
                <Grid container>
                  <Grid item xs>
                    <Link href="#" variant="body2">
                      Forgot password?
                    </Link>
                  </Grid>
                  <Grid item>
                    <Link href="/register" variant="body2">
                      {"Don't have an account? Sign Up"}
                    </Link>
                  </Grid>
                </Grid>
                <AuthSocial />
              </Box>
            </Box>
          </div>
          <Copyright sx={{ mt: 8, mb: 4 }} style={{color:"white"}}/>
        </Container>
      </div>
    </ThemeProvider>
  )
}