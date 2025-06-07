import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import LoginPage from '../pages/LoginPage';
import RegisterPage from '../pages/RegisterPage';
import CashierPage from '../pages/CashierPage';
import ManagerPage from '../pages/ManagerPage';

const CashierSell = () => {
  const { t } = useTranslation();
  return <h2>{t('cashier.sell')}</h2>;
};

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
  <Routes>
    <Route path="/" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route
      path="/manager/*"
      element={
        <PrivateRoute allowedRoles={["manager"]}>
          <ManagerPage />
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
);

export default AppRouter; 