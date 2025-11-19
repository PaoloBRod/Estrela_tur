import React, { useState, useEffect } from 'react';
import { Bus, CreditCard, Banknote, Smartphone, CheckCircle, Calculator, LogOut, RefreshCw } from 'lucide-react';
import { BUS_COMPANIES, AGENCIES } from '../constants';
import { Seller, SaleRecord } from '../types';

interface SalesFormProps {
  seller: Seller;
  onLogout: () => void;
  onSaleComplete: (sale: SaleRecord) => void;
}

const SalesForm: React.FC<SalesFormProps> = ({ seller, onLogout, onSaleComplete }) => {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);

  // Input States
  const [enableCard, setEnableCard] = useState(false);
  const [valueCard, setValueCard] = useState<string>('');

  const [enableCash, setEnableCash] = useState(false);
  const [valueCash, setValueCash] = useState<string>('');

  const [enableMachine, setEnableMachine] = useState(false);
  const [valueMachine, setValueMachine] = useState<string>('');

  const [total, setTotal] = useState<number>(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDataConfirmed, setIsDataConfirmed] = useState(false);

  const agencyName = AGENCIES.find((a) => a.id === seller.agencyId)?.name || 'Desconhecida';

  // Calculate Total
  useEffect(() => {
    const c = enableCard ? parseFloat(valueCard) || 0 : 0;
    const p = enableCash ? parseFloat(valueCash) || 0 : 0;
    const m = enableMachine ? parseFloat(valueMachine) || 0 : 0;
    setTotal(c + p + m);
  }, [valueCard, valueCash, valueMachine, enableCard, enableCash, enableMachine]);

  const handleReset = () => {
    setSelectedCompany(null);
    setEnableCard(false);
    setValueCard('');
    setEnableCash(false);
    setValueCash('');
    setEnableMachine(false);
    setValueMachine('');
    setTotal(0);
    setIsDataConfirmed(false);
    setStep('form');
  };

  const handleConfirmData = () => {
    if (!selectedCompany) {
      alert('Por favor, selecione uma empresa.');
      return;
    }
    if (total <= 0) {
      alert('O valor total deve ser maior que zero.');
      return;
    }
    setIsModalOpen(true);
  };

  const handleFinalSubmit = () => {
    const newSale: SaleRecord = {
      id: Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      sellerName: seller.name,
      agencyName: agencyName,
      busCompany: selectedCompany!,
      valueCard: enableCard ? parseFloat(valueCard) || 0 : 0,
      valueCash: enableCash ? parseFloat(valueCash) || 0 : 0,
      valueMachine: enableMachine ? parseFloat(valueMachine) || 0 : 0,
      total: total,
    };

    onSaleComplete(newSale);
    setStep('success');
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Modal Component
  const ConfirmationModal = () => {
    if (!isModalOpen) return null;
    const dateStr = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fade-in">
          <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Confirmar Dados da Venda</h3>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p><span className="font-semibold">Vendedor:</span> {seller.name}</p>
            <p><span className="font-semibold">Data/Hora:</span> {dateStr} às {timeStr}</p>
            <p><span className="font-semibold">Agência:</span> {agencyName}</p>
            <p><span className="font-semibold">Empresa:</span> {selectedCompany}</p>
            
            <div className="bg-gray-50 p-3 rounded mt-3 space-y-1">
              {enableCard && <div className="flex justify-between"><span>Cartão:</span> <span>{formatCurrency(parseFloat(valueCard) || 0)}</span></div>}
              {enableCash && <div className="flex justify-between"><span>Dinheiro/PIX:</span> <span>{formatCurrency(parseFloat(valueCash) || 0)}</span></div>}
              {enableMachine && <div className="flex justify-between"><span>Maq. Estrela:</span> <span>{formatCurrency(parseFloat(valueMachine) || 0)}</span></div>}
              <div className="flex justify-between font-bold text-blue-600 pt-2 border-t border-gray-200 mt-2">
                <span>Total:</span> <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                setIsDataConfirmed(true);
                setIsModalOpen(false);
              }}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold shadow transition"
            >
              Confirmado
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (step === 'success') {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-2xl mx-auto mt-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Parabéns {seller.name}!</h2>
        <p className="text-lg text-gray-600 mb-8">Mais uma venda registrada com sucesso.</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button
            onClick={handleReset}
            className="flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            <RefreshCw className="w-5 h-5 mr-2" />
            Enviar Nova Venda
          </button>
          <button
            onClick={onLogout}
            className="flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition border border-gray-300"
          >
            <LogOut className="w-5 h-5 mr-2" />
            Sair do Sistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-4xl mx-auto mt-6">
      <ConfirmationModal />
      
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Informe de Venda</h2>
          <p className="text-sm text-gray-500">{agencyName} | {seller.name}</p>
        </div>
        <button onClick={onLogout} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
          <LogOut size={20} />
        </button>
      </div>

      {/* Section 1: Company Selection */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">1. Selecione a Empresa</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BUS_COMPANIES.map((company) => (
            <button
              key={company}
              onClick={() => {
                setSelectedCompany(company);
                setIsDataConfirmed(false); // Reset confirmation if selection changes
              }}
              className={`
                relative px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center text-center
                ${selectedCompany === company 
                  ? 'bg-sky-50 text-sky-700 ring-2 ring-sky-500 shadow-sm' 
                  : 'bg-gray-50 text-gray-700 hover:bg-gray-100 hover:shadow-sm border border-transparent'}
              `}
            >
              {company}
            </button>
          ))}
        </div>
      </div>

      {/* Section 2: Values */}
      <div className="mb-8">
        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">2. Preenchimento de Valores</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Box 1 */}
          <div className={`p-4 rounded-xl border-2 transition-colors ${enableCard ? 'border-blue-200 bg-blue-50/30' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-blue-700 font-medium">
                <CreditCard className="w-4 h-4 mr-2" />
                Valor em Cartão
              </div>
              <input 
                type="checkbox" 
                checked={enableCard} 
                onChange={(e) => {
                  setEnableCard(e.target.checked);
                  if (!e.target.checked) setValueCard('');
                  setIsDataConfirmed(false);
                }}
                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                disabled={!enableCard}
                value={valueCard}
                onChange={(e) => {
                  setValueCard(e.target.value);
                  setIsDataConfirmed(false);
                }}
                placeholder="0,00"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 outline-none transition"
              />
            </div>
          </div>

          {/* Box 2 */}
          <div className={`p-4 rounded-xl border-2 transition-colors ${enableCash ? 'border-green-200 bg-green-50/30' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-green-700 font-medium">
                <Banknote className="w-4 h-4 mr-2" />
                Dinheiro/PIX
              </div>
              <input 
                type="checkbox" 
                checked={enableCash} 
                onChange={(e) => {
                  setEnableCash(e.target.checked);
                  if (!e.target.checked) setValueCash('');
                  setIsDataConfirmed(false);
                }}
                className="w-5 h-5 text-green-600 rounded focus:ring-green-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                disabled={!enableCash}
                value={valueCash}
                onChange={(e) => {
                  setValueCash(e.target.value);
                  setIsDataConfirmed(false);
                }}
                placeholder="0,00"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 outline-none transition"
              />
            </div>
          </div>

          {/* Box 3 */}
          <div className={`p-4 rounded-xl border-2 transition-colors ${enableMachine ? 'border-purple-200 bg-purple-50/30' : 'border-gray-100 bg-gray-50'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center text-purple-700 font-medium">
                <Smartphone className="w-4 h-4 mr-2" />
                Maq. Estrela
              </div>
              <input 
                type="checkbox" 
                checked={enableMachine} 
                onChange={(e) => {
                  setEnableMachine(e.target.checked);
                  if (!e.target.checked) setValueMachine('');
                  setIsDataConfirmed(false);
                }}
                className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
              />
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                disabled={!enableMachine}
                value={valueMachine}
                onChange={(e) => {
                  setValueMachine(e.target.value);
                  setIsDataConfirmed(false);
                }}
                placeholder="0,00"
                step="0.01"
                className="w-full pl-10 pr-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-400 outline-none transition"
              />
            </div>
          </div>

          {/* Box 4 (Total) */}
          <div className="p-4 rounded-xl border border-red-500 bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
            <div className="flex items-center text-red-600 font-bold mb-3">
              <Calculator className="w-4 h-4 mr-2" />
              Vl Total da Venda
            </div>
            <div className="text-2xl font-bold text-gray-800 pt-1">
              {formatCurrency(total)}
            </div>
          </div>
        </div>
      </div>

      {/* Section 3 & 4: Confirmation & Submit */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-100">
        <div className="text-sm text-gray-500 italic">
          {!isDataConfirmed ? 'Valide os dados para liberar o envio.' : 'Dados validados. Pronto para envio.'}
        </div>
        
        <div className="flex space-x-4 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleConfirmData}
            disabled={isDataConfirmed}
            className={`
              flex-1 sm:flex-none px-6 py-3 rounded-lg font-semibold transition-all duration-200
              ${isDataConfirmed 
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'bg-yellow-500 text-white hover:bg-yellow-600 shadow-md'}
            `}
          >
            {isDataConfirmed ? 'Dados Confirmados' : 'Confirmar Dados'}
          </button>

          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={!isDataConfirmed}
            className={`
              flex-1 sm:flex-none px-8 py-3 rounded-lg font-bold tracking-wide transition-all duration-200
              ${!isDataConfirmed 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg transform hover:-translate-y-0.5'}
            `}
          >
            ENVIAR
          </button>
        </div>
      </div>
    </div>
  );
};

export default SalesForm;
