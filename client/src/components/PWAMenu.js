import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'

import Iconify from '../components/Iconify';
import { AuthContext }    from '../context/AuthContext'
// import {URL} from '../config'
import { useHttp } from '../hooks/http.hook'

export default function PWAMenu() {
  // const {request} = useHttp()
  const navigate  = useNavigate()
  // const {token}   = useContext(AuthContext)

  const handleConsult = () => {
    navigate('/consult')
  }

  const handleCommenicate = () => {
    navigate('/communicate')
  }

  return (
    <div className='user-menu'>
      <Iconify icon="fluent:form-24-filled" className="comm-icon" onClick={handleConsult}/>
      <Iconify icon="material-symbols:chat-rounded" className="comm-icon" sx={{ ml:6 }} onClick={handleCommenicate}/>
    </div>
  )
}