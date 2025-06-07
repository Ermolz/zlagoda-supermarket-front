import React, { useState } from 'react';
import ProductsTable from '../components/ProductsTable';
import ClientsTable from '../components/ClientsTable';
// import SalesList from '../components/SalesList';
// import SaleDetails from '../components/SaleDetails';
import ProductSearch from '../components/ProductSearch';
// import ClientForm from '../components/ClientForm';
// import SaleForm from '../components/SaleForm';
// import Profile from '../components/Profile';

const CashierPage = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [selectedSaleId, setSelectedSaleId] = useState(null);

  // Функція для додавання класів активній кнопці
  const getTabClass = (tabName) =>
    `pb-2 ${activeTab === tabName ? 'border-b-2 border-blue-600 font-bold' : ''}`;

  return (
    <div className="p-4">
      <nav className="mb-4 flex space-x-4 border-b pb-2">
        <button onClick={() => setActiveTab('products')} className={getTabClass('products')}>
          Товари
        </button>
        <button onClick={() => setActiveTab('clients')} className={getTabClass('clients')}>
          Клієнти
        </button>
        <button onClick={() => setActiveTab('sales')} className={getTabClass('sales')}>
          Продажі
        </button>
        <button onClick={() => setActiveTab('profile')} className={getTabClass('profile')}>
          Профіль
        </button>
      </nav>

      <div>
        {activeTab === 'products' && (
          <>
            <ProductSearch />
            <ProductsTable />
          </>
        )}

        {/*{activeTab === 'clients' && (*/}
        {/*  <>*/}
        {/*    <ClientsTable />*/}
        {/*    <ClientForm />*/}
        {/*  </>*/}
        {/*)}*/}

        {/*{activeTab === 'sales' && (*/}
        {/*  <>*/}
        {/*    <SaleForm />*/}
        {/*    <SalesList onSelectSale={setSelectedSaleId} />*/}
        {/*    {selectedSaleId && <SaleDetails saleId={selectedSaleId} />}*/}
        {/*  </>*/}
        {/*)}*/}

        {/*{activeTab === 'profile' && <Profile />}*/}
      </div>
    </div>
  );
};

export default CashierPage;
