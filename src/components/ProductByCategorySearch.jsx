import React, { useState, useEffect } from 'react';
import ProductsTable from './ProductsTable';
import { getProductsByCategory } from '../api/cashierApi';

const ProductByCategorySearch = () => {
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories');
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        console.error('Помилка завантаження категорій', error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setProducts([]);
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await getProductsByCategory(selectedCategory);
        setProducts(response.data);
      } catch (error) {
        console.error('Помилка отримання товарів за категорією:', error);
      }
    };

    fetchProducts();
  }, [selectedCategory]);

  return (
    <div>
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border p-2 mb-4"
      >
        <option value="">Оберіть категорію</option>
        {categories.map((cat) => (
          <option key={cat.category_number} value={cat.category_number}>
            {cat.category_name}
          </option>
        ))}
      </select>

      <ProductsTable products={products} />
    </div>
  );
};

export default ProductByCategorySearch;
