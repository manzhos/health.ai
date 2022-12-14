import React, { useEffect, useCallback, useState, useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { sentenceCase } from 'change-case';
import { useHttp } from '../hooks/http.hook'
import { AuthContext } from '../context/AuthContext'
import { API_URL } from '../config'
// mock
// import account from '../_mock/account';

const AccountStyle = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(2, 2.5),
  borderRadius: Number(theme.shape.borderRadius) * 1.5,
  backgroundColor: theme.palette.grey[500_12],
}));

export const UserBage = () => {
  const {token} = useContext(AuthContext)
  const pJWT = parseJwt(token)
  const userId = pJWT.userId
  const { request } = useHttp()
  const [currentUser, setCurrentUser] = useState({firstname:'', lastname:'', email:''})
  
  function parseJwt (token) {
    var base64Url = token.split('.')[1]
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
    }).join(''))
    return JSON.parse(jsonPayload)
  };
  
  const getUser = useCallback(async () => {
    try {
      const res = await request(`${API_URL}api/user/${userId}`, 'GET', null, {
        Authorization: `Bearer ${token}`
      })
      setCurrentUser(res)
    } catch (e) { console.log('error:', e)}
  }, [token, request])
  
  useEffect(() => {getUser()}, [getUser]) 
  
  const avatar = () => {
    // if(currentUser.avatar) return API_URL + 'avatars/' + currentUser.avatar
    return API_URL + 'blank-avatar.svg'
  }
  // const avatar = API_URL + 'blank-avatar.svg'

  return(
    <Box sx={{ mb: 5, mx: 2.5 }}>
      <Link underline="none" component={RouterLink} to="#">
        <AccountStyle>
          <Avatar src={avatar()} alt="photoURL" />
          <Box sx={{ ml: 2 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.primary' }}>
              {sentenceCase(currentUser.firstname)}&nbsp;{sentenceCase(currentUser.lastname)}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {currentUser.email}
            </Typography>
          </Box>
        </AccountStyle>
      </Link>
    </Box>
  )
}
