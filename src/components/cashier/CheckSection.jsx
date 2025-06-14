import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const CheckSection = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  
  // State for managing check data and UI
  const [storeProducts, setStoreProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Check data
  const [checkData, setCheckData] = useState({
    check_number: '',
    card_number: '',
    print_date: new Date().toISOString(),
    sum_total: 0,
    vat: 0
  });
  
  // Cart items (products added to check)
  const [cartItems, setCartItems] = useState([]);
  
  // Selected product for adding
  const [selectedProduct, setSelectedProduct] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Helper function to format price with 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price).toFixed(2);
  };

  // Helper function to format date for datetime-local input
  const formatDateTimeLocal = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const role = localStorage.getItem('role');
    
    if (!token || !role) {
      navigate('/');
    }
  }, [navigate]);

  // Helper function to make authenticated API calls
  const authenticatedFetch = async (url, options = {}) => {
    const token = localStorage.getItem('accessToken');
    console.log('Using token:', token); // Debug log
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('Response status:', response.status); // Debug log
      
      if (response.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('accessToken');
        localStorage.removeItem('role');
        navigate('/');
        throw new Error('Unauthorized');
      }
      
      return response;
    } catch (error) {
      console.error('API call error:', error);
      if (error.message === 'Unauthorized') {
        throw error;
      }
      throw new Error('Failed to fetch data');
    }
  };

  // Fetch store products
  useEffect(() => {
    const fetchStoreProducts = async () => {
      setLoading(true);
      try {
        const response = await authenticatedFetch('http://localhost:3000/api/cashier/store-products');
        if (response.ok) {
          const data = await response.json();
          setStoreProducts(data);
        }
      } catch (error) {
        console.error('Error fetching store products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreProducts();
  }, []);

  // Generate check number
  useEffect(() => {
    const generateCheckNumber = () => {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const shortTimestamp = timestamp.slice(-4);
      return `${shortTimestamp}${random}`;
    };

    setCheckData(prev => ({
      ...prev,
      check_number: generateCheckNumber()
    }));
  }, []);

  // Calculate totals when cart items change
  useEffect(() => {
    const sumTotal = cartItems.reduce((sum, item) => sum + (item.selling_price * item.product_number), 0);
    const vat = sumTotal * 0.2; // Assuming 20% VAT

    setCheckData(prev => ({
      ...prev,
      sum_total: sumTotal,
      vat: vat
    }));
  }, [cartItems]);

  // Add product to cart
  const addProductToCart = () => {
    if (!selectedProduct || quantity <= 0) return;

    const product = storeProducts.find(p => p.UPC === selectedProduct);
    if (!product) return;

    // Check if product already in cart
    const existingItemIndex = cartItems.findIndex(item => item.UPC === selectedProduct);
    
    if (existingItemIndex >= 0) {
      // Update quantity of existing item
      const updatedItems = [...cartItems];
      updatedItems[existingItemIndex].product_number += quantity;
      setCartItems(updatedItems);
    } else {
      // Add new item to cart
      const newItem = {
        UPC: product.UPC,
        product_number: quantity,
        selling_price: parseFloat(product.selling_price),
        product_name: product.product_name // For display purposes
      };
      setCartItems([...cartItems, newItem]);
    }

    // Reset selection
    setSelectedProduct('');
    setQuantity(1);
  };

  // Remove product from cart
  const removeFromCart = (upc) => {
    setCartItems(cartItems.filter(item => item.UPC !== upc));
  };

  // Update quantity in cart
  const updateQuantity = (upc, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(upc);
      return;
    }

    const updatedItems = cartItems.map(item =>
      item.UPC === upc ? { ...item, product_number: newQuantity } : item
    );
    setCartItems(updatedItems);
  };

  // Submit check
  const submitCheck = async () => {
    if (cartItems.length === 0) {
      alert('Додайте товари до чеку');
      return;
    }

    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('Немає токену авторизації');
      navigate('/');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        check: {
          check_number: checkData.check_number,
          card_number: checkData.card_number || null,
          print_date: new Date().toISOString(),
          sum_total: parseFloat(checkData.sum_total.toFixed(2)),
          vat: parseFloat(checkData.vat.toFixed(2))
        },
        sales: cartItems.map(item => ({
          UPC: item.UPC,
          product_number: item.product_number,
          selling_price: parseFloat(item.selling_price)
        }))
      };

      console.log('Sending payload:', JSON.stringify(payload, null, 2)); // Debug log

      const response = await authenticatedFetch('http://localhost:3000/api/cashier/checks', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Чек успішно створено!');
        // Reset form
        setCartItems([]);
        setCheckData(prev => ({
          ...prev,
          check_number: Date.now().toString().slice(-7) + Math.floor(Math.random() * 100).toString().padStart(2, '0'),
          card_number: '',
          print_date: new Date().toISOString(),
          sum_total: 0,
          vat: 0
        }));
      } else {
        const errorData = await response.json().catch(() => ({ message: 'Невідома помилка' }));
        console.error('Server error response:', errorData);
        alert(`Помилка створення чеку: ${errorData.message || 'Невідома помилка'}`);
      }
    } catch (error) {
      console.error('Error submitting check:', error);
      alert('Помилка створення чеку');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="text-center py-4">Завантаження товарів...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Створення чеку</h2>

        {/* Check Info */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Номер чеку
              </label>
              <input
                type="text"
                value={checkData.check_number}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Номер картки клієнта (опціонально)
              </label>
              <input
                type="text"
                value={checkData.card_number}
                onChange={(e) => setCheckData(prev => ({ ...prev, card_number: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="Введіть номер картки"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Дата створення
              </label>
              <input
                type="datetime-local"
                value={formatDateTimeLocal(checkData.print_date)}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 shadow-sm sm:text-sm"
              />
            </div>
          </div>
        </div>

        {/* Add Product Section */}
        <div className="mb-6 p-4 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Додати товар</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                Товар
              </label>
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="">Оберіть товар</option>
                {storeProducts.map(product => (
                  <option key={product.UPC} value={product.UPC}>
                    {product.product_name} - {formatPrice(product.selling_price)} грн (В наявності: {product.products_number})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Кількість
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={addProductToCart}
              disabled={!selectedProduct || quantity <= 0}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Додати до чеку
            </button>
          </div>
        </div>

        {/* Cart Items */}
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Товари в чеку</h3>
          {cartItems.length === 0 ? (
            <div className="text-center py-4 text-gray-500">Чек порожній</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Товар
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ціна
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Кількість
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Сума
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Дії
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cartItems.map((item) => (
                    <tr key={item.UPC}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.product_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.selling_price)} грн
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <input
                          type="number"
                          min="1"
                          value={item.product_number}
                          onChange={(e) => updateQuantity(item.UPC, parseInt(e.target.value) || 0)}
                          className="w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatPrice(item.selling_price * item.product_number)} грн
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => removeFromCart(item.UPC)}
                          className="text-red-600 hover:text-red-900 text-sm font-medium"
                        >
                          Видалити
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Totals */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center text-lg font-medium">
            <span>Загальна сума:</span>
            <span>{formatPrice(checkData.sum_total)} грн</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>ПДВ (20%):</span>
            <span>{formatPrice(checkData.vat)} грн</span>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            onClick={submitCheck}
            disabled={submitting || cartItems.length === 0}
            className="px-6 py-3 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Створення чеку...' : 'Створити чек'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckSection;