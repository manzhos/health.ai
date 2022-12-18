import React, { useContext } from 'react'
// import { useNavigate } from 'react-router-dom'

import { AuthContext }  from '../context/AuthContext'
// import { API_URL }      from '../config'
// import { useHttp }      from '../hooks/http.hook'
import PWAMenu          from '../components/PWAMenu'
import InboxPWA      from '../components/InboxPWA'

export default function CommunicationPWA(){
  // const {request} = useHttp()
  // const navigate  = useNavigate()
  const {token}   = useContext(AuthContext)

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
  const pJWT = parseJwt(token)
  const clientId = pJWT ? pJWT.userId : null
  // console.log('clientId:', clientId);

  return(
    <>
      <PWAMenu />
      <InboxPWA clientId={clientId} />
    </>
  )
}