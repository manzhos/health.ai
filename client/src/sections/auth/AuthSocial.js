import React from 'react';
// material
import { Stack, Button, Link, Divider, Typography } from '@mui/material';
// component
import Iconify from 'src/components/Iconify';

import { API_URL } from '../../config';

// ----------------------------------------------------------------------

export default function AuthSocial() {

  const regLinkGoogle = API_URL + 'auth/google';

  return (
    <>
      {/* <Divider sx={{ my: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
        </Typography>
      </Divider> */}

      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center" >
        <Link href={regLinkGoogle} color="inherit" justifyContent="center" alignItems="center" className="social-reg" style={{ paddingTop:"8px" }}>
          <Iconify icon="eva:google-fill" color="#DF3E30" width={26} height={26} />
        </Link>
        {/* <Button fullWidth size="large" color="inherit" variant="outlined" className="social-reg" onClick={regGoogle}>
          <Iconify icon="eva:google-fill" color="#DF3E30" width={26} height={26} />
        </Button> */}

        <Button fullWidth size="large" color="inherit" variant="outlined" className="social-reg">
          <Iconify icon="ic:baseline-apple" color="#282828" width={32} height={32} />
        </Button>

        {/* <Button fullWidth size="large" color="inherit" variant="outlined">
          <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={22} height={22} />
        </Button> */}
      </Stack>
    </>
  );
}
