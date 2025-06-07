import React, { useState, useEffect } from 'react';
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
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

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
    <div className={`min-h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 transition-opacity duration-1000 ${mounted ? 'opacity-100' : 'opacity-0'}`}>
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1)_0%,rgba(120,119,198,0)_50%)] animate-[spin_60s_linear_infinite]"></div>
      </div>
      
      <div className="w-full max-w-md relative">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
            Zlagoda
          </h1>
          <p className="mt-3 text-gray-600 text-lg">
            Система управління магазином
          </p>
        </div>

        {/* Card */}
        <div className="backdrop-blur-xl bg-white/80 p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Логін
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl text-gray-900 bg-white/50 border border-gray-200 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200
                             placeholder:text-gray-400 group-hover:border-gray-300"
                    placeholder="Введіть ваш логін"
                  />
                  <div className="absolute inset-0 rounded-xl transition duration-300 
                               group-hover:shadow-[0_0_0_1px_rgba(99,102,241,0.1),0_4px_12px_rgba(99,102,241,0.1)] 
                               pointer-events-none"></div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Пароль
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 rounded-xl text-gray-900 bg-white/50 border border-gray-200 
                             focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200
                             placeholder:text-gray-400 group-hover:border-gray-300"
                    placeholder="Введіть ваш пароль"
                  />
                  <div className="absolute inset-0 rounded-xl transition duration-300 
                               group-hover:shadow-[0_0_0_1px_rgba(99,102,241,0.1),0_4px_12px_rgba(99,102,241,0.1)] 
                               pointer-events-none"></div>
                </div>
              </div>
            </div>

            {error && (
              <div className="rounded-xl bg-red-50/50 backdrop-blur-sm p-4 text-sm text-red-600 flex items-center space-x-2 border border-red-100">
                <svg className="h-5 w-5 text-red-500 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span>{error}</span>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="relative w-full group mb-4"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-200"></div>
                <div className="relative flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl transition duration-200 
                              text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 
                              hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed">
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  ) : (
                    'Увійти'
                  )}
                </div>
              </button>
              
              
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-gray-500">
          Для входу використовуйте: manager або cashier
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
