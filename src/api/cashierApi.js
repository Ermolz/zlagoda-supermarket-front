// import axiosInstance from './axiosInstance';

let axiosInstance;

// 1. Отримати інформацію про усі товари, відсортовані за назвою
export const getAllProducts = () => {
  return axiosInstance.get('/products', {
    params: { sortBy: 'name' }
  });
};

// 2. Отримати інформацію про усі товари у магазині, відсортовані за назвою
// (Якщо відрізняється від п.1, наприклад, тільки ті, що в наявності)
export const getAvailableProducts = () => {
  return axiosInstance.get('/products/available', {
    params: { sortBy: 'name' }
  });
};

// 3. Отримати інформацію про усіх постійних клієнтів, відсортованих за прізвищем
export const getAllClients = () => {
  return axiosInstance.get('/clients', {
    params: { sortBy: 'surname', permanent: true }
  });
};

// 4. Здійснити пошук товарів за назвою
export const searchProductsByName = (name) => {
  return axiosInstance.get('/products/search', {
    params: { name }
  });
};

// 5. Здійснити пошук товарів, що належать певній категорії, відсортованих за назвою
export const getProductsByCategory = (categoryId) => {
  return axiosInstance.get(`/products/category/${categoryId}`, {
    params: { sortBy: 'name' }
  });
};

// 6. Здійснити пошук постійних клієнтів за прізвищем
export const searchClientsBySurname = (surname) => {
  return axiosInstance.get('/clients/search', {
    params: { surname, permanent: true }
  });
};

// 7. Здійснювати продаж товарів (додавання чеків)
export const createSale = (saleData) => {
  // saleData: { cashierId, clientId, products: [{productId, quantity}], total }
  return axiosInstance.post('/sales', saleData);
};

// 9. Переглянути список усіх чеків, що створив касир за цей день
export const getSalesByDate = (cashierId, date) => {
  return axiosInstance.get('/sales', {
    params: { cashierId, date }
  });
};

// 10. Переглянути список усіх чеків, що створив касир за певний період часу
export const getSalesByPeriod = (cashierId, startDate, endDate) => {
  return axiosInstance.get('/sales', {
    params: { cashierId, startDate, endDate }
  });
};

// 11. За номером чеку вивести усю інформацію про даний чек
export const getSaleByReceiptNumber = (receiptNumber) => {
  return axiosInstance.get(`/sales/${receiptNumber}`);
};

// 12. Отримати інформацію про усі акційні товари, відсортовані за кількістю одиниць товару/ за назвою
export const getPromotionalProducts = (sortBy = 'quantity') => {
  return axiosInstance.get('/products/promotional', {
    params: { sortBy }
  });
};

// 13. Отримати інформацію про усі не акційні товари, відсортовані за кількістю одиниць товару/ за назвою
export const getNonPromotionalProducts = (sortBy = 'quantity') => {
  return axiosInstance.get('/products/nonpromotional', {
    params: { sortBy }
  });
};

// 14. За UPC-товару знайти ціну продажу товару, кількість наявних одиниць товару
export const getProductByUPC = (upc) => {
  return axiosInstance.get(`/products/upc/${upc}`);
};

// 15. Можливість отримати усю інформацію про себе (касир)
export const getCashierProfile = (cashierId) => {
  return axiosInstance.get(`/cashiers/${cashierId}`);
};
