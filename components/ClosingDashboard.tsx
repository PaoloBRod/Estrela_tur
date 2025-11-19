import React, { useState, useMemo, useEffect } from 'react';
import { LogOut, Save, AlertCircle, FileCheck, RefreshCw, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { AGENCIES, BUS_COMPANIES } from '../constants';
import { SaleRecord, ClosingEntry, ClosingReportItem } from '../types';

interface ClosingDashboardProps {
  sales: SaleRecord[];
  onLogout: () => void;
}

const ClosingDashboard: React.FC<ClosingDashboardProps> = ({ sales, onLogout }) => {
  // State to hold input values: Map<"Company_AgencyId", {doc, value}>
  // Loaded from localStorage to prevent data loss
  const [entries, setEntries] = useState<Record<string, { doc: string, val: string }>>(() => {
    const saved = localStorage.getItem('estrelatur_closing_entries');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState<'input' | 'report'>('input');
  const [reportData, setReportData] = useState<ClosingReportItem[]>([]);

  // Save to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem('estrelatur_closing_entries', JSON.stringify(entries));
  }, [entries]);

  // Helper to generate key
  const getKey = (company: string, agencyId: string) => `${company}_${agencyId}`;
  const UNIQUE_ENTRY_ID = 'UNIQUE_ENTRY';

  const handleInputChange = (company: string, agencyId: string, field: 'doc' | 'val', value: string) => {
    const key = getKey(company, agencyId);
    setEntries(prev => ({
      ...prev,
      [key]: {
        ...prev[key],
        [field]: value
      }
    }));
  };

  // Calculate row total for display in Input Table
  const getRowTotal = (company: string) => {
    let total = AGENCIES.reduce((acc, ag) => {
      const key = getKey(company, ag.id);
      const val = parseFloat(entries[key]?.val || '0');
      return acc + (isNaN(val) ? 0 : val);
    }, 0);

    // Add Unique Entry Value
    const uniqueKey = getKey(company, UNIQUE_ENTRY_ID);
    const uniqueVal = parseFloat(entries[uniqueKey]?.val || '0');
    total += (isNaN(uniqueVal) ? 0 : uniqueVal);

    return total;
  };

  const handleConfirm = () => {
    setIsModalOpen(true);
  };

  const handleSubmit = () => {
    generateReport();
    setStep('report');
    setIsModalOpen(false);
  };

  const generateReport = () => {
    const today = new Date().toLocaleDateString('pt-BR');
    
    // For each company, gather data
    const report: ClosingReportItem[] = BUS_COMPANIES.sort().map(company => {
      // 1. Calculate Closing Total (Doc Values / Invoice)
      let closingTotal = 0;
      const docNumbers: string[] = [];

      // Sum Agencies
      AGENCIES.forEach(ag => {
        const key = getKey(company, ag.id);
        const entry = entries[key];
        if (entry) {
          const v = parseFloat(entry.val || '0');
          closingTotal += isNaN(v) ? 0 : v;
          if (entry.doc) docNumbers.push(`${ag.name.split(' ')[1]}: ${entry.doc}`);
        }
      });

      // Sum Unique Entry
      const uniqueKey = getKey(company, UNIQUE_ENTRY_ID);
      const uniqueEntry = entries[uniqueKey];
      if (uniqueEntry) {
        const v = parseFloat(uniqueEntry.val || '0');
        closingTotal += isNaN(v) ? 0 : v;
        if (uniqueEntry.doc) docNumbers.push(`Único: ${uniqueEntry.doc}`);
      }

      // 2. Calculate System Total (Cash + Machine) for Today
      // Note: We only consider sales from "Today" ideally, but `sales` prop contains all sessions. 
      // Since there's no backend, we assume `sales` contains the relevant session data.
      // If we strictly want TODAY's sales:
      const todayStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      
      const companySales = sales.filter(s => 
        s.busCompany === company && 
        s.date.startsWith(todayStr)
      );

      const systemTotal = companySales.reduce((acc, s) => acc + s.valueCash + s.valueMachine, 0);

      // 3. Difference Logic
      // Logic: System Cash (What we have) - Closing Invoice (What we owe)
      // If Diff > 0: We have more money than the invoice (Surplus/CX +)
      // If Diff < 0: We have less money than the invoice (Shortage/CX -)
      const diff = systemTotal - closingTotal;

      // 4. Status
      let status: 'OK' | 'CX +' | 'CX -' = 'OK';
      // Using a small epsilon for float comparison
      if (diff > 0.01) status = 'CX +';
      if (diff < -0.01) status = 'CX -';

      return {
        companyName: company,
        closingDate: today,
        docNumber: docNumbers.length > 0 ? docNumbers.join(' | ') : '-',
        docValue: closingTotal,
        systemTotal: systemTotal,
        difference: diff,
        status
      };
    });

    // Filter to show only companies that had any activity (System Sales > 0 OR Closing Input > 0)
    const activeReport = report.filter(r => r.docValue > 0 || r.systemTotal > 0);
    setReportData(activeReport);
  };

  const handleExportExcel = () => {
    // Prepare data for export
    const dataToExport = reportData.map(row => ({
      'Empresa': row.companyName,
      'Data': row.closingDate,
      'Nº Documentos': row.docNumber,
      'Valor Fatura': row.docValue,
      'Vendas (Cx+Maq)': row.systemTotal,
      'Diferença': row.difference,
      'Status': row.status
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Fechamento Diário");

    // Generate file name with current date
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(wb, `EstrelaTur_Fechamento_${dateStr}.xlsx`);
  };

  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // --- RENDER ---

  if (step === 'report') {
    return (
      <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-7xl mx-auto mt-6 animate-fade-in">
        <div className="flex justify-between items-center mb-8 border-b pb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <FileCheck className="w-8 h-8 text-green-600 mr-3" />
              Relatório de Fechamento Diário
            </h2>
            <p className="text-gray-500 mt-1">Conferência: Boleto/Fatura vs Vendas (Dinheiro + Maquininha)</p>
          </div>
          <button onClick={onLogout} className="text-red-500 hover:bg-red-50 p-2 rounded transition flex items-center">
            <LogOut size={20} className="mr-2" /> Sair
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-4 py-3 border">Empresa</th>
                <th className="px-4 py-3 border">Data</th>
                <th className="px-4 py-3 border w-1/4">Nº Documentos</th>
                <th className="px-4 py-3 border text-right">Valor Fatura (Boleto)</th>
                <th className="px-4 py-3 border text-right">Vendas (Cx+Maq)</th>
                <th className="px-4 py-3 border text-right">Diferença</th>
                <th className="px-4 py-3 border text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {reportData.map((row) => (
                <tr key={row.companyName} className="hover:bg-gray-50">
                  <td className="px-4 py-3 border font-medium">{row.companyName}</td>
                  <td className="px-4 py-3 border">{row.closingDate}</td>
                  <td className="px-4 py-3 border text-xs text-gray-500 truncate max-w-xs" title={row.docNumber}>{row.docNumber}</td>
                  <td className="px-4 py-3 border text-right font-mono">{formatCurrency(row.docValue)}</td>
                  <td className="px-4 py-3 border text-right font-mono">{formatCurrency(row.systemTotal)}</td>
                  <td className={`px-4 py-3 border text-right font-mono font-bold ${row.difference < 0 ? 'text-red-600' : row.difference > 0 ? 'text-blue-600' : 'text-gray-600'}`}>
                    {formatCurrency(row.difference)}
                  </td>
                  <td className="px-4 py-3 border text-center">
                    <span className={`
                      px-3 py-1 rounded-full text-xs font-bold
                      ${row.status === 'OK' ? 'bg-green-100 text-green-800' : ''}
                      ${row.status === 'CX +' ? 'bg-blue-100 text-blue-800' : ''}
                      ${row.status === 'CX -' ? 'bg-red-100 text-red-800' : ''}
                    `}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
              {reportData.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400 italic">Nenhum fechamento ou venda encontrada para hoje.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
           <button
             onClick={() => {
               setStep('input');
             }}
             className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow transition"
           >
             <RefreshCw className="w-4 h-4 mr-2" />
             Editar / Novo Fechamento
           </button>
           
           <button
             onClick={handleExportExcel}
             className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 shadow transition"
           >
             <FileSpreadsheet className="w-4 h-4 mr-2" />
             Exportar Excel
           </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 max-w-[95%] mx-auto mt-6">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Fechamento de Caixa Diário</h2>
          <p className="text-sm text-gray-500">Lançamento de Faturas/Boletos por Agência</p>
        </div>
        <button onClick={onLogout} className="text-red-500 hover:bg-red-50 p-2 rounded transition">
          <LogOut size={20} />
        </button>
      </div>

      {/* Matrix Table */}
      <div className="overflow-x-auto mb-8 border rounded-lg shadow-sm">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="text-xs text-gray-700 uppercase bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 border-b border-r bg-gray-100 sticky left-0 z-20 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">Empresa</th>
              {AGENCIES.map(ag => (
                <th key={ag.id} className="px-2 py-3 border-b text-center min-w-[180px]">
                  {ag.name}
                </th>
              ))}
              <th className="px-2 py-3 border-b text-center min-w-[180px] bg-blue-50 text-blue-800">
                Lançamento Único
              </th>
              <th className="px-4 py-3 border-b border-l bg-gray-100 font-bold text-center">TOTAL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {BUS_COMPANIES.sort().map(company => (
              <tr key={company} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900 border-r bg-white sticky left-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.1)]">
                  {company}
                </td>
                
                {/* Agency Columns */}
                {AGENCIES.map(ag => {
                  const key = getKey(company, ag.id);
                  return (
                    <td key={ag.id} className="px-2 py-2 border-r">
                      <div className="flex space-x-1">
                        <input
                          type="text"
                          placeholder="Nº Doc"
                          value={entries[key]?.doc || ''}
                          onChange={(e) => handleInputChange(company, ag.id, 'doc', e.target.value)}
                          className="w-1/2 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                        />
                        <div className="relative w-1/2">
                           <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                           <input
                            type="number"
                            placeholder="Valor"
                            value={entries[key]?.val || ''}
                            onChange={(e) => handleInputChange(company, ag.id, 'val', e.target.value)}
                            className="w-full pl-4 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                          />
                        </div>
                      </div>
                    </td>
                  );
                })}

                {/* Single Entry Column */}
                <td className="px-2 py-2 border-r bg-blue-50/30">
                  <div className="flex space-x-1">
                    <input
                      type="text"
                      placeholder="Nº Doc"
                      value={entries[getKey(company, UNIQUE_ENTRY_ID)]?.doc || ''}
                      onChange={(e) => handleInputChange(company, UNIQUE_ENTRY_ID, 'doc', e.target.value)}
                      className="w-1/2 px-2 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 outline-none"
                    />
                    <div className="relative w-1/2">
                        <span className="absolute left-1 top-1/2 -translate-y-1/2 text-[10px] text-gray-400">R$</span>
                        <input
                        type="number"
                        placeholder="Valor"
                        value={entries[getKey(company, UNIQUE_ENTRY_ID)]?.val || ''}
                        onChange={(e) => handleInputChange(company, UNIQUE_ENTRY_ID, 'val', e.target.value)}
                        className="w-full pl-4 px-1 py-1 text-xs border border-blue-200 rounded focus:ring-1 focus:ring-blue-500 outline-none font-mono"
                      />
                    </div>
                  </div>
                </td>

                <td className="px-4 py-2 border-l font-bold text-right bg-gray-50 font-mono text-blue-700">
                  {formatCurrency(getRowTotal(company))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleConfirm}
          className="flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold shadow-lg transition transform hover:-translate-y-0.5"
        >
          <Save className="w-5 h-5 mr-2" />
          Confirmar Fechamento
        </button>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-fade-in">
            <div className="flex items-center mb-4 text-blue-600">
              <AlertCircle className="w-6 h-6 mr-2" />
              <h3 className="text-xl font-bold">Confirmar Lançamentos</h3>
            </div>
            
            <p className="text-gray-600 mb-4 text-sm">
              Você está prestes a registrar os boletos/faturas para o fechamento. 
              Certifique-se de que todos os valores foram digitados corretamente.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto mb-6 border">
              <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Resumo (Empresas com valor > 0)</h4>
              {BUS_COMPANIES.filter(c => getRowTotal(c) > 0).map(company => (
                 <div key={company} className="flex justify-between text-sm py-1 border-b border-gray-200 last:border-0">
                   <span className="font-medium text-gray-700">{company}</span>
                   <span className="font-mono">{formatCurrency(getRowTotal(company))}</span>
                 </div>
              ))}
              {BUS_COMPANIES.filter(c => getRowTotal(c) > 0).length === 0 && (
                <p className="text-sm text-gray-400 italic text-center">Nenhum valor lançado.</p>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Voltar e Editar
              </button>
              <button 
                onClick={handleSubmit}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold shadow transition"
              >
                Gerar Relatório
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClosingDashboard;