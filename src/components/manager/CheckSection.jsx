import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const CheckSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for managing check data and UI
  const [checks, setChecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [reportType, setReportType] = useState('all'); // all, cashier, product
  
  // Reference data
  const [cashiers, setCashiers] = useState([]);
  const [products, setProducts] = useState([]);
  
  // Filters state
  const [selectedCashier, setSelectedCashier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    
    if (!token || !role || role !== 'manager') {
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
          'Authorization': `Bearer ${token}`
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
      if (error.message === 'Unauthorized') {
        throw error;
      }
      console.error('API call failed:', error);
      throw new Error('Failed to fetch data');
    }
  };

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch cashiers
        const cashiersResponse = await authenticatedFetch('/api/employees?role=cashier');
        if (cashiersResponse.ok) {
          const cashiersData = await cashiersResponse.json();
          setCashiers(cashiersData);
        }

        // Fetch products
        const productsResponse = await authenticatedFetch('/api/products');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };

    fetchReferenceData();
  }, []);

  // UC8: Отримання інформації про усі чеки, створені певним касиром за певний період
  const fetchCashierChecks = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/checks?' + new URLSearchParams({
        cashier_id: selectedCashier,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }));
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setChecks(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  // UC9: Отримання інформації про усі чеки, створені усіма касирами за певний період
  const fetchAllChecks = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/checks?' + new URLSearchParams({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }));
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setChecks(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  // UC10: Отримання інформації про усі чеки з певним UPC товару за певний період
  const fetchProductChecks = async () => {
    setLoading(true);
    try {
      const response = await authenticatedFetch('/api/checks?' + new URLSearchParams({
        product_id: selectedProduct,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }));
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setChecks(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle report generation based on type
  const handleGenerateReport = async () => {
    switch (reportType) {
      case 'cashier':
        await fetchCashierChecks();
        break;
      case 'product':
        await fetchProductChecks();
        break;
      default:
        await fetchAllChecks();
        break;
    }
  };

  // Reset data when changing report type
  useEffect(() => {
    setChecks([]);
    setDateRange({ startDate: '', endDate: '' });
    setSelectedCashier('');
    setSelectedProduct('');
  }, [reportType]);

  const renderFilters = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {reportType === 'cashier' && (
            <div>
              <label htmlFor="cashier" className="block text-sm font-medium text-gray-700">
                {t('checks.filters.cashier')}
              </label>
              <select
                id="cashier"
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">{t('checks.filters.selectCashier')}</option>
                {cashiers.map(cashier => (
                  <option key={cashier.id_employee} value={cashier.id_employee}>
                    {cashier.surname} {cashier.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {reportType === 'product' && (
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                {t('checks.filters.product')}
              </label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">{t('checks.filters.selectProduct')}</option>
                {products.map(product => (
                  <option key={product.id_product} value={product.id_product}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              {t('checks.filters.startDate')}
            </label>
            <input
              type="date"
              id="startDate"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              {t('checks.filters.endDate')}
            </label>
            <input
              type="date"
              id="endDate"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
        </div>
      </div>
    );
  };

  const renderChecks = () => {
    if (loading) {
      return <div className="text-center py-4">Завантаження...</div>;
    }

    if (!checks.length) {
      return <div className="text-center py-4 text-gray-500">{t('checks.noData')}</div>;
    }

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('checks.table.checkNumber')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('checks.table.cashier')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('checks.table.date')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('checks.table.products')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('checks.table.total')}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              {t('checks.table.vat')}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {checks.map((check) => (
            <tr key={check.check_number}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {check.check_number}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {check.cashier_name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {new Date(check.print_date).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-900">
                  {check.products.map((product, index) => (
                    <div key={index}>
                      {product.name} x {product.quantity} = {product.sum} грн
                    </div>
                  ))}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {check.sum_total} грн
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {check.vat} грн
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="mb-8">
          <label htmlFor="reportType" className="block text-sm font-medium text-gray-700">
            {t('checks.reportType')}
          </label>
          <select
            id="reportType"
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="all">{t('checks.filters.allChecks')}</option>
            <option value="cashier">{t('checks.filters.cashierChecks')}</option>
            <option value="product">{t('checks.filters.productChecks')}</option>
          </select>
        </div>

        <div className="mb-6">
          {renderFilters()}
        </div>

        <div className="mb-6">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {loading ? t('checks.actions.generating') : t('checks.actions.generateReport')}
          </button>
        </div>

        <div className="overflow-x-auto">
          {renderChecks()}
        </div>
      </div>
    </div>
  );
};

export default CheckSection; 