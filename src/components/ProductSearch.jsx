import React, { useState, useEffect } from 'react';
import ProductsTable from './ProductsTable';
import { searchProductsByName } from '../api/cashierApi'; // припустимо, є така функція в API

const ProductSearch = () => {
  const [query, setQuery] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    if (query.length === 0) {
      setProducts([]); // очистити результати при порожньому запиті
      return;
    }

    const fetchProducts = async () => {
      try {
        const response = await searchProductsByName(query);
        setProducts(response.data);
      } catch (error) {
        console.error('Помилка пошуку товарів:', error);
      }
    };

    fetchProducts();
  }, [query]);

  return (
    <div>
      <input
        type="text"
        placeholder="Пошук товарів за назвою..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="border p-2 mb-4 w-full"
      />
      <ProductsTable products={products} />
    </div>
  );
};

export default ProductSearch;
