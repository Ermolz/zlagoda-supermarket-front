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
  // useEffect(() => {
  //   const fetchCategories = async () => {
  //     setLoading(true);
  //     setError('');
    
  //     try {
  //       const token = localStorage.getItem('accessToken');
    
  //       const response = await fetch('http://localhost:3000/api/cashier/categories', {
  //         headers: {
  //           'Authorization': `Bearer ${token}`,
  //           'Content-Type': 'application/json',
  //         },
  //       });
        
  //       const text = await response.text();
    
  //       if (!response.ok) {
  //         let errorMessage = 'Не вдалося отримати список категорій';
  //         try {
  //           const errorData = JSON.parse(text);
  //           errorMessage = errorData.message || errorMessage;
  //         } catch (parseError) {
  //           console.warn('Не вдалося розпарсити JSON помилки:', parseError);
  //         }
  //         throw new Error(errorMessage);
  //       }
    
  //       const data = JSON.parse(text);
  //       setCategories(data);
  //     } catch (err) {
  //       console.error('Помилка при отриманні категорій:', err);
  //       setError(err.message);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };
  //   fetchCategories();
  // }, []);

  // UC16, UC17, UC18: Fetch products with sorting and filtering (without search)
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchProducts();
    }
  }, [sortField, filterCategory, filterInStock]);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        performSearch();
      } else {
        fetchProducts();
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const fetchProducts = async () => {
    setLoading(true);
    setError('');
  
    try {
      const params = new URLSearchParams();
      if (sortField) params.append('sort', sortField);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterInStock !== 'all') params.append('inStock', filterInStock);
  
      const response = await fetch(`http://localhost:3000/api/cashier/products?${params}`, {
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

  // New search function using backend endpoint
  const performSearch = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      params.append('name', searchQuery.trim());
      if (sortField) params.append('sort', sortField);
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (filterInStock !== 'all') params.append('inStock', filterInStock);

      const response = await fetch(`http://localhost:3000/api/cashier/products/search?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const text = await response.text();

      if (!response.ok) {
        let errorMessage = 'Не вдалося виконати пошук товарів';
        try {
          const errorData = JSON.parse(text);
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = JSON.parse(text);
      setProducts(data);
    } catch (err) {
      console.error('Помилка при пошуку товарів:', err);
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

    console.log("Відправка даних:", formData);
    console.log("Поточний режим:", activeTab);

    try {
      let url = 'http://localhost:3000/api/manager/products';
      let method = 'POST';

      if (activeTab === 'edit' && formData.id_product) {
        url = `http://localhost:3000/api/manager/products/${formData.id_product}`;
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

      // Refresh products after successful save
      if (searchQuery.trim()) {
        await performSearch();
      } else {
        await fetchProducts();
      }
      
      setActiveTab('list');
      resetForm();
    } catch (error) {
      console.error('Помилка при збереженні товару:', error);
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

      if (!response.ok) throw new Error('Failed to delete product');

      // Refresh products after deletion
      if (searchQuery.trim()) {
        await performSearch();
      } else {
        await fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
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
        </nav>
      </div>
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
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {products.map((product) => (
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
    </div>
  );
};

export default ProductSection;