import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Sections components will be imported here
import UserSection from '../components/cashier/UserSection';
import CustomerSection from '../components/cashier/CustomerSection';
import ProductSection from '../components/cashier/ProductSection';
import StoreProductSection from '../components/cashier/StoreProductSection';
import ReportSection from '../components/cashier/ReportSection';
import CheckSection from '../components/cashier/CheckSection';


const CashierPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('employees');
  
  // Navigation items with their corresponding sections and use cases
  const navigationItems = [
    {
      id: 'user',
      title: t('Мій профіль'),
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="currentColor" className="size-5" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z" />
        </svg>

      ),
    },
    {
      id: 'customers',
      title: t('cashier.navigation.customers.title'),
      description: t('cashier.navigation.customers.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'products',
      title: t('cashier.navigation.products.title'),
      description: t('cashier.navigation.products.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'storeProdacts',
      title: t('cashier.navigation.storeProducts.title'),
      description: t('cashier.navigation.storeProducts.description'),
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.2 6h12.4M10 17a1 1 0 1 0 0 2 1 1 0 0 0 0-2zm6 0a1 1 0 1 0 0 2 1 1 0 0 0 0-2z" />
        </svg>
      ),
    },
    {
      id: 'checks',
      title: t('cashier.navigation.checks.title'),
      description: t('cashier.navigation.checks.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      title: t('cashier.navigation.reports.title'),
      description: t('cashier.navigation.reports.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'user':
        return <UserSection />;
      case 'customers':
        return <CustomerSection />;
      case 'products':
        return <ProductSection />;
      case "storeProdacts":
        return <StoreProductSection />;
      case 'checks':
        return <CheckSection />;
      case 'reports':
        return <ReportSection />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('role');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#F3F4F6] w-full">
      <nav className="bg-white shadow-sm w-full">
        <div className="max-w-none px-4 w-full">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('cashier.title')}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('cashier.logout')}
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="w-full h-full">
        <div className="grid grid-cols-1 md:grid-cols-6 min-h-[calc(100vh-4rem)]">
          {/* Navigation Sidebar */}
          <nav className="md:col-span-1 p-4 bg-[#F3F4F6]">
            {navigationItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 ease-in-out mb-2
                  ${
                    activeSection === item.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <span className={`mr-3 ${activeSection === item.id ? 'text-indigo-500' : 'text-gray-500'}`}>
                  {item.icon}
                </span>
                <span>{item.title}</span>
              </button>
            ))}
          </nav>

          {/* Main Content Area */}
          <main className="md:col-span-5 bg-[#F3F4F6] p-4 w-full">
            {renderSection()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default CashierPage;
