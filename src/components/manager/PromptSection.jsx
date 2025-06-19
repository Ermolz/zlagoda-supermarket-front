import React, { useState, useEffect } from 'react';

const PromptSection = () => {
  // State for managing prompt data and UI
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch prompts
  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    setError('');
  
    try {
      const response = await fetch('http://localhost:3000/api/example', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати список запитів';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
  
      const data = JSON.parse(text);
      setPrompts(data);
    } catch (err) {
      console.error('Помилка при отриманні запитів:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Запити</h1>
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

      {/* Prompts Table */}
      {!loading && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Запит
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {prompts.map((prompt, index) => (
                <tr key={prompt.id || index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-center text-gray-900">{prompt.id || index + 1}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-center text-gray-900">{prompt.query || prompt.name || 'Немає даних'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      prompt.status === 'active' || prompt.status === 'completed'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {prompt.status || 'Невідомо'}
                    </span>
                  </td>
                </tr>
              ))}
              {prompts.length === 0 && !loading && (
                <tr>
                  <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                    Запити не знайдено
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PromptSection;