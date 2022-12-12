import React from 'react';
import Router from './routes';
// theme
// import { ThemeProvider } from '@mui/material';
import ThemeProvider from './theme';
import './css/style.css';
// components
// import ScrollToTop from './components/ScrollToTop';
// import { BaseOptionChartStyle } from './components/chart/BaseOptionChart';

// const theme = createMuiTheme({
//   typography: {
//     fontFamily: [
//       'Poppins',
//       'regular',
//     ].join(','),
//   },});

// ----------------------------------------------------------------------

export default function App() {
  return (
    <ThemeProvider>
      {/* <ScrollToTop /> */}
      {/* <BaseOptionChartStyle /> */}
      <Router />
    </ThemeProvider>
  );
}
