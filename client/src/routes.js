import React from 'react';
import { Routes, Route } from 'react-router-dom';
import LoginPWA from './pages/LoginPWA';
import LoginPWARef from './pages/LoginPWARef';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ConsultForm from './pages/ConsultForm';
import Booking from './pages/Booking';
import Calendar from './pages/Calendar';
import Checkin from './pages/Checkin';
import BookConsult from './pages/BookConsult';
import Payment from './pages/Payment';
import CommunicationPWA from './pages/CommunicationPWA';
import Authentication from './pages/Authentication';
import Thanks from './pages/Thanks';
import DashboardLayoutAdmin from './layouts/dashboardAdmin';
import DashboardLayoutDoctor from './layouts/dashboardDoctor';
import DashboardApp from './pages/Admin/DashboardApp';
import Communication from './pages/Admin/Communication';
import TimeTable from './pages/Admin/TimeTable';
import Procedure from './pages/Admin/Procedure';
import CommunicationClient from './pages/Admin/CommunicationClient';
import LoyaltyClient from './pages/Admin/LoyaltyClient';
import Staff from './pages/Admin/Staff';
import Lead from './pages/Admin/Lead';
import Client from './pages/Admin/Client';
// import User from './pages/Admin/User';
import Invoices from './pages/Admin/Invoices';
import UserDocs from './pages/Admin/UserDocs';
import Patient from './pages/Doctor/Client';
import ClientInvoice from './pages/ClientInvoice';

// ----------------------------------------------------------------------

export const useMyRoutes = isAuthenticated => {
  // console.log('isAuthenticated:', isAuthenticated);

  if (isAuthenticated) {
    return (
      <Routes>
        <Route path="/" element={<ConsultForm />} />
        <Route path="/successauthentication" element={<Authentication />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/consult" element={<ConsultForm />} />
        <Route path="/booking" element={<Booking />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/checkin" element={<Checkin />} />
        <Route path="/bookconsult" element={<BookConsult />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/communicate" element={<CommunicationPWA />} />
        <Route path="/thanks" element={<Thanks />} />

        <Route path="/admin" element={<DashboardLayoutAdmin />}>
          <Route path="app" element={<DashboardApp />}/>
          {/* <Route path="user" element={<User />}/> */}
          <Route path="staff" element={<Staff />}/>
          <Route path="lead" element={<Lead />}/>
          <Route path="client" element={<Client />}/>
          <Route path="client/docs/:id" element={<UserDocs />}/>
          <Route path="procedure" element={<Procedure />}/>
          <Route path="communication" element={<Communication />} />
          <Route path="timetable" element={<TimeTable />} />
          <Route path="user/communication/client/:id" element={<CommunicationClient/>} />
          <Route path="user/loyalty/:id" element={<LoyaltyClient/>} />
          <Route path="invoices/" element={<Invoices/>} />
          <Route path="client/invoice/" element={<ClientInvoice/>} />
        </Route>

        <Route path="/doctor" element={<DashboardLayoutDoctor />}>
          {/* <Route path="app"           element={<DashboardApp />}/> */}
          <Route path="client" element={<Patient />}/>
          {/* <Route path="procedure"     element={<Procedure />}/> */}
          {/* <Route path="communication" element={<Communication />} /> */}
          <Route path="timetable" element={<TimeTable />} />
          {/* <Route path="user/communication/client/:id" element={<CommunicationClient/>} /> */}
        </Route>

      </Routes>
    )
  }

  return (
    <Routes>
      <Route path="*" element={<LoginPWARef />} />
      <Route path="/admin" element={<Login />} />
      <Route path="/doctor" element={<Login />} />
      <Route path="/loginpwa" element={<LoginPWARef />} />
      <Route path="/loginpwa/:id" element={<LoginPWARef />} />
      <Route path="/successauthentication" element={<Authentication />} />
    </Routes>
  )
}


