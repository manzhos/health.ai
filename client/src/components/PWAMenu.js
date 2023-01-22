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

  const handleDashboard = () => {
    navigate('/dashboard')
  }

  const handleBooking = () => {
    navigate('/booking')
  }

  const handleCalendar = () => {
    navigate('/calendar')
  }

  const handleCommenicate = () => {
    navigate('/communicate')
  }

  return (
    <div className='user-menu'>
      <Iconify icon="material-symbols:bungalow-outline-rounded" className="comm-icon" onClick={handleDashboard}/>
      <Iconify icon="fluent:form-24-filled"                     className="comm-icon" sx={{ ml: 3 }} onClick={handleConsult}/>
      <Iconify icon="material-symbols:calendar-add-on"          className="comm-icon" sx={{ ml: 3 }} onClick={handleBooking}/>
      <Iconify icon="material-symbols:calendar-month"           className="comm-icon" sx={{ ml: 3 }} onClick={handleCalendar}/>
      <Iconify icon="material-symbols:chat-rounded"             className="comm-icon" sx={{ ml: 3 }} onClick={handleCommenicate}/>
    </div>
  )
}