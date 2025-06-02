import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const fakeLoginApi = async (login, password) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (login === 'manager') {
        resolve({ accessToken: 'manager-token', role: 'manager' });
      } else if (login === 'cashier') {
        resolve({ accessToken: 'cashier-token', role: 'cashier' });
      } else {
        reject(new Error('Невірний логін або пароль'));
      }
    }, 700);
  });
};

const LoginPage = () => {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const { accessToken, role } = await fakeLoginApi(login, password);
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('role', role);
      if (role === 'manager') {
        navigate('/manager/dashboard');
      } else if (role === 'cashier') {
        navigate('/cashier/sell');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col md:flex-row">
      <div className="flex-1 flex items-center justify-center bg-gray-100 p-6">
        <div className="w-full max-w-md space-y-8">
          <div>
            <h2 className="text-center text-4xl font-bold text-gray-900">
              Вхід до системи
            </h2>
            <p className="mt-5 text-center text-sm text-gray-600">
              Введіть ваші облікові дані
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="login" className="sr-only">Логін</label>
                <input
                  id="login"
                  name="login"
                  type="text"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Логін"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="password" className="sr-only">Пароль</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-100 p-3 text-sm text-red-700 border border-red-300">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  'Увійти'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="flex-1 hidden md:flex bg-indigo-600 items-center justify-center">
        <div className="text-white text-4xl font-bold p-6 text-center">
          Zlagoda
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
