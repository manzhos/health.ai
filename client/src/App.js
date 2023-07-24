import React from 'react';
// import Router from './routes';
import { AuthContext }  from './context/AuthContext'
import { useMyRoutes }  from './routes'
import { useAuth }      from './hooks/auth.hook'

// import { ThemeProvider } from '@mui/material';
import ThemeProvider from './theme';
import './css/style.css';

// import ScrollToTop from './components/ScrollToTop';
// import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';
import {Loader} from './components/Loader'

import BetaButton from './components/BetaButton';

// const theme = createMuiTheme({
//   typography: {
//     fontFamily: [
//       'Poppins',
//       'regular',
//     ].join(','),
//   },});

// ----------------------------------------------------------------------

export default function App() {
  const {token, login, logout, userId, ready} = useAuth();
  const isAuthenticated = !!token;
  const routes = useMyRoutes(isAuthenticated);

  if (!ready) {
    return <Loader />
  }

  return (
    <ThemeProvider>
      <AuthContext.Provider value={{
        token, login, logout, userId, isAuthenticated
      }}>
        {/* <ScrollToTop /> */}
        {/* <BaseOptionChartStyle /> */}
        {/* { isAuthenticated && <Navbar /> } */}
        <div className="container">
          {/* <BetaButton /> */}
          {routes}
        </div>
        {/* <Router /> */}
      </AuthContext.Provider>
    </ThemeProvider>
  );
}
