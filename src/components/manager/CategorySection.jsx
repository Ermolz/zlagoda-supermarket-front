import React, { useState, useEffect } from 'react';

const CategorySection = () => {
  // State for managing category data and UI
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, add, edit
  const [sortField, setSortField] = useState('name');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterInStock, setFilterInStock] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form data for UC19 (додавання) and UC20 (редагування)
  const [formData, setFormData] = useState({
    category_number: '',
    category_name: ''
  });

  // Fetch categories
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    setError('');
  
    try {
      const params = new URLSearchParams();
      if (sortField) params.append('sort', sortField);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterInStock !== 'all') params.append('inStock', filterInStock);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
  
      const response = await fetch(`http://localhost:3000/api/manager/categories?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати список категорій';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
  
      const data = JSON.parse(text);
      setCategories(data);
    } catch (err) {
      console.error('Помилка при отриманні категорій:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UC19: Додавання нових категорій
  // UC20: Редагування даних про категорії
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/categories', {
        method: activeTab === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save category');

      await fetchCategories();
      setActiveTab('list');
      resetForm();
    } catch (error) {
      console.error('Error saving category:', error);
    } finally {
      setLoading(false);
    }
  };

  // UC21: Видалення даних про категорії
  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цю категорію? Всі товари в цій категорії також будуть видалені.')) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete category');

      await fetchCategories();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      category_number: '',
      category_name: ''
    });
    setSelectedCategory(null);
  };

  const handleEdit = (category) => {
    setFormData(category);
    setSelectedCategory(category);
    setActiveTab('edit');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Фільтрація категорій за пошуком
// Фільтрація категорій за пошуком
  const filteredCategories = categories.filter(category => {
    if (searchQuery) {
      return (
        category.category_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        category.category_number.toString().includes(searchQuery)
      );
    }
    return true;
  });


  return (
    <div className="p-6">
      {/* Tabs for UC19 (додавання) and list view */}
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
            Список категорій
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
            Додати категорію
          </button>
        </nav>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Search */}
          <div className="mb-6 mt-3">
            <div className="max-w-xs">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Пошук
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Пошук за назвою або номером"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Categories Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Номер категорії
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Назва
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Дії
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCategories.map((category) => (
                  <tr key={category.category_number}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{category.category_number}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{category.category_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(category)}
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        Редагувати
                      </button>
                      <button
                        onClick={() => handleDelete(category.category_number)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        // Form for UC19 (add) and UC20 (edit)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'edit' ? 'Редагування категорії' : 'Додавання нової категорії'}
              </h3>
            </div>

            {/* ID тільки при додаванні */}
            {!selectedCategory && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <label htmlFor="category_number" className="block text-sm font-medium text-gray-700 mb-2">
                  Номер категорії *
                </label>
                <input
                  type="text"
                  name="category_number"
                  id="category_number"
                  required
                  pattern="^\d+$"
                  value={formData.category_number}
                  onChange={handleChange}
                  placeholder="Введіть унікальний числовий ідентифікатор"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Введіть унікальний числовий ідентифікатор категорії
                </p>
              </div>
            )}

            {/* Basic information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Основна інформація</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Назва категорії *
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    required
                    value={formData.category_name}
                    onChange={handleChange}
                    placeholder="Назва категорії"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('list');
                  resetForm();
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Скасувати
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? 'Збереження...' : activeTab === 'edit' ? 'Зберегти' : 'Додати'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CategorySection; 