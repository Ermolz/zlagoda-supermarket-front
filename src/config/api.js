// API base URL
export const API_BASE_URL = 'http://localhost:3000/api';

// API endpoints
export const ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  
  // Employees
  EMPLOYEES: '/employees',
  EMPLOYEE: (id) => `/employees/${id}`,
  
  // Customers
  CUSTOMERS: '/customers',
  CUSTOMER: (id) => `/customers/${id}`,
  
  // Products
  PRODUCTS: '/products',
  PRODUCT: (id) => `/products/${id}`,
  
  // Categories
  CATEGORIES: '/categories',
  CATEGORY: (id) => `/categories/${id}`,
  
  // Checks
  CHECKS: '/checks',
  CHECK: (id) => `/checks/${id}`,
};

// Create full URL for an endpoint
export const createApiUrl = (endpoint) => `${API_BASE_URL}${endpoint}`; 