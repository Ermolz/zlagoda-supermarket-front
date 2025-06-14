import React, { useState, useEffect } from 'react';

const ReportSection = () => {
  // Стан для керування даними звітів та інтерфейсом користувача
  const [loading, setLoading] = useState(false);
  const [activeReport, setActiveReport] = useState('cashierChecksToday'); // cashierChecksToday, cashierChecksPeriod, checkDetails, promotionalProducts
  const [reportData, setReportData] = useState([]);
  
  // Стан для фільтрів
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [checkNumberInput, setCheckNumberInput] = useState(''); // Для звіту checkDetails

  // Базова URL для API
  const API_BASE_URL = 'http://localhost:3000'; 

  /**
   * Створює об'єкт заголовків для авторизованого запиту.
   * Отримує токен з localStorage і додає його до заголовка 'Authorization'.
   * @returns {Object} Об'єкт із заголовками 'Authorization' та 'Content-Type'.
   */
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // 9. Переглянути список усіх чеків, що створив касир за цей день
  const fetchCashierChecksToday = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cashier/checks/today`, {
        headers: getAuthHeaders() // Використання авторизації
      });
      if (!response.ok) throw new Error('Не вдалося отримати чеки за сьогодні');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Помилка при отриманні чеків за сьогодні:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // 10. Переглянути список усіх чеків, що створив касир за певний період часу
  const fetchCashierChecksByPeriod = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cashier/checks?` + new URLSearchParams({
        start_date: dateRange.startDate,
        end_date: dateRange.endDate
      }), {
        headers: getAuthHeaders()
      });

      // Спеціальна обробка для 401 Unauthorized
      if (response.status === 401) {
        console.error("Помилка авторизації! Перенаправлення на сторінку входу...");
        // Тут можна додати логіку для очищення localStorage і перенаправлення
        // наприклад: window.location.href = '/login';
        throw new Error('Сесія закінчилася або ви не авторизовані.');
      }

      if (!response.ok) {
        throw new Error('Не вдалося отримати чеки за період');
      }
      
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Помилка при отриманні чеків за період:', error);
      alert(error.message); // Показуємо користувачу більш конкретну помилку
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // 11. За номером чеку вивести усю інформацію про даний чек
  const fetchCheckDetailsByNumber = async () => {
    if (!checkNumberInput) {
      alert('Будь ласка, введіть номер чеку.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/cashier/checks/${checkNumberInput}`, {
        headers: getAuthHeaders() // Використання авторизації
      });
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Чек не знайдено.');
        }
        throw new Error('Не вдалося отримати деталі чеку.');
      }
      const data = await response.json();
      setReportData(data ? [data] : []); // Очікуємо один об'єкт, обгортаємо в масив для консистентності
    } catch (error) {
      console.error('Помилка при отриманні деталей чеку:', error);
      alert(error.message);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };
  
  // 12. Отримати інформацію про усі акційні товари, відсортовані
  const fetchPromotionalProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products/promotional`, {
        headers: getAuthHeaders() // Використання авторизації
      });
      if (!response.ok) throw new Error('Не вдалося отримати акційні товари');
      const data = await response.json();
      setReportData(data);
    } catch (error) {
      console.error('Помилка при отриманні акційних товарів:', error);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  // Обробка генерації звіту
  const handleGenerateReport = async () => {
    if (activeReport === 'cashierChecksPeriod') {
      if (!dateRange.startDate || !dateRange.endDate) {
        alert('Будь ласка, оберіть початкову та кінцеву дати.');
        return;
      }
      if (new Date(dateRange.startDate) > new Date(dateRange.endDate)) {
        alert('Дата початку не може бути пізніше дати завершення.');
        return;
      }
    }

    switch (activeReport) {
      case 'cashierChecksToday':
        await fetchCashierChecksToday();
        break;
      case 'cashierChecksPeriod':
        await fetchCashierChecksByPeriod();
        break;
      case 'checkDetails':
        await fetchCheckDetailsByNumber();
        break;
      case 'promotionalProducts':
        await fetchPromotionalProducts();
        break;
      default:
        break;
    }
  };

  // Скидання фільтрів при зміні типу звіту
  useEffect(() => {
    setReportData([]);
    setDateRange({ startDate: '', endDate: '' });
    setCheckNumberInput('');
  }, [activeReport]);

  // Рендер фільтрів залежно від обраного звіту
  const renderFilters = () => {
    switch (activeReport) {
      case 'cashierChecksToday':
      case 'promotionalProducts':
        return null; 

      case 'cashierChecksPeriod':
        return renderDateRangeInputs();

      case 'checkDetails':
        return (
          <div className="mb-4">
            <label htmlFor="checkNumberInput" className="block text-sm font-medium text-gray-700">
              Номер чеку
            </label>
            <input
              type="text"
              id="checkNumberInput"
              value={checkNumberInput}
              onChange={(e) => setCheckNumberInput(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              placeholder="Введіть номер чеку"
              required
            />
          </div>
        );
      default:
        return null;
    }
  };

  const renderDateRangeInputs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
          Дата початку
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
          Дата кінця
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
      return <div className="text-center py-4">Завантаження...</div>;
    }

    if (!reportData || reportData.length === 0) {
      return <div className="text-center py-4 text-gray-500">Дані відсутні</div>;
    }

    switch (activeReport) {
      case 'cashierChecksToday':
      case 'cashierChecksPeriod':
        return (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Номер чеку</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Касир</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Дата</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Загальна сума</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ПДВ</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.map((check) => (
                <tr key={check.check_number}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{check.check_number}</td>
                  <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{check.cashier_surname || 'N/A'} {check.cashier_name || ''}</div></td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(check.print_date).toLocaleDateString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{check.sum_total} грн</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{check.vat} грн</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      
      case 'checkDetails': {
        const check = reportData[0];
        return (
          <div>
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">Деталі чеку</h3>
            <div className="bg-gray-50 shadow overflow-hidden sm:rounded-lg mb-4">
              <div className="px-4 py-5 sm:px-6">
                <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Номер чеку</dt>
                    <dd className="mt-1 text-sm text-gray-900">{check.check_number}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Касир</dt>
                    <dd className="mt-1 text-sm text-gray-900">{check.cashier_surname || 'N/A'}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Дата</dt>
                    <dd className="mt-1 text-sm text-gray-900">{new Date(check.print_date).toLocaleString()}</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">Загальна сума</dt>
                    <dd className="mt-1 text-sm text-gray-900">{check.sum_total} грн</dd>
                  </div>
                  <div className="sm:col-span-1">
                    <dt className="text-sm font-medium text-gray-500">ПДВ</dt>
                    <dd className="mt-1 text-sm text-gray-900">{check.vat} грн</dd>
                  </div>
                </dl>
              </div>
            </div>

            <h4 className="text-md font-medium leading-6 text-gray-900 mb-2 mt-6">Придбані товари</h4>
            {check.items && check.items.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва товару</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Кількість</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ціна за одиницю</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Загальна вартість</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {check.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.product_name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.price} грн</td>
                       <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{(item.quantity * item.price).toFixed(2)} грн</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-4 text-gray-500">У цьому чеку немає товарів</div>
            )}
          </div>
        );
      }
      case 'promotionalProducts':
          return (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">UPC</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Назва товару</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Акційна ціна</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData.map((product) => (
                  <tr key={product.upc || product.id_product}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.upc}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.product_name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.selling_price} грн</td>
                  </tr>
                ))}
              </tbody>
            </table>
          );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 p-4 md:p-6">
      <h2 className="text-2xl font-bold text-gray-800">Звіти</h2>

      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-1">
              Тип звіту
            </label>
            <select
              id="reportType"
              value={activeReport}
              onChange={(e) => setActiveReport(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="cashierChecksToday">Чеки касира за сьогодні</option>
              <option value="cashierChecksPeriod">Чеки касира за період</option>
              <option value="checkDetails">Деталізація чеку за номером</option>
              <option value="promotionalProducts">Акційні товари</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
            {renderFilters()}
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleGenerateReport}
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition duration-150 ease-in-out"
          >
            {loading ? 'Генерується...' : 'Сформувати звіт'}
          </button>
        </div>
      </div>

      {(reportData && reportData.length > 0) || loading ? (
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          {renderReportResults()}
        </div>
      ) : (
        activeReport && !loading && (!reportData || reportData.length === 0) && (
            <div className="text-center text-gray-500 py-8">
                Дані відсутні або потрібно обрати фільтри та сформувати звіт
            </div>
        )
      )}
    </div>
  );
};

export default ReportSection;