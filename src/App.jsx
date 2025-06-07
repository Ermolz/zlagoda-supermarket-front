import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import './i18n/config';
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50">
        <AppRouter />
      </div>
    </BrowserRouter>
  );
};

export default App;
