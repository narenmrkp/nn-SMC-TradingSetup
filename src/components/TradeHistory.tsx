/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calendar, Filter, ChevronDown, TrendingUp, Clock, ArrowRight, Loader2 } from 'lucide-react';

export function TradeHistory() {
  const [fromDate, setFromDate] = useState('2026-05-15');
  const [toDate, setToDate] = useState('2026-05-16');
  const [isFetching, setIsFetching] = useState(false);

  const initialTrades = [
    { id: 4, date: '16 MAY 2026', time: '14:30', signalIdx: 2, type: 'BUY', profit: '+142.4', positive: true },
    { id: 3, date: '16 MAY 2026', time: '09:15', signalIdx: 1, type: 'SELL', profit: '-32.1', positive: false },
    { id: 2, date: '15 MAY 2026', time: '21:05', signalIdx: 2, type: 'BUY', profit: '+88.7', positive: true },
    { id: 1, date: '15 MAY 2026', time: '11:20', signalIdx: 1, type: 'BUY', profit: '+12.5', positive: true },
  ];

  const [trades, setTrades] = useState(initialTrades);

  const formatSignalName = (dateStr: string, idx: number) => {
    const [day, month] = dateStr.split(' ');
    const formattedMonth = month.charAt(0).toUpperCase() + month.slice(1).toLowerCase();
    return `${day}${formattedMonth}-Signal-${idx}`;
  };

  const handleFetch = () => {
    setIsFetching(true);
    // Simulate dynamic multi-date signal retrieval
    setTimeout(() => {
      setIsFetching(false);
      // In a real app, this would hit /api/history?from=...&to=...
      const filtered = initialTrades.filter(t => {
          const tradeTime = new Date(t.date).getTime();
          const start = new Date(fromDate).getTime();
          const end = new Date(toDate).getTime();
          return !isNaN(tradeTime) ? (tradeTime >= start && tradeTime <= end) : true;
      });
      setTrades(filtered.length > 0 ? filtered : initialTrades);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-full bg-sleek-sidebar font-sans text-white">
      {/* Date Filter Bar */}
      <div className="p-4 border-b border-sleek-border bg-sleek-header/30 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[12px] uppercase text-sleek-muted tracking-[0.2em] font-extrabold">Signal Discovery</span>
          <Calendar className="w-4 h-4 text-sleek-aqua" />
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <label className="text-[10px] text-sleek-muted font-bold uppercase mb-1">From Date</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-sleek-bg border border-sleek-border rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-sleek-aqua appearance-none cursor-pointer"
              />
            </div>
            <div className="flex flex-col">
              <label className="text-[10px] text-sleek-muted font-bold uppercase mb-1">To Date</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-sleek-bg border border-sleek-border rounded px-2 py-1.5 text-[11px] text-white focus:outline-none focus:border-sleek-aqua appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button 
            onClick={handleFetch}
            disabled={isFetching}
            className="flex items-center justify-center gap-2 w-full py-2 bg-sleek-aqua text-black rounded font-black text-[11px] uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Fetch Signals <ArrowRight className="w-4 h-4" /></>}
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide relative">
          {trades.map((t, idx) => (
            <div 
              key={t.id} 
              className={`p-4 rounded-md bg-sleek-header border-l-4 transition-all hover:bg-white/5 cursor-pointer ${t.positive ? 'border-sleek-bull' : 'border-sleek-bear'}`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] text-sleek-muted font-black tracking-widest uppercase">{t.date}</span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.type === 'BUY' ? 'bg-sleek-bull/10 text-sleek-bull' : 'bg-sleek-bear/10 text-sleek-bear'}`}>
                  {t.type}
                </span>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-[15px] font-black text-gray-100 uppercase tracking-tight">
                    {formatSignalName(t.date, t.signalIdx)}
                  </span>
                  <span className="text-[11px] text-sleek-muted font-bold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {t.time} IST
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[17px] font-black ${t.positive ? 'text-sleek-bull' : 'text-sleek-bear'}`}>
                    {t.profit} pts
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Stats Summary */}
      <div className="p-4 bg-sleek-header border-t border-sleek-border space-y-2">
        <div className="flex justify-between items-center text-[12px]">
          <span className="text-sleek-muted font-bold">Signals in Range</span>
          <span className="text-sleek-aqua font-black">{trades.length}</span>
        </div>
        <div className="flex justify-between items-center text-[12px]">
          <span className="text-sleek-muted font-bold">Success Rate</span>
          <span className="text-sleek-bull font-black">81%</span>
        </div>
        <div className="flex justify-between items-center text-[14px] pt-1 pt-2 border-t border-sleek-border/30">
          <span className="text-gray-200 font-black">Period Profit</span>
          <span className="text-sleek-bull font-black">+842.1 pts</span>
        </div>
      </div>
    </div>
  );
}
