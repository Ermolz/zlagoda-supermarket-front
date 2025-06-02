import React, { useEffect, useState } from 'react';
import { getAvailableProducts } from '../api/products';

const AvailableProductsTable = () => {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getAvailableProducts();
        setProducts(data);
      } catch (error) {
        console.error('Помилка при отриманні товарів:', error);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div>
      <h2>Товари у магазині</h2>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>UPC</th>
            <th>Назва</th>
            <th>Виробник</th>
            <th>Характеристики</th>
            <th>Ціна</th>
            <th>Кількість</th>
            <th>Акційний</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product.upc}>
              <td>{product.upc}</td>
              <td>{product.product_name}</td>
              <td>{product.producer}</td>
              <td>{product.characteristics}</td>
              <td>{product.selling_price}</td>
              <td>{product.product_number}</td>
              <td>{product.promotional_product ? 'Так' : 'Ні'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AvailableProductsTable;
