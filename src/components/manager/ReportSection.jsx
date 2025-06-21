import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Printer, FileText, Users, Package, ShoppingCart, Receipt, UserCheck, Tag } from 'lucide-react';

const ReportSection = () => {
  const { t } = useTranslation();
  
  // State for managing report data and UI
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('employees');
  const [reportData, setReportData] = useState([]);
  
  // Filters state
  const [position, setPosition] = useState('all');
  const [selectedCashier, setSelectedCashier] = useState('');
  const [selectedProduct, setSelectedProduct] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  // Reference data
  const [cashiers, setCashiers] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  // Report types configuration
  const reportTypes = [
    { value: 'employees', label: t('Працівники'), icon: Users },
    { value: 'customers', label: t('Клієнти'), icon: UserCheck },
    { value: 'categories', label: t('Категорії'), icon: Tag },
    { value: 'products', label: t('Товари'), icon: Package },
    { value: 'storeProducts', label: t('Товари в магазині'), icon: ShoppingCart },
    { value: 'checks', label: t('Чеки'), icon: Receipt },
    { value: 'cashierChecks', label: t('reports.types.cashierChecks'), icon: Receipt },
    { value: 'cashierSales', label: t('Продажі касира'), icon: Receipt },
    { value: 'allCashiersSales', label: t('Продажі всіх касирів'), icon: Users },
    { value: 'productSales', label: t('Продажі товару'), icon: Package },
  ];

  // Fetch reference data
  useEffect(() => {
    const fetchReferenceData = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        const headers = {
          'Authorization': `Bearer ${token}`
        };
  
        // Fetch cashiers
        const cashiersResponse = await fetch('http://localhost:3000/api/manager/employees/cashiers', { headers });
        if (cashiersResponse.ok) {
          const cashiersData = await cashiersResponse.json();
          setCashiers(cashiersData);
        }
  
        // Fetch products
        const productsResponse = await fetch('http://localhost:3000/api/manager/products', { headers });
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setProducts(productsData);
        }
  
        // Fetch categories
        const categoriesResponse = await fetch('http://localhost:3000/api/manager/categories', { headers });
        if (categoriesResponse.ok) {
          const categoriesData = await categoriesResponse.json();
          setCategories(categoriesData);
        }
  
      } catch (error) {
        console.error('Error fetching reference data:', error);
      }
    };
  
    fetchReferenceData();
  }, []);  

  // Report fetching functions
  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      const response = await fetch(`http://localhost:3000/api/manager/employees?${params.toString()}`, {
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
      setReportData(data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };  

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/manager/customer-cards`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch customers');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/manager/categories`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      const data = await response.json();
      setReportData(data);
      console.log(reportData);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/manager/products`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreProducts = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
    
      const response = await fetch('http://localhost:3000/api/manager/store-products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch store products');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching store products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChecks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');

      const startDateStr = typeof dateRange.startDate === 'string'
        ? dateRange.startDate
        : dateRange.startDate?.toISOString().slice(0, 10);
  
      const endDateStr = typeof dateRange.endDate === 'string'
        ? dateRange.endDate
        : dateRange.endDate?.toISOString().slice(0, 10);
  
      if (!startDateStr || !endDateStr) {
        throw new Error('Некоректні дати');
      }
  
      const params = new URLSearchParams({
        startDate: startDateStr,
        endDate: endDateStr
      });
  
      const response = await fetch(`http://localhost:3000/api/manager/reports/checks?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to fetch checks');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCashierChecks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
  
      if (!selectedCashier || !dateRange.startDate || !dateRange.endDate) {
        throw new Error('Будь ласка, оберіть касира і діапазон дат');
      }
  
      const startDate = typeof dateRange.startDate === 'string'
        ? dateRange.startDate
        : dateRange.startDate?.toISOString().slice(0, 10);
  
      const endDate = typeof dateRange.endDate === 'string'
        ? dateRange.endDate
        : dateRange.endDate?.toISOString().slice(0, 10);
  
      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });
  
      const response = await fetch(
        `http://localhost:3000/api/manager/reports/checks/employee/${selectedCashier}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) throw new Error('Не вдалося отримати звіт для касира');
  
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching checks:', error);
    } finally {
      setLoading(false);
    }
  };  

  const fetchCashierSales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
  
      if (!selectedCashier || !dateRange.startDate || !dateRange.endDate) {
        throw new Error('Будь ласка, оберіть касира і діапазон дат');
      }
  
      const startDate = typeof dateRange.startDate === 'string'
        ? dateRange.startDate
        : dateRange.startDate?.toISOString().slice(0, 10);
  
      const endDate = typeof dateRange.endDate === 'string'
        ? dateRange.endDate
        : dateRange.endDate?.toISOString().slice(0, 10);
  
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
      });
  
      const response = await fetch(
        `http://localhost:3000/api/manager/sales/cashier/${selectedCashier}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) throw new Error('Не вдалося отримати звіт по продажах касира');
  
      const data = await response.json();
      setReportData([data]); // Обгортаємо в масив, бо повертається один об'єкт
    } catch (error) {
      console.error('Error fetching cashier sales:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllCashiersSales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
  
      if (!dateRange.startDate || !dateRange.endDate) {
        throw new Error('Будь ласка, оберіть діапазон дат');
      }
  
      const startDate = typeof dateRange.startDate === 'string'
        ? dateRange.startDate
        : dateRange.startDate?.toISOString().slice(0, 10);
  
      const endDate = typeof dateRange.endDate === 'string'
        ? dateRange.endDate
        : dateRange.endDate?.toISOString().slice(0, 10);
  
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
      });
  
      const response = await fetch(
        `http://localhost:3000/api/manager/sales/cashiers?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) throw new Error('Не вдалося отримати звіт по продажах касирів');
  
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Error fetching all cashiers sales:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const fetchProductSales = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
  
      if (!selectedProduct || !dateRange.startDate || !dateRange.endDate) {
        throw new Error('Будь ласка, оберіть товар і діапазон дат');
      }
  
      const startDate = typeof dateRange.startDate === 'string'
        ? dateRange.startDate
        : dateRange.startDate?.toISOString().slice(0, 10);
  
      const endDate = typeof dateRange.endDate === 'string'
        ? dateRange.endDate
        : dateRange.endDate?.toISOString().slice(0, 10);
  
      const params = new URLSearchParams({
        startDate: startDate,
        endDate: endDate
      });
  
      const response = await fetch(
        `http://localhost:3000/api/manager/sales/product/${selectedProduct}?${params.toString()}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
  
      if (!response.ok) throw new Error('Не вдалося отримати звіт по продажах товару');
  
      const data = await response.json();
      setReportData([data]); // Обгортаємо в масив
    } catch (error) {
      console.error('Error fetching product sales:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle report generation
  const handleGenerateReport = async () => {
    switch (activeReport) {
      case 'employees':
        await fetchEmployees();
        break;
      case 'customers':
        await fetchCustomers();
        break;
      case 'categories':
        await fetchCategories();
        break;
      case 'products':
        await fetchProducts();
        break;
      case 'storeProducts':
        await fetchStoreProducts();
        break;
      case 'checks':
        await fetchChecks();
        break;
      case 'cashierChecks':
        await fetchCashierChecks();
        break;
      case 'cashierSales':
        await fetchCashierSales();
        break;
      case 'allCashiersSales':
        await fetchAllCashiersSales();
        break;
      case 'productSales':
        await fetchProductSales();
        break;
    }
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = document.getElementById('printable-report');
    const originalContent = document.body.innerHTML;
    
    // Create print styles
    const printStyles = `
      <style>
        @media print {
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
          .print-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          .print-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; }
          .print-date { font-size: 14px; color: #666; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .no-print { display: none; }
          @page { margin: 1in; }
        }
      </style>
    `;

    const printDocument = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Звіт - ${reportTypes.find(r => r.value === activeReport)?.label}</title>
          ${printStyles}
        </head>
        <body>
          <div class="print-header">
            <div class="print-title">${reportTypes.find(r => r.value === activeReport)?.label}</div>
            <div class="print-date">Дата формування: ${new Date().toLocaleDateString('uk-UA')}</div>
          </div>
          ${printContent.innerHTML}
        </body>
      </html>
    `;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(printDocument);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  // Reset filters when changing report type
  useEffect(() => {
    setReportData([]);
    setDateRange({ startDate: '', endDate: '' });
    setSelectedCashier('');
    setSelectedProduct('');
    setSelectedCategory('');
    setPosition('all');
  }, [activeReport]);

  const renderFilters = () => {
    const commonDateFilters = (
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
          />
        </div>
      </div>
    );

    switch (activeReport) {
      case 'allCashiersSales':
        return commonDateFilters;

      case 'productSales':
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
                <option value="">{t('Оберіть товар')}</option>
                {products.map(product => (
                  <option key={product.id_product} value={product.id_product}>
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>
            {commonDateFilters}
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
                <option value="">{t('Оберіть касира')}</option>
                {cashiers.map(cashier => (
                  <option key={cashier.id_employee} value={cashier.id_employee}>
                    {cashier.empl_surname} {cashier.empl_name}
                  </option>
                ))}
              </select>
            </div>
            {commonDateFilters}
          </div>
        );

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
                    {product.product_name}
                  </option>
                ))}
              </select>
            </div>
            {commonDateFilters}
          </div>
        );
        case 'cashierSales':
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
                  <option value="">{t('Оберіть касира')}</option>
                  {cashiers.map(cashier => (
                    <option key={cashier.id_employee} value={cashier.id_employee}>
                      {cashier.empl_surname} {cashier.empl_name}
                    </option>
                  ))}
                </select>
              </div>
              {commonDateFilters}
            </div>
          );

      case 'checks':
        return commonDateFilters;

      default:
        return null;
    }
  };

  const renderReportResults = () => {
    if (loading) {
      return <div className="text-center py-4">{t('reports.loading')}</div>;
    }

    if (!reportData.length) {
      return <div className="text-center py-4 text-gray-500">{t('Немає данних для відображення')}</div>;
    }

    switch (activeReport) {
      case 'employees':
        return (
          <div className="overflow-x-auto w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ПІБ</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Посада</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Зарплата</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Дата народження</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Дата початку</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Адреса</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((employee) => (
                  <tr key={employee.id_employee}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.id_employee}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {employee.empl_surname} {employee.empl_name} {employee.empl_patronymic}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.empl_role}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(parseFloat(employee.salary)).toFixed(2)} грн</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(employee.date_of_birth).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(employee.date_of_start).toLocaleDateString('uk-UA')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.phone_number}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {`${employee.city}, вул. ${employee.street}, ${employee.zip_code}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'customers':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ПІБ</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Телефон</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Адреса</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Знижка</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((customer) => (
                <tr key={customer.card_number}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.card_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {customer.cust_surname} {customer.cust_name} {customer.cust_patronymic}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.phone_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {customer.city}, {customer.street}, {customer.zip_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{customer.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'categories':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Номер</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Назва категорії</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((category) => (
                <tr key={category.category_number}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{category.category_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{category.category_name}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'products':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Назва</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Категорія</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Характеристики</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((product) => (
                <tr key={product.id_product}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.id_product}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{product.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.category_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.characteristics}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'storeProducts':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">UPC</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">UPC Промо</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Назва</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Виробник</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Кількість</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Акційний</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((storeProduct) => (
                <tr key={storeProduct.UPC}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{storeProduct.UPC}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{storeProduct.UPC_prom || "-"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{storeProduct.product_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{storeProduct.producer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{storeProduct.selling_price} грн</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{storeProduct.product_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {storeProduct.promotional_product ? 'Так' : 'Ні'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
        case 'cashierSales':
          return (
            <div className="space-y-6 p-4">
              {reportData.map((salesData) => (
                <div key={salesData.id_employee} className="bg-white border border-gray-200 rounded-xl shadow-lg">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">
                      Звіт по продажах касира
                    </h3>
                  </div>
                  
                  <div className="px-6 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                            К
                          </span>
                          <div>
                            <div className="font-semibold text-gray-800 text-lg">
                              {salesData.cashier_name}
                            </div>
                            <div className="text-sm text-left text-gray-500">ID: {salesData.id_employee}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                            📅
                          </span>
                          <div>
                            <div className="font-medium text-left text-gray-800">Період звітності</div>
                            <div className="text-sm text-gray-500">
                              {dateRange.startDate} — {dateRange.endDate}
                            </div>
                          </div>
                        </div>
                      </div>
        
                      <div className="space-y-4">
                        <div className="bg-green-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600">
                              {parseFloat(salesData.total_sales_amount).toFixed(2)} грн
                            </div>
                            <div className="text-sm text-green-700 font-medium">
                              Загальна сума продажів
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600">
                              {salesData.total_checks}
                            </div>
                            <div className="text-sm text-blue-700 font-medium">
                              Кількість чеків
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Додаткова статистика */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="text-center">
                          <div className="text-xl font-semibold text-gray-700">
                            {salesData.total_checks > 0 
                              ? (parseFloat(salesData.total_sales_amount) / parseInt(salesData.total_checks)).toFixed(2)
                              : '0.00'
                            } грн
                          </div>
                          <div className="text-sm text-gray-600">
                            Середня сума чека
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          );

      case 'checks':
      case 'cashierChecks':
        case 'productChecks':
          return (
            <div className="space-y-6 p-4">
              {reportData.map((check) => (
                <div key={check.check_number} className="bg-white border border-gray-200 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                  {/* Заголовок чека */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                    <div className="flex justify-between items-start">
                      <h3 className="text-xl font-bold text-gray-800">
                        Чек № <span className="text-blue-600">{check.check_number}</span>
                      </h3>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-green-600">{(parseFloat(check.sum_total)).toFixed(2)} грн</div>
                        <div className="text-sm text-gray-500">включаючи ПДВ: {(parseFloat(check.vat)).toFixed(2)} грн</div>
                      </div>
                    </div>
                  </div>
        
                  {/* Інформація про чек */}
                  <div className="px-6 py-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                            К
                          </span>
                          <div>
                            <div className="font-medium text-gray-800">
                              {check.empl_surname} {check.empl_name}
                            </div>
                            <div className="text-sm text-left text-gray-500">ID: {check.id_employee}</div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                            📅
                          </span>
                          <div className="font-medium text-gray-800">
                            {new Date(check.print_date).toLocaleString('uk-UA')}
                          </div>
                        </div>
                      </div>
        
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2">
                          <span className="inline-flex items-center justify-center w-8 h-8 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                            👤
                          </span>
                          <div>
                            <div className="font-medium text-gray-800">
                              {check.cust_surname && check.cust_name 
                                ? `${check.cust_surname} ${check.cust_name}` 
                                : 'Гість'}
                            </div>
                            <div className="text-sm text-gray-500">{check.card_number}</div>
                          </div>
                        </div>
                      </div>
                    </div>
        
                    {/* Таблиця товарів */}
                    {check.products && check.products.length > 0 && (
                      <div className="mt-6">
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                            <span className="mr-2">🛒</span>
                            Придбані товари
                          </h4>
                          <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                            {check.products.length} позицій
                          </span>
                        </div>
                        
                        <div className="overflow-hidden rounded-lg border border-gray-200">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  UPC
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Назва товару
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Кількість
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Ціна
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                  Сума
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {check.products.map((product, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors duration-200">
                                  <td className="px-4 py-3">
                                    <span className="text-sm text-center font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded">
                                      {product.UPC}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3">
                                    <div className="text-sm text-center font-medium text-gray-900">
                                      {product.product_name}
                                    </div>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      {product.quantity}
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {product.price} грн
                                    </span>
                                  </td>
                                  <td className="px-4 py-3 text-center">
                                    <span className="text-sm font-bold text-green-600">
                                      {product.total} грн
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          );
          case 'allCashiersSales':
            const totalSales = reportData.reduce(
              (sum, cashier) => sum + parseFloat(cashier.total_sales_amount || 0),
              0
            );
            
            const totalChecks = reportData.reduce(
              (sum, cashier) => sum + parseInt(cashier.total_checks || 0),
              0
            );
          
            return (
              <div className="max-w-7xl mx-auto p-6 space-y-6">
                {/* Header Section */}
                <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900">
                          Звіт по продажах касирів
                        </h3>
                        <p className="text-sm text-gray-600 mt-1">
                          Період: {dateRange.startDate} — {dateRange.endDate}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">Всього касирів</div>
                        <div className="text-2xl font-bold text-blue-600">{reportData.length}</div>
                      </div>
                    </div>
                  </div>
          
                  {/* Summary Cards */}
                  <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Загальна сума */}
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-500 rounded-lg text-white text-xl">
                          💰
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-blue-600">Загальна сума</p>
                          <p className="text-2xl font-bold text-blue-900">{totalSales.toFixed(2)} грн</p>
                        </div>
                      </div>
                    </div>

                    {/* Всього чеків */}
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-500 rounded-lg text-white text-xl">
                          🧾
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-green-600">Всього чеків</p>
                          <p className="text-2xl font-bold text-green-900">{totalChecks}</p>
                        </div>
                      </div>
                    </div>

                    {/* Середній чек */}
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-500 rounded-lg text-white text-xl">
                          📊
                        </div>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-purple-600">Середній чек</p>
                          <p className="text-2xl font-bold text-purple-900">
                            {totalChecks > 0 ? (totalSales / totalChecks).toFixed(2) : '0.00'} грн
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                </div>
          
                {/* Table Section */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            ID
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            ПІБ касира
                          </th>
                          <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Кількість чеків
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Загальна сума
                          </th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                            Середня сума чека
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {reportData
                          .sort((a, b) => parseFloat(b.total_sales_amount || 0) - parseFloat(a.total_sales_amount || 0))
                          .map((cashier, index) => {
                            const salesAmount = parseFloat(cashier.total_sales_amount || 0);
                            const checksCount = parseInt(cashier.total_checks || 0);
                            const avgCheck = checksCount > 0 ? salesAmount / checksCount : 0;
                            
                            return (
                              <tr 
                                key={cashier.id_employee} 
                                className={`hover:bg-gray-50 transition-colors duration-200 ${
                                  index === 0 ? 'bg-yellow-50' : ''
                                }`}
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm font-medium text-gray-900">
                                      {cashier.id_employee}
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-semibold text-gray-900">
                                    {cashier.cashier_name}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    {checksCount}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className="text-sm font-bold text-green-600">
                                    {salesAmount.toFixed(2)} грн
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <span className="text-sm text-gray-900">
                                    {avgCheck.toFixed(2)} грн
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                  
                  {reportData.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">Немає даних</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        За обраний період відсутні дані по продажах касирів
                      </p>
                    </div>
                  )}
                </div>
              </div>
            );
          
      
          case 'productSales':
            return (
              <div className="space-y-6 p-4">
                {reportData.map((productData) => (
                  <div key={productData.id_product} className="bg-white border border-gray-200 rounded-xl shadow-lg">
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 rounded-t-xl border-b border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800">
                        Звіт по продажах товару
                      </h3>
                    </div>
                    
                    <div className="px-6 py-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                              📦
                            </span>
                            <div>
                              <div className="font-semibold text-gray-800 text-lg">
                                {productData.product_name}
                              </div>
                              <div className="text-sm text-left text-gray-500">ID: {productData.id_product}</div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-600">
                            <strong>Характеристики:</strong> {productData.characteristics}
                          </div>
                          
                          <div className="flex items-center space-x-3">
                            <span className="inline-flex items-center justify-center w-10 h-10 bg-purple-100 text-purple-600 rounded-full text-sm font-medium">
                              📅
                            </span>
                            <div>
                              <div className="font-medium text-left text-gray-800">Період звітності</div>
                              <div className="text-sm text-gray-500">
                                {dateRange.startDate} — {dateRange.endDate}
                              </div>
                            </div>
                          </div>
                        </div>
      
                        <div className="space-y-4">
                          <div className="bg-blue-50 p-4 rounded-lg">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-blue-600">
                                {productData.total_quantity}
                              </div>
                              <div className="text-sm text-blue-700 font-medium">
                                Загальна кількість проданих одиниць
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-green-50 p-4 rounded-lg">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-green-600">
                                {parseFloat(productData.total_amount).toFixed(2)} грн
                              </div>
                              <div className="text-sm text-green-700 font-medium">
                                Загальна сума продажів
                              </div>
                            </div>
                          </div>
                          
                          <div className="bg-orange-50 p-4 rounded-lg">
                            <div className="text-center">
                              <div className="text-3xl font-bold text-orange-600">
                                {productData.total_checks}
                              </div>
                              <div className="text-sm text-orange-700 font-medium">
                                Кількість чеків
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
      default:
        return null;
    }
  };

  const canGenerateReport = () => {
    switch (activeReport) {
      case 'cashierChecks':
        return selectedCashier && dateRange.startDate && dateRange.endDate;
      case 'cashierSales':
        return selectedCashier && dateRange.startDate && dateRange.endDate;
      case 'checks':
        return dateRange.startDate && dateRange.endDate;
      case 'allCashiersSales':
        return dateRange.startDate && dateRange.endDate;
      case 'productSales':
        return selectedProduct && dateRange.startDate && dateRange.endDate;
      default:
        return true;
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Type Selection */}
      <div className="bg-white p-6 rounded-lg shadow-sm space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            {t('Оберіть тип звіту')}
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {reportTypes.map((type) => {
              const IconComponent = type.icon;
              return (
                <button
                  key={type.value}
                  onClick={() => setActiveReport(type.value)}
                  className={`p-3 rounded-lg border-2 transition-all duration-200 flex flex-col items-center gap-2 text-sm ${
                    activeReport === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  <IconComponent className="h-5 w-5" />
                  <span className="text-center">{type.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        {renderFilters() && (
          <div className="border-t pt-6">
            {renderFilters()}
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            {reportData.length > 0 && `${t('Усього записів')}: ${reportData.length}`}
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleGenerateReport}
              disabled={loading || !canGenerateReport()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {loading ? t('reports.generating') : t('Згенерувати звіт')}
            </button>
            
            {reportData.length > 0 && (
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2"
              >
                <Printer className="h-4 w-4" />
                {t('Роздрукувати звіт')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Report Results */}
      <div className="bg-white rounded-lg shadow-sm">
        <div id="printable-report" className="p-6">
          {renderReportResults()}
        </div>
      </div>
    </div>
  );
};

export default ReportSection;