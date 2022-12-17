import React, { useEffect, useCallback, useState, useRef } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { alpha } from '@mui/material/styles';
import { Box, Divider, Typography, Stack, MenuItem, Avatar, IconButton } from '@mui/material';
import { sentenceCase } from 'change-case';
// components
import MenuPopover from '../components/MenuPopover';
import { useHttp } from '../hooks/http.hook'
import { API_URL } from '../config'
// ----------------------------------------------------------------------

const MENU_OPTIONS = [
  // {
  //   label: 'Home',
  //   icon: 'eva:home-fill',
  //   linkTo: '/',
  // },
  {
    label: 'Profile',
    icon: 'eva:person-fill',
    linkTo: '#',
  },
  {
    label: 'Settings',
    icon: 'eva:settings-2-fill',
    linkTo: '#',
  },
];

// ----------------------------------------------------------------------

export default function AccountPopover() {
  const anchorRef = useRef(null)
  const jwt = localStorage.getItem("jwt")
  const { request } = useHttp()
  const navigate  = useNavigate()
  const [open, setOpen] = useState(null)
  const [currentUser, setCurrentUser] = useState({firstname:'', lastname:'', email:''})

  const handleOpen = (event) => {
    setOpen(event.currentTarget)
  }

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
  const pJWT = parseJwt(jwt)
  const userId = pJWT ? pJWT.userId : null
  // console.log('UserId:', userId)

  const getUser = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/user/${userId}`, 'GET', null, {
        Authorization: `Bearer ${jwt}`
      })
      setCurrentUser(res)
    } catch (e) { console.log('error:', e)}
  }, [jwt, request])
  
  useEffect(() => {getUser()}, [getUser]) 
  // console.log('currentUser:', currentUser)
  
  const avatar = () => {
    if(currentUser.avatar) return API_URL + 'avatars/' + currentUser.avatar
    return API_URL + 'blank-avatar.svg'
  }
  // const avatar = API_URL + 'blank-avatar.svg'


  const handleClose = () => {
    localStorage.setItem("jwt", '')
    navigate('/login')
    // window.top.location = `https://stunning-you.com`
  }

  return (
    <>
      <IconButton
        ref={anchorRef}
        onClick={handleOpen}
        sx={{
          p: 0,
          ...(open && {
            '&:before': {
              zIndex: 1,
              content: "''",
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              position: 'absolute',
              bgcolor: (theme) => alpha(theme.palette.grey[900], 0.8),
            },
          }),
        }}
      >
        <Avatar src={avatar()} alt="photoURL" />
      </IconButton>

      <MenuPopover
        open={Boolean(open)}
        anchorEl={open}
        onClose={handleClose}
        sx={{
          p: 0,
          mt: 1.5,
          ml: 0.75,
          '& .MuiMenuItem-root': {
            typography: 'body2',
            borderRadius: 0.75,
          },
        }}
      >
        <Box sx={{ my: 1.5, px: 2.5 }}>
          <Typography variant="subtitle2" noWrap>
          {sentenceCase(currentUser.firstname)}&nbsp;{sentenceCase(currentUser.lastname)}
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {currentUser.email}
          </Typography>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack sx={{ p: 1 }}>
          {MENU_OPTIONS.map((option) => (
            <MenuItem key={option.label} to={option.linkTo} component={RouterLink} onClick={handleClose}>
              {option.label}
            </MenuItem>
          ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem onClick={handleClose} sx={{ m: 1 }}>
          Logout
        </MenuItem>
      </MenuPopover>
    </>
  );
}
