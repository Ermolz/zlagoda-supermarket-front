// src/components/ClientsTable.jsx
import React, { useEffect, useState } from 'react';
import { getAllClients } from '../api/cashierApi';

const ClientsTable = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getAllClients()
      .then((response) => {
        setClients(response.data);
        setLoading(false);
      })
      .catch((error) => {
        setError('Не вдалося завантажити клієнтів.');
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Завантаження...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Постійні клієнти</h2>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Номер карти</th>
            <th>Прізвище</th>
            <th>Ім'я</th>
            <th>По батькові</th>
            <th>Телефон</th>
            <th>Місто</th>
            <th>Вулиця</th>
            <th>Поштовий індекс</th>
            <th>Відсоток знижки</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.card_number}>
              <td>{client.card_number}</td>
              <td>{client.cust_surname}</td>
              <td>{client.cust_name}</td>
              <td>{client.cust_patronymic || '-'}</td>
              <td>{client.phone_number}</td>
              <td>{client.city || '-'}</td>
              <td>{client.street || '-'}</td>
              <td>{client.zip_code || '-'}</td>
              <td>{client.percent}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsTable;
