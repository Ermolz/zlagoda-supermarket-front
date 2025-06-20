import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const StoreProductSection = () => {
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
    UPC: '',
    UPC_prom: '',
    selling_price: '',
    product_number: '',
    promotional_product: false,
    id_product: ''
  });

  // Fetch categories for product form
  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      setError('');
    
      try {
        const token = localStorage.getItem('accessToken');
    
        const response = await fetch('http://localhost:3000/api/manager/store-products', {
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
  
      const response = await fetch(`http://localhost:3000/api/manager/store-products?${params}`, {
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

  // UC13: Додавання нових товарів у магазин
  // UC14: Редагування даних про товари у магазині
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    console.log("Відправка даних:", formData);
    console.log("Поточний режим:", activeTab);

    try {
      let url = 'http://localhost:3000/api/manager/store-products';
      let method = 'POST';

      // Для редагування використовуємо PUT метод
      if (activeTab === 'edit' && formData.UPC) {
        url = `http://localhost:3000/api/manager/store-products/${formData.UPC}`;
        method = 'PUT';
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Не вдалося зберегти товар';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          errorMessage = errorText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      await fetchProducts();
      setActiveTab('list');
      resetForm();
    } catch (error) {
      console.error('Помилка при збереженні товару:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // UC15: Видалення товарів з магазину
  const handleDelete = async (upc) => {
    if (!window.confirm('Ви впевнені, що хочете видалити цей товар з магазину?')) return;

    setLoading(true);
    try {
      const response = await fetch(`http://localhost:3000/api/manager/store-products/${upc}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) throw new Error('Failed to delete store product');

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting store product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      UPC: '',
      UPC_prom: '',
      selling_price: '',
      product_number: '',
      promotional_product: false,
      id_product: ''
    });
    setSelectedProduct(null);
  };

  const handleEdit = (product) => {
    setFormData({
      UPC: product.UPC,
      UPC_prom: product.UPC_prom || '',
      selling_price: product.selling_price,
      product_number: product.product_number,
      promotional_product: product.promotional_product,
      id_product: product.id_product
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
                <option value="product_name">{t('Кількістю')}</option>
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
                placeholder={t('Пошук за назвою')}
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
                      UPC
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      UPC Промо
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID Товару
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Назва товару
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Виробник
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Категорія
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ціна продажу
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кількість
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Промо товар
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t('products.table.actions')}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProducts.map((product) => (
                    <tr key={product.UPC}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.UPC}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.UPC_prom || '-'}</div>
                      </td>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{parseFloat(product.selling_price).toFixed(2)} ₴</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.product_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          product.promotional_product 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {product.promotional_product ? 'Так' : 'Ні'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          {t('products.actions.edit')}
                        </button>
                        <button
                          onClick={() => handleDelete(product.UPC)}
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
        // Form for UC13 (add) and UC14 (edit) store products
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-3">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Header */}
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {activeTab === 'edit' ? 'Редагування товару в магазині' : 'Додавання товару до магазину'}
              </h3>
            </div>

            {/* UPC - only if not editing */}
            {!selectedProduct && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <label htmlFor="UPC" className="block text-sm font-medium text-gray-700 mb-2">
                  UPC *
                </label>
                <input
                  type="text"
                  name="UPC"
                  id="UPC"
                  required
                  value={formData.UPC}
                  onChange={handleChange}
                  placeholder="Введіть UPC товару"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}

            {/* Basic information */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-4">Основна інформація</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="UPC_prom" className="block text-sm font-medium text-gray-700 mb-1">
                    UPC Промо
                  </label>
                  <input
                    type="text"
                    name="UPC_prom"
                    id="UPC_prom"
                    value={formData.UPC_prom}
                    onChange={handleChange}
                    placeholder="UPC промо товару (опціонально)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="id_product" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Товару *
                  </label>
                  <input
                    type="text"
                    name="id_product"
                    id="id_product"
                    required
                    value={formData.id_product}
                    onChange={handleChange}
                    placeholder="ID товару"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="selling_price" className="block text-sm font-medium text-gray-700 mb-1">
                    Ціна продажу *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    name="selling_price"
                    id="selling_price"
                    required
                    value={formData.selling_price}
                    onChange={handleChange}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="product_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Кількість *
                  </label>
                  <input
                    type="number"
                    min="0"
                    name="product_number"
                    id="product_number"
                    required
                    value={formData.product_number}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Promotional product checkbox */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="promotional_product"
                  id="promotional_product"
                  checked={formData.promotional_product}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="promotional_product" className="ml-2 block text-sm text-gray-900">
                  Промо товар
                </label>
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

export default StoreProductSection;