import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

// Sections components will be imported here
import EmployeeSection from '../components/manager/EmployeeSection';
import CustomerSection from '../components/manager/CustomerSection';
import ProductSection from '../components/manager/ProductSection';
import CategorySection from '../components/manager/CategorySection';
import ReportSection from '../components/manager/ReportSection';
import CheckSection from '../components/manager/CheckSection';

const ManagerPage = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [activeSection, setActiveSection] = useState('employees');
  
  // Navigation items with their corresponding sections and use cases
  const navigationItems = [
    {
      id: 'employees',
      title: t('manager.navigation.employees.title'),
      description: t('manager.navigation.employees.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
    },
    {
      id: 'customers',
      title: t('manager.navigation.customers.title'),
      description: t('manager.navigation.customers.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
    },
    {
      id: 'products',
      title: t('manager.navigation.products.title'),
      description: t('manager.navigation.products.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
    },
    {
      id: 'categories',
      title: t('manager.navigation.categories.title'),
      description: t('manager.navigation.categories.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      id: 'checks',
      title: t('manager.navigation.checks.title'),
      description: t('manager.navigation.checks.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: 'reports',
      title: t('manager.navigation.reports.title'),
      description: t('manager.navigation.reports.description'),
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'employees':
        return <EmployeeSection />;
      case 'customers':
        return <CustomerSection />;
      case 'products':
        return <ProductSection />;
      case 'categories':
        return <CategorySection />;
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
                  {t('manager.title')}
                </h1>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {t('manager.logout')}
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

export default ManagerPage;