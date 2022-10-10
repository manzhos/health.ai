import React from 'react';
// import axios from 'axios';
import './css/style.css';
import { useRoutes } from './routes';
import { BrowserRouter } from 'react-router-dom';

function App() {
  const routes = useRoutes(false);

  return (
    <BrowserRouter>
      <div className="App">
        {routes}
      </div>
    </BrowserRouter>
  );
}

export default App;
