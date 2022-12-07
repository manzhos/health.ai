// material
import { Stack, Button, Divider, Typography } from '@mui/material';
// component
import Iconify from '../../components/Iconify';
import { GoogleLogin } from '@react-oauth/google'
// import { Navigate } from 'react-router-dom';

// ----------------------------------------------------------------------

export default function AuthSocial() {
  // const navigate = Navigate()

  // const login = (credentialResponse) => {
  //   console.log(credentialResponse)
  //   navigate('/admin/app')
  // }

  return (
    <>
      <Divider sx={{ my: 1 }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          OR
        </Typography>
      </Divider>

      <Stack direction="row" spacing={2}>
        {/* <Button fullWidth size="large" color="inherit" variant="outlined">
          <Iconify icon="eva:google-fill" color="#DF3E30" width={22} height={22} />
        </Button> */}
        <div style={{width:"217px", margin:"0 auto"}}>
          <GoogleLogin
            onSuccess={(credentialResponse) => { console.log(credentialResponse) }}
            // onSuccess={(credentialResponse) => { login(credentialResponse) }}
            onError={() => { console.log('Login Failed') }}
          />
        </div>

        {/* <Button fullWidth size="large" color="inherit" variant="outlined">
          <Iconify icon="eva:facebook-fill" color="#1877F2" width={22} height={22} />
        </Button>

        <Button fullWidth size="large" color="inherit" variant="outlined">
          <Iconify icon="eva:twitter-fill" color="#1C9CEA" width={22} height={22} />
        </Button> */}
      </Stack>
    </>
  );
}
