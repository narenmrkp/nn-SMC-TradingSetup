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
    <div className="flex flex-col h-full bg-terminal-surface font-sans text-white">
      {/* Date Filter Bar - Terminal Style */}
      <div className="p-6 border-b border-terminal-border bg-black/40 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs-mono text-terminal-muted">Performance Monitor</span>
          <div className="flex gap-1">
             {[1,2,3].map(i => <div key={i} className="w-1 h-3 bg-terminal-accent/20" />)}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[9px] text-terminal-muted font-mono uppercase tracking-widest">Horizon Start</label>
              <input 
                type="date" 
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full bg-black/40 border border-terminal-border rounded-none px-3 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-terminal-accent/50 appearance-none cursor-pointer"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[9px] text-terminal-muted font-mono uppercase tracking-widest">Horizon End</label>
              <input 
                type="date" 
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full bg-black/40 border border-terminal-border rounded-none px-3 py-2 text-[10px] font-mono text-white focus:outline-none focus:border-terminal-accent/50 appearance-none cursor-pointer"
              />
            </div>
          </div>

          <button 
            onClick={handleFetch}
            disabled={isFetching}
            className="group relative flex items-center justify-center gap-2 w-full py-3 bg-terminal-accent/10 border border-terminal-accent/30 text-terminal-accent rounded-none font-mono font-bold text-[10px] uppercase tracking-[0.2em] hover:bg-terminal-accent hover:text-black transition-all disabled:opacity-50"
          >
            {isFetching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <>SYNC DATA BASE <ArrowRight className="w-3.5 h-3.5" /></>}
          </button>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 scrollbar-hide">
          {trades.map((t) => (
            <div 
              key={t.id} 
              className={`p-4 rounded-none bg-black/20 border border-terminal-border/40 hover:bg-terminal-accent/[0.03] hover:border-terminal-accent/30 transition-all cursor-pointer group`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <span className="text-[9px] text-terminal-muted font-mono tracking-widest uppercase">{t.date}</span>
                    <div className="w-[1px] h-2 bg-terminal-border" />
                    <span className="text-[9px] text-terminal-muted font-mono">ID: {t.id}00X</span>
                </div>
                <div className={`px-2 py-0.5 text-[8px] font-mono font-black uppercase tracking-widest border ${t.type === 'BUY' ? 'bg-terminal-bull/10 text-terminal-bull border-terminal-bull/30' : 'bg-terminal-bear/10 text-terminal-bear border-terminal-bear/30'}`}>
                  {t.type}
                </div>
              </div>
              
              <div className="flex justify-between items-end">
                <div className="flex flex-col gap-1">
                  <span className={`text-[14px] font-display font-medium tracking-wide ${t.positive ? 'text-white' : 'text-terminal-muted'}`}>
                    {formatSignalName(t.date, t.signalIdx)}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] font-mono text-terminal-muted/60 flex items-center gap-1">
                        <TrendingUp className="w-2.5 h-2.5" /> High Prob.
                    </span>
                    <span className="text-[9px] font-mono text-terminal-accent/60">CON: {(90 + Math.random() * 8).toFixed(1)}%</span>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-[16px] font-mono font-bold tabular-nums ${t.positive ? 'text-terminal-bull glow-text-bull' : 'text-terminal-bear glow-text-bear'}`}>
                    {t.profit > 0 ? '+' : ''}{t.profit}
                  </span>
                  <span className="text-[8px] font-mono text-terminal-muted uppercase">PTS NET</span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Institutional Stats Dashboard */}
      <div className="p-6 bg-black/60 border-t border-terminal-border space-y-5">
        <div className="grid grid-cols-2 gap-6">
            <div className="flex flex-col">
                <span className="text-[9px] font-mono text-terminal-muted uppercase tracking-widest mb-1">Win Probability</span>
                <span className="text-xl font-display font-bold text-terminal-bull tabular-nums tracking-tighter">84.22%</span>
            </div>
            <div className="flex flex-col items-end">
                <span className="text-[9px] font-mono text-terminal-muted uppercase tracking-widest mb-1">Profit Factor</span>
                <span className="text-xl font-display font-bold text-terminal-accent tabular-nums tracking-tighter">3.14</span>
            </div>
        </div>
        
        <div className="pt-4 border-t border-terminal-border/30">
            <div className="flex justify-between items-center mb-1">
                <span className="text-[9px] font-mono text-terminal-muted uppercase tracking-widest">Cumulative alpha</span>
                <span className="text-[10px] font-mono text-terminal-bull">+1,242.10</span>
            </div>
            <div className="h-1 w-full bg-terminal-border">
                <div className="h-full bg-terminal-bull w-[84%] shadow-[0_0_10px_rgba(0,255,163,0.3)]" />
            </div>
        </div>
      </div>
    </div>
  );
}
