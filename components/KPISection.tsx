import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, Minus, Award, Calendar, Clock, DollarSign, ShoppingBag } from 'lucide-react';
import { SaleRecord } from '../types';

interface KPISectionProps {
  sales: SaleRecord[];
}

interface Metrics {
  count: number;
  total: number;
  avgTicket: number;
  bestAgency: string;
  bestSeller: string;
}

const KPISection: React.FC<KPISectionProps> = ({ sales }) => {
  
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

  // Helper to get metrics for a specific set of sales
  const calculateMetrics = (filteredSales: SaleRecord[]): Metrics => {
    if (filteredSales.length === 0) {
      return { count: 0, total: 0, avgTicket: 0, bestAgency: '-', bestSeller: '-' };
    }

    const count = filteredSales.length;
    const total = filteredSales.reduce((acc, curr) => acc + curr.total, 0);
    const avgTicket = total / count;

    // Find Best Agency
    const agencyMap: Record<string, number> = {};
    filteredSales.forEach(s => {
      agencyMap[s.agencyName] = (agencyMap[s.agencyName] || 0) + s.total;
    });
    const bestAgency = Object.entries(agencyMap).reduce((a, b) => a[1] > b[1] ? a : b, ['-', 0])[0];

    // Find Best Seller
    const sellerMap: Record<string, number> = {};
    filteredSales.forEach(s => {
      sellerMap[s.sellerName] = (sellerMap[s.sellerName] || 0) + s.total;
    });
    const bestSeller = Object.entries(sellerMap).reduce((a, b) => a[1] > b[1] ? a : b, ['-', 0])[0];

    return { count, total, avgTicket, bestAgency, bestSeller };
  };

  // Calculate specific date ranges
  const { currentMonthMetrics, lastMonthMetrics, currentDayMetrics, lastDayMetrics } = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const currentDay = now.getDate();

    // Dates for comparison
    const startOfToday = new Date(currentYear, currentMonth, currentDay).getTime();
    const endOfToday = new Date(currentYear, currentMonth, currentDay + 1).getTime();

    const startOfYesterday = new Date(currentYear, currentMonth, currentDay - 1).getTime();
    const endOfYesterday = new Date(currentYear, currentMonth, currentDay).getTime();

    const startOfCurrentMonth = new Date(currentYear, currentMonth, 1).getTime();
    const endOfCurrentMonth = new Date(currentYear, currentMonth + 1, 0).getTime() + 86400000; // End of last day

    const startOfLastMonth = new Date(currentYear, currentMonth - 1, 1).getTime();
    const endOfLastMonth = new Date(currentYear, currentMonth, 0).getTime() + 86400000;

    // Filter Sales
    const currentMonthSales = sales.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= startOfCurrentMonth && t < endOfCurrentMonth;
    });

    const lastMonthSales = sales.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= startOfLastMonth && t < endOfLastMonth;
    });

    const currentDaySales = sales.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= startOfToday && t < endOfToday;
    });

    const lastDaySales = sales.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= startOfYesterday && t < endOfYesterday;
    });

    return {
      currentMonthMetrics: calculateMetrics(currentMonthSales),
      lastMonthMetrics: calculateMetrics(lastMonthSales),
      currentDayMetrics: calculateMetrics(currentDaySales),
      lastDayMetrics: calculateMetrics(lastDaySales),
    };
  }, [sales]);

  // Component for Variance logic
  const TicketVariance = ({ current, previous }: { current: number, previous: number }) => {
    const diff = current - previous;
    const percent = previous === 0 ? (current > 0 ? 100 : 0) : (diff / previous) * 100;
    
    let colorClass = "text-gray-500";
    let Icon = Minus;

    // Rule: 
    // <= 10% positive: gray
    // > 10% positive: blue
    // negative: red
    if (percent < 0) {
      colorClass = "text-red-600";
      Icon = TrendingDown;
    } else if (percent > 10) {
      colorClass = "text-blue-600";
      Icon = TrendingUp;
    } else {
      colorClass = "text-gray-500"; // 0 to 10%
      Icon = percent === 0 ? Minus : TrendingUp;
    }

    return (
      <div className={`flex items-center text-xs font-bold ${colorClass}`}>
        <Icon className="w-3 h-3 mr-1" />
        {diff >= 0 ? '+' : ''}{formatCurrency(diff)}
      </div>
    );
  };

  const KPICard = ({ label, value, subValue, icon: Icon, highlight = false }: any) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className="w-4 h-4 text-blue-400" />}
      </div>
      <div>
        <div className={`font-bold text-gray-800 truncate ${highlight ? 'text-sm' : 'text-lg'}`}>
          {value}
        </div>
        {subValue && <div className="mt-1">{subValue}</div>}
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto mt-8 space-y-4 px-2 sm:px-0">
      
      {/* Row 1: Month */}
      <div className="bg-gradient-to-r from-blue-50 to-white p-1 rounded-t-xl">
        <h3 className="text-xs font-bold text-blue-800 uppercase px-2 py-1 flex items-center">
          <Calendar className="w-3 h-3 mr-1" /> Indicadores do Mês
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard 
          label="Vendas (Qtd)" 
          value={currentMonthMetrics.count} 
          icon={ShoppingBag} 
        />
        <KPICard 
          label="Valor Total" 
          value={formatCurrency(currentMonthMetrics.total)} 
          icon={DollarSign} 
        />
        <KPICard 
          label="Ticket Médio" 
          value={formatCurrency(currentMonthMetrics.avgTicket)} 
        />
        <KPICard 
          label="Variação TM" 
          value={
             <TicketVariance current={currentMonthMetrics.avgTicket} previous={lastMonthMetrics.avgTicket} />
          }
          subValue={<span className="text-[10px] text-gray-400">vs Mês Anterior</span>}
        />
        <KPICard 
          label="Melhor do Mês (Ag)" 
          value={currentMonthMetrics.bestAgency} 
          highlight 
          icon={Award} 
        />
        <KPICard 
          label="Melhor do Mês (Vend)" 
          value={currentMonthMetrics.bestSeller} 
          highlight 
          icon={Award} 
        />
      </div>

      {/* Row 2: Day */}
      <div className="bg-gradient-to-r from-green-50 to-white p-1 rounded-t-xl mt-6">
        <h3 className="text-xs font-bold text-green-800 uppercase px-2 py-1 flex items-center">
          <Clock className="w-3 h-3 mr-1" /> Indicadores do Dia
        </h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <KPICard 
          label="Vendas (Qtd)" 
          value={currentDayMetrics.count} 
          icon={ShoppingBag} 
        />
        <KPICard 
          label="Valor Total" 
          value={formatCurrency(currentDayMetrics.total)} 
          icon={DollarSign} 
        />
        <KPICard 
          label="Ticket Médio" 
          value={formatCurrency(currentDayMetrics.avgTicket)} 
        />
        <KPICard 
          label="Variação TM" 
          value={
             <TicketVariance current={currentDayMetrics.avgTicket} previous={lastDayMetrics.avgTicket} />
          }
          subValue={<span className="text-[10px] text-gray-400">vs Dia Anterior</span>}
        />
        <KPICard 
          label="Melhor do Dia (Ag)" 
          value={currentDayMetrics.bestAgency} 
          highlight 
          icon={Award} 
        />
        <KPICard 
          label="Melhor do Dia (Vend)" 
          value={currentDayMetrics.bestSeller} 
          highlight 
          icon={Award} 
        />
      </div>
    </div>
  );
};

export default KPISection;
