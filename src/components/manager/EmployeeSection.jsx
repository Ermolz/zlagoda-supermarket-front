import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';

const EmployeeSection = () => {
  const { t } = useTranslation();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState('name');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [formData, setFormData] = useState({
    id_employee: '',
    surname: '',
    name: '',
    patronymic: '',
    role: 'cashier',
    salary: '',
    dateOfBirth: '',
    dateOfStart: '',
    phone_number: '',
    city: '',
    street: '',
    zip_code: ''
  });

  useEffect(() => {
    fetchEmployees();
  }, [sortField, searchQuery]);

  const fetchEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams();
      if (sortField) params.append('sort', sortField);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const response = await fetch(`http://localhost:3000/api/manager/employees?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      if (!response.ok) {
        let errorMessage = 'Не вдалося отримати список співробітників';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await response.json();
      
      const transformedData = data.map(emp => ({
        id_employee: emp.id_employee,
        surname: emp.empl_surname,
        name: emp.empl_name,
        patronymic: emp.empl_patronymic,
        role: emp.empl_role,
        salary: emp.salary.replace('.0000', ''),
        dateOfBirth: emp.date_of_birth.split('T')[0],
        dateOfStart: emp.date_of_start.split('T')[0],
        phone_number: emp.phone_number,
        city: emp.city,
        street: emp.street,
        zip_code: emp.zip_code,
      }));

      setEmployees(transformedData);
    } catch (err) {
      console.error('Помилка при отриманні співробітників:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      empl_surname: formData.surname,
      empl_name: formData.name,
      empl_patronymic: formData.patronymic,
      empl_role: formData.role,
      salary: formData.salary,
      date_of_birth: formData.dateOfBirth,
      date_of_start: formData.dateOfStart,
      phone_number: formData.phone_number,
      city: formData.city,
      street: formData.street,
      zip_code: formData.zip_code
    };
    
    if (selectedEmployee) {
        dataToSend.id_employee = selectedEmployee.id_employee;
    }

    try {
      const config = {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
      };
      if (selectedEmployee) {
        await axios.put(
          `http://localhost:3000/api/manager/employees/${selectedEmployee.id_employee}`,
          dataToSend,
          config
        );
      } else {
        await axios.post(
            `http://localhost:3000/api/manager/employees`, 
            dataToSend,
            config
        );
      }
      fetchEmployees();
      setIsFormOpen(false);
      setSelectedEmployee(null);
      resetForm();
    } catch (err) {
      console.error('Error saving employee:', err);
      const errorMessage = err.response?.data?.message || t('employees.messages.error');
      setError(errorMessage);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('employees.messages.deleteConfirm'))) {
      try {
        await axios.delete(`http://localhost:3000/api/manager/employees/${id}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('accessToken')}` }
        });
        fetchEmployees();
      } catch (err) {
        console.error('Error deleting employee:', err);
        setError(t('employees.messages.error'));
      }
    }
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setFormData({
      id_employee: employee.id_employee,
      surname: employee.surname,
      name: employee.name,
      patronymic: employee.patronymic,
      role: employee.role,
      salary: employee.salary,
      dateOfBirth: employee.dateOfBirth,
      dateOfStart: employee.dateOfStart,
      phone_number: employee.phone_number,
      city: employee.city,
      street: employee.street,
      zip_code: employee.zip_code
    });
    setIsFormOpen(true);
  };

  const resetForm = () => {
    setFormData({
      id_employee: '',
      surname: '',
      name: '',
      patronymic: '',
      role: 'cashier',
      salary: '',
      dateOfBirth: '',
      dateOfStart: '',
      phone_number: '',
      city: '',
      street: '',
      zip_code: ''
    });
  };
  
    if (loading) {
    return <div className="text-center py-4">{t('common.messages.loading')}</div>;
  }

  if (error) {
    return <div className="text-center text-red-600 py-4">{error}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Кнопка та форма залишаються без змін */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t('employees.title')}</h2>
        <button
          onClick={() => {
            setIsFormOpen(true);
            setSelectedEmployee(null);
            resetForm();
          }}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {t('employees.form.add')}
        </button>
      </div>

      {isFormOpen && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">
            {selectedEmployee ? t('employees.form.edit') : t('employees.form.add')}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Surname */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.surname')}</label>
                <input type="text" value={formData.surname} onChange={(e) => setFormData({ ...formData, surname: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.name')}</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Patronymic */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.patronymic')}</label>
                <input type="text" value={formData.patronymic} onChange={(e) => setFormData({ ...formData, patronymic: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.role')}</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
                  <option value="cashier">{t('employees.form.roles.cashier')}</option>
                  <option value="manager">{t('employees.form.roles.manager')}</option>
                </select>
              </div>
              {/* Salary */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.salary')}</label>
                <input type="number" value={formData.salary} onChange={(e) => setFormData({ ...formData, salary: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Date of Birth */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.dateOfBirth')}</label>
                <input type="date" value={formData.dateOfBirth} onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Date of Start */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.dateOfStart')}</label>
                <input type="date" value={formData.dateOfStart} onChange={(e) => setFormData({ ...formData, dateOfStart: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.phone')}</label>
                <input type="tel" value={formData.phone_number} onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
               {/* City */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.city')}</label>
                <input type="text" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Street */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.street')}</label>
                <input type="text" value={formData.street} onChange={(e) => setFormData({ ...formData, street: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
              {/* Zip Code */}
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('employees.form.labels.zipCode')}</label>
                <input type="text" value={formData.zip_code} onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"/>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button type="button" onClick={() => { setIsFormOpen(false); setSelectedEmployee(null); resetForm(); }} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                {t('employees.actions.cancel')}
              </button>
              <button type="submit" className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700">
                {t('employees.actions.save')}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ===== ОНОВЛЕНА ТАБЛИЦЯ ===== */}
      <div className="bg-white shadow-sm rounded-lg overflow-x-auto"> {/* Додано overflow-x-auto для мобільних пристроїв */}
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.id')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.surname')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.name')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.patronymic')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.role')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.salary')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.dateOfBirth')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.dateOfStart')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.phone')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.city')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.street')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.zipCode')}</th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('employees.table.actions')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {employees.map((employee) => (
              <tr key={employee.id_employee}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.id_employee}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.surname}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.patronymic}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t(`employees.form.roles.${employee.role}`)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.salary} {t('common.currency')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(employee.dateOfBirth).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{new Date(employee.dateOfStart).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.phone_number}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.city}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.street}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.zip_code}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex space-x-2">
                    <button onClick={() => handleEdit(employee)} className="text-blue-600 hover:text-blue-900">{t('employees.actions.edit')}</button>
                    <button onClick={() => handleDelete(employee.id_employee)} className="text-red-600 hover:text-red-900">{t('employees.actions.delete')}</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EmployeeSection;