import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const CustomerSection = () => {
  const { t } = useTranslation();
  // State for managing customer data and UI
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
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
    surname: '',
    name: '',
    patronymic: '',
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
    try {
      const response = await fetch('/api/customers?' + new URLSearchParams({
        sort: sortField,
        percent: filterDiscount !== 'all' ? filterDiscount : ''
      }));
      
      if (!response.ok) throw new Error('Failed to fetch customers');
      
      const data = await response.json();
      setCustomers(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  // UC1: Додавання нових клієнтів
  // UC2: Редагування даних клієнтів
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/customers', {
        method: activeTab === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
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
    if (!window.confirm('Ви впевнені, що хочете видалити цього клієнта?')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      await fetchCustomers();
    } catch (error) {
      console.error('Error deleting customer:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      card_number: '',
      surname: '',
      name: '',
      patronymic: '',
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
      return customer.surname.toLowerCase().includes(searchQuery.toLowerCase()) ||
             customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
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
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                Сортування
              </label>
              <select
                id="sort"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
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
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Customers Table - displays data for UC7, UC12 */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.id')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.surname')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.name')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.patronymic')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.phone')}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t('customers.table.discount')}
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                      <div className="text-sm text-gray-900">{customer.surname}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{customer.patronymic}</div>
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
        <form onSubmit={handleSubmit} className="max-w-lg space-y-6">
          {!selectedCustomer && (
            <div>
              <label htmlFor="card_number" className="block text-sm font-medium text-gray-700">
                {t('customers.form.labels.cardNumber')}
              </label>
              <input
                type="text"
                name="card_number"
                id="card_number"
                required
                pattern="^\d+$"
                value={formData.card_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          )}

          <div>
            <label htmlFor="surname" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.surname')}
            </label>
            <input
              type="text"
              name="surname"
              id="surname"
              required
              value={formData.surname}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.name')}
            </label>
            <input
              type="text"
              name="name"
              id="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="patronymic" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.patronymic')}
            </label>
            <input
              type="text"
              name="patronymic"
              id="patronymic"
              required
              value={formData.patronymic}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.phone')}
            </label>
            <input
              type="tel"
              name="phone_number"
              id="phone_number"
              required
              value={formData.phone_number}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.city')}
            </label>
            <input
              type="text"
              name="city"
              id="city"
              required
              value={formData.city}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.street')}
            </label>
            <input
              type="text"
              name="street"
              id="street"
              required
              value={formData.street}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="zip_code" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.zipCode')}
            </label>
            <input
              type="text"
              name="zip_code"
              id="zip_code"
              required
              value={formData.zip_code}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="percent" className="block text-sm font-medium text-gray-700">
              {t('customers.form.labels.discount')}
            </label>
            <input
              type="number"
              name="percent"
              id="percent"
              required
              min="0"
              max="100"
              value={formData.percent}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list');
                resetForm();
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('customers.actions.cancel')}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? t('common.messages.saving') : activeTab === 'edit' ? t('customers.actions.save') : t('customers.actions.add')}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default CustomerSection; 