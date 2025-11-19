import React, { useState, useMemo } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Filter, Download, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import { SaleRecord, PaymentType } from '../types';
import { AGENCIES, SELLERS } from '../constants';

interface SalesDashboardProps {
  sales: SaleRecord[];
}

// Harmonic color palette for the 5 agencies
const AGENCY_COLORS = [
  '#3b82f6', // Blue 500
  '#10b981', // Emerald 500
  '#8b5cf6', // Violet 500
  '#f59e0b', // Amber 500
  '#f43f5e', // Rose 500
];

const SalesDashboard: React.FC<SalesDashboardProps> = ({ sales }) => {
  const [sellerFilter, setSellerFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');
  const [paymentTypeFilter, setPaymentTypeFilter] = useState<PaymentType>(PaymentType.TOTAL);

  // Helper to format currency
  const formatCurrency = (val: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Filter Logic for Table
  const filteredSales = useMemo(() => {
    return sales.filter(sale => {
      const matchesSeller = sellerFilter === 'all' || sale.sellerName === sellerFilter;
      // Compare date strings (YYYY-MM-DD part)
      const saleDate = sale.date.split('T')[0];
      const matchesDate = dateFilter === '' || saleDate === dateFilter;
      
      return matchesSeller && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()); // Newest first
  }, [sales, sellerFilter, dateFilter]);

  // Aggregation Logic for Chart
  const chartData = useMemo(() => {
    // We aggregate by Agency based on filtered sales (or full sales if no specific filters preventing agency view)
    
    // Base filtering for chart specific logic if needed, but generally we use the same filters
    const relevantSales = filteredSales;

    const agencyMap: Record<string, number> = {};

    // Initialize all agencies with 0
    AGENCIES.forEach(ag => {
      agencyMap[ag.name] = 0;
    });

    relevantSales.forEach(sale => {
      let valueToAdd = 0;
      switch (paymentTypeFilter) {
        case PaymentType.CARD:
          valueToAdd = sale.valueCard;
          break;
        case PaymentType.CASH_PIX:
          valueToAdd = sale.valueCash;
          break;
        case PaymentType.MACHINE:
          valueToAdd = sale.valueMachine;
          break;
        case PaymentType.TOTAL:
        default:
          valueToAdd = sale.total;
          break;
      }
      
      if (agencyMap[sale.agencyName] !== undefined) {
        agencyMap[sale.agencyName] += valueToAdd;
      }
    });

    return Object.keys(agencyMap).map(name => ({
      name,
      value: agencyMap[name]
    }));
  }, [filteredSales, paymentTypeFilter]);

  const handleExportExcel = () => {
    // Prepare data for export
    const dataToExport = filteredSales.map(sale => ({
      Data: new Date(sale.date).toLocaleDateString('pt-BR'),
      Hora: sale.timestamp,
      Agência: sale.agencyName,
      Vendedor: sale.sellerName,
      Empresa: sale.busCompany,
      'Valor Cartão': sale.valueCard,
      'Valor Dinheiro/Pix': sale.valueCash,
      'Valor Maquininha': sale.valueMachine,
      'Total': sale.total
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(dataToExport);
    
    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Vendas");

    // Generate file name with current date
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    XLSX.writeFile(wb, `EstrelaTur_Vendas_${dateStr}.xlsx`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-10 space-y-10 pb-20">
      
      {/* Chart Section */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <h3 className="text-xl font-bold text-gray-800 flex items-center">
            <Filter className="w-5 h-5 mr-2 text-blue-500" />
            Análise de Vendas por Agência
          </h3>
          
          <div className="flex flex-wrap gap-3">
            <select 
              value={sellerFilter} 
              onChange={(e) => setSellerFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value="all">Todos Vendedores</option>
              {SELLERS.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
            </select>

            <input 
              type="date" 
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            />

            <select 
              value={paymentTypeFilter} 
              onChange={(e) => setPaymentTypeFilter(e.target.value as PaymentType)}
              className="text-sm border-gray-300 rounded-lg shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 border"
            >
              <option value={PaymentType.TOTAL}>Valor Total</option>
              <option value={PaymentType.CARD}>Apenas Cartão</option>
              <option value={PaymentType.CASH_PIX}>Apenas Dinheiro/PIX</option>
              <option value={PaymentType.MACHINE}>Apenas Maq. Estrela</option>
            </select>
          </div>
        </div>

        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: '#6b7280', fontSize: 12}}
                tickFormatter={(val) => `R$ ${val}`}
              />
              <Tooltip 
                formatter={(value: number) => [formatCurrency(value), 'Vendas']}
                cursor={{fill: '#f3f4f6'}}
                contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}}
              />
              <Bar 
                dataKey="value" 
                name={paymentTypeFilter} 
                radius={[6, 6, 0, 0]} 
                barSize={50}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={AGENCY_COLORS[index % AGENCY_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-bold text-gray-800">Histórico de Registros</h3>
          
          <button
            onClick={handleExportExcel}
            disabled={filteredSales.length === 0}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FileSpreadsheet className="w-4 h-4 mr-2" />
            Baixar Excel (.xlsx)
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 font-bold tracking-wider">
              <tr>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Hora</th>
                <th className="px-6 py-4">Agência</th>
                <th className="px-6 py-4">Vendedor</th>
                <th className="px-6 py-4">Empresa</th>
                <th className="px-6 py-4 text-right text-blue-600">Cartão</th>
                <th className="px-6 py-4 text-right text-green-600">Dinheiro/Pix</th>
                <th className="px-6 py-4 text-right text-purple-600">Maquininha</th>
                <th className="px-6 py-4 text-right font-bold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length > 0 ? (
                filteredSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">
                      {new Date(sale.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{sale.timestamp}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-800 font-medium">{sale.agencyName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600">{sale.sellerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 bg-sky-100 text-sky-800 rounded-full text-xs font-semibold">
                        {sale.busCompany}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">{formatCurrency(sale.valueCard)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">{formatCurrency(sale.valueCash)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-mono">{formatCurrency(sale.valueMachine)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 font-mono">{formatCurrency(sale.total)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-400 italic">
                    Nenhuma venda registrada com os filtros atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SalesDashboard;