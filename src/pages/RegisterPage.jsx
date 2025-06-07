import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const InputField = ({ label, name, type = 'text', value, onChange, required = true, ...props }) => {
  const inputClasses = "block w-full px-3 py-2 rounded-lg text-gray-900 bg-white/50 border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200 placeholder:text-gray-400 group-hover:border-gray-300 text-sm";
  
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative group">
        {type === 'select' ? (
          <select
            name={name}
            required={required}
            value={value}
            onChange={onChange}
            className={inputClasses}
            {...props}
          >
            <option value="cashier">Касир</option>
            <option value="manager">Менеджер</option>
          </select>
        ) : (
          <input
            type={type}
            name={name}
            required={required}
            value={value}
            onChange={onChange}
            className={inputClasses}
            {...props}
          />
        )}
        <div className="absolute inset-0 rounded-lg transition duration-300 
                     group-hover:shadow-[0_0_0_1px_rgba(99,102,241,0.1),0_4px_12px_rgba(99,102,241,0.1)] 
                     pointer-events-none"></div>
      </div>
    </div>
  );
};

const RegisterPage = () => {
  const navigate = useNavigate();
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'cashier',
    surname: '',
    name: '',
    patronymic: '',
    salary: '',
    date_of_birth: '',
    date_of_start: '',
    phone_number: '',
    city: '',
    street: '',
    zip_code: ''
  });

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'phone_number') {
      // Remove all non-digit characters except '+'
      const cleaned = value.replace(/[^\d+]/g, '');
      
      // Ensure the phone number starts with +380 and has correct length
      if (cleaned.length <= 13) { // +380 + 9 digits = 13 characters
        if (!cleaned.startsWith('+')) {
          setFormData(prev => ({
            ...prev,
            [name]: '+' + cleaned
          }));
        } else if (!cleaned.startsWith('+380') && cleaned.startsWith('+')) {
          // If starts with + but not +380, ensure we keep the format
          const digits = cleaned.slice(1);
          if (digits.startsWith('380')) {
            setFormData(prev => ({
              ...prev,
              [name]: cleaned
            }));
          } else {
            setFormData(prev => ({
              ...prev,
              [name]: '+380' + digits.slice(0, 9)
            }));
          }
        } else {
          setFormData(prev => ({
            ...prev,
            [name]: cleaned
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Паролі не співпадають');
      return;
    }

    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          salary: Number(formData.salary)
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Помилка при реєстрації');
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1)_0%,rgba(120,119,198,0)_50%)] animate-[spin_60s_linear_infinite]"></div>
      </div>
      
      <div className="w-full max-w-4xl relative mx-auto my-8">
        {/* Logo Section */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Реєстрація
          </h1>
          <p className="mt-2 text-gray-600 text-base">
            Заповніть форму для створення облікового запису
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/80 p-6 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InputField
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@mail.com"
              />
              <InputField
                label="Роль"
                name="role"
                type="select"
                value={formData.role}
                onChange={handleChange}
              />
              <InputField
                label="Прізвище"
                name="surname"
                value={formData.surname}
                onChange={handleChange}
                placeholder="Введіть прізвище"
              />
              <InputField
                label="Ім'я"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введіть ім'я"
              />
              <InputField
                label="По батькові"
                name="patronymic"
                value={formData.patronymic}
                onChange={handleChange}
                placeholder="Введіть по батькові"
              />
              <InputField
                label="Номер телефону"
                name="phone_number"
                value={formData.phone_number}
                onChange={handleChange}
                placeholder="+380XXXXXXXXX"
                pattern="^\+380\d{9}$"
                title="Номер телефону повинен бути у форматі +380XXXXXXXXX"
                maxLength={13}
                required
              />
              <InputField
                label="Місто"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Введіть місто"
              />
              <InputField
                label="Вулиця"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Введіть вулицю"
              />
              <InputField
                label="Поштовий індекс"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="Введіть індекс"
                pattern="^\d{5}$"
              />
              <InputField
                label="Зарплата"
                name="salary"
                type="number"
                value={formData.salary}
                onChange={handleChange}
                min="0"
                step="100"
                placeholder="Введіть зарплату"
              />
              <InputField
                label="Дата народження"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
              />
              <InputField
                label="Дата початку роботи"
                name="date_of_start"
                type="date"
                value={formData.date_of_start}
                onChange={handleChange}
              />
              <InputField
                label="Пароль"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Введіть пароль"
              />
              <InputField
                label="Підтвердження паролю"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Повторіть пароль"
              />
            </div>

            {error && (
              <div className="rounded-lg bg-red-50/50 backdrop-blur-sm p-3 text-sm text-red-600 flex items-center space-x-2 border border-red-100">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div className="flex items-center space-x-4 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg transition duration-200 
                          text-white text-sm font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 
                          hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Зареєструватися'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="flex items-center justify-center px-4 py-2 rounded-lg transition-all duration-200 
                          text-sm font-medium border-2 border-gray-300
                          text-gray-600 bg-transparent
                          hover:border-indigo-500 hover:bg-indigo-500 hover:text-white
                          active:scale-[0.98] group"
              >
                <svg className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                </svg>
                Назад
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 