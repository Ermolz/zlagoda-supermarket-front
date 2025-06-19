import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CustomerSection = () => {
  const { t } = useTranslation();
  // State for managing customer data and UI
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, add, edit
  // UC7: Сортування клієнтів за прізвищем
  const [sortField, setSortField] = useState('surname');
  // UC12: Фільтрація за відсотком знижки
  const [filterDiscount, setFilterDiscount] = useState('all');
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form data for UC1 (додавання) and UC2 (редагування)
  const [formData, setFormData] = useState({
    card_number: '',
    cust_surname: '',
    cust_name: '',
    cust_patronymic: '',
    phone_number: '',
    city: '',
    street: '',
    zip_code: '',
    percent: ''
  });

  // UC7, UC12: Fetch customers with sorting and filtering
  useEffect(() => {
    fetchCustomers();
  }, [sortField, filterDiscount]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError('');
  
    try {
      const params = new URLSearchParams();
      if (sortField) params.append('sort', sortField);
      if (filterDiscount !== 'all') params.append('percent', filterDiscount);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
  
      const response = await fetch(`http://localhost:3000/api/manager/customer-cards`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати список покупців';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
  
      const data = JSON.parse(text);
      setCustomers(data);
    } catch (err) {
      console.error('Помилка при отриманні покупців:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };  

  // UC1: Додавання нових клієнтів
  // UC2: Редагування даних клієнтів
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem('accessToken');
    
    try {
      const url = activeTab === 'edit'
        ? `http://localhost:3000/api/manager/customer-cards/${formData.card_number}`
        : 'http://localhost:3000/api/manager/customer-cards';
  
      const method = activeTab === 'edit' ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData), // надсилаємо дані без card_number
      });
  
      if (!response.ok) throw new Error('Failed to save customer');
  
      await fetchCustomers();
      setActiveTab('list');
      resetForm();
    } catch (error) {
      console.error('Error saving customer:', error);
    } finally {
      setLoading(false);
    }
  };  
  

  // UC3: Видалення даних про клієнтів
  const handleDelete = async (id) => {
    console.log('🔍 Спроба видалення клієнта з ID:', id);
    console.log('🔍 Тип ID:', typeof id);
    
    if (window.confirm(t('Ви впевнені що хочете видалити клієнта?'))) {
      setLoading(true);
      setError(''); // Очищаємо попередні помилки
      
      try {
        const token = localStorage.getItem('accessToken');
        console.log('🔍 Токен авторизації:', token ? 'Присутній' : 'Відсутній');
        
        const url = `http://localhost:3000/api/manager/customer-cards/${id}`;
        console.log('🔍 URL запиту:', url);
        
        const response = await fetch(url, {
          method: 'DELETE',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
  
        console.log('🔍 Статус відповіді:', response.status);
        console.log('🔍 Статус текст:', response.statusText);
  
        if (!response.ok) {
          const errorText = await response.text();
          console.log('🔍 Текст помилки від сервера:', errorText);
          
          let errorMessage = 'Не вдалося видалити клієнта';
          let serverError = null;
          
          try {
            serverError = JSON.parse(errorText);
            errorMessage = serverError.message || serverError.error || errorMessage;
            console.log('🔍 Розпарсена помилка:', serverError);
          } catch (parseError) {
            console.log('🔍 Не вдалося розпарсити помилку як JSON:', parseError);
          }
          
          // Показуємо детальну інформацію про помилку
          if (response.status === 400) {
            errorMessage = `Помилка запиту: ${errorMessage}. Можливо, неправильний формат номера карти або клієнта не існує.`;
          } else if (response.status === 401) {
            errorMessage = 'Помилка авторизації. Будь ласка, увійдіть в систему знову.';
          } else if (response.status === 403) {
            errorMessage = 'Недостатньо прав для видалення клієнта.';
          } else if (response.status === 404) {
            errorMessage = 'Клієнта з таким номером карти не знайдено.';
          }
          
          throw new Error(errorMessage);
        }
  
        console.log('✅ Клієнт успішно видалений');
        
        // Успішне видалення - оновлюємо список
        await fetchCustomers();
        
      } catch (err) {
        console.error('❌ Помилка при видаленні клієнта:', err);
        setError(err.message || 'Невідома помилка при видаленні клієнта');
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      card_number: '',
      cust_surname: '',
      cust_name: '',
      cust_patronymic: '',
      phone_number: '',
      city: '',
      street: '',
      zip_code: '',
      percent: ''
    });
    setSelectedCustomer(null);
  };

  // UC2: Редагування даних клієнтів
  const handleEdit = (customer) => {
    setFormData(customer);
    setSelectedCustomer(customer);
    setActiveTab('edit');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Фільтрація клієнтів за пошуком
  const filteredCustomers = customers.filter(customer => {
    if (searchQuery) {
      return customer.cust_surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
             customer.cust_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             customer.phone_number.includes(searchQuery) ||
             customer.card_number.includes(searchQuery);
    }
    return true;
  });

  // Доступні відсотки знижок для фільтрації
  const discountOptions = [
    { value: 'all', label: 'Всі' },
    { value: '5', label: '5%' },
    { value: '10', label: '10%' },
    { value: '15', label: '15%' },
    { value: '20', label: '20%' },
  ];

  return (
    <div className="p-6">
      {/* Tabs for UC1 (додавання) and list view */}
      <div className="border-b border-gray-200">
        <nav className="mb-3 flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('list');
              resetForm();
            }}
            className={`${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('customers.title')}
          </button>
          <button
            onClick={() => {
              setActiveTab('add');
              resetForm();
            }}
            className={`${
              activeTab === 'add'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('customers.form.add')}
          </button>
        </nav>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Filters for UC7 (сортування) and UC12 (фільтрація за відсотком) */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3 mt-3">
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                Сортування
              </label>
              <select
                id="sort"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="surname">За прізвищем</option>
                <option value="card_number">За номером карти</option>
                <option value="percent">За відсотком знижки</option>
              </select>
            </div>
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700">
                Відсоток знижки
              </label>
              <select
                id="discount"
                value={filterDiscount}
                onChange={(e) => setFilterDiscount(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                {discountOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                {t('common.filters.search')}
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('customers.filters.searchPlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              />
            </div>
          </div>

          {/* Customers Table - displays data for UC7, UC12 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.id')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.surname')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.name')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.patronymic')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.phone')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.discount')}
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.card_number}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.card_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.cust_surname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.cust_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.cust_patronymic}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.phone_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.percent} %</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(customer)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        {t('customers.actions.edit')}
                      </button>
                      <button
                        onClick={() => handleDelete(customer.card_number)}
                        className="text-red-600 hover:text-red-900"
                      >
                        {t('customers.actions.delete')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Form for UC1 (add) and UC2 (edit)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Header */}
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {activeTab === 'edit' ? t('Редагування інформації про клієнта') : t('Додавання нового клієнта')}
                </h3>
              </div>

              {/* Card Number - only if not editing */}
              {!selectedCustomer && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <label htmlFor="card_number" className="block text-sm font-medium text-gray-700 mb-2">
                    {t('customers.form.labels.cardNumber')} *
                  </label>
                  <input
                    type="text"
                    name="card_number"
                    id="card_number"
                    required
                    pattern="^\d+$"
                    value={formData.card_number}
                    onChange={handleChange}
                    placeholder="Введіть номер карти"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              )}

              {/* Personal Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Особисті дані</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.surname')} *
                    </label>
                    <input
                      type="text"
                      name="cust_surname"
                      id="cust_surname"
                      required
                      value={formData.cust_surname}
                      onChange={handleChange}
                      placeholder="Прізвище"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.name')} *
                    </label>
                    <input
                      type="text"
                      name="cust_name"
                      id="cust_name"
                      required
                      value={formData.cust_name}
                      onChange={handleChange}
                      placeholder="Ім'я"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="patronymic" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.patronymic')} *
                    </label>
                    <input
                      type="text"
                      name="cust_patronymic"
                      id="cust_patronymic"
                      required
                      value={formData.cust_patronymic}
                      onChange={handleChange}
                      placeholder="По батькові"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Контактна інформація</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      id="phone_number"
                      required
                      value={formData.phone_number}
                      onChange={handleChange}
                      placeholder="+380 XX XXX XXXX"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="percent" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.discount')} *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="percent"
                        id="percent"
                        required
                        min="0"
                        max="100"
                        value={formData.percent}
                        onChange={handleChange}
                        placeholder="0"
                        className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      />
                      <span className="absolute right-3 top-2 text-gray-400 text-sm">%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Address Information */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Адреса</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.city')} *
                    </label>
                    <input
                      type="text"
                      name="city"
                      id="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Місто"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.street')} *
                    </label>
                    <input
                      type="text"
                      name="street"
                      id="street"
                      required
                      value={formData.street}
                      onChange={handleChange}
                      placeholder="Вулиця та номер будинку"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>

                  <div className="md:col-span-1">
                    <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700 mb-1">
                      {t('customers.form.labels.zipCode')} *
                    </label>
                    <input
                      type="text"
                      name="zip_code"
                      id="zip_code"
                      required
                      value={formData.zip_code}
                      onChange={handleChange}
                      placeholder="Поштовий індекс"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('list');
                      resetForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                  >
                    {t('customers.actions.cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('common.messages.saving')}
                      </span>
                    ) : (
                      activeTab === 'edit' ? t('customers.actions.save') : t('customers.actions.add')
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
      )}
    </div>
  );
};

export default CustomerSection; 