import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import CashierPage from '../pages/CashierPage';


const ManagerDashboard = () => <h2>Менеджер: Dashboard</h2>;
const CashierSell = () => <h2>Касир: Продаж</h2>;

const PrivateRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem('accessToken');
  const role = localStorage.getItem('role');
  if (!token || !role) {
    return <Navigate to="/" replace />;
  }
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route
        path="/manager/dashboard"
        element={
          <PrivateRoute allowedRoles={["manager"]}>
            <ManagerDashboard />
          </PrivateRoute>
        }
      />
      <Route
        path="/cashier/sell"
        element={
          <PrivateRoute allowedRoles={["cashier"]}>
            <CashierPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

export default AppRouter; 