import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const ReportSection = () => {
  const { t } = useTranslation();
  // State for managing report data and UI
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('employees'); // employees, cashierChecks, allChecks, productChecks
  const [reportData, setReportData] = useState([]);
  
  // Filters state
  const [position, setPosition] = useState('all');
  const [selectedCashier, setSelectedCashier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Reference data
  const [cashiers, setCashiers] = useState([]);
  const [products, setProducts] = useState([]);

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        // Fetch cashiers
        const cashiersResponse = await fetch('/api/employees?position=cashier');
        if (cashiersResponse.ok) {
          const cashiersData = await cashiersResponse.json();
          setCashiers(cashiersData);
        }

        // Fetch products
        const productsResponse = await fetch('/api/products');
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

  // UC4: Отримання інформації про усіх працівників, що працюють на певній посаді
  const fetchEmployeesByPosition = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/employees?position=${position}`);
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  // UC8: Отримання інформації про усі чеки, створені певним касиром за певний період
  const fetchCashierChecks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checks?' + new URLSearchParams({
        cashier_id: selectedCashier,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }));
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setReportData(data);
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
      const response = await fetch('/api/checks?' + new URLSearchParams({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }));
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setReportData(data);
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
      const response = await fetch('/api/checks?' + new URLSearchParams({
        product_id: selectedProduct,
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }));
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    switch (activeReport) {
      case 'employees':
        await fetchEmployeesByPosition();
        break;
      case 'cashierChecks':
        await fetchCashierChecks();
        break;
      case 'allChecks':
        await fetchAllChecks();
        break;
      case 'productChecks':
        await fetchProductChecks();
        break;
    }
  };

  // Reset filters when changing report type
  useEffect(() => {
    setReportData([]);
    setDateRange({ startDate: '', endDate: '' });
    setSelectedCashier('');
    setSelectedProduct('');
    setPosition('all');
  }, [activeReport]);

  const renderFilters = () => {
    switch (activeReport) {
      case 'employees':
        return (
          <div className="mb-6">
            <label htmlFor="position" className="block text-sm font-medium text-gray-700">
              {t('reports.filters.position')}
            </label>
            <select
              id="position"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              <option value="all">{t('reports.filters.allPositions')}</option>
              <option value="cashier">{t('reports.filters.cashier')}</option>
              <option value="manager">{t('reports.filters.manager')}</option>
            </select>
          </div>
        );

      case 'cashierChecks':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="cashier" className="block text-sm font-medium text-gray-700">
                {t('reports.filters.cashier')}
              </label>
              <select
                id="cashier"
                value={selectedCashier}
                onChange={(e) => setSelectedCashier(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">{t('reports.filters.selectCashier')}</option>
                {cashiers.map(cashier => (
                  <option key={cashier.id_employee} value={cashier.id_employee}>
                    {cashier.surname} {cashier.name}
                  </option>
                ))}
              </select>
            </div>
            {renderDateRangeInputs()}
          </div>
        );

      case 'allChecks':
        return renderDateRangeInputs();

      case 'productChecks':
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="product" className="block text-sm font-medium text-gray-700">
                {t('reports.filters.product')}
              </label>
              <select
                id="product"
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                required
              >
                <option value="">{t('reports.filters.selectProduct')}</option>
                {products.map(product => (
                  <option key={product.id_product} value={product.id_product}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>
            {renderDateRangeInputs()}
          </div>
        );
    }
  };

  const renderDateRangeInputs = () => (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          {t('reports.filters.startDate')}
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
          {t('reports.filters.endDate')}
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
  );

  const renderReportResults = () => {
    if (loading) {
      return <div className="text-center py-4">{t('checks.loading')}</div>;
    }

    if (!reportData.length) {
      return <div className="text-center py-4 text-gray-500">{t('checks.noData')}</div>;
    }

    switch (activeReport) {
      case 'employees':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ПІБ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Посада
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Зарплата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата початку роботи
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((employee) => (
                <tr key={employee.id_employee}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.id_employee}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {employee.surname} {employee.name} {employee.patronymic}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.salary} грн
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(employee.date_of_start).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'cashierChecks':
      case 'allChecks':
      case 'productChecks':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Номер чеку
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Касир
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Дата
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Сума
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ПДВ
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((check) => (
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
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">{t('reports.title')}</h2>

      <div className="bg-white p-6 rounded-lg shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('checks.reportType')}
            </label>
            <select
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="employees">{t('reports.types.employees')}</option>
              <option value="cashierChecks">{t('reports.types.cashierChecks')}</option>
              <option value="allChecks">{t('reports.types.allChecks')}</option>
              <option value="productChecks">{t('reports.types.productChecks')}</option>
            </select>
          </div>

          {activeReport === 'employees' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('reports.filters.position')}
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">{t('reports.filters.allPositions')}</option>
                <option value="cashier">{t('reports.filters.cashier')}</option>
                <option value="manager">{t('reports.filters.manager')}</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? t('checks.actions.generating') : t('checks.actions.generateReport')}
          </button>
        </div>
      </div>

      {reportData ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          {renderReportResults()}
        </div>
      ) : (
        <div className="text-center text-gray-500 py-8">
          {loading ? t('checks.loading') : t('checks.noData')}
        </div>
      )}
    </div>
  );
};

export default ReportSection; 