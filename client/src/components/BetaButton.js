import React, { useState, useContext } from 'react'
// material
import { 
  Box,
  Modal,
  Container,
  Typography,
 } from '@mui/material';
import { AuthContext }    from '../context/AuthContext'
import ReplyTicketPWA from './ReplyTicketPWA';

export default function BetaButton() {
  const {token} = useContext(AuthContext)
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
  // console.log('userId:', userId);

  const [open, setOpen] = useState(false);

  const ticket = 'beta-remark'

  const handleSend = () => {
    // console.log('send remark');
    setOpen(false);
  }

  return (
    <div className='beta-button'>
      <img src='/static/beta_button.svg' onClick={()=>{setOpen(true)}}/>

      {/* message */}
      <Modal
        open={open}
        onClose={()=>{setOpen(false)}}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="login-modal" style={{ margin:"20px", padding:"30px 0"}}>
            <Box
              sx={{
                // marginTop: 8,
                // display: 'flex',
                // flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Typography component="h1" variant="h5" style={{ textAlign:"center"}}>
                {'Send Remark'}
              </Typography>
              <p style={{ textAlign:"center"}}>{ticket}</p>
              <ReplyTicketPWA ticket={ticket} client={{'id':userId}} admin_id={null} onSend={handleSend} />
            </Box>
          </div>
        </Container>
      </Modal>
    </div>
  )
}