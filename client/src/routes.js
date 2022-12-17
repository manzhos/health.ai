import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPWA from './pages/LoginPWA';
import Login from './pages/Login';
import ConsultForm from './pages/ConsultForm';
import Authentication from './pages/Authentication';
import DashboardLayoutAdmin from './layouts/dashboardAdmin';
// import DashboardApp from './pages/Admin/DashboardApp';
import Communication from './pages/Admin/Communication';
import User from './pages/Admin/User';

// ----------------------------------------------------------------------

export const useMyRoutes = isAuthenticated => {
  // console.log('isAuthenticated:', isAuthenticated);

  if (isAuthenticated) {
    return (
      <Routes>
        <Route path="/"  element={<ConsultForm />} />
        <Route path="/authentication" element={<Authentication />} />
        <Route path="/consult"  element={<ConsultForm />} />
        {/* <Route path="/thanks"   element={<Thanks />} exact /> */}

        <Route path="/admin" element={<DashboardLayoutAdmin />}>
          {/* <Route path="app"           element={<DashboardApp />}/> */}
          <Route path="user"          element={<User />}/>
          {/* <Route path="procedure"     element={<Procedure />}/> */}
          <Route path="communication" element={<Communication />}/>
        </Route>

      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="*" element={<LoginPWA />} />
      <Route path="/admin" element={<Login />} />
      <Route path="/loginpwa" element={<LoginPWA />} />
      <Route path="/authentication" element={<Authentication />} />
    </Routes>
  )
}


