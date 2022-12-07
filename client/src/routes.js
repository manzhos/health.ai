import { Navigate, useRoutes } from 'react-router-dom'
// layouts
import DashboardLayoutAdmin from './layouts/dashboardAdmin'
import DashboardLayoutUser from './layouts/dashboardUser'
import DashboardLayoutDoctor from './layouts/dashboardDoctor'
import LogoOnlyLayout from './layouts/LogoOnlyLayout'
//
import User from './pages/User'
import UserForDoctor from './pages/UserForDoctor'
import UserDocs from './pages/UserDocs'
import Login from './pages/Login'
import NotFound from './pages/Page404'
import Register from './pages/Register'
import Procedure from './pages/Procedure'
import DashboardApp from './pages/DashboardApp'
// import TimeTable from './pages/TimeTable'
import TimeTableAdmin from './pages/TimeTableAdmin'
import TimeTableUser from './pages/TimeTableUser'
import TimeTableDoctor from './pages/TimeTableDoctor'
import TimeTableOutside from './pages/TimeTableOutside'
import Note from './pages/Note'
import NoteInfo from './pages/NoteInfo'
import InvoicePrint from './pages/InvoicePrint'
import MailAdmin from './pages/MailAdmin'
import Mail from './pages/Mail'
import ConsultForm from './pages/ConsultForm'
import TestPage from './pages/TestPage'
import Thanks from './pages/Thanks'

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/admin',
      element: <DashboardLayoutAdmin />,
      children: [
        { path: 'app', element: <DashboardApp /> },
        { path: 'user', element: <User /> },
        { path: 'procedure', element: <Procedure /> },
        // { path: 'blog', element: <Blog /> },
        { path: 'timetable', element: <TimeTableAdmin /> },
        { path: 'mail', 
          element: <MailAdmin />, 
          children: [
            { path: 'mail', element: <MailAdmin /> },
            { path: 'mail', element: <MailAdmin /> },
            { path: 'mail', element: <MailAdmin /> }
          ]
        },
      ],
    },
    {
      path: '/user',
      element: <DashboardLayoutUser />,
      children: [
        // { path: 'app', element: <DashboardAppAdmin /> },
        { path: 'user', element: <User /> },
        { path: 'procedure', element: <Procedure /> },
        { path: 'timetable', element: <TimeTableUser /> },
      ],
    },
    {
      path: '/doctor',
      element: <DashboardLayoutDoctor />,
      children: [
        { path: 'user', element: <UserForDoctor /> },
        { path: 'user/docs/:id', element: <UserDocs /> },
        { path: 'procedure', element: <Procedure /> },
        { path: 'timetable', element: <TimeTableDoctor /> },
        { path: 'note', element: <Note /> },
        { path: 'mail', element: <Mail /> },
        { path: 'user/note/:id', element: <NoteInfo /> },
      ],
    },
    {
      path: '/procedure',
      element: <Procedure />
    },
    {
      path: '/timetable',
      element: <TimeTableOutside />
    },
    {
      path: '/login',
      element: <Login />,
    },
    {
      path: '/register',
      element: <Register />,
    },
    {
      path: '/invoiceprint',
      element: <InvoicePrint />,
    },
    {
      path: '/consult',
      element: <ConsultForm />,
    },
    {
      path: '/thanks',
      element: <Thanks />,
    },
    {
      path: '/test',
      element: <TestPage />,
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '/', element: <Navigate to="/login" /> },
        { path: '404', element: <NotFound /> },
        { path: '*', element: <Navigate to="/404" /> },
      ],
    },
    {
      path: '*',
      element: <Navigate to="/404" replace />,
    },
  ]);
}
