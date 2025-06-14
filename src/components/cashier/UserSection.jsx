import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CashierProfileSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for managing profile data and UI
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    
    if (!token || !role) {
      navigate('/');
    }
  }, [navigate]);

  // Helper function to make authenticated API calls
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        navigate('/');
        throw new Error('Unauthorized');
      }
      
      return response;
    } catch (error) {
      console.error('API call error:', error);
      if (error.message === 'Unauthorized') {
        throw error;
      }
      throw new Error('Failed to fetch data');
    }
  };

  // Fetch cashier profile
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const response = await authenticatedFetch('http://localhost:3000/api/cashier/profile');
        
        if (response.ok) {
          const data = await response.json();
          console.log(data)
          setProfile(data);
        } else {
          const errorData = await response.json().catch(() => ({ message: 'Невідома помилка' }));
          setError(errorData.message || 'Помилка завантаження профілю');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        setError('Помилка завантаження профілю');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Не вказано';
    try {
      return new Date(dateString).toLocaleDateString('uk-UA');
    } catch (error) {
      return 'Невірний формат дати';
    }
  };

  // Format salary
  const formatSalary = (salary) => {
    if (!salary) return 'Не вказано';
    return `${parseFloat(salary).toFixed(2)} грн`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8">
            <div className="text-red-600 text-lg font-medium mb-2">Помилка</div>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Спробувати знову
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="text-center py-8 text-gray-500">
            Профіль не знайдено
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Мій профіль</h2>
        </div>

        {/* Profile Content */}
        <div className="px-6 py-6">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            
            {/* Personal Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Особиста інформація</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Прізвище</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.empl_surname || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Ім'я</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.empl_name || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">По батькові</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.empl_patronymic || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Дата народження</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(profile.date_of_birth)}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Контактна інформація</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Телефон</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.phone_number || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Місто</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.city || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Вулиця</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.street || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Поштовий індекс</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.zip_code || 'Не вказано'}</p>
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Робоча інформація</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">ID співробітника</label>
                  <p className="mt-1 text-sm text-gray-900">{profile.id_employee || 'Не вказано'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Посада</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {profile.empl_role === 'cashier' ? 'Касир' : profile.empl_role || 'Не вказано'}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Зарплата</label>
                  <p className="mt-1 text-sm text-gray-900">{formatSalary(profile.salary)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Дата початку роботи</label>
                  <p className="mt-1 text-sm text-gray-900">{formatDate(profile.date_of_start)}</p>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Додаткова інформація</h3>
              <div className="space-y-4">
                {profile.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.email}</p>
                  </div>
                )}
                {profile.username && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Ім'я користувача</label>
                    <p className="mt-1 text-sm text-gray-900">{profile.username}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Статус</label>
                  <p className="mt-1 text-sm text-gray-900">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Активний
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Statistics Section (if available) */}
          {(profile.total_checks || profile.total_sales || profile.last_check_date) && (
            <div className="mt-8 bg-indigo-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Статистика роботи</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {profile.total_checks && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{profile.total_checks}</div>
                    <div className="text-sm text-gray-500">Створено чеків</div>
                  </div>
                )}
                {profile.total_sales && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{formatSalary(profile.total_sales)}</div>
                    <div className="text-sm text-gray-500">Загальні продажі</div>
                  </div>
                )}
                {profile.last_check_date && (
                  <div className="text-center">
                    <div className="text-2xl font-bold text-indigo-600">{formatDate(profile.last_check_date)}</div>
                    <div className="text-sm text-gray-500">Останній чек</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CashierProfileSection;