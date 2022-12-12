import React from 'react';
import { useRoutes } from 'react-router-dom';
// layouts

import LoginPWA from './pages/LoginPWA';
import ConsultForm from './pages/ConsultForm';

// ----------------------------------------------------------------------

export default function Router() {
  return useRoutes([
    {
      path: '/loginpwa',
      element: <LoginPWA />,
    },
    {
      path: '/consult',
      element: <ConsultForm />,
    },
    // {
    //   path: '/thanks',
    //   element: <Thanks />,
    // },
    {
      path: '/',
      element: <LoginPWA />,
    },
    {
      path: '*',
      element: <LoginPWA />,
    },
  ]);
}
