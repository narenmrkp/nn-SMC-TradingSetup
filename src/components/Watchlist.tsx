/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, ChevronRight, ChevronLeft, Clock, AlertCircle } from 'lucide-react';

const WATCHLIST_GROUPS = [1, 2, 3, 4, 5];

interface Props {
  onSelect: (symbol: string) => void;
  activeSymbol: string;
}

export function Watchlist({ onSelect, activeSymbol }: Props) {
  const [activeGroup, setActiveGroup] = useState(1);
  const [prices, setPrices] = useState<Record<string, number>>({});
  
  // Real-world focused scripts as requested (Sensex, Nifty, BankNifty, High Beta, etc.)
  const [scripts] = useState<Record<number, string[]>>({
    1: [
      'NIFTY 50', 'BANK NIFTY', 'FINNIFTY', 'MIDCPNIFTY', 'SENSEX', 'NIFTY IT', 'NIFTY AUTO',
      'NIFTY FMCG', 'NIFTY METAL', 'NIFTY PHARMA', 'NIFTY PSU BANK', 'NIFTY REALTY', 'NIFTY MEDIA',
      'INDIA VIX', 'NIFTY 100', 'NIFTY 500', 'BANKEX', 'SENSEX 50', 'FIN SERVICE', 'CPSE',
      'NIFTY ENERGY', 'NIFTY INFRA', 'NIFTY PSE', 'NIFTY MIDSML 400', 'NIFTY LARGEMID 250'
    ],
    2: [
      'OFSS', 'DIXON', 'NETWEB', 'DATAPATTERN', 'FORCEMOT', 'POLYCAB', 'BSE', 'APARIND', 
      'MAZDOCK', 'RVNL', 'IRFC', 'HAL', 'BEL', 'RELIANCE', 'HDFCBANK', 'ICICIBANK',
      'TCS', 'INFY', 'HINDUNILVR', 'ITC', 'SBIN', 'BHARTIARTL', 'KOTAKBANK', 'LT', 'AXISBANK'
    ],
    3: [
      'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT', 'ADAUSDT', 'XRPUSDT', 'DOTUSDT', 'DOGEUSDT', 
      'AVAXUSDT', 'LINKUSDT', 'MATICUSDT', 'LTCUSDT', 'BCHUSDT', 'UNIUSDT', 'NEARUSDT', 
      'ICPUSDT', 'FILUSDT', 'ARBUSDT', 'APTUSDT', 'OPUSDT', 'STXUSDT', 'RENDERUSDT', 'GRTUSDT', 'RNDRUSDT', 'FETUSDT'
    ],
    4: [
      'XAUUSD', 'XAGUSD', 'EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD', 'USDCAD', 'USDCHF',
      'EURJPY', 'GBPJPY', 'EURGBP', 'AUDJPY', 'NZDUSD', 'EURCAD', 'EURAUD', 
      'GBPAUD', 'GBPCAD', 'CHFJPY', 'CADJPY', 'AUDNZD', 'EURNZD', 'GBPNZD', 'USDSGD', 'USDHKD', 'USDTRY'
    ],
    5: [
      'CRUDEOIL', 'NATGAS', 'SILVER', 'COPPER', 'ZINC', 'ALUMINIUM', 'LEAD', 'NICKEL',
      'GOLDGUINEA', 'MENTHAOIL', 'COTTON', 'RUBBER', 'WHEAT', 'CORN', 'SOYBEAN',
      'SUGAR', 'COFFEE', 'COCOA', 'PLATINUM', 'PALLADIUM', 'COAL', 'IRONORE', 'LITHIUM', 'BRENT', 'HEATINGOIL'
    ]
  });

  // Check if market is open
  const isMarketOpen = (groupIdx: number) => {
    const now = new Date();
    const day = now.getDay(); // 0-6 (Sun-Sat)
    const hours = now.getHours();
    const mins = now.getMinutes();
    const currentTime = hours * 100 + mins;

    if (groupIdx <= 2) { // Indian Markets NSE/BSE (9:15 AM - 3:30 PM IST simulated as local)
        return day >= 1 && day <= 5 && currentTime >= 915 && currentTime <= 1530;
    }
    if (groupIdx === 3) return true; // Crypto 24/7
    if (groupIdx === 4) return day >= 1 && day <= 5; // Forex (M-F)
    return true; 
  };

  const getGroupName = (idx: number) => {
    switch(idx) {
        case 1: return 'NIFTY';
        case 2: return 'STOCKS';
        case 3: return 'CRYPTO';
        case 4: return 'FOREX';
        case 5: return 'COMM';
        default: return `WL ${idx}`;
    }
  }

  // Simulate Live Price Updates
  useEffect(() => {
    const interval = setInterval(() => {
        setPrices(prev => {
            const next = {...prev};
            const currentScripts = scripts[activeGroup] || [];
            currentScripts.forEach(s => {
                const base = prev[s] || (Math.random() * 1000 + 100);
                const drift = (Math.random() - 0.5) * (base * 0.0005);
                next[s] = base + drift;
            });
            return next;
        });
    }, 1000);
    return () => clearInterval(interval);
  }, [activeGroup, scripts]);

  const activeScripts = scripts[activeGroup] || [];
  const marketStatus = isMarketOpen(activeGroup);

  return (
    <div className="flex flex-col h-full bg-sleek-sidebar border-r border-sleek-border font-sans">
      {/* Groups Tabs */}
      <div className="flex border-b border-sleek-border bg-sleek-header/50">
        {WATCHLIST_GROUPS.map((group) => (
          <button
            key={group}
            onClick={() => setActiveGroup(group)}
            className={`flex-1 py-3 text-[10px] font-black transition-all border-b-2 ${
              activeGroup === group
                ? 'border-sleek-aqua text-sleek-aqua bg-sleek-aqua/5'
                : 'border-transparent text-sleek-muted hover:text-white'
            }`}
          >
            {getGroupName(group)}
          </button>
        ))}
      </div>

      {/* Market Status Bar */}
      <div className={`px-4 py-1.5 flex items-center justify-between text-[10px] font-black uppercase tracking-widest ${marketStatus ? 'bg-sleek-bull/10 text-sleek-bull' : 'bg-sleek-bear/10 text-sleek-bear'}`}>
        <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            <span>Market {marketStatus ? 'Open' : 'Closed'}</span>
        </div>
        {!marketStatus && activeGroup <= 2 && <span className="opacity-70">HOURS: 09:15 - 15:30</span>}
      </div>

      {/* Search & Add */}
      <div className="p-4 border-b border-sleek-border">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-sleek-muted group-hover:text-sleek-aqua transition-colors" />
          <input
            type="text"
            placeholder="Search Symbols..."
            className="w-full bg-sleek-bg border border-sleek-border rounded-md px-10 py-2.5 text-[14px] text-white focus:outline-none focus:border-sleek-aqua transition-all placeholder:text-sleek-muted/50 font-bold"
          />
        </div>
      </div>

      {/* Scripts List */}
      <div className="flex-1 overflow-y-auto scrollbar-hide py-2">
          {activeScripts.map((symbol, idx) => (
            <div
              key={symbol}
              onClick={() => onSelect(symbol)}
              className={`flex items-center justify-between px-4 py-3 cursor-pointer group border-b border-sleek-border/20 last:border-0 transition-all ${
                activeSymbol === symbol ? 'bg-sleek-aqua/10 border-l-4 border-l-sleek-aqua' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex flex-col">
                <span className={`text-[15px] font-black tracking-tight ${activeSymbol === symbol ? 'text-sleek-aqua' : 'text-white'}`}>{symbol}</span>
                <span className="text-[11px] text-sleek-muted uppercase font-bold tracking-wider">
                  {activeGroup <= 2 ? 'NSE • IND' : activeGroup === 3 ? 'BINANCE' : activeGroup === 4 ? 'FX' : 'COMM'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                  <span className={`text-[14px] font-mono font-bold text-white`}>
                    {(prices[symbol] || 0).toFixed(2)}
                  </span>
                  <span className="text-[11px] font-mono text-sleek-muted">
                    {activeGroup <= 2 ? 'F&O ACTIVE' : 'LIVE'}
                  </span>
                </div>
              </div>
            </div>
          ))}
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-sleek-header/30 border-t border-sleek-border flex justify-between items-center text-[10px] uppercase font-black">
        <div className="flex items-center gap-3">
            <span className="text-sleek-muted">Holiday Schedule</span>
            <AlertCircle className="w-3 h-3 text-sleek-muted cursor-help" />
        </div>
        <span className="text-sleek-aqua">Live Feed</span>
      </div>
    </div>
  );
}
