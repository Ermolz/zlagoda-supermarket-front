import React, { useEffect, useState } from 'react';
import { getAllProducts } from '../api/cashierApi';

const ProductsTable = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    getAllProducts().then(response => {
      setProducts(response.data);
    });
  }, []);

  return (
    <table border="1" cellPadding="5" cellSpacing="0">
      <thead>
        <tr>
          <th>ID</th>
          <th>Номер категорії</th>
          <th>Назва продукту</th>
          <th>Виробник</th>
          <th>Характеристики</th>
        </tr>
      </thead>
      <tbody>
        {products.map(product => (
          <tr key={product.id_product}>
            <td>{product.id_product}</td>
            <td>{product.category_number}</td>
            <td>{product.product_name}</td>
            <td>{product.producer}</td>
            <td>{product.characteristics}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ProductsTable;
