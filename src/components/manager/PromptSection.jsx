import React, { useState } from 'react';

const PromptSection = () => {
  const [activeQuery, setActiveQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);
  const [queryType, setQueryType] = useState('');

  const fetchData = async (endpoint, type, person) => {
    setLoading(true);
    setError('');
    setActiveQuery(person);
    setQueryType(type);

    try {
      const response = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const text = await response.text();

      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати дані';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = JSON.parse(text);
      setResults(data);
    } catch (err) {
      console.error('Помилка при отриманні даних:', err);
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleZahSales = () => {
    fetchData(
      'http://localhost:3000/api/statistics/sales/employee/E001?startDate=2024-02-01&endDate=2025-06-20',
      'sales',
      'zah'
    );
  };

  const handleZahCustomers = () => {
    fetchData(
      'http://localhost:3000/api/statistics/customers/only-beverages',
      'customers',
      'zah'
    );
  };

  const handleKostCityStats = () => {
    fetchData(
      'http://localhost:3000/api/statistics/customers/city/Київ/stats',
      'city-stats',
      'kost'
    );
  };

  const handleKostWithoutManager = () => {
    fetchData(
      'http://localhost:3000/api/statistics/customers/without-manager-and-dairy',
      'without-manager',
      'kost'
    );
  };

  const handleErmoPurchases = () => {
    fetchData(
      'http://localhost:3000/api/statistics/customers/city/Київ/purchases',
      'purchases',
      'ermo'
    );
  };

  const handleCashiersNoAuth = () => {
    fetchData(
      'http://localhost:3000/api/statistics/cashiers/no-auth',
      'cashiers',
      'cashiers'
    );
  };

  const renderSalesTable = () => {
    if (!results || results.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Назва категорії
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кількість проданих товарів
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Загальна сума продажів
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Середня ціна товару
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['Назва категорії']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['Кількість проданих товарів']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(item['Загальна сума продажів']).toFixed(2)} ₴
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(item['Середня ціна товару']).toFixed(2)} ₴
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCustomersTable = () => {
    if (!results || results.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер картки
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Прізвище
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ім'я
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                По батькові
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Телефон
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['Номер картки']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['Прізвище']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['Ім\'я']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['По батькові']}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item['Телефон']}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCityStatsTable = () => {
    if (!results || results.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер картки
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                ПІБ
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Місто
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кількість чеків
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Загальна сума
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Категорії товарів
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.card_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_checks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(item.total_amount).toFixed(2)} ₴
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.categories_bought}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderWithoutManagerTable = () => {
    if (!results || results.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер картки
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                ПІБ
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Місто
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кількість чеків
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.card_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_checks}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderPurchasesTable = () => {
    if (!results || results.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Номер картки
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                ПІБ
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Загальна кількість товарів
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.card_number}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_items_bought}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderCashiersTable = () => {
    if (!results || results.length === 0) return null;

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID співробітника
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                ПІБ
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Місто
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Зарплата
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Кількість чеків
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Загальні продажі
              </th>
              <th className="px-6 py-3 text-ceter text-xs font-medium text-gray-500 uppercase tracking-wider">
                Продані категорії
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {results.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.id_employee}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.full_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.city}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {parseFloat(item.salary).toFixed(2)} ₴
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_checks}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.total_sales} ₴
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {item.sold_categories || 'Немає'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const renderTable = () => {
    switch (queryType) {
      case 'sales':
        return renderSalesTable();
      case 'customers':
        return renderCustomersTable();
      case 'city-stats':
        return renderCityStatsTable();
      case 'without-manager':
        return renderWithoutManagerTable();
      case 'purchases':
        return renderPurchasesTable();
      case 'cashiers':
        return renderCashiersTable();
      default:
        return null;
    }
  };

  const getQueryTitle = () => {
    switch (queryType) {
      case 'sales':
        return 'Продажі по категоріям';
      case 'customers':
        return 'Клієнти (тільки напої)';
      case 'city-stats':
        return 'Статистика клієнтів Київ';
      case 'without-manager':
        return 'Клієнти без менеджера та молока';
      case 'purchases':
        return 'Покупки клієнтів Київ';
      case 'cashiers':
        return 'Касири без авторизації';
      default:
        return 'Результати';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">SQL Запити</h1>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-4">
        <button
          onClick={handleZahSales}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Zah - Продажі по категоріям
        </button>
        <button
          onClick={handleZahCustomers}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Zah - Клієнти (тільки напої)
        </button>
        <button
          onClick={handleKostCityStats}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Kost - Статистика клієнтів Київ
        </button>
        <button
          onClick={handleKostWithoutManager}
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Kost - Клієнти без менеджера та молока
        </button>
        <button
          onClick={handleErmoPurchases}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Ermo - Покупки клієнтів Київ
        </button>
        <button
          onClick={handleCashiersNoAuth}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
           Ermo - Касири без авторизації
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-8">
          <div className="text-gray-500">Завантаження...</div>
        </div>
      )}

      {/* Results */}
      {!loading && results.length > 0 && (
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Результати запиту: {activeQuery} - {getQueryTitle()}
          </h2>
          {renderTable()}
        </div>
      )}

      {/* No Results */}
      {!loading && results.length === 0 && activeQuery && (
        <div className="text-center py-8 text-gray-500">
          Результатів не знайдено
        </div>
      )}

      {/* Initial State */}
      {!activeQuery && !loading && (
        <div className="text-center py-8 text-gray-500">
          Оберіть запит для відображення результатів
        </div>
      )}
    </div>
  );
};

export default PromptSection;