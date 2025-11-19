import React, { useState } from 'react';
import LoginScreen from './components/LoginScreen';
import SalesForm from './components/SalesForm';
import SalesDashboard from './components/SalesDashboard';
import KPISection from './components/KPISection';
import ClosingDashboard from './components/ClosingDashboard';
import { Seller, SaleRecord, AccessType } from './types';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<Seller | null>(null);
  const [accessType, setAccessType] = useState<AccessType | null>(null);
  // Initialize sales state as empty array - No external fetch/data.json loading
  const [sales, setSales] = useState<SaleRecord[]>([]);

  const handleLogin = (seller: Seller | null, type: AccessType) => {
    setCurrentUser(seller);
    setAccessType(type);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAccessType(null);
  };

  const handleNewSale = (sale: SaleRecord) => {
    setSales((prev) => [sale, ...prev]);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-gray-900 font-sans">
      {!accessType ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <div className="pb-10 animate-fade-in">
          {/* Header */}
          <header className="bg-white shadow-sm sticky top-0 z-30">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">E</div>
                <h1 className="text-xl font-bold text-gray-800">EstrelaTur <span className="text-blue-600 font-normal text-sm ml-1">Sistema de Gestão</span></h1>
              </div>
              <div className="text-sm text-gray-500 hidden sm:block">
                {accessType === 'SALES' && currentUser ? (
                  <>Olá, <span className="font-semibold text-gray-800">{currentUser.name}</span></>
                ) : (
                  <span className="font-semibold text-blue-800 bg-blue-50 px-3 py-1 rounded-full">Módulo Administrativo</span>
                )}
              </div>
            </div>
          </header>

          {/* Main Content based on Access Type */}
          <main className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
            {accessType === 'SALES' && currentUser ? (
              <>
                <div className="max-w-7xl mx-auto">
                  <SalesForm 
                    seller={currentUser} 
                    onLogout={handleLogout} 
                    onSaleComplete={handleNewSale} 
                  />
                  
                  <div className="mt-8">
                    <KPISection sales={sales} />
                  </div>

                  <div className="mt-12">
                    <SalesDashboard sales={sales} />
                  </div>
                </div>
              </>
            ) : (
              <ClosingDashboard 
                sales={sales} 
                onLogout={handleLogout} 
              />
            )}
          </main>
        </div>
      )}
    </div>
  );
};

export default App;