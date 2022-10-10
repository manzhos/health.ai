import { Routes, Route } from 'react-router-dom'
import React from 'react'
import { AuthPage } from './pages/AuthPage'
import { AdminPage } from './pages/AdminPage'
import { DoctorPage } from './pages/DoctorPage'
import { UserPage } from './pages/UserPage'
import { RegisterPage } from './pages/RegisterPage'

export const useRoutes = (isAuthenticated) => {
  if(isAuthenticated) {
    return(
      <Routes>
        <Route path="/admin"  element={<AdminPage />}/> 
        <Route path="/doctor" element={<DoctorPage />}/>
        <Route path="/user"   element={<UserPage />}/>  
        {/* <Redirect to="/login"/> */}
      </Routes>
    )
  }
  return(
    <Routes>
      <Route path="/" element={<AuthPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<AuthPage />} />
    </Routes>
  )
}