import React from 'react';
import { useNavigate } from 'react-router-dom';
// material
import { Stack, Button, Link, Divider, Typography } from '@mui/material';
// component
import Iconify from '../../components/Iconify';

import { API_URL } from '../../config';

// ----------------------------------------------------------------------

export default function AuthSocial() {
  const navigate  = useNavigate()

  const regLinkGoogle = API_URL + 'auth/google';

  const handleApple = () => {
    navigate('/consult');
  }

  return (
    <>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" >

        <Link href={regLinkGoogle} color="inherit" justifyContent="center" alignItems="center" className="social-reg" style={{ paddingTop:"8px" }}>
          <Iconify icon="eva:google-fill" color="#DF3E30" width={26} height={26} />
        </Link>

        <Button fullWidth size="large" color="inherit" variant="outlined" className="social-reg" onClick={handleApple}>
          <Iconify icon="ic:baseline-apple" color="#282828" width={32} height={32} />
        </Button>

      </Stack>
    </>
  );
}
