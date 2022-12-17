import React, { useContext } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

import { AuthContext } from '../context/AuthContext'
import { 
  Button,
  Box,
  Container,
  Typography
} from '@mui/material'
// import {API_URL} from '../config'

export default function Authentication(){
  const navigate  = useNavigate()
  const auth = useContext(AuthContext)

  const [searchParams, setSearchParams] = useSearchParams()
  const token  = searchParams.get("token"),
        userId = searchParams.get("user_id");
  // console.log('params:', token, '\n\n', userId);

  if(token && userId){
    auth.login(token, userId)
  }

  const cont = () => {
    navigate('/consult')
  }

  return (
    <div className='authpage'>
      <Container style={{textAlign:"center"}}>
        <div className='logo-block'>
          <div className='logo-consult-form'>
            <img
              src="../static/sy_logo.svg"
              alt="Stunning You"
              loading="lazy"
            />
          </div>
        </div>
        <Box>
          <Typography variant="h5" sx={{ color: 'text', mt:20, mb:3 }} >
            {'Your registration was successful'}<br />{'and you are now a member'}<br />{'of Stunning You Club'}
          </Typography>
          <Button onClick={cont} variant="contained" sx={{ mt: 20, mb: 1 }} style={{ padding:"6px 30px", backgroundColor:"#dfbd63" }}>Continue</Button>
        </Box>
      </Container>
    </div>
  )
}