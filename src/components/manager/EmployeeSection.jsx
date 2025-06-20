import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const EmployeeSection = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [activeTab, setActiveTab] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id_employee: '',
    surname: '',
    name: '',
    patronymic: '',
    role: 'cashier',
    salary: '',
    dateOfBirth: '',
    dateOfStart: '',
    phone_number: '',
    city: '',
    street: '',
    zip_code: '',
    email: '',
    password: ''
  });
  

  useEffect(() => {
    fetchEmployees();
  }, [sortField, searchQuery]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');
  
    try {
      let url;
      const params = new URLSearchParams();
  
      if (sortField === 'role') {
        url = `http://localhost:3000/api/manager/employees/cashiers`;
      } else if (searchQuery.trim()) {
        url = `http://localhost:3000/api/manager/employees/search?surname=${encodeURIComponent(searchQuery.trim())}`;
      } else {
        if (sortField) params.append('sort', sortField);
        url = `http://localhost:3000/api/manager/employees?${params.toString()}`;
      }
      
  
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
  
      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати список співробітників';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
  
      const data = await response.json();
  
      const transformedData = data.map(emp => ({
        id_employee: emp.id_employee,
        surname: emp.empl_surname,
        name: emp.empl_name,
        patronymic: emp.empl_patronymic,
        role: emp.empl_role,
        salary: emp.salary.replace('.0000', ''),
        dateOfBirth: emp.date_of_birth.split('T')[0],
        dateOfStart: emp.date_of_start.split('T')[0],
        phone_number: emp.phone_number,
        city: emp.city,
        street: emp.street,
        zip_code: emp.zip_code,
      }));
  
      setEmployees(transformedData);
    } catch (err) {
      console.error('Помилка при отриманні співробітників:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const token = localStorage.getItem('accessToken');
  
    try {
      const isEdit = activeTab === 'edit';
  
      const url = isEdit
        ? `http://localhost:3000/api/manager/employees/${formData.id_employee}`
        : 'http://localhost:3000/api/manager/employees';
  
      const method = isEdit ? 'PUT' : 'POST';
  
      // Використовуємо правильні назви полів з formData
      const {
        surname = '',
        name = '',
        patronymic = '',
        role = '',
        salary = '',
        dateOfBirth = '',
        dateOfStart = '',
        phone_number = '',
        city = '',
        street = '',
        zip_code = '',
        email = '',
        password = ''
      } = formData || {};      
  
      // Логування для дебагу
      console.log('FormData before submission:', formData);
  
      // Перевірка обов'язкових полів
      const requiredFields = [
        { field: 'surname', value: surname },
        { field: 'name', value: name },
        { field: 'role', value: role },
        { field: 'salary', value: salary },
        { field: 'dateOfBirth', value: dateOfBirth },
        { field: 'dateOfStart', value: dateOfStart },
        { field: 'phone_number', value: phone_number },
        { field: 'city', value: city },
        { field: 'street', value: street },
        { field: 'zip_code', value: zip_code },
        { field: 'email', value: email }
      ];

      // Для нових співробітників password також обов'язковий
      if (!isEdit) {
        requiredFields.push({ field: 'password', value: password });
      }
      
      const missingFields = requiredFields.filter(({ value }) => {
        return !value || value.toString().trim() === '';
      });
  
      if (missingFields.length > 0) {
        console.error('Missing required fields:', missingFields.map(f => f.field));
        alert(`Заповніть обов'язкові поля: ${missingFields.map(f => f.field).join(', ')}`);
        return;
      }
  
      const bodyData = {
        empl_surname: surname.trim(),
        empl_name: name.trim(),
        empl_patronymic: patronymic.trim(),
        empl_role: role.trim(),
        salary: parseFloat(salary) || 0,
        date_of_birth: dateOfBirth,
        date_of_start: dateOfStart,
        phone_number: phone_number.trim(),
        city: city.trim(),
        street: street.trim(),
        zip_code: zip_code.trim(),
        email: email.trim(),
        password: password.trim()
      };
      
      // Для edit режиму, якщо password порожній - не відправляємо його
      if (isEdit && !password.trim()) {
        delete bodyData.password;
      }
  
      console.log('Body data to send:', bodyData);
  
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(bodyData),
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Raw server response:', errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error('Parsed server error:', errorData);
          throw new Error(errorData.message || `Server error: ${response.status}`);
        } catch (parseError) {
          console.error('Could not parse error as JSON:', parseError);
          throw new Error(`Server returned ${response.status}: ${errorText}`);
        }
      }
  
      await fetchEmployees();
      setActiveTab('list');
      resetForm();
    } catch (error) {
      console.error('Error saving employee:', error);
      alert('Помилка при збереженні співробітника: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('employees.messages.deleteConfirm'))) {
      try {
        await axios.delete(`http://localhost:3000/api/manager/employees/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError(t('employees.messages.error'));
      }
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      id_employee: employee.id_employee,
      surname: employee.surname,
      name: employee.name,
      patronymic: employee.patronymic,
      role: employee.role,
      salary: employee.salary,
      dateOfBirth: employee.dateOfBirth,
      dateOfStart: employee.dateOfStart,
      phone_number: employee.phone_number,
      city: employee.city,
      street: employee.street,
      zip_code: employee.zip_code,
      email: employee.email || '',
      password: ''
    });
    setActiveTab('edit');
  };

  const resetForm = () => {
    setFormData({
      id_employee: '',
      surname: '',
      name: '',
      patronymic: '',
      role: 'cashier',
      salary: '',
      dateOfBirth: '',
      dateOfStart: '',
      phone_number: '',
      city: '',
      street: '',
      zip_code: '',
      email: '',
      password: ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading && employees.length === 0) {
    return <div className="p-6 text-center">Завантаження...</div>;
  }

  if (error && employees.length === 0) {
    return <div className="p-6 text-center text-red-600">Помилка: {error}</div>;
  }

  return (
    <div className="p-6">
      {/* Tabs for navigation */}
      <div className="border-b border-gray-200">
        <nav className="mb-3 flex space-x-8">
          <button
            onClick={() => {
              setActiveTab('list');
              resetForm();
              setSelectedEmployee(null);
            }}
            className={`${
              activeTab === 'list'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('employees.title')}
          </button>
          <button
            onClick={() => {
              setActiveTab('add');
              resetForm();
              setSelectedEmployee(null);
            }}
            className={`${
              activeTab === 'add'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {t('employees.form.add')}
          </button>
        </nav>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Filters for sorting and searching */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 mt-3">
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
                <option value="role">За посадою</option>
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
                placeholder="Пошук за прізвищем"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              />
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white shadow-sm rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.id')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.surname')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.name')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.patronymic')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.role')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.salary')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.dateOfBirth')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.dateOfStart')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.phone')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.city')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.street')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.zipCode')}</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.actions')}</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {employees.map((employee) => (
                  <tr key={employee.id_employee}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.id_employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.surname}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.patronymic}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{t(`employees.form.roles.${employee.role}`)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.salary} {t('common.currency')}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.dateOfBirth}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.dateOfStart}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.city}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.street}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">{employee.zip_code}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                      <div className="flex justify-center space-x-3">
                        <button onClick={() => handleEdit(employee)} className="text-indigo-600 hover:text-indigo-900">{t('employees.actions.edit')}</button>
                        <button onClick={() => handleDelete(employee.id_employee)} className="text-red-600 hover:text-red-900">{t('employees.actions.delete')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Form for add and edit
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'edit' ? 'Редагування інформації про співробітника' : 'Додавання нового співробітника'}
              </h3>
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Особисті дані</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="surname" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.surname')} *
                  </label>
                  <input
                    type="text"
                    name="surname"
                    id="surname"
                    required
                    value={formData.surname}
                    onChange={handleChange}
                    placeholder="Прізвище"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.name')} *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ім'я"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="patronymic" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.patronymic')}
                  </label>
                  <input
                    type="text"
                    name="patronymic"
                    id="patronymic"
                    value={formData.patronymic}
                    onChange={handleChange}
                    placeholder="По батькові"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Work Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Робоча інформація</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.role')} *
                  </label>
                  <select
                    name="role"
                    id="role"
                    required
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="cashier">{t('employees.form.roles.cashier')}</option>
                    <option value="manager">{t('employees.form.roles.manager')}</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="salary" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.salary')} *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="salary"
                      id="salary"
                      required
                      min="0"
                      step="0.01"
                      value={formData.salary}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full px-3 py-2 pr-12 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    />
                    <span className="absolute right-3 top-2 text-gray-400 text-sm">грн</span>
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.dateOfBirth')} *
                  </label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    id="dateOfBirth"
                    required
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfStart" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.dateOfStart')} *
                  </label>
                  <input
                    type="date"
                    name="dateOfStart"
                    id="dateOfStart"
                    required
                    value={formData.dateOfStart}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Контактна інформація</h4>
              <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.phone')} *
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
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Пошта')} *
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('Пароль')} {activeTab === 'add' ? '*' : '(залиште порожнім для збереження поточного)'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required={activeTab === 'add'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={activeTab === 'add' ? "********" : "Залиште порожнім для збереження поточного"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Адреса</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('employees.form.labels.city')} *
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
                    {t('employees.form.labels.street')} *
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
                    {t('employees.form.labels.zipCode')} *
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
                    setSelectedEmployee(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  {t('employees.actions.cancel')}
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
                    activeTab === 'edit' ? t('employees.actions.save') : t('employees.actions.add')
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

export default EmployeeSection;