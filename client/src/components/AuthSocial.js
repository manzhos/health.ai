import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// material
import { Stack, Button, Link, Modal, Box, Grid, Container, TextField } from '@mui/material';
// component
import Iconify from './Iconify';

import { AUTH_URL } from '../config';

// ----------------------------------------------------------------------

export default function AuthSocial({ onChangeClientEmail }) {
  // const navigate  = useNavigate()

  const regLinkGoogle = AUTH_URL + 'google';

  const [open, setOpen] = useState(false)
  const handleAppleOpen = () => setOpen(true)
  const handleAppleClose = () => setOpen(false)

  const handleSubmit = (event) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const appleUser = {
      'email': data.get('email'),
      'password': data.get('password')
    }
    if(appleUser.email && appleUser.email !== '' && appleUser.password && appleUser.password !==''){
      setOpen(false);
      onChangeClientEmail(appleUser);
    }
  }

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" >

        <Link href={regLinkGoogle} color="inherit" justifyContent="center" alignItems="center" className="social-reg" style={{ paddingTop:"8px" }}>
          <Iconify icon="eva:google-fill" color="#DF3E30" width={26} height={26} />
        </Link>

        <Button fullWidth size="large" color="inherit" variant="outlined" className="social-reg" onClick={handleAppleOpen}>
          <Iconify icon="ic:baseline-apple" color="#282828" width={32} height={32} />
        </Button>

      </Stack>

      {/* registration per Apple ID */}
      <Modal
        open={open}
        onClose={handleAppleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Container component="main" maxWidth="md" disableGutters>
          <div className="login-apple">
            <Box
              sx={{
                // marginTop: 8,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Iconify icon="ic:baseline-apple" color="#282828" width={32} height={32} />
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                <Grid container spacing={2} item xs={12} sm={12}>
                  <Grid item xs={12} >
                    <TextField
                      required
                      fullWidth
                      id="email"
                      label="Apple ID"
                      name="email"
                      autoComplete="email"
                    />
                    <TextField
                      required
                      fullWidth
                      id="password"
                      label="Password"
                      name="password"
                      sx={{ mt:1 }}
                    />
                  </Grid>
                </Grid>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{ mt: 3, mb: 2 }}
                >
                  Continue
                </Button>
              </Box>
            </Box>
          </div>
        </Container>
      </Modal>
          


    </>
  );
}
