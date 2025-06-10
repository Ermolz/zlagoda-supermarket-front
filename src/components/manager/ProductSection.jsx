import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const ProductSection = () => {
  const { t } = useTranslation();
  // State for managing product data and UI
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('list'); // list, add, edit
  // UC16: Сортування товарів за назвою
  const [sortField, setSortField] = useState('product_name');
  // UC17: Фільтрація за категорією
  const [filterCategory, setFilterCategory] = useState('all');
  // UC18: Фільтрація за наявністю
  const [filterInStock, setFilterInStock] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Form data for UC13 (додавання) and UC14 (редагування)
  const [formData, setFormData] = useState({
    id_product: '',
    category_number: '',
    product_name: '',
    producer: '',
    characteristics: ''
  });

  // Fetch categories for product form
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
    
      try {
        const token = localStorage.getItem('accessToken');
    
        const response = await fetch('http://localhost:3000/api/manager/categories', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const text = await response.text();
    
        if (!response.ok) {
          let errorMessage = 'Не вдалося отримати список категорій';
          try {
            const errorData = JSON.parse(text);
            errorMessage = errorData.message || errorMessage;
          } catch (parseError) {
            console.warn('Не вдалося розпарсити JSON помилки:', parseError);
          }
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
    fetchCategories();
  }, []);

  // UC16, UC17, UC18: Fetch products with sorting and filtering
  useEffect(() => {
    fetchProducts();
  }, [sortField, filterCategory, filterInStock]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
  
    try {
      const params = new URLSearchParams();
      if (sortField) params.append('sort', sortField);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterInStock !== 'all') params.append('inStock', filterInStock);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
  
      const response = await fetch(`http://localhost:3000/api/manager/products?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
  
      const text = await response.text();
  
      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати список товарів';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }
  
      const data = JSON.parse(text);
      setProducts(data);
    } catch (err) {
      console.error('Помилка при отриманні товарів:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // UC13: Додавання нових товарів
  // UC14: Редагування даних про товари
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Додаємо очищення помилок, якщо у вас є стейт для них
    // setError(''); 

    console.log("Відправка даних:", formData);
    console.log("Поточний режим:", activeTab);

    try {
      let url = 'http://localhost:3000/api/manager/products';
      let method = 'POST';

      // *** Ось зміна: Визначаємо URL і метод для PUT/POST запиту ***
      if (activeTab === 'edit' && formData.id_product) { // Припускаємо, що formData.product_id є унікальним ідентифікатором товару
        // Для редагування, додаємо product_id до URL
        url = `http://localhost:3000/api/manager/products/${formData.id_product}`;
        method = 'PUT';
      }

      const response = await fetch(url, { // Використовуємо визначений 'url'
        method: method, // Використовуємо визначений 'method' (POST або PUT)
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        // Краще обробляти помилки, щоб отримати конкретне повідомлення з бекенду
        const errorText = await response.text();
        let errorMessage = 'Не вдалося зберегти товар';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage; // Якщо не JSON, використовуємо текст
        }
        throw new Error(errorMessage);
      }

      await fetchProducts(); // Оновлюємо список товарів після успішного збереження
      setActiveTab('list'); // Повертаємося до списку
      resetForm(); // Очищаємо форму
    } catch (error) {
      console.error('Помилка при збереженні товару:', error);
      // Якщо у вас є стейт setError, встановіть його тут
      // setError(error.message); 
    } finally {
      setLoading(false);
    }
  };

  // UC15: Видалення даних про товари
  const handleDelete = async (id) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей товар?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/manager/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete category');

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      id_product: '',
      category_number: '',
      product_name: '',
      producer: '',
      characteristics: ''
    });
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    // Витягуємо тільки потрібні поля для редагування
    setFormData({
      id_product: product.id_product,
      category_number: product.category_number,
      product_name: product.product_name,
      producer: product.producer,
      characteristics: product.characteristics
    });
    setSelectedProduct(product);
    setActiveTab('edit');
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Фільтрація товарів за пошуком
  const filteredProducts = products.filter(product => {
    if (searchQuery) {
      return product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.characteristics.toLowerCase().includes(searchQuery.toLowerCase()) ||
             product.producer.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  return (
    <div className="p-6">
      {/* Error display */}
      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Tabs for UC13 (додавання) and list view */}
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
            {t('products.title')}
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
            {t('products.form.add')}
          </button>
        </nav>
      </div>

      {activeTab === 'list' ? (
        <>
          {/* Filters for UC16 (сортування), UC17 (категорії), UC18 (наявність) */}
          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4 mt-3">
            <div>
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                {t('common.filters.sortBy')}
              </label>
              <select
                id="sort"
                value={sortField}
                onChange={(e) => setSortField(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="product_name">{t('products.table.name')}</option>
                <option value="producer">{t('products.table.producer')}</option>
                <option value="category_name">{t('products.table.category')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                {t('products.table.category')}
              </label>
              <select
                id="category"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="all">{t('common.filters.all')}</option>
                {categories.map(category => (
                  <option key={category.category_name} value={category.category_name}>
                    {category.category_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="inStock" className="block text-sm font-medium text-gray-700">
                {t('products.filters.inStock')}
              </label>
              <select
                id="inStock"
                value={filterInStock}
                onChange={(e) => setFilterInStock(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              >
                <option value="all">{t('common.filters.all')}</option>
                <option value="true">{t('products.filters.available')}</option>
                <option value="false">{t('products.filters.notAvailable')}</option>
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
                placeholder={t('products.filters.searchPlaceholder')}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
              />
            </div>
          </div>

          {/* Loading indicator */}
          {loading && (
            <div className="text-center py-4">
              <div className="text-gray-600">{t('common.messages.loading')}</div>
            </div>
          )}

          {/* Products Table */}
          {!loading && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.table.id')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.table.name')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.table.producer')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.table.category')}
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.id_product}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.id_product}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.product_name}</div>
                        <div className="text-sm text-gray-500">{product.characteristics}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.producer}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.category_name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {t('products.actions.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(product.id_product)}
                          className="text-red-600 hover:text-red-900"
                        >
                          {t('products.actions.delete')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : (
        // Form for UC13 (add) and UC14 (edit)
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'edit' ? t('Редагування інформації про продукт') : t('Додавання нового продукту')}
              </h3>
            </div>

            {/* ID - only if not editing */}
            {!selectedProduct && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <label htmlFor="id_product" className="block text-sm font-medium text-gray-700 mb-2">
                  {t('products.form.labels.id')} *
                </label>
                <input
                  type="text"
                  name="id_product"
                  id="id_product"
                  required
                  value={formData.id_product}
                  onChange={handleChange}
                  placeholder="Введіть ID продукту"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}

            {/* Basic information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Основна інформація</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="category_number" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('products.form.labels.category')} *
                  </label>
                  <select
                    name="category_number"
                    id="category_number"
                    required
                    value={formData.category_number}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  >
                    <option value="">{t('products.form.placeholders.selectCategory')}</option>
                    {categories.map((category) => (
                      <option key={category.category_number} value={category.category_number}>
                        {category.category_number}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="product_name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('products.form.labels.name')} *
                  </label>
                  <input
                    type="text"
                    name="product_name"
                    id="product_name"
                    required
                    value={formData.product_name}
                    onChange={handleChange}
                    placeholder="Назва продукту"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="producer" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('products.form.labels.producer')} *
                  </label>
                  <input
                    type="text"
                    name="producer"
                    id="producer"
                    required
                    value={formData.producer}
                    onChange={handleChange}
                    placeholder="Виробник"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Characteristics */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Характеристики*</h4>
              <div>
                <textarea
                  name="characteristics"
                  id="characteristics"
                  rows={4}
                  required
                  value={formData.characteristics}
                  onChange={handleChange}
                  placeholder="Опишіть характеристики"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
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
                {t('products.actions.cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                {loading ? t('common.messages.saving') : activeTab === 'edit' ? t('products.actions.save') : t('products.actions.add')}
              </button>
            </div>
          </form>
        </div>

      )}
    </div>
  );
};

export default ProductSection;