import React, { useState } from 'react';
import { User, Lock, LogIn, UserCog, Briefcase } from 'lucide-react';
import { AGENCIES, SELLERS, ADMIN_USERS, INITIAL_PASSWORD } from '../constants';
import { Seller, AccessType } from '../types';

interface LoginScreenProps {
  onLogin: (seller: Seller | null, accessType: AccessType) => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
  const [accessType, setAccessType] = useState<AccessType>('SALES');
  const [selectedId, setSelectedId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) {
      setError(accessType === 'SALES' ? 'Por favor, selecione um vendedor.' : 'Por favor, selecione um administrador.');
      return;
    }

    if (accessType === 'SALES') {
      // Sales Logic: Global password
      if (password !== INITIAL_PASSWORD) {
        setError('Senha incorreta.');
        return;
      }
      const seller = SELLERS.find((s) => s.id === selectedId);
      if (seller) {
        onLogin(seller, 'SALES');
      }
    } else {
      // Closing Logic: Specific Admin Password
      const admin = ADMIN_USERS.find((a) => a.id === selectedId);
      
      if (!admin) {
        setError('Administrador não encontrado.');
        return;
      }

      if (password !== admin.password) {
        setError('Senha incorreta.');
        return;
      }

      // Login successful
      onLogin(null, 'CLOSING');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-600 to-sky-400 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-800 mb-2">EstrelaTur</h1>
          <p className="text-gray-500">Sistema de Gestão Integrado</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          
          {/* Access Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Acesso
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-lg">
              <button
                type="button"
                onClick={() => {
                  setAccessType('SALES');
                  setSelectedId('');
                  setPassword('');
                  setError('');
                }}
                className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                  accessType === 'SALES' 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 mr-2" />
                Vendas
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccessType('CLOSING');
                  setSelectedId('');
                  setPassword('');
                  setError('');
                }}
                className={`flex items-center justify-center py-2 text-sm font-medium rounded-md transition-all ${
                  accessType === 'CLOSING' 
                    ? 'bg-white text-blue-600 shadow-sm ring-1 ring-gray-200' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Fechamento
              </button>
            </div>
          </div>

          {/* Dynamic Entity Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {accessType === 'SALES' ? 'Selecione seu nome' : 'Admin User'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                {accessType === 'SALES' ? (
                  <User className="h-5 w-5 text-gray-400" />
                ) : (
                  <UserCog className="h-5 w-5 text-gray-400" />
                )}
              </div>
              <select
                value={selectedId}
                onChange={(e) => {
                  setSelectedId(e.target.value);
                  setError('');
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
              >
                <option value="">Selecione...</option>
                {accessType === 'SALES' ? (
                  AGENCIES.map((agency) => (
                    <optgroup key={agency.id} label={agency.name}>
                      {SELLERS.filter((s) => s.agencyId === agency.id).map((seller) => (
                        <option key={seller.id} value={seller.id}>
                          {seller.name}
                        </option>
                      ))}
                    </optgroup>
                  ))
                ) : (
                  ADMIN_USERS.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.name}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Password Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {accessType === 'SALES' ? 'Senha' : 'Senha Admin'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-gray-50 text-gray-900"
                placeholder={accessType === 'SALES' ? "Digite sua senha" : "Senha Administrativa"}
              />
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold"
          >
            <LogIn className="h-5 w-5 mr-2" />
            {accessType === 'SALES' ? 'Acessar Vendas' : 'Acessar Fechamento'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;