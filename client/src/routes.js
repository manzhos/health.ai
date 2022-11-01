import { Navigate, useRoutes } from 'react-router-dom';
// layouts
import DashboardLayoutAdmin from './layouts/dashboardAdmin';
import DashboardLayoutUser from './layouts/dashboardUser';
import DashboardLayoutDoctor from './layouts/dashboardDoctor';
import LogoOnlyLayout from './layouts/LogoOnlyLayout';
//
import User from './pages/User';
import Login from './pages/Login';
import NotFound from './pages/Page404';
import Register from './pages/Register';
import Procedure from './pages/Procedure';
import DashboardApp from './pages/DashboardApp';
import TimeTable from './pages/TimeTable';

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
        { path: 'timetable', element: <TimeTable /> },
      ],
    },
    {
      path: '/user',
      element: <DashboardLayoutUser />,
      children: [
        // { path: 'app', element: <DashboardAppAdmin /> },
        { path: 'user', element: <User /> },
        { path: 'procedure', element: <Procedure /> },
        { path: 'timetable', element: <TimeTable /> },
      ],
    },
    {
      path: '/doctor',
      element: <DashboardLayoutDoctor />,
      children: [
        { path: 'user', element: <User /> },
        { path: 'procedure', element: <Procedure /> },
        { path: 'timetable', element: <TimeTable /> },
      ],
    },
    {
      path: 'procedure',
      element: <Procedure />
    },
    {
      path: 'timetable',
      element: <TimeTable />
    },
    {
      path: 'login',
      element: <Login />,
    },
    {
      path: 'register',
      element: <Register />,
    },
    {
      path: '/',
      element: <LogoOnlyLayout />,
      children: [
        { path: '/', element: <Navigate to="/admin/app" /> },
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
